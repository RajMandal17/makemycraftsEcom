package com.artwork.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;


@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HomeStatsDto {
    
    
    private Long totalArtworks;
    
    
    private Long totalArtists;
    
    
    private Double averageRating;
    
    
    private BigDecimal totalSales;
    
    
    private Long totalOrders;
    
    
    private Long totalCustomers;
}
