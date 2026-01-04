package com.artwork.service;

import com.artwork.dto.CategoryStatsDto;
import com.artwork.dto.PublicCategoryDto;

import java.util.List;

/**
 * Service interface for category-related operations
 * Follows Single Responsibility Principle - handles only category logic
 */
public interface CategoryService {
    
    /**
     * Get top N selling categories based on sales count
     * 
     * @param limit Maximum number of categories to return
     * @return List of category statistics ordered by sales count
     */
    List<CategoryStatsDto> getTopSellingCategories(int limit);
    
    /**
     * Get all unique category names from database
     * Returns only active, non-deleted categories
     * 
     * @return List of all category names
     */
    List<String> getAllCategories();
    
    /**
     * Get all active categories with full details
     * Used for category dropdowns in artwork creation/editing
     * Returns only active, non-deleted categories approved by admin
     * 
     * @return List of active categories with full details
     */
    List<PublicCategoryDto> getActiveCategories();
    
    /**
     * Check if a category name is valid (exists and is active)
     * Used for validating artwork creation/update requests
     * 
     * @param categoryName Category name to validate
     * @return true if category exists and is active, false otherwise
     */
    boolean isValidActiveCategory(String categoryName);
    
    /**
     * Get statistics for a specific category
     * 
     * @param categoryName Category name
     * @return Category statistics
     */
    CategoryStatsDto getCategoryStats(String categoryName);
    
    /**
     * Register a new category if it doesn't exist
     * New categories are created as INACTIVE and require admin approval
     * If category already exists, returns whether it's currently active
     * 
     * @param categoryName Category name to register
     * @param createdBy User ID who is creating this category (optional)
     * @return true if category is active (can be used), false if inactive (needs admin approval)
     */
    boolean registerCategoryIfNew(String categoryName, String createdBy);
}
