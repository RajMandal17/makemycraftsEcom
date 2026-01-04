package com.artwork.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;


@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PublicCategoryDto {
    
    
    private String id;
    
    
    private String name;
    
    
    private String slug;
    
    
    private String displayName;
    
    
    private String description;
    
    
    private String imageUrl;
    
    
    private String emoji;
    
    
    private Integer displayOrder;
}
