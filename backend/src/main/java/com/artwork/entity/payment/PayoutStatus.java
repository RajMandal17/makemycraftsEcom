package com.artwork.entity.payment;

/**
 * Status lifecycle for payout transactions.
 */
public enum PayoutStatus {
    PENDING,
    PROCESSING,
    COMPLETED,
    FAILED,
    CANCELLED
}
