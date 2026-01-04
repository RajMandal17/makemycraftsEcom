package com.artwork.dto;

import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/**
 * Review DTO for creating/updating reviews
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReviewDto {
    private String id;

    @NotNull(message = "Rating is required")
    @Min(value = 1, message = "Rating must be at least 1")
    @Max(value = 5, message = "Rating must be at most 5")
    private Integer rating;

    @Size(max = 2000, message = "Comment must be less than 2000 characters")
    private String comment;

    @NotBlank(message = "Order Item ID is required")
    private String orderItemId;
    
    // These are populated by the backend, not required in request
    private String artworkId;
    private String customerId;
    private String orderId;
    private Boolean verified;
    private String createdAt;
    private String updatedAt;
    
    // Additional info for display
    private String customerName;
    private String customerProfileImage;
    private String artworkTitle;
    private String artworkImageUrl;
    private Integer helpfulCount;
}
