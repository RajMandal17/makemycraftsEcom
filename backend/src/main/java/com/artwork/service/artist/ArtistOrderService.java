package com.artwork.service.artist;

import com.artwork.dto.OrderDto;
import org.springframework.data.domain.Page;

import java.util.Map;

public interface ArtistOrderService {
    
    
    Page<OrderDto> getArtistOrders(String token, int page, int size, String status);
    
    
    OrderDto getOrderById(String orderId, String token);
    
    
    OrderDto updateOrderStatus(String orderId, String status, String trackingNumber, String notes, String token);
    
    
    Map<String, Object> getArtistOrderStats(String token);
}
