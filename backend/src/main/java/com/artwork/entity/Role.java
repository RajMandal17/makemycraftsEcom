package com.artwork.entity;

public enum Role {
    CUSTOMER,
    ARTIST,
    ADMIN,
    PENDING  // For OAuth2 users who haven't selected their role yet
}
