package com.artwork.controller;

import com.artwork.dto.PasswordChangeRequest;
import com.artwork.dto.UserDto;
import com.artwork.dto.UserUpdateRequest;
import com.artwork.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {
    private final UserService userService;

    @GetMapping("/profile")
    public ResponseEntity<?> getUserProfile(@RequestHeader("Authorization") String authHeader) {
        String token = authHeader != null && authHeader.startsWith("Bearer ") ? authHeader.substring(7) : null;
        UserDto userProfile = userService.getUserProfile(token);
        return ResponseEntity.ok(userProfile);
    }
    
    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(@Valid @RequestBody UserUpdateRequest updateRequest, 
                                         @RequestHeader("Authorization") String authHeader) {
        String token = authHeader != null && authHeader.startsWith("Bearer ") ? authHeader.substring(7) : null;
        UserDto updatedUser = userService.updateUserProfile(updateRequest, token);
        return ResponseEntity.ok(updatedUser);
    }
    
    @PostMapping("/profile/image")
    public ResponseEntity<?> updateProfileImage(@RequestParam("image") MultipartFile image,
                                              @RequestHeader("Authorization") String authHeader) {
        String token = authHeader != null && authHeader.startsWith("Bearer ") ? authHeader.substring(7) : null;
        String imageUrl = userService.updateProfileImage(image, token);
        return ResponseEntity.ok(imageUrl);
    }
    
    @PutMapping("/password")
    public ResponseEntity<?> changePassword(@Valid @RequestBody PasswordChangeRequest passwordRequest,
                                          @RequestHeader("Authorization") String authHeader) {
        String token = authHeader != null && authHeader.startsWith("Bearer ") ? authHeader.substring(7) : null;
        
        if (token == null) {
            return ResponseEntity.status(401).body(Map.of(
                "status", "error",
                "message", "Authentication required"
            ));
        }
        
        // Validate passwords match
        if (!passwordRequest.getNewPassword().equals(passwordRequest.getConfirmPassword())) {
            return ResponseEntity.badRequest().body(Map.of(
                "status", "error",
                "message", "Passwords do not match"
            ));
        }
        
        try {
            userService.updatePassword(passwordRequest.getNewPassword(), token);
            return ResponseEntity.ok(Map.of(
                "status", "success",
                "message", "Password updated successfully"
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "status", "error",
                "message", e.getMessage()
            ));
        }
    }
    
    @GetMapping("/password/status")
    public ResponseEntity<?> hasPassword(@RequestHeader("Authorization") String authHeader) {
        String token = authHeader != null && authHeader.startsWith("Bearer ") ? authHeader.substring(7) : null;
        
        try {
            boolean hasPassword = userService.hasPassword(token);
            return ResponseEntity.ok(Map.of(
                "status", "success",
                "hasPassword", hasPassword
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "status", "error",
                "message", e.getMessage()
            ));
        }
    }
    
    @GetMapping("/auth-check")
    public ResponseEntity<?> checkAuthentication(@RequestHeader("Authorization") String authHeader) {
        String token = authHeader != null && authHeader.startsWith("Bearer ") ? authHeader.substring(7) : null;
        
        if (token == null) {
            return ResponseEntity.status(401).body(java.util.Map.of(
                "status", "error",
                "message", "No authentication token provided"
            ));
        }
        
        try {
            UserDto user = userService.getUserProfile(token);
            return ResponseEntity.ok(java.util.Map.of(
                "status", "success",
                "message", "Authentication valid",
                "user", user
            ));
        } catch (Exception e) {
            return ResponseEntity.status(401).body(java.util.Map.of(
                "status", "error",
                "message", "Invalid authentication token",
                "error", e.getMessage()
            ));
        }
    }
}
