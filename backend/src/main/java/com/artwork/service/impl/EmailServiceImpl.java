package com.artwork.service.impl;

import com.artwork.service.EmailService;
import com.artwork.service.email.EmailLogService;
import com.artwork.service.email.EmailProcessingException;
import com.artwork.service.email.EmailTemplateRenderer;
import jakarta.annotation.PostConstruct;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.mail.MailProperties;
import org.springframework.mail.MailAuthenticationException;
import org.springframework.mail.MailSendException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.util.Map;

import static org.springframework.util.StringUtils.hasText;

/**
 * Production-grade email service implementation using JavaMailSender.
 * 
 * Supports:
 * - GoDaddy SMTP (smtpout.secureserver.net)
 * - Microsoft 365 SMTP (smtp.office365.com)
 * - Any standard SMTP server
 * 
 * Features:
 * - Manual retry logic for transient failures (3 attempts)
 * - Comprehensive logging for debugging
 * - Email logging for audit trail
 * - Detailed error messages
 */
@Service
@Slf4j
public class EmailServiceImpl implements EmailService {

    private static final String SIMPLE_TEMPLATE = "simple-text";
    private static final int MAX_RETRY_ATTEMPTS = 3;
    private static final long RETRY_DELAY_MS = 2000;

    private final JavaMailSender emailSender;
    private final EmailTemplateRenderer templateRenderer;
    private final EmailLogService emailLogService;
    private final MailProperties mailProperties;
    
    @Value("${mail.from:}")
    private String mailFrom;
    
    @Value("${spring.mail.host:not-configured}")
    private String mailHost;
    
    @Value("${spring.mail.port:587}")
    private int mailPort;

    public EmailServiceImpl(JavaMailSender emailSender,
                            EmailTemplateRenderer templateRenderer,
                            EmailLogService emailLogService,
                            MailProperties mailProperties) {
        this.emailSender = emailSender;
        this.templateRenderer = templateRenderer;
        this.emailLogService = emailLogService;
        this.mailProperties = mailProperties;
    }

    /**
     * Log email configuration on startup for debugging
     */
    @PostConstruct
    public void logConfiguration() {
        log.info("📧 ============================================");
        log.info("📧 Email Service Configuration");
        log.info("📧 ============================================");
        log.info("📧 SMTP Host: {}", mailHost);
        log.info("📧 SMTP Port: {}", mailPort);
        log.info("📧 Username: {}", maskEmail(mailProperties.getUsername()));
        log.info("📧 From Address: {}", safeResolveFromAddress());
        log.info("📧 Password Configured: {}", hasText(mailProperties.getPassword()) ? "YES ✓" : "NO ✗");
        log.info("📧 Auth Enabled: {}", mailProperties.getProperties().getOrDefault("mail.smtp.auth", "not-set"));
        log.info("📧 STARTTLS Enabled: {}", mailProperties.getProperties().getOrDefault("mail.smtp.starttls.enable", "not-set"));
        log.info("📧 ============================================");
        
        if (!hasText(mailProperties.getPassword())) {
            log.error("⚠️  WARNING: MAIL_PASSWORD environment variable is NOT SET!");
            log.error("⚠️  Emails will fail to send without proper authentication.");
            log.error("⚠️  Set MAIL_PASSWORD in your DigitalOcean App environment variables.");
        }
        
        if ("not-configured".equals(mailHost) || !hasText(mailHost)) {
            log.error("⚠️  WARNING: MAIL_HOST is not configured!");
            log.error("⚠️  For GoDaddy, use: smtpout.secureserver.net");
        }
    }

