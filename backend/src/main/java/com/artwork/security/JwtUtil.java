package com.artwork.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import java.util.Date;
import java.util.Map;

@Component
public class JwtUtil {
    @Value("${jwt.secret}")
    private String jwtSecret;

    @Value("${jwt.expiration}")
    private long jwtExpirationMs;

    @Value("${jwt.refresh.expiration}")
    private long jwtRefreshExpirationMs;


    public String generateToken(String userId, String email, String role, Map<String, Object> claims) {
        // Ensure role uses the ROLE_ prefix for Spring Security compatibility
        String roleWithPrefix = role.startsWith("ROLE_") ? role : "ROLE_" + role;
        
        return Jwts.builder()
                .setClaims(claims)
                .setSubject(userId)
                .claim("email", email)
                .claim("role", roleWithPrefix)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + jwtExpirationMs))
                .signWith(Keys.hmacShaKeyFor(jwtSecret.getBytes()), SignatureAlgorithm.HS256)
                .compact();
    }

    public String generateRefreshToken(String userId, String email, String role) {
        // Ensure role uses the ROLE_ prefix for Spring Security compatibility
        String roleWithPrefix = role.startsWith("ROLE_") ? role : "ROLE_" + role;
        
        return Jwts.builder()
                .setSubject(userId)
                .claim("email", email)
                .claim("role", roleWithPrefix)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + jwtRefreshExpirationMs))
                .signWith(Keys.hmacShaKeyFor(jwtSecret.getBytes()), SignatureAlgorithm.HS256)
                .compact();
    }

    public boolean validateToken(String token) {
        try {
            Jwts.parserBuilder().setSigningKey(Keys.hmacShaKeyFor(jwtSecret.getBytes())).build().parseClaimsJws(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }

    public Claims getClaims(String token) {
        return Jwts.parserBuilder().setSigningKey(Keys.hmacShaKeyFor(jwtSecret.getBytes())).build().parseClaimsJws(token).getBody();
    }
    
    public String extractUserId(String token) {
        Claims claims = getClaims(token);
        return claims.getSubject();
    }
}
