package com.artwork.security;

import com.artwork.entity.Role;
import com.artwork.entity.User;
import com.artwork.entity.UserStatus;
import com.artwork.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.OAuth2Error;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;

/**
 * Custom OAuth2 user service that handles loading or creating users from OAuth2 providers
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class CustomOAuth2UserService extends DefaultOAuth2UserService {
    
    private final UserRepository userRepository;
    private final com.artwork.util.UsernameGenerator usernameGenerator;
    
    @Override
    @Transactional
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        // Load the OAuth2 user from the provider (Google, Facebook, etc.)
        OAuth2User oauth2User = super.loadUser(userRequest);
        
        try {
            return processOAuth2User(userRequest, oauth2User);
        } catch (Exception ex) {
            log.error("Error processing OAuth2 user: {}", ex.getMessage(), ex);
            throw new OAuth2AuthenticationException(
                new OAuth2Error("processing_error", "Error processing OAuth2 user", null),
                ex
            );
        }
    }
    
    private OAuth2User processOAuth2User(OAuth2UserRequest userRequest, OAuth2User oauth2User) {
        String registrationId = userRequest.getClientRegistration().getRegistrationId();
        Map<String, Object> attributes = oauth2User.getAttributes();
        
        // Extract user info based on provider
        OAuth2UserInfo userInfo = OAuth2UserInfoFactory.getOAuth2UserInfo(registrationId, attributes);
        
        if (userInfo.getEmail() == null || userInfo.getEmail().isEmpty()) {
            throw new OAuth2AuthenticationException(
                new OAuth2Error("email_not_found", "Email not found from OAuth2 provider", null)
            );
        }
        
        // Check if user exists by email
        Optional<User> userOptional = userRepository.findByEmail(userInfo.getEmail());
        User user;
        
        if (userOptional.isPresent()) {
            user = userOptional.get();
            // Update OAuth2 info if user logged in with OAuth2 for the first time
            if (user.getOauth2Provider() == null) {
                user = updateExistingUser(user, registrationId, userInfo);
            } else if (!user.getOauth2Provider().equals(registrationId)) {
                // User already exists with different OAuth2 provider or regular registration
                log.warn("User {} already exists with different provider: {}", 
                    userInfo.getEmail(), user.getOauth2Provider());
                // Still allow login but don't update provider info
            }
        } else {
            // Create new user from OAuth2 info
            user = createNewUser(registrationId, userInfo);
        }
        
        return new CustomOAuth2User(attributes, user);
    }
    
    private User createNewUser(String provider, OAuth2UserInfo userInfo) {
        log.info("Creating new user from OAuth2 provider: {}", provider);
        
        // Generate unique username from email
        String username = usernameGenerator.generateUniqueUsername(
            userInfo.getEmail(), 
            userInfo.getFirstName()
        );
        
        User user = User.builder()
            .email(userInfo.getEmail())
            .password("") // No password for OAuth2 users
            .firstName(userInfo.getFirstName())
            .lastName(userInfo.getLastName())
            .username(username)
            .role(Role.PENDING) // OAuth2 users need to select their role
            .oauth2Provider(provider)
            .oauth2Id(userInfo.getId())
            .profilePictureUrl(userInfo.getImageUrl())
            .emailVerified(true) // OAuth2 emails are verified by the provider
            .isActive(true)
            .enabled(true)
            .status(UserStatus.APPROVED)
            .createdAt(LocalDateTime.now())
            .updatedAt(LocalDateTime.now())
            .build();
        
        return userRepository.save(user);
    }
    
    private User updateExistingUser(User existingUser, String provider, OAuth2UserInfo userInfo) {
        log.info("Updating existing user with OAuth2 info: {}", existingUser.getEmail());
        
        existingUser.setOauth2Provider(provider);
        existingUser.setOauth2Id(userInfo.getId());
        existingUser.setProfilePictureUrl(userInfo.getImageUrl());
        existingUser.setEmailVerified(true);
        existingUser.setUpdatedAt(LocalDateTime.now());
        
        // Update name if not set
        if (existingUser.getFirstName() == null || existingUser.getFirstName().isEmpty()) {
            existingUser.setFirstName(userInfo.getFirstName());
        }
        if (existingUser.getLastName() == null || existingUser.getLastName().isEmpty()) {
            existingUser.setLastName(userInfo.getLastName());
        }
        
        return userRepository.save(existingUser);
    }
}
