package com.artwork.entity.payment;

/**
 * Status lifecycle for refund transactions.
 */
public enum RefundStatus {
    INITIATED,
    PROCESSING,
    COMPLETED,
    FAILED,
    CANCELLED
}
