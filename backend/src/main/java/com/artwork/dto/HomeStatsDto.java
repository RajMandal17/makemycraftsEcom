package com.artwork.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * DTO for home page statistics
 * Encapsulates aggregated data from various entities
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HomeStatsDto {
    
    /**
     * Total number of artworks in the gallery
     */
    private Long totalArtworks;
    
    /**
     * Total number of active artists
     */
    private Long totalArtists;
    
    /**
     * Average rating across all artworks (0.0 - 5.0)
     */
    private Double averageRating;
    
    /**
     * Total sales amount in USD
     */
    private BigDecimal totalSales;
    
    /**
     * Number of completed orders
     */
    private Long totalOrders;
    
    /**
     * Number of registered customers
     */
    private Long totalCustomers;
}
