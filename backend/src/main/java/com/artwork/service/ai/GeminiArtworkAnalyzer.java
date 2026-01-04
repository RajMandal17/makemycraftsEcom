package com.artwork.service.ai;

import com.artwork.dto.ArtworkSuggestionDto;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import okhttp3.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.concurrent.TimeUnit;

/**
 * Google Gemini Pro Vision implementation of artwork analysis
 * Following Single Responsibility Principle - only handles Gemini AI integration
 */
@Service
@Slf4j
public class GeminiArtworkAnalyzer implements IArtworkAnalysisService {
    
    @Value("${gemini.api.key}")
    private String apiKey;
    
    @Value("${gemini.api.url}")
    private String apiUrl;
    
    @Value("${gemini.enabled:true}")
    private boolean geminiEnabled;
    
    @Value("${gemini.model:gemini-pro-vision}")
    private String model;
    
    @Value("${gemini.max-tokens:2048}")
    private int maxTokens;
    
    @Value("${gemini.temperature:0.7}")
    private double temperature;
    
    private final OkHttpClient httpClient;
    private final ObjectMapper objectMapper;
    
    public GeminiArtworkAnalyzer() {
        this.httpClient = new OkHttpClient.Builder()
            .connectTimeout(30, TimeUnit.SECONDS)
            .readTimeout(60, TimeUnit.SECONDS)
            .writeTimeout(30, TimeUnit.SECONDS)
            .build();
        this.objectMapper = new ObjectMapper();
    }
    
    @jakarta.annotation.PostConstruct
    public void init() {
        try {
            log.info("=== Gemini AI Service Initialization ===");
            log.info("Enabled: {}", geminiEnabled);
            log.info("Model: {}", model);
            log.info("API URL: {}", apiUrl);
            
            if (apiKey != null && apiKey.length() > 8) {
                log.info("API Key configured: {}...{}", 
                    apiKey.substring(0, 4), 
                    apiKey.substring(apiKey.length() - 4));
                
                // Validate API key format (should start with "AIza")
                if (!apiKey.startsWith("AIza")) {
                    log.warn("⚠️ API Key does not start with 'AIza' - may be invalid!");
                }
            } else if (apiKey != null && !apiKey.equals("not-configured")) {
                log.error("❌ API Key configured but looks short/invalid: length={}", apiKey.length());
            } else {
                log.error("❌ API Key NOT configured (value: {})", apiKey);
            }
            
            log.info("Service Available: {}", isAvailable());
            log.info("========================================");
        } catch (Exception e) {
            log.error("Error during Gemini service initialization", e);
        }
    }
    
    @Override
    public ArtworkSuggestionDto analyzeArtwork(String imageUrl, String userId) throws Exception {
        if (!isAvailable()) {
            throw new IllegalStateException("Gemini AI service is not available or not configured");
        }
        
        log.info("Analyzing artwork with Gemini AI for user: {}", userId);
        
        try {
            // Build the prompt for artwork analysis
            String prompt = buildAnalysisPrompt();
            
            // Call Gemini API
            String response = callGeminiAPI(imageUrl, prompt);
            
            // Parse response and build suggestion DTO
            return parseGeminiResponse(response, imageUrl, userId);
            
        } catch (Exception e) {
            log.error("Error analyzing artwork with Gemini AI", e);
            throw e; // Re-throw to be handled by controller
        }
    }
    
    @Override
    public boolean isAvailable() {
        boolean hasValidKey = apiKey != null && 
                             !apiKey.isEmpty() && 
                             !apiKey.equals("not-configured") &&
                             !apiKey.equals("your-gemini-api-key-here") &&
                             apiKey.startsWith("AIza");
        
        boolean available = geminiEnabled && hasValidKey;
        
        if (!available) {
            if (!geminiEnabled) {
                log.warn("❌ Gemini AI is DISABLED (gemini.enabled=false)");
            } else if (!hasValidKey) {
                log.warn("❌ Gemini API Key is INVALID or NOT SET");
            }
        }
        
        return available;
    }
    
    @Override
    public String getProviderName() {
        return "Google Gemini Pro Vision";
    }
    
