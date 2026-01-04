package com.artwork.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Data Transfer Object for Category entity
 * Used for public API responses
 * 
 * @author System
 * @since 1.0
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CategoryDto {
    
    /**
     * Unique identifier
     */
    private String id;
    
    /**
     * Category name (e.g., "PAINTING")
     */
    private String name;
    
    /**
     * URL-friendly slug (e.g., "painting")
     */
    private String slug;
    
    /**
     * Human-readable display name (e.g., "Painting")
     */
    private String displayName;
    
    /**
     * Category description
     */
    private String description;
    
    /**
     * URL to category icon image
     */
    private String imageUrl;
    
    /**
     * Fallback emoji icon
     */
    private String emoji;
    
    /**
     * Display order for sorting
     */
    private Integer displayOrder;
    
    /**
     * Whether the category is active
     */
    private Boolean isActive;
}
