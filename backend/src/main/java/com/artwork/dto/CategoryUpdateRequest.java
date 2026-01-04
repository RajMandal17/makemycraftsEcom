package com.artwork.dto;

import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request DTO for updating an existing category
 * All fields are optional - only provided fields will be updated
 * 
 * @author System
 * @since 1.0
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CategoryUpdateRequest {
    
    /**
     * New category name (optional)
     * Must be unique if provided
     */
    @Size(min = 2, max = 100, message = "Category name must be between 2 and 100 characters")
    private String name;
    
    /**
     * New display name (optional)
     */
    @Size(max = 150, message = "Display name cannot exceed 150 characters")
    private String displayName;
    
    /**
     * New description (optional)
     */
    @Size(max = 500, message = "Description cannot exceed 500 characters")
    private String description;
    
    /**
     * New fallback emoji (optional)
     */
    @Size(max = 10, message = "Emoji cannot exceed 10 characters")
    private String emoji;
    
    /**
     * New display order (optional)
     */
    private Integer displayOrder;
    
    /**
     * Update active status (optional)
     */
    private Boolean isActive;
    
    /**
     * Flag to remove the current image
     * If true, imageUrl will be set to null
     */
    private Boolean removeImage;
}
