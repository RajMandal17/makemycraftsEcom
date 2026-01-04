package com.artwork.repository;

import com.artwork.entity.ArtworkSuggestion;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository for ArtworkSuggestion entities
 */
@Repository
public interface ArtworkSuggestionRepository extends JpaRepository<ArtworkSuggestion, String> {
    
    /**
     * Find all suggestions for a specific user, ordered by creation date descending
     */
    Page<ArtworkSuggestion> findByUserIdOrderByCreatedAtDesc(String userId, Pageable pageable);
    
    /**
     * Find all suggestions for a user
     */
    List<ArtworkSuggestion> findByUserId(String userId);
    
    /**
     * Find applied suggestions for a user
     */
    List<ArtworkSuggestion> findByUserIdAndIsApplied(String userId, Boolean isApplied);
    
    /**
     * Count total suggestions for a user
     */
    long countByUserId(String userId);
    
    /**
     * Count applied suggestions for a user
     */
    long countByUserIdAndIsApplied(String userId, Boolean isApplied);
}
