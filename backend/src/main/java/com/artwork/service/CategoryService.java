package com.artwork.service;

import com.artwork.dto.CategoryStatsDto;
import com.artwork.dto.PublicCategoryDto;

import java.util.List;


public interface CategoryService {
    
    
    List<CategoryStatsDto> getTopSellingCategories(int limit);
    
    
    List<String> getAllCategories();
    
    
    List<PublicCategoryDto> getActiveCategories();
    
    
    boolean isValidActiveCategory(String categoryName);
    
    
    CategoryStatsDto getCategoryStats(String categoryName);
    
    
    boolean registerCategoryIfNew(String categoryName, String createdBy);
}
