package com.artwork.controller;

import com.artwork.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/internal/notifications")
@RequiredArgsConstructor
@Slf4j
public class InternalNotificationController {
    
    private final ApplicationEventPublisher eventPublisher;
    private final UserRepository userRepository;
    
    /**
     * Internal endpoint for payment service to trigger payment confirmation emails
     * This should be secured with internal service authentication in production
     */
    @PostMapping("/payment-confirmation")
    public ResponseEntity<?> sendPaymentConfirmationEmail(
            @RequestHeader(value = "X-Service-Token", required = false) String serviceToken,
            @RequestBody Map<String, Object> request) {
        
        // TODO: Validate service token in production
        // if (!"payment-service-internal-token".equals(serviceToken)) {
        //     return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        // }
        
        try {
            String email = (String) request.get("email");
            String name = (String) request.get("name");
            String orderId = (String) request.get("orderId");
            String transactionId = (String) request.get("transactionId");
            String amount = (String) request.get("amount");
            String paymentMethod = (String) request.get("paymentMethod");
            
            Map<String, Object> variables = new HashMap<>();
            variables.put("name", name);
            variables.put("orderId", orderId);
            variables.put("transactionId", transactionId);
            variables.put("amount", amount);
            variables.put("paymentMethod", paymentMethod);
            variables.put("paymentDate", LocalDateTime.now().toLocalDate().toString());
            
            eventPublisher.publishEvent(new com.artwork.event.EmailEvent(
                this,
                email,
                "Payment Confirmed - Order #" + orderId,
                "email/payment-confirmation",
                variables
            ));
            
            log.info("Payment confirmation email triggered for order: {}", orderId);
            
            return ResponseEntity.ok(Map.of("success", true, "message", "Email sent"));
        } catch (Exception e) {
            log.error("Error sending payment confirmation email", e);
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }
    
    @PostMapping("/payment-failed")
    public ResponseEntity<?> sendPaymentFailedEmail(
            @RequestHeader(value = "X-Service-Token", required = false) String serviceToken,
            @RequestBody Map<String, Object> request) {
        
        try {
            String email = (String) request.get("email");
            String name = (String) request.get("name");
            String orderId = (String) request.get("orderId");
            String reason = (String) request.get("reason");
            
            // TODO: Create payment-failed.html template
            Map<String, Object> variables = new HashMap<>();
            variables.put("name", name);
            variables.put("orderId", orderId);
            variables.put("reason", reason);
            
            log.info("Payment failed email triggered for order: {}", orderId);
            
            return ResponseEntity.ok(Map.of("success", true, "message", "Email sent"));
        } catch (Exception e) {
            log.error("Error sending payment failed email", e);
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }
}
