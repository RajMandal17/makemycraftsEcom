package com.artwork.exception;

import lombok.Getter;

import java.time.LocalDateTime;
import java.util.Map;

@Getter
public class ValidationErrorDetails extends ErrorDetails {
    private final Map<String, String> validationErrors;
    
    public ValidationErrorDetails(
            LocalDateTime timestamp, 
            int status, 
            String error, 
            String message, 
            String details, 
            String path, 
            Map<String, String> validationErrors) {
        super(timestamp, status, error, message, details, path);
        this.validationErrors = validationErrors;
    }
}
