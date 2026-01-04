package com.artwork.security;

import com.artwork.entity.User;
import com.artwork.repository.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

/**
 * Handles successful OAuth2 authentication
 * Generates JWT token and redirects to frontend with the token
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class OAuth2AuthenticationSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {
    
    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;
    
    @Value("${app.oauth2.authorized-redirect-uri:https://makemycrafts.com/auth/oauth2/callback}")
    private String redirectUri;
    
    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                        Authentication authentication) throws IOException {
        
        log.info("OAuth2 authentication success handler triggered for user");
        
        String targetUrl = determineTargetUrl(request, response, authentication);
        log.info("Determined target URL for OAuth2 redirect: {}", targetUrl);
        
        if (response.isCommitted()) {
            log.debug("Response has already been committed. Unable to redirect to {}", targetUrl);
            return;
        }
        
        clearAuthenticationAttributes(request);
        log.info("Redirecting OAuth2 user to: {}", targetUrl);
        getRedirectStrategy().sendRedirect(request, response, targetUrl);
    }
    
    protected String determineTargetUrl(HttpServletRequest request, HttpServletResponse response,
                                        Authentication authentication) {
        
        // Get the OAuth2User (can be CustomOAuth2User or DefaultOidcUser)
        Object principal = authentication.getPrincipal();
        User user;
        
        if (principal instanceof CustomOAuth2User) {
            user = ((CustomOAuth2User) principal).getUser();
        } else if (principal instanceof com.artwork.security.CustomOidcUserService.CustomOidcUser) {
            // For our custom OIDC user wrapper
            user = ((com.artwork.security.CustomOidcUserService.CustomOidcUser) principal).getUser();
        } else if (principal instanceof org.springframework.security.oauth2.core.oidc.user.OidcUser) {
            // Fallback for OIDC providers like Google (should not happen with CustomOidcUserService)
            org.springframework.security.oauth2.core.oidc.user.OidcUser oidcUser = 
                (org.springframework.security.oauth2.core.oidc.user.OidcUser) principal;
            String email = oidcUser.getEmail();
            
            // Fetch user from database
            user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found after OAuth2 authentication"));
        } else {
            throw new RuntimeException("Unknown OAuth2 user type: " + principal.getClass().getName());
        }
        
        log.info("OAuth2 authentication successful for user: {}", user.getEmail());
        
        // Check if user needs to select role
        if (user.getRole() == com.artwork.entity.Role.PENDING) {
            // Generate temporary token for role selection
            Map<String, Object> claims = new HashMap<>();
            claims.put("userId", user.getId());
            claims.put("email", user.getEmail());
            claims.put("tempAuth", true);
            
            String tempToken = jwtUtil.generateToken(
                user.getId(), 
                user.getEmail(), 
                "TEMP", 
                claims
            );
            
            // Redirect to role selection page with user info
            return UriComponentsBuilder.fromUriString(redirectUri.replace("/callback", "/select-role"))
                .queryParam("tempToken", tempToken)
                .queryParam("email", user.getEmail())
                .queryParam("name", user.getFirstName() + " " + user.getLastName())
                .queryParam("provider", user.getOauth2Provider())
                .build()
                .toUriString();
        }
        
        // Existing user or role already selected - generate full tokens
        Map<String, Object> claims = new HashMap<>();
        claims.put("userId", user.getId());
        claims.put("firstName", user.getFirstName());
        claims.put("lastName", user.getLastName());
        
        String accessToken = jwtUtil.generateToken(
            user.getId(), 
            user.getEmail(), 
            user.getRole().name(), 
            claims
        );
        
        String refreshToken = jwtUtil.generateRefreshToken(
            user.getId(), 
            user.getEmail(), 
            user.getRole().name()
        );
        
        // Redirect to OAuth2 callback page with tokens
        // Frontend will handle redirecting to appropriate dashboard based on role
        return UriComponentsBuilder.fromUriString(redirectUri)
            .queryParam("token", accessToken)
            .queryParam("refreshToken", refreshToken)
            .queryParam("role", user.getRole().name())
            .build()
            .toUriString();
    }
    
    /**
     * Determine dashboard path based on user role
     */
    private String getDashboardPathByRole(com.artwork.entity.Role role) {
        return switch (role) {
            case ADMIN -> "/dashboard/admin";
            case ARTIST -> "/dashboard/artist";
            case CUSTOMER -> "/dashboard/customer";
            case PENDING -> "/select-role"; // Should not reach here, but handle just in case
        };
    }
}
