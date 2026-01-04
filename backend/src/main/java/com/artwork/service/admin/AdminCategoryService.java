package com.artwork.service.admin;

import com.artwork.dto.AdminCategoryDto;
import com.artwork.dto.CategoryCreateRequest;
import com.artwork.dto.CategoryUpdateRequest;
import org.springframework.data.domain.Page;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

/**
 * Service interface for admin category management operations
 * Provides CRUD operations with soft delete support
 * 
 * @author System
 * @since 1.0
 */
public interface AdminCategoryService {
    
    // ============================================
    // Create Operations
    // ============================================
    
    /**
     * Create a new category
     * 
     * @param request Category creation request with validation
     * @param adminId ID of the admin creating the category
     * @return Created category DTO
     * @throws com.artwork.exception.DuplicateCategoryException if name already exists
     */
    AdminCategoryDto createCategory(CategoryCreateRequest request, String adminId);
    
    /**
     * Create a new category with image upload
     * 
     * @param request Category creation request
     * @param image Category icon image file
     * @param adminId ID of the admin creating the category
     * @return Created category DTO
     * @throws IOException if image upload fails
     * @throws com.artwork.exception.DuplicateCategoryException if name already exists
     */
    AdminCategoryDto createCategoryWithImage(CategoryCreateRequest request, MultipartFile image, String adminId) throws IOException;
    
    // ============================================
    // Read Operations
    // ============================================
    
    /**
     * Get all categories (including soft-deleted) with pagination
     * For admin view
     * 
     * @param page Page number (0-indexed)
     * @param limit Number of items per page
     * @return Page of admin category DTOs
     */
    Page<AdminCategoryDto> getAllCategories(int page, int limit);
    
    /**
     * Get all categories as a list (including soft-deleted)
     * 
     * @return List of all admin category DTOs
     */
    List<AdminCategoryDto> getAllCategoriesList();
    
    /**
     * Get only active (not deleted) categories with pagination
     * 
     * @param page Page number (0-indexed)
     * @param limit Number of items per page
     * @return Page of active admin category DTOs
     */
    Page<AdminCategoryDto> getActiveCategories(int page, int limit);
    
    /**
     * Get only active categories as a list
     * 
     * @return List of active admin category DTOs
     */
    List<AdminCategoryDto> getActiveCategoriesList();
    
    /**
     * Get only soft-deleted categories
     * 
     * @return List of deleted admin category DTOs
     */
    List<AdminCategoryDto> getDeletedCategories();
    
    /**
     * Get a specific category by ID
     * 
     * @param categoryId Category ID
     * @return Admin category DTO
     * @throws com.artwork.exception.ResourceNotFoundException if category not found
     */
    AdminCategoryDto getCategoryById(String categoryId);
    
    /**
     * Get a specific category by name
     * 
     * @param name Category name
     * @return Admin category DTO
     * @throws com.artwork.exception.ResourceNotFoundException if category not found
     */
    AdminCategoryDto getCategoryByName(String name);
    
    /**
     * Search categories by name or display name
     * 
     * @param searchTerm Search term
     * @param includeDeleted Whether to include soft-deleted categories
     * @return List of matching admin category DTOs
     */
    List<AdminCategoryDto> searchCategories(String searchTerm, boolean includeDeleted);
    
    // ============================================
    // Update Operations
    // ============================================
    
    /**
     * Update an existing category
     * 
     * @param categoryId Category ID to update
     * @param request Update request with new values
     * @param adminId ID of the admin performing the update
     * @return Updated admin category DTO
     * @throws com.artwork.exception.ResourceNotFoundException if category not found
     * @throws com.artwork.exception.DuplicateCategoryException if new name already exists
     */
    AdminCategoryDto updateCategory(String categoryId, CategoryUpdateRequest request, String adminId);
    
    /**
     * Update category with new image
     * 
     * @param categoryId Category ID to update
     * @param request Update request with new values
     * @param image New category icon image
     * @param adminId ID of the admin performing the update
     * @return Updated admin category DTO
     * @throws IOException if image upload fails
     */
    AdminCategoryDto updateCategoryWithImage(String categoryId, CategoryUpdateRequest request, MultipartFile image, String adminId) throws IOException;
    
    /**
     * Upload/update category image only
     * 
     * @param categoryId Category ID
     * @param image New image file
     * @param adminId ID of the admin performing the upload
     * @return Updated admin category DTO
     * @throws IOException if upload fails
     */
    AdminCategoryDto uploadCategoryImage(String categoryId, MultipartFile image, String adminId) throws IOException;
    
    /**
     * Remove category image
     * 
     * @param categoryId Category ID
     * @param adminId ID of the admin performing the removal
     * @return Updated admin category DTO
     */
    AdminCategoryDto removeCategoryImage(String categoryId, String adminId);
    
    /**
     * Toggle category active status
     * 
     * @param categoryId Category ID
     * @param adminId ID of the admin performing the toggle
     * @return Updated admin category DTO
     */
    AdminCategoryDto toggleCategoryActive(String categoryId, String adminId);
    
    /**
     * Activate a category by name
     * Used when approving artworks with pending categories
     * 
     * @param categoryName Category name to activate
     * @param adminId ID of the admin performing the activation
     * @return true if category was activated or already active, false if not found
     */
    boolean activateCategoryByName(String categoryName, String adminId);
    
    /**
     * Update display order for a category
     * 
     * @param categoryId Category ID
     * @param newOrder New display order
     * @param adminId ID of the admin performing the update
     * @return Updated admin category DTO
     */
    AdminCategoryDto updateDisplayOrder(String categoryId, Integer newOrder, String adminId);
    
    /**
     * Reorder multiple categories
     * 
     * @param categoryIds List of category IDs in desired order
     * @param adminId ID of the admin performing the reorder
     * @return List of updated admin category DTOs
     */
    List<AdminCategoryDto> reorderCategories(List<String> categoryIds, String adminId);
    
    // ============================================
    // Delete Operations
    // ============================================
    
    /**
     * Soft delete a category (mark as deleted but retain data)
     * 
     * @param categoryId Category ID to delete
     * @param adminId ID of the admin performing the deletion
     * @return Deleted admin category DTO
     * @throws com.artwork.exception.ResourceNotFoundException if category not found
     */
    AdminCategoryDto softDeleteCategory(String categoryId, String adminId);
    
    /**
     * Restore a soft-deleted category
     * 
     * @param categoryId Category ID to restore
     * @param adminId ID of the admin performing the restoration
     * @return Restored admin category DTO
     * @throws com.artwork.exception.ResourceNotFoundException if category not found
     */
    AdminCategoryDto restoreCategory(String categoryId, String adminId);
    
    /**
     * Permanently delete a category (hard delete)
     * WARNING: This cannot be undone
     * 
     * @param categoryId Category ID to permanently delete
     * @param adminId ID of the admin performing the deletion
     * @throws com.artwork.exception.ResourceNotFoundException if category not found
     */
    void hardDeleteCategory(String categoryId, String adminId);
    
    // ============================================
    // Statistics Operations
    // ============================================
    
    /**
     * Get category statistics summary
     * 
     * @return Map containing category statistics
     */
    java.util.Map<String, Object> getCategoryStats();
    
    /**
     * Check if a category name is available
     * 
     * @param name Category name to check
     * @param excludeId Optional category ID to exclude (for updates)
     * @return true if name is available
     */
    boolean isNameAvailable(String name, String excludeId);
}
