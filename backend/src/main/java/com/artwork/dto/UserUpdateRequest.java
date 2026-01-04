package com.artwork.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UserUpdateRequest {
    @Size(min = 2, max = 50, message = "First name must be between 2 and 50 characters")
    private String firstName;
    
    @Size(min = 0, max = 50, message = "Last name cannot exceed 50 characters")
    private String lastName;
    
    @Size(max = 1000, message = "Bio cannot exceed 1000 characters")
    private String bio;
    
    @Pattern(regexp = "^(https?://)?([\\w\\-]++(?:\\.[\\w\\-]++)++)/?.*$", 
             message = "Website must be a valid URL")
    @Size(max = 255, message = "Website URL cannot exceed 255 characters")
    private String website;
    
    @Valid
    private SocialLinksDto socialLinks;
}
