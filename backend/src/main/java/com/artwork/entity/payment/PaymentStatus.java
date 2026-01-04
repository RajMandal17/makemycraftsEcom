package com.artwork.entity.payment;


public enum PaymentStatus {
    INITIATED,
    PENDING,
    AUTHORIZED,
    CAPTURED,
    FAILED,
    REFUNDED,
    PARTIALLY_REFUNDED
}
