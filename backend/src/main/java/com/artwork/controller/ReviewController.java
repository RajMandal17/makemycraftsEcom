package com.artwork.controller;

import com.artwork.dto.ReviewDto;
import com.artwork.dto.ReviewEligibilityDto;
import com.artwork.dto.ArtworkRatingSummaryDto;
import com.artwork.service.ReviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;


@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
@Slf4j
public class ReviewController {
    private final ReviewService reviewService;

    
    @PreAuthorize("hasRole('CUSTOMER')")
    @PostMapping
    public ResponseEntity<?> addReview(
            @Valid @RequestBody ReviewDto reviewDto,
            @RequestHeader("Authorization") String authHeader) {
        try {
            String token = extractToken(authHeader);
            ReviewDto review = reviewService.addReview(reviewDto, token);
            return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                "success", true,
                "message", "Review submitted successfully",
                "data", review
            ));
        } catch (IllegalStateException e) {
            log.warn("Review submission blocked: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of(
                "success", false,
                "error", e.getMessage()
            ));
        } catch (IllegalArgumentException e) {
            log.warn("Invalid review data: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "error", e.getMessage()
            ));
        } catch (Exception e) {
            log.error("Error creating review", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "success", false,
                "error", "Failed to submit review"
            ));
        }
    }
    
    
    @PreAuthorize("hasRole('CUSTOMER')")
    @PutMapping("/{reviewId}")
    public ResponseEntity<?> updateReview(
            @PathVariable String reviewId,
            @Valid @RequestBody ReviewDto reviewDto,
            @RequestHeader("Authorization") String authHeader) {
        try {
            String token = extractToken(authHeader);
            ReviewDto review = reviewService.updateReview(reviewId, reviewDto, token);
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Review updated successfully",
                "data", review
            ));
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of(
                "success", false,
                "error", e.getMessage()
            ));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "error", e.getMessage()
            ));
        } catch (Exception e) {
            log.error("Error updating review", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "success", false,
                "error", "Failed to update review"
            ));
        }
    }
    
    
    @PreAuthorize("hasRole('CUSTOMER')")
    @DeleteMapping("/{reviewId}")
    public ResponseEntity<?> deleteReview(
            @PathVariable String reviewId,
            @RequestHeader("Authorization") String authHeader) {
        try {
            String token = extractToken(authHeader);
            reviewService.deleteReview(reviewId, token);
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Review deleted successfully"
            ));
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of(
                "success", false,
                "error", e.getMessage()
            ));
        } catch (Exception e) {
            log.error("Error deleting review", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "success", false,
                "error", "Failed to delete review"
            ));
        }
    }

    
    @GetMapping("/artwork/{artworkId}")
    public ResponseEntity<?> getReviewsByArtwork(@PathVariable String artworkId) {
        try {
            List<ReviewDto> reviews = reviewService.getReviewsByArtworkId(artworkId);
            return ResponseEntity.ok(Map.of(
                "success", true,
                "reviews", reviews,
                "total", reviews.size()
            ));
        } catch (Exception e) {
            log.error("Error retrieving artwork reviews", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "success", false,
                "error", "Error retrieving reviews",
                "reviews", List.of(),
                "total", 0
            ));
        }
    }
    
    
    @GetMapping("/artwork/{artworkId}/summary")
    public ResponseEntity<?> getArtworkRatingSummary(@PathVariable String artworkId) {
        try {
            ArtworkRatingSummaryDto summary = reviewService.getArtworkRatingSummary(artworkId);
            return ResponseEntity.ok(Map.of(
                "success", true,
                "data", summary
            ));
        } catch (Exception e) {
            log.error("Error retrieving rating summary", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "success", false,
                "error", "Error retrieving rating summary"
            ));
        }
    }
    
    
    @PreAuthorize("hasAuthority('ROLE_ARTIST')")
    @GetMapping("/artist/{artistId}")
    public ResponseEntity<?> getReviewsByArtist(@PathVariable String artistId) {
        try {
            List<ReviewDto> reviews = reviewService.getReviewsByArtistId(artistId);
            Double averageRating = reviewService.getArtistAverageRating(artistId);
            return ResponseEntity.ok(Map.of(
                "success", true,
                "reviews", reviews,
                "total", reviews.size(),
                "averageRating", averageRating
            ));
        } catch (Exception e) {
            log.error("Error retrieving artist reviews", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "success", false,
                "error", "Error retrieving reviews",
                "reviews", List.of(),
                "total", 0
            ));
        }
    }
    
    
    @PreAuthorize("hasRole('CUSTOMER')")
    @GetMapping("/eligibility/{orderItemId}")
    public ResponseEntity<?> checkReviewEligibility(
            @PathVariable String orderItemId,
            @RequestHeader("Authorization") String authHeader) {
        try {
            String token = extractToken(authHeader);
            ReviewEligibilityDto eligibility = reviewService.checkReviewEligibility(orderItemId, token);
            return ResponseEntity.ok(Map.of(
                "success", true,
                "data", eligibility
            ));
        } catch (Exception e) {
            log.error("Error checking review eligibility", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "success", false,
                "error", "Error checking eligibility"
            ));
        }
    }
    
    
    @PreAuthorize("hasRole('CUSTOMER')")
    @GetMapping("/reviewable-items")
    public ResponseEntity<?> getReviewableItems(@RequestHeader("Authorization") String authHeader) {
        try {
            String token = extractToken(authHeader);
            List<ReviewEligibilityDto> items = reviewService.getReviewableItems(token);
            return ResponseEntity.ok(Map.of(
                "success", true,
                "data", items,
                "total", items.size()
            ));
        } catch (Exception e) {
            log.error("Error getting reviewable items", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "success", false,
                "error", "Error getting reviewable items"
            ));
        }
    }
    
    
    @PreAuthorize("hasRole('CUSTOMER')")
    @GetMapping("/my-reviews")
    public ResponseEntity<?> getMyReviews(@RequestHeader("Authorization") String authHeader) {
        try {
            String token = extractToken(authHeader);
            List<ReviewDto> reviews = reviewService.getMyReviews(token);
            return ResponseEntity.ok(Map.of(
                "success", true,
                "reviews", reviews,
                "total", reviews.size()
            ));
        } catch (Exception e) {
            log.error("Error getting customer reviews", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "success", false,
                "error", "Error getting reviews"
            ));
        }
    }
    
    private String extractToken(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new IllegalArgumentException("Invalid authorization header");
        }
        return authHeader.substring(7);
    }
}
