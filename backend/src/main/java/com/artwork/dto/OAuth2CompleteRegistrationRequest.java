package com.artwork.dto;

import lombok.Data;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

@Data
public class OAuth2CompleteRegistrationRequest {
    
    @NotBlank(message = "Temporary token is required")
    private String tempToken;
    
    @NotNull(message = "Role is required")
    @Pattern(regexp = "CUSTOMER|ARTIST", message = "Role must be either CUSTOMER or ARTIST")
    private String role;
    
    // Optional additional fields
    private String phoneNumber;
    private String address;
    private String city;
    private String state;
    private String country;
    private String zipCode;
    
    // Artist-specific fields (required if role is ARTIST)
    private String bio;
    private String specialization;
}
