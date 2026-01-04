package com.artwork.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for public category information
 * Used for category dropdowns and selection in artwork creation/filtering
 * Only includes active, admin-approved categories
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PublicCategoryDto {
    
    /**
     * Category ID
     */
    private String id;
    
    /**
     * Internal category name (e.g., "DIGITAL_ART")
     */
    private String name;
    
    /**
     * URL-friendly slug (e.g., "digital-art")
     */
    private String slug;
    
    /**
     * Human-readable display name (e.g., "Digital Art")
     */
    private String displayName;
    
    /**
     * Optional description
     */
    private String description;
    
    /**
     * Category image URL (for visual display)
     */
    private String imageUrl;
    
    /**
     * Fallback emoji icon
     */
    private String emoji;
    
    /**
     * Display order for consistent sorting
     */
    private Integer displayOrder;
}
