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
import com.sanaru.backend.service.EmailService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
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

    private static final Logger logger = LoggerFactory.getLogger(OrderServiceImpl.class);

    private final OrderRepository orderRepository;
    private final CartItemRepository cartItemRepository;
    private final UserRepository userRepository;
    private final PaymentTransactionService paymentTransactionService;
    private final com.sanaru.backend.repository.ProductRepository productRepository;
    private final EmailService emailService;

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

        // Send booking confirmation email to customer
        logger.info("Attempting to send order confirmation email to customer: {}", user.getEmail());
        try {
            String productNames = savedOrder.getItems().stream()
                    .map(OrderItem::getProductName)
                    .reduce((a, b) -> a + ", " + b)
                    .orElse("Products");
            emailService.sendBookingConfirmationEmail(
                    user.getEmail(),
                    user.getFirstName() + " " + user.getLastName(),
                    productNames,
                    savedOrder.getItems().size(),
                    savedOrder.getTotalAmount().doubleValue(),
                    savedOrder.getOrderNumber()
            );
            logger.info("Order confirmation email sent successfully to: {}", user.getEmail());
        } catch (Exception e) {
            // Log but don't fail - order was already saved
            logger.error("Failed to send order confirmation email to {}", user.getEmail(), e);
        }

        // Send admin notification about new order
        try {
            emailService.sendNewOrderNotificationToAdmin(
                    savedOrder.getOrderNumber(),
                    user.getFirstName() + " " + user.getLastName(),
                    savedOrder.getTotalAmount().doubleValue(),
                    savedOrder.getItems().size()
            );
            logger.info("New order notification sent to admin for order: {}", savedOrder.getOrderNumber());
        } catch (Exception e) {
            logger.error("Failed to send new order notification to admin", e);
        }

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
        Order savedOrder = orderRepository.save(order);

        // Fetch all required data BEFORE spawning background thread
        User customer = order.getUser();
        String customerEmail = customer.getEmail();
        String customerName = customer.getFirstName() + " " + (customer.getLastName() != null ? customer.getLastName() : "");
        String orderNumber = savedOrder.getOrderNumber();
        double totalAmount = savedOrder.getTotalAmount().doubleValue();

        // Send cancellation request email to customer ASYNCHRONOUSLY
        new Thread(() -> {
            logger.info("Sending cancellation request email to customer for order: {}", orderId);
            try {
                emailService.sendOrderCancellationRequestEmail(
                        customerEmail,
                        customerName,
                        orderNumber,
                        totalAmount
                );
                logger.info("Cancellation request email sent to: {}", customerEmail);
            } catch (Exception e) {
                logger.error("Failed to send cancellation request email for order: {}", orderId, e);
            }
        }).start();
        
        // Send cancellation request notification to admin ASYNCHRONOUSLY
        try {
            emailService.sendOrderCancellationRequestNotificationToAdmin(
                    orderNumber,
                    customerName,
                    totalAmount,
                    "Customer has requested cancellation and refund"
            );
        } catch (Exception e) {
            logger.error("Failed to send order cancellation notification to admin for order: {}", orderId, e);
        }

        return mapToOrderResponse(savedOrder);
    }

    @Override
    public OrderResponse adminCancelOrder(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found: " + orderId));

        if (order.getStatus() != OrderStatus.CANCELLATION_REQUESTED) {
            throw new RuntimeException("Order does not have a pending cancellation request");
        }

        order.setStatus(OrderStatus.CANCELLED);
        Order savedOrder = orderRepository.save(order);

        // Fetch all required data BEFORE spawning background thread
        User customer = order.getUser();
        if (customer != null) {
            String customerEmail = customer.getEmail();
            String customerName = customer.getFirstName() + " " + (customer.getLastName() != null ? customer.getLastName() : "");
            String orderNumber = savedOrder.getOrderNumber();
            double refundAmount = savedOrder.getTotalAmount().doubleValue();

            // Send refund and cancellation confirmation emails to customer ASYNCHRONOUSLY
            new Thread(() -> {
                logger.info("Sending cancellation and refund confirmation emails to customer: {}", customerEmail);
                try {
                    // Send cancellation confirmation
                    emailService.sendOrderCancellationConfirmationEmail(
                            customerEmail,
                            customerName,
                            orderNumber,
                            refundAmount
                    );
                    // Also send refund confirmation
                    emailService.sendRefundConfirmationEmail(
                            customerEmail,
                            customerName,
                            orderNumber,
                            refundAmount
                    );
                    logger.info("Cancellation and refund emails sent to: {}", customerEmail);
                } catch (Exception e) {
                    logger.error("Failed to send cancellation/refund emails to {}", customerEmail, e);
                }
            }).start();
            
            // Send refund request notification to admin ASYNCHRONOUSLY
            try {
                emailService.sendRefundRequestNotificationToAdmin(
                        customerName,
                        orderNumber,
                        refundAmount,
                        "Admin approved refund request and processed cancellation"
                );
            } catch (Exception e) {
                logger.error("Failed to send refund request notification to admin for order: {}", orderId, e);
            }
        }

        return mapToOrderResponse(savedOrder);
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
        Order savedOrder = orderRepository.save(order);

        // Fetch all required data BEFORE spawning background thread
        User customer = order.getUser();
        String customerEmail = customer.getEmail();
        String customerName = customer.getFirstName() + " " + (customer.getLastName() != null ? customer.getLastName() : "");
        String orderNumber = savedOrder.getOrderNumber();

        // Send cancellation rejection email to customer ASYNCHRONOUSLY
        new Thread(() -> {
            logger.info("Sending cancellation rejection email to customer for order: {}", orderId);
            try {
                emailService.sendCancellationRequestRejectedEmail(
                        customerEmail,
                        customerName,
                        orderNumber
                );
                logger.info("Cancellation rejection email sent to: {}", customerEmail);
            } catch (Exception e) {
                logger.error("Failed to send cancellation rejection email for order: {}", orderId, e);
            }
        }).start();

        return mapToOrderResponse(savedOrder);
    }

    @Override
    public OrderResponse adminApproveOrder(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found: " + orderId));

        if (order.getStatus() == OrderStatus.CANCELLED || order.getStatus() == OrderStatus.CONFIRMED) {
            throw new RuntimeException("Order is already " + order.getStatus().name());
        }

        order.setStatus(OrderStatus.CONFIRMED);

        // Story 1: Automatically reduce stock when admin manually approves
        for (OrderItem item : order.getItems()) {
            productRepository.findById(item.getProduct().getId()).ifPresent(product -> {
                int newStock = product.getStockQuantity() - item.getQuantity();
                if (newStock < 0) {
                     newStock = 0; // Prevent negative stock numbers if already over-ordered
                }
                product.setStockQuantity(newStock);
                productRepository.save(product);
            });
        }
        
        Order savedOrder = orderRepository.save(order);

        // Fetch all required data BEFORE spawning background thread
        User customer = order.getUser();
        String customerEmail = customer.getEmail();
        String customerName = customer.getFirstName() + " " + (customer.getLastName() != null ? customer.getLastName() : "");
        String orderNumber = savedOrder.getOrderNumber();
        double totalAmount = savedOrder.getTotalAmount().doubleValue();

        // Send order approval email to customer ASYNCHRONOUSLY
        new Thread(() -> {
            logger.info("Sending order approval email to customer for order: {}", orderId);
            try {
                emailService.sendOrderApprovedEmail(
                        customerEmail,
                        customerName,
                        orderNumber,
                        totalAmount
                );
                logger.info("Order approval email sent to: {}", customerEmail);
            } catch (Exception e) {
                logger.error("Failed to send order approval email for order: {}", orderId, e);
            }
        }).start();
        
        return mapToOrderResponse(savedOrder);
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

    @Override
    public long getPendingApprovalOrderCount() {
        return orderRepository.countByStatus(OrderStatus.PENDING);
    }

    @Override
    public java.util.Map<String, Integer> getCustomerOrderStatusCounts(String userEmail) {
        User customer = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + userEmail));
        
        java.util.Map<String, Integer> counts = new java.util.HashMap<>();
        counts.put("pending", (int) orderRepository.countByUserIdAndStatus(customer.getId(), OrderStatus.PENDING));
        counts.put("confirmed", (int) orderRepository.countByUserIdAndStatus(customer.getId(), OrderStatus.CONFIRMED));
        counts.put("paid", (int) orderRepository.countByUserIdAndStatus(customer.getId(), OrderStatus.PAID));
        counts.put("cancelled", (int) orderRepository.countByUserIdAndStatus(customer.getId(), OrderStatus.CANCELLED));
        return counts;
    }
}