package com.artwork.service.ai;

import com.artwork.dto.ArtworkSuggestionDto;

/**
 * Interface for AI-powered artwork analysis services
 * Following Dependency Inversion Principle - depend on abstractions, not concretions
 */
public interface IArtworkAnalysisService {
    
    /**
     * Analyze an artwork image and generate suggestions
     * 
     * @param imageUrl URL of the image to analyze
     * @param userId ID of the user requesting analysis
     * @return ArtworkSuggestionDto containing AI-generated suggestions
     * @throws Exception if analysis fails
     */
    ArtworkSuggestionDto analyzeArtwork(String imageUrl, String userId) throws Exception;
    
    /**
     * Check if the AI service is available and configured
     * 
     * @return true if service is available, false otherwise
     */
    boolean isAvailable();
    
    /**
     * Get the name of the AI provider
     * 
     * @return Provider name (e.g., "Google Gemini", "OpenAI", etc.)
     */
    String getProviderName();
}
