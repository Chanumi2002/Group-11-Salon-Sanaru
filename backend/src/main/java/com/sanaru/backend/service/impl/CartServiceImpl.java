package com.sanaru.backend.service.impl;

import com.sanaru.backend.dto.AddToCartRequest;
import com.sanaru.backend.dto.CartItemResponse;
import com.sanaru.backend.dto.CartResponse;
import com.sanaru.backend.dto.UpdateCartItemRequest;
import com.sanaru.backend.model.CartItem;
import com.sanaru.backend.model.Product;
import com.sanaru.backend.model.User;
import com.sanaru.backend.repository.CartItemRepository;
import com.sanaru.backend.repository.ProductRepository;
import com.sanaru.backend.repository.UserRepository;
import com.sanaru.backend.service.CartService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CartServiceImpl implements CartService {

    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    @Override
    public CartResponse addToCart(AddToCartRequest request) {
        User user = getCurrentUser();

        if (request.getQuantity() == null || request.getQuantity() <= 0) {
            throw new RuntimeException("Quantity must be greater than 0");
        }

        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new RuntimeException("Product not found"));

        CartItem cartItem = cartItemRepository.findByUserIdAndProductId(user.getId(), product.getId())
                .orElseGet(() -> {
                    CartItem newItem = new CartItem();
                    newItem.setUser(user);
                    newItem.setProduct(product);
                    newItem.setQuantity(0);
                    newItem.setUnitPrice(product.getPrice());
                    return newItem;
                });

        int newQuantity = cartItem.getQuantity() + request.getQuantity();
        if (newQuantity > product.getStockQuantity()) {
            if (product.getStockQuantity() == 0) {
                throw new RuntimeException("Out of Stock: '" + product.getName() + "' is no longer available");
            }
            throw new RuntimeException("Insufficient stock: Only " + product.getStockQuantity() + " available for '" + product.getName() + "'");
        }

        cartItem.setQuantity(newQuantity);
        cartItem.setUnitPrice(product.getPrice());

        cartItemRepository.save(cartItem);

        return buildCartResponse(user.getId());
    }

    @Override
    public CartResponse getMyCart() {
        User user = getCurrentUser();
        return buildCartResponse(user.getId());
    }

    @Override
    public CartResponse updateCartItem(Long cartItemId, UpdateCartItemRequest request) {
        User user = getCurrentUser();

        if (request.getQuantity() == null || request.getQuantity() <= 0) {
            throw new RuntimeException("Quantity must be greater than 0");
        }

        CartItem cartItem = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new RuntimeException("Cart item not found"));

        if (!cartItem.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("You cannot update another user's cart item");
        }

        Product product = cartItem.getProduct();
        if (request.getQuantity() > product.getStockQuantity()) {
            if (product.getStockQuantity() == 0) {
                throw new RuntimeException("Out of Stock: '" + product.getName() + "' is no longer available");
            }
            throw new RuntimeException("Insufficient stock: Only " + product.getStockQuantity() + " available for '" + product.getName() + "'");
        }

        cartItem.setQuantity(request.getQuantity());
        cartItemRepository.save(cartItem);

        return buildCartResponse(user.getId());
    }

    @Override
    public void removeCartItem(Long cartItemId) {
        User user = getCurrentUser();

        CartItem cartItem = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new RuntimeException("Cart item not found"));

        if (!cartItem.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("You cannot remove another user's cart item");
        }

        cartItemRepository.delete(cartItem);
    }

    @Override
    public void clearMyCart() {
        User user = getCurrentUser();
        cartItemRepository.deleteByUserId(user.getId());
    }

    private CartResponse buildCartResponse(Long userId) {
        List<CartItem> cartItems = cartItemRepository.findByUserId(userId);

        List<CartItemResponse> itemResponses = cartItems.stream().map(item -> {
            CartItemResponse response = new CartItemResponse();
            response.setCartItemId(item.getId());
            response.setProductId(item.getProduct().getId());
            response.setProductName(item.getProduct().getName());
            response.setImagePath(item.getProduct().getImagePath());
            response.setUnitPrice(item.getUnitPrice());
            response.setQuantity(item.getQuantity());
            response.setStockQuantity(item.getProduct().getStockQuantity());
            response.setSubTotal(item.getUnitPrice().multiply(BigDecimal.valueOf(item.getQuantity())));
            return response;
        }).toList();

        BigDecimal totalAmount = itemResponses.stream()
                .map(CartItemResponse::getSubTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        CartResponse cartResponse = new CartResponse();
        cartResponse.setItems(itemResponses);
        cartResponse.setTotalAmount(totalAmount);

        return cartResponse;
    }

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();

        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
}