package com.artwork.service.admin;

import com.artwork.dto.UserDto;
import com.artwork.dto.UserStatsDto;
import org.springframework.data.domain.Page;


public interface AdminUserService {
    
    
    Page<UserDto> getUsers(int page, int limit, String role, String status);
    
    
    UserDto getUserById(String userId);

    
    
    UserDto updateUserStatus(String userId, String status);
    
    
    UserDto updateUserRole(String userId, String role);
    
    
    UserStatsDto getUserStats();
    
    
    UserDto approveUser(String userId);
    
    
    UserDto rejectUser(String userId, String reason);
    
    
    UserDto suspendUser(String userId, String reason);
    
    
    UserDto reactivateUser(String userId);
}
