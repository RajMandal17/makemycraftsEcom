package com.artwork.util;

import com.artwork.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.UUID;

/**
 * Utility class for generating unique usernames
 */
@Component
@RequiredArgsConstructor
public class UsernameGenerator {
    
    private final UserRepository userRepository;
    
    /**
     * Generate a unique username from email and first name
     * @param email User's email
     * @param firstName User's first name
     * @return A unique username
     */
    public String generateUniqueUsername(String email, String firstName) {
        // Extract username from email (before @)
        String baseUsername = email.split("@")[0];
        
        // Clean username: remove non-alphanumeric characters except underscore
        baseUsername = baseUsername.replaceAll("[^a-zA-Z0-9_]", "").toLowerCase();
        
        // If empty after cleaning, use first name
        if (baseUsername.isEmpty() && firstName != null) {
            baseUsername = firstName.replaceAll("[^a-zA-Z0-9_]", "").toLowerCase();
        }
        
        // If still empty, use default
        if (baseUsername.isEmpty()) {
            baseUsername = "user";
        }
        
        // Ensure minimum length of 3
        if (baseUsername.length() < 3) {
            baseUsername = baseUsername + "user";
        }
        
        // Truncate to max 15 characters to leave room for suffix
        if (baseUsername.length() > 15) {
            baseUsername = baseUsername.substring(0, 15);
        }
        
        // Check if username exists, if so, append number
        String username = baseUsername;
        int counter = 1;
        while (userRepository.findByUsername(username).isPresent()) {
            username = baseUsername + counter;
            counter++;
            // Prevent infinite loop
            if (counter > 9999) {
                username = baseUsername + UUID.randomUUID().toString().substring(0, 4);
                break;
            }
        }
        
        return username;
    }
}
