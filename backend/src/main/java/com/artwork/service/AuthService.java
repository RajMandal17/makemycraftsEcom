package com.artwork.service;

import com.artwork.dto.*;
import com.artwork.entity.PasswordResetToken;
import com.artwork.entity.Role;
import com.artwork.entity.User;
import com.artwork.repository.PasswordResetTokenRepository;
import com.artwork.repository.UserRepository;
import com.artwork.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.security.Principal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {
    private final UserRepository userRepository;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final JwtUtil jwtUtil;
    private final ModelMapper modelMapper;
    private final BCryptPasswordEncoder passwordEncoder;
    private final org.springframework.context.ApplicationEventPublisher eventPublisher;
    private final com.artwork.util.UsernameGenerator usernameGenerator;
    
    @Value("${frontend.base-url}")
    private String frontendBaseUrl;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            AuthResponse response = new AuthResponse();
            response.setSuccess(false);
            response.setMessage("Email already registered");
            return response;
        }
        
        
        String username = request.getUsername();
        if (username == null || username.trim().isEmpty()) {
            username = usernameGenerator.generateUniqueUsername(request.getEmail(), request.getFirstName());
        } else {
            
            if (userRepository.findByUsername(username).isPresent()) {
                AuthResponse response = new AuthResponse();
                response.setSuccess(false);
                response.setMessage("Username already taken");
                return response;
            }
        }
        
        User user = User.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .username(username)
                .role(request.getRole() != null ? request.getRole() : Role.CUSTOMER)
                .isActive(true)
                .build();
        userRepository.save(user);
        UserDto userDto = modelMapper.map(user, UserDto.class);
        Map<String, Object> claims = new HashMap<>();
        String accessToken = jwtUtil.generateToken(user.getId(), user.getEmail(), user.getRole().name(), claims);
        String refreshToken = jwtUtil.generateRefreshToken(user.getId(), user.getEmail(), user.getRole().name());
        TokenDto tokenDto = new TokenDto();
        tokenDto.setAccessToken(accessToken);
        tokenDto.setRefreshToken(refreshToken);
        AuthResponse response = new AuthResponse();
        response.setSuccess(true);
        response.setMessage("User registered successfully");
        response.setUser(userDto);
        response.setTokens(tokenDto);

        
        if (user.getRole() == Role.ARTIST) {
            response.setRedirectUrl("/dashboard/artist");
        } else if (user.getRole() == Role.ADMIN) {
            response.setRedirectUrl("/dashboard/admin");
        } else if (user.getRole() == Role.CUSTOMER) {
            response.setRedirectUrl("/dashboard/customer");
        } else {
            response.setRedirectUrl("/");
        }

        
        Map<String, Object> variables = new HashMap<>();
        variables.put("name", user.getFirstName());
        variables.put("dashboardUrl", frontendBaseUrl + response.getRedirectUrl());
        
        eventPublisher.publishEvent(new com.artwork.event.EmailEvent(
            this,
            user.getEmail(),
            "Welcome to ArtGallery!",
            "email/welcome",
            variables
        ));

        return response;
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail()).orElse(null);
        AuthResponse response = new AuthResponse();
        if (user == null || !passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            response.setSuccess(false);
            response.setMessage("Invalid credentials");
            return response;
        }
        UserDto userDto = modelMapper.map(user, UserDto.class);
        Map<String, Object> claims = new HashMap<>();
        String accessToken = jwtUtil.generateToken(user.getId(), user.getEmail(), user.getRole().name(), claims);
        String refreshToken = jwtUtil.generateRefreshToken(user.getId(), user.getEmail(), user.getRole().name());
        TokenDto tokenDto = new TokenDto();
        tokenDto.setAccessToken(accessToken);
        tokenDto.setRefreshToken(refreshToken);
        response.setSuccess(true);
        response.setMessage("Login successful");
        response.setUser(userDto);
        response.setTokens(tokenDto);

        
        if (user.getRole() == Role.ARTIST) {
            response.setRedirectUrl("/dashboard/artist");
        } else if (user.getRole() == Role.ADMIN) {
            response.setRedirectUrl("/dashboard/admin");
        } else if (user.getRole() == Role.CUSTOMER) {
            response.setRedirectUrl("/dashboard/customer");
        } else {
            response.setRedirectUrl("/");
        }

        return response;
    }

    public UserDto getUserByPrincipal(Principal principal) {
        User user = userRepository.findByEmail(principal.getName()).orElse(null);
        return modelMapper.map(user, UserDto.class);
    }
    
    public UserDto getUserByUsername(String username) {
        User user = userRepository.findByEmail(username).orElse(null);
        return modelMapper.map(user, UserDto.class);
    }
    
    @Transactional
    public Map<String, Object> forgotPassword(ForgotPasswordRequest request) {
        Map<String, Object> response = new HashMap<>();
        
        User user = userRepository.findByEmail(request.getEmail()).orElse(null);
        
        
        if (user == null) {
            log.warn("Password reset requested for non-existent email: {}", request.getEmail());
            response.put("success", true);
            response.put("message", "If your email is registered, you will receive a password reset link.");
            return response;
        }
        
        
        passwordResetTokenRepository.deleteByUserId(user.getId());
        
        
        String token = UUID.randomUUID().toString();
        PasswordResetToken resetToken = PasswordResetToken.builder()
            .token(token)
            .userId(user.getId())
            .expiryDate(LocalDateTime.now().plusHours(24))
            .build();
        
        passwordResetTokenRepository.save(resetToken);
        
        
        String resetUrl = frontendBaseUrl + "/reset-password?token=" + token;
        Map<String, Object> variables = new HashMap<>();
        variables.put("name", user.getFirstName());
        variables.put("resetUrl", resetUrl);
        variables.put("expiryHours", "24");
        
        eventPublisher.publishEvent(new com.artwork.event.EmailEvent(
            this,
            user.getEmail(),
            "Password Reset Request - ArtGallery",
            "email/password-reset",
            variables
        ));
        
        log.info("Password reset email sent to: {}", user.getEmail());
        
        response.put("success", true);
        response.put("message", "If your email is registered, you will receive a password reset link.");
        return response;
    }
    
    @Transactional
    public Map<String, Object> resetPassword(ResetPasswordRequest request) {
        Map<String, Object> response = new HashMap<>();
        
        PasswordResetToken resetToken = passwordResetTokenRepository.findByToken(request.getToken())
            .orElseThrow(() -> new IllegalArgumentException("Invalid or expired reset token"));
        
        if (resetToken.isUsed()) {
            throw new IllegalArgumentException("This reset token has already been used");
        }
        
        if (resetToken.isExpired()) {
            throw new IllegalArgumentException("This reset token has expired. Please request a new one.");
        }
        
        User user = userRepository.findById(resetToken.getUserId())
            .orElseThrow(() -> new IllegalArgumentException("User not found"));
        
        
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
        
        
        resetToken.setUsed(true);
        passwordResetTokenRepository.save(resetToken);
        
        log.info("Password successfully reset for user: {}", user.getEmail());
        
        response.put("success", true);
        response.put("message", "Password has been reset successfully. You can now login with your new password.");
        return response;
    }
    

}
