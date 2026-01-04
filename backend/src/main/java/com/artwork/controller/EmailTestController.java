package com.artwork.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.JavaMailSenderImpl;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Properties;

/**
 * Email testing controller for diagnosing email configuration issues.
 * 
 * Endpoints:
 * - GET /api/test/email-config - Show current email configuration
 * - POST /api/test/send-email-direct?to=xxx - Send email directly via SMTP (synchronous)
 * - POST /api/test/send-email?to=xxx - Send email via event system (async)
 */
@RestController
@RequestMapping("/api/test")
@RequiredArgsConstructor
@Slf4j
public class EmailTestController {
    
    private final JavaMailSender mailSender;
    private final org.springframework.context.ApplicationEventPublisher eventPublisher;
    
    @Value("${mail.from:not-set}")
    private String mailFrom;
    
    @Value("${spring.mail.host:not-set}")
    private String mailHost;
    
    @Value("${spring.mail.port:0}")
    private int mailPort;
    
    /**
     * Test email configuration - shows current settings and tests SMTP connection
     * GET /api/test/email-config
     */
    @GetMapping("/email-config")
    public ResponseEntity<?> testEmailConfig() {
        Map<String, Object> config = new HashMap<>();
        
        log.info("📧 Testing email configuration...");
        
        try {
            // Get mail properties
            JavaMailSenderImpl senderImpl = (JavaMailSenderImpl) mailSender;
            
            config.put("host", senderImpl.getHost());
            config.put("port", senderImpl.getPort());
            config.put("username", maskEmail(senderImpl.getUsername()));
            config.put("protocol", senderImpl.getProtocol());
            config.put("passwordConfigured", senderImpl.getPassword() != null && !senderImpl.getPassword().isEmpty());
            config.put("mailFrom", mailFrom);
            
            // Get SMTP properties
            Properties props = senderImpl.getJavaMailProperties();
            Map<String, String> smtpProps = new HashMap<>();
            smtpProps.put("smtp.auth", props.getProperty("mail.smtp.auth", "not-set"));
            smtpProps.put("smtp.starttls.enable", props.getProperty("mail.smtp.starttls.enable", "not-set"));
            smtpProps.put("smtp.starttls.required", props.getProperty("mail.smtp.starttls.required", "not-set"));
            smtpProps.put("smtp.ssl.trust", props.getProperty("mail.smtp.ssl.trust", "not-set"));
            smtpProps.put("smtp.ssl.protocols", props.getProperty("mail.smtp.ssl.protocols", "not-set"));
            smtpProps.put("smtp.debug", props.getProperty("mail.debug", "false"));
            config.put("smtpProperties", smtpProps);
            
            // Test connection
            log.info("📧 Testing SMTP connection to {}:{}...", senderImpl.getHost(), senderImpl.getPort());
            try {
                senderImpl.testConnection();
                config.put("connectionTest", "SUCCESS ✅");
                config.put("message", "SMTP connection successful! Server is reachable and authentication passed.");
                log.info("✅ SMTP connection test PASSED");
            } catch (Exception e) {
                config.put("connectionTest", "FAILED ❌");
                config.put("error", e.getMessage());
                config.put("errorType", e.getClass().getSimpleName());
                config.put("troubleshooting", getTroubleshootingTips(e));
                log.error("❌ SMTP connection test FAILED: {}", e.getMessage());
            }
            
            return ResponseEntity.ok(config);
        } catch (Exception e) {
            log.error("Error testing email config", e);
            config.put("error", e.getMessage());
            config.put("errorType", e.getClass().getSimpleName());
            return ResponseEntity.internalServerError().body(config);
        }
    }
    
