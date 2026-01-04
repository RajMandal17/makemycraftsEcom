package com.artwork.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request DTO for artwork analysis
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AnalysisRequest {
    private String imageUrl;
    private String userId;
    private Boolean includeAdvancedAnalysis;
}
