package com.artwork.validation;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

public class StrongPasswordValidator implements ConstraintValidator<StrongPassword, String> {
    private int minLength;
    private boolean requireUppercase;
    private boolean requireLowercase;
    private boolean requireDigit;
    private boolean requireSpecial;
    
    @Override
    public void initialize(StrongPassword constraintAnnotation) {
        this.minLength = constraintAnnotation.minLength();
        this.requireUppercase = constraintAnnotation.requireUppercase();
        this.requireLowercase = constraintAnnotation.requireLowercase();
        this.requireDigit = constraintAnnotation.requireDigit();
        this.requireSpecial = constraintAnnotation.requireSpecial();
    }
    
    @Override
    public boolean isValid(String password, ConstraintValidatorContext context) {
        if (password == null || password.isEmpty()) {
            // Null/empty validation should be handled by @NotNull or @NotEmpty
            return true;
        }
        
        boolean valid = true;
        context.disableDefaultConstraintViolation();
        
        if (password.length() < minLength) {
            context.buildConstraintViolationWithTemplate("Password must be at least " + minLength + " characters long")
                .addConstraintViolation();
            valid = false;
        }
        
        if (requireUppercase && !password.matches(".*[A-Z].*")) {
            context.buildConstraintViolationWithTemplate("Password must contain at least one uppercase letter")
                .addConstraintViolation();
            valid = false;
        }
        
        if (requireLowercase && !password.matches(".*[a-z].*")) {
            context.buildConstraintViolationWithTemplate("Password must contain at least one lowercase letter")
                .addConstraintViolation();
            valid = false;
        }
        
        if (requireDigit && !password.matches(".*\\d.*")) {
            context.buildConstraintViolationWithTemplate("Password must contain at least one digit")
                .addConstraintViolation();
            valid = false;
        }
        
        if (requireSpecial && !password.matches(".*[!@#$%^&*()_+\\-=\\[\\]{};':\"\\\\|,.<>/?].*")) {
            context.buildConstraintViolationWithTemplate("Password must contain at least one special character")
                .addConstraintViolation();
            valid = false;
        }
        
        return valid;
    }
}
