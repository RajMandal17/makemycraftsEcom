package com.artwork.service.admin;

import com.artwork.dto.ArtworkDto;
import com.artwork.dto.ArtworkStatsDto;
import com.artwork.dto.ArtworkUpdateRequest;
import org.springframework.data.domain.Page;

/**
 * Service interface for admin artwork management operations.
 * 
 * SOLID Principles:
 * - Single Responsibility: Only handles artwork-related admin operations
 * - Interface Segregation: Focused interface with only artwork operations
 * 
 * @author Raj Mandal
 */
public interface AdminArtworkService {
    
    /**
     * Retrieve paginated list of artworks with optional filtering.
     * 
     * @param page Page number (1-indexed)
     * @param limit Number of items per page
     * @param category Optional category filter
     * @param status Optional status filter (PENDING, APPROVED, REJECTED)
     * @return Paginated list of artworks
     */
    Page<ArtworkDto> getArtworks(int page, int limit, String category, String status);
    
    /**
     * Update artwork details.
     * 
     * @param artworkId Artwork ID
     * @param updateRequest Update request with new values
     * @return Updated artwork DTO
     */
    ArtworkDto updateArtwork(String artworkId, ArtworkUpdateRequest updateRequest);
    
    /**
     * Delete artwork.
     * 
     * @param artworkId Artwork ID
     */
    void deleteArtwork(String artworkId);
    
    /**
     * Get artwork statistics for admin dashboard.
     * 
     * @return Artwork statistics
     */
    ArtworkStatsDto getArtworkStats();
    
    /**
     * Approve a pending artwork.
     * 
     * @param artworkId Artwork ID
     * @param notes Optional approval notes
     * @return Approved artwork DTO
     */
    ArtworkDto approveArtwork(String artworkId, String notes);
    
    /**
     * Reject a pending artwork.
     * 
     * @param artworkId Artwork ID
     * @param reason Rejection reason
     * @return Rejected artwork DTO
     */
    ArtworkDto rejectArtwork(String artworkId, String reason);
    
    /**
     * Feature an artwork.
     * 
     * @param artworkId Artwork ID
     * @return Featured artwork DTO
     */
    ArtworkDto featureArtwork(String artworkId);
    
    /**
     * Unfeature an artwork.
     * 
     * @param artworkId Artwork ID
     * @return Unfeatured artwork DTO
     */
    ArtworkDto unfeatureArtwork(String artworkId);

    /**
     * Bulk approve multiple artworks.
     * 
     * @param artworkIds List of artwork IDs to approve
     * @return Result of the bulk operation
     */
    com.artwork.dto.BulkOperationResult bulkApprove(java.util.List<String> artworkIds);
    
    /**
     * Get all pending artworks for admin review.
     * Includes artworks waiting for category approval.
     * 
     * @return List of pending artworks
     */
    java.util.List<ArtworkDto> getPendingArtworks();
    
    /**
     * Approve artwork and activate its associated category.
     * If the artwork uses a pending category, this will activate the category first,
     * then approve the artwork.
     * 
     * @param artworkId Artwork ID
     * @param notes Optional approval notes
     * @return Approved artwork DTO
     */
    ArtworkDto approveArtworkWithCategory(String artworkId, String notes);
}
