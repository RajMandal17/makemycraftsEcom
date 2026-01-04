package com.artwork.repository;

import com.artwork.entity.Artwork;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ArtworkRepository extends JpaRepository<Artwork, String> {
    
    Page<Artwork> findByCategory(String category, Pageable pageable);
    Page<Artwork> findByArtistId(String artistId, Pageable pageable);
    Page<Artwork> findByTitleContainingIgnoreCase(String title, Pageable pageable);
    Page<Artwork> findByPriceBetween(Double minPrice, Double maxPrice, Pageable pageable);
    
    
    Page<Artwork> findByCategoryAndTitleContainingIgnoreCase(String category, String title, Pageable pageable);
    
    
    List<Artwork> findByArtistId(String artistId);
    List<Artwork> findByFeaturedTrue(Pageable pageable);
    List<Artwork> findByCategoryAndIdNot(String category, String artworkId, Pageable pageable);
    
    
    long countByArtistId(String artistId);
    long countByCategory(String category);
    List<Artwork> findByArtistIdOrderByCreatedAtDesc(String artistId);
    
    @Query("SELECT COALESCE(AVG(r.rating), 0.0) FROM Review r JOIN r.artwork a WHERE a.artistId = :artistId")
    Double getAverageRatingForArtist(String artistId);
    
    long countByApprovalStatus(com.artwork.entity.ApprovalStatus approvalStatus);
    
    
    Page<Artwork> findByApprovalStatus(com.artwork.entity.ApprovalStatus approvalStatus, Pageable pageable);
    
    Page<Artwork> findByApprovalStatusAndCategory(
        com.artwork.entity.ApprovalStatus approvalStatus, 
        String category, 
        Pageable pageable
    );
    
    
    @Query("SELECT a FROM Artwork a WHERE a.approvalStatus = :approvalStatus " +
           "AND (LOWER(a.category) = LOWER(:category) " +
           "  OR LOWER(REPLACE(a.category, ' ', '_')) = LOWER(:category) " +
           "  OR LOWER(a.category) = LOWER(REPLACE(:category, '_', ' ')))")
    Page<Artwork> findByApprovalStatusAndCategoryNormalized(
        @org.springframework.data.repository.query.Param("approvalStatus") com.artwork.entity.ApprovalStatus approvalStatus, 
        @org.springframework.data.repository.query.Param("category") String category, 
        Pageable pageable
    );
    
    Page<Artwork> findByApprovalStatusAndTitleContainingIgnoreCase(
        com.artwork.entity.ApprovalStatus approvalStatus, 
        String title, 
        Pageable pageable
    );
    
    Page<Artwork> findByApprovalStatusAndCategoryAndTitleContainingIgnoreCase(
        com.artwork.entity.ApprovalStatus approvalStatus, 
        String category, 
        String title, 
        Pageable pageable
    );
    
    
    List<Artwork> findByApprovalStatusOrderByCreatedAtDesc(
        com.artwork.entity.ApprovalStatus approvalStatus
    );
    
    
    @Query("SELECT a FROM Artwork a WHERE a.approvalStatus = :artworkStatus AND a.artist.status = 'APPROVED'")
    Page<Artwork> findByApprovalStatusAndArtistStatusApproved(
        @org.springframework.data.repository.query.Param("artworkStatus") com.artwork.entity.ApprovalStatus artworkStatus,
        Pageable pageable
    );
    
    @Query("SELECT a FROM Artwork a WHERE a.approvalStatus = :artworkStatus AND a.artist.status = 'APPROVED' " +
           "AND (LOWER(a.category) = LOWER(:category) " +
           "  OR LOWER(REPLACE(a.category, ' ', '_')) = LOWER(:category) " +
           "  OR LOWER(a.category) = LOWER(REPLACE(:category, '_', ' ')))")
    Page<Artwork> findByApprovalStatusAndArtistStatusApprovedAndCategoryNormalized(
        @org.springframework.data.repository.query.Param("artworkStatus") com.artwork.entity.ApprovalStatus artworkStatus,
        @org.springframework.data.repository.query.Param("category") String category,
        Pageable pageable
    );
    
    @Query("SELECT a FROM Artwork a WHERE a.approvalStatus = :artworkStatus AND a.artist.status = 'APPROVED' " +
           "AND LOWER(a.title) LIKE LOWER(CONCAT('%', :title, '%'))")
    Page<Artwork> findByApprovalStatusAndArtistStatusApprovedAndTitleContaining(
        @org.springframework.data.repository.query.Param("artworkStatus") com.artwork.entity.ApprovalStatus artworkStatus,
        @org.springframework.data.repository.query.Param("title") String title,
        Pageable pageable
    );
    
    
    List<Artwork> findByArtistIdAndApprovalStatus(
        String artistId, 
        com.artwork.entity.ApprovalStatus approvalStatus
    );
    
    
    @Query("SELECT a FROM Artwork a JOIN OrderItem oi ON oi.artworkId = a.id " +
           "GROUP BY a.id ORDER BY COUNT(oi.id) DESC, SUM(oi.quantity) DESC")
    List<Artwork> findTopSellingArtworks(Pageable pageable);
}
