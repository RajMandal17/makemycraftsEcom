package com.artwork.service.admin;

import java.util.Map;

/**
 * Service interface for admin analytics operations.
 * 
 * SOLID Principles:
 * - Single Responsibility: Only handles analytics operations
 * - Interface Segregation: Focused interface with only analytics operations
 * 
 * @author Raj Mandal
 */
public interface AdminAnalyticsService {
    
    /**
     * Get comprehensive system analytics.
     * 
     * @return Map containing various analytics data
     */
    Map<String, Object> getAnalytics();
    
    /**
     * Get system health status.
     * 
     * @return Map containing system health info
     */
    Map<String, Object> getSystemHealth();
}
