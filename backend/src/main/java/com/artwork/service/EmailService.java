package com.artwork.service;

import jakarta.mail.MessagingException;
import java.util.Map;

public interface EmailService {
    void sendSimpleMessage(String to, String subject, String text);
    void sendHtmlMessage(String to, String subject, String templateName, Map<String, Object> variables) throws MessagingException;
}
