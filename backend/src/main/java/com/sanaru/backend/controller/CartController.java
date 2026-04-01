package com.sanaru.backend.controller;

import com.sanaru.backend.dto.AddToCartRequest;
import com.sanaru.backend.dto.CartResponse;
import com.sanaru.backend.dto.UpdateCartItemRequest;
import com.sanaru.backend.service.CartService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;

    @PostMapping
    public CartResponse addToCart(@RequestBody AddToCartRequest request) {
        return cartService.addToCart(request);
    }

    @GetMapping
    public CartResponse getMyCart() {
        return cartService.getMyCart();
    }

    @PutMapping("/{cartItemId}")
    public CartResponse updateCartItem(@PathVariable Long cartItemId,
                                       @RequestBody UpdateCartItemRequest request) {
        return cartService.updateCartItem(cartItemId, request);
    }

    @DeleteMapping("/{cartItemId}")
    public String removeCartItem(@PathVariable Long cartItemId) {
        cartService.removeCartItem(cartItemId);
        return "Cart item removed successfully";
    }

    @DeleteMapping("/clear")
    public String clearMyCart() {
        cartService.clearMyCart();
        return "Cart cleared successfully";
    }
}