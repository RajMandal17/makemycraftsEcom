package com.artwork.dto;

import com.artwork.validation.StrongPassword;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * DTO for setting a new password (for OAuth users who don't have a password yet)
 */
@Data
public class PasswordSetRequest {
    @NotBlank(message = "New password is required")
    @StrongPassword(minLength = 8, requireUppercase = true, requireLowercase = true, 
                   requireDigit = true, requireSpecial = true)
    private String newPassword;

    @NotBlank(message = "Confirm password is required")
    private String confirmPassword;
}
