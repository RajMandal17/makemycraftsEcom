package com.artwork.service;

import com.artwork.dto.CartItemDto;
import java.util.List;
import java.util.Map;

public interface CartService {
    CartItemDto addToCart(CartItemDto cartItemDto, String token);
    List<CartItemDto> getCart(String token);
    Map<String, Object> getCartSummary(String token);
    CartItemDto updateCartItemQuantity(String itemId, int quantity, String token);
    void removeCartItem(String itemId, String token);
    void clearCart(String token);
}
