package com.artwork.dto;

import lombok.Data;
import jakarta.validation.constraints.NotBlank;

@Data
public class WishlistItemDto {
    private String id;

    @NotBlank(message = "Artwork ID is required")
    private String artworkId;

    private ArtworkDto artwork;
    private String createdAt;
}
