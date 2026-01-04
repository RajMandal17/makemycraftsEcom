package com.artwork.dto;

import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class SocialLinksDto {
    @Pattern(regexp = "^[a-zA-Z0-9._]{1,30}$", message = "Instagram handle must contain only letters, numbers, dots, and underscores")
    @Size(max = 30, message = "Instagram handle cannot exceed 30 characters")
    private String instagram;
    
    @Pattern(regexp = "^[a-zA-Z0-9_]{1,15}$", message = "Twitter/X handle must contain only letters, numbers, and underscores")
    @Size(max = 15, message = "Twitter/X handle cannot exceed 15 characters")
    private String twitter;
    
    @Pattern(regexp = "^[a-zA-Z0-9.]{5,50}$", message = "Facebook username must contain only letters, numbers, and dots")
    @Size(max = 50, message = "Facebook username cannot exceed 50 characters")
    private String facebook;
}
