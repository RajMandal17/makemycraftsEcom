package com.artwork.repository;

import com.artwork.entity.PasswordResetToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, String> {
    
    Optional<PasswordResetToken> findByToken(String token);
    
    Optional<PasswordResetToken> findByUserId(String userId);
    
    void deleteByExpiryDateBefore(LocalDateTime now);
    
    void deleteByUserId(String userId);
}