    /**
     * Send test email DIRECTLY via SMTP (synchronous - will wait for result)
     * POST /api/test/send-email-direct?to=your-email@example.com
     * 
     * This bypasses the async event system and sends directly, providing immediate feedback.
     */
    @PostMapping("/send-email-direct")
    public ResponseEntity<?> sendTestEmailDirect(@RequestParam String to) {
        Map<String, Object> response = new HashMap<>();
        
        log.info("📤 Sending DIRECT test email to: {}", to);
        
        try {
            JavaMailSenderImpl senderImpl = (JavaMailSenderImpl) mailSender;
            
            // Build a simple message
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(mailFrom);
            message.setTo(to);
            message.setSubject("Test Email from MakeMyCrafts - " + LocalDateTime.now());
            message.setText(
                "Hello!\n\n" +
                "This is a test email from MakeMyCrafts to verify that email sending is working correctly.\n\n" +
                "Configuration Details:\n" +
                "- SMTP Host: " + senderImpl.getHost() + "\n" +
                "- SMTP Port: " + senderImpl.getPort() + "\n" +
                "- From: " + mailFrom + "\n" +
                "- Sent at: " + LocalDateTime.now() + "\n\n" +
                "If you received this email, your email configuration is working!\n\n" +
                "Best regards,\n" +
                "MakeMyCrafts Team"
            );
            
            log.info("📤 Attempting to send via {}:{}...", senderImpl.getHost(), senderImpl.getPort());
            
            // Send synchronously
            long startTime = System.currentTimeMillis();
            mailSender.send(message);
            long duration = System.currentTimeMillis() - startTime;
            
            response.put("success", true);
            response.put("message", "✅ Email sent successfully to " + to);
            response.put("duration", duration + "ms");
            response.put("smtpHost", senderImpl.getHost());
            response.put("smtpPort", senderImpl.getPort());
            response.put("from", mailFrom);
            response.put("note", "Check your inbox (and spam/junk folder)");
            
            log.info("✅ Test email sent successfully to {} in {}ms", to, duration);
            
            return ResponseEntity.ok(response);
            
        } catch (org.springframework.mail.MailAuthenticationException e) {
            log.error("❌ SMTP Authentication failed: {}", e.getMessage());
            response.put("success", false);
            response.put("error", "Authentication Failed");
            response.put("details", e.getMessage());
            response.put("troubleshooting", new String[]{
                "Check MAIL_USERNAME - should be your full email address (e.g., mail@makemycrafts.com)",
                "Check MAIL_PASSWORD - make sure it's correct",
                "For GoDaddy Microsoft 365: Enable SMTP Authentication in Email & Office Dashboard",
                "For GoDaddy Microsoft 365 with MFA: Use an App Password instead of your regular password",
                "Check if SMTP Authentication is enabled on your email account"
            });
            return ResponseEntity.badRequest().body(response);
            
        } catch (org.springframework.mail.MailSendException e) {
            log.error("❌ SMTP Send failed: {}", e.getMessage(), e);
            response.put("success", false);
            response.put("error", "Send Failed");
            response.put("details", e.getMessage());
            response.put("rootCause", e.getCause() != null ? e.getCause().getMessage() : "Unknown");
            response.put("troubleshooting", new String[]{
                "Check MAIL_HOST - GoDaddy Workspace: smtpout.secureserver.net, Microsoft 365: smtp.office365.com",
                "Check MAIL_PORT - Use 587 for TLS or 465 for SSL",
                "Verify your email account is active and not suspended",
                "Check if your hosting provider (DigitalOcean) blocks outgoing SMTP",
                "Try enabling MAIL_DEBUG=true to see detailed SMTP logs"
            });
            return ResponseEntity.badRequest().body(response);
            
        } catch (Exception e) {
            log.error("❌ Unexpected error sending test email: {}", e.getMessage(), e);
            response.put("success", false);
            response.put("error", e.getClass().getSimpleName());
            response.put("details", e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }
    
    /**
     * Send test email via async event system
     * POST /api/test/send-email?to=your-email@example.com
     */
    @PostMapping("/send-email")
    public ResponseEntity<?> sendTestEmail(@RequestParam String to) {
        Map<String, Object> response = new HashMap<>();
        
        log.info("📤 Sending ASYNC test email to: {} via event system", to);
        
        try {
            Map<String, Object> variables = new HashMap<>();
            variables.put("name", "Test User");
            
            eventPublisher.publishEvent(new com.artwork.event.EmailEvent(
                this,
                to,
                "Test Email from MakeMyCrafts",
                "email/welcome",
                variables
            ));
            
            response.put("success", true);
            response.put("message", "Test email event published");
            response.put("to", to);
            response.put("note", "Email is being sent asynchronously. Check logs for result and your inbox (including spam folder).");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error sending test email", e);
            response.put("success", false);
            response.put("error", e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }
    
    private String maskEmail(String email) {
        if (email == null || email.isEmpty()) {
            return "NOT SET";
        }
        int atIndex = email.indexOf('@');
        if (atIndex > 2) {
            return email.substring(0, 2) + "***" + email.substring(atIndex);
        }
        return "***" + email.substring(Math.max(0, atIndex));
    }
    
    private String[] getTroubleshootingTips(Exception e) {
        String message = e.getMessage() != null ? e.getMessage().toLowerCase() : "";
        
        if (message.contains("auth") || message.contains("535") || message.contains("password")) {
            return new String[]{
                "Authentication error - check MAIL_USERNAME and MAIL_PASSWORD",
                "For GoDaddy Microsoft 365: Enable SMTP Authentication in your admin dashboard",
                "If using MFA/2FA: Generate and use an App Password"
            };
        } else if (message.contains("connect") || message.contains("timeout") || message.contains("refused")) {
            return new String[]{
                "Connection error - check MAIL_HOST and MAIL_PORT",
                "GoDaddy Workspace: Use smtpout.secureserver.net:587",
                "GoDaddy Microsoft 365: Use smtp.office365.com:587",
                "DigitalOcean may block port 25 - use port 587 or 465"
            };
        } else if (message.contains("ssl") || message.contains("tls") || message.contains("certificate")) {
            return new String[]{
                "SSL/TLS error - check your security settings",
                "Try setting MAIL_PORT=465 with SSL instead of TLS",
                "Verify the server certificate is trusted"
            };
        }
        
        return new String[]{
            "Check all MAIL_* environment variables are correctly set",
            "Enable MAIL_DEBUG=true to see detailed SMTP logs",
            "Contact your email provider (GoDaddy) for SMTP settings"
        };
    }
}
