package com.artwork.service.impl;

import com.artwork.dto.SocialLinksDto;
import com.artwork.dto.UserDto;
import com.artwork.dto.UserUpdateRequest;
import com.artwork.entity.SocialLinks;
import com.artwork.entity.User;
import com.artwork.exception.InvalidPasswordException;
import com.artwork.exception.ResourceNotFoundException;
import com.artwork.repository.SocialLinksRepository;
import com.artwork.repository.UserRepository;
import com.artwork.service.CloudStorageService;
import com.artwork.service.UserService;
import com.artwork.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.UUID;

@Service
@Slf4j
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {
    private final UserRepository userRepository;
    private final SocialLinksRepository socialLinksRepository;
    private final JwtUtil jwtUtil;
    private final CloudStorageService cloudStorageService;
    private final org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder passwordEncoder;
    private final org.springframework.context.ApplicationEventPublisher eventPublisher;
    
    @Value("${file.upload-dir:./uploads}")
    private String uploadDir;
    
    @Value("${cloudinary.enabled:false}")
    private boolean cloudinaryEnabled;
    
    @Value("${app.base-url}")
    private String baseUrl;

    @Override
    @Cacheable(value = "users", key = "#token")
    public UserDto getUserProfile(String token) {
        log.debug("Fetching user profile from database");
        String userId = jwtUtil.extractUserId(token);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        return mapToDto(user);
    }

    @Override
    @CacheEvict(value = "users", key = "#token")
    public UserDto updateUserProfile(UserUpdateRequest updateRequest, String token) {
        String userId = jwtUtil.extractUserId(token);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        
        if (updateRequest.getFirstName() != null) {
            user.setFirstName(updateRequest.getFirstName());
        }
        
        if (updateRequest.getLastName() != null) {
            user.setLastName(updateRequest.getLastName());
        }
        
        
        if (updateRequest.getBio() != null) {
            user.setBio(updateRequest.getBio());
        }
        
        if (updateRequest.getWebsite() != null) {
            user.setWebsite(updateRequest.getWebsite());
        }
        
        
        if (updateRequest.getSocialLinks() != null) {
            SocialLinksDto linksDto = updateRequest.getSocialLinks();
            SocialLinks socialLinks = user.getSocialLinks();
            
            if (socialLinks == null) {
                socialLinks = new SocialLinks();
                socialLinks.setUser(user);
                user.setSocialLinks(socialLinks);
            }
            
            socialLinks.setInstagram(linksDto.getInstagram());
            socialLinks.setTwitter(linksDto.getTwitter());
            socialLinks.setFacebook(linksDto.getFacebook());
        }

        user.setUpdatedAt(LocalDateTime.now());
        User savedUser = userRepository.save(user);
        return mapToDto(savedUser);
    }

    @Override
    @CacheEvict(value = "users", key = "#token")
    public String updateProfileImage(MultipartFile image, String token) {
        try {
            String userId = jwtUtil.extractUserId(token);
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new ResourceNotFoundException("User not found"));
            
            String imageUrl;
            
            
            if (cloudinaryEnabled && cloudStorageService != null) {
                log.info("Uploading profile image to Cloudinary cloud storage");
                imageUrl = cloudStorageService.uploadFile(image, "profiles");
                if (imageUrl != null) {
                    log.info("Successfully uploaded profile image to Cloudinary: {}", imageUrl);
                } else {
                    log.error("Cloudinary upload returned null - Cloudinary may not be configured");
                    throw new RuntimeException("Failed to upload image to cloud storage");
                }
            } else {
                
                log.info("Cloudinary not enabled, using local storage for profile image");
                
                
                Path uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();
                if (!Files.exists(uploadPath)) {
                    Files.createDirectories(uploadPath);
                }
                
                
                String filename = sanitizeFilename(image.getOriginalFilename());
                Path targetLocation = uploadPath.resolve(filename).normalize();
                
                
                if (!targetLocation.startsWith(uploadPath)) {
                    log.error("Path traversal attempt detected: original={}, resolved={}", 
                        image.getOriginalFilename(), targetLocation);
                    throw new SecurityException("Invalid file path detected");
                }
                
                
                Files.copy(image.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);
                
                
                imageUrl = "/uploads/" + filename;
                log.info("Successfully saved profile image locally: {}", imageUrl);
            }
            
            user.setProfileImage(imageUrl);
        user.setProfilePictureUrl(imageUrl);
        userRepository.save(user);
        
        return getFullImageUrl(imageUrl);
        } catch (IOException ex) {
            log.error("Failed to store profile image", ex);
            throw new RuntimeException("Failed to store profile image", ex);
        }
    }
    
    @Override
    @CacheEvict(value = "users", key = "#token")
    public void updatePassword(String newPassword, String token) {
        log.debug("Processing password update request");
        
        
        String userId = jwtUtil.extractUserId(token);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        
        String encodedPassword = passwordEncoder.encode(newPassword);
        user.setPassword(encodedPassword);
        user.setUpdatedAt(java.time.LocalDateTime.now());
        
        userRepository.save(user);
        log.info("Password successfully updated for user {}", userId);
        
        
        sendPasswordChangeNotification(user);
    }
    
    private void sendPasswordChangeNotification(User user) {
        try {
            java.util.Map<String, Object> variables = new java.util.HashMap<>();
            variables.put("name", user.getFirstName());
            variables.put("changeDate", LocalDateTime.now().toString());
            variables.put("ipAddress", "Unknown"); 
            variables.put("device", "Unknown"); 
            
            eventPublisher.publishEvent(new com.artwork.event.EmailEvent(
                this,
                user.getEmail(),
                "Security Alert: Password Changed - MakeMyCrafts",
                "email/password-changed",
                variables
            ));
            
            log.info("Password change notification sent to {}", user.getEmail());
        } catch (Exception e) {
            log.error("Failed to send password change notification", e);
            
        }
    }
    
    @Override
    public boolean hasPassword(String token) {
        String userId = jwtUtil.extractUserId(token);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        return user.getPassword() != null && !user.getPassword().isEmpty();
    }
    
    
    private String sanitizeFilename(String originalFilename) {
        if (originalFilename == null || originalFilename.trim().isEmpty()) {
            return UUID.randomUUID().toString() + ".tmp";
        }
        
        
        String extension = "";
        int lastDotIndex = originalFilename.lastIndexOf('.');
        if (lastDotIndex > 0 && lastDotIndex < originalFilename.length() - 1) {
            extension = originalFilename.substring(lastDotIndex);
        }
        
        
        String sanitized = originalFilename
            .replace("/", "")                    
            .replace("\\", "")                   
            .replace("..", "")                   
            .replaceAll("[^a-zA-Z0-9._-]", "_"); 
        
        
        if (sanitized.isEmpty() || sanitized.equals(extension)) {
            sanitized = "file" + extension;
        }
        
        
        if (sanitized.length() > 100) {
            String name = sanitized.substring(0, 100 - extension.length());
            sanitized = name + extension;
        }
        
        
        return UUID.randomUUID().toString() + "_" + sanitized;
    }
    
    private UserDto mapToDto(User user) {
        UserDto dto = new UserDto();
        dto.setId(user.getId());
        dto.setEmail(user.getEmail());
        dto.setFirstName(user.getFirstName());
        dto.setLastName(user.getLastName());
        dto.setRole(user.getRole().name());
        dto.setProfileImage(getFullImageUrl(user.getProfileImage()));
        dto.setProfilePictureUrl(getFullImageUrl(user.getProfilePictureUrl()));
        dto.setCreatedAt(user.getCreatedAt().toString());
        dto.setIsActive(user.getIsActive());
        
        
        dto.setBio(user.getBio());
        dto.setWebsite(user.getWebsite());
        
        
        if (user.getSocialLinks() != null) {
            SocialLinksDto socialLinksDto = new SocialLinksDto();
            socialLinksDto.setInstagram(user.getSocialLinks().getInstagram());
            socialLinksDto.setTwitter(user.getSocialLinks().getTwitter());
            socialLinksDto.setFacebook(user.getSocialLinks().getFacebook());
            dto.setSocialLinks(socialLinksDto);
        } else {
            
            dto.setSocialLinks(new SocialLinksDto());
        }
        
        return dto;
    }
    
    private String getFullImageUrl(String imageUrl) {
        if (imageUrl == null || imageUrl.trim().isEmpty()) {
            return null;
        }
        if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
            return imageUrl; 
        }
        return baseUrl + imageUrl; 
    }
}
