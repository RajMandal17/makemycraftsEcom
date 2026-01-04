package com.artwork.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
@Slf4j
public class WebConfig {
    @Value("${cors.allowed-origins:https://makemycrafts.com,https://www.makemycrafts.com,http://localhost:3000,http://localhost:5173}")
    private String allowedOriginsString;

    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(@org.springframework.lang.NonNull CorsRegistry registry) {
                // Split comma-separated origins
                String[] allowedOrigins = allowedOriginsString.split(",");
                
                log.info("Configuring CORS with allowed origins: {}", String.join(", ", allowedOrigins));
                
                registry.addMapping("/api/**")
                        // Use allowedOriginPatterns instead of allowedOrigins when allowCredentials is true
                        .allowedOriginPatterns(allowedOrigins)
                        .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH")
                        .allowedHeaders("Authorization", "Cache-Control", "Content-Type", "Accept", "Origin", "X-Requested-With")
                        .allowCredentials(true)
                        .exposedHeaders("Authorization")
                        .maxAge(3600);
                
                // CORS for WebSocket endpoints
                registry.addMapping("/ws/**")
                        .allowedOriginPatterns("*")
                        .allowedMethods("GET", "POST", "OPTIONS")
                        .allowedHeaders("*")
                        .allowCredentials(true)
                        .maxAge(3600);
            }
        };
    }
}
