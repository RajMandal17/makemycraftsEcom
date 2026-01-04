package com.artwork.service.impl;

import com.artwork.dto.CategoryStatsDto;
import com.artwork.dto.PublicCategoryDto;
import com.artwork.entity.Artwork;
import com.artwork.entity.Category;
import com.artwork.repository.ArtworkRepository;
import com.artwork.repository.CategoryRepository;
import com.artwork.service.CategoryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;


@Service
@RequiredArgsConstructor
@Slf4j
public class CategoryServiceImpl implements CategoryService {
    
    private final ArtworkRepository artworkRepository;
    private final CategoryRepository categoryRepository;
    
    
    @Override
    @Cacheable(value = "topCategories", key = "#limit")
    public List<CategoryStatsDto> getTopSellingCategories(int limit) {
        log.info("Fetching top {} selling categories", limit);
        
        try {
            
            List<Category> dbCategories = categoryRepository.findByIsDeletedFalseAndIsActiveTrueOrderByDisplayOrderAsc();
            
            if (dbCategories.isEmpty()) {
                log.warn("No active categories found in database");
                return Collections.emptyList();
            }
            
            
            List<Artwork> allArtworks = artworkRepository.findAll();
            
            
            Map<String, List<Artwork>> artworksByCategory = allArtworks.stream()
                .filter(artwork -> artwork.getCategory() != null && !artwork.getCategory().trim().isEmpty())
                .filter(artwork -> artwork.getApprovalStatus() == com.artwork.entity.ApprovalStatus.APPROVED)
                .collect(Collectors.groupingBy(artwork -> artwork.getCategory().toUpperCase().replaceAll("\\s+", "_")));
            
            log.info("Found {} database categories, {} unique categories with artworks", 
                    dbCategories.size(), artworksByCategory.size());
            
            
            List<CategoryStatsDto> categoryStats = new ArrayList<>();
            
            for (Category dbCategory : dbCategories) {
                String normalizedName = dbCategory.getName().toUpperCase();
                List<Artwork> artworks = artworksByCategory.getOrDefault(normalizedName, Collections.emptyList());
                
                
                if (artworks.isEmpty()) {
                    String displayNameNormalized = dbCategory.getDisplayName() != null 
                        ? dbCategory.getDisplayName().toUpperCase().replaceAll("\\s+", "_") 
                        : "";
                    artworks = artworksByCategory.getOrDefault(displayNameNormalized, Collections.emptyList());
                }
                
                
                if (artworks.isEmpty() && dbCategory.getDisplayName() != null) {
                    String displayNameWithSpaces = dbCategory.getDisplayName().toUpperCase();
                    artworks = artworksByCategory.getOrDefault(displayNameWithSpaces, Collections.emptyList());
                }
                
                
                double averagePrice = artworks.stream()
                    .mapToDouble(Artwork::getPrice)
                    .average()
                    .orElse(0.0);
                
                double totalRevenue = artworks.stream()
                    .mapToDouble(Artwork::getPrice)
                    .sum();
                
                CategoryStatsDto stats = buildCategoryStats(dbCategory, artworks.size(), totalRevenue, averagePrice);
                categoryStats.add(stats);
                
                log.debug("Category '{}' ({}): {} artworks, avg price: {}", 
                        dbCategory.getDisplayName(), dbCategory.getName(), artworks.size(), averagePrice);
            }
            
            
            List<CategoryStatsDto> topCategories = categoryStats.stream()
                .sorted(Comparator
                    .comparing(CategoryStatsDto::getArtworkCount).reversed()
                    .thenComparing(c -> c.getDisplayName() != null ? c.getDisplayName() : ""))
                .limit(limit)
                .collect(Collectors.toList());
            
            
            for (int i = 0; i < topCategories.size(); i++) {
                topCategories.get(i).setRank(i + 1);
            }
            
            log.info("Successfully fetched {} top categories", topCategories.size());
            return topCategories;
            
        } catch (Exception e) {
            log.error("Error fetching top selling categories", e);
            return Collections.emptyList();
        }
    }
    
    
    private CategoryStatsDto buildCategoryStats(Category category, int artworkCount, double totalRevenue, double averagePrice) {
        
        String icon = category.getImageUrl() != null && !category.getImageUrl().isEmpty() 
            ? category.getImageUrl() 
            : (category.getEmoji() != null ? category.getEmoji() : "🎨");
        
        return CategoryStatsDto.builder()
            .categoryId(category.getId())
            .category(category.getName())
            .slug(category.getSlug())
            .artworkCount((long) artworkCount)
            .salesCount(0L)
            .totalRevenue(totalRevenue)
            .averagePrice(averagePrice)
            .uniqueCustomers(0L)
            .displayName(category.getDisplayName())
            .icon(icon)
            .imageUrl(category.getImageUrl())
            .build();
    }
    
    
    @Override
    @Cacheable(value = "allCategories")
    public List<String> getAllCategories() {
        log.info("Fetching all categories from database");
        
        try {
            
            List<String> dbCategories = categoryRepository.findAllActiveNames();
            
            if (!dbCategories.isEmpty()) {
                log.info("Found {} categories in database", dbCategories.size());
                return dbCategories;
            }
            
            
            List<String> categories = artworkRepository.findAll().stream()
                .map(Artwork::getCategory)
                .filter(Objects::nonNull)
                .distinct()
                .sorted()
                .collect(Collectors.toList());
            
            log.info("Found {} unique categories from artworks (fallback)", categories.size());
            return categories;
            
        } catch (Exception e) {
            log.error("Error fetching all categories", e);
            return Collections.emptyList();
        }
    }
    
    
    @Override
    @Cacheable(value = "categoryStats", key = "#categoryName")
    public CategoryStatsDto getCategoryStats(String categoryName) {
        log.info("Fetching statistics for category: {}", categoryName);
        
        try {
            
            Optional<Category> dbCategory = categoryRepository.findByNameIgnoreCase(categoryName);
            
            
            List<Artwork> artworks = artworkRepository.findAll().stream()
                .filter(a -> a.getCategory() != null && a.getCategory().equalsIgnoreCase(categoryName))
                .collect(Collectors.toList());
            
            double averagePrice = artworks.stream()
                .mapToDouble(Artwork::getPrice)
                .average()
                .orElse(0.0);
            
            double totalRevenue = artworks.stream()
                .mapToDouble(Artwork::getPrice)
                .sum();
            
            if (dbCategory.isPresent()) {
                Category cat = dbCategory.get();
                CategoryStatsDto stats = buildCategoryStats(cat, artworks.size(), totalRevenue, averagePrice);
                stats.setRank(1); 
                return stats;
            }
            
            
            log.warn("Category '{}' not found in database - not admin-approved", categoryName);
            return null;
                    
        } catch (Exception e) {
            log.error("Error fetching category stats for: {}", categoryName, e);
            return null;
        }
    }
    
    
    @Override
    @Cacheable(value = "activeCategories")
    public List<PublicCategoryDto> getActiveCategories() {
        log.info("Fetching active categories with full details");
        
        try {
            List<Category> categories = categoryRepository.findByIsDeletedFalseAndIsActiveTrueOrderByDisplayOrderAsc();
            
            List<PublicCategoryDto> result = categories.stream()
                .map(this::toPublicDto)
                .collect(Collectors.toList());
            
            log.info("Found {} active categories", result.size());
            
            
            
            if (result.isEmpty()) {
                log.warn("No active categories found in database. Admin must activate categories.");
            }
            
            return result;
            
        } catch (Exception e) {
            log.error("Error fetching active categories from database", e);
            return Collections.emptyList();
        }
    }
    
    
    @Override
    public boolean isValidActiveCategory(String categoryName) {
        if (categoryName == null || categoryName.trim().isEmpty()) {
            return false;
        }
        
        String trimmedName = categoryName.trim();
        
        try {
            
            Optional<Category> category = categoryRepository.findByNameIgnoreCase(trimmedName);
            
            if (category.isPresent()) {
                Category cat = category.get();
                boolean isValid = cat.isVisible(); 
                log.debug("Category '{}' validation result: {}", categoryName, isValid);
                return isValid;
            }
            
            
            log.debug("Category '{}' not found in database - not admin-approved", categoryName);
            return false;
            
        } catch (Exception e) {
            log.error("Error validating category '{}' from database", categoryName, e);
            return false;
        }
    }
    
    
    private PublicCategoryDto toPublicDto(Category category) {
        return PublicCategoryDto.builder()
            .id(category.getId())
            .name(category.getName())
            .slug(category.getSlug())
            .displayName(category.getDisplayName())
            .description(category.getDescription())
            .imageUrl(category.getImageUrl())
            .emoji(category.getEmoji())
            .displayOrder(category.getDisplayOrder())
            .build();
    }
    
    
    private String formatCategoryName(String category) {
        if (category == null || category.isEmpty()) {
            return "Unknown";
        }
        
        return Arrays.stream(category.split("_"))
            .map(word -> word.substring(0, 1).toUpperCase() + word.substring(1).toLowerCase())
            .collect(Collectors.joining(" "));
    }
    
    
    @Override
    @Transactional
    @CacheEvict(value = {"activeCategories", "allCategories", "topCategories"}, allEntries = true)
    public boolean registerCategoryIfNew(String categoryName, String createdBy) {
        if (categoryName == null || categoryName.trim().isEmpty()) {
            return false;
        }
        
        String trimmedName = categoryName.trim();
        String normalizedName = normalizeForStorage(trimmedName);
        
        try {
            
            Optional<Category> existingCategory = categoryRepository.findByNameIgnoreCase(normalizedName);
            
            if (existingCategory.isPresent()) {
                Category cat = existingCategory.get();
                log.debug("Category '{}' already exists, active: {}", normalizedName, cat.isVisible());
                return cat.isVisible(); 
            }
            
            
            log.info("Creating new category '{}' as INACTIVE (pending admin approval)", normalizedName);
            
            
            Integer maxDisplayOrder = categoryRepository.findMaxDisplayOrder();
            int nextDisplayOrder = (maxDisplayOrder != null ? maxDisplayOrder : 0) + 1;
            
            Category newCategory = Category.builder()
                .name(normalizedName)
                .slug(generateSlug(trimmedName))
                .displayName(formatCategoryName(normalizedName))
                .emoji(getDefaultEmoji(normalizedName))
                .displayOrder(nextDisplayOrder)
                .isActive(false) 
                .isDeleted(false)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .createdBy(createdBy)
                .build();
            
            categoryRepository.save(newCategory);
            log.info("New category '{}' created as INACTIVE. Admin approval required.", normalizedName);
            
            return false; 
            
        } catch (Exception e) {
            log.error("Error registering category '{}'", categoryName, e);
            return false;
        }
    }
    
    
    private String normalizeForStorage(String name) {
        return name.toUpperCase()
            .replaceAll("\\s+", "_")
            .replaceAll("-", "_")
            .replaceAll("[^A-Z0-9_]", "");
    }
    
    
    private String generateSlug(String name) {
        return name.toLowerCase()
            .replaceAll("\\s+", "-")
            .replaceAll("_", "-")
            .replaceAll("[^a-z0-9-]", "")
            .replaceAll("-+", "-")
            .replaceAll("(^-)|(-$)", "");
    }
    
    
    private String getDefaultEmoji(String categoryName) {
        String upper = categoryName.toUpperCase();
        if (upper.contains("PAINT")) return "\uD83C\uDFA8";
        if (upper.contains("SCULPT")) return "\uD83D\uDDFF";
        if (upper.contains("PHOTO")) return "\uD83D\uDCF7";
        if (upper.contains("DIGITAL")) return "\uD83D\uDCBB";
        if (upper.contains("DRAW")) return "\u270F\uFE0F";
        if (upper.contains("PRINT")) return "\uD83D\uDDBC\uFE0F";
        if (upper.contains("TEXTILE") || upper.contains("FABRIC")) return "\uD83E\uDDF5";
        if (upper.contains("CERAMIC") || upper.contains("POTTERY")) return "\uD83C\uDFFA";
        if (upper.contains("JEWEL")) return "\uD83D\uDC8E";
        if (upper.contains("GLASS")) return "\uD83D\uDD2E";
        if (upper.contains("WOOD")) return "\uD83E\uDEB5";
        if (upper.contains("METAL")) return "\u2699\uFE0F";
        if (upper.contains("PAPER")) return "\uD83D\uDCC4";
        return "\u2728"; 
    }
}
