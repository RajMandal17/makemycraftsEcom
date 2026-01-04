package com.artwork.service.payment;

import java.math.BigDecimal;


public interface PaymentGateway {
    
    
    String getGatewayName();
    
    
    PaymentOrderResponse createOrder(String orderId, BigDecimal amount, String currency);
    
    
    default PaymentOrderResponse createOrderWithTransfer(
            String orderId, 
            BigDecimal amount, 
            String currency,
            String linkedAccountId,
            BigDecimal transferAmount) {
        
        return createOrder(orderId, amount, currency);
    }
    
    
    boolean verifyPayment(String gatewayOrderId, String gatewayPaymentId, String gatewaySignature);
    
    
    PaymentCaptureResponse capturePayment(String gatewayPaymentId, BigDecimal amount);
    
    
    RefundResponse initiateRefund(String gatewayPaymentId, BigDecimal amount, String reason);
    
    
    RefundStatusResponse getRefundStatus(String gatewayRefundId);
    
    
    record PaymentOrderResponse(
        boolean success,
        String gatewayOrderId,
        String errorMessage
    ) {}
    
    
    record PaymentCaptureResponse(
        boolean success,
        String status,
        String errorMessage
    ) {}
    
    
    record RefundResponse(
        boolean success,
        String gatewayRefundId,
        String status,
        String errorMessage
    ) {}
    
    
    record RefundStatusResponse(
        String status,
        String gatewayRefundId,
        BigDecimal amount
    ) {}
}
