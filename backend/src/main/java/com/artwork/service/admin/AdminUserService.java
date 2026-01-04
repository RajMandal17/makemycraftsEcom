package com.artwork.service.admin;

import com.artwork.dto.UserDto;
import com.artwork.dto.UserStatsDto;
import org.springframework.data.domain.Page;

/**
 * Service interface for admin user management operations.
 * 
 * SOLID Principles:
 * - Single Responsibility: Only handles user-related admin operations
 * - Interface Segregation: Focused interface with only user operations
 * - Dependency Inversion: Clients depend on abstraction, not implementation
 * 
 * @author Raj Mandal
 */
public interface AdminUserService {
    
    /**
     * Retrieve paginated list of users with optional filtering.
     * 
     * @param page Page number (0-indexed)
     * @param limit Number of items per page
     * @param role Optional role filter (CUSTOMER, ARTIST, ADMIN)
     * @param status Optional status filter (APPROVED, PENDING, SUSPENDED)
     * @return Paginated list of users
     */
    Page<UserDto> getUsers(int page, int limit, String role, String status);
    
    /**
     * Get user by ID.
     * 
     * @param userId User ID
     * @return User DTO
     */
    UserDto getUserById(String userId);

    
    /**
     * Update user status.
     * 
     * @param userId User ID
     * @param status New status (APPROVED, PENDING, SUSPENDED, REJECTED)
     * @return Updated user DTO
     */
    UserDto updateUserStatus(String userId, String status);
    
    /**
     * Update user role.
     * 
     * @param userId User ID
     * @param role New role (CUSTOMER, ARTIST, ADMIN)
     * @return Updated user DTO
     */
    UserDto updateUserRole(String userId, String role);
    
    /**
     * Get user statistics for admin dashboard.
     * 
     * @return User statistics
     */
    UserStatsDto getUserStats();
    
    /**
     * Approve a pending user.
     * 
     * @param userId User ID
     * @return Approved user DTO
     */
    UserDto approveUser(String userId);
    
    /**
     * Reject a pending user.
     * 
     * @param userId User ID
     * @param reason Rejection reason
     * @return Rejected user DTO
     */
    UserDto rejectUser(String userId, String reason);
    
    /**
     * Suspend an active user.
     * 
     * @param userId User ID
     * @param reason Suspension reason
     * @return Suspended user DTO
     */
    UserDto suspendUser(String userId, String reason);
    
    /**
     * Reactivate a suspended user.
     * 
     * @param userId User ID
     * @return Reactivated user DTO
     */
    UserDto reactivateUser(String userId);
}
