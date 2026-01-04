package com.artwork.filter;

import com.artwork.config.RateLimitConfig;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.ConsumptionProbe;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Map;

@Component
@RequiredArgsConstructor
public class RateLimitFilter extends OncePerRequestFilter {

    private final RateLimitConfig rateLimitConfig;
    private final ObjectMapper objectMapper;
    
    private final String[] rateLimit = {
        "/api/auth/login",
        "/api/auth/register"
    };

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, 
                                   FilterChain filterChain) throws ServletException, IOException {
        String path = request.getRequestURI();
        
        
        boolean shouldRateLimit = false;
        for (String endpoint : rateLimit) {
            if (path.startsWith(endpoint)) {
                shouldRateLimit = true;
                break;
            }
        }
        
        if (!shouldRateLimit) {
            filterChain.doFilter(request, response);
            return;
        }

        
        String clientIP = getClientIP(request);
        Bucket bucket = rateLimitConfig.resolveBucket(clientIP);
        ConsumptionProbe probe = bucket.tryConsumeAndReturnRemaining(1);

        if (probe.isConsumed()) {
            
            response.addHeader("X-Rate-Limit-Remaining", String.valueOf(probe.getRemainingTokens()));
            response.addHeader("X-Rate-Limit-Reset", String.valueOf(probe.getNanosToWaitForRefill() / 1_000_000_000));
            
            filterChain.doFilter(request, response);
        } else {
            
            response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
            response.setContentType("application/json");
            
            Map<String, Object> errorResponse = Map.of(
                "status", HttpStatus.TOO_MANY_REQUESTS.value(),
                "error", "Too Many Requests",
                "message", "Too many login attempts. Please try again later.",
                "retryAfter", probe.getNanosToWaitForRefill() / 1_000_000_000
            );
            
            response.getWriter().write(objectMapper.writeValueAsString(errorResponse));
        }
    }
    
    private String getClientIP(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
