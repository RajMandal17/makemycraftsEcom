package com.artwork.controller.guest;

import com.artwork.dto.CartItemDto;
import com.artwork.dto.GuestCartResponseDto;
import com.artwork.dto.GuestSessionDto;
import com.artwork.service.GuestCartService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/guest/cart")
@RequiredArgsConstructor
public class GuestCartController {

    private final GuestCartService guestCartService;

    @GetMapping("/session")
    public ResponseEntity<GuestSessionDto> generateSession() {
        GuestSessionDto session = guestCartService.generateGuestSession();
        return ResponseEntity.ok(session);
    }

    @PostMapping
    public ResponseEntity<GuestCartResponseDto> addToCart(
            @RequestHeader(value = "X-Guest-Session-Id", required = false) String sessionId,
            @RequestBody @Valid CartItemDto cartItemDto) {
        
        if (sessionId == null || sessionId.isEmpty()) {
            GuestSessionDto newSession = guestCartService.generateGuestSession();
            sessionId = newSession.getSessionId();
        }
        
        GuestCartResponseDto response = guestCartService.addToCart(sessionId, cartItemDto);
        return ResponseEntity.status(201).body(response);
    }

    @GetMapping("/{sessionId}")
    public ResponseEntity<GuestCartResponseDto> getCart(@PathVariable String sessionId) {
        GuestCartResponseDto response = guestCartService.getCart(sessionId);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{sessionId}/{itemId}")
    public ResponseEntity<GuestCartResponseDto> updateQuantity(
            @PathVariable String sessionId,
            @PathVariable String itemId,
            @RequestBody Map<String, Integer> quantityUpdate) {
        
        int quantity = quantityUpdate.getOrDefault("quantity", 1);
        GuestCartResponseDto response = guestCartService.updateQuantity(sessionId, itemId, quantity);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{sessionId}/{itemId}")
    public ResponseEntity<Void> removeItem(
            @PathVariable String sessionId,
            @PathVariable String itemId) {
        
        guestCartService.removeItem(sessionId, itemId);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{sessionId}")
    public ResponseEntity<Void> clearCart(@PathVariable String sessionId) {
        guestCartService.clearCart(sessionId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{sessionId}/exists")
    public ResponseEntity<Map<String, Boolean>> checkSession(@PathVariable String sessionId) {
        boolean exists = guestCartService.sessionExists(sessionId);
        return ResponseEntity.ok(Map.of("exists", exists));
    }
}
