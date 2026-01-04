package com.artwork.dto.websocket;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;


@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardUpdateDto {
    
    private UserStats userStats;
    private ArtworkStats artworkStats;
    private OrderStats orderStats;
    private SystemHealth systemHealth;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserStats {
        private long totalUsers;
        private long activeUsers;
        private long newUsersToday;
        private long pendingApprovals;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ArtworkStats {
        private long totalArtworks;
        private long pendingApproval;
        private long approvedArtworks;
        private long featuredArtworks;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OrderStats {
        private long totalOrders;
        private long pendingOrders;
        private long shippedOrders;
        private double totalRevenue;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SystemHealth {
        private String status;
        private int activeServices;
        private int totalServices;
        private double cpuUsage;
        private double memoryUsage;
    }
}
