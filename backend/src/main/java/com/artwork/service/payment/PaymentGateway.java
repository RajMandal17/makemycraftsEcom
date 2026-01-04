package com.artwork.service.payment;

import java.math.BigDecimal;

/**
 * Strategy interface for payment gateway implementations.
 * 
 * Follows Open/Closed Principle: New payment gateways can be added
 * without modifying existing code.
 * 
 * Follows Interface Segregation: Only payment-specific methods included.
 * 
 * @author Artwork Platform
 */
public interface PaymentGateway {
    
    /**
     * Get the gateway identifier.
     */
    String getGatewayName();
    
    /**
     * Create a payment order in the gateway.
     * 
     * @param orderId internal order ID
     * @param amount payment amount
     * @param currency currency code (e.g., "INR")
     * @return gateway-specific order ID
     */
    PaymentOrderResponse createOrder(String orderId, BigDecimal amount, String currency);
    
    /**
     * Create a payment order with Route transfer (split payment).
     * 
     * @param orderId internal order ID
     * @param amount total payment amount
     * @param currency currency code (e.g., "INR")
     * @param linkedAccountId Razorpay linked account ID for the seller
     * @param transferAmount amount to transfer to seller
     * @return gateway-specific order ID
     */
    default PaymentOrderResponse createOrderWithTransfer(
            String orderId, 
            BigDecimal amount, 
            String currency,
            String linkedAccountId,
            BigDecimal transferAmount) {
        // Default implementation falls back to regular order creation
        return createOrder(orderId, amount, currency);
    }
    
    /**
     * Verify a payment after callback.
     * 
     * @param gatewayOrderId gateway order ID
     * @param gatewayPaymentId gateway payment ID
     * @param gatewaySignature signature for verification
     * @return true if payment is verified
     */
    boolean verifyPayment(String gatewayOrderId, String gatewayPaymentId, String gatewaySignature);
    
    /**
     * Capture an authorized payment.
     * 
     * @param gatewayPaymentId gateway payment ID
     * @param amount amount to capture
     * @return capture result
     */
    PaymentCaptureResponse capturePayment(String gatewayPaymentId, BigDecimal amount);
    
    /**
     * Initiate a refund.
     * 
     * @param gatewayPaymentId gateway payment ID
     * @param amount refund amount
     * @param reason refund reason
     * @return refund result
     */
    RefundResponse initiateRefund(String gatewayPaymentId, BigDecimal amount, String reason);
    
    /**
     * Check refund status.
     * 
     * @param gatewayRefundId gateway refund ID
     * @return refund status
     */
    RefundStatusResponse getRefundStatus(String gatewayRefundId);
    
    /**
     * Payment order response DTO.
     */
    record PaymentOrderResponse(
        boolean success,
        String gatewayOrderId,
        String errorMessage
    ) {}
    
    /**
     * Payment capture response DTO.
     */
    record PaymentCaptureResponse(
        boolean success,
        String status,
        String errorMessage
    ) {}
    
    /**
     * Refund response DTO.
     */
    record RefundResponse(
        boolean success,
        String gatewayRefundId,
        String status,
        String errorMessage
    ) {}
    
    /**
     * Refund status response DTO.
     */
    record RefundStatusResponse(
        String status,
        String gatewayRefundId,
        BigDecimal amount
    ) {}
}
