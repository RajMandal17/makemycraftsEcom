package com.artwork.dto;

import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;


@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReviewEligibilityDto {
    private String orderItemId;
    private String artworkId;
    private String artworkTitle;
    private String artworkImageUrl;
    private String orderId;
    
    private boolean eligible;
    private String reason;
    
    
    private boolean alreadyReviewed;
    private String existingReviewId;
    private Integer existingRating;
    
    
    private String deliveredAt;
    private String reviewDeadline;
    private int daysRemaining;
    
    
    private boolean canEdit;
}
