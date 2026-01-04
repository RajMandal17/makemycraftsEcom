package com.artwork.controller;

import com.artwork.dto.CategoryStatsDto;
import com.artwork.dto.PublicCategoryDto;
import com.artwork.service.CategoryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * REST Controller for category-related endpoints
 * Provides public APIs for category browsing and statistics
 * Follows RESTful design principles
 */
@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
@Slf4j
public class CategoryController {
    
    private final CategoryService categoryService;
    
    /**
     * Get top selling categories
     * Public endpoint - no authentication required
     * 
     * @param limit Maximum number of categories to return (default: 10)
     * @return Response with top selling categories
     */
    @GetMapping("/top-selling")
    public ResponseEntity<Map<String, Object>> getTopSellingCategories( @RequestParam(defaultValue = "10") int limit) {
        
        log.info("Request to get top {} selling categories", limit);
        
        try {
            // Validate limit
            if (limit < 1 || limit > 50) {
                limit = 10; // Default to 10 if invalid
            }
            
            List<CategoryStatsDto> topCategories = categoryService.getTopSellingCategories(limit);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Top selling categories retrieved successfully");
            response.put("data", Map.of(
                "categories", topCategories,
                "count", topCategories.size(),
                "limit", limit
            ));
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Error fetching top selling categories", e);
            
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Failed to fetch top selling categories");
            errorResponse.put("error", e.getMessage());
            
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }
    
    /**
     * Get all unique categories
     * Public endpoint - no authentication required
     * 
     * @return Response with all categories
     */
    @GetMapping("/all")
    public ResponseEntity<Map<String, Object>> getAllCategories() {
        log.info("Request to get all categories");
        
        try {
            List<String> categories = categoryService.getAllCategories();
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "All categories retrieved successfully");
            response.put("data", Map.of(
                "categories", categories,
                "count", categories.size()
            ));
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Error fetching all categories", e);
            
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Failed to fetch categories");
            errorResponse.put("error", e.getMessage());
            
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }
    
    /**
     * Get all active categories with full details
     * Public endpoint - no authentication required
     * Returns only admin-approved active categories
     * Used for category dropdowns in artwork creation/editing
     * 
     * @return Response with active categories including full details
     */
    @GetMapping("/active")
    public ResponseEntity<Map<String, Object>> getActiveCategories() {
        log.info("Request to get active categories with details");
        
        try {
            List<PublicCategoryDto> categories = categoryService.getActiveCategories();
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Active categories retrieved successfully");
            response.put("data", Map.of(
                "categories", categories,
                "count", categories.size()
            ));
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Error fetching active categories", e);
            
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Failed to fetch active categories");
            errorResponse.put("error", e.getMessage());
            
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }
    
    /**
     * Get statistics for a specific category
     * Public endpoint - no authentication required
     * 
     * @param categoryName Category name
     * @return Response with category statistics
     */
    @GetMapping("/{categoryName}/stats")
    public ResponseEntity<Map<String, Object>> getCategoryStats(
            @PathVariable String categoryName) {
        
        log.info("Request to get stats for category: {}", categoryName);
        
        try {
            CategoryStatsDto stats = categoryService.getCategoryStats(categoryName);
            
            if (stats == null) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("success", false);
                errorResponse.put("message", "Category not found");
                return ResponseEntity.notFound().build();
            }
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Category statistics retrieved successfully");
            response.put("data", stats);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Error fetching category stats for: {}", categoryName, e);
            
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Failed to fetch category statistics");
            errorResponse.put("error", e.getMessage());
            
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }
}
