package com.artwork.security;

import java.util.Map;

/**
 * GitHub OAuth2 user info implementation
 */
public class GithubOAuth2UserInfo extends OAuth2UserInfo {
    
    public GithubOAuth2UserInfo(Map<String, Object> attributes) {
        super(attributes);
    }
    
    @Override
    public String getId() {
        return String.valueOf(attributes.get("id"));
    }
    
    @Override
    public String getEmail() {
        return (String) attributes.get("email");
    }
    
    @Override
    public String getName() {
        return (String) attributes.get("name");
    }
    
    @Override
    public String getFirstName() {
        String name = getName();
        if (name != null && name.contains(" ")) {
            return name.split(" ")[0];
        }
        return name != null ? name : (String) attributes.get("login");
    }
    
    @Override
    public String getLastName() {
        String name = getName();
        if (name != null && name.contains(" ")) {
            String[] parts = name.split(" ");
            return parts[parts.length - 1];
        }
        return "";
    }
    
    @Override
    public String getImageUrl() {
        return (String) attributes.get("avatar_url");
    }
}
