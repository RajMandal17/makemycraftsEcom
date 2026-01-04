package com.artwork.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

/**
 * DTO for artwork suggestions returned from AI analysis
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ArtworkSuggestionDto {
    
    private String id;
    private String userId;
    private String imageUrl;
    private String suggestedTitle;
    private String suggestedCategory;
    private String suggestedMedium;
    private String suggestedDescription;
    private List<String> suggestedTags;
    private Double suggestedWidth;
    private Double suggestedHeight;
    private Double confidenceScore;
    private LocalDateTime createdAt;
    private Boolean isApplied;
    
    // Additional metadata for frontend
    private AnalysisMetadata metadata;
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class AnalysisMetadata {
        private String artStyle;
        private String dominantColors;
        private String mood;
        private String subject;
        private List<String> technicalQualities;
    }
}
