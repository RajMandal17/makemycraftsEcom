package com.artwork.dto;

import com.artwork.validation.StrongPassword;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;


@Data
public class PasswordChangeRequest {
    @NotBlank(message = "New password is required")
    @StrongPassword(minLength = 8, requireUppercase = true, requireLowercase = true, 
                   requireDigit = true, requireSpecial = true)
    private String newPassword;

    @NotBlank(message = "Confirm password is required")
    private String confirmPassword;
}
