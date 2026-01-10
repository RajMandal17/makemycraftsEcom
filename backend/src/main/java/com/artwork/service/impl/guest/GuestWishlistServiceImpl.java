package com.artwork.service.impl.guest;

import com.artwork.dto.ArtworkDto;
import com.artwork.dto.GuestSessionDto;
import com.artwork.dto.GuestWishlistResponseDto;
import com.artwork.dto.WishlistItemDto;
import com.artwork.entity.Artwork;
import com.artwork.repository.ArtworkRepository;
import com.artwork.service.GuestWishlistService;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
@Slf4j
public class GuestWishlistServiceImpl implements GuestWishlistService {

    private final StringRedisTemplate redisTemplate;
    private final ArtworkRepository artworkRepository;
    private final ObjectMapper objectMapper;

    private static final String GUEST_WISHLIST_PREFIX = "guest:wishlist:";
    private static final long GUEST_WISHLIST_TTL_DAYS = 30;
    private static final long GUEST_WISHLIST_TTL_SECONDS = GUEST_WISHLIST_TTL_DAYS * 24 * 60 * 60;

    @Override
    public GuestSessionDto generateGuestSession() {
        String sessionId = UUID.randomUUID().toString();
        return GuestSessionDto.builder()
                .sessionId(sessionId)
                .message("Guest session created successfully")
                .expiresIn(GUEST_WISHLIST_TTL_SECONDS)
                .build();
    }

    @Override
    public GuestWishlistResponseDto addToWishlist(String sessionId, WishlistItemDto wishlistItemDto) {
        List<WishlistItemDto> wishlistItems = getWishlistItemsInternal(sessionId);
        
        boolean exists = wishlistItems.stream()
                .anyMatch(item -> item.getArtworkId().equals(wishlistItemDto.getArtworkId()));

        if (!exists) {
            WishlistItemDto newItem = new WishlistItemDto();
            newItem.setId(UUID.randomUUID().toString());
            newItem.setArtworkId(wishlistItemDto.getArtworkId());
            newItem.setCreatedAt(LocalDateTime.now().toString());
            wishlistItems.add(newItem);
            saveWishlistItems(sessionId, wishlistItems);
        }

        return buildWishlistResponse(sessionId, wishlistItems);
    }

    @Override
    public GuestWishlistResponseDto getWishlist(String sessionId) {
        List<WishlistItemDto> wishlistItems = getWishlistItemsInternal(sessionId);
        return buildWishlistResponse(sessionId, wishlistItems);
    }

    @Override
    public void removeItem(String sessionId, String itemId) {
        List<WishlistItemDto> wishlistItems = getWishlistItemsInternal(sessionId);
        wishlistItems.removeIf(item -> item.getId().equals(itemId));
        saveWishlistItems(sessionId, wishlistItems);
    }

    @Override
    public void clearWishlist(String sessionId) {
        String key = GUEST_WISHLIST_PREFIX + sessionId;
        redisTemplate.delete(key);
    }

    @Override
    public List<WishlistItemDto> getWishlistItems(String sessionId) {
        return getWishlistItemsInternal(sessionId);
    }

    @Override
    public boolean sessionExists(String sessionId) {
        String key = GUEST_WISHLIST_PREFIX + sessionId;
        return Boolean.TRUE.equals(redisTemplate.hasKey(key));
    }

    @Override
    public void deleteSession(String sessionId) {
        clearWishlist(sessionId);
    }

    @Override
    public boolean isItemInWishlist(String sessionId, String artworkId) {
        List<WishlistItemDto> items = getWishlistItemsInternal(sessionId);
        return items.stream().anyMatch(item -> item.getArtworkId().equals(artworkId));
    }

    private List<WishlistItemDto> getWishlistItemsInternal(String sessionId) {
        String key = GUEST_WISHLIST_PREFIX + sessionId;
        String json = redisTemplate.opsForValue().get(key);
        
        if (json == null || json.isEmpty()) {
            return new ArrayList<>();
        }

        try {
            return objectMapper.readValue(json, new TypeReference<List<WishlistItemDto>>() {});
        } catch (JsonProcessingException e) {
            log.error("Error parsing guest wishlist from Redis: {}", e.getMessage());
            return new ArrayList<>();
        }
    }

    private void saveWishlistItems(String sessionId, List<WishlistItemDto> wishlistItems) {
        String key = GUEST_WISHLIST_PREFIX + sessionId;
        try {
            String json = objectMapper.writeValueAsString(wishlistItems);
            redisTemplate.opsForValue().set(key, json, GUEST_WISHLIST_TTL_DAYS, TimeUnit.DAYS);
        } catch (JsonProcessingException e) {
            log.error("Error saving guest wishlist to Redis: {}", e.getMessage());
        }
    }

    private GuestWishlistResponseDto buildWishlistResponse(String sessionId, List<WishlistItemDto> wishlistItems) {
        for (WishlistItemDto item : wishlistItems) {
            Optional<Artwork> artworkOpt = artworkRepository.findById(item.getArtworkId());
            if (artworkOpt.isPresent()) {
                Artwork artwork = artworkOpt.get();
                ArtworkDto artworkDto = new ArtworkDto();
                artworkDto.setId(artwork.getId());
                artworkDto.setTitle(artwork.getTitle());
                artworkDto.setPrice(artwork.getPrice());
                artworkDto.setImages(artwork.getImages());
                item.setArtwork(artworkDto);
            }
        }

        return GuestWishlistResponseDto.builder()
                .sessionId(sessionId)
                .items(wishlistItems)
                .totalItems(wishlistItems.size())
                .expiresIn(GUEST_WISHLIST_TTL_SECONDS)
                .build();
    }
}
