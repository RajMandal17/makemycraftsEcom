package com.artwork.repository;

import com.artwork.entity.Review;
import com.artwork.entity.ReviewStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReviewRepository extends JpaRepository<Review, String> {
    
    // ========== Basic Queries ==========
    
    List<Review> findByArtworkIdOrderByCreatedAtDesc(String artworkId);
    
    List<Review> findByArtworkId(String artworkId);
    
    List<Review> findByArtworkIdAndStatusOrderByCreatedAtDesc(String artworkId, ReviewStatus status);
    
    Page<Review> findByArtworkIdAndStatus(String artworkId, ReviewStatus status, Pageable pageable);
    
    List<Review> findByCustomerId(String customerId);
    
    Optional<Review> findByOrderItemId(String orderItemId);
    
    boolean existsByOrderItemId(String orderItemId);
    
    // ========== Artist Reviews ==========
    
    @Query("SELECT r FROM Review r JOIN Artwork a ON r.artworkId = a.id WHERE a.artist.id = ?1 ORDER BY r.createdAt DESC")
    List<Review> findByArtistIdOrderByCreatedAtDesc(String artistId);
    
    @Query("SELECT r FROM Review r JOIN Artwork a ON r.artworkId = a.id WHERE a.artist.id = ?1 AND r.status = ?2 ORDER BY r.createdAt DESC")
    List<Review> findByArtistIdAndStatusOrderByCreatedAtDesc(String artistId, ReviewStatus status);
    
    // ========== Rating Statistics ==========
    
    /**
     * Calculate average rating across all reviews
     */
    @Query("SELECT COALESCE(AVG(r.rating), 0.0) FROM Review r WHERE r.status = 'APPROVED'")
    Double getAverageRating();
    
    /**
     * Calculate average rating for a specific artwork
     */
    @Query("SELECT COALESCE(AVG(r.rating), 0.0) FROM Review r WHERE r.artworkId = :artworkId AND r.status = 'APPROVED'")
    Double getAverageRatingByArtworkId(@Param("artworkId") String artworkId);
    
    /**
     * Count total reviews for an artwork
     */
    @Query("SELECT COUNT(r) FROM Review r WHERE r.artworkId = :artworkId AND r.status = 'APPROVED'")
    Long countByArtworkIdAndApproved(@Param("artworkId") String artworkId);
    
    /**
     * Count reviews by rating for an artwork (for distribution)
     */
    @Query("SELECT r.rating, COUNT(r) FROM Review r WHERE r.artworkId = :artworkId AND r.status = 'APPROVED' GROUP BY r.rating")
    List<Object[]> getRatingDistributionByArtworkId(@Param("artworkId") String artworkId);
    
    /**
     * Calculate average rating for an artist across all their artworks
     */
    @Query("SELECT COALESCE(AVG(r.rating), 0.0) FROM Review r JOIN Artwork a ON r.artworkId = a.id WHERE a.artist.id = :artistId AND r.status = 'APPROVED'")
    Double getAverageRatingByArtistId(@Param("artistId") String artistId);
    
    /**
     * Count total reviews for an artist
     */
    @Query("SELECT COUNT(r) FROM Review r JOIN Artwork a ON r.artworkId = a.id WHERE a.artist.id = :artistId AND r.status = 'APPROVED'")
    Long countByArtistIdAndApproved(@Param("artistId") String artistId);
    
    // ========== Order-based Queries ==========
    
    /**
     * Check if customer has already reviewed a specific order item
     */
    @Query("SELECT CASE WHEN COUNT(r) > 0 THEN true ELSE false END FROM Review r WHERE r.orderItemId = :orderItemId AND r.customerId = :customerId")
    boolean existsByOrderItemIdAndCustomerId(@Param("orderItemId") String orderItemId, @Param("customerId") String customerId);
    
    /**
     * Find all reviews by a customer for items in a specific order
     */
    List<Review> findByOrderIdAndCustomerId(String orderId, String customerId);
    
    /**
     * Find reviews for multiple artworks (for batch loading)
     */
    @Query("SELECT r FROM Review r WHERE r.artworkId IN :artworkIds AND r.status = 'APPROVED' ORDER BY r.createdAt DESC")
    List<Review> findByArtworkIdInAndApproved(@Param("artworkIds") List<String> artworkIds);
}
