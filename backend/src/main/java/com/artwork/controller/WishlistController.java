package com.artwork.controller;

import com.artwork.dto.WishlistItemDto;
import com.artwork.service.WishlistService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/wishlist")
@RequiredArgsConstructor
public class WishlistController {
    private final WishlistService wishlistService;

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
}
