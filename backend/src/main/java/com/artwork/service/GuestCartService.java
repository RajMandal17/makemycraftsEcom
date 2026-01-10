package com.artwork.service;

import com.artwork.dto.CartItemDto;
import com.artwork.dto.GuestCartResponseDto;
import com.artwork.dto.GuestSessionDto;

import java.util.List;

public interface GuestCartService {
    
    GuestSessionDto generateGuestSession();
    
    GuestCartResponseDto addToCart(String sessionId, CartItemDto cartItemDto);
    
    GuestCartResponseDto getCart(String sessionId);
    
    GuestCartResponseDto updateQuantity(String sessionId, String itemId, int quantity);
    
    void removeItem(String sessionId, String itemId);
    
    void clearCart(String sessionId);
    
    List<CartItemDto> getCartItems(String sessionId);
    
    boolean sessionExists(String sessionId);
    
    void deleteSession(String sessionId);
}
