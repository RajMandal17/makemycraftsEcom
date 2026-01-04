package com.artwork.controller;

import com.artwork.dto.HomeStatsDto;
import com.artwork.service.HomeService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;


@Slf4j
@RestController
@RequestMapping("/api/home")
@RequiredArgsConstructor
@Tag(name = "Home", description = "Home page statistics API")
public class HomeController {
    
    private final HomeService homeService;

    
    @GetMapping("/stats")
    @Operation(
        summary = "Get home page statistics",
        description = "Retrieves aggregated statistics for the home page including total artworks, artists, ratings, and sales"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Successfully retrieved statistics"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<HomeStatsDto> getHomeStatistics() {
        log.info("GET /api/home/stats - Fetching home page statistics");
        
        try {
            HomeStatsDto stats = homeService.getHomeStatistics();
            log.info("Successfully retrieved home statistics");
            return ResponseEntity.ok(stats);
            
        } catch (Exception e) {
            log.error("Error retrieving home statistics", e);
            
            HomeStatsDto emptyStats = HomeStatsDto.builder()
                    .totalArtworks(0L)
                    .totalArtists(0L)
                    .averageRating(0.0)
                    .totalSales(java.math.BigDecimal.ZERO)
                    .totalOrders(0L)
                    .totalCustomers(0L)
                    .build();
            return ResponseEntity.ok(emptyStats);
        }
    }

    
    @GetMapping("/top-sellers")
    @Operation(
        summary = "Get top-selling artworks",
        description = "Retrieves the most popular artworks based on order count for the homepage carousel"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Successfully retrieved top sellers"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<java.util.List<com.artwork.dto.ArtworkSummaryDto>> getTopSellingArtworks(
            @io.swagger.v3.oas.annotations.Parameter(description = "Maximum number of artworks to return")
            @org.springframework.web.bind.annotation.RequestParam(defaultValue = "10") int limit) {
        log.info("GET /api/home/top-sellers - Fetching top {} selling artworks", limit);
        
        try {
            
            if (limit <= 0 || limit > 50) {
                limit = 10;
            }
            
            java.util.List<com.artwork.dto.ArtworkSummaryDto> topSellers = homeService.getTopSellingArtworks(limit);
            log.info("Successfully retrieved {} top-selling artworks", topSellers.size());
            return ResponseEntity.ok(topSellers);
            
        } catch (Exception e) {
            log.error("Error retrieving top-selling artworks", e);
            
            return ResponseEntity.ok(java.util.Collections.emptyList());
        }
    }
}