package com.artwork.event.listener;

import com.artwork.event.EmailEvent;
import com.artwork.service.EmailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class EmailEventListener {

    private final EmailService emailService;

    @Async
    @EventListener
    public void handleEmailEvent(EmailEvent event) {
        log.info("Handling email event for: {}", event.getTo());
        try {
            emailService.sendHtmlMessage(
                event.getTo(),
                event.getSubject(),
                event.getTemplateName(),
                event.getVariables()
            );
        } catch (Exception e) {
            log.error("Error sending email to {}", event.getTo(), e);
        }
    }
}