    @Override
    public void sendSimpleMessage(String to, String subject, String text) {
        var logEntry = emailLogService.createPending(to, subject, SIMPLE_TEMPLATE);
        String fromAddress = resolveFromAddress();
        
        log.info("📤 Attempting to send simple email...");
        log.info("   To: {}", to);
        log.info("   From: {}", fromAddress);
        log.info("   Subject: {}", subject);
        log.info("   Server: {}:{}", mailHost, mailPort);
        
        Exception lastException = null;
        
        for (int attempt = 1; attempt <= MAX_RETRY_ATTEMPTS; attempt++) {
            try {
                SimpleMailMessage message = new SimpleMailMessage();
                message.setFrom(fromAddress);
                message.setTo(to);
                message.setSubject(subject);
                message.setText(text);
                
                log.info("📤 Sending attempt {}/{}", attempt, MAX_RETRY_ATTEMPTS);
                emailSender.send(message);
                
                emailLogService.markSent(logEntry);
                log.info("✅ Simple email sent successfully to {} on attempt {}", to, attempt);
                return; // Success - exit the method
                
            } catch (MailAuthenticationException e) {
                // Don't retry authentication failures
                emailLogService.markFailed(logEntry, "Authentication failed: " + e.getMessage());
                log.error("❌ SMTP Authentication FAILED!");
                log.error("   This is NOT a transient error - check your credentials:");
                log.error("   - MAIL_USERNAME: {}", maskEmail(mailProperties.getUsername()));
                log.error("   - MAIL_PASSWORD: Is it set correctly?");
                log.error("   - MAIL_HOST: {} (correct for your email provider?)", mailHost);
                log.error("   Error: {}", e.getMessage());
                throw new EmailProcessingException("SMTP authentication failed. Check MAIL_USERNAME and MAIL_PASSWORD.", e);
                
            } catch (MailSendException e) {
                lastException = e;
                log.warn("⚠️ Send attempt {}/{} failed: {}", attempt, MAX_RETRY_ATTEMPTS, e.getMessage());
                
                if (attempt < MAX_RETRY_ATTEMPTS) {
                    log.info("⏳ Waiting {}ms before retry...", RETRY_DELAY_MS * attempt);
                    try {
                        Thread.sleep(RETRY_DELAY_MS * attempt);
                    } catch (InterruptedException ie) {
                        Thread.currentThread().interrupt();
                        break;
                    }
                }
                
            } catch (Exception e) {
                lastException = e;
                log.error("❌ Unexpected error on attempt {}: {}", attempt, e.getMessage(), e);
                
                if (attempt < MAX_RETRY_ATTEMPTS) {
                    try {
                        Thread.sleep(RETRY_DELAY_MS * attempt);
                    } catch (InterruptedException ie) {
                        Thread.currentThread().interrupt();
                        break;
                    }
                }
            }
        }
        
        // All retries failed
        emailLogService.markFailed(logEntry, lastException != null ? lastException.getMessage() : "Unknown error");
        log.error("❌ All {} attempts failed to send email to {}", MAX_RETRY_ATTEMPTS, to);
        log.error("   Last error: {}", lastException != null ? lastException.getMessage() : "Unknown");
        throw new EmailProcessingException("Failed to send email after " + MAX_RETRY_ATTEMPTS + " attempts", lastException);
    }

