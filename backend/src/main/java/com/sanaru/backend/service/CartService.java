package com.sanaru.backend.service;

import com.sanaru.backend.dto.AddToCartRequest;
import com.sanaru.backend.dto.CartResponse;
import com.sanaru.backend.dto.UpdateCartItemRequest;

public interface CartService {

    CartResponse addToCart(AddToCartRequest request);

    CartResponse getMyCart();

    CartResponse updateCartItem(Long cartItemId, UpdateCartItemRequest request);

    void removeCartItem(Long cartItemId);

    void clearMyCart();
}