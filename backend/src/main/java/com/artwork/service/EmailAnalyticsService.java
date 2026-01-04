package com.artwork.service;

import com.artwork.entity.EmailLog;
import com.artwork.repository.EmailLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailAnalyticsService {

    private final EmailLogRepository emailLogRepository;

    /**
     * Get email statistics for the last N hours
     */
    public Map<String, Object> getEmailStats(int hours) {
        LocalDateTime since = LocalDateTime.now().minusHours(hours);
        
        long totalSent = emailLogRepository.countSuccessfulEmailsSince(since);
        long totalFailed = emailLogRepository.countFailedEmailsSince(since);
        List<Object[]> statsByTemplate = emailLogRepository.getEmailStatsByTemplate(since);
        
        Map<String, Long> templateStats = new HashMap<>();
        for (Object[] stat : statsByTemplate) {
            templateStats.put((String) stat[0], (Long) stat[1]);
        }
        
        double successRate = totalSent + totalFailed > 0 
            ? (double) totalSent / (totalSent + totalFailed) * 100 
            : 0.0;
        
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalSent", totalSent);
        stats.put("totalFailed", totalFailed);
        stats.put("successRate", String.format("%.2f%%", successRate));
        stats.put("byTemplate", templateStats);
        stats.put("period", hours + " hours");
        
        log.info("📊 Email Stats (Last {} hours): Sent={}, Failed={}, Success Rate={:.2f}%", 
                 hours, totalSent, totalFailed, successRate);
        
        return stats;
    }

    /**
     * Get failed emails for debugging
     */
    public List<EmailLog> getFailedEmails() {
        return emailLogRepository.findByStatus(EmailLog.EmailStatus.FAILED);
    }

    /**
     * Get email history for a specific recipient
     */
    public List<EmailLog> getEmailHistory(String recipient) {
        return emailLogRepository.findByRecipient(recipient);
    }
}
