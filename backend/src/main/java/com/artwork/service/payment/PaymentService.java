package com.artwork.service.payment;

import com.artwork.dto.payment.*;
import java.math.BigDecimal;


public interface PaymentService {
    
    
    PaymentResponse createPayment(CreatePaymentRequest request);
    
    
    PaymentVerificationResponse verifyPayment(PaymentVerificationRequest request);
    
    
    PaymentResponse getPaymentById(String paymentId);
    
    
    PaymentResponse getPaymentByOrderId(String orderId);
    
    
    RefundResponse initiateRefund(String paymentId, BigDecimal amount, String reason, String initiatedBy);
    
    
    PaymentAnalyticsResponse getPaymentAnalytics(java.time.LocalDateTime startDate, java.time.LocalDateTime endDate);
}
