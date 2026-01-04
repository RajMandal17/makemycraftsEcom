package com.artwork.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

/**
 * Category Entity
 * Represents artwork categories with image support and soft delete functionality.
 * 
 * Features:
 * - Soft delete support (isDeleted flag)
 * - Image icon support (stored as URL)
 * - Audit trail (createdAt, updatedAt, deletedAt)
 * - Unique name constraint (case-insensitive)
 * - Display order for sorting
 * 
 * @author System
 * @since 1.0
 */
@Entity
@Table(name = "categories", indexes = {
    @Index(name = "idx_category_name", columnList = "name"),
    @Index(name = "idx_category_slug", columnList = "slug"),
    @Index(name = "idx_category_deleted", columnList = "isDeleted"),
    @Index(name = "idx_category_active", columnList = "isActive"),
    @Index(name = "idx_category_display_order", columnList = "displayOrder")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Category {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;
    
    /**
     * Category name (e.g., "PAINTING", "SCULPTURE")
     * Must be unique (case-insensitive)
     */
    @Column(nullable = false, unique = true, length = 100)
    private String name;
    
    /**
     * URL-friendly slug for the category
     * Auto-generated from name (e.g., "digital-art" from "DIGITAL_ART")
     */
    @Column(nullable = false, unique = true, length = 120)
    private String slug;
    
    /**
     * Human-readable display name (e.g., "Digital Art" from "DIGITAL_ART")
     */
    @Column(nullable = false, length = 150)
    private String displayName;
    
    /**
     * Optional description of the category
     */
    @Column(length = 500)
    private String description;
    
    /**
     * URL to the category icon image (stored in cloud storage)
     * Replaces emoji icons with proper images
     */
    @Column(length = 500)
    private String imageUrl;
    
    /**
     * Fallback emoji icon (for backward compatibility)
     */
    @Column(length = 10)
    private String emoji;
    
    /**
     * Display order for sorting categories
     * Lower numbers appear first
     */
    @Builder.Default
    @Column(nullable = false)
    private Integer displayOrder = 0;
    
    /**
     * Whether the category is active and visible to users
     */
    @Builder.Default
    @Column(nullable = false)
    private Boolean isActive = true;
    
    /**
     * Soft delete flag - when true, category is considered deleted
     * but data is retained in database
     */
    @Builder.Default
    @Column(nullable = false)
    private Boolean isDeleted = false;
    
    /**
     * Timestamp when category was created
     */
    @Builder.Default
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
    
    /**
     * Timestamp when category was last updated
     */
    @Builder.Default
    @Column(nullable = false)
    private LocalDateTime updatedAt = LocalDateTime.now();
    
    /**
     * Timestamp when category was soft-deleted
     * Null if not deleted
     */
    private LocalDateTime deletedAt;
    
    /**
     * ID of admin who created this category
     */
    @Column(length = 36)
    private String createdBy;
    
    /**
     * ID of admin who last updated this category
     */
    @Column(length = 36)
    private String updatedBy;
    
    /**
     * ID of admin who deleted this category
     */
    @Column(length = 36)
    private String deletedBy;
    
    // ============================================
    // Lifecycle Callbacks
    // ============================================
    
    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
    
    @PrePersist
    protected void onCreate() {
        if (this.createdAt == null) {
            this.createdAt = LocalDateTime.now();
        }
        if (this.updatedAt == null) {
            this.updatedAt = LocalDateTime.now();
        }
        if (this.slug == null || this.slug.isEmpty()) {
            this.slug = generateSlug(this.name);
        }
        if (this.displayName == null || this.displayName.isEmpty()) {
            this.displayName = formatDisplayName(this.name);
        }
    }
    
    // ============================================
    // Helper Methods
    // ============================================
    
    /**
     * Generate URL-friendly slug from category name
     * Example: "DIGITAL_ART" -> "digital-art"
     */
    public static String generateSlug(String name) {
        if (name == null || name.isEmpty()) {
            return "";
        }
        return name.toLowerCase()
                   .replaceAll("([^a-z0-9])+", "-")
                   .replaceAll("(^-)|(-$)", "");
    }
    
    /**
     * Format category name for display
     * Example: "DIGITAL_ART" -> "Digital Art"
     */
    public static String formatDisplayName(String name) {
        if (name == null || name.isEmpty()) {
            return "";
        }
        String[] words = name.split("[_\\s-]+");
        StringBuilder result = new StringBuilder();
        for (String word : words) {
            if (!word.isEmpty()) {
                if (result.length() > 0) {
                    result.append(" ");
                }
                result.append(word.substring(0, 1).toUpperCase())
                      .append(word.substring(1).toLowerCase());
            }
        }
        return result.toString();
    }
    
    /**
     * Soft delete the category
     */
    public void softDelete(String adminId) {
        this.isDeleted = true;
        this.isActive = false;
        this.deletedAt = LocalDateTime.now();
        this.deletedBy = adminId;
        this.updatedAt = LocalDateTime.now();
    }
    
    /**
     * Restore a soft-deleted category
     */
    public void restore(String adminId) {
        this.isDeleted = false;
        this.isActive = true;
        this.deletedAt = null;
        this.deletedBy = null;
        this.updatedBy = adminId;
        this.updatedAt = LocalDateTime.now();
    }
    
    /**
     * Check if category is visible (active and not deleted)
     */
    public boolean isVisible() {
        return Boolean.TRUE.equals(isActive) && Boolean.FALSE.equals(isDeleted);
    }
}
