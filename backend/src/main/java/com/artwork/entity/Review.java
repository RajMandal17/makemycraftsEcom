package com.artwork.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

/**
 * Review Entity - Production-level implementation
 * 
 * Rules:
 * 1. Only customers who purchased the product can review
 * 2. Reviews are tied to specific order items
 * 3. Reviews can only be submitted within 7 days of delivery
 * 4. One review per order item (not per artwork - same customer can review again if they buy again)
 */
@Entity
@Table(name = "reviews", 
    indexes = {
        @Index(name = "idx_review_artwork", columnList = "artworkId"),
        @Index(name = "idx_review_customer", columnList = "customerId"),
        @Index(name = "idx_review_order_item", columnList = "orderItemId"),
        @Index(name = "idx_review_created", columnList = "createdAt")
    },
    uniqueConstraints = @UniqueConstraint(
        name = "uk_review_order_item", 
        columnNames = {"orderItemId"} // One review per order item
    )
)
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Review {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false)
    private Integer rating;
    
    @Column(columnDefinition = "TEXT")
    private String comment;

    @Column(nullable = false)
    private String customerId;

    @Column(nullable = false)
    private String artworkId;
    
    /**
     * The specific order item this review is for.
     * This ensures reviews are tied to actual purchases.
     */
    @Column(nullable = false)
    private String orderItemId;
    
    /**
     * The order ID for easy querying
     */
    @Column(nullable = false)
    private String orderId;
    
    /**
     * Whether the review is verified (customer actually received the product)
     */
    @Column(nullable = false)
    @Builder.Default
    private Boolean verified = true;
    
    /**
     * Optional: Customer can mark as helpful
     */
    @Builder.Default
    private Integer helpfulCount = 0;
    
    /**
     * Moderation status
     */
    @Enumerated(EnumType.STRING)
    @Builder.Default
    private ReviewStatus status = ReviewStatus.APPROVED;

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
    
    @Builder.Default
    private LocalDateTime updatedAt = LocalDateTime.now();
    
    /**
     * Track when the order was delivered (for 7-day window calculation)
     */
    private LocalDateTime deliveredAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customerId", referencedColumnName = "id", insertable = false, updatable = false)
    private User customer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "artworkId", referencedColumnName = "id", insertable = false, updatable = false)
    private Artwork artwork;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "orderItemId", referencedColumnName = "id", insertable = false, updatable = false)
    private OrderItem orderItem;
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
