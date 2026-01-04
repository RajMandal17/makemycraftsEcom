package com.artwork.controller;

import com.artwork.dto.ArtworkDto;
import com.artwork.service.ArtworkQueryService;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Controller for read-only artwork operations using CQRS pattern
 */
@RestController
@RequestMapping("/api/v1/artwork-query")
@RequiredArgsConstructor
@Validated
@Slf4j
public class ArtworkQueryController {

    private final ArtworkQueryService artworkQueryService;

    /**
     * Get paginated artworks with optional filtering
     */
    @GetMapping
    public ResponseEntity<Map<String, Object>> getArtworks(
            @RequestParam(defaultValue = "0") @Min(0) int page,
            @RequestParam(defaultValue = "12") @Min(1) @Max(50) int limit,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) Double minPrice,
            @RequestParam(required = false) Double maxPrice,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String artistId) {
        
        log.info("Request to get artworks with parameters: page={}, limit={}, category={}, minPrice={}, maxPrice={}, search={}, artistId={}",
                page, limit, category, minPrice, maxPrice, search, artistId);
        
        Page<ArtworkDto> artworksPage = artworkQueryService.getArtworks(page, limit, category, minPrice, maxPrice, search, artistId);
        
        Map<String, Object> response = Map.of(
            "artworks", artworksPage.getContent(),
            "currentPage", artworksPage.getNumber(),
            "totalItems", artworksPage.getTotalElements(),
            "totalPages", artworksPage.getTotalPages()
        );
        
        return ResponseEntity.ok(response);
    }

    /**
     * Get a single artwork by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<ArtworkDto> getArtwork(@PathVariable String id) {
        log.info("Request to get artwork with id: {}", id);
        return ResponseEntity.ok(artworkQueryService.getArtworkById(id));
    }

    /**
     * Get featured artworks
     */
    @GetMapping("/featured")
    public ResponseEntity<List<ArtworkDto>> getFeaturedArtworks() {
        log.info("Request to get featured artworks");
        return ResponseEntity.ok(artworkQueryService.getFeaturedArtworks());
    }

    /**
     * Get artworks by artist ID
     */
    @GetMapping("/artist/{artistId}")
    public ResponseEntity<List<ArtworkDto>> getArtworksByArtist(@PathVariable String artistId) {
        log.info("Request to get artworks by artist: {}", artistId);
        return ResponseEntity.ok(artworkQueryService.getArtworksByArtistId(artistId));
    }

    /**
     * Get related artworks for an artwork
     */
    @GetMapping("/{id}/related")
    public ResponseEntity<List<ArtworkDto>> getRelatedArtworks(
            @PathVariable String id,
            @RequestParam(defaultValue = "4") @Min(1) @Max(12) int limit) {
        log.info("Request to get related artworks for artwork: {} with limit: {}", id, limit);
        return ResponseEntity.ok(artworkQueryService.getRelatedArtworks(id, limit));
    }
}
