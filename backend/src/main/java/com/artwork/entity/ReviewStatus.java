package com.artwork.entity;

/**
 * Review moderation status
 */
public enum ReviewStatus {
    PENDING,    // Awaiting moderation
    APPROVED,   // Published and visible
    REJECTED,   // Rejected by moderator (spam, inappropriate)
    HIDDEN      // Hidden by user or admin
}
