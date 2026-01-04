package com.artwork.service.impl;

import com.artwork.dto.HomeStatsDto;
import com.artwork.entity.Role;
import com.artwork.repository.ArtistRepository;
import com.artwork.repository.ArtworkRepository;
import com.artwork.repository.OrderRepository;
import com.artwork.repository.ReviewRepository;
import com.artwork.repository.UserRepository;
import com.artwork.service.HomeService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;

/**
 * Implementation of HomeService following SOLID principles
 * - Single Responsibility: Only handles home page statistics
 * - Dependency Inversion: Depends on repository abstractions
 * - Open/Closed: Extensible through additional methods without modification
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class HomeServiceImpl implements HomeService {

    private final ArtworkRepository artworkRepository;
    private final ArtistRepository artistRepository;
    private final OrderRepository orderRepository;
    private final ReviewRepository reviewRepository;
    private final UserRepository userRepository;

    /**
     * Retrieves home page statistics
     * Cached for 5 minutes to reduce database load
     * 
     * @return HomeStatsDto containing aggregated statistics
     */
    @Override
    @Cacheable(value = "homeStats", unless = "#result == null")
    public HomeStatsDto getHomeStatistics() {
        log.info("Fetching home page statistics");
        
        try {
            Long totalArtworks = getTotalArtworks();
            Long totalArtists = getTotalArtists();
            Double averageRating = getAverageRating();
            BigDecimal totalSales = getTotalSales();
            Long totalOrders = getTotalOrders();
            Long totalCustomers = getTotalCustomers();
            
            HomeStatsDto stats = HomeStatsDto.builder()
                    .totalArtworks(totalArtworks)
                    .totalArtists(totalArtists)
                    .averageRating(roundToOneDecimal(averageRating))
                    .totalSales(totalSales)
                    .totalOrders(totalOrders)
                    .totalCustomers(totalCustomers)
                    .build();
            
            log.info("Successfully retrieved home statistics: {}", stats);
            return stats;
            
        } catch (Exception e) {
            log.error("Error fetching home statistics", e);
            // Return default values instead of throwing exception
            // This ensures the home page loads even if stats fail
            return getDefaultStats();
        }
    }

    @Override
    public Long getTotalArtworks() {
        try {
            return artworkRepository.count();
        } catch (Exception e) {
            log.error("Error counting artworks", e);
            return 0L;
        }
    }

    @Override
    public Long getTotalArtists() {
        try {
            return artistRepository.count();
        } catch (Exception e) {
            log.error("Error counting artists", e);
            return 0L;
        }
    }

    @Override
    public Double getAverageRating() {
        try {
            Double avgRating = reviewRepository.getAverageRating();
            return avgRating != null ? avgRating : 0.0;
        } catch (Exception e) {
            log.error("Error calculating average rating", e);
            return 0.0;
        }
    }

    @Override
    public BigDecimal getTotalSales() {
        try {
            BigDecimal total = orderRepository.getTotalSalesAmount();
            return total != null ? total : BigDecimal.ZERO;
        } catch (Exception e) {
            log.error("Error calculating total sales", e);
            return BigDecimal.ZERO;
        }
    }

    @Override
    public Long getTotalOrders() {
        try {
            return orderRepository.count();
        } catch (Exception e) {
            log.error("Error counting orders", e);
            return 0L;
        }
    }

    @Override
    public Long getTotalCustomers() {
        try {
            return userRepository.countByRole(Role.CUSTOMER);
        } catch (Exception e) {
            log.error("Error counting customers", e);
            return 0L;
        }
    }

    @Override
    public java.util.List<com.artwork.dto.ArtworkSummaryDto> getTopSellingArtworks(int limit) {
        try {
            log.info("Fetching top {} selling artworks", limit);
            org.springframework.data.domain.Pageable pageable = 
                org.springframework.data.domain.PageRequest.of(0, limit);
            java.util.List<com.artwork.entity.Artwork> topSellers = 
                artworkRepository.findTopSellingArtworks(pageable);
            log.info("Found {} top-selling artworks", topSellers.size());
            
            // Initialize lazy collections within the transaction to avoid LazyInitializationException
            // This forces Hibernate to load the collections before the session closes
            topSellers.forEach(artwork -> {
                if (artwork.getTags() != null) {
                    artwork.getTags().size(); // Force initialization
                }
                if (artwork.getImages() != null) {
                    artwork.getImages().size(); // Force initialization
                }
            });
            
            // Convert to DTOs to avoid circular reference issues
            return topSellers.stream()
                .map(this::convertToSummaryDto)
                .collect(java.util.stream.Collectors.toList());
        } catch (Exception e) {
            log.error("Error fetching top-selling artworks", e);
            // Return empty list on error
            return java.util.Collections.emptyList();
        }
    }
    
    /**
     * Converts Artwork entity to ArtworkSummaryDto
     * Prevents circular reference issues with Artist entity
     * Note: Lazy collections (tags, images) must be initialized before calling this method
     */
    private com.artwork.dto.ArtworkSummaryDto convertToSummaryDto(com.artwork.entity.Artwork artwork) {
        String artistName = null;
        String artistProfilePic = null;
        
        if (artwork.getArtist() != null) {
            artistName = (artwork.getArtist().getFirstName() + " " + 
                         artwork.getArtist().getLastName()).trim();
            artistProfilePic = artwork.getArtist().getProfilePictureUrl();
        }
        
        // Safely copy lazy-loaded collections to avoid LazyInitializationException
        java.util.List<String> imagesCopy = artwork.getImages() != null ? 
            new java.util.ArrayList<>(artwork.getImages()) : null;
        java.util.List<String> tagsCopy = artwork.getTags() != null ? 
            new java.util.ArrayList<>(artwork.getTags()) : null;
        
        return com.artwork.dto.ArtworkSummaryDto.builder()
                .id(artwork.getId())
                .title(artwork.getTitle())
                .description(artwork.getDescription())
                .price(artwork.getPrice() != null ? 
                    java.math.BigDecimal.valueOf(artwork.getPrice()) : null)
                .category(artwork.getCategory())
                .medium(artwork.getMedium())
                .width(artwork.getWidth())
                .height(artwork.getHeight())
                .images(imagesCopy)
                .tags(tagsCopy)
                .isAvailable(artwork.getIsAvailable())
                .featured(artwork.getFeatured())
                .artistId(artwork.getArtistId())
                .artistName(artistName)
                .artistProfilePicture(artistProfilePic)
                .averageRating(null)  // Not available in entity
                .reviewCount(null)    // Not available in entity
                .stock(null)          // Not available in entity
                .imageUrl(imagesCopy != null && !imagesCopy.isEmpty() ? 
                    imagesCopy.get(0) : null)
                .createdAt(artwork.getCreatedAt())
                .build();
    }

    /**
     * Rounds a double value to one decimal place
     * 
     * @param value the value to round
     * @return rounded value
     */
    private Double roundToOneDecimal(Double value) {
        if (value == null) {
            return 0.0;
        }
        return BigDecimal.valueOf(value)
                .setScale(1, RoundingMode.HALF_UP)
                .doubleValue();
    }

    /**
     * Returns default statistics when database queries fail
     * Ensures graceful degradation
     * 
     * @return HomeStatsDto with default values
     */
    private HomeStatsDto getDefaultStats() {
        return HomeStatsDto.builder()
                .totalArtworks(0L)
                .totalArtists(0L)
                .averageRating(0.0)
                .totalSales(BigDecimal.ZERO)
                .totalOrders(0L)
                .totalCustomers(0L)
                .build();
    }
}
