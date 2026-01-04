package com.artwork.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;


@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderStatsDto {

    private Long totalOrders;
    private Long pendingOrders;
    private Long processingOrders;
    private Long shippedOrders;
    private Long deliveredOrders;
    private Long cancelledOrders;
    private Long refundedOrders;

    
    private Double totalRevenue;
    private Double averageOrderValue;
    private Double revenueToday;
    private Double revenueThisWeek;
    private Double revenueThisMonth;
    private Double revenueGrowthRate;

    
    private Long newOrdersToday;
    private Long newOrdersThisWeek;
    private Long newOrdersThisMonth;
    private Double orderGrowthRate;

    
    private LocalDateTime fromDate;
    private LocalDateTime toDate;
}