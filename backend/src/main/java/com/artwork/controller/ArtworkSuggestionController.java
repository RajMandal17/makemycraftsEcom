package com.artwork.controller;

import com.artwork.dto.AnalysisRequest;
import com.artwork.dto.ArtworkSuggestionDto;
import com.artwork.security.UserPrincipal;
import com.artwork.service.ArtworkSuggestionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * REST Controller for AI-powered artwork suggestions
 * Following Single Responsibility Principle - handles HTTP layer only
 */
@RestController
@RequestMapping("/api/suggestions")
@RequiredArgsConstructor
@Slf4j
public class ArtworkSuggestionController {
    
    private final ArtworkSuggestionService suggestionService;
    
    /**
     * Analyze artwork image and get AI suggestions
     * POST /api/suggestions/analyze
     */
    @PostMapping("/analyze")
    @PreAuthorize("hasRole('ARTIST')")
    public ResponseEntity<?> analyzeArtwork(
            @RequestBody AnalysisRequest request,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        
        try {
            // Set userId from authenticated user
            request.setUserId(userPrincipal.getId());
            
            log.info("Analyzing artwork for user: {}", userPrincipal.getId());
            
            // Check if AI service is available
            if (!suggestionService.isAIServiceAvailable()) {
                return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                    .body(Map.of(
                        "error", "AI service is not available",
                        "message", "Please configure the Gemini API key"
                    ));
            }
            
            // Analyze and save suggestion
            ArtworkSuggestionDto suggestion = suggestionService.analyzeAndSaveSuggestion(request);
            
            return ResponseEntity.ok(suggestion);
            
        } catch (IllegalArgumentException e) {
            log.error("Invalid request: {}", e.getMessage());
            return ResponseEntity.badRequest()
                .body(Map.of("error", e.getMessage()));
                
        } catch (Exception e) {
            log.error("Error analyzing artwork", e);
            
            // Check for specific error messages to return better status codes
            String message = e.getMessage();
            HttpStatus status = HttpStatus.INTERNAL_SERVER_ERROR;
            
            if (message != null) {
                if (message.contains("Invalid Gemini API key") || message.contains("unauthorized")) {
                    status = HttpStatus.UNAUTHORIZED; // Or FORBIDDEN, or SERVICE_UNAVAILABLE depending on perspective
                } else if (message.contains("rate limit")) {
                    status = HttpStatus.TOO_MANY_REQUESTS;
                } else if (message.contains("unavailable")) {
                    status = HttpStatus.SERVICE_UNAVAILABLE;
                }
            }
            
            return ResponseEntity.status(status)
                .body(Map.of(
                    "error", "Failed to analyze artwork",
                    "message", message != null ? message : "Unknown error"
                ));
        }
    }
    
    /**
     * Get suggestion history for current user (paginated)
     * GET /api/suggestions/history?page=0&size=10
     */
    @GetMapping("/history")
    @PreAuthorize("hasRole('ARTIST')")
    public ResponseEntity<?> getSuggestionHistory(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        
        try {
            Page<ArtworkSuggestionDto> suggestions = suggestionService.getSuggestionHistory(
                userPrincipal.getId(), 
                page, 
                size
            );
            
            Map<String, Object> response = new HashMap<>();
            response.put("suggestions", suggestions.getContent());
            response.put("currentPage", suggestions.getNumber());
            response.put("totalItems", suggestions.getTotalElements());
            response.put("totalPages", suggestions.getTotalPages());
            response.put("hasNext", suggestions.hasNext());
            response.put("hasPrevious", suggestions.hasPrevious());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Error fetching suggestion history", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to fetch suggestion history"));
        }
    }
    
    /**
     * Get all suggestions for current user
     * GET /api/suggestions/all
     */
    @GetMapping("/all")
    @PreAuthorize("hasRole('ARTIST')")
    public ResponseEntity<?> getAllSuggestions(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        try {
            List<ArtworkSuggestionDto> suggestions = suggestionService.getAllSuggestionsForUser(
                userPrincipal.getId()
            );
            
            return ResponseEntity.ok(suggestions);
            
        } catch (Exception e) {
            log.error("Error fetching all suggestions", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to fetch suggestions"));
        }
    }
    
    /**
     * Get a specific suggestion by ID
     * GET /api/suggestions/{id}
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ARTIST')")
    public ResponseEntity<?> getSuggestionById(
            @PathVariable String id,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        
        try {
            ArtworkSuggestionDto suggestion = suggestionService.getSuggestionById(
                id, 
                userPrincipal.getId()
            );
            
            return ResponseEntity.ok(suggestion);
            
        } catch (IllegalArgumentException e) {
            log.error("Suggestion not found or unauthorized: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("error", e.getMessage()));
                
        } catch (Exception e) {
            log.error("Error fetching suggestion", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to fetch suggestion"));
        }
    }
    
    /**
     * Mark a suggestion as applied
     * POST /api/suggestions/{id}/apply
     */
    @PostMapping("/{id}/apply")
    @PreAuthorize("hasRole('ARTIST')")
    public ResponseEntity<?> applySuggestion(
            @PathVariable String id,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        
        try {
            suggestionService.markAsApplied(id, userPrincipal.getId());
            
            return ResponseEntity.ok(Map.of(
                "message", "Suggestion applied successfully",
                "suggestionId", id
            ));
            
        } catch (IllegalArgumentException e) {
            log.error("Suggestion not found or unauthorized: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("error", e.getMessage()));
                
        } catch (Exception e) {
            log.error("Error applying suggestion", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to apply suggestion"));
        }
    }
    
    /**
     * Delete a suggestion
     * DELETE /api/suggestions/{id}
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ARTIST')")
    public ResponseEntity<?> deleteSuggestion(
            @PathVariable String id,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        
        try {
            suggestionService.deleteSuggestion(id, userPrincipal.getId());
            
            return ResponseEntity.ok(Map.of(
                "message", "Suggestion deleted successfully",
                "suggestionId", id
            ));
            
        } catch (IllegalArgumentException e) {
            log.error("Suggestion not found or unauthorized: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("error", e.getMessage()));
                
        } catch (Exception e) {
            log.error("Error deleting suggestion", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to delete suggestion"));
        }
    }
    
    /**
     * Get suggestion statistics for current user
     * GET /api/suggestions/stats
     */
    @GetMapping("/stats")
    @PreAuthorize("hasRole('ARTIST')")
    public ResponseEntity<?> getUserStats(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        try {
            ArtworkSuggestionService.SuggestionStats stats = suggestionService.getUserStats(
                userPrincipal.getId()
            );
            
            Map<String, Object> response = new HashMap<>();
            response.put("totalSuggestions", stats.totalSuggestions());
            response.put("appliedSuggestions", stats.appliedSuggestions());
            response.put("appliedPercentage", stats.getAppliedPercentage());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Error fetching stats", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to fetch statistics"));
        }
    }
    
    /**
     * Check AI service status
     * GET /api/suggestions/status
     */
    @GetMapping("/status")
    @PreAuthorize("hasRole('ARTIST')")
    public ResponseEntity<?> getServiceStatus() {
        Map<String, Object> status = new HashMap<>();
        status.put("available", suggestionService.isAIServiceAvailable());
        status.put("provider", suggestionService.getAIProviderName());
        
        return ResponseEntity.ok(status);
    }
}
