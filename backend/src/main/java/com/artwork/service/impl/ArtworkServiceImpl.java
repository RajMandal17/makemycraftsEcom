package com.artwork.service.impl;

import com.artwork.dto.ArtworkDto;
import com.artwork.dto.ArtistDto;
import com.artwork.entity.ApprovalStatus;
import com.artwork.entity.Artwork;
import com.artwork.entity.User;
import com.artwork.exception.ResourceNotFoundException;
import com.artwork.repository.ArtworkRepository;
import com.artwork.repository.UserRepository;
import com.artwork.security.UserPrincipal;
import com.artwork.service.ArtworkService;
import com.artwork.service.CategoryService;
import com.artwork.service.CloudStorageService;
import lombok.extern.slf4j.Slf4j;
import java.time.LocalDateTime;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.beans.factory.annotation.Value;
import java.util.List;
import java.util.ArrayList;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Optional;
import java.util.UUID;
import java.io.IOException;
import java.util.stream.Collectors;
import org.springframework.data.domain.PageImpl;

@Service
@Slf4j
public class ArtworkServiceImpl implements ArtworkService {
    private final ArtworkRepository artworkRepository;
    private final ModelMapper modelMapper;
    private final CategoryService categoryService;
    
    @Autowired(required = false)
    private CloudStorageService cloudStorageService;
    
    @Value("${file.upload-dir:./uploads}")
    private String uploadDir;
    
    @Value("${cloudinary.enabled:false}")
    private boolean cloudinaryEnabled;
    
    public ArtworkServiceImpl(ArtworkRepository artworkRepository, ModelMapper modelMapper, CategoryService categoryService) {
        this.artworkRepository = artworkRepository;
        this.modelMapper = modelMapper;
        this.categoryService = categoryService;
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "artworks", key = "'page_' + #page + '_limit_' + #limit + '_cat_' + #category + '_price_' + #minPrice + '_' + #maxPrice + '_search_' + #search + '_artist_' + #artistId")
    public Page<ArtworkDto> getArtworks(int page, int limit, String category, Double minPrice, Double maxPrice, String search, String artistId) {
    
        PageRequest pageable = PageRequest.of(page - 1, limit);
        Page<Artwork> artworks;

        
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        boolean isAuthenticatedUser = false;
        boolean isAdmin = false;
        if (authentication != null && authentication.isAuthenticated() && !"anonymousUser".equals(authentication.getPrincipal())) {
            isAuthenticatedUser = true;
            isAdmin = authentication.getAuthorities().stream()
                    .anyMatch(a -> "ROLE_ADMIN".equals(a.getAuthority()));
        }

        
        
        if (artistId != null && !artistId.isEmpty()) {
            log.info("Querying by artistId: {} - showing all statuses for owner", artistId);
            artworks = artworkRepository.findByArtistId(artistId, pageable);
            log.info("Found {} artworks for artist {}", artworks.getTotalElements(), artistId);
        }
        
        else if (isAuthenticatedUser && isAdmin) {
            log.info("Admin view: including all statuses (APPROVED/PENDING)");
            Page<Artwork> allPage = artworkRepository.findAll(pageable);

            
            if (category != null && !category.isEmpty()) {
                
                String normalizedFilter = category.toLowerCase().replace("_", " ");
                List<Artwork> filtered = allPage.getContent().stream()
                        .filter(a -> a.getCategory() != null && 
                                (a.getCategory().equalsIgnoreCase(category) ||
                                 a.getCategory().toLowerCase().replace("_", " ").equals(normalizedFilter) ||
                                 a.getCategory().toLowerCase().replace(" ", "_").equals(category.toLowerCase())))
                        .collect(Collectors.toList());
                artworks = new PageImpl<>(filtered, pageable, filtered.size());
            } else if (search != null && !search.isEmpty()) {
                String lower = search.toLowerCase();
                List<Artwork> filtered = allPage.getContent().stream()
                        .filter(a -> a.getTitle() != null && a.getTitle().toLowerCase().contains(lower))
                        .collect(Collectors.toList());
                artworks = new PageImpl<>(filtered, pageable, filtered.size());
            } else if (minPrice != null && maxPrice != null) {
                List<Artwork> filtered = allPage.getContent().stream()
                        .filter(a -> a.getPrice() != null && a.getPrice() >= minPrice && a.getPrice() <= maxPrice)
                        .collect(Collectors.toList());
                artworks = new PageImpl<>(filtered, pageable, filtered.size());
            } else {
                artworks = allPage;
            }
        }
        
        else if (category != null && !category.isEmpty()) {
            log.info("Querying APPROVED artworks from APPROVED artists by category (normalized): {}", category);
            artworks = artworkRepository.findByApprovalStatusAndArtistStatusApprovedAndCategoryNormalized(
                ApprovalStatus.APPROVED, category, pageable
            );
        } else if (search != null && !search.isEmpty()) {
            log.info("Querying APPROVED artworks from APPROVED artists by search term: {}", search);
            artworks = artworkRepository.findByApprovalStatusAndArtistStatusApprovedAndTitleContaining(
                ApprovalStatus.APPROVED, search, pageable
            );
        } else if (minPrice != null && maxPrice != null) {
            log.info("Querying APPROVED artworks from APPROVED artists by price range: {} to {}", minPrice, maxPrice);
            
            artworks = artworkRepository.findByApprovalStatusAndArtistStatusApproved(
                ApprovalStatus.APPROVED, pageable
            );
            
        } else {
            log.info("Fetching all APPROVED artworks from APPROVED artists...");
            artworks = artworkRepository.findByApprovalStatusAndArtistStatusApproved(
                ApprovalStatus.APPROVED, pageable
            );
            log.info("Found {} approved artworks from approved artists", artworks.getTotalElements());
        }
        
        log.info("Returning {} artworks", artworks.getContent().size());
        return artworks.map(this::convertToDto);
    }

