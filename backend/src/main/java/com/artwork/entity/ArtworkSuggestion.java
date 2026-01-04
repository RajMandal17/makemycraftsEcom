package com.artwork.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

/**
 * Entity representing AI-generated artwork suggestions
 */
@Entity
@Table(name = "artwork_suggestions")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ArtworkSuggestion {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;
    
    @Column(name = "user_id", nullable = false)
    private String userId;
    
    @Column(name = "image_url", nullable = false, length = 500)
    private String imageUrl;
    
    @Column(name = "suggested_title")
    private String suggestedTitle;
    
    @Column(name = "suggested_category", length = 100)
    private String suggestedCategory;
    
    @Column(name = "suggested_medium", length = 100)
    private String suggestedMedium;
    
    @Column(name = "suggested_description", columnDefinition = "TEXT")
    private String suggestedDescription;
    
    @Column(name = "suggested_tags", columnDefinition = "TEXT")
    private String suggestedTags;
    
    @Column(name = "suggested_width")
    private Double suggestedWidth;
    
    @Column(name = "suggested_height")
    private Double suggestedHeight;
    
    @Column(name = "confidence_score")
    private Double confidenceScore;
    
    @Column(name = "analysis_metadata", columnDefinition = "JSON")
    private String analysisMetadata;
    
    @Builder.Default
    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();
    
    @Builder.Default
    @Column(name = "is_applied")
    private Boolean isApplied = false;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", insertable = false, updatable = false)
    private User user;
    
    /**
     * Get tags as a list by splitting the comma-separated string
     */
    public java.util.List<String> getSuggestedTagsList() {
        if (suggestedTags == null || suggestedTags.isEmpty()) {
            return java.util.Collections.emptyList();
        }
        return java.util.Arrays.asList(suggestedTags.split(","));
    }
}
