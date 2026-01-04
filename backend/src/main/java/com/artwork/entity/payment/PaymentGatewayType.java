package com.artwork.entity.payment;

/**
 * Payment gateway providers supported by the platform.
 * Follows Open/Closed Principle - new gateways can be added without modifying existing code.
 */
public enum PaymentGatewayType {
    RAZORPAY,
    CASHFREE  // Future implementation
}
