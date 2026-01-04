package com.artwork.dto;

import lombok.Data;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.util.List;

@Data
public class ArtworkDto {
    private String id;

    @NotBlank(message = "Title is required")
    private String title;

    @NotBlank(message = "Description is required")
    private String description;

    @NotNull(message = "Price is required")
    private Double price;

    @NotBlank(message = "Category is required")
    private String category;

    @NotBlank(message = "Medium is required")
    private String medium;

    @NotNull(message = "Width is required")
    private Double width;

    @NotNull(message = "Height is required")
    private Double height;

    private Double depth;

    @Size(min = 1, message = "At least one image is required")
    private List<String> images;

    private List<String> tags;
    private Boolean isAvailable;
    private Boolean featured;
    private String approvalStatus;
    private String moderationNotes;
    private ArtistDto artist;
    private Double averageRating;
    private Integer totalReviews;
    private String createdAt;
}
