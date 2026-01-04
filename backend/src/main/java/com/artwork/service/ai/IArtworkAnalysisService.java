package com.artwork.service.ai;

import com.artwork.dto.ArtworkSuggestionDto;


public interface IArtworkAnalysisService {
    
    
    ArtworkSuggestionDto analyzeArtwork(String imageUrl, String userId) throws Exception;
    
    
    boolean isAvailable();
    
    
    String getProviderName();
}
