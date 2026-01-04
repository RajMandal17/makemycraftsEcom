package com.artwork.dto;

import lombok.Data;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import com.artwork.entity.Role;
import com.artwork.validation.StrongPassword;

@Data
public class RegisterRequest {
    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    @NotBlank(message = "Password is required")
    @StrongPassword(minLength = 8, requireUppercase = true, requireLowercase = true, 
                    requireDigit = true, requireSpecial = true)
    private String password;

    @NotBlank(message = "First name is required")
    private String firstName;

    @NotBlank(message = "Last name is required")
    private String lastName;

    @Pattern(regexp = "^[a-zA-Z0-9_]{3,20}$", 
             message = "Username must be 3-20 characters and contain only letters, numbers, and underscores")
    private String username;

    private Role role;
}
