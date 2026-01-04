package com.artwork.dto;

import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

/**
 * DTO for checking if a customer can review a specific order item
 */
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
    
    // If already reviewed
    private boolean alreadyReviewed;
    private String existingReviewId;
    private Integer existingRating;
    
    // Time window info
    private String deliveredAt;
    private String reviewDeadline;
    private int daysRemaining;
    
    // Can edit existing review?
    private boolean canEdit;
}
