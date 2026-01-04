package com.artwork.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;


@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CategoryCreateRequest {
    
    
    @NotBlank(message = "Category name is required")
    @Size(min = 2, max = 100, message = "Category name must be between 2 and 100 characters")
    private String name;
    
    
    @Size(max = 150, message = "Display name cannot exceed 150 characters")
    private String displayName;
    
    
    @Size(max = 500, message = "Description cannot exceed 500 characters")
    private String description;
    
    
    @Size(max = 10, message = "Emoji cannot exceed 10 characters")
    private String emoji;
    
    
    private Integer displayOrder;
    
    
    private Boolean isActive;
}
