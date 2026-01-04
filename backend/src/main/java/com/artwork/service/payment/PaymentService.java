package com.artwork.service.payment;

import com.artwork.dto.payment.*;
import java.math.BigDecimal;

/**
 * Payment service interface for orchestrating payment operations.
 * 
 * Single Responsibility: Orchestrates payment flow across gateway and persistence.
 * 
 * @author Artwork Platform
 */
public interface PaymentService {
    
    /**
     * Create a new payment for an order.
     */
    PaymentResponse createPayment(CreatePaymentRequest request);
    
    /**
     * Verify and process payment callback from gateway.
     */
    PaymentVerificationResponse verifyPayment(PaymentVerificationRequest request);
    
    /**
     * Get payment details by ID.
     */
    PaymentResponse getPaymentById(String paymentId);
    
    /**
     * Get payment by order ID.
     */
    PaymentResponse getPaymentByOrderId(String orderId);
    
    /**
     * Initiate refund for a payment.
     */
    RefundResponse initiateRefund(String paymentId, BigDecimal amount, String reason, String initiatedBy);
    
    /**
     * Get payment analytics for admin dashboard.
     */
    PaymentAnalyticsResponse getPaymentAnalytics(java.time.LocalDateTime startDate, java.time.LocalDateTime endDate);
}
