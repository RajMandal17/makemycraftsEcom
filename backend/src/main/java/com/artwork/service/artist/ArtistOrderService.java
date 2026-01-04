package com.artwork.service.artist;

import com.artwork.dto.OrderDto;
import org.springframework.data.domain.Page;

import java.util.Map;

public interface ArtistOrderService {
    
    /**
     * Get all orders containing the artist's artworks
     * @param token JWT token to extract artist ID
     * @param page Page number (0-indexed)
     * @param size Page size
     * @param status Optional status filter
     * @return Page of orders
     */
    Page<OrderDto> getArtistOrders(String token, int page, int size, String status);
    
    /**
     * Get a specific order by ID (only if it contains artist's artwork)
     * @param orderId Order ID
     * @param token JWT token to extract artist ID
     * @return Order details
     */
    OrderDto getOrderById(String orderId, String token);
    
    /**
     * Update order status
     * Artists can only update to certain statuses: CONFIRMED, SHIPPED, DELIVERED
     * @param orderId Order ID
     * @param status New status
     * @param trackingNumber Optional tracking number
     * @param notes Optional notes
     * @param token JWT token to extract artist ID
     * @return Updated order
     */
    OrderDto updateOrderStatus(String orderId, String status, String trackingNumber, String notes, String token);
    
    /**
     * Get artist order statistics
     * @param token JWT token to extract artist ID
     * @return Map containing various statistics
     */
    Map<String, Object> getArtistOrderStats(String token);
}
