package com.artwork.security;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationFailureHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;


@Component
@Slf4j
public class OAuth2AuthenticationFailureHandler extends SimpleUrlAuthenticationFailureHandler {
    
    @Value("${app.oauth2.authorized-redirect-uri:https://makemycrafts.com/auth/oauth2/callback}")
    private String redirectUri;
    
    @Override
    public void onAuthenticationFailure(HttpServletRequest request, HttpServletResponse response,
                                        AuthenticationException exception) throws IOException {
        
        log.error("OAuth2 authentication failed: {}", exception.getMessage());
        
        String targetUrl = UriComponentsBuilder.fromUriString(redirectUri)
            .queryParam("error", "oauth2_error")
            .queryParam("message", exception.getLocalizedMessage())
            .build()
            .toUriString();
        
        getRedirectStrategy().sendRedirect(request, response, targetUrl);
    }
}
