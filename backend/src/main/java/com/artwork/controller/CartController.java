package com.artwork.controller;

import com.artwork.dto.CartItemDto;
import com.artwork.service.CartService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
public class CartController {
    private final CartService cartService;

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
}
