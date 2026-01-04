package com.artwork.security;

import lombok.Getter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import java.util.Collection;
import java.util.Collections;

/**
 * UserDetails implementation for service account authentication.
 * Used for inter-service communication where no database user exists.
 */
@Getter
public class ServiceAccountUserDetails implements UserDetails {
    private final String serviceAccountId;
    private final String role;

    public ServiceAccountUserDetails(String serviceAccountId, String role) {
        this.serviceAccountId = serviceAccountId;
        this.role = role;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        // Spring Security requires "ROLE_" prefix for roles
        return Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + role));
    }

    @Override
    public String getPassword() {
        return null; // Service accounts don't have passwords
    }

    @Override
    public String getUsername() {
        return serviceAccountId;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }
}