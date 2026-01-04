package com.artwork.entity.payment;

/**
 * Status of a seller's Razorpay linked account.
 */
public enum LinkedAccountStatus {
    CREATED,        // Account created but not yet active
    ACTIVE,         // Account is active and can receive payments
    SUSPENDED,      // Account suspended due to compliance issues
    NEEDS_REVIEW,   // Account needs manual review
    FAILED          // Account creation failed
}
