package com.artwork.controller.admin;

import com.artwork.dto.OrderDto;
import com.artwork.service.admin.AdminOrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping({"/api/admin/orders", "/api/v1/admin/orders"})
@RequiredArgsConstructor
public class AdminOrderController {
    
    private final AdminOrderService adminOrderService;

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping
    public ResponseEntity<?> getOrders(@RequestParam(defaultValue = "1") int page,
                                      @RequestParam(defaultValue = "20") int limit,
                                      @RequestParam(required = false) String status,
                                      @RequestParam(required = false) String userId,
                                      @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
                                      @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        Page<OrderDto> orders = adminOrderService.getOrders(page, limit, status, userId, startDate, endDate);
        Map<String, Object> response = new HashMap<>();
        response.put("data", Map.of(
            "orders", orders.getContent(),
            "total", orders.getTotalElements(),
            "totalPages", orders.getTotalPages(),
            "currentPage", orders.getNumber() + 1
        ));
        response.put("message", "Orders retrieved successfully");
        response.put("success", true);
        return ResponseEntity.ok(response);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{orderId}/status")
    public ResponseEntity<?> updateOrderStatus(@PathVariable String orderId, 
                                             @RequestBody Map<String, Object> updateData) {
        String status = (String) updateData.get("status");
        String trackingNumber = (String) updateData.get("trackingNumber");
        String adminNotes = (String) updateData.get("adminNotes");
        boolean sendNotification = updateData.containsKey("sendNotification") ? 
            (Boolean) updateData.get("sendNotification") : true;
            
        OrderDto order = adminOrderService.updateOrderStatus(orderId, status, trackingNumber, adminNotes, sendNotification);
        Map<String, Object> response = new HashMap<>();
        response.put("data", order);
        response.put("message", "Order status updated successfully");
        response.put("success", true);
        return ResponseEntity.ok(response);
    }
    
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/{orderId}/cancel")
    public ResponseEntity<?> cancelOrder(@PathVariable String orderId,
                                        @RequestBody Map<String, Object> requestData) {
        String reason = (String) requestData.get("reason");
        boolean issueRefund = requestData.containsKey("issueRefund") ? 
            (Boolean) requestData.get("issueRefund") : false;
        boolean sendNotification = requestData.containsKey("sendNotification") ? 
            (Boolean) requestData.get("sendNotification") : true;
            
        OrderDto order = adminOrderService.cancelOrder(orderId, reason, issueRefund, sendNotification);
        Map<String, Object> response = new HashMap<>();
        response.put("data", order);
        response.put("message", "Order cancelled successfully");
        response.put("success", true);
        return ResponseEntity.ok(response);
    }
    
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/{orderId}/refund")
    public ResponseEntity<?> issueRefund(@PathVariable String orderId,
                                        @RequestBody Map<String, Object> requestData) {
        double amount = requestData.containsKey("amount") ? 
            ((Number) requestData.get("amount")).doubleValue() : 0.0;
        String reason = (String) requestData.get("reason");
        String refundMethod = (String) requestData.getOrDefault("refundMethod", "ORIGINAL_PAYMENT_METHOD");
            
        Map<String, Object> result = adminOrderService.issueRefund(orderId, amount, reason, refundMethod);
        Map<String, Object> response = new HashMap<>();
        response.put("data", result);
        response.put("message", result.get("message"));
        response.put("success", result.get("success"));
        return ResponseEntity.ok(response);
    }
    
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/{orderId}/notes")
    public ResponseEntity<?> addAdminNotes(@PathVariable String orderId,
                                          @RequestBody Map<String, Object> requestData) {
        String notes = (String) requestData.get("notes");
        boolean flagged = requestData.containsKey("flagged") ? 
            (Boolean) requestData.get("flagged") : false;
        String priority = (String) requestData.getOrDefault("priority", "MEDIUM");
            
        OrderDto order = adminOrderService.addAdminNotes(orderId, notes, flagged, priority);
        Map<String, Object> response = new HashMap<>();
        response.put("data", order);
        response.put("message", "Admin notes added successfully");
        response.put("success", true);
        return ResponseEntity.ok(response);
    }
    
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/revenue-analytics")
    public ResponseEntity<?> getRevenueAnalytics(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate,
            @RequestParam(defaultValue = "DAY") String groupBy) {
        Map<String, Object> analytics = adminOrderService.getRevenueAnalytics(startDate, endDate, groupBy);
        Map<String, Object> response = new HashMap<>();
        response.put("data", analytics);
        response.put("message", "Revenue analytics retrieved successfully");
        response.put("success", true);
        return ResponseEntity.ok(response);
    }
    
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/stats")
    public ResponseEntity<?> getOrderStats() {
        // Fetch real stats from service
        com.artwork.dto.OrderStatsDto stats = adminOrderService.getOrderStats();
        
        Map<String, Object> response = new HashMap<>();
        response.put("data", stats);
        response.put("message", "Order stats retrieved successfully");
        response.put("success", true);
        return ResponseEntity.ok(response);
    }
}

