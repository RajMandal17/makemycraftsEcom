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
            
            
            
            topSellers.forEach(artwork -> {
                if (artwork.getTags() != null) {
                    artwork.getTags().size(); 
                }
                if (artwork.getImages() != null) {
                    artwork.getImages().size(); 
                }
            });
            
            
            return topSellers.stream()
                .map(this::convertToSummaryDto)
                .collect(java.util.stream.Collectors.toList());
        } catch (Exception e) {
            log.error("Error fetching top-selling artworks", e);
            
            return java.util.Collections.emptyList();
        }
    }
    
    
    private com.artwork.dto.ArtworkSummaryDto convertToSummaryDto(com.artwork.entity.Artwork artwork) {
        String artistName = null;
        String artistProfilePic = null;
        
        if (artwork.getArtist() != null) {
            artistName = (artwork.getArtist().getFirstName() + " " + 
                         artwork.getArtist().getLastName()).trim();
            artistProfilePic = artwork.getArtist().getProfilePictureUrl();
        }
        
        
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
                .averageRating(null)  
                .reviewCount(null)    
                .stock(null)          
                .imageUrl(imagesCopy != null && !imagesCopy.isEmpty() ? 
                    imagesCopy.get(0) : null)
                .createdAt(artwork.getCreatedAt())
                .build();
    }

    
    private Double roundToOneDecimal(Double value) {
        if (value == null) {
            return 0.0;
        }
        return BigDecimal.valueOf(value)
                .setScale(1, RoundingMode.HALF_UP)
                .doubleValue();
    }

    
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
