package com.artwork.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "users", indexes = {
    @Index(name = "idx_user_email", columnList = "email"),
    @Index(name = "idx_user_username", columnList = "username"),
    @Index(name = "idx_user_role", columnList = "role"),
    @Index(name = "idx_user_status", columnList = "status"),
    @Index(name = "idx_user_oauth", columnList = "oauth2_provider, oauth2_id")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(unique = true, nullable = false, length = 50)
    private String username; // LinkedIn-style unique username for profile sharing

    @Column(nullable = false)
    private String password;

    private String firstName;
    private String lastName;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private Role role = Role.CUSTOMER;

    @Builder.Default
    private Boolean isActive = true;
    private String profileImage;
    @Builder.Default
    private Boolean enabled = true;
    
    // OAuth2 fields
    @Column(name = "oauth2_provider")
    private String oauth2Provider; // google, facebook, github
    @Column(name = "oauth2_id")
    private String oauth2Id; // OAuth2 provider's user ID
    @Column(name = "profile_picture_url")
    private String profilePictureUrl; // OAuth2 profile picture
    @Builder.Default
    @Column(name = "email_verified")
    private Boolean emailVerified = false; // Email verification status
    
    // Artist specific fields
    private String bio;
    private String website;
    
    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private SocialLinks socialLinks;
    
    @Enumerated(EnumType.STRING)
    @Builder.Default
    private UserStatus status = UserStatus.APPROVED;

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
    @Builder.Default
    private LocalDateTime updatedAt = LocalDateTime.now();

    // Relations
    @OneToMany(mappedBy = "artist")
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties({"artist"})
    private List<Artwork> artworks;

    @OneToMany(mappedBy = "customer")
    private List<Order> orders;

    @OneToMany(mappedBy = "customer")
    private List<Review> reviews;

    @OneToMany(mappedBy = "user")
    private List<CartItem> cartItems;

    @OneToMany(mappedBy = "user")
    private List<WishlistItem> wishlistItems;

    @PrePersist
    public void prePersist() {
        if (createdAt == null) {
            createdAt = java.time.LocalDateTime.now();
        }
        if (updatedAt == null) {
            updatedAt = java.time.LocalDateTime.now();
        }
    }
}
