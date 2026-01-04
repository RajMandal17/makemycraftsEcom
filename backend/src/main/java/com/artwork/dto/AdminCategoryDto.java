package com.artwork.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Data Transfer Object for Category entity - Admin view
 * Includes all fields including audit trail and soft delete info
 * 
 * @author System
 * @since 1.0
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminCategoryDto {
    
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
    
    /**
     * Whether the category is soft-deleted
     */
    private Boolean isDeleted;
    
    /**
     * Timestamp when category was created
     */
    private LocalDateTime createdAt;
    
    /**
     * Timestamp when category was last updated
     */
    private LocalDateTime updatedAt;
    
    /**
     * Timestamp when category was soft-deleted
     */
    private LocalDateTime deletedAt;
    
    /**
     * ID of admin who created this category
     */
    private String createdBy;
    
    /**
     * ID of admin who last updated this category
     */
    private String updatedBy;
    
    /**
     * ID of admin who deleted this category
     */
    private String deletedBy;
    
    /**
     * Number of artworks in this category (calculated field)
     */
    private Long artworkCount;
}
