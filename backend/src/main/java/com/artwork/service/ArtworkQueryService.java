package com.artwork.service;

import com.artwork.dto.ArtworkDto;
import org.springframework.data.domain.Page;

import java.util.List;

/**
 * Query service for Artwork using CQRS pattern
 * This service is responsible for read operations only
 */
public interface ArtworkQueryService {
    Page<ArtworkDto> getArtworks(int page, int limit, String category, Double minPrice, Double maxPrice, String search, String artistId);
    ArtworkDto getArtworkById(String id);
    List<ArtworkDto> getFeaturedArtworks();
    List<ArtworkDto> getArtworksByArtistId(String artistId);
    List<ArtworkDto> getRelatedArtworks(String artworkId, int limit);
}
