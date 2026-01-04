package com.artwork.util;

import com.artwork.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.UUID;


@Component
@RequiredArgsConstructor
public class UsernameGenerator {
    
    private final UserRepository userRepository;
    
    
    public String generateUniqueUsername(String email, String firstName) {
        
        String baseUsername = email.split("@")[0];
        
        
        baseUsername = baseUsername.replaceAll("[^a-zA-Z0-9_]", "").toLowerCase();
        
        
        if (baseUsername.isEmpty() && firstName != null) {
            baseUsername = firstName.replaceAll("[^a-zA-Z0-9_]", "").toLowerCase();
        }
        
        
        if (baseUsername.isEmpty()) {
            baseUsername = "user";
        }
        
        
        if (baseUsername.length() < 3) {
            baseUsername = baseUsername + "user";
        }
        
        
        if (baseUsername.length() > 15) {
            baseUsername = baseUsername.substring(0, 15);
        }
        
        
        String username = baseUsername;
        int counter = 1;
        while (userRepository.findByUsername(username).isPresent()) {
            username = baseUsername + counter;
            counter++;
            
            if (counter > 9999) {
                username = baseUsername + UUID.randomUUID().toString().substring(0, 4);
                break;
            }
        }
        
        return username;
    }
}
