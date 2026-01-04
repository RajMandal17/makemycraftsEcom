package com.artwork.controller;

import com.artwork.security.UserPrincipal;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.HashMap;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/debug")
public class DebugController {

    @GetMapping("/auth")
    public ResponseEntity<?> debugAuth(@AuthenticationPrincipal UserDetails userDetails) {
        Map<String, Object> response = new HashMap<>();
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        
        if (authentication != null) {
            response.put("isAuthenticated", authentication.isAuthenticated());
            response.put("authType", authentication.getClass().getName());
            response.put("principal", authentication.getPrincipal().toString());
            response.put("authorities", authentication.getAuthorities().stream()
                    .map(GrantedAuthority::getAuthority)
                    .collect(Collectors.toList()));
        } else {
            response.put("isAuthenticated", false);
        }
        
        if (userDetails != null) {
            response.put("userDetails", Map.of(
                "username", userDetails.getUsername(),
                "authorities", userDetails.getAuthorities().stream()
                    .map(GrantedAuthority::getAuthority)
                    .collect(Collectors.toList())
            ));
            
            if (userDetails instanceof UserPrincipal) {
                UserPrincipal principal = (UserPrincipal) userDetails;
                response.put("userId", principal.getUser().getId());
                response.put("userEmail", principal.getUser().getEmail());
                response.put("userRole", principal.getUser().getRole().name());
            }
        }
        
        response.put("tokenInfo", "This endpoint shows if your token is working correctly");
        
        return ResponseEntity.ok(response);
    }
}
