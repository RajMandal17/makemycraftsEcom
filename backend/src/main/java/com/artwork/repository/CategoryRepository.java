package com.artwork.repository;

import com.artwork.entity.Category;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository for Category entity operations
 * Provides CRUD operations and custom queries for category management
 * 
 * @author System
 * @since 1.0
 */
@Repository
public interface CategoryRepository extends JpaRepository<Category, String> {
    
    // ============================================
    // Find by name/slug operations
    // ============================================
    
    /**
     * Find category by name (case-insensitive)
     */
    Optional<Category> findByNameIgnoreCase(String name);
    
    /**
     * Find category by slug
     */
    Optional<Category> findBySlug(String slug);
    
    /**
     * Find category by name or slug (case-insensitive for name)
     */
    @Query("SELECT c FROM Category c WHERE LOWER(c.name) = LOWER(:name) OR c.slug = :slug")
    Optional<Category> findByNameIgnoreCaseOrSlug(@Param("name") String name, @Param("slug") String slug);
    
    // ============================================
    // Existence checks
    // ============================================
    
    /**
     * Check if category with name exists (case-insensitive)
     */
    boolean existsByNameIgnoreCase(String name);
    
    /**
     * Check if category with name exists excluding a specific ID (for updates)
     */
    @Query("SELECT COUNT(c) > 0 FROM Category c WHERE LOWER(c.name) = LOWER(:name) AND c.id != :excludeId")
    boolean existsByNameIgnoreCaseAndIdNot(@Param("name") String name, @Param("excludeId") String excludeId);
    
    /**
     * Check if category with slug exists
     */
    boolean existsBySlug(String slug);
    
    /**
     * Check if category with slug exists excluding a specific ID (for updates)
     */
    @Query("SELECT COUNT(c) > 0 FROM Category c WHERE c.slug = :slug AND c.id != :excludeId")
    boolean existsBySlugAndIdNot(@Param("slug") String slug, @Param("excludeId") String excludeId);
    
    // ============================================
    // Active/Visible category queries
    // ============================================
    
    /**
     * Find all active (not deleted) categories
     */
    List<Category> findByIsDeletedFalseOrderByDisplayOrderAsc();
    
    /**
     * Find all active and visible categories
     */
    List<Category> findByIsDeletedFalseAndIsActiveTrueOrderByDisplayOrderAsc();
    
    /**
     * Find all active categories with pagination
     */
    Page<Category> findByIsDeletedFalse(Pageable pageable);
    
    /**
     * Find all active and visible categories with pagination
     */
    Page<Category> findByIsDeletedFalseAndIsActiveTrue(Pageable pageable);
    
    // ============================================
    // Deleted category queries
    // ============================================
    
    /**
     * Find all soft-deleted categories
     */
    List<Category> findByIsDeletedTrue();
    
    /**
     * Find all soft-deleted categories with pagination
     */
    Page<Category> findByIsDeletedTrue(Pageable pageable);
    
    // ============================================
    // All categories queries (for admin)
    // ============================================
    
    /**
     * Find all categories ordered by display order
     */
    List<Category> findAllByOrderByDisplayOrderAsc();
    
    /**
     * Find all categories with pagination ordered by display order
     */
    Page<Category> findAllByOrderByDisplayOrderAsc(Pageable pageable);
    
    // ============================================
    // Search queries
    // ============================================
    
    /**
     * Search categories by name or display name (case-insensitive)
     */
    @Query("SELECT c FROM Category c WHERE " +
           "(LOWER(c.name) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(c.displayName) LIKE LOWER(CONCAT('%', :search, '%'))) " +
           "AND c.isDeleted = false " +
           "ORDER BY c.displayOrder ASC")
    List<Category> searchByNameOrDisplayName(@Param("search") String search);
    
    /**
     * Search all categories (including deleted) by name or display name
     */
    @Query("SELECT c FROM Category c WHERE " +
           "LOWER(c.name) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(c.displayName) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "ORDER BY c.displayOrder ASC")
    List<Category> searchAllByNameOrDisplayName(@Param("search") String search);
    
    // ============================================
    // Count queries
    // ============================================
    
    /**
     * Count active (not deleted) categories
     */
    long countByIsDeletedFalse();
    
    /**
     * Count active and visible categories
     */
    long countByIsDeletedFalseAndIsActiveTrue();
    
    /**
     * Count soft-deleted categories
     */
    long countByIsDeletedTrue();
    
    // ============================================
    // Category name queries (for backward compatibility)
    // ============================================
    
    /**
     * Get all category names (active only)
     */
    @Query("SELECT c.name FROM Category c WHERE c.isDeleted = false AND c.isActive = true ORDER BY c.displayOrder ASC")
    List<String> findAllActiveNames();
    
    /**
     * Get all display names (active only)
     */
    @Query("SELECT c.displayName FROM Category c WHERE c.isDeleted = false AND c.isActive = true ORDER BY c.displayOrder ASC")
    List<String> findAllActiveDisplayNames();
    
    // ============================================
    // Display order operations
    // ============================================
    
    /**
     * Find the maximum display order
     */
    @Query("SELECT COALESCE(MAX(c.displayOrder), 0) FROM Category c")
    Integer findMaxDisplayOrder();
    
    /**
     * Find categories with display order greater than specified value
     */
    @Query("SELECT c FROM Category c WHERE c.displayOrder > :order ORDER BY c.displayOrder ASC")
    List<Category> findByDisplayOrderGreaterThan(@Param("order") Integer order);
}
