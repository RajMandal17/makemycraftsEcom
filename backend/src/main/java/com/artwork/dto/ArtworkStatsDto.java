package com.artwork.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for aggregated artwork statistics.
 *
 * @author Admin Dashboard Team
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ArtworkStatsDto {

    private Long totalArtworks;
    private Long pendingApproval;
    private Long approvedArtworks;
    private Long rejectedArtworks;
    private Long featuredArtworks;
    private Long availableArtworks;
    private Long soldArtworks;
    private Double averagePrice;
    private Double totalValue;

    // Growth metrics
    private Long newArtworksToday;
    private Long newArtworksThisWeek;
    private Long newArtworksThisMonth;
    private Double artworkGrowthRate;
}