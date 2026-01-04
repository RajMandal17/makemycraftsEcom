package com.artwork.repository;

import com.artwork.entity.EmailLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface EmailLogRepository extends JpaRepository<EmailLog, String> {
    
    List<EmailLog> findByRecipient(String recipient);
    
    List<EmailLog> findByStatus(EmailLog.EmailStatus status);
    
    List<EmailLog> findBySentAtBetween(LocalDateTime start, LocalDateTime end);
    
    @Query("SELECT COUNT(e) FROM EmailLog e WHERE e.status = 'SENT' AND e.sentAt >= :since")
    long countSuccessfulEmailsSince(LocalDateTime since);
    
    @Query("SELECT COUNT(e) FROM EmailLog e WHERE e.status = 'FAILED' AND e.sentAt >= :since")
    long countFailedEmailsSince(LocalDateTime since);
    
    @Query("SELECT e.templateName, COUNT(e) FROM EmailLog e WHERE e.sentAt >= :since GROUP BY e.templateName")
    List<Object[]> getEmailStatsByTemplate(LocalDateTime since);
}
