package com.artwork.controller;

import com.artwork.service.ai.IArtworkAnalysisService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

/**
 * Diagnostic controller to check Gemini AI configuration
 * Helps troubleshoot AI service issues without making actual API calls
 */
@RestController
@RequestMapping("/api/diagnostic")
@RequiredArgsConstructor
public class GeminiDiagnosticController {
    
    private final IArtworkAnalysisService artworkAnalysisService;
    
    @Value("${gemini.enabled:false}")
    private boolean geminiEnabled;
    
    @Value("${gemini.api.key:not-set}")
    private String apiKey;
    
    @Value("${gemini.model:not-set}")
    private String model;
    
    @Value("${gemini.api.url:not-set}")
    private String apiUrl;
    
    /**
     * Check Gemini AI configuration status
     * GET /api/diagnostic/gemini
     */
    @GetMapping("/gemini")
    @PreAuthorize("hasRole('ARTIST')")
    public ResponseEntity<?> checkGeminiConfig() {
        Map<String, Object> diagnostic = new HashMap<>();
        
        boolean hasKey = apiKey != null && 
                        !apiKey.equals("not-configured") && 
                        !apiKey.equals("not-set");
        
        diagnostic.put("geminiEnabled", geminiEnabled);
        diagnostic.put("hasApiKey", hasKey);
        diagnostic.put("apiKeyPrefix", hasKey && apiKey.length() > 4 ? apiKey.substring(0, 4) : "N/A");
        diagnostic.put("apiKeyLength", apiKey != null ? apiKey.length() : 0);
        diagnostic.put("apiKeyStartsWithAIza", hasKey && apiKey.startsWith("AIza"));
        diagnostic.put("model", model);
        diagnostic.put("apiUrl", apiUrl);
        diagnostic.put("serviceAvailable", artworkAnalysisService.isAvailable());
        diagnostic.put("providerName", artworkAnalysisService.getProviderName());
        
        // Add recommendations
        if (!artworkAnalysisService.isAvailable()) {
            if (!geminiEnabled) {
                diagnostic.put("issue", "Gemini is disabled. Set GEMINI_ENABLED=true in environment variables.");
            } else if (!hasKey) {
                diagnostic.put("issue", "API key not configured. Set GEMINI_API_KEY in environment variables.");
            } else if (!apiKey.startsWith("AIza")) {
                diagnostic.put("issue", "API key format invalid. Google Gemini keys should start with 'AIza'.");
            }
        } else {
            diagnostic.put("status", "✅ Gemini AI service is properly configured and available!");
        }
        
        return ResponseEntity.ok(diagnostic);
    }
}
