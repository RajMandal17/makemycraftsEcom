package com.artwork.service.admin;

import com.artwork.dto.ArtworkDto;
import com.artwork.dto.ArtworkStatsDto;
import com.artwork.dto.ArtworkUpdateRequest;
import org.springframework.data.domain.Page;


public interface AdminArtworkService {
    
    
    Page<ArtworkDto> getArtworks(int page, int limit, String category, String status);
    
    
    ArtworkDto updateArtwork(String artworkId, ArtworkUpdateRequest updateRequest);
    
    
    void deleteArtwork(String artworkId);
    
    
    ArtworkStatsDto getArtworkStats();
    
    
    ArtworkDto approveArtwork(String artworkId, String notes);
    
    
    ArtworkDto rejectArtwork(String artworkId, String reason);
    
    
    ArtworkDto featureArtwork(String artworkId);
    
    
    ArtworkDto unfeatureArtwork(String artworkId);

    
    com.artwork.dto.BulkOperationResult bulkApprove(java.util.List<String> artworkIds);
    
    
    java.util.List<ArtworkDto> getPendingArtworks();
    
    
    ArtworkDto approveArtworkWithCategory(String artworkId, String notes);
}
