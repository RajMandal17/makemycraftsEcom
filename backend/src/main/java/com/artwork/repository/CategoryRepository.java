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


@Repository
public interface CategoryRepository extends JpaRepository<Category, String> {
    
    
    
    
    
    
    Optional<Category> findByNameIgnoreCase(String name);
    
    
    Optional<Category> findBySlug(String slug);
    
    
    @Query("SELECT c FROM Category c WHERE LOWER(c.name) = LOWER(:name) OR c.slug = :slug")
    Optional<Category> findByNameIgnoreCaseOrSlug(@Param("name") String name, @Param("slug") String slug);
    
    
    
    
    
    
    boolean existsByNameIgnoreCase(String name);
    
    
    @Query("SELECT COUNT(c) > 0 FROM Category c WHERE LOWER(c.name) = LOWER(:name) AND c.id != :excludeId")
    boolean existsByNameIgnoreCaseAndIdNot(@Param("name") String name, @Param("excludeId") String excludeId);
    
    
    boolean existsBySlug(String slug);
    
    
    @Query("SELECT COUNT(c) > 0 FROM Category c WHERE c.slug = :slug AND c.id != :excludeId")
    boolean existsBySlugAndIdNot(@Param("slug") String slug, @Param("excludeId") String excludeId);
    
    
    
    
    
    
    List<Category> findByIsDeletedFalseOrderByDisplayOrderAsc();
    
    
    List<Category> findByIsDeletedFalseAndIsActiveTrueOrderByDisplayOrderAsc();
    
    
    Page<Category> findByIsDeletedFalse(Pageable pageable);
    
    
    Page<Category> findByIsDeletedFalseAndIsActiveTrue(Pageable pageable);
    
    
    
    
    
    
    List<Category> findByIsDeletedTrue();
    
    
    Page<Category> findByIsDeletedTrue(Pageable pageable);
    
    
    
    
    
    
    List<Category> findAllByOrderByDisplayOrderAsc();
    
    
    Page<Category> findAllByOrderByDisplayOrderAsc(Pageable pageable);
    
    
    
    
    
    
    @Query("SELECT c FROM Category c WHERE " +
           "(LOWER(c.name) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(c.displayName) LIKE LOWER(CONCAT('%', :search, '%'))) " +
           "AND c.isDeleted = false " +
           "ORDER BY c.displayOrder ASC")
    List<Category> searchByNameOrDisplayName(@Param("search") String search);
    
    
    @Query("SELECT c FROM Category c WHERE " +
           "LOWER(c.name) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(c.displayName) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "ORDER BY c.displayOrder ASC")
    List<Category> searchAllByNameOrDisplayName(@Param("search") String search);
    
    
    
    
    
    
    long countByIsDeletedFalse();
    
    
    long countByIsDeletedFalseAndIsActiveTrue();
    
    
    long countByIsDeletedTrue();
    
    
    
    
    
    
    @Query("SELECT c.name FROM Category c WHERE c.isDeleted = false AND c.isActive = true ORDER BY c.displayOrder ASC")
    List<String> findAllActiveNames();
    
    
    @Query("SELECT c.displayName FROM Category c WHERE c.isDeleted = false AND c.isActive = true ORDER BY c.displayOrder ASC")
    List<String> findAllActiveDisplayNames();
    
    
    
    
    
    
    @Query("SELECT COALESCE(MAX(c.displayOrder), 0) FROM Category c")
    Integer findMaxDisplayOrder();
    
    
    @Query("SELECT c FROM Category c WHERE c.displayOrder > :order ORDER BY c.displayOrder ASC")
    List<Category> findByDisplayOrderGreaterThan(@Param("order") Integer order);
}
