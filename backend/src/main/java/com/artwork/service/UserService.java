package com.artwork.service;

import com.artwork.dto.UserDto;
import com.artwork.dto.UserUpdateRequest;
import org.springframework.web.multipart.MultipartFile;

public interface UserService {
    UserDto getUserProfile(String token);
    UserDto updateUserProfile(UserUpdateRequest updateRequest, String token);
    String updateProfileImage(MultipartFile image, String token);
    void updatePassword(String newPassword, String token);
    boolean hasPassword(String token);
}
