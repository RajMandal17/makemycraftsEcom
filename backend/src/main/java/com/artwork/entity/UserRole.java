package com.artwork.entity;

/**
 * This class provides constants for user roles to ensure consistent usage across the application
 * Spring Security requires the "ROLE_" prefix for roles to work with hasRole/hasAuthority
 */
public class UserRole {
    // Roles without prefix (used in database)
    public static final String CUSTOMER = "CUSTOMER";
    public static final String ARTIST = "ARTIST";
    public static final String ADMIN = "ADMIN";
    
    // Roles with Spring Security prefix
    public static final String ROLE_CUSTOMER = "ROLE_CUSTOMER";
    public static final String ROLE_ARTIST = "ROLE_ARTIST";
    public static final String ROLE_ADMIN = "ROLE_ADMIN";
}
