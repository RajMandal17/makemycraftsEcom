package com.artwork.service.admin;

import com.artwork.dto.AdminCategoryDto;
import com.artwork.dto.CategoryCreateRequest;
import com.artwork.dto.CategoryUpdateRequest;
import org.springframework.data.domain.Page;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;


public interface AdminCategoryService {
    
    
    
    
    
    
    AdminCategoryDto createCategory(CategoryCreateRequest request, String adminId);
    
    
    AdminCategoryDto createCategoryWithImage(CategoryCreateRequest request, MultipartFile image, String adminId) throws IOException;
    
    
    
    
    
    
    Page<AdminCategoryDto> getAllCategories(int page, int limit);
    
    
    List<AdminCategoryDto> getAllCategoriesList();
    
    
    Page<AdminCategoryDto> getActiveCategories(int page, int limit);
    
    
    List<AdminCategoryDto> getActiveCategoriesList();
    
    
    List<AdminCategoryDto> getDeletedCategories();
    
    
    AdminCategoryDto getCategoryById(String categoryId);
    
    
    AdminCategoryDto getCategoryByName(String name);
    
    
    List<AdminCategoryDto> searchCategories(String searchTerm, boolean includeDeleted);
    
    
    
    
    
    
    AdminCategoryDto updateCategory(String categoryId, CategoryUpdateRequest request, String adminId);
    
    
    AdminCategoryDto updateCategoryWithImage(String categoryId, CategoryUpdateRequest request, MultipartFile image, String adminId) throws IOException;
    
    
    AdminCategoryDto uploadCategoryImage(String categoryId, MultipartFile image, String adminId) throws IOException;
    
    
    AdminCategoryDto removeCategoryImage(String categoryId, String adminId);
    
    
    AdminCategoryDto toggleCategoryActive(String categoryId, String adminId);
    
    
    boolean activateCategoryByName(String categoryName, String adminId);
    
    
    AdminCategoryDto updateDisplayOrder(String categoryId, Integer newOrder, String adminId);
    
    
    List<AdminCategoryDto> reorderCategories(List<String> categoryIds, String adminId);
    
    
    
    
    
    
    AdminCategoryDto softDeleteCategory(String categoryId, String adminId);
    
    
    AdminCategoryDto restoreCategory(String categoryId, String adminId);
    
    
    void hardDeleteCategory(String categoryId, String adminId);
    
    
    
    
    
    
    java.util.Map<String, Object> getCategoryStats();
    
    
    boolean isNameAvailable(String name, String excludeId);
}
