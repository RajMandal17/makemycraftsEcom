package com.artwork.entity;

import com.artwork.dto.Dimensions;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "artworks", indexes = {
    @Index(name = "idx_artwork_category", columnList = "category"),
    @Index(name = "idx_artwork_status", columnList = "isAvailable"),
    @Index(name = "idx_artwork_approval", columnList = "approvalStatus"),
    @Index(name = "idx_artwork_featured", columnList = "featured"),
    @Index(name = "idx_artwork_price", columnList = "price"),
    @Index(name = "idx_artwork_created", columnList = "createdAt")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Artwork {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    private String title;
    private String description;
    private Double price;
    private String category;
    private String medium;
    private Double width;
    private Double height;
    private Double depth;

    @ElementCollection
    @CollectionTable(name = "artwork_images", joinColumns = @JoinColumn(name = "artwork_id"))
    @Column(name = "images")
    private List<String> images;

    @ElementCollection
    @CollectionTable(name = "artwork_tags", joinColumns = @JoinColumn(name = "artwork_id"))
    @Column(name = "tags")
    private List<String> tags;

    @Builder.Default
    private Boolean isAvailable = true;
    
    @Builder.Default
    private Boolean featured = false;
    
    @Enumerated(EnumType.STRING)
    @Builder.Default
    private ApprovalStatus approvalStatus = ApprovalStatus.PENDING;
    
    private String moderationNotes;

    
    @Column(name = "artist_id", insertable = false, updatable = false)
    private String artistId;
    
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
    
    @Builder.Default
    private LocalDateTime updatedAt = LocalDateTime.now();

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "artist_id", nullable = false)
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties({"artworks", "reviews", "password", "oauth2Id"})
    private User artist;

    @OneToMany(mappedBy = "artwork")
    private List<Review> reviews;

    @OneToMany(mappedBy = "artwork")
    private List<CartItem> cartItems;

    @OneToMany(mappedBy = "artwork")
    private List<WishlistItem> wishlistItems;

    @OneToMany(mappedBy = "artwork")
    private List<OrderItem> orderItems;

    
    public Dimensions getDimensions() {
        return Dimensions.builder()
                .width(this.width)
                .height(this.height)
                .depth(this.depth)
                .build();
    }
    
    public void setDimensions(Dimensions dimensions) {
        if (dimensions != null) {
            this.width = dimensions.getWidth();
            this.height = dimensions.getHeight();
            this.depth = dimensions.getDepth();
        }
    }
    
    public void setAvailable(boolean available) {
        this.isAvailable = available;
    }
}