    @Override
    @CacheEvict(value = {"artworks", "featuredArtworks"}, allEntries = true)
    public ArtworkDto createArtwork(String title, String description, Double price, String category, String medium, Double width, Double height, Double depth, List<String> tags, List<MultipartFile> images, com.artwork.entity.User artist) {
        
        if (artist == null) {
            throw new RuntimeException("Artist cannot be null when creating artwork");
        }
        
        
        if (category == null || category.trim().isEmpty()) {
            throw new IllegalArgumentException("Category is required");
        }
        
        
        
        boolean isCategoryActive = categoryService.registerCategoryIfNew(category, artist.getId());
        
        
        ApprovalStatus approvalStatus;
        String moderationNotes = null;
        
        if (isCategoryActive) {
            
            approvalStatus = ApprovalStatus.APPROVED;
            log.info("Creating artwork with active category '{}' - auto-approved", category);
        } else {
            
            approvalStatus = ApprovalStatus.PENDING;
            moderationNotes = "Pending: Category '" + category + "' requires admin approval. " +
                "Once the category is activated, this artwork will also need approval.";
            log.info("Creating artwork with pending category '{}' - requires admin approval", category);
        }

        log.info("Creating artwork for artist: {} (ID: {})", artist.getEmail(), artist.getId());
        
        
        List<String> imageUrls = new ArrayList<>();
        if (images != null && !images.isEmpty()) {
            imageUrls = saveArtworkImages(images);
        }
        
        Artwork artwork = Artwork.builder()
                .title(title)
                .description(description)
                .price(price)
                .category(category)
                .medium(medium)
                .width(width)
                .height(height)
                .depth(depth)
                .tags(tags)
                .images(imageUrls)
                .isAvailable(true)
                .approvalStatus(approvalStatus)
                .moderationNotes(moderationNotes)
                .artist(artist)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
                
        artworkRepository.save(artwork);
        
        ArtworkDto dto = convertToDto(artwork);
        
        
        if (approvalStatus == ApprovalStatus.PENDING) {
            log.info("Artwork '{}' created as PENDING - awaiting category and artwork approval", title);
        }
        
        return dto;
    }

