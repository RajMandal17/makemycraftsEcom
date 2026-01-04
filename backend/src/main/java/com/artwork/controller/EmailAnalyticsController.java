package com.artwork.controller;

import com.artwork.service.EmailAnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin/email-analytics")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class EmailAnalyticsController {

    private final EmailAnalyticsService emailAnalyticsService;

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getEmailStats(
            @RequestParam(defaultValue = "24") int hours) {
        return ResponseEntity.ok(emailAnalyticsService.getEmailStats(hours));
    }

    @GetMapping("/failed")
    public ResponseEntity<?> getFailedEmails() {
        return ResponseEntity.ok(emailAnalyticsService.getFailedEmails());
    }

    @GetMapping("/history/{email}")
    public ResponseEntity<?> getEmailHistory(@PathVariable String email) {
        return ResponseEntity.ok(emailAnalyticsService.getEmailHistory(email));
    }
}
