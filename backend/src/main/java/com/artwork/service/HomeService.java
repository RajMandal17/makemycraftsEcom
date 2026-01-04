package com.artwork.service;

import com.artwork.dto.HomeStatsDto;

import java.math.BigDecimal;


public interface HomeService {

    
    HomeStatsDto getHomeStatistics();

    
    Long getTotalArtworks();

    
    Long getTotalArtists();

    
    Double getAverageRating();

    
    BigDecimal getTotalSales();

    
    Long getTotalOrders();

    
    Long getTotalCustomers();
    
    
    java.util.List<com.artwork.dto.ArtworkSummaryDto> getTopSellingArtworks(int limit);
}  
