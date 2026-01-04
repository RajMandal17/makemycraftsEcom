package com.artwork.security;

import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import java.io.IOException;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    @Autowired
    private JwtUtil jwtUtil;
    @Autowired
    private CustomUserDetailsService userDetailsService;
    @Autowired(required = false)
    private RedisTemplate<String, String> redisTemplate;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        String requestPath = request.getRequestURI();
        String authHeader = request.getHeader("Authorization");
        String internalServiceHeader = request.getHeader("X-Internal-Service");
        
        // Allow internal service calls to admin endpoints without authentication
        if ("admin-dashboard".equals(internalServiceHeader) && requestPath.startsWith("/api/admin")) {
            System.out.println("Allowing internal service call to: " + requestPath);
            
            // Create a service account user details for internal calls
            ServiceAccountUserDetails serviceUser = new ServiceAccountUserDetails("service-account", "ADMIN");
            UsernamePasswordAuthenticationToken authentication =
                    new UsernamePasswordAuthenticationToken(serviceUser, null, serviceUser.getAuthorities());
            authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
            SecurityContextHolder.getContext().setAuthentication(authentication);
            
            filterChain.doFilter(request, response);
            return;
        }
        
        // Log the request for debugging
        System.out.println("Processing request: " + requestPath + " [Auth: " + (authHeader != null ? "YES" : "NO") + "]");
        
        String token = null;
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            token = authHeader.substring(7);
            System.out.println("JWT token provided: " + token.substring(0, Math.min(20, token.length())) + "...");
        } else {
            System.out.println("No JWT token in request");
        }
        
        if (token != null && jwtUtil.validateToken(token)) {
            System.out.println("Token validation successful");
            
            // Check Redis blacklist (with error handling for Redis connection issues)
            Boolean isBlacklisted = false;
            if (redisTemplate != null) {
                try {
                    isBlacklisted = redisTemplate.hasKey("BLACKLIST:" + token);
                    if (Boolean.TRUE.equals(isBlacklisted)) {
                        System.out.println("Token is blacklisted, rejecting request");
                        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                        return;
                    }
                } catch (Exception e) {
                    // Redis connection issue - log it but continue processing
                    System.out.println("Redis connection error (ignoring for token validation): " + e.getMessage());
                    // We'll assume token is not blacklisted if we can't check
                }
            }
            
            Claims claims = jwtUtil.getClaims(token);
            String userId = claims.getSubject();
            String userRole = (String) claims.get("role");
            
            System.out.println("User ID from token: " + userId);
            System.out.println("User role from token: " + userRole);
            System.out.println("Request path: " + requestPath);
            
            UserDetails userDetails;
            if ("service-account".equals(userId)) {
                // Handle service account authentication
                userDetails = new ServiceAccountUserDetails(userId, userRole);
                System.out.println("Service account authentication: " + userId + " with role: " + userRole);
            } else {
                // Handle regular user authentication
                userDetails = userDetailsService.loadUserById(userId);
            }
            
            // Print detailed authority information for debugging
            System.out.println("Username from UserDetails: " + userDetails.getUsername());
            System.out.println("Authorities from UserDetails: " + userDetails.getAuthorities());
            userDetails.getAuthorities().forEach(auth -> 
                System.out.println("Authority: " + auth.getAuthority()));
            System.out.println("Request requires role 'ROLE_ARTIST'? " + requestPath.contains("/my-artworks"));
            
            UsernamePasswordAuthenticationToken authentication =
                    new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
            authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
            SecurityContextHolder.getContext().setAuthentication(authentication);
            
            System.out.println("Authentication set in SecurityContext");
        } else if (token != null) {
            System.out.println("Token validation failed");
        }
        
        filterChain.doFilter(request, response);
    }
}
