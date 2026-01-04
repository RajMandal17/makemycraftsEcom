package com.artwork.service.email;

import com.artwork.entity.EmailLog;
import com.artwork.repository.EmailLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

/**
 * Handles persistence of email log entries to keep EmailService focused on delivery concerns.
 */
@Service
@RequiredArgsConstructor
public class EmailLogService {

    private final EmailLogRepository emailLogRepository;

    @Transactional
    public EmailLog createPending(String recipient, String subject, String templateName) {
        EmailLog log = EmailLog.builder()
            .recipient(recipient)
            .subject(subject)
            .templateName(templateName)
            .status(EmailLog.EmailStatus.PENDING)
            .sentAt(LocalDateTime.now())
            .build();
        return emailLogRepository.save(log);
    }

    @Transactional
    public void markSent(EmailLog log) {
        log.setStatus(EmailLog.EmailStatus.SENT);
        log.setDeliveredAt(LocalDateTime.now());
        emailLogRepository.save(log);
    }

    @Transactional
    public void markFailed(EmailLog log, String errorMessage) {
        log.setStatus(EmailLog.EmailStatus.FAILED);
        log.setErrorMessage(errorMessage);
        emailLogRepository.save(log);
    }
}
