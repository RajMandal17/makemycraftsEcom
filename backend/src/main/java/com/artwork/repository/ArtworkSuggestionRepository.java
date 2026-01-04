package com.artwork.repository;

import com.artwork.entity.ArtworkSuggestion;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;


@Repository
public interface ArtworkSuggestionRepository extends JpaRepository<ArtworkSuggestion, String> {
    
    
    Page<ArtworkSuggestion> findByUserIdOrderByCreatedAtDesc(String userId, Pageable pageable);
    
    
    List<ArtworkSuggestion> findByUserId(String userId);
    
    
    List<ArtworkSuggestion> findByUserIdAndIsApplied(String userId, Boolean isApplied);
    
    
    long countByUserId(String userId);
    
    
    long countByUserIdAndIsApplied(String userId, Boolean isApplied);
}