    @Override
    @Transactional(readOnly = true)
    public ArtworkDto getArtworkById(String id) {
        log.debug("Fetching artwork from database with id: {}", id);
        Artwork artwork = artworkRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Artwork not found with id: " + id));
        
        
        if (artwork.getApprovalStatus() != ApprovalStatus.APPROVED) {
            
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            
            if (authentication == null || !authentication.isAuthenticated() || 
                authentication.getPrincipal().equals("anonymousUser")) {
                
                log.warn("Anonymous user attempted to view non-approved artwork: {}", id);
                throw new ResourceNotFoundException("Artwork not found with id: " + id);
            }
            
            
            String currentUserId = null;
            boolean isAdmin = false;
            
            if (authentication.getPrincipal() instanceof UserPrincipal) {
                UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
                currentUserId = userPrincipal.getId();
                isAdmin = authentication.getAuthorities().stream()
                    .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
            }
            
            
            boolean isOwner = currentUserId != null && 
                artwork.getArtist() != null && 
                currentUserId.equals(artwork.getArtist().getId());
            
            if (!isOwner && !isAdmin) {
                log.warn("User {} attempted to view non-approved artwork {} owned by {}", 
                    currentUserId, id, artwork.getArtist() != null ? artwork.getArtist().getId() : "unknown");
                throw new ResourceNotFoundException("Artwork not found with id: " + id);
            }
            
            log.info("Allowing {} to view non-approved artwork: {}", 
                isAdmin ? "admin" : "owner", id);
        }
        
        return convertToDto(artwork);
    }
    
    private ArtworkDto convertToDto(Artwork artwork) {
        if (artwork == null) {
            return null;
        }
        
        ArtworkDto dto = modelMapper.map(artwork, ArtworkDto.class);
        
        
        if (artwork.getArtist() != null) {
            ArtistDto artistDto = modelMapper.map(artwork.getArtist(), ArtistDto.class);
            if (artistDto.getId() == null && artwork.getArtist().getId() != null) {
                artistDto.setId(artwork.getArtist().getId());
            }
            dto.setArtist(artistDto);
        }
        
        
        if (dto.getTags() == null) {
            dto.setTags(new ArrayList<>());
        }
        if (dto.getImages() == null) {
            dto.setImages(new ArrayList<>());
        }
        if (dto.getIsAvailable() == null) {
            dto.setIsAvailable(true);
        }
        if (dto.getFeatured() == null) {
            dto.setFeatured(false);
        }
        
        return dto;
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "featuredArtworks")
    public List<ArtworkDto> getFeaturedArtworks() {
        log.debug("Fetching featured APPROVED artworks from APPROVED artists");
        
        PageRequest pageable = PageRequest.of(0, 8);
        return artworkRepository.findByApprovalStatusAndArtistStatusApproved(ApprovalStatus.APPROVED, pageable)
                .map(this::convertToDto)
                .getContent();
    }

    @Override
    @CacheEvict(value = {"artwork", "artworks", "featuredArtworks"}, key = "#id")
    public ArtworkDto updateArtwork(String id, ArtworkDto artworkDto) {
        Artwork artwork = artworkRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Artwork not found with id: " + id));
        modelMapper.map(artworkDto, artwork);
        artwork.setUpdatedAt(LocalDateTime.now());
        artworkRepository.save(artwork);
        return convertToDto(artwork);
    }
    
    private List<String> saveArtworkImages(List<MultipartFile> images) {
        List<String> imageUrls = new ArrayList<>();
        
        
        if (cloudinaryEnabled && cloudStorageService != null) {
            log.info("Uploading images to Cloudinary cloud storage");
            for (MultipartFile image : images) {
                if (!image.isEmpty()) {
                    try {
                        String cloudinaryUrl = cloudStorageService.uploadFile(image, "artworks");
                        if (cloudinaryUrl != null) {
                            imageUrls.add(cloudinaryUrl);
                            log.info("Successfully uploaded image to Cloudinary: {}", cloudinaryUrl);
                        }
                    } catch (IOException e) {
                        log.error("Failed to upload image to Cloudinary", e);
                        throw new RuntimeException("Failed to upload image to cloud storage", e);
                    }
                }
            }
            return imageUrls;
        }
        
        
        
        log.error("Cloudinary is not enabled or CloudStorageService is missing. Cannot upload images.");
        throw new RuntimeException("Cloud storage is not configured. Cannot upload artwork images.");
    }
    
    @Override
    @CacheEvict(value = {"artwork", "artworks", "featuredArtworks"}, allEntries = true)
    public void deleteArtwork(String id) {
        log.debug("Deleting artwork with id: {}", id);
        artworkRepository.deleteById(id);
    }
}
