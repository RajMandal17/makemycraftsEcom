package com.artwork.security;

import com.artwork.entity.Role;
import com.artwork.entity.User;
import com.artwork.entity.UserStatus;
import com.artwork.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.oauth2.client.oidc.userinfo.OidcUserRequest;
import org.springframework.security.oauth2.client.oidc.userinfo.OidcUserService;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.OAuth2Error;
import org.springframework.security.oauth2.core.oidc.user.DefaultOidcUser;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;

/**
 * Custom OIDC user service that handles loading or creating users from OIDC providers (like Google)
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class CustomOidcUserService extends OidcUserService {
    
    private final UserRepository userRepository;
    private final com.artwork.util.UsernameGenerator usernameGenerator;
    
    @Override
    @Transactional
    public OidcUser loadUser(OidcUserRequest userRequest) throws OAuth2AuthenticationException {
        OidcUser oidcUser = super.loadUser(userRequest);
        
        try {
            return processOidcUser(userRequest, oidcUser);
        } catch (Exception ex) {
            log.error("Error processing OIDC user", ex);
            throw new OAuth2AuthenticationException(
                new OAuth2Error("processing_error", "Error processing OIDC user", null), ex);
        }
    }
    
    private OidcUser processOidcUser(OidcUserRequest userRequest, OidcUser oidcUser) {
        String registrationId = userRequest.getClientRegistration().getRegistrationId();
        
        // Extract user info from OIDC user
        OAuth2UserInfo oAuth2UserInfo = OAuth2UserInfoFactory.getOAuth2UserInfo(registrationId, oidcUser.getAttributes());
        
        if (oAuth2UserInfo.getEmail() == null || oAuth2UserInfo.getEmail().isEmpty()) {
            throw new OAuth2AuthenticationException(
                new OAuth2Error("email_not_found", "Email not found from OAuth2 provider", null));
        }
        
        Optional<User> userOptional = userRepository.findByEmail(oAuth2UserInfo.getEmail());
        User user;
        
        if (userOptional.isPresent()) {
            user = userOptional.get();
            user = updateExistingUser(user, oAuth2UserInfo, registrationId);
        } else {
            user = createNewUser(oAuth2UserInfo, registrationId);
        }
        
        // Return a CustomOAuth2User wrapped as OidcUser
        return new CustomOidcUser(oidcUser, user);
    }
    
    private User createNewUser(OAuth2UserInfo oAuth2UserInfo, String registrationId) {
        log.info("Creating new OIDC user with email: {}", oAuth2UserInfo.getEmail());
        
        try {
            // Split name into first and last name
            String fullName = oAuth2UserInfo.getName();
            String firstName = fullName;
            String lastName = "";
            if (fullName != null && fullName.contains(" ")) {
                String[] nameParts = fullName.split(" ", 2);
                firstName = nameParts[0];
                lastName = nameParts[1];
            }
            
            // Generate unique username from email
            String username = usernameGenerator.generateUniqueUsername(
                oAuth2UserInfo.getEmail(), 
                firstName
            );
            
            User user = User.builder()
                .email(oAuth2UserInfo.getEmail())
                .firstName(firstName)
                .lastName(lastName)
                .username(username)
                .password("") // OAuth2 users don't need password
                .profilePictureUrl(oAuth2UserInfo.getImageUrl())
                .oauth2Provider(registrationId)
                .oauth2Id(oAuth2UserInfo.getId())
                .emailVerified(true) // OAuth2 providers typically verify emails
                .role(Role.PENDING) // OAuth2 users need to select their role
                .status(UserStatus.APPROVED) // Set status to APPROVED
                .isActive(true)
                .enabled(true)
                .createdAt(java.time.LocalDateTime.now())
                .updatedAt(java.time.LocalDateTime.now())
                .build();
            
            log.info("Attempting to save user: email={}, firstName={}, lastName={}, provider={}", 
                user.getEmail(), user.getFirstName(), user.getLastName(), user.getOauth2Provider());
            
            user = userRepository.save(user);
            log.info("Successfully created new OIDC user with ID: {}, email: {}", user.getId(), user.getEmail());
            
            // Verify user was saved by checking if we can fetch it back
            Optional<User> verifyUser = userRepository.findByEmail(user.getEmail());
            if (verifyUser.isPresent()) {
                log.info("User save verification successful: User found with ID: {}", verifyUser.get().getId());
            } else {
                log.error("User save verification failed: User not found after save operation");
            }
            
            return user;
        } catch (Exception e) {
            log.error("Failed to create new OIDC user: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to save OAuth2 user to database", e);
        }
    }
    
    private User updateExistingUser(User existingUser, OAuth2UserInfo oAuth2UserInfo, String registrationId) {
        log.info("Updating existing user with OIDC info: {}", existingUser.getEmail());
        
        try {
            boolean updated = false;
            
            // Always update OAuth2 info to ensure it's current
            if (existingUser.getOauth2Provider() == null || 
                !existingUser.getOauth2Provider().equals(registrationId) ||
                existingUser.getOauth2Id() == null) {
                existingUser.setOauth2Provider(registrationId);
                existingUser.setOauth2Id(oAuth2UserInfo.getId());
                log.info("Updated OAuth2 provider info: provider={}, oauth2Id={}", registrationId, oAuth2UserInfo.getId());
                updated = true;
            }
            
            // Update profile picture if available and different
            if (oAuth2UserInfo.getImageUrl() != null && 
                !oAuth2UserInfo.getImageUrl().equals(existingUser.getProfilePictureUrl())) {
                existingUser.setProfilePictureUrl(oAuth2UserInfo.getImageUrl());
                log.info("Updated profile picture URL");
                updated = true;
            }
            
            // Update email verification status if not already verified
            if (!existingUser.getEmailVerified()) {
                existingUser.setEmailVerified(true);
                log.info("Marked email as verified via OAuth2");
                updated = true;
            }
            
            // Update name if not set or if it's empty
            if ((existingUser.getFirstName() == null || existingUser.getFirstName().isEmpty()) && 
                oAuth2UserInfo.getName() != null) {
                String fullName = oAuth2UserInfo.getName();
                String firstName = fullName;
                String lastName = "";
                if (fullName.contains(" ")) {
                    String[] nameParts = fullName.split(" ", 2);
                    firstName = nameParts[0];
                    lastName = nameParts[1];
                }
                existingUser.setFirstName(firstName);
                existingUser.setLastName(lastName);
                log.info("Updated user name: firstName={}, lastName={}", firstName, lastName);
                updated = true;
            }
            
            if (updated) {
                existingUser.setUpdatedAt(java.time.LocalDateTime.now());
                existingUser = userRepository.save(existingUser);
                log.info("Successfully updated existing user with OIDC info: {}", existingUser.getEmail());
            } else {
                log.info("No updates needed for existing user: {}", existingUser.getEmail());
            }
            
            return existingUser;
        } catch (Exception e) {
            log.error("Failed to update existing OIDC user: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to update OAuth2 user in database", e);
        }
    }
    
    /**
     * Custom OIDC User that wraps the original OidcUser and includes our User entity
     */
    public static class CustomOidcUser extends DefaultOidcUser {
        private final User user;
        
        public CustomOidcUser(OidcUser oidcUser, User user) {
            super(oidcUser.getAuthorities(), oidcUser.getIdToken(), oidcUser.getUserInfo());
            this.user = user;
        }
        
        public User getUser() {
            return user;
        }
    }
}