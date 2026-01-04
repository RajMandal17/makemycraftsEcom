package com.artwork.controller.admin;

import com.artwork.dto.UserDto;
import com.artwork.service.admin.AdminUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping({"/api/admin/users", "/api/v1/admin/users"})
@RequiredArgsConstructor
public class AdminUserController {
    
    private final AdminUserService adminUserService;

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping
    public ResponseEntity<?> getUsers(@RequestParam(defaultValue = "1") int page,
                                      @RequestParam(defaultValue = "20") int limit,
                                      @RequestParam(required = false) String role,
                                      @RequestParam(required = false) String status) {
        Page<UserDto> users = adminUserService.getUsers(page, limit, role, status);
        Map<String, Object> response = new HashMap<>();
        response.put("data", Map.of(
            "users", users.getContent(),
            "total", users.getTotalElements(),
            "totalPages", users.getTotalPages(),
            "currentPage", users.getNumber() + 1  
        ));
        response.put("message", "Users retrieved successfully");
        response.put("success", true);
        return ResponseEntity.ok(response);
    }
    
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/{userId}")
    public ResponseEntity<?> getUserById(@PathVariable String userId) {
        UserDto user = adminUserService.getUserById(userId);
        Map<String, Object> response = new HashMap<>();
        response.put("data", user);
        response.put("message", "User retrieved successfully");
        response.put("success", true);
        return ResponseEntity.ok(response);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{userId}/status")
    public ResponseEntity<?> updateUserStatus(@PathVariable String userId, 
                                            @RequestBody Map<String, String> statusUpdate) {
        UserDto user = adminUserService.updateUserStatus(userId, statusUpdate.get("status"));
        Map<String, Object> response = new HashMap<>();
        response.put("data", user);
        response.put("message", "User status updated successfully");
        response.put("success", true);
        return ResponseEntity.ok(response);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{userId}/role")
    public ResponseEntity<?> updateUserRole(@PathVariable String userId, 
                                          @RequestBody Map<String, String> roleUpdate) {
        UserDto user = adminUserService.updateUserRole(userId, roleUpdate.get("role"));
        Map<String, Object> response = new HashMap<>();
        response.put("data", user);
        response.put("message", "User role updated successfully");
        response.put("success", true);
        return ResponseEntity.ok(response);
    }
    
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/{userId}/suspend")
    public ResponseEntity<?> suspendUser(@PathVariable String userId,
                                        @RequestBody Map<String, Object> request) {
        String reason = (String) request.getOrDefault("reason", "Admin action");
        UserDto user = adminUserService.suspendUser(userId, reason);
        Map<String, Object> response = new HashMap<>();
        response.put("data", user);
        response.put("message", "User suspended successfully");
        response.put("success", true);
        return ResponseEntity.ok(response);
    }
    
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/{userId}/approve")
    public ResponseEntity<?> approveUser(@PathVariable String userId) {
        UserDto user = adminUserService.approveUser(userId);
        Map<String, Object> response = new HashMap<>();
        response.put("data", user);
        response.put("message", "User approved successfully");
        response.put("success", true);
        return ResponseEntity.ok(response);
    }
    
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/{userId}/reject")
    public ResponseEntity<?> rejectUser(@PathVariable String userId,
                                       @RequestBody Map<String, String> request) {
        String reason = request.getOrDefault("reason", "Admin action");
        UserDto user = adminUserService.rejectUser(userId, reason);
        Map<String, Object> response = new HashMap<>();
        response.put("data", user);
        response.put("message", "User rejected successfully");
        response.put("success", true);
        return ResponseEntity.ok(response);
    }
    
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/{userId}/reactivate")
    public ResponseEntity<?> reactivateUser(@PathVariable String userId) {
        UserDto user = adminUserService.reactivateUser(userId);
        Map<String, Object> response = new HashMap<>();
        response.put("data", user);
        response.put("message", "User reactivated successfully");
        response.put("success", true);
        return ResponseEntity.ok(response);
    }
    
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/stats")
    public ResponseEntity<?> getUserStats() {
        
        com.artwork.dto.UserStatsDto stats = adminUserService.getUserStats();
        
        Map<String, Object> response = new HashMap<>();
        response.put("data", stats);
        response.put("message", "User stats retrieved successfully");
        response.put("success", true);
        return ResponseEntity.ok(response);
    }
}

