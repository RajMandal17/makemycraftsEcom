package com.artwork.dto;

import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.util.List;


@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ArtworkRatingSummaryDto {
    private String artworkId;
    private Double averageRating;
    private Integer totalReviews;
    
    
    private Integer oneStarCount;
    private Integer twoStarCount;
    private Integer threeStarCount;
    private Integer fourStarCount;
    private Integer fiveStarCount;
    
    
    private List<ReviewDto> recentReviews;
}
