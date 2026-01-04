package com.artwork.controller.payment;

import com.artwork.dto.payment.*;
import com.artwork.security.UserPrincipal;
import com.artwork.service.payment.PaymentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;


@RestController
@RequestMapping("/api/payment")
@RequiredArgsConstructor
@Slf4j
public class PaymentController {
    
    private final PaymentService paymentService;
    
    @PostMapping("/create")
    public ResponseEntity<PaymentResponse> createPayment(@RequestBody CreatePaymentRequest request) {
        log.info("Creating payment for order: {}", request.getOrderId());
        PaymentResponse response = paymentService.createPayment(request);
        return ResponseEntity.ok(response);
    }
    
    @PostMapping("/verify")
    public ResponseEntity<PaymentVerificationResponse> verifyPayment(
            @RequestBody PaymentVerificationRequest request) {
        log.info("Verifying payment: {}", request.getGatewayPaymentId());
        PaymentVerificationResponse response = paymentService.verifyPayment(request);
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/{paymentId}")
    public ResponseEntity<PaymentResponse> getPayment(@PathVariable String paymentId) {
        PaymentResponse response = paymentService.getPaymentById(paymentId);
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/order/{orderId}")
    public ResponseEntity<PaymentResponse> getPaymentByOrder(@PathVariable String orderId) {
        PaymentResponse response = paymentService.getPaymentByOrderId(orderId);
        return ResponseEntity.ok(response);
    }
    
    @PostMapping("/{paymentId}/refund")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<RefundResponse> initiateRefund(
            @PathVariable String paymentId,
            @RequestParam java.math.BigDecimal amount,
            @RequestParam(required = false) String reason,
            @AuthenticationPrincipal UserPrincipal adminPrincipal) {
        String userId = adminPrincipal.getId();
        log.info("Initiating refund for payment: {}", paymentId);
        RefundResponse response = paymentService.initiateRefund(paymentId, amount, reason, userId);
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/analytics")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<PaymentAnalyticsResponse> getAnalytics(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        PaymentAnalyticsResponse response = paymentService.getPaymentAnalytics(startDate, endDate);
        return ResponseEntity.ok(response);
    }
}
