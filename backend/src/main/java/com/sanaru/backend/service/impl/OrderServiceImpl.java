package com.sanaru.backend.service.impl;

import com.sanaru.backend.dto.OrderItemResponse;
import com.sanaru.backend.dto.OrderResponse;
import com.sanaru.backend.enums.OrderStatus;
import com.sanaru.backend.model.CartItem;
import com.sanaru.backend.model.Order;
import com.sanaru.backend.model.OrderItem;
import com.sanaru.backend.model.User;
import com.sanaru.backend.repository.CartItemRepository;
import com.sanaru.backend.repository.OrderRepository;
import com.sanaru.backend.repository.UserRepository;
import com.sanaru.backend.service.OrderService;
import com.sanaru.backend.service.PaymentTransactionService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final CartItemRepository cartItemRepository;
    private final UserRepository userRepository;
    private final PaymentTransactionService paymentTransactionService;

    @Override
    @Transactional
    public OrderResponse checkout() {
        User user = getCurrentUser();

        List<CartItem> cartItems = cartItemRepository.findByUserId(user.getId());

        if (cartItems.isEmpty()) {
            throw new RuntimeException("Cart is empty");
        }

        Order order = new Order();
        order.setUser(user);
        order.setStatus(OrderStatus.PENDING);
        order.setOrderNumber(generateOrderNumber());

        List<OrderItem> orderItems = new ArrayList<>();
        BigDecimal totalAmount = BigDecimal.ZERO;

        for (CartItem cartItem : cartItems) {
            if (cartItem.getQuantity() > cartItem.getProduct().getStockQuantity()) {
                if (cartItem.getProduct().getStockQuantity() == 0) {
                    throw new RuntimeException("Out of Stock: '" + cartItem.getProduct().getName() + "' is no longer available");
                }
                throw new RuntimeException("Insufficient stock: Only " + cartItem.getProduct().getStockQuantity() + " available for '" + cartItem.getProduct().getName() + "'");
            }

            OrderItem orderItem = new OrderItem();
            orderItem.setOrder(order);
            orderItem.setProduct(cartItem.getProduct());
            orderItem.setProductName(cartItem.getProduct().getName());
            orderItem.setUnitPrice(cartItem.getUnitPrice());
            orderItem.setQuantity(cartItem.getQuantity());

            BigDecimal subTotal = cartItem.getUnitPrice().multiply(BigDecimal.valueOf(cartItem.getQuantity()));
            orderItem.setSubTotal(subTotal);

            totalAmount = totalAmount.add(subTotal);
            orderItems.add(orderItem);
        }

        order.setTotalAmount(totalAmount);
        order.setItems(orderItems);

        Order savedOrder = orderRepository.save(order);

        cartItemRepository.deleteByUserId(user.getId());

        return mapToOrderResponse(savedOrder);
    }

    @Override
    public List<OrderResponse> getMyOrders() {
        User user = getCurrentUser();

        return orderRepository.findByUserIdOrderByCreatedAtDesc(user.getId())
                .stream()
                .map(this::mapToOrderResponse)
                .toList();
    }

    @Override
    public List<OrderResponse> getAllOrders() {
        return orderRepository.findAll(
                        org.springframework.data.domain.Sort.by(
                                org.springframework.data.domain.Sort.Direction.DESC, "createdAt"))
                .stream()
                .map(this::mapToOrderResponse)
                .toList();
    }

    // ── Story 5: Cancellation flow ────────────────────────────────────────────

    @Override
    public OrderResponse requestCancellation(Long orderId) {
        User user = getCurrentUser();

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found: " + orderId));

        if (!order.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("You are not authorised to cancel this order");
        }

        if (order.getStatus() == OrderStatus.CANCELLED
                || order.getStatus() == OrderStatus.CANCELLATION_REQUESTED) {
            throw new RuntimeException("Order is already cancelled or a cancellation request is pending");
        }

        order.setStatus(OrderStatus.CANCELLATION_REQUESTED);
        return mapToOrderResponse(orderRepository.save(order));
    }

    @Override
    public OrderResponse adminCancelOrder(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found: " + orderId));

        if (order.getStatus() != OrderStatus.CANCELLATION_REQUESTED) {
            throw new RuntimeException("Order does not have a pending cancellation request");
        }

        order.setStatus(OrderStatus.CANCELLED);
        return mapToOrderResponse(orderRepository.save(order));
    }

    @Override
    public OrderResponse adminRejectCancellation(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found: " + orderId));

        if (order.getStatus() != OrderStatus.CANCELLATION_REQUESTED) {
            throw new RuntimeException("Order does not have a pending cancellation request");
        }

        // Revert to CONFIRMED (the typical status before a customer requests cancellation)
        order.setStatus(OrderStatus.CONFIRMED);
        return mapToOrderResponse(orderRepository.save(order));
    }

    @Override
    public OrderResponse getMyOrderByReference(String orderReference) {
        User user = getCurrentUser();

        if (orderReference == null || orderReference.isBlank()) {
            throw new RuntimeException("Order reference is required");
        }

        Order order = orderRepository.findByUserIdAndOrderNumber(user.getId(), orderReference.trim())
                .orElseThrow(() -> new RuntimeException("Order not found for reference: " + orderReference));

        return mapToOrderResponse(order);
    }

    private OrderResponse mapToOrderResponse(Order order) {
        List<OrderItemResponse> itemResponses = order.getItems().stream().map(item -> {
            OrderItemResponse response = new OrderItemResponse();
            response.setOrderItemId(item.getId());
            response.setProductId(item.getProduct().getId());
            response.setProductName(item.getProductName());
            response.setUnitPrice(item.getUnitPrice());
            response.setQuantity(item.getQuantity());
            response.setSubTotal(item.getSubTotal());
            return response;
        }).toList();

        OrderResponse response = new OrderResponse();
        response.setOrderId(order.getId());
        response.setOrderNumber(order.getOrderNumber());
        response.setStatus(order.getStatus().name());
        response.setTotalAmount(order.getTotalAmount());
        response.setCreatedAt(order.getCreatedAt());
        response.setItems(itemResponses);

        paymentTransactionService.findLatestByOrderId(order.getId()).ifPresent(transaction -> {
            response.setPaymentStatus(transaction.getStatus().name());
            response.setTransactionId(transaction.getTransactionId());
            response.setPaymentDate(transaction.getPaymentDate());
        });

        return response;
    }

    private String generateOrderNumber() {
        return "ORD-" + java.time.LocalDateTime.now()
                .format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));
    }

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();

        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
}