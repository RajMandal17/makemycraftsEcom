package com.artwork.service.impl.admin;

import com.artwork.dto.AdminCategoryDto;
import com.artwork.dto.CategoryCreateRequest;
import com.artwork.dto.CategoryUpdateRequest;
import com.artwork.entity.Category;
import com.artwork.exception.DuplicateCategoryException;
import com.artwork.exception.ResourceNotFoundException;
import com.artwork.repository.ArtworkRepository;
import com.artwork.repository.CategoryRepository;
import com.artwork.service.CloudStorageService;
import com.artwork.service.admin.AdminCategoryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.modelmapper.ModelMapper;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.Caching;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

/**
 * Implementation of AdminCategoryService
 * Provides full CRUD operations for category management with soft delete support
 * 
 * Features:
 * - CRUD operations with validation
 * - Soft delete and restore functionality
 * - Image upload via CloudStorageService
 * - Caching for performance
 * - Audit trail (created/updated/deleted by)
 * 
 * @author System
 * @since 1.0
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class AdminCategoryServiceImpl implements AdminCategoryService {
    
    private final CategoryRepository categoryRepository;
    private final ArtworkRepository artworkRepository;
    private final CloudStorageService cloudStorageService;
    private final ModelMapper modelMapper;
    
    private static final String CATEGORY_IMAGES_FOLDER = "category-icons";
    
    // ============================================
    // Create Operations
    // ============================================
    
    @Override
    @Caching(evict = {
        @CacheEvict(value = "allCategories", allEntries = true),
        @CacheEvict(value = "topCategories", allEntries = true),
        @CacheEvict(value = "activeCategories", allEntries = true)
    })
    public AdminCategoryDto createCategory(CategoryCreateRequest request, String adminId) {
        log.info("Creating new category: {} by admin: {}", request.getName(), adminId);
        
        // Validate unique name
        validateUniqueName(request.getName(), null);
        
        // Build category entity
        Category category = buildCategoryFromRequest(request, adminId);
        
        // Save and return
        Category savedCategory = categoryRepository.save(category);
        log.info("Category created successfully with ID: {}", savedCategory.getId());
        
        return toAdminDto(savedCategory);
    }
    
    @Override
    @Caching(evict = {
        @CacheEvict(value = "allCategories", allEntries = true),
        @CacheEvict(value = "topCategories", allEntries = true),
        @CacheEvict(value = "activeCategories", allEntries = true)
    })
    public AdminCategoryDto createCategoryWithImage(CategoryCreateRequest request, MultipartFile image, String adminId) throws IOException {
        log.info("Creating new category with image: {} by admin: {}", request.getName(), adminId);
        
        // Validate unique name
        validateUniqueName(request.getName(), null);
        
        // Upload image first
        String imageUrl = uploadImage(image);
        
        // Build category entity
        Category category = buildCategoryFromRequest(request, adminId);
        category.setImageUrl(imageUrl);
        
        // Save and return
        Category savedCategory = categoryRepository.save(category);
        log.info("Category with image created successfully with ID: {}", savedCategory.getId());
        
        return toAdminDto(savedCategory);
    }
    
    // ============================================
    // Read Operations
    // ============================================
    
    @Override
    @Transactional(readOnly = true)
    public Page<AdminCategoryDto> getAllCategories(int page, int limit) {
        log.info("Fetching all categories - page: {}, limit: {}", page, limit);
        
        Pageable pageable = PageRequest.of(page, limit, Sort.by("displayOrder").ascending());
        Page<Category> categories = categoryRepository.findAllByOrderByDisplayOrderAsc(pageable);
        
        return categories.map(this::toAdminDtoWithArtworkCount);
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<AdminCategoryDto> getAllCategoriesList() {
        log.info("Fetching all categories as list");
        
        List<Category> categories = categoryRepository.findAllByOrderByDisplayOrderAsc();
        return categories.stream()
            .map(this::toAdminDtoWithArtworkCount)
            .collect(Collectors.toList());
    }
    
    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "activeCategories", key = "'page_' + #page + '_' + #limit")
    public Page<AdminCategoryDto> getActiveCategories(int page, int limit) {
        log.info("Fetching active categories - page: {}, limit: {}", page, limit);
        
        Pageable pageable = PageRequest.of(page, limit, Sort.by("displayOrder").ascending());
        Page<Category> categories = categoryRepository.findByIsDeletedFalse(pageable);
        
        return categories.map(this::toAdminDtoWithArtworkCount);
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<AdminCategoryDto> getActiveCategoriesList() {
        log.info("Fetching active categories as list");
        
        List<Category> categories = categoryRepository.findByIsDeletedFalseOrderByDisplayOrderAsc();
        return categories.stream()
            .map(this::toAdminDtoWithArtworkCount)
            .collect(Collectors.toList());
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<AdminCategoryDto> getDeletedCategories() {
        log.info("Fetching deleted categories");
        
        List<Category> categories = categoryRepository.findByIsDeletedTrue();
        return categories.stream()
            .map(this::toAdminDtoWithArtworkCount)
            .collect(Collectors.toList());
    }
    
    @Override
    @Transactional(readOnly = true)
    public AdminCategoryDto getCategoryById(String categoryId) {
        log.info("Fetching category by ID: {}", categoryId);
        
        Category category = findCategoryOrThrow(categoryId);
        return toAdminDtoWithArtworkCount(category);
    }
    
    @Override
    @Transactional(readOnly = true)
    public AdminCategoryDto getCategoryByName(String name) {
        log.info("Fetching category by name: {}", name);
        
        Category category = categoryRepository.findByNameIgnoreCase(name)
            .orElseThrow(() -> new ResourceNotFoundException("Category not found with name: " + name));
        
        return toAdminDtoWithArtworkCount(category);
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<AdminCategoryDto> searchCategories(String searchTerm, boolean includeDeleted) {
        log.info("Searching categories with term: {}, includeDeleted: {}", searchTerm, includeDeleted);
        
        List<Category> categories;
        if (includeDeleted) {
            categories = categoryRepository.searchAllByNameOrDisplayName(searchTerm);
        } else {
            categories = categoryRepository.searchByNameOrDisplayName(searchTerm);
        }
        
        return categories.stream()
            .map(this::toAdminDtoWithArtworkCount)
            .collect(Collectors.toList());
    }
    
    // ============================================
    // Update Operations
    // ============================================
    
    @Override
    @Caching(evict = {
        @CacheEvict(value = "allCategories", allEntries = true),
        @CacheEvict(value = "topCategories", allEntries = true),
        @CacheEvict(value = "activeCategories", allEntries = true),
        @CacheEvict(value = "categoryStats", allEntries = true)
    })
    public AdminCategoryDto updateCategory(String categoryId, CategoryUpdateRequest request, String adminId) {
        log.info("Updating category: {} by admin: {}", categoryId, adminId);
        
        Category category = findCategoryOrThrow(categoryId);
        
        // Validate unique name if being changed
        if (request.getName() != null && !request.getName().equalsIgnoreCase(category.getName())) {
            validateUniqueName(request.getName(), categoryId);
        }
        
        // Apply updates
        applyUpdates(category, request, adminId);
        
        // Handle image removal if requested
        if (Boolean.TRUE.equals(request.getRemoveImage()) && category.getImageUrl() != null) {
            deleteExistingImage(category.getImageUrl());
            category.setImageUrl(null);
        }
        
        // Save and return
        Category updatedCategory = categoryRepository.save(category);
        log.info("Category updated successfully: {}", categoryId);
        
        return toAdminDtoWithArtworkCount(updatedCategory);
    }
    
    @Override
    @Caching(evict = {
        @CacheEvict(value = "allCategories", allEntries = true),
        @CacheEvict(value = "topCategories", allEntries = true),
        @CacheEvict(value = "activeCategories", allEntries = true),
        @CacheEvict(value = "categoryStats", allEntries = true)
    })
    public AdminCategoryDto updateCategoryWithImage(String categoryId, CategoryUpdateRequest request, MultipartFile image, String adminId) throws IOException {
        log.info("Updating category with image: {} by admin: {}", categoryId, adminId);
        
        Category category = findCategoryOrThrow(categoryId);
        
        // Validate unique name if being changed
        if (request.getName() != null && !request.getName().equalsIgnoreCase(category.getName())) {
            validateUniqueName(request.getName(), categoryId);
        }
        
        // Delete old image if exists
        if (category.getImageUrl() != null) {
            deleteExistingImage(category.getImageUrl());
        }
        
        // Upload new image
        String imageUrl = uploadImage(image);
        category.setImageUrl(imageUrl);
        
        // Apply other updates
        applyUpdates(category, request, adminId);
        
        // Save and return
        Category updatedCategory = categoryRepository.save(category);
        log.info("Category with image updated successfully: {}", categoryId);
        
        return toAdminDtoWithArtworkCount(updatedCategory);
    }
    
    @Override
    @Caching(evict = {
        @CacheEvict(value = "allCategories", allEntries = true),
        @CacheEvict(value = "topCategories", allEntries = true),
        @CacheEvict(value = "activeCategories", allEntries = true)
    })
    public AdminCategoryDto uploadCategoryImage(String categoryId, MultipartFile image, String adminId) throws IOException {
        log.info("Uploading image for category: {} by admin: {}", categoryId, adminId);
        
        Category category = findCategoryOrThrow(categoryId);
        
        // Delete old image if exists
        if (category.getImageUrl() != null) {
            deleteExistingImage(category.getImageUrl());
        }
        
        // Upload new image
        String imageUrl = uploadImage(image);
        category.setImageUrl(imageUrl);
        category.setUpdatedBy(adminId);
        category.setUpdatedAt(LocalDateTime.now());
        
        // Save and return
        Category updatedCategory = categoryRepository.save(category);
        log.info("Category image uploaded successfully: {}", categoryId);
        
        return toAdminDtoWithArtworkCount(updatedCategory);
    }
    
    @Override
    @Caching(evict = {
        @CacheEvict(value = "allCategories", allEntries = true),
        @CacheEvict(value = "topCategories", allEntries = true),
        @CacheEvict(value = "activeCategories", allEntries = true)
    })
    public AdminCategoryDto removeCategoryImage(String categoryId, String adminId) {
        log.info("Removing image for category: {} by admin: {}", categoryId, adminId);
        
        Category category = findCategoryOrThrow(categoryId);
        
        // Delete existing image
        if (category.getImageUrl() != null) {
            deleteExistingImage(category.getImageUrl());
            category.setImageUrl(null);
            category.setUpdatedBy(adminId);
            category.setUpdatedAt(LocalDateTime.now());
        }
        
        // Save and return
        Category updatedCategory = categoryRepository.save(category);
        log.info("Category image removed successfully: {}", categoryId);
        
        return toAdminDtoWithArtworkCount(updatedCategory);
    }
    
    @Override
    @Caching(evict = {
        @CacheEvict(value = "allCategories", allEntries = true),
        @CacheEvict(value = "topCategories", allEntries = true),
        @CacheEvict(value = "activeCategories", allEntries = true)
    })
    public AdminCategoryDto toggleCategoryActive(String categoryId, String adminId) {
        log.info("Toggling active status for category: {} by admin: {}", categoryId, adminId);
        
        Category category = findCategoryOrThrow(categoryId);
        
        category.setIsActive(!category.getIsActive());
        category.setUpdatedBy(adminId);
        category.setUpdatedAt(LocalDateTime.now());
        
        Category updatedCategory = categoryRepository.save(category);
        log.info("Category active status toggled to: {} for: {}", category.getIsActive(), categoryId);
        
        return toAdminDtoWithArtworkCount(updatedCategory);
    }
    
    @Override
    @Caching(evict = {
        @CacheEvict(value = "allCategories", allEntries = true),
        @CacheEvict(value = "topCategories", allEntries = true),
        @CacheEvict(value = "activeCategories", allEntries = true)
    })
    public boolean activateCategoryByName(String categoryName, String adminId) {
        log.info("Activating category by name: {} by admin: {}", categoryName, adminId);
        
        // Normalize the category name for lookup
        String normalizedName = categoryName.toUpperCase().replaceAll("\\s+", "_").replaceAll("-", "_");
        
        try {
            // Try multiple lookup strategies
            Category category = categoryRepository.findByNameIgnoreCase(normalizedName)
                .or(() -> categoryRepository.findByNameIgnoreCase(categoryName))
                .orElse(null);
            
            if (category == null) {
                log.warn("Category not found for activation: {}", categoryName);
                return false;
            }
            
            // If already active, just return true
            if (category.getIsActive() && !category.getIsDeleted()) {
                log.info("Category already active: {}", categoryName);
                return true;
            }
            
            // Activate the category
            category.setIsActive(true);
            category.setIsDeleted(false); // Also un-delete if it was soft-deleted
            category.setUpdatedBy(adminId);
            category.setUpdatedAt(LocalDateTime.now());
            
            categoryRepository.save(category);
            log.info("Category activated successfully: {}", categoryName);
            
            return true;
            
        } catch (Exception e) {
            log.error("Error activating category: {}", categoryName, e);
            return false;
        }
    }
    
    @Override
    @Caching(evict = {
        @CacheEvict(value = "allCategories", allEntries = true),
        @CacheEvict(value = "topCategories", allEntries = true),
        @CacheEvict(value = "activeCategories", allEntries = true)
    })
    public AdminCategoryDto updateDisplayOrder(String categoryId, Integer newOrder, String adminId) {
        log.info("Updating display order for category: {} to: {} by admin: {}", categoryId, newOrder, adminId);
        
        Category category = findCategoryOrThrow(categoryId);
        
        category.setDisplayOrder(newOrder);
        category.setUpdatedBy(adminId);
        category.setUpdatedAt(LocalDateTime.now());
        
        Category updatedCategory = categoryRepository.save(category);
        log.info("Category display order updated successfully: {}", categoryId);
        
        return toAdminDtoWithArtworkCount(updatedCategory);
    }
    
    @Override
    @Caching(evict = {
        @CacheEvict(value = "allCategories", allEntries = true),
        @CacheEvict(value = "topCategories", allEntries = true),
        @CacheEvict(value = "activeCategories", allEntries = true)
    })
    public List<AdminCategoryDto> reorderCategories(List<String> categoryIds, String adminId) {
        log.info("Reordering {} categories by admin: {}", categoryIds.size(), adminId);
        
        List<Category> updatedCategories = IntStream.range(0, categoryIds.size())
            .mapToObj(index -> {
                Category category = findCategoryOrThrow(categoryIds.get(index));
                category.setDisplayOrder(index);
                category.setUpdatedBy(adminId);
                category.setUpdatedAt(LocalDateTime.now());
                return category;
            })
            .collect(Collectors.toList());
        
        categoryRepository.saveAll(updatedCategories);
        log.info("Categories reordered successfully");
        
        return updatedCategories.stream()
            .map(this::toAdminDtoWithArtworkCount)
            .collect(Collectors.toList());
    }
    
    // ============================================
    // Delete Operations
    // ============================================
    
    @Override
    @Caching(evict = {
        @CacheEvict(value = "allCategories", allEntries = true),
        @CacheEvict(value = "topCategories", allEntries = true),
        @CacheEvict(value = "activeCategories", allEntries = true),
        @CacheEvict(value = "categoryStats", allEntries = true)
    })
    public AdminCategoryDto softDeleteCategory(String categoryId, String adminId) {
        log.info("Soft deleting category: {} by admin: {}", categoryId, adminId);
        
        Category category = findCategoryOrThrow(categoryId);
        
        if (category.getIsDeleted()) {
            log.warn("Category already deleted: {}", categoryId);
            return toAdminDtoWithArtworkCount(category);
        }
        
        category.softDelete(adminId);
        
        Category deletedCategory = categoryRepository.save(category);
        log.info("Category soft deleted successfully: {}", categoryId);
        
        return toAdminDtoWithArtworkCount(deletedCategory);
    }
    
    @Override
    @Caching(evict = {
        @CacheEvict(value = "allCategories", allEntries = true),
        @CacheEvict(value = "topCategories", allEntries = true),
        @CacheEvict(value = "activeCategories", allEntries = true),
        @CacheEvict(value = "categoryStats", allEntries = true)
    })
    public AdminCategoryDto restoreCategory(String categoryId, String adminId) {
        log.info("Restoring category: {} by admin: {}", categoryId, adminId);
        
        Category category = findCategoryOrThrow(categoryId);
        
        if (!category.getIsDeleted()) {
            log.warn("Category is not deleted: {}", categoryId);
            return toAdminDtoWithArtworkCount(category);
        }
        
        category.restore(adminId);
        
        Category restoredCategory = categoryRepository.save(category);
        log.info("Category restored successfully: {}", categoryId);
        
        return toAdminDtoWithArtworkCount(restoredCategory);
    }
    
    @Override
    @Caching(evict = {
        @CacheEvict(value = "allCategories", allEntries = true),
        @CacheEvict(value = "topCategories", allEntries = true),
        @CacheEvict(value = "activeCategories", allEntries = true),
        @CacheEvict(value = "categoryStats", allEntries = true)
    })
    public void hardDeleteCategory(String categoryId, String adminId) {
        log.warn("HARD DELETING category: {} by admin: {} - THIS CANNOT BE UNDONE", categoryId, adminId);
        
        Category category = findCategoryOrThrow(categoryId);
        
        // Delete associated image if exists
        if (category.getImageUrl() != null) {
            deleteExistingImage(category.getImageUrl());
        }
        
        categoryRepository.delete(category);
        log.info("Category permanently deleted: {}", categoryId);
    }
    
    // ============================================
    // Statistics Operations
    // ============================================
    
    @Override
    @Transactional(readOnly = true)
    public Map<String, Object> getCategoryStats() {
        log.info("Fetching category statistics");
        
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalCategories", categoryRepository.count());
        stats.put("activeCategories", categoryRepository.countByIsDeletedFalseAndIsActiveTrue());
        stats.put("inactiveCategories", categoryRepository.countByIsDeletedFalse() - categoryRepository.countByIsDeletedFalseAndIsActiveTrue());
        stats.put("deletedCategories", categoryRepository.countByIsDeletedTrue());
        
        return stats;
    }
    
    @Override
    @Transactional(readOnly = true)
    public boolean isNameAvailable(String name, String excludeId) {
        if (excludeId != null) {
            return !categoryRepository.existsByNameIgnoreCaseAndIdNot(name, excludeId);
        }
        return !categoryRepository.existsByNameIgnoreCase(name);
    }
    
    // ============================================
    // Private Helper Methods
    // ============================================
    
    private Category findCategoryOrThrow(String categoryId) {
        return categoryRepository.findById(categoryId)
            .orElseThrow(() -> new ResourceNotFoundException("Category not found with ID: " + categoryId));
    }
    
    private void validateUniqueName(String name, String excludeId) {
        boolean exists;
        if (excludeId != null) {
            exists = categoryRepository.existsByNameIgnoreCaseAndIdNot(name, excludeId);
        } else {
            exists = categoryRepository.existsByNameIgnoreCase(name);
        }
        
        if (exists) {
            throw new DuplicateCategoryException(name);
        }
    }
    
    private Category buildCategoryFromRequest(CategoryCreateRequest request, String adminId) {
        // Determine display order
        Integer displayOrder = request.getDisplayOrder();
        if (displayOrder == null) {
            displayOrder = categoryRepository.findMaxDisplayOrder() + 1;
        }
        
        // Normalize name to uppercase with underscores
        String normalizedName = request.getName().toUpperCase().replaceAll("\\s+", "_");
        
        return Category.builder()
            .name(normalizedName)
            .slug(Category.generateSlug(normalizedName))
            .displayName(request.getDisplayName() != null ? request.getDisplayName() : Category.formatDisplayName(normalizedName))
            .description(request.getDescription())
            .emoji(request.getEmoji())
            .displayOrder(displayOrder)
            .isActive(request.getIsActive() != null ? request.getIsActive() : true)
            .isDeleted(false)
            .createdBy(adminId)
            .updatedBy(adminId)
            .createdAt(LocalDateTime.now())
            .updatedAt(LocalDateTime.now())
            .build();
    }
    
    private void applyUpdates(Category category, CategoryUpdateRequest request, String adminId) {
        if (request.getName() != null) {
            String normalizedName = request.getName().toUpperCase().replaceAll("\\s+", "_");
            category.setName(normalizedName);
            category.setSlug(Category.generateSlug(normalizedName));
            // Update display name if not explicitly set
            if (request.getDisplayName() == null) {
                category.setDisplayName(Category.formatDisplayName(normalizedName));
            }
        }
        
        if (request.getDisplayName() != null) {
            category.setDisplayName(request.getDisplayName());
        }
        
        if (request.getDescription() != null) {
            category.setDescription(request.getDescription());
        }
        
        if (request.getEmoji() != null) {
            category.setEmoji(request.getEmoji());
        }
        
        if (request.getDisplayOrder() != null) {
            category.setDisplayOrder(request.getDisplayOrder());
        }
        
        if (request.getIsActive() != null) {
            category.setIsActive(request.getIsActive());
        }
        
        category.setUpdatedBy(adminId);
        category.setUpdatedAt(LocalDateTime.now());
    }
    
    private String uploadImage(MultipartFile image) throws IOException {
        if (image == null || image.isEmpty()) {
            return null;
        }
        
        log.info("Uploading category image: {}", image.getOriginalFilename());
        return cloudStorageService.uploadFile(image, CATEGORY_IMAGES_FOLDER);
    }
    
    private void deleteExistingImage(String imageUrl) {
        if (imageUrl != null && !imageUrl.isEmpty()) {
            try {
                String publicId = cloudStorageService.extractPublicId(imageUrl);
                if (publicId != null) {
                    cloudStorageService.deleteFile(publicId);
                    log.info("Deleted old category image: {}", publicId);
                }
            } catch (Exception e) {
                log.warn("Failed to delete old category image: {}", imageUrl, e);
            }
        }
    }
    
    private AdminCategoryDto toAdminDto(Category category) {
        return modelMapper.map(category, AdminCategoryDto.class);
    }
    
    private AdminCategoryDto toAdminDtoWithArtworkCount(Category category) {
        AdminCategoryDto dto = toAdminDto(category);
        
        // Count artworks in this category using efficient database query
        long artworkCount = artworkRepository.countByCategory(category.getName());
        dto.setArtworkCount(artworkCount);
        
        return dto;
    }
}
