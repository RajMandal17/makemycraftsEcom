package com.artwork.service.admin;

import com.artwork.dto.OrderDto;
import com.artwork.dto.OrderStatsDto;
import org.springframework.data.domain.Page;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;


public interface AdminOrderService {
    
    
    Page<OrderDto> getOrders(int page, int limit, String status, String userId, 
                           LocalDateTime startDate, LocalDateTime endDate);
    
    
    OrderDto updateOrderStatus(String orderId, String status, String trackingNumber, 
                             String adminNotes, boolean sendNotification);
    
    
    OrderDto cancelOrder(String orderId, String reason, boolean issueRefund, boolean sendNotification);
    
    
    Map<String, Object> issueRefund(String orderId, double amount, String reason, String refundMethod);
    
    
    OrderDto addAdminNotes(String orderId, String notes, boolean flagged, String priority);
    
    
    List<OrderDto> getOrdersByCustomer(String userId);
    
    
    List<OrderDto> getOrdersByArtwork(String artworkId);
    
    
    Map<String, Object> getRevenueAnalytics(LocalDateTime startDate, LocalDateTime endDate, String groupBy);
    
    
    OrderStatsDto getOrderStats();
    
    
    Map<String, Object> getRevenueStats();
}
