package com.artwork.service.impl;

import com.artwork.dto.ReviewDto;
import com.artwork.dto.ReviewEligibilityDto;
import com.artwork.dto.ArtworkRatingSummaryDto;
import com.artwork.entity.*;
import com.artwork.repository.*;
import com.artwork.security.JwtUtil;
import com.artwork.service.ReviewService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;


@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class ReviewServiceImpl implements ReviewService {
    
    private final ReviewRepository reviewRepository;
    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final ArtworkRepository artworkRepository;
    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;
    
    @Value("${review.window.days:7}")
    private int reviewWindowDays;
    
    @Value("${review.edit.window.days:3}")
    private int editWindowDays;
    
    private static final DateTimeFormatter ISO_FORMATTER = DateTimeFormatter.ISO_LOCAL_DATE_TIME;

    @Override
    @Transactional
    public ReviewDto addReview(ReviewDto reviewDto, String token) {
        String userId = extractUserId(token);
        
        
        OrderItem orderItem = orderItemRepository.findById(reviewDto.getOrderItemId())
                .orElseThrow(() -> new IllegalArgumentException("Order item not found"));
        
        Order order = orderRepository.findById(orderItem.getOrderId())
                .orElseThrow(() -> new IllegalArgumentException("Order not found"));
        
        
        if (!order.getCustomerId().equals(userId)) {
            throw new IllegalStateException("You can only review items from your own orders");
        }
        
        
        if (order.getStatus() != OrderStatus.DELIVERED) {
            throw new IllegalStateException("You can only review items from delivered orders");
        }
        
        
        if (reviewRepository.existsByOrderItemId(reviewDto.getOrderItemId())) {
            throw new IllegalStateException("You have already reviewed this item");
        }
        
        
        LocalDateTime deliveredAt = findDeliveryTime(order);
        LocalDateTime reviewDeadline = deliveredAt.plusDays(reviewWindowDays);
        
        if (LocalDateTime.now().isAfter(reviewDeadline)) {
            throw new IllegalStateException(
                String.format("Review window has expired. You had %d days from delivery to submit a review.", reviewWindowDays)
            );
        }
        
        
        if (reviewDto.getRating() == null || reviewDto.getRating() < 1 || reviewDto.getRating() > 5) {
            throw new IllegalArgumentException("Rating must be between 1 and 5");
        }
        
        
        Review review = Review.builder()
                .customerId(userId)
                .artworkId(orderItem.getArtworkId())
                .orderItemId(orderItem.getId())
                .orderId(order.getId())
                .rating(reviewDto.getRating())
                .comment(sanitizeComment(reviewDto.getComment()))
                .verified(true)
                .deliveredAt(deliveredAt)
                .status(ReviewStatus.APPROVED) 
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
        
        review = reviewRepository.save(review);
        log.info("Review created: {} by customer {} for artwork {}", review.getId(), userId, orderItem.getArtworkId());
        
        return mapToDto(review);
    }

    @Override
    @Transactional
    public ReviewDto updateReview(String reviewId, ReviewDto reviewDto, String token) {
        String userId = extractUserId(token);
        
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new IllegalArgumentException("Review not found"));
        
        
        if (!review.getCustomerId().equals(userId)) {
            throw new IllegalStateException("You can only edit your own reviews");
        }
        
        
        LocalDateTime editDeadline = review.getCreatedAt().plusDays(editWindowDays);
        if (LocalDateTime.now().isAfter(editDeadline)) {
            throw new IllegalStateException(
                String.format("Edit window has expired. You had %d days from review creation to edit.", editWindowDays)
            );
        }
        
        
        if (reviewDto.getRating() != null) {
            if (reviewDto.getRating() < 1 || reviewDto.getRating() > 5) {
                throw new IllegalArgumentException("Rating must be between 1 and 5");
            }
            review.setRating(reviewDto.getRating());
        }
        
        if (reviewDto.getComment() != null) {
            review.setComment(sanitizeComment(reviewDto.getComment()));
        }
        
        review.setUpdatedAt(LocalDateTime.now());
        review = reviewRepository.save(review);
        
        log.info("Review updated: {} by customer {}", review.getId(), userId);
        
        return mapToDto(review);
    }

    @Override
    @Transactional
    public void deleteReview(String reviewId, String token) {
        String userId = extractUserId(token);
        
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new IllegalArgumentException("Review not found"));
        
        
        if (!review.getCustomerId().equals(userId)) {
            throw new IllegalStateException("You can only delete your own reviews");
        }
        
        reviewRepository.delete(review);
        log.info("Review deleted: {} by customer {}", reviewId, userId);
    }

    @Override
    public List<ReviewDto> getReviewsByArtworkId(String artworkId) {
        List<Review> reviews = reviewRepository.findByArtworkIdAndStatusOrderByCreatedAtDesc(
            artworkId, ReviewStatus.APPROVED);
        return reviews.stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<ReviewDto> getReviewsByArtistId(String artistId) {
        List<Review> reviews = reviewRepository.findByArtistIdAndStatusOrderByCreatedAtDesc(
            artistId, ReviewStatus.APPROVED);
        return reviews.stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    public ReviewEligibilityDto checkReviewEligibility(String orderItemId, String token) {
        String userId = extractUserId(token);
        
        OrderItem orderItem = orderItemRepository.findById(orderItemId).orElse(null);
        if (orderItem == null) {
            return ReviewEligibilityDto.builder()
                    .orderItemId(orderItemId)
                    .eligible(false)
                    .reason("Order item not found")
                    .build();
        }
        
        Order order = orderRepository.findById(orderItem.getOrderId()).orElse(null);
        if (order == null) {
            return ReviewEligibilityDto.builder()
                    .orderItemId(orderItemId)
                    .eligible(false)
                    .reason("Order not found")
                    .build();
        }
        
        Artwork artwork = artworkRepository.findById(orderItem.getArtworkId()).orElse(null);
        
        return buildEligibilityDto(orderItem, order, artwork, userId);
    }

    @Override
    public List<ReviewEligibilityDto> getReviewableItems(String token) {
        String userId = extractUserId(token);
        
        
        List<Order> orders = orderRepository.findByCustomerId(userId);
        
        List<ReviewEligibilityDto> result = new ArrayList<>();
        
        for (Order order : orders) {
            if (order.getStatus() != OrderStatus.DELIVERED) {
                continue;
            }
            
            List<OrderItem> items = orderItemRepository.findByOrderId(order.getId());
            for (OrderItem item : items) {
                Artwork artwork = artworkRepository.findById(item.getArtworkId()).orElse(null);
                ReviewEligibilityDto dto = buildEligibilityDto(item, order, artwork, userId);
                result.add(dto);
            }
        }
        
        return result;
    }

    @Override
    public ArtworkRatingSummaryDto getArtworkRatingSummary(String artworkId) {
        Double avgRating = reviewRepository.getAverageRatingByArtworkId(artworkId);
        Long totalReviews = reviewRepository.countByArtworkIdAndApproved(artworkId);
        
        
        List<Object[]> distribution = reviewRepository.getRatingDistributionByArtworkId(artworkId);
        Map<Integer, Long> ratingCounts = new HashMap<>();
        for (Object[] row : distribution) {
            Integer rating = (Integer) row[0];
            Long count = (Long) row[1];
            ratingCounts.put(rating, count);
        }
        
        
        List<Review> recentReviews = reviewRepository.findByArtworkIdAndStatusOrderByCreatedAtDesc(
            artworkId, ReviewStatus.APPROVED);
        List<ReviewDto> recentReviewDtos = recentReviews.stream()
                .limit(5)
                .map(this::mapToDto)
                .collect(Collectors.toList());
        
        return ArtworkRatingSummaryDto.builder()
                .artworkId(artworkId)
                .averageRating(Math.round(avgRating * 10) / 10.0) 
                .totalReviews(totalReviews.intValue())
                .oneStarCount(ratingCounts.getOrDefault(1, 0L).intValue())
                .twoStarCount(ratingCounts.getOrDefault(2, 0L).intValue())
                .threeStarCount(ratingCounts.getOrDefault(3, 0L).intValue())
                .fourStarCount(ratingCounts.getOrDefault(4, 0L).intValue())
                .fiveStarCount(ratingCounts.getOrDefault(5, 0L).intValue())
                .recentReviews(recentReviewDtos)
                .build();
    }

    @Override
    public Double getArtistAverageRating(String artistId) {
        Double rating = reviewRepository.getAverageRatingByArtistId(artistId);
        return Math.round(rating * 10) / 10.0;
    }

    @Override
    public List<ReviewDto> getMyReviews(String token) {
        String userId = extractUserId(token);
        List<Review> reviews = reviewRepository.findByCustomerId(userId);
        return reviews.stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }
    
    
    
    private String extractUserId(String token) {
        if (token == null || token.isEmpty()) {
            throw new IllegalArgumentException("Authentication required");
        }
        return jwtUtil.getClaims(token).getSubject();
    }
    
    private String getFirstImage(Artwork artwork) {
        if (artwork == null || artwork.getImages() == null || artwork.getImages().isEmpty()) {
            return null;
        }
        return artwork.getImages().get(0);
    }
    
    private LocalDateTime findDeliveryTime(Order order) {
        
        
        return order.getUpdatedAt() != null ? order.getUpdatedAt() : order.getCreatedAt();
    }
    
    private String sanitizeComment(String comment) {
        if (comment == null) return null;
        
        return comment.trim()
                .replaceAll("<[^>]*>", "")
                .replaceAll("\\s+", " ");
    }
    
    private ReviewEligibilityDto buildEligibilityDto(OrderItem orderItem, Order order, Artwork artwork, String userId) {
        ReviewEligibilityDto.ReviewEligibilityDtoBuilder builder = ReviewEligibilityDto.builder()
                .orderItemId(orderItem.getId())
                .artworkId(orderItem.getArtworkId())
                .orderId(order.getId());
        
        if (artwork != null) {
            builder.artworkTitle(artwork.getTitle())
                   .artworkImageUrl(getFirstImage(artwork));
        }
        
        
        if (!order.getCustomerId().equals(userId)) {
            return builder
                    .eligible(false)
                    .reason("This order doesn't belong to you")
                    .build();
        }
        
        
        if (order.getStatus() != OrderStatus.DELIVERED) {
            return builder
                    .eligible(false)
                    .reason("Order must be delivered before you can review")
                    .build();
        }
        
        
        Optional<Review> existingReview = reviewRepository.findByOrderItemId(orderItem.getId());
        if (existingReview.isPresent()) {
            Review review = existingReview.orElseThrow(() -> 
                new IllegalStateException("Review exists but could not be retrieved"));
            LocalDateTime editDeadline = review.getCreatedAt().plusDays(editWindowDays);
            boolean canEdit = LocalDateTime.now().isBefore(editDeadline);
            
            return builder
                    .eligible(false)
                    .reason("You have already reviewed this item")
                    .alreadyReviewed(true)
                    .existingReviewId(review.getId())
                    .existingRating(review.getRating())
                    .canEdit(canEdit)
                    .build();
        }
        
        
        LocalDateTime deliveredAt = findDeliveryTime(order);
        LocalDateTime reviewDeadline = deliveredAt.plusDays(reviewWindowDays);
        long daysRemaining = ChronoUnit.DAYS.between(LocalDateTime.now(), reviewDeadline);
        
        if (LocalDateTime.now().isAfter(reviewDeadline)) {
            return builder
                    .eligible(false)
                    .reason(String.format("Review window expired. You had %d days from delivery.", reviewWindowDays))
                    .deliveredAt(deliveredAt.format(ISO_FORMATTER))
                    .reviewDeadline(reviewDeadline.format(ISO_FORMATTER))
                    .daysRemaining(0)
                    .build();
        }
        
        
        return builder
                .eligible(true)
                .reason("You can review this item")
                .deliveredAt(deliveredAt.format(ISO_FORMATTER))
                .reviewDeadline(reviewDeadline.format(ISO_FORMATTER))
                .daysRemaining((int) daysRemaining)
                .alreadyReviewed(false)
                .canEdit(false)
                .build();
    }
    
    private ReviewDto mapToDto(Review review) {
        ReviewDto dto = ReviewDto.builder()
                .id(review.getId())
                .rating(review.getRating())
                .comment(review.getComment())
                .artworkId(review.getArtworkId())
                .customerId(review.getCustomerId())
                .orderId(review.getOrderId())
                .orderItemId(review.getOrderItemId())
                .verified(review.getVerified())
                .helpfulCount(review.getHelpfulCount())
                .createdAt(review.getCreatedAt() != null ? review.getCreatedAt().format(ISO_FORMATTER) : null)
                .updatedAt(review.getUpdatedAt() != null ? review.getUpdatedAt().format(ISO_FORMATTER) : null)
                .build();
        
        
        if (review.getCustomer() != null) {
            User customer = review.getCustomer();
            dto.setCustomerName(customer.getFirstName() + " " + customer.getLastName());
            dto.setCustomerProfileImage(customer.getProfileImage());
        } else {
            
            userRepository.findById(review.getCustomerId()).ifPresent(customer -> {
                dto.setCustomerName(customer.getFirstName() + " " + customer.getLastName());
                dto.setCustomerProfileImage(customer.getProfileImage());
            });
        }
        
        
        if (review.getArtwork() != null) {
            Artwork artwork = review.getArtwork();
            dto.setArtworkTitle(artwork.getTitle());
            dto.setArtworkImageUrl(getFirstImage(artwork));
        } else {
            
            artworkRepository.findById(review.getArtworkId()).ifPresent(artwork -> {
                dto.setArtworkTitle(artwork.getTitle());
                dto.setArtworkImageUrl(getFirstImage(artwork));
            });
        }
        
        return dto;
    }
}
