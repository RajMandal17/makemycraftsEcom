package com.artwork.controller.artist;

import com.artwork.dto.OrderDto;
import com.artwork.service.artist.ArtistOrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/artist/orders")
@RequiredArgsConstructor
public class ArtistOrderController {
    
    private final ArtistOrderService artistOrderService;

    
    @PreAuthorize("hasRole('ARTIST')")
    @GetMapping
    public ResponseEntity<?> getArtistOrders(
            @RequestHeader("Authorization") String authHeader,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String status) {
        
        String token = authHeader != null && authHeader.startsWith("Bearer ") ? authHeader.substring(7) : null;
        
        Page<OrderDto> orders = artistOrderService.getArtistOrders(token, page, size, status);
        
        Map<String, Object> response = new HashMap<>();
        response.put("data", Map.of(
            "orders", orders.getContent(),
            "total", orders.getTotalElements(),
            "totalPages", orders.getTotalPages(),
            "currentPage", orders.getNumber()
        ));
        response.put("message", "Artist orders retrieved successfully");
        response.put("success", true);
        
        return ResponseEntity.ok(response);
    }

    
    @PreAuthorize("hasRole('ARTIST')")
    @GetMapping("/{orderId}")
    public ResponseEntity<?> getOrderById(
            @PathVariable String orderId,
            @RequestHeader("Authorization") String authHeader) {
        
        String token = authHeader != null && authHeader.startsWith("Bearer ") ? authHeader.substring(7) : null;
        OrderDto order = artistOrderService.getOrderById(orderId, token);
        
        Map<String, Object> response = new HashMap<>();
        response.put("data", order);
        response.put("message", "Order retrieved successfully");
        response.put("success", true);
        
        return ResponseEntity.ok(response);
    }

    
    @PreAuthorize("hasRole('ARTIST')")
    @PutMapping("/{orderId}/status")
    public ResponseEntity<?> updateOrderStatus(
            @PathVariable String orderId,
            @RequestBody Map<String, Object> updateData,
            @RequestHeader("Authorization") String authHeader) {
        
        String token = authHeader != null && authHeader.startsWith("Bearer ") ? authHeader.substring(7) : null;
        String status = (String) updateData.get("status");
        String trackingNumber = (String) updateData.get("trackingNumber");
        String notes = (String) updateData.get("notes");
        
        OrderDto order = artistOrderService.updateOrderStatus(orderId, status, trackingNumber, notes, token);
        
        Map<String, Object> response = new HashMap<>();
        response.put("data", order);
        response.put("message", "Order status updated successfully");
        response.put("success", true);
        
        return ResponseEntity.ok(response);
    }

    
    @PreAuthorize("hasRole('ARTIST')")
    @GetMapping("/stats")
    public ResponseEntity<?> getArtistOrderStats(@RequestHeader("Authorization") String authHeader) {
        String token = authHeader != null && authHeader.startsWith("Bearer ") ? authHeader.substring(7) : null;
        Map<String, Object> stats = artistOrderService.getArtistOrderStats(token);
        
        Map<String, Object> response = new HashMap<>();
        response.put("data", stats);
        response.put("message", "Artist order stats retrieved successfully");
        response.put("success", true);
        
        return ResponseEntity.ok(response);
    }
}
