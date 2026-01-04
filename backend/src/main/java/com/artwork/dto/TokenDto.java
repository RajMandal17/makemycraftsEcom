package com.artwork.dto;

import lombok.Data;
import jakarta.validation.constraints.NotBlank;

@Data
public class TokenDto {
    @NotBlank(message = "Access token is required")
    private String accessToken;

    @NotBlank(message = "Refresh token is required")
    private String refreshToken;
}
