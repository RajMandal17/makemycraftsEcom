package com.artwork.service.admin;

import com.artwork.dto.OrderDto;
import com.artwork.dto.OrderStatsDto;
import org.springframework.data.domain.Page;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * Service interface for admin order management operations.
 * 
 * SOLID Principles:
 * - Single Responsibility: Only handles order-related admin operations
 * - Interface Segregation: Focused interface with only order operations
 * 
 * @author Raj Mandal
 */
public interface AdminOrderService {
    
    /**
     * Retrieve paginated list of orders with optional filtering.
     * 
     * @param page Page number (1-indexed)
     * @param limit Number of items per page
     * @param status Optional status filter
     * @param userId Optional user ID filter
     * @param startDate Optional start date filter
     * @param endDate Optional end date filter
     * @return Paginated list of orders
     */
    Page<OrderDto> getOrders(int page, int limit, String status, String userId, 
                           LocalDateTime startDate, LocalDateTime endDate);
    
    /**
     * Update order status.
     * 
     * @param orderId Order ID
     * @param status New status
     * @param trackingNumber Optional tracking number
     * @param adminNotes Optional admin notes
     * @param sendNotification Whether to send notification to customer
     * @return Updated order DTO
     */
    OrderDto updateOrderStatus(String orderId, String status, String trackingNumber, 
                             String adminNotes, boolean sendNotification);
    
    /**
     * Cancel an order.
     * 
     * @param orderId Order ID
     * @param reason Cancellation reason
     * @param issueRefund Whether to issue a refund
     * @param sendNotification Whether to send notification to customer
     * @return Updated order DTO
     */
    OrderDto cancelOrder(String orderId, String reason, boolean issueRefund, boolean sendNotification);
    
    /**
     * Issue a refund for an order.
     * 
     * @param orderId Order ID
     * @param amount Refund amount
     * @param reason Refund reason
     * @param refundMethod Refund method
     * @return Refund result map
     */
    Map<String, Object> issueRefund(String orderId, double amount, String reason, String refundMethod);
    
    /**
     * Add admin notes to an order.
     * 
     * @param orderId Order ID
     * @param notes Admin notes
     * @param flagged Whether the order is flagged
     * @param priority Priority level
     * @return Updated order DTO
     */
    OrderDto addAdminNotes(String orderId, String notes, boolean flagged, String priority);
    
    /**
     * Get all orders for a specific customer.
     * 
     * @param userId Customer ID
     * @return List of orders
     */
    List<OrderDto> getOrdersByCustomer(String userId);
    
    /**
     * Get all orders containing a specific artwork.
     * 
     * @param artworkId Artwork ID
     * @return List of orders
     */
    List<OrderDto> getOrdersByArtwork(String artworkId);
    
    /**
     * Get revenue analytics for a date range.
     * 
     * @param startDate Start date
     * @param endDate End date
     * @param groupBy Grouping option (DAY, WEEK, MONTH)
     * @return Revenue analytics data
     */
    Map<String, Object> getRevenueAnalytics(LocalDateTime startDate, LocalDateTime endDate, String groupBy);
    
    /**
     * Get order statistics for admin dashboard.
     * 
     * @return Order statistics
     */
    OrderStatsDto getOrderStats();
    
    /**
     * Get revenue statistics.
     * 
     * @return Revenue statistics map
     */
    Map<String, Object> getRevenueStats();
}
