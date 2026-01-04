package com.artwork.service.impl.admin;

import com.artwork.service.admin.AdminAnalyticsService;
import com.artwork.service.admin.AdminArtworkService;
import com.artwork.service.admin.AdminOrderService;
import com.artwork.service.admin.AdminUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AdminAnalyticsServiceImpl implements AdminAnalyticsService {
    
    private final AdminUserService adminUserService;
    private final AdminArtworkService adminArtworkService;
    private final AdminOrderService adminOrderService;

    @Override
    public Map<String, Object> getAnalytics() {
        Map<String, Object> analytics = new HashMap<>();
        
        analytics.put("userStats", adminUserService.getUserStats());
        analytics.put("artworkStats", adminArtworkService.getArtworkStats());
        analytics.put("orderStats", adminOrderService.getOrderStats());
        analytics.put("revenueStats", adminOrderService.getRevenueStats());
        analytics.put("systemHealth", getSystemHealth());
        
        return analytics;
    }

    @Override
    public Map<String, Object> getSystemHealth() {
        Map<String, Object> health = new HashMap<>();
        health.put("status", "UP");
        health.put("database", "CONNECTED"); 
        health.put("timestamp", System.currentTimeMillis());
        return health;
    }
}
