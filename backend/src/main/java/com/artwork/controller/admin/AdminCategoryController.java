package com.artwork.controller.admin;

import com.artwork.dto.AdminCategoryDto;
import com.artwork.dto.CategoryCreateRequest;
import com.artwork.dto.CategoryUpdateRequest;
import com.artwork.service.admin.AdminCategoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;


@RestController
@RequestMapping({"/api/admin/categories", "/api/v1/admin/categories"})
@RequiredArgsConstructor
@Slf4j
public class AdminCategoryController {
    
    private final AdminCategoryService adminCategoryService;
    
    
    
    
    
    
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping
    public ResponseEntity<Map<String, Object>> getAllCategories(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int limit) {
        
        log.info("Admin request to get all categories - page: {}, limit: {}", page, limit);
        
        Page<AdminCategoryDto> categories = adminCategoryService.getAllCategories(page, limit);
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Categories retrieved successfully");
        response.put("data", Map.of(
            "categories", categories.getContent(),
            "total", categories.getTotalElements(),
            "totalPages", categories.getTotalPages(),
            "currentPage", categories.getNumber() + 1
        ));
        
        return ResponseEntity.ok(response);
    }
    
    
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/list")
    public ResponseEntity<Map<String, Object>> getAllCategoriesList() {
        log.info("Admin request to get all categories as list");
        
        List<AdminCategoryDto> categories = adminCategoryService.getAllCategoriesList();
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Categories retrieved successfully");
        response.put("data", Map.of(
            "categories", categories,
            "count", categories.size()
        ));
        
        return ResponseEntity.ok(response);
    }
    
    
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/active")
    public ResponseEntity<Map<String, Object>> getActiveCategories(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int limit) {
        
        log.info("Admin request to get active categories");
        
        Page<AdminCategoryDto> categories = adminCategoryService.getActiveCategories(page, limit);
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Active categories retrieved successfully");
        response.put("data", Map.of(
            "categories", categories.getContent(),
            "total", categories.getTotalElements(),
            "totalPages", categories.getTotalPages(),
            "currentPage", categories.getNumber() + 1
        ));
        
        return ResponseEntity.ok(response);
    }
    
    
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/deleted")
    public ResponseEntity<Map<String, Object>> getDeletedCategories() {
        log.info("Admin request to get deleted categories");
        
        List<AdminCategoryDto> categories = adminCategoryService.getDeletedCategories();
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Deleted categories retrieved successfully");
        response.put("data", Map.of(
            "categories", categories,
            "count", categories.size()
        ));
        
        return ResponseEntity.ok(response);
    }
    
    
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/search")
    public ResponseEntity<Map<String, Object>> searchCategories(
            @RequestParam String q,
            @RequestParam(defaultValue = "false") boolean includeDeleted) {
        
        log.info("Admin request to search categories with term: {}", q);
        
        List<AdminCategoryDto> categories = adminCategoryService.searchCategories(q, includeDeleted);
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Search completed successfully");
        response.put("data", Map.of(
            "categories", categories,
            "count", categories.size(),
            "searchTerm", q
        ));
        
        return ResponseEntity.ok(response);
    }
    
    
    
    
    
    
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getCategoryById(@PathVariable String id) {
        log.info("Admin request to get category by ID: {}", id);
        
        AdminCategoryDto category = adminCategoryService.getCategoryById(id);
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Category retrieved successfully");
        response.put("data", category);
        
        return ResponseEntity.ok(response);
    }
    
    
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/by-name/{name}")
    public ResponseEntity<Map<String, Object>> getCategoryByName(@PathVariable String name) {
        log.info("Admin request to get category by name: {}", name);
        
        AdminCategoryDto category = adminCategoryService.getCategoryByName(name);
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Category retrieved successfully");
        response.put("data", category);
        
        return ResponseEntity.ok(response);
    }
    
    
    
    
    
    
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public ResponseEntity<Map<String, Object>> createCategory(
            @Valid @RequestBody CategoryCreateRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        
        String adminId = ((com.artwork.security.UserPrincipal) userDetails).getId();
        log.info("Admin {} request to create category: {}", adminId, request.getName());
        
        AdminCategoryDto category = adminCategoryService.createCategory(request, adminId);
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Category created successfully");
        response.put("data", category);
        
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
    
    
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping(value = "/with-image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Map<String, Object>> createCategoryWithImage(
            @RequestPart("category") @Valid CategoryCreateRequest request,
            @RequestPart("image") MultipartFile image,
            @AuthenticationPrincipal UserDetails userDetails) throws IOException {
        
        
        String adminId = ((com.artwork.security.UserPrincipal) userDetails).getId();
        log.info("Admin {} request to create category with image: {}", adminId, request.getName());
        
        
        validateImage(image);
        
        AdminCategoryDto category = adminCategoryService.createCategoryWithImage(request, image, adminId);
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Category with image created successfully");
        response.put("data", category);
        
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
    
    
    
    
    
    
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}")
    public ResponseEntity<Map<String, Object>> updateCategory(
            @PathVariable String id,
            @Valid @RequestBody CategoryUpdateRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        
        String adminId = ((com.artwork.security.UserPrincipal) userDetails).getId();
        log.info("Admin {} request to update category: {}", adminId, id);
        
        AdminCategoryDto category = adminCategoryService.updateCategory(id, request, adminId);
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Category updated successfully");
        response.put("data", category);
        
        return ResponseEntity.ok(response);
    }
    
    
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping(value = "/{id}/with-image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Map<String, Object>> updateCategoryWithImage(
            @PathVariable String id,
            @RequestPart("category") @Valid CategoryUpdateRequest request,
            @RequestPart("image") MultipartFile image,
            @AuthenticationPrincipal UserDetails userDetails) throws IOException {
        
        String adminId = ((com.artwork.security.UserPrincipal) userDetails).getId();
        log.info("Admin {} request to update category with image: {}", adminId, id);
        
        
        validateImage(image);
        
        AdminCategoryDto category = adminCategoryService.updateCategoryWithImage(id, request, image, adminId);
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Category with image updated successfully");
        response.put("data", category);
        
        return ResponseEntity.ok(response);
    }
    
    
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping(value = "/{id}/image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Map<String, Object>> uploadCategoryImage(
            @PathVariable String id,
            @RequestPart("image") MultipartFile image,
            @AuthenticationPrincipal UserDetails userDetails) throws IOException {
        
        String adminId = ((com.artwork.security.UserPrincipal) userDetails).getId();
        log.info("Admin {} request to upload image for category: {}", adminId, id);
        
        
        validateImage(image);
        
        AdminCategoryDto category = adminCategoryService.uploadCategoryImage(id, image, adminId);
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Category image uploaded successfully");
        response.put("data", category);
        
        return ResponseEntity.ok(response);
    }
    
    
    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}/image")
    public ResponseEntity<Map<String, Object>> removeCategoryImage(
            @PathVariable String id,
            @AuthenticationPrincipal UserDetails userDetails) {
        
        String adminId = ((com.artwork.security.UserPrincipal) userDetails).getId();
        log.info("Admin {} request to remove image for category: {}", adminId, id);
        
        AdminCategoryDto category = adminCategoryService.removeCategoryImage(id, adminId);
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Category image removed successfully");
        response.put("data", category);
        
        return ResponseEntity.ok(response);
    }
    
    
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}/toggle")
    public ResponseEntity<Map<String, Object>> toggleCategoryActive(
            @PathVariable String id,
            @AuthenticationPrincipal UserDetails userDetails) {
        
        String adminId = ((com.artwork.security.UserPrincipal) userDetails).getId();
        log.info("Admin {} request to toggle active status for category: {}", adminId, id);
        
        AdminCategoryDto category = adminCategoryService.toggleCategoryActive(id, adminId);
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Category active status toggled successfully");
        response.put("data", category);
        
        return ResponseEntity.ok(response);
    }
    
    
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/reorder")
    public ResponseEntity<Map<String, Object>> reorderCategories(
            @RequestBody List<String> categoryIds,
            @AuthenticationPrincipal UserDetails userDetails) {
        
        String adminId = ((com.artwork.security.UserPrincipal) userDetails).getId();
        log.info("Admin {} request to reorder {} categories", adminId, categoryIds.size());
        
        List<AdminCategoryDto> categories = adminCategoryService.reorderCategories(categoryIds, adminId);
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Categories reordered successfully");
        response.put("data", Map.of(
            "categories", categories,
            "count", categories.size()
        ));
        
        return ResponseEntity.ok(response);
    }
    
    
    
    
    
    
    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> softDeleteCategory(
            @PathVariable String id,
            @AuthenticationPrincipal UserDetails userDetails) {
        
        String adminId = ((com.artwork.security.UserPrincipal) userDetails).getId();
        log.info("Admin {} request to soft delete category: {}", adminId, id);
        
        AdminCategoryDto category = adminCategoryService.softDeleteCategory(id, adminId);
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Category deleted successfully (soft delete)");
        response.put("data", category);
        
        return ResponseEntity.ok(response);
    }
    
    
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}/restore")
    public ResponseEntity<Map<String, Object>> restoreCategory(
            @PathVariable String id,
            @AuthenticationPrincipal UserDetails userDetails) {
        
        String adminId = ((com.artwork.security.UserPrincipal) userDetails).getId();
        log.info("Admin {} request to restore category: {}", adminId, id);
        
        AdminCategoryDto category = adminCategoryService.restoreCategory(id, adminId);
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Category restored successfully");
        response.put("data", category);
        
        return ResponseEntity.ok(response);
    }
    
    
    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}/hard")
    public ResponseEntity<Map<String, Object>> hardDeleteCategory(
            @PathVariable String id,
            @AuthenticationPrincipal UserDetails userDetails) {
        
        String adminId = ((com.artwork.security.UserPrincipal) userDetails).getId();
        log.warn("Admin {} request to PERMANENTLY delete category: {}", adminId, id);
        
        adminCategoryService.hardDeleteCategory(id, adminId);
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Category permanently deleted");
        
        return ResponseEntity.ok(response);
    }
    
    
    
    
    
    
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getCategoryStats() {
        log.info("Admin request to get category statistics");
        
        Map<String, Object> stats = adminCategoryService.getCategoryStats();
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Category statistics retrieved successfully");
        response.put("data", stats);
        
        return ResponseEntity.ok(response);
    }
    
    
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/check-name")
    public ResponseEntity<Map<String, Object>> checkNameAvailability(
            @RequestParam String name,
            @RequestParam(required = false) String excludeId) {
        
        log.info("Admin request to check name availability: {}", name);
        
        boolean available = adminCategoryService.isNameAvailable(name, excludeId);
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", available ? "Name is available" : "Name is already taken");
        response.put("data", Map.of(
            "name", name,
            "available", available
        ));
        
        return ResponseEntity.ok(response);
    }
    
    
    
    
    
    
    private void validateImage(MultipartFile image) {
        if (image == null || image.isEmpty()) {
            throw new IllegalArgumentException("Image file is required");
        }
        
        
        long maxSize = 5L * 1024 * 1024; 
        if (image.getSize() > maxSize) {
            throw new IllegalArgumentException("Image file size cannot exceed 5MB");
        }
        
        
        String contentType = image.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new IllegalArgumentException("Only image files are allowed");
        }
        
        
        List<String> allowedTypes = List.of(
            "image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp", "image/svg+xml"
        );
        if (!allowedTypes.contains(contentType.toLowerCase())) {
            throw new IllegalArgumentException("Allowed image types: JPEG, PNG, GIF, WebP, SVG");
        }
    }
}