    /**
     * Build the analysis prompt for Gemini
     */
    private String buildAnalysisPrompt() {
        return "You are an expert art curator and critic. Analyze this artwork image and provide detailed metadata in JSON format.\n\n" +
               "Provide the following information:\n" +
               "1. title: A compelling, descriptive title (max 100 chars)\n" +
               "2. category: Choose ONE from [Painting, Drawing, Photography, Digital Art, Sculpture, Mixed Media, Prints, Abstract, Portrait, Landscape, Still Life, Other]\n" +
               "3. medium: The artistic medium/technique used (e.g., 'Oil on Canvas', 'Digital', 'Watercolor', etc.)\n" +
               "4. description: A detailed description (200-500 words) covering composition, technique, style, and emotional impact\n" +
               "5. tags: Array of 5-10 relevant tags (e.g., ['abstract', 'colorful', 'modern', 'geometric'])\n" +
               "6. estimatedWidth: Estimated width in cm (reasonable estimate based on apparent scale)\n" +
               "7. estimatedHeight: Estimated height in cm (reasonable estimate based on apparent scale)\n" +
               "8. confidence: Your confidence level (0.0 to 1.0)\n" +
               "9. metadata: Object with additional analysis:\n" +
               "   - artStyle: The art style/movement (e.g., 'Impressionism', 'Contemporary', etc.)\n" +
               "   - dominantColors: Comma-separated list of main colors\n" +
               "   - mood: The emotional mood/atmosphere\n" +
               "   - subject: Main subject matter\n" +
               "   - technicalQualities: Array of notable technical aspects\n\n" +
               "Respond ONLY with valid JSON, no markdown formatting, no code blocks. Start directly with '{'";
    }
    
    /**
     * Call Gemini API with image URL and prompt
     */
    private String callGeminiAPI(String imageUrl, String prompt) throws IOException {
        try {
            // Fetch and encode image
            String base64Image = fetchImageAsBase64(imageUrl);
            
            // Build request body using ObjectMapper to avoid JSON escaping issues
            com.fasterxml.jackson.databind.node.ObjectNode requestJson = objectMapper.createObjectNode();
            
            // Create contents array
            com.fasterxml.jackson.databind.node.ArrayNode contentsArray = objectMapper.createArrayNode();
            com.fasterxml.jackson.databind.node.ObjectNode contentObj = objectMapper.createObjectNode();
            
            // Create parts array
            com.fasterxml.jackson.databind.node.ArrayNode partsArray = objectMapper.createArrayNode();
            
            // Add text part
            com.fasterxml.jackson.databind.node.ObjectNode textPart = objectMapper.createObjectNode();
            textPart.put("text", prompt);
            partsArray.add(textPart);
            
            // Add image part
            com.fasterxml.jackson.databind.node.ObjectNode imagePart = objectMapper.createObjectNode();
            com.fasterxml.jackson.databind.node.ObjectNode inlineData = objectMapper.createObjectNode();
            inlineData.put("mime_type", "image/jpeg");
            inlineData.put("data", base64Image);
            imagePart.set("inline_data", inlineData);
            partsArray.add(imagePart);
            
            contentObj.set("parts", partsArray);
            contentsArray.add(contentObj);
            requestJson.set("contents", contentsArray);
            
            // Add generation config
            com.fasterxml.jackson.databind.node.ObjectNode generationConfig = objectMapper.createObjectNode();
            generationConfig.put("temperature", temperature);
            generationConfig.put("maxOutputTokens", maxTokens);
            generationConfig.put("topP", 1);
            generationConfig.put("topK", 32);
            requestJson.set("generationConfig", generationConfig);
            
            // Convert to JSON string
            String requestBody = objectMapper.writeValueAsString(requestJson);
            
            log.debug("Request body size: {} bytes", requestBody.length());
            
            Request request = new Request.Builder()
                .url(apiUrl + "?key=" + apiKey)
                .post(RequestBody.create(requestBody, MediaType.get("application/json; charset=utf-8")))
                .build();
            
            try (Response response = httpClient.newCall(request).execute()) {
                if (!response.isSuccessful()) {
                    String errorBody = response.body() != null ? response.body().string() : "Unknown error";
                    log.error("Gemini API error: {} - {}", response.code(), errorBody);
                    
                    String errorMessage;
                    switch (response.code()) {
                        case 400:
                            errorMessage = "Invalid request to Gemini API. Check image format or prompt.";
                            break;
                        case 401:
                        case 403:
                            errorMessage = "Invalid Gemini API key or unauthorized access.";
                            break;
                        case 429:
                            errorMessage = "Gemini API rate limit exceeded.";
                            break;
                        case 500:
                        case 503:
                            errorMessage = "Gemini API service unavailable.";
                            break;
                        default:
                            errorMessage = "Gemini API error: " + response.code();
                    }
                    
                    throw new IOException(errorMessage + " Details: " + errorBody);
                }
                
                return response.body().string();
            }
        } catch (JsonProcessingException e) {
            log.error("Error building JSON request", e);
            throw new IOException("Failed to build request: " + e.getMessage(), e);
        }
    }
    
