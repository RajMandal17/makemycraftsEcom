package com.artwork.security;

import com.artwork.entity.User;
import lombok.Getter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.core.user.OAuth2User;

import java.util.Collection;
import java.util.Collections;
import java.util.Map;


@Getter
public class CustomOAuth2User implements OAuth2User {
    
    private final Map<String, Object> attributes;
    private final User user;
    private final String nameAttributeKey;
    
    public CustomOAuth2User(Map<String, Object> attributes, User user, String nameAttributeKey) {
        this.attributes = attributes;
        this.user = user;
        this.nameAttributeKey = nameAttributeKey;
    }
    
    public CustomOAuth2User(Map<String, Object> attributes, User user) {
        this(attributes, user, "email");
    }
    
    @Override
    public Map<String, Object> getAttributes() {
        return attributes;
    }
    
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return Collections.singleton(new SimpleGrantedAuthority("ROLE_" + user.getRole().name()));
    }
    
    @Override
    public String getName() {
        
        return user.getEmail();
    }
    
    public String getUserId() {
        return user.getId();
    }
}
