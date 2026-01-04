package com.artwork.controller;

import com.artwork.dto.TokenDto;
import com.artwork.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class TokenController {
    private final JwtUtil jwtUtil;
    @Autowired(required = false)
    private RedisTemplate<String, String> redisTemplate;

    @PostMapping("/refresh")
    public ResponseEntity<?> refresh(@RequestBody TokenDto tokenDto) {
        String refreshToken = tokenDto.getRefreshToken();
        if (!jwtUtil.validateToken(refreshToken)) {
            return ResponseEntity.status(401).body(Map.of("success", false, "message", "Invalid refresh token"));
        }
        
        // Optionally check Redis blacklist if available
        try {
            if (redisTemplate != null) {
                Boolean isBlacklisted = redisTemplate.hasKey("BLACKLIST:" + refreshToken);
                if (Boolean.TRUE.equals(isBlacklisted)) {
                    return ResponseEntity.status(401).body(Map.of("success", false, "message", "Token is blacklisted"));
                }
            }
        } catch (Exception e) {
            log.warn("Redis connection failed for token blacklist check, continuing without check: {}", e.getMessage());
        }
        
        var claims = jwtUtil.getClaims(refreshToken);
        String userId = claims.getSubject();
        String email = (String) claims.get("email");
        String role = (String) claims.get("role");
        String newAccessToken = jwtUtil.generateToken(userId, email, role, new HashMap<>());
        return ResponseEntity.ok(Map.of("success", true, "data", Map.of("accessToken", newAccessToken)));
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(@RequestHeader("Authorization") String authHeader, @RequestBody TokenDto tokenDto) {
        String accessToken = authHeader != null && authHeader.startsWith("Bearer ") ? authHeader.substring(7) : null;
        String refreshToken = tokenDto.getRefreshToken();
        
        // Try to blacklist tokens in Redis if available
        try {
            if (redisTemplate != null) {
                if (accessToken != null) {
                    redisTemplate.opsForValue().set("BLACKLIST:" + accessToken, "true");
                }
                if (refreshToken != null) {
                    redisTemplate.opsForValue().set("BLACKLIST:" + refreshToken, "true");
                }
            }
        } catch (Exception e) {
            log.warn("Redis connection failed for token blacklisting, logout still successful: {}", e.getMessage());
        }
        
        return ResponseEntity.ok(Map.of("success", true, "message", "Logged out successfully"));
    }
}
