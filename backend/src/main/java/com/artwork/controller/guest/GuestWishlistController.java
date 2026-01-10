package com.artwork.controller.guest;

import com.artwork.dto.GuestSessionDto;
import com.artwork.dto.GuestWishlistResponseDto;
import com.artwork.dto.WishlistItemDto;
import com.artwork.service.GuestWishlistService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/guest/wishlist")
@RequiredArgsConstructor
public class GuestWishlistController {

    private final GuestWishlistService guestWishlistService;

    @GetMapping("/session")
    public ResponseEntity<GuestSessionDto> generateSession() {
        GuestSessionDto session = guestWishlistService.generateGuestSession();
        return ResponseEntity.ok(session);
    }

    @PostMapping
    public ResponseEntity<GuestWishlistResponseDto> addToWishlist(
            @RequestHeader(value = "X-Guest-Session-Id", required = false) String sessionId,
            @RequestBody @Valid WishlistItemDto wishlistItemDto) {
        
        if (sessionId == null || sessionId.isEmpty()) {
            GuestSessionDto newSession = guestWishlistService.generateGuestSession();
            sessionId = newSession.getSessionId();
        }
        
        GuestWishlistResponseDto response = guestWishlistService.addToWishlist(sessionId, wishlistItemDto);
        return ResponseEntity.status(201).body(response);
    }

    @GetMapping("/{sessionId}")
    public ResponseEntity<GuestWishlistResponseDto> getWishlist(@PathVariable String sessionId) {
        GuestWishlistResponseDto response = guestWishlistService.getWishlist(sessionId);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{sessionId}/{itemId}")
    public ResponseEntity<Void> removeItem(
            @PathVariable String sessionId,
            @PathVariable String itemId) {
        
        guestWishlistService.removeItem(sessionId, itemId);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{sessionId}")
    public ResponseEntity<Void> clearWishlist(@PathVariable String sessionId) {
        guestWishlistService.clearWishlist(sessionId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{sessionId}/exists")
    public ResponseEntity<Map<String, Boolean>> checkSession(@PathVariable String sessionId) {
        boolean exists = guestWishlistService.sessionExists(sessionId);
        return ResponseEntity.ok(Map.of("exists", exists));
    }

    @GetMapping("/{sessionId}/check/{artworkId}")
    public ResponseEntity<Map<String, Boolean>> isInWishlist(
            @PathVariable String sessionId,
            @PathVariable String artworkId) {
        
        boolean inWishlist = guestWishlistService.isItemInWishlist(sessionId, artworkId);
        return ResponseEntity.ok(Map.of("inWishlist", inWishlist));
    }
}
