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
    
    
    private String phoneNumber;
    private String address;
    private String city;
    private String state;
    private String country;
    private String zipCode;
    
    
    private String bio;
    private String specialization;
}
