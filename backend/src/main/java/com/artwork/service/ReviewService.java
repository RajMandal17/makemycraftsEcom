package com.artwork.service;

import com.artwork.dto.ReviewDto;
import com.artwork.dto.ReviewEligibilityDto;
import com.artwork.dto.ArtworkRatingSummaryDto;
import java.util.List;

/**
 * Review Service Interface
 * 
 * Production-level review system with:
 * - Purchase verification (only buyers can review)
 * - 7-day review window after delivery
 * - One review per order item
 * - Rating statistics
 */
public interface ReviewService {
    
    /**
     * Add a new review for an order item
     * 
     * @param reviewDto Review data
     * @param token JWT token for authentication
     * @return Created review
     * @throws IllegalStateException if user is not eligible to review
     */
    ReviewDto addReview(ReviewDto reviewDto, String token);
    
    /**
     * Update an existing review (within the edit window)
     * 
     * @param reviewId Review ID to update
     * @param reviewDto Updated review data
     * @param token JWT token for authentication
     * @return Updated review
     */
    ReviewDto updateReview(String reviewId, ReviewDto reviewDto, String token);
    
    /**
     * Delete a review
     * 
     * @param reviewId Review ID to delete
     * @param token JWT token for authentication
     */
    void deleteReview(String reviewId, String token);
    
    /**
     * Get all approved reviews for an artwork
     * 
     * @param artworkId Artwork ID
     * @return List of reviews
     */
    List<ReviewDto> getReviewsByArtworkId(String artworkId);
    
    /**
     * Get all reviews for an artist's artworks
     * 
     * @param artistId Artist ID
     * @return List of reviews
     */
    List<ReviewDto> getReviewsByArtistId(String artistId);
    
    /**
     * Check if a customer is eligible to review an order item
     * 
     * @param orderItemId Order item ID
     * @param token JWT token for authentication
     * @return Eligibility status with details
     */
    ReviewEligibilityDto checkReviewEligibility(String orderItemId, String token);
    
    /**
     * Get all items a customer can review (from delivered orders)
     * 
     * @param token JWT token for authentication
     * @return List of reviewable items with eligibility status
     */
    List<ReviewEligibilityDto> getReviewableItems(String token);
    
    /**
     * Get rating summary for an artwork
     * 
     * @param artworkId Artwork ID
     * @return Rating summary with distribution
     */
    ArtworkRatingSummaryDto getArtworkRatingSummary(String artworkId);
    
    /**
     * Get average rating for an artist
     * 
     * @param artistId Artist ID
     * @return Average rating (0.0 - 5.0)
     */
    Double getArtistAverageRating(String artistId);
    
    /**
     * Get all reviews by a customer
     * 
     * @param token JWT token for authentication
     * @return List of customer's reviews
     */
    List<ReviewDto> getMyReviews(String token);
}
