package com.artwork.entity.payment;

/**
 * Status lifecycle for payment transactions.
 */
public enum PaymentStatus {
    INITIATED,
    PENDING,
    AUTHORIZED,
    CAPTURED,
    FAILED,
    REFUNDED,
    PARTIALLY_REFUNDED
}
