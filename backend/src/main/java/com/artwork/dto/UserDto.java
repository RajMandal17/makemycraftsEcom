package com.artwork.dto;

import lombok.Data;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import com.artwork.entity.Role;

@Data
public class UserDto {
    private String id;

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    private String username; 

    @NotBlank(message = "First name is required")
    private String firstName;

    @NotBlank(message = "Last name is required")
    private String lastName;

    private String role;
    private String status;
    private Boolean isActive;
    private String profileImage;
    private String profilePictureUrl;
    private String createdAt;
    private String authorities; 
    
    
    private String bio;
    private String website;
    private SocialLinksDto socialLinks;
    private Long artworkCount;
    private Double averageRating;
}
