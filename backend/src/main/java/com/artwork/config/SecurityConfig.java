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
                
                .ignoringRequestMatchers(
                    "/api/auth/**", 
                    "/api/artworks", 
                    "/api/artists/**", 
                    "/api/categories/**", 
                    "/api/health/**", 
                    "/health",
                    "/actuator/**",
                    "/oauth2/**",  
                    "/login/oauth2/**",  
                    "/api/oauth2/**", 
                    "/api/v1/artwork-query/**", 
                    "/api/users/**", 
                    "/api/cart/**", 
                    "/api/orders/**", 
                    "/api/wishlist/**", 
                    "/api/dashboard/**", 
                    "/api/suggestions/**", 
                    "/api/admin/**", 
                    "/api/v1/admin/**", 
                    "/api/artist/**", 
                    "/api/files/**", 
                    "/api/payment/**", 
                    "/api/webhooks/**", 
                    "/api/internal/**", 
                    "/api/test/**", 
                    "/api/reviews/**", 
                    "/ws/**" 
                )
                
                .csrfTokenRepository(new org.springframework.security.web.csrf.CookieCsrfTokenRepository())
            )
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                
                .requestMatchers("/", "/api/auth/login", "/api/auth/register", "/api/auth/forgot-password", "/api/auth/reset-password", "/swagger-ui.html", "/swagger-ui/**", "/api-docs/**").permitAll()
                .requestMatchers("/api/health/**", "/health", "/actuator/health", "/actuator/**").permitAll() 
                .requestMatchers("/api/test/**").permitAll() 
                .requestMatchers("/api/home/**").permitAll() 
                .requestMatchers("/uploads/**").permitAll() 
                .requestMatchers("/api/artworks").permitAll() 
                .requestMatchers("/api/artworks/{id:[\\w-]+}").permitAll() 
                .requestMatchers("/api/artworks/artist/**").permitAll() 
                .requestMatchers("/api/artists/**").permitAll() 
                .requestMatchers("/api/categories/**").permitAll() 
                .requestMatchers("/api/reviews/artwork/**").permitAll() 
                
                .requestMatchers("/sitemap.xml").permitAll() 
                .requestMatchers("/robots.txt").permitAll() 
                
                .requestMatchers("/oauth2/**", "/login/oauth2/**", "/api/oauth2/**").permitAll()
                
                .requestMatchers("/api/v1/artwork-query/**").permitAll() 
                
                .requestMatchers("/api/webhooks/**").permitAll() 
                
                .requestMatchers("/ws/**").permitAll() 
                
                .requestMatchers("/api/guest/**").permitAll() 
                
                
                .requestMatchers("/api/auth/verify").authenticated()
                
                
                .requestMatchers("/api/debug/**").authenticated()
                
                
                .requestMatchers("/api/artworks/my-artworks").hasAuthority("ROLE_ARTIST") 
                .requestMatchers("/api/artist/**").hasAuthority("ROLE_ARTIST") 
                .requestMatchers("/api/orders/**").hasAnyAuthority("ROLE_CUSTOMER", "ROLE_ARTIST") 
                .requestMatchers("/api/cart/**").hasAuthority("ROLE_CUSTOMER") 
                .requestMatchers("/api/wishlist/**").hasAuthority("ROLE_CUSTOMER") 
                .requestMatchers("/api/users/**").authenticated() 
                .requestMatchers("/api/dashboard/artist/**").hasAuthority("ROLE_ARTIST") 
                .requestMatchers("/api/dashboard/admin/**").hasAuthority("ROLE_ADMIN") 
                .requestMatchers("/api/dashboard/customer/**").hasAuthority("ROLE_CUSTOMER") 
                .requestMatchers(org.springframework.http.HttpMethod.POST, "/api/artworks").hasAnyAuthority("ROLE_ARTIST", "ROLE_ADMIN") 
                .requestMatchers("/api/files/**").authenticated() 
                
                
                .requestMatchers("/api/payment/create", "/api/payment/verify").authenticated() 
                .requestMatchers("/api/payment/*/refund", "/api/payment/analytics").hasAuthority("ROLE_ADMIN") 
                .requestMatchers("/api/payment/kyc/**").hasAnyAuthority("ROLE_ARTIST", "ROLE_ADMIN") 
                .requestMatchers("/api/payment/bank-accounts/**").hasAnyAuthority("ROLE_ARTIST", "ROLE_ADMIN") 
                .requestMatchers("/api/payment/payouts/**").hasAnyAuthority("ROLE_ARTIST", "ROLE_ADMIN") 
                
                
                .anyRequest().authenticated()
            )
            
            .formLogin(form -> form.disable())
            
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
            
            .exceptionHandling(exceptions -> exceptions
                .authenticationEntryPoint((request, response, authException) -> {
                    
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
