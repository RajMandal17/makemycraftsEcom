package com.artwork.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;


@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserStatsDto {
    private Long totalUsers;
    private Long totalCustomers;
    private Long totalArtists;
    private Long totalAdmins;
    private Long pendingApprovals;
    private Long activeUsers24h;
    private Long activeUsers7d;
    private Long activeUsers30d;
    private Long newUsersToday;
    private Long newUsersThisWeek;
    private Long newUsersThisMonth;
}