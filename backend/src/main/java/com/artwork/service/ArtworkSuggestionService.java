package com.artwork.service;

import com.artwork.dto.AnalysisRequest;
import com.artwork.dto.ArtworkSuggestionDto;
import com.artwork.entity.ArtworkSuggestion;
import com.artwork.entity.User;
import com.artwork.repository.ArtworkSuggestionRepository;
import com.artwork.repository.UserRepository;
import com.artwork.service.ai.IArtworkAnalysisService;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;


@Service
@RequiredArgsConstructor
@Slf4j
public class ArtworkSuggestionService {
    
    private final IArtworkAnalysisService artworkAnalysisService;
    private final ArtworkSuggestionRepository suggestionRepository;
    private final UserRepository userRepository;
    private final ObjectMapper objectMapper;
    
    
    @Transactional
    public ArtworkSuggestionDto analyzeAndSaveSuggestion(AnalysisRequest request) throws Exception {
        log.info("Processing analysis request for user: {}", request.getUserId());
        
        
        User user = userRepository.findById(request.getUserId())
            .orElseThrow(() -> new IllegalArgumentException("User not found: " + request.getUserId()));
        
        
        ArtworkSuggestionDto suggestionDto = artworkAnalysisService.analyzeArtwork(
            request.getImageUrl(), 
            request.getUserId()
        );
        
        
        ArtworkSuggestion suggestion = convertToEntity(suggestionDto, user);
        ArtworkSuggestion saved = suggestionRepository.save(suggestion);
        
        log.info("Saved suggestion with ID: {} for user: {}", saved.getId(), request.getUserId());
        
        
        suggestionDto.setId(saved.getId());
        suggestionDto.setCreatedAt(saved.getCreatedAt());
        suggestionDto.setIsApplied(saved.getIsApplied());
        
        return suggestionDto;
    }
    
    
    @Transactional(readOnly = true)
    public Page<ArtworkSuggestionDto> getSuggestionHistory(String userId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<ArtworkSuggestion> suggestions = suggestionRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable);
        
        return suggestions.map(this::convertToDto);
    }
    
    
    @Transactional(readOnly = true)
    public List<ArtworkSuggestionDto> getAllSuggestionsForUser(String userId) {
        List<ArtworkSuggestion> suggestions = suggestionRepository.findByUserId(userId);
        return suggestions.stream()
            .map(this::convertToDto)
            .collect(Collectors.toList());
    }
    
    
    @Transactional(readOnly = true)
    public ArtworkSuggestionDto getSuggestionById(String id, String userId) {
        ArtworkSuggestion suggestion = suggestionRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Suggestion not found: " + id));
        
        
        if (!suggestion.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("Unauthorized access to suggestion: " + id);
        }
        
        return convertToDto(suggestion);
    }
    
    
    @Transactional
    public void markAsApplied(String id, String userId) {
        ArtworkSuggestion suggestion = suggestionRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Suggestion not found: " + id));
        
        
        if (!suggestion.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("Unauthorized access to suggestion: " + id);
        }
        
        suggestion.setIsApplied(true);
        suggestionRepository.save(suggestion);
        
        log.info("Marked suggestion {} as applied for user: {}", id, userId);
    }
    
    
    @Transactional
    public void deleteSuggestion(String id, String userId) {
        ArtworkSuggestion suggestion = suggestionRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Suggestion not found: " + id));
        
        
        if (!suggestion.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("Unauthorized access to suggestion: " + id);
        }
        
        suggestionRepository.delete(suggestion);
        log.info("Deleted suggestion {} for user: {}", id, userId);
    }
    
    
    @Transactional(readOnly = true)
    public SuggestionStats getUserStats(String userId) {
        long totalSuggestions = suggestionRepository.countByUserId(userId);
        long appliedSuggestions = suggestionRepository.countByUserIdAndIsApplied(userId, true);
        
        return new SuggestionStats(totalSuggestions, appliedSuggestions);
    }
    
    
    public boolean isAIServiceAvailable() {
        return artworkAnalysisService.isAvailable();
    }
    
    
    public String getAIProviderName() {
        return artworkAnalysisService.getProviderName();
    }
    
    
    
    private ArtworkSuggestion convertToEntity(ArtworkSuggestionDto dto, User user) throws JsonProcessingException {
        
        String imageUrlToSave = dto.getImageUrl();
        if (imageUrlToSave != null && imageUrlToSave.startsWith("data:")) {
            
            imageUrlToSave = "[data-url-preview]";
        } else if (imageUrlToSave != null && imageUrlToSave.length() > 500) {
            
            imageUrlToSave = imageUrlToSave.substring(0, 500);
        }
        
        return ArtworkSuggestion.builder()
            .userId(user.getId())
            .imageUrl(imageUrlToSave)
            .suggestedTitle(dto.getSuggestedTitle())
            .suggestedCategory(dto.getSuggestedCategory())
            .suggestedMedium(dto.getSuggestedMedium())
            .suggestedDescription(dto.getSuggestedDescription())
            .suggestedTags(String.join(",", dto.getSuggestedTags()))
            .suggestedWidth(dto.getSuggestedWidth())
            .suggestedHeight(dto.getSuggestedHeight())
            .confidenceScore(dto.getConfidenceScore())
            .analysisMetadata(objectMapper.writeValueAsString(dto.getMetadata()))
            .createdAt(LocalDateTime.now())
            .isApplied(false)
            .build();
    }
    
    private ArtworkSuggestionDto convertToDto(ArtworkSuggestion entity) {
        ArtworkSuggestionDto.AnalysisMetadata metadata = null;
        try {
            if (entity.getAnalysisMetadata() != null && !entity.getAnalysisMetadata().isEmpty()) {
                metadata = objectMapper.readValue(
                    entity.getAnalysisMetadata(), 
                    ArtworkSuggestionDto.AnalysisMetadata.class
                );
            }
        } catch (JsonProcessingException e) {
            log.error("Error parsing metadata JSON", e);
        }
        
        return ArtworkSuggestionDto.builder()
            .id(entity.getId())
            .userId(entity.getUser().getId())
            .imageUrl(entity.getImageUrl())
            .suggestedTitle(entity.getSuggestedTitle())
            .suggestedCategory(entity.getSuggestedCategory())
            .suggestedMedium(entity.getSuggestedMedium())
            .suggestedDescription(entity.getSuggestedDescription())
            .suggestedTags(entity.getSuggestedTagsList())
            .suggestedWidth(entity.getSuggestedWidth())
            .suggestedHeight(entity.getSuggestedHeight())
            .confidenceScore(entity.getConfidenceScore())
            .metadata(metadata)
            .createdAt(entity.getCreatedAt())
            .isApplied(entity.getIsApplied())
            .build();
    }
    
    
    public record SuggestionStats(long totalSuggestions, long appliedSuggestions) {
        public double getAppliedPercentage() {
            return totalSuggestions == 0 ? 0.0 : (appliedSuggestions * 100.0) / totalSuggestions;
        }
    }
}
