package com.artwork.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;


@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CategoryStatsDto {
    
    
    private String category;
    
    
    private Long artworkCount;
    
    
    private Long salesCount;
    
    
    private Double totalRevenue;
    
    
    private Double averagePrice;
    
    
    private Long uniqueCustomers;
    
    
    private String displayName;
    
    
    private String icon;
    
    
    private String imageUrl;
    
    
    private Integer rank;
    
    
    private String categoryId;
    
    
    private String slug;
}
