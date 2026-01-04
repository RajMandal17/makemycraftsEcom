package com.artwork.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;


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
    
    
    @Column(nullable = false, unique = true, length = 100)
    private String name;
    
    
    @Column(nullable = false, unique = true, length = 120)
    private String slug;
    
    
    @Column(nullable = false, length = 150)
    private String displayName;
    
    
    @Column(length = 500)
    private String description;
    
    
    @Column(length = 500)
    private String imageUrl;
    
    
    @Column(length = 10)
    private String emoji;
    
    
    @Builder.Default
    @Column(nullable = false)
    private Integer displayOrder = 0;
    
    
    @Builder.Default
    @Column(nullable = false)
    private Boolean isActive = true;
    
    
    @Builder.Default
    @Column(nullable = false)
    private Boolean isDeleted = false;
    
    
    @Builder.Default
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
    
    
    @Builder.Default
    @Column(nullable = false)
    private LocalDateTime updatedAt = LocalDateTime.now();
    
    
    private LocalDateTime deletedAt;
    
    
    @Column(length = 36)
    private String createdBy;
    
    
    @Column(length = 36)
    private String updatedBy;
    
    
    @Column(length = 36)
    private String deletedBy;
    
    
    
    
    
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
    
    
    
    
    
    
    public static String generateSlug(String name) {
        if (name == null || name.isEmpty()) {
            return "";
        }
        return name.toLowerCase()
                   .replaceAll("([^a-z0-9])+", "-")
                   .replaceAll("(^-)|(-$)", "");
    }
    
    
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
    
    
    public void softDelete(String adminId) {
        this.isDeleted = true;
        this.isActive = false;
        this.deletedAt = LocalDateTime.now();
        this.deletedBy = adminId;
        this.updatedAt = LocalDateTime.now();
    }
    
    
    public void restore(String adminId) {
        this.isDeleted = false;
        this.isActive = true;
        this.deletedAt = null;
        this.deletedBy = null;
        this.updatedBy = adminId;
        this.updatedAt = LocalDateTime.now();
    }
    
    
    public boolean isVisible() {
        return Boolean.TRUE.equals(isActive) && Boolean.FALSE.equals(isDeleted);
    }
}
