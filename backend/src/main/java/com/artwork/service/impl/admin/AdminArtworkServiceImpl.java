package com.artwork.service.impl.admin;

import com.artwork.dto.ArtworkDto;
import com.artwork.dto.ArtworkStatsDto;
import com.artwork.dto.ArtworkUpdateRequest;
import com.artwork.entity.ApprovalStatus;
import com.artwork.entity.Artwork;
import com.artwork.exception.ResourceNotFoundException;
import com.artwork.repository.ArtworkRepository;
import com.artwork.repository.CategoryRepository;
import com.artwork.service.admin.AdminArtworkService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.modelmapper.ModelMapper;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Caching;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AdminArtworkServiceImpl implements AdminArtworkService {
    
    private final ArtworkRepository artworkRepository;
    private final CategoryRepository categoryRepository;
    private final ModelMapper modelMapper;

    private ArtworkDto convertToDto(Artwork artwork) {
        ArtworkDto dto = modelMapper.map(artwork, ArtworkDto.class);
        
        // Ensure artist details are properly mapped, especially ID
        if (artwork.getArtist() != null) {
            com.artwork.dto.ArtistDto artistDto = modelMapper.map(artwork.getArtist(), com.artwork.dto.ArtistDto.class);
            if (artistDto.getId() == null && artwork.getArtist().getId() != null) {
                artistDto.setId(artwork.getArtist().getId());
            }
            dto.setArtist(artistDto);
        }
        
        return dto;
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ArtworkDto> getArtworks(int page, int limit, String category, String status) {
        Pageable pageable = PageRequest.of(page - 1, limit);
        
        if ((category != null && !category.isEmpty()) || (status != null && !status.isEmpty())) {
            List<Artwork> allArtworks = artworkRepository.findAll();
            List<Artwork> filteredArtworks = allArtworks.stream()
                .filter(artwork -> category == null || category.isEmpty() || artwork.getCategory().equalsIgnoreCase(category))
                .filter(artwork -> status == null || status.isEmpty() || 
                                 (status.equalsIgnoreCase("available") && artwork.getIsAvailable()) ||
                                 (status.equalsIgnoreCase("unavailable") && !artwork.getIsAvailable()) ||
                                 (artwork.getApprovalStatus() != null && artwork.getApprovalStatus().name().equalsIgnoreCase(status)))
                .collect(Collectors.toList());
            
            int start = (int) pageable.getOffset();
            int end = Math.min((start + pageable.getPageSize()), filteredArtworks.size());
            
            List<Artwork> pageArtworks = start < end ? filteredArtworks.subList(start, end) : Collections.emptyList();
            Page<Artwork> artworkPage = new PageImpl<>(pageArtworks, pageable, filteredArtworks.size());
            return artworkPage.map(this::convertToDto);
        } else {
            Page<Artwork> artworks = artworkRepository.findAll(pageable);
            return artworks.map(this::convertToDto);
        }
    }

    @Override
    @Transactional
    public ArtworkDto updateArtwork(String artworkId, ArtworkUpdateRequest updateRequest) {
        Artwork artwork = getArtworkById(artworkId);
        
        if (updateRequest.getTitle() != null) artwork.setTitle(updateRequest.getTitle());
        if (updateRequest.getDescription() != null) artwork.setDescription(updateRequest.getDescription());
        if (updateRequest.getPrice() != null) artwork.setPrice(updateRequest.getPrice());
        if (updateRequest.getCategory() != null) artwork.setCategory(updateRequest.getCategory());
        if (updateRequest.getIsAvailable() != null) artwork.setIsAvailable(updateRequest.getIsAvailable());
        if (updateRequest.getFeatured() != null) artwork.setFeatured(updateRequest.getFeatured());
        
        artworkRepository.save(artwork);
        return convertToDto(artwork);
    }

    @Override
    @Transactional
    public void deleteArtwork(String artworkId) {
        if (!artworkRepository.existsById(artworkId)) {
            throw new ResourceNotFoundException("Artwork not found with id: " + artworkId);
        }
        artworkRepository.deleteById(artworkId);
    }
    
    @Override
    @Transactional(readOnly = true)
    public ArtworkStatsDto getArtworkStats() {
        long totalArtworks = artworkRepository.count();
        long pendingArtworks = artworkRepository.countByApprovalStatus(ApprovalStatus.PENDING);
        long approvedArtworks = artworkRepository.countByApprovalStatus(ApprovalStatus.APPROVED);
        long rejectedArtworks = artworkRepository.countByApprovalStatus(ApprovalStatus.REJECTED);
        
        return ArtworkStatsDto.builder()
                .totalArtworks(totalArtworks)
                .pendingApproval(pendingArtworks)
                .approvedArtworks(approvedArtworks)
                .rejectedArtworks(rejectedArtworks)
                .totalValue(0.0) // Placeholder, would need sum query
                .build();
    }
    
    @Override
    @Transactional
    @Caching(evict = {
        @CacheEvict(value = "artworks", allEntries = true),
        @CacheEvict(value = "featuredArtworks", allEntries = true)
    })
    public ArtworkDto approveArtwork(String artworkId, String notes) {
        Artwork artwork = getArtworkById(artworkId);
        artwork.setApprovalStatus(ApprovalStatus.APPROVED);
        artwork.setModerationNotes(notes);
        artworkRepository.save(artwork);
        log.info("Artwork '{}' approved - cache evicted", artworkId);
        return convertToDto(artwork);
    }
    
    @Override
    @Transactional
    @Caching(evict = {
        @CacheEvict(value = "artworks", allEntries = true),
        @CacheEvict(value = "featuredArtworks", allEntries = true)
    })
    public ArtworkDto rejectArtwork(String artworkId, String reason) {
        Artwork artwork = getArtworkById(artworkId);
        artwork.setApprovalStatus(ApprovalStatus.REJECTED);
        artwork.setModerationNotes(reason);
        artworkRepository.save(artwork);
        log.info("Artwork '{}' rejected - cache evicted", artworkId);
        return convertToDto(artwork);
    }
    
    @Override
    @Transactional
    public ArtworkDto featureArtwork(String artworkId) {
        Artwork artwork = getArtworkById(artworkId);
        artwork.setFeatured(true);
        artworkRepository.save(artwork);
        return convertToDto(artwork);
    }
    
    @Override
    @Transactional
    public ArtworkDto unfeatureArtwork(String artworkId) {
        Artwork artwork = getArtworkById(artworkId);
        artwork.setFeatured(false);
        artworkRepository.save(artwork);
        return convertToDto(artwork);
    }
    
    @Transactional(readOnly = true)
    public Artwork getArtworkById(String artworkId) {
        return artworkRepository.findById(artworkId)
            .orElseThrow(() -> new ResourceNotFoundException("Artwork not found with id: " + artworkId));
    }

    @Override
    @Transactional
    public com.artwork.dto.BulkOperationResult bulkApprove(java.util.List<String> artworkIds) {
        int success = 0;
        int failure = 0;
        java.util.List<String> failedIds = new java.util.ArrayList<>();

        for (String id : artworkIds) {
            try {
                // Reuse existing approve method to ensure consistency
                approveArtwork(id, "Bulk approved");
                success++;
            } catch (Exception e) {
                failure++;
                failedIds.add(id);
            }
        }

        return com.artwork.dto.BulkOperationResult.builder()
                .successCount(success)
                .failureCount(failure)
                .failedIds(failedIds)
                .build();
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<ArtworkDto> getPendingArtworks() {
        List<Artwork> pendingArtworks = artworkRepository.findByApprovalStatusOrderByCreatedAtDesc(ApprovalStatus.PENDING);
        return pendingArtworks.stream()
            .map(this::convertToDto)
            .collect(Collectors.toList());
    }
    
    @Override
    @Transactional
    @Caching(evict = {
        @CacheEvict(value = "artworks", allEntries = true),
        @CacheEvict(value = "featuredArtworks", allEntries = true),
        @CacheEvict(value = "categories", allEntries = true)
    })
    public ArtworkDto approveArtworkWithCategory(String artworkId, String notes) {
        Artwork artwork = getArtworkById(artworkId);
        
        // Get the category name from the artwork
        String categoryName = artwork.getCategory();
        
        // If category exists and is inactive, activate it first
        if (categoryName != null && !categoryName.isEmpty()) {
            // We need to use AdminCategoryService to activate the category
            // For now, we'll directly interact with the repository
            try {
                com.artwork.entity.Category category = categoryRepository.findByNameIgnoreCase(categoryName)
                    .or(() -> categoryRepository.findByNameIgnoreCase(categoryName.toUpperCase().replaceAll("\\s+", "_")))
                    .orElse(null);
                
                if (category != null && (!category.getIsActive() || category.getIsDeleted())) {
                    category.setIsActive(true);
                    category.setIsDeleted(false);
                    category.setUpdatedAt(java.time.LocalDateTime.now());
                    categoryRepository.save(category);
                    log.info("Activated category '{}' as part of artwork approval", categoryName);
                }
            } catch (Exception e) {
                log.warn("Could not activate category '{}': {}", categoryName, e.getMessage());
            }
        }
        
        // Now approve the artwork
        artwork.setApprovalStatus(ApprovalStatus.APPROVED);
        artwork.setModerationNotes(notes != null ? notes : "Approved with category activation");
        artwork.setUpdatedAt(java.time.LocalDateTime.now());
        artworkRepository.save(artwork);
        
        log.info("Artwork '{}' approved with category '{}'", artworkId, categoryName);
        return convertToDto(artwork);
    }
}
