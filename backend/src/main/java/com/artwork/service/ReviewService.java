package com.artwork.service;

import com.artwork.dto.ReviewDto;
import com.artwork.dto.ReviewEligibilityDto;
import com.artwork.dto.ArtworkRatingSummaryDto;
import java.util.List;


public interface ReviewService {
    
    
    ReviewDto addReview(ReviewDto reviewDto, String token);
    
    
    ReviewDto updateReview(String reviewId, ReviewDto reviewDto, String token);
    
    
    void deleteReview(String reviewId, String token);
    
    
    List<ReviewDto> getReviewsByArtworkId(String artworkId);
    
    
    List<ReviewDto> getReviewsByArtistId(String artistId);
    
    
    ReviewEligibilityDto checkReviewEligibility(String orderItemId, String token);
    
    
    List<ReviewEligibilityDto> getReviewableItems(String token);
    
    
    ArtworkRatingSummaryDto getArtworkRatingSummary(String artworkId);
    
    
    Double getArtistAverageRating(String artistId);
    
    
    List<ReviewDto> getMyReviews(String token);
}
