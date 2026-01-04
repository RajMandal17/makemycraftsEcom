package com.artwork.service;

import com.artwork.dto.WishlistItemDto;
import java.util.List;

public interface WishlistService {
    WishlistItemDto addToWishlist(WishlistItemDto wishlistItemDto, String token);
    List<WishlistItemDto> getWishlist(String token);
}
