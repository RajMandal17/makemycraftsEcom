package com.artwork.dto;

import lombok.Data;
import jakarta.validation.constraints.NotNull;

@Data
public class AuthResponse {
    private boolean success;
    private String message;

    @NotNull(message = "User is required")
    private UserDto user;

    @NotNull(message = "Tokens are required")
    private TokenDto tokens;
    
    private String redirectUrl;
}
