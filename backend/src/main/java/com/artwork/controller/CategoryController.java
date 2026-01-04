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


@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
@Slf4j
public class CategoryController {
    
    private final CategoryService categoryService;
    
    
    @GetMapping("/top-selling")
    public ResponseEntity<Map<String, Object>> getTopSellingCategories( @RequestParam(defaultValue = "10") int limit) {
        
        log.info("Request to get top {} selling categories", limit);
        
        try {
            
            if (limit < 1 || limit > 50) {
                limit = 10; 
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
