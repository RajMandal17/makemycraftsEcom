package com.artwork.controller;

import com.artwork.dto.OAuth2CompleteRegistrationRequest;
import com.artwork.entity.Role;
import com.artwork.entity.User;
import com.artwork.repository.UserRepository;
import com.artwork.security.JwtUtil;
import io.jsonwebtoken.Claims;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;


@RestController
@RequestMapping("/api/oauth2")
@RequiredArgsConstructor
@Slf4j
public class OAuth2Controller {
    
    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;
    
    @Value("${server.servlet.context-path:}")
    private String contextPath;
    
    @Value("${server.port:8081}")
    private String serverPort;
    
    
    @GetMapping("/providers")
    public ResponseEntity<Map<String, Object>> getOAuth2Providers() {
        log.info("Fetching OAuth2 providers");
        
        Map<String, Object> response = new HashMap<>();
        
        
        String baseUrl = contextPath.isEmpty() ? "" : contextPath;
        
        
        Map<String, String> google = new HashMap<>();
        google.put("name", "Google");
        google.put("authorizationUrl", baseUrl + "oauth2/authorization/google");
        google.put("displayName", "Continue with Google");
        google.put("iconClass", "fab fa-google");
        google.put("buttonColor", "#4285f4");
        
        
        Map<String, String> facebook = new HashMap<>();
        facebook.put("name", "Facebook");
        facebook.put("authorizationUrl", baseUrl + "oauth2/authorization/facebook");
        facebook.put("displayName", "Continue with Facebook");
        facebook.put("iconClass", "fab fa-facebook-f");
        facebook.put("buttonColor", "#1877f2");
        
        
        Map<String, String> github = new HashMap<>();
        github.put("name", "GitHub");
        github.put("authorizationUrl", baseUrl + "oauth2/authorization/github");
        github.put("displayName", "Continue with GitHub");
        github.put("iconClass", "fab fa-github");
        github.put("buttonColor", "#333");
        
        response.put("google", google);
        response.put("facebook", facebook);
        response.put("github", github);
        
        return ResponseEntity.ok(response);
    }
    
    
    @PostMapping("/complete-registration")
    public ResponseEntity<?> completeRegistration(@Valid @RequestBody OAuth2CompleteRegistrationRequest request) {
        try {
            
            Claims claims = jwtUtil.getClaims(request.getTempToken());
            
            
            Object tempAuthObj = claims.get("tempAuth");
            if (tempAuthObj == null || !Boolean.valueOf(tempAuthObj.toString())) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Invalid temporary token"));
            }
            
            
            String userId = claims.get("userId").toString();
            
            
            Optional<User> userOptional = userRepository.findById(userId);
            if (userOptional.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "User not found"));
            }
            
            User user = userOptional.get();
            
            
            user.setRole(Role.valueOf(request.getRole()));
            user.setUpdatedAt(LocalDateTime.now());
            
            
            if (request.getRole().equals("ARTIST") && request.getBio() != null) {
                user.setBio(request.getBio());
            }
            
            
            userRepository.save(user);
            
            log.info("Completed OAuth2 registration for user: {} with role: {}", user.getEmail(), request.getRole());
            
            
            Map<String, Object> tokenClaims = new HashMap<>();
            tokenClaims.put("userId", user.getId());
            tokenClaims.put("firstName", user.getFirstName());
            tokenClaims.put("lastName", user.getLastName());
            
            String accessToken = jwtUtil.generateToken(
                user.getId(),
                user.getEmail(),
                user.getRole().name(),
                tokenClaims
            );
            
            String refreshToken = jwtUtil.generateRefreshToken(
                user.getId(),
                user.getEmail(),
                user.getRole().name()
            );
            
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Registration completed successfully");
            response.put("token", accessToken);
            response.put("refreshToken", refreshToken);
            response.put("user", buildUserResponse(user));
            response.put("redirectUrl", getDashboardUrlByRole(user.getRole()));
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Error completing OAuth2 registration: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to complete registration: " + e.getMessage()));
        }
    }
    
    private Map<String, Object> buildUserResponse(User user) {
        Map<String, Object> userMap = new HashMap<>();
        userMap.put("id", user.getId());
        userMap.put("email", user.getEmail());
        userMap.put("firstName", user.getFirstName());
        userMap.put("lastName", user.getLastName());
        userMap.put("role", user.getRole().name());
        userMap.put("emailVerified", user.getEmailVerified());
        userMap.put("profilePictureUrl", user.getProfilePictureUrl());
        userMap.put("oauth2Provider", user.getOauth2Provider());
        return userMap;
    }
    
        
    @GetMapping("/debug/config")
    public ResponseEntity<Map<String, Object>> debugConfig() {
        Map<String, Object> debug = new HashMap<>();
        debug.put("contextPath", contextPath);
        debug.put("serverPort", serverPort);
        debug.put("timestamp", LocalDateTime.now());
        return ResponseEntity.ok(debug);
    }
    
    
    @GetMapping("/debug/users")
    public ResponseEntity<Map<String, Object>> debugUsers() {
        Map<String, Object> debug = new HashMap<>();
        
        try {
            
            long totalUsers = userRepository.count();
            debug.put("totalUsers", totalUsers);
            
            
            java.util.List<User> recentUsers = userRepository.findAll()
                .stream()
                .sorted((u1, u2) -> u2.getCreatedAt().compareTo(u1.getCreatedAt()))
                .limit(10)
                .collect(java.util.stream.Collectors.toList());
            
            java.util.List<Map<String, Object>> userSummary = recentUsers.stream()
                .map(user -> {
                    Map<String, Object> userInfo = new HashMap<>();
                    userInfo.put("id", user.getId());
                    userInfo.put("email", user.getEmail());
                    userInfo.put("firstName", user.getFirstName());
                    userInfo.put("lastName", user.getLastName());
                    userInfo.put("role", user.getRole());
                    userInfo.put("oauth2Provider", user.getOauth2Provider());
                    userInfo.put("createdAt", user.getCreatedAt());
                    userInfo.put("isActive", user.getIsActive());
                    userInfo.put("enabled", user.getEnabled());
                    return userInfo;
                })
                .collect(java.util.stream.Collectors.toList());
            
            debug.put("recentUsers", userSummary);
            debug.put("timestamp", LocalDateTime.now());
            
        } catch (Exception e) {
            debug.put("error", "Failed to fetch users: " + e.getMessage());
            log.error("Failed to fetch users for debug", e);
        }
        
        return ResponseEntity.ok(debug);
    }
    
    
    @PostMapping("/debug/test-user-creation")
    public ResponseEntity<Map<String, Object>> testUserCreation() {
        Map<String, Object> result = new HashMap<>();
        
        try {
            
            long userCount = userRepository.count();
            result.put("initialUserCount", userCount);
            
            
            String testEmail = "oauth2test+" + System.currentTimeMillis() + "@example.com";
            
            User testUser = User.builder()
                .email(testEmail)
                .firstName("OAuth2")
                .lastName("Test")
                .password("") 
                .oauth2Provider("google")
                .oauth2Id("test_" + System.currentTimeMillis())
                .emailVerified(true)
                .role(Role.PENDING)
                .status(com.artwork.entity.UserStatus.APPROVED)
                .isActive(true)
                .enabled(true)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
            
            log.info("Creating test OAuth2 user: {}", testEmail);
            User savedUser = userRepository.save(testUser);
            log.info("Successfully created test user with ID: {}", savedUser.getId());
            
            result.put("testUserCreated", true);
            result.put("testUserId", savedUser.getId());
            result.put("testUserEmail", savedUser.getEmail());
            
            
            Optional<User> verifyUser = userRepository.findByEmail(testEmail);
            result.put("userFoundAfterSave", verifyUser.isPresent());
            
            long finalUserCount = userRepository.count();
            result.put("finalUserCount", finalUserCount);
            result.put("userCountIncreased", finalUserCount > userCount);
            
        } catch (Exception e) {
            log.error("Failed to create test user", e);
            result.put("error", "Failed to create test user: " + e.getMessage());
            result.put("exception", e.getClass().getSimpleName());
        }
        
        return ResponseEntity.ok(result);
    }
    
    
    private String getDashboardUrlByRole(Role role) {
        return switch (role) {
            case ADMIN -> "/dashboard/admin";
            case ARTIST -> "/dashboard/artist";
            case CUSTOMER -> "/dashboard/customer";
            case PENDING -> "/select-role"; 
        };
    }
}
