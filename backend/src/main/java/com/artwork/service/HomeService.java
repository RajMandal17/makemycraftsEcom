package com.artwork.service;

import com.artwork.dto.HomeStatsDto;

import java.math.BigDecimal;

/**
 * Service interface for home page operations
 * Follows Interface Segregation Principle - focused interface for home statistics
 */
public interface HomeService {

    /**
     * Get all home page statistics in a single call
     * 
     * @return HomeStatsDto containing all statistics
     */
    HomeStatsDto getHomeStatistics();

    /**
     * Get total number of artworks
     * 
     * @return total artworks count
     */
    Long getTotalArtworks();

    /**
     * Get total number of artists
     * 
     * @return total artists count
     */
    Long getTotalArtists();

    /**
     * Get average rating across all artworks
     * 
     * @return average rating (0.0 - 5.0)
     */
    Double getAverageRating();

    /**
     * Get total sales amount
     * 
     * @return total sales in BigDecimal
     */
    BigDecimal getTotalSales();

    /**
     * Get total number of orders
     * 
     * @return total orders count
     */
    Long getTotalOrders();

    /**
     * Get total number of customers
     * 
     * @return total customers count
     */
    Long getTotalCustomers();
    
    /**
     * Get top-selling artworks based on order count
     * 
     * @param limit maximum number of artworks to return
     * @return List of top-selling artwork DTOs (without circular references)
     */
    java.util.List<com.artwork.dto.ArtworkSummaryDto> getTopSellingArtworks(int limit);
}  
