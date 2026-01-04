package com.artwork.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request DTO for creating a new category
 * Contains validation constraints for all input fields
 * 
 * @author System
 * @since 1.0
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CategoryCreateRequest {
    
    /**
     * Category name (required)
     * Must be unique (case-insensitive)
     * Typically in UPPER_CASE format (e.g., "DIGITAL_ART")
     */
    @NotBlank(message = "Category name is required")
    @Size(min = 2, max = 100, message = "Category name must be between 2 and 100 characters")
    private String name;
    
    /**
     * Custom display name (optional)
     * If not provided, will be auto-generated from name
     */
    @Size(max = 150, message = "Display name cannot exceed 150 characters")
    private String displayName;
    
    /**
     * Category description (optional)
     */
    @Size(max = 500, message = "Description cannot exceed 500 characters")
    private String description;
    
    /**
     * Fallback emoji icon (optional)
     * For cases when image is not available
     */
    @Size(max = 10, message = "Emoji cannot exceed 10 characters")
    private String emoji;
    
    /**
     * Display order for sorting (optional)
     * If not provided, will be set to next available order
     */
    private Integer displayOrder;
    
    /**
     * Whether the category should be active immediately (optional)
     * Defaults to true if not provided
     */
    private Boolean isActive;
}