    @Override
    public void sendHtmlMessage(String to, String subject, String templateName, Map<String, Object> variables) throws MessagingException {
        var logEntry = emailLogService.createPending(to, subject, templateName);
        String fromAddress = resolveFromAddress();
        
        log.info("📤 Attempting to send HTML email...");
        log.info("   To: {}", to);
        log.info("   From: {}", fromAddress);
        log.info("   Subject: {}", subject);
        log.info("   Template: {}", templateName);
        log.info("   Server: {}:{}", mailHost, mailPort);
        
        Exception lastException = null;
        
        for (int attempt = 1; attempt <= MAX_RETRY_ATTEMPTS; attempt++) {
            try {
                MimeMessage message = emailSender.createMimeMessage();
                MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

                String htmlContent = templateRenderer.render(templateName, variables);

                helper.setFrom(fromAddress);
                helper.setTo(to);
                helper.setSubject(subject);
                helper.setText(htmlContent, true);

                log.info("📤 Sending attempt {}/{}", attempt, MAX_RETRY_ATTEMPTS);
                emailSender.send(message);
                
                emailLogService.markSent(logEntry);
                log.info("✅ HTML email sent successfully to {} on attempt {}", to, attempt);
                return; // Success - exit the method
                
            } catch (MailAuthenticationException e) {
                // Don't retry authentication failures
                emailLogService.markFailed(logEntry, "Authentication failed: " + e.getMessage());
                log.error("❌ SMTP Authentication FAILED!");
                log.error("   This is NOT a transient error - check your credentials:");
                log.error("   - MAIL_USERNAME: {}", maskEmail(mailProperties.getUsername()));
                log.error("   - MAIL_PASSWORD: Is it set correctly?");
                log.error("   - MAIL_HOST: {} (correct for your email provider?)", mailHost);
                log.error("   Error: {}", e.getMessage());
                throw new EmailProcessingException("SMTP authentication failed. Check MAIL_USERNAME and MAIL_PASSWORD.", e);
                
            } catch (MailSendException e) {
                lastException = e;
                log.warn("⚠️ Send attempt {}/{} failed: {}", attempt, MAX_RETRY_ATTEMPTS, e.getMessage());
                
                if (attempt < MAX_RETRY_ATTEMPTS) {
                    log.info("⏳ Waiting {}ms before retry...", RETRY_DELAY_MS * attempt);
                    try {
                        Thread.sleep(RETRY_DELAY_MS * attempt);
                    } catch (InterruptedException ie) {
                        Thread.currentThread().interrupt();
                        break;
                    }
                }
                
            } catch (Exception e) {
                lastException = e;
                log.error("❌ Unexpected error on attempt {}: {}", attempt, e.getMessage(), e);
                
                if (attempt < MAX_RETRY_ATTEMPTS) {
                    try {
                        Thread.sleep(RETRY_DELAY_MS * attempt);
                    } catch (InterruptedException ie) {
                        Thread.currentThread().interrupt();
                        break;
                    }
                }
            }
        }
        
        // All retries failed
        emailLogService.markFailed(logEntry, lastException != null ? lastException.getMessage() : "Unknown error");
        log.error("❌ All {} attempts failed to send HTML email to {}", MAX_RETRY_ATTEMPTS, to);
        log.error("   Template: {}", templateName);
        log.error("   Last error: {}", lastException != null ? lastException.getMessage() : "Unknown");
        throw new EmailProcessingException("Failed to send templated email after " + MAX_RETRY_ATTEMPTS + " attempts", lastException);
    }

    /**
     * Resolve the 'from' address with fallback chain:
     * 1. mail.from property
     * 2. spring.mail.properties.from
     * 3. spring.mail.username
     */
    private String resolveFromAddress() {
        // First priority: mail.from property
        if (hasText(mailFrom)) {
            return mailFrom;
        }
        
        // Second priority: spring.mail.properties.from
        String propertiesFrom = mailProperties.getProperties().get("from");
        if (hasText(propertiesFrom)) {
            return propertiesFrom;
        }
        
        // Third priority: spring.mail.username
        if (hasText(mailProperties.getUsername())) {
            return mailProperties.getUsername();
        }
        
        // Log error with helpful message
        log.error("❌ No 'from' address configured!");
        log.error("   Set one of these environment variables:");
        log.error("   - MAIL_FROM (recommended)");
        log.error("   - MAIL_USERNAME");
        throw new EmailProcessingException("Mail 'from' address is not configured. Set MAIL_FROM or MAIL_USERNAME environment variable.");
    }

    /**
     * Safe version for logging during initialization
     */
    private String safeResolveFromAddress() {
        try {
            return resolveFromAddress();
        } catch (Exception e) {
            return "NOT CONFIGURED";
        }
    }

    /**
     * Mask email for logging (privacy)
     */
    private String maskEmail(String email) {
        if (!hasText(email)) {
            return "NOT SET";
        }
        int atIndex = email.indexOf('@');
        if (atIndex > 2) {
            return email.substring(0, 2) + "***" + email.substring(atIndex);
        }
        return "***" + email.substring(Math.max(0, atIndex));
    }
}
