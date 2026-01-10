package com.artwork.controller;

import com.artwork.dto.CartItemDto;
import com.artwork.dto.MergeCartRequestDto;
import com.artwork.service.CartService;
import com.artwork.service.GuestCartService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
public class CartController {
    private final CartService cartService;
    private final GuestCartService guestCartService;

    @PreAuthorize("hasRole('CUSTOMER')")
    @PostMapping("/add")
    public ResponseEntity<?> addToCart(@RequestBody @jakarta.validation.Valid CartItemDto cartItemDto, @RequestHeader("Authorization") String authHeader) {
        String token = authHeader != null && authHeader.startsWith("Bearer ") ? authHeader.substring(7) : null;
        CartItemDto item = cartService.addToCart(cartItemDto, token);
        return ResponseEntity.status(201).body(item);
    }

    @PreAuthorize("hasRole('CUSTOMER')")
    @GetMapping
    public ResponseEntity<?> getCart(@RequestHeader("Authorization") String authHeader) {
        String token = authHeader != null && authHeader.startsWith("Bearer ") ? authHeader.substring(7) : null;
        Map<String, Object> cartSummary = cartService.getCartSummary(token);
        return ResponseEntity.ok(cartSummary);
    }
    
    @PreAuthorize("hasRole('CUSTOMER')")
    @PutMapping("/{itemId}")
    public ResponseEntity<?> updateCartItemQuantity(
            @PathVariable String itemId,
            @RequestBody Map<String, Integer> quantityUpdate,
            @RequestHeader("Authorization") String authHeader) {
        String token = authHeader != null && authHeader.startsWith("Bearer ") ? authHeader.substring(7) : null;
        CartItemDto updatedItem = cartService.updateCartItemQuantity(itemId, quantityUpdate.get("quantity"), token);
        return ResponseEntity.ok(updatedItem);
    }
    
    @PreAuthorize("hasRole('CUSTOMER')")
    @DeleteMapping("/{itemId}")
    public ResponseEntity<?> removeCartItem(
            @PathVariable String itemId,
            @RequestHeader("Authorization") String authHeader) {
        String token = authHeader != null && authHeader.startsWith("Bearer ") ? authHeader.substring(7) : null;
        cartService.removeCartItem(itemId, token);
        return ResponseEntity.ok().build();
    }
    
    @PreAuthorize("hasRole('CUSTOMER')")
    @DeleteMapping("/clear")
    public ResponseEntity<?> clearCart(@RequestHeader("Authorization") String authHeader) {
        String token = authHeader != null && authHeader.startsWith("Bearer ") ? authHeader.substring(7) : null;
        cartService.clearCart(token);
        return ResponseEntity.ok().build();
    }
    
    @PreAuthorize("hasRole('CUSTOMER')")
    @PostMapping("/merge")
    public ResponseEntity<?> mergeGuestCart(
            @RequestBody MergeCartRequestDto mergeRequest,
            @RequestHeader("Authorization") String authHeader) {
        
        String token = authHeader != null && authHeader.startsWith("Bearer ") ? authHeader.substring(7) : null;
        String guestSessionId = mergeRequest.getGuestSessionId();
        
        if (guestSessionId == null || guestSessionId.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Guest session ID is required"));
        }
        
        List<CartItemDto> guestItems = guestCartService.getCartItems(guestSessionId);
        
        for (CartItemDto item : guestItems) {
            cartService.addToCart(item, token);
        }
        
        guestCartService.deleteSession(guestSessionId);
        
        Map<String, Object> cartSummary = cartService.getCartSummary(token);
        return ResponseEntity.ok(Map.of(
            "message", "Guest cart merged successfully",
            "mergedItems", guestItems.size(),
            "cart", cartSummary
        ));
    }
}

