package com.artwork.service;

import com.artwork.dto.GuestSessionDto;
import com.artwork.dto.GuestWishlistResponseDto;
import com.artwork.dto.WishlistItemDto;

import java.util.List;

public interface GuestWishlistService {
    
    GuestSessionDto generateGuestSession();
    
    GuestWishlistResponseDto addToWishlist(String sessionId, WishlistItemDto wishlistItemDto);
    
    GuestWishlistResponseDto getWishlist(String sessionId);
    
    void removeItem(String sessionId, String itemId);
    
    void clearWishlist(String sessionId);
    
    List<WishlistItemDto> getWishlistItems(String sessionId);
    
    boolean sessionExists(String sessionId);
    
    void deleteSession(String sessionId);
    
    boolean isItemInWishlist(String sessionId, String artworkId);
}
