package com.artwork.service.impl.admin;

import com.artwork.dto.UserDto;
import com.artwork.dto.UserStatsDto;
import com.artwork.entity.Role;
import com.artwork.entity.User;
import com.artwork.entity.UserStatus;
import com.artwork.exception.ResourceNotFoundException;
import com.artwork.repository.UserRepository;
import com.artwork.service.admin.AdminUserService;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
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
public class AdminUserServiceImpl implements AdminUserService {
    
    private final UserRepository userRepository;
    private final ModelMapper modelMapper;

    @Override
    public Page<UserDto> getUsers(int page, int limit, String role, String status) {
        // Convert from 1-indexed (frontend) to 0-indexed (Spring Data)
        // Frontend sends page=1 for first page, Spring Data expects page=0
        int pageIndex = Math.max(0, page - 1);
        Pageable pageable = PageRequest.of(pageIndex, limit);
        
        // This filtering logic should ideally be in the repository using Specifications
        // But keeping existing logic for now to minimize risk
        if ((role != null && !role.isEmpty()) || (status != null && !status.isEmpty())) {
            List<User> allUsers = userRepository.findAll();
            List<User> filteredUsers = allUsers.stream()
                .filter(user -> role == null || role.isEmpty() || user.getRole().name().equalsIgnoreCase(role))
                .filter(user -> status == null || status.isEmpty() || 
                               (user.getStatus() != null && user.getStatus().name().equalsIgnoreCase(status)))
                .collect(Collectors.toList());
            
            int start = (int) pageable.getOffset();
            int end = Math.min((start + pageable.getPageSize()), filteredUsers.size());
            
            List<User> pageUsers = start < end ? filteredUsers.subList(start, end) : Collections.emptyList();
            Page<User> userPage = new PageImpl<>(pageUsers, pageable, filteredUsers.size());
            return userPage.map(user -> modelMapper.map(user, UserDto.class));
        } else {
            Page<User> users = userRepository.findAll(pageable);
            return users.map(user -> modelMapper.map(user, UserDto.class));
        }
    }


    @Override
    @Transactional
    public UserDto updateUserStatus(String userId, String status) {
        User user = getUserEntity(userId);
        try {
            UserStatus userStatus = UserStatus.valueOf(status.toUpperCase());
            user.setStatus(userStatus);
            userRepository.save(user);
            return modelMapper.map(user, UserDto.class);
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid user status: " + status);
        }
    }

    @Override
    @Transactional
    public UserDto updateUserRole(String userId, String role) {
        User user = getUserEntity(userId);
        try {
            Role userRole = Role.valueOf(role.toUpperCase());
            user.setRole(userRole);
            userRepository.save(user);
            return modelMapper.map(user, UserDto.class);
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid user role: " + role);
        }
    }

    
    @Override
    public UserStatsDto getUserStats() {
        long totalUsers = userRepository.count();
        long totalCustomers = userRepository.countByRole(Role.CUSTOMER);
        long totalArtists = userRepository.countByRole(Role.ARTIST);
        long totalAdmins = userRepository.countByRole(Role.ADMIN);
        long pendingApprovals = userRepository.countByStatus(UserStatus.PENDING);
        
        return UserStatsDto.builder()
                .totalUsers(totalUsers)
                .totalCustomers(totalCustomers)
                .totalArtists(totalArtists)
                .totalAdmins(totalAdmins)
                .pendingApprovals(pendingApprovals)
                .activeUsers24h(0L) // Placeholder
                .activeUsers7d(0L) // Placeholder
                .activeUsers30d(0L) // Placeholder
                .newUsersToday(0L) // Placeholder
                .newUsersThisWeek(0L) // Placeholder
                .newUsersThisMonth(0L) // Placeholder
                .build();
    }
    
    @Override
    @Transactional
    public UserDto approveUser(String userId) {
        return updateUserStatus(userId, "APPROVED");
    }
    
    @Override
    @Transactional
    public UserDto rejectUser(String userId, String reason) {
        // In a real implementation, we would log the reason or send an email
        return updateUserStatus(userId, "REJECTED");
    }
    
    @Override
    @Transactional
    public UserDto suspendUser(String userId, String reason) {
        // In a real implementation, we would log the reason or send an email
        return updateUserStatus(userId, "SUSPENDED");
    }
    
    @Override
    @Transactional
    public UserDto reactivateUser(String userId) {
        return updateUserStatus(userId, "APPROVED");
    }
    
    @Override
    public UserDto getUserById(String userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        return modelMapper.map(user, UserDto.class);
    }
    
    // Private helper method for internal use
    private User getUserEntity(String userId) {
        return userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
    }
}

