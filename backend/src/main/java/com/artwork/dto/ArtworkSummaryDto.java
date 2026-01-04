package com.artwork.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

/**
 * DTO for artwork summary information
 * Used for listing artworks without circular references
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ArtworkSummaryDto {
    private String id;
    private String title;
    private String description;
    private BigDecimal price;
    private String category;
    private String medium;
    private Double width;
    private Double height;
    private List<String> images;
    private List<String> tags;
    private Boolean isAvailable;
    private Boolean featured;
    private String artistId;
    private String artistName;
    private String artistProfilePicture;
    private Double averageRating;
    private Integer reviewCount;
    private Integer stock;
    private String imageUrl; // First image for backward compatibility
    private LocalDateTime createdAt;
}
