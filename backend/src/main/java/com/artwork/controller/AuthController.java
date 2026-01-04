package com.artwork.controller;

import com.artwork.dto.*;
import com.artwork.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@RequestBody RegisterRequest request) {
        AuthResponse response = authService.register(request);
        return ResponseEntity.status(response.isSuccess() ? 201 : 400).body(response);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.status(response.isSuccess() ? 200 : 401).body(response);
    }

    @GetMapping("/verify")
    public ResponseEntity<?> verifyToken(@AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) {
            return ResponseEntity.status(401).body(new ErrorResponse("Invalid or expired token"));
        }

        try {
            UserDto userDto = authService.getUserByUsername(userDetails.getUsername());
            if (userDto == null) {
                return ResponseEntity.status(404).body(new ErrorResponse("User not found"));
            }

            // Add additional debug info
            userDto.setAuthorities(userDetails.getAuthorities().toString());

            // Return wrapped response to match ApiResponse structure
            Map<String, Object> response = new HashMap<>();
            response.put("data", userDto);
            response.put("message", "Token verified successfully");
            response.put("success", true);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500)
                .body(new ErrorResponse("Error verifying token: " + e.getMessage()));
        }
    }
}
