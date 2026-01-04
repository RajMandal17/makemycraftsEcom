package com.artwork.dto;

import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.util.List;

/**
 * DTO for artwork rating summary
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ArtworkRatingSummaryDto {
    private String artworkId;
    private Double averageRating;
    private Integer totalReviews;
    
    // Rating distribution (1-5 stars)
    private Integer oneStarCount;
    private Integer twoStarCount;
    private Integer threeStarCount;
    private Integer fourStarCount;
    private Integer fiveStarCount;
    
    // Recent reviews preview
    private List<ReviewDto> recentReviews;
}
