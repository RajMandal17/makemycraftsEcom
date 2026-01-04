package com.artwork.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;


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
        columnNames = {"orderItemId"} 
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
    
    
    @Column(nullable = false)
    private String orderItemId;
    
    
    @Column(nullable = false)
    private String orderId;
    
    
    @Column(nullable = false)
    @Builder.Default
    private Boolean verified = true;
    
    
    @Builder.Default
    private Integer helpfulCount = 0;
    
    
    @Enumerated(EnumType.STRING)
    @Builder.Default
    private ReviewStatus status = ReviewStatus.APPROVED;

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
    
    @Builder.Default
    private LocalDateTime updatedAt = LocalDateTime.now();
    
    
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
