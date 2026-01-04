package com.artwork.dto;

import lombok.Data;
import jakarta.validation.constraints.NotBlank;

@Data
public class ArtistDto {
    private String id;

    @NotBlank(message = "First name is required")
    private String firstName;

    @NotBlank(message = "Last name is required")
    private String lastName;

    private String profileImage;
    private Boolean isApproved;
    private String bio;
}
