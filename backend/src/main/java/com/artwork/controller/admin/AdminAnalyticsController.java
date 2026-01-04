package com.artwork.controller.admin;

import com.artwork.service.admin.AdminAnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping({"/api/admin/analytics", "/api/v1/admin/dashboard"})
@RequiredArgsConstructor
public class AdminAnalyticsController {
    
    private final AdminAnalyticsService adminAnalyticsService;

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping({"", "/overview"})
    public ResponseEntity<?> getAnalytics() {
        Map<String, Object> analytics = adminAnalyticsService.getAnalytics();
        Map<String, Object> response = new HashMap<>();
        response.put("data", analytics);
        response.put("message", "Analytics retrieved successfully");
        response.put("success", true);
        return ResponseEntity.ok(response);
    }
}
