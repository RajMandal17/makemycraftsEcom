package com.artwork.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for category statistics
 * Represents sales and artwork data for a specific category
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CategoryStatsDto {
    
    /**
     * Category name
     */
    private String category;
    
    /**
     * Total number of artworks in this category
     */
    private Long artworkCount;
    
    /**
     * Total number of sales (order items) for this category
     */
    private Long salesCount;
    
    /**
     * Total revenue generated from this category
     */
    private Double totalRevenue;
    
    /**
     * Average price of artworks in this category
     */
    private Double averagePrice;
    
    /**
     * Number of unique customers who purchased from this category
     */
    private Long uniqueCustomers;
    
    /**
     * Display name for the category (formatted)
     */
    private String displayName;
    
    /**
     * Icon representation for the category
     * Can be an image URL or fallback emoji
     * Frontend should check if this is a URL (starts with http) or emoji
     */
    private String icon;
    
    /**
     * Category image URL (when available from database)
     * Separate field for explicit image URL access
     */
    private String imageUrl;
    
    /**
     * Rank based on sales count (1 = top selling)
     */
    private Integer rank;
    
    /**
     * Category ID from database (if available)
     */
    private String categoryId;
    
    /**
     * Category slug for URL-friendly routing
     */
    private String slug;
}