    /**
     * Fetch image from URL and convert to base64, or extract base64 from data URL
     */
    private String fetchImageAsBase64(String imageUrl) throws IOException {
        // Handle base64 data URLs directly (from frontend FileReader)
        if (imageUrl.startsWith("data:")) {
            log.info("Processing data URL (base64 already encoded)");
            String[] parts = imageUrl.split(",", 2);
            if (parts.length != 2) {
                throw new IOException("Invalid data URL format - expected 'data:mime;base64,content'");
            }
            return parts[1]; // Return base64 content after comma
        }
        
        // Handle HTTP/HTTPS URLs (fetch from Cloudinary/web)
        log.info("Fetching image from URL: {}", imageUrl);
        Request request = new Request.Builder()
            .url(imageUrl)
            .build();
        
        try (Response response = httpClient.newCall(request).execute()) {
            if (!response.isSuccessful()) {
                throw new IOException("Failed to fetch image: " + response.code());
            }
            
            byte[] imageBytes = response.body().bytes();
            return java.util.Base64.getEncoder().encodeToString(imageBytes);
        }
    }
    
    /**
     * Parse Gemini API response and extract artwork suggestions
     */
    private ArtworkSuggestionDto parseGeminiResponse(String response, String imageUrl, String userId) throws Exception {
        try {
            JsonNode root = objectMapper.readTree(response);
            
            // Extract generated text from Gemini response
            String generatedText = root.path("candidates")
                .get(0)
                .path("content")
                .path("parts")
                .get(0)
                .path("text")
                .asText();
            
            // Clean up the generated text (remove markdown code blocks if present)
            generatedText = generatedText.trim();
            if (generatedText.startsWith("```json")) {
                generatedText = generatedText.substring(7);
            }
            if (generatedText.startsWith("```")) {
                generatedText = generatedText.substring(3);
            }
            if (generatedText.endsWith("```")) {
                generatedText = generatedText.substring(0, generatedText.length() - 3);
            }
            generatedText = generatedText.trim();
            
            // Parse the artwork analysis JSON
            JsonNode analysis = objectMapper.readTree(generatedText);
            
            // Build metadata
            ArtworkSuggestionDto.AnalysisMetadata metadata = ArtworkSuggestionDto.AnalysisMetadata.builder()
                .artStyle(analysis.path("metadata").path("artStyle").asText("Contemporary"))
                .dominantColors(analysis.path("metadata").path("dominantColors").asText(""))
                .mood(analysis.path("metadata").path("mood").asText(""))
                .subject(analysis.path("metadata").path("subject").asText(""))
                .technicalQualities(parseTechnicalQualities(analysis.path("metadata").path("technicalQualities")))
                .build();
            
            // Build and return suggestion DTO
            return ArtworkSuggestionDto.builder()
                .userId(userId)
                .imageUrl(imageUrl)
                .suggestedTitle(analysis.path("title").asText("Untitled Artwork"))
                .suggestedCategory(analysis.path("category").asText("Other"))
                .suggestedMedium(analysis.path("medium").asText("Mixed Media"))
                .suggestedDescription(analysis.path("description").asText(""))
                .suggestedTags(parseTags(analysis.path("tags")))
                .suggestedWidth(analysis.path("estimatedWidth").asDouble(50.0))
                .suggestedHeight(analysis.path("estimatedHeight").asDouble(70.0))
                .confidenceScore(analysis.path("confidence").asDouble(0.75))
                .metadata(metadata)
                .build();
            
        } catch (Exception e) {
            log.error("Error parsing Gemini response", e);
            throw new Exception("Failed to parse AI response: " + e.getMessage(), e);
        }
    }
    
    private List<String> parseTags(JsonNode tagsNode) {
        List<String> tags = new ArrayList<>();
        if (tagsNode.isArray()) {
            tagsNode.forEach(tag -> tags.add(tag.asText()));
        }
        return tags.isEmpty() ? Arrays.asList("artwork", "original") : tags;
    }
    
    private List<String> parseTechnicalQualities(JsonNode qualitiesNode) {
        List<String> qualities = new ArrayList<>();
        if (qualitiesNode.isArray()) {
            qualitiesNode.forEach(quality -> qualities.add(quality.asText()));
        }
        return qualities;
    }
}
