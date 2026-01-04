package com.artwork.security;

import java.util.Map;


public class FacebookOAuth2UserInfo extends OAuth2UserInfo {
    
    public FacebookOAuth2UserInfo(Map<String, Object> attributes) {
        super(attributes);
    }
    
    @Override
    public String getId() {
        return (String) attributes.get("id");
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
        return name;
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
        if (attributes.containsKey("picture")) {
            Map<String, Object> pictureObj = (Map<String, Object>) attributes.get("picture");
            if (pictureObj != null && pictureObj.containsKey("data")) {
                Map<String, Object> dataObj = (Map<String, Object>) pictureObj.get("data");
                if (dataObj != null && dataObj.containsKey("url")) {
                    return (String) dataObj.get("url");
                }
            }
        }
        return null;
    }
}
