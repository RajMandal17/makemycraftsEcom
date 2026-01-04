package com.artwork.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;


@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CategoryDto {
    
    
    private String id;
    
    
    private String name;
    
    
    private String slug;
    
    
    private String displayName;
    
    
    private String description;
    
    
    private String imageUrl;
    
    
    private String emoji;
    
    
    private Integer displayOrder;
    
    
    private Boolean isActive;
}
