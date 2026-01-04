package com.artwork.config;

import com.artwork.security.CustomOAuth2UserService;
import com.artwork.security.CustomOidcUserService;
import com.artwork.security.JwtAuthenticationFilter;
import com.artwork.security.CustomUserDetailsService;
import com.artwork.security.OAuth2AuthenticationFailureHandler;
import com.artwork.security.OAuth2AuthenticationSuccessHandler;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import jakarta.servlet.http.HttpServletResponse;

@Configuration
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {
    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final CustomUserDetailsService userDetailsService;
    private final BCryptPasswordEncoder passwordEncoder;
    private final com.artwork.config.RateLimitFilter rateLimitFilter;
    
    // OAuth2 components
    private final CustomOAuth2UserService customOAuth2UserService;
    private final CustomOidcUserService customOidcUserService;
    private final OAuth2AuthenticationSuccessHandler oAuth2AuthenticationSuccessHandler;
    private final OAuth2AuthenticationFailureHandler oAuth2AuthenticationFailureHandler;
    
    @org.springframework.beans.factory.annotation.Value("${cors.allowed-origins}")
    private String corsAllowedOrigins;
    
    @Bean
    public org.springframework.web.cors.CorsConfigurationSource corsConfigurationSource() {
        org.springframework.web.cors.CorsConfiguration configuration = new org.springframework.web.cors.CorsConfiguration();
        configuration.setAllowedOrigins(java.util.Arrays.asList(corsAllowedOrigins.split(",")));
        configuration.setAllowedMethods(java.util.Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        configuration.setAllowedHeaders(java.util.Arrays.asList("Authorization", "Cache-Control", "Content-Type", "Accept", "Origin", "X-Requested-With"));
        configuration.setAllowCredentials(true);
        configuration.setExposedHeaders(java.util.Arrays.asList("Authorization"));
        configuration.setMaxAge(3600L);
        
        org.springframework.web.cors.UrlBasedCorsConfigurationSource source = new org.springframework.web.cors.UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf
                // Disable CSRF for authentication endpoints and API endpoints using JWT
                .ignoringRequestMatchers(
                    "/api/auth/**", 
                    "/api/artworks", 
                    "/api/artists/**", 
                    "/api/categories/**", // Category API endpoints are public
                    "/api/health/**", 
                    "/health",
                    "/actuator/**",
                    "/oauth2/**",  // OAuth2 endpoints
                    "/login/oauth2/**",  // OAuth2 callback endpoints
                    "/api/oauth2/**", // OAuth2 API endpoints
                    "/api/v1/artwork-query/**", // CQRS read-only endpoints are safe from CSRF
                    "/api/users/**", // User API endpoints use JWT authentication
                    "/api/cart/**", // Cart API endpoints use JWT authentication
                    "/api/orders/**", // Order API endpoints use JWT authentication
                    "/api/wishlist/**", // Wishlist API endpoints use JWT authentication
                    "/api/dashboard/**", // Dashboard API endpoints use JWT authentication
                    "/api/suggestions/**", // AI Suggestion API endpoints use JWT authentication
                    "/api/admin/**", // Admin API endpoints use JWT authentication
                    "/api/v1/admin/**", // Admin API v1 endpoints use JWT authentication
                    "/api/artist/**", // Artist API endpoints use JWT authentication
                    "/api/files/**", // File upload endpoints use JWT authentication
                    "/api/payment/**", // Payment API endpoints use JWT authentication
                    "/api/webhooks/**", // Webhook endpoints from payment gateways
                    "/api/internal/**", // Internal service-to-service endpoints
                    "/api/test/**", // Email testing endpoints
                    "/api/reviews/**", // Review endpoints use JWT authentication
                    "/ws/**" // WebSocket endpoints
                )
                // Enable CSRF for web form endpoints (if any)
                .csrfTokenRepository(new org.springframework.security.web.csrf.CookieCsrfTokenRepository())
            )
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                // Public endpoints
                .requestMatchers("/", "/api/auth/login", "/api/auth/register", "/api/auth/forgot-password", "/api/auth/reset-password", "/swagger-ui.html", "/swagger-ui/**", "/api-docs/**").permitAll()
                .requestMatchers("/api/health/**", "/health", "/actuator/health", "/actuator/**").permitAll() // Allow Railway health checks
                .requestMatchers("/api/test/**").permitAll() // Email testing endpoints
                .requestMatchers("/api/home/**").permitAll() // Allow public access to home page statistics
                .requestMatchers("/uploads/**").permitAll() // Allow public access to uploaded images
                .requestMatchers("/api/artworks").permitAll() // Allow public access to list artworks
                .requestMatchers("/api/artworks/{id:[\\w-]+}").permitAll() // Public access to view single artwork
                .requestMatchers("/api/artworks/artist/**").permitAll() // Public access to artist's artworks gallery
                .requestMatchers("/api/artists/**").permitAll() // Public access to artists
                .requestMatchers("/api/categories/**").permitAll() // Public access to categories
                .requestMatchers("/api/reviews/artwork/**").permitAll() // Public access to view artwork reviews
                // SEO endpoints - must be publicly accessible for search engines
                .requestMatchers("/sitemap.xml").permitAll() // Sitemap for search engines
                .requestMatchers("/robots.txt").permitAll() // Robots.txt for search engines
                // OAuth2 endpoints
                .requestMatchers("/oauth2/**", "/login/oauth2/**", "/api/oauth2/**").permitAll()
                // CQRS query endpoints (read-only, public access)
                .requestMatchers("/api/v1/artwork-query/**").permitAll() // Public access to all query endpoints
                // Webhook endpoints (for payment gateway callbacks)
                .requestMatchers("/api/webhooks/**").permitAll() // Razorpay webhooks don't have JWT
                // WebSocket endpoints (for real-time notifications)
                .requestMatchers("/ws/**").permitAll() // WebSocket/SockJS endpoints
                
                // Auth verification endpoint - requires authentication but doesn't check role
                .requestMatchers("/api/auth/verify").authenticated()
                
                // Debug endpoint for troubleshooting authentication issues
                .requestMatchers("/api/debug/**").authenticated()
                
                // Role-specific endpoints
                .requestMatchers("/api/artworks/my-artworks").hasAuthority("ROLE_ARTIST") // Only artists can access their own artworks
                .requestMatchers("/api/artist/**").hasAuthority("ROLE_ARTIST") // Artist-specific API endpoints
                .requestMatchers("/api/orders/**").hasAnyAuthority("ROLE_CUSTOMER", "ROLE_ARTIST") // Allow both customers and artists to access orders
                .requestMatchers("/api/cart/**").hasAuthority("ROLE_CUSTOMER") // Cart access for customers only
                .requestMatchers("/api/wishlist/**").hasAuthority("ROLE_CUSTOMER") // Wishlist access for customers only
                .requestMatchers("/api/users/**").authenticated() // User profile access requires authentication
                .requestMatchers("/api/dashboard/artist/**").hasAuthority("ROLE_ARTIST") // Artist dashboard access
                .requestMatchers("/api/dashboard/admin/**").hasAuthority("ROLE_ADMIN") // Admin dashboard access
                .requestMatchers("/api/dashboard/customer/**").hasAuthority("ROLE_CUSTOMER") // Customer dashboard access
                .requestMatchers(org.springframework.http.HttpMethod.POST, "/api/artworks").hasAnyAuthority("ROLE_ARTIST", "ROLE_ADMIN") // Create artwork
                .requestMatchers("/api/files/**").authenticated() // File upload requires authentication
                
                // Payment endpoints - role-based access
                .requestMatchers("/api/payment/create", "/api/payment/verify").authenticated() // Payment creation/verification
                .requestMatchers("/api/payment/*/refund", "/api/payment/analytics").hasAuthority("ROLE_ADMIN") // Admin only
                .requestMatchers("/api/payment/kyc/**").hasAnyAuthority("ROLE_ARTIST", "ROLE_ADMIN") // KYC for artists and admin
                .requestMatchers("/api/payment/bank-accounts/**").hasAnyAuthority("ROLE_ARTIST", "ROLE_ADMIN") // Bank accounts for artists
                .requestMatchers("/api/payment/payouts/**").hasAnyAuthority("ROLE_ARTIST", "ROLE_ADMIN") // Payouts for artists
                
                // All other endpoints require authentication
                .anyRequest().authenticated()
            )
            // Disable form login
            .formLogin(form -> form.disable())
            // OAuth2 Login Configuration
            .oauth2Login(oauth2 -> oauth2
                .authorizationEndpoint(authorization -> 
                    authorization.baseUri("/oauth2/authorization"))
                .redirectionEndpoint(redirection -> 
                    redirection.baseUri("/login/oauth2/code/*"))
                .userInfoEndpoint(userInfo -> {
                    userInfo.userService(customOAuth2UserService);
                    userInfo.oidcUserService(customOidcUserService);
                })
                .successHandler(oAuth2AuthenticationSuccessHandler)
                .failureHandler(oAuth2AuthenticationFailureHandler)
            )
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
            .addFilterBefore(rateLimitFilter, JwtAuthenticationFilter.class)
            // Custom exception handling to prevent redirect to /login
            .exceptionHandling(exceptions -> exceptions
                .authenticationEntryPoint((request, response, authException) -> {
                    // For OAuth2 related requests, return 401 instead of redirect
                    if (request.getRequestURI().startsWith("/oauth2/") || 
                        request.getRequestURI().startsWith("/login/oauth2/")) {
                        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                        response.getWriter().write("{\"error\":\"Unauthorized\"}");
                    } else {
                        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                        response.getWriter().write("{\"error\":\"Authentication required\"}");
                    }
                })
            );
        return http.build();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }
}
