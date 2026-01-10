package com.artwork.controller;

import com.artwork.dto.MergeCartRequestDto;
import com.artwork.dto.WishlistItemDto;
import com.artwork.service.GuestWishlistService;
import com.artwork.service.WishlistService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/wishlist")
@RequiredArgsConstructor
public class WishlistController {
    private final WishlistService wishlistService;
    private final GuestWishlistService guestWishlistService;

    @PreAuthorize("hasRole('CUSTOMER')")
    @PostMapping("/add")
    public ResponseEntity<?> addToWishlist(@RequestBody WishlistItemDto wishlistItemDto, @RequestHeader("Authorization") String authHeader) {
        String token = authHeader != null && authHeader.startsWith("Bearer ") ? authHeader.substring(7) : null;
        WishlistItemDto item = wishlistService.addToWishlist(wishlistItemDto, token);
        return ResponseEntity.status(201).body(item);
    }

    @PreAuthorize("hasRole('CUSTOMER')")
    @GetMapping
    public ResponseEntity<?> getWishlist(@RequestHeader("Authorization") String authHeader) {
        String token = authHeader != null && authHeader.startsWith("Bearer ") ? authHeader.substring(7) : null;
        var wishlist = wishlistService.getWishlist(token);
        return ResponseEntity.ok(wishlist);
    }
    
    @PreAuthorize("hasRole('CUSTOMER')")
    @PostMapping("/merge")
    public ResponseEntity<?> mergeGuestWishlist(
            @RequestBody MergeCartRequestDto mergeRequest,
            @RequestHeader("Authorization") String authHeader) {
        
        String token = authHeader != null && authHeader.startsWith("Bearer ") ? authHeader.substring(7) : null;
        String guestSessionId = mergeRequest.getGuestSessionId();
        
        if (guestSessionId == null || guestSessionId.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Guest session ID is required"));
        }
        
        List<WishlistItemDto> guestItems = guestWishlistService.getWishlistItems(guestSessionId);
        
        int mergedCount = 0;
        for (WishlistItemDto item : guestItems) {
            wishlistService.addToWishlist(item, token);
            mergedCount++;
        }
        
        guestWishlistService.deleteSession(guestSessionId);
        
        var wishlist = wishlistService.getWishlist(token);
        return ResponseEntity.ok(Map.of(
            "message", "Guest wishlist merged successfully",
            "mergedItems", mergedCount,
            "wishlist", wishlist
        ));
    }
}
