package com.artwork.dto;

import lombok.Data;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

@Data
public class OrderItemDto {
    private String id;
    
    @NotBlank(message = "Artwork ID is required")
    private String artworkId;

    @NotBlank(message = "Title is required")
    private String title;

    @NotNull(message = "Price is required")
    private Double price;

    @NotNull(message = "Quantity is required")
    @Min(value = 1, message = "Quantity must be at least 1")
    private Integer quantity;
    
    
    private ArtworkDto artwork;
}
