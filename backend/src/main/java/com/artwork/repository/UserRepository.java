package com.artwork.repository;

import com.artwork.entity.Role;
import com.artwork.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, String> {
    @Query("SELECT u FROM User u WHERE LOWER(u.email) = LOWER(:email)")
    Optional<User> findByEmail(String email);
    
    @Query("SELECT COUNT(u) > 0 FROM User u WHERE LOWER(u.email) = LOWER(:email)")
    boolean existsByEmail(String email);
    
    // Username queries for LinkedIn-style profile URLs
    @Query("SELECT u FROM User u WHERE LOWER(u.username) = LOWER(:username)")
    Optional<User> findByUsername(String username);
    
    @Query("SELECT COUNT(u) > 0 FROM User u WHERE LOWER(u.username) = LOWER(:username)")
    boolean existsByUsername(String username);
    
    List<User> findByRole(Role role);
    Page<User> findByRole(Role role, Pageable pageable);
    
    @Query("SELECT u FROM User u WHERE u.role = :role AND (LOWER(u.firstName) LIKE %:search% OR LOWER(u.lastName) LIKE %:search% OR LOWER(u.username) LIKE %:search%)")
    Page<User> findByRoleAndNameContaining(Role role, String search, Pageable pageable);
    
    // Find approved artists only (for public display)
    @Query("SELECT u FROM User u WHERE u.role = :role AND u.status = 'APPROVED'")
    Page<User> findByRoleAndStatusApproved(Role role, Pageable pageable);
    
    @Query("SELECT u FROM User u WHERE u.role = :role AND u.status = 'APPROVED' AND (LOWER(u.firstName) LIKE %:search% OR LOWER(u.lastName) LIKE %:search% OR LOWER(u.username) LIKE %:search%)")
    Page<User> findByRoleAndStatusApprovedAndNameContaining(Role role, String search, Pageable pageable);
    
    /**
     * Count users by role
     * 
     * @param role the role to count
     * @return number of users with the specified role
     */
    Long countByRole(Role role);
    
    /**
     * Count users by status
     * 
     * @param status the status to count
     * @return number of users with the specified status
     */
    Long countByStatus(com.artwork.entity.UserStatus status);
    
    /**
     * Count users created after a specific date/time
     * Used for tracking new users today
     */
    long countByCreatedAtAfter(java.time.LocalDateTime dateTime);
    
    /**
     * Count users by role and status
     * Used for pending artist approvals count
     */
    @Query("SELECT COUNT(u) FROM User u WHERE u.role = :role AND u.status = :status")
    long countByRoleAndStatus(@org.springframework.data.repository.query.Param("role") Role role, 
                               @org.springframework.data.repository.query.Param("status") com.artwork.entity.UserStatus status);
}
