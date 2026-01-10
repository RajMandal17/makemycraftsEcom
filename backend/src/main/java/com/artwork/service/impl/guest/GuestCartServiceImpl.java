package com.artwork.service.impl.guest;

import com.artwork.dto.ArtworkDto;
import com.artwork.dto.CartItemDto;
import com.artwork.dto.GuestCartResponseDto;
import com.artwork.dto.GuestSessionDto;
import com.artwork.entity.Artwork;
import com.artwork.repository.ArtworkRepository;
import com.artwork.service.GuestCartService;
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
public class GuestCartServiceImpl implements GuestCartService {

    private final StringRedisTemplate redisTemplate;
    private final ArtworkRepository artworkRepository;
    private final ObjectMapper objectMapper;

    private static final String GUEST_CART_PREFIX = "guest:cart:";
    private static final long GUEST_CART_TTL_DAYS = 7;
    private static final long GUEST_CART_TTL_SECONDS = GUEST_CART_TTL_DAYS * 24 * 60 * 60;

    @Override
    public GuestSessionDto generateGuestSession() {
        String sessionId = UUID.randomUUID().toString();
        return GuestSessionDto.builder()
                .sessionId(sessionId)
                .message("Guest session created successfully")
                .expiresIn(GUEST_CART_TTL_SECONDS)
                .build();
    }

    @Override
    public GuestCartResponseDto addToCart(String sessionId, CartItemDto cartItemDto) {
        List<CartItemDto> cartItems = getCartItemsInternal(sessionId);
        
        Optional<CartItemDto> existingItem = cartItems.stream()
                .filter(item -> item.getArtworkId().equals(cartItemDto.getArtworkId()))
                .findFirst();

        if (existingItem.isPresent()) {
            existingItem.get().setQuantity(existingItem.get().getQuantity() + cartItemDto.getQuantity());
        } else {
            CartItemDto newItem = new CartItemDto();
            newItem.setId(UUID.randomUUID().toString());
            newItem.setArtworkId(cartItemDto.getArtworkId());
            newItem.setQuantity(cartItemDto.getQuantity());
            newItem.setCreatedAt(LocalDateTime.now().toString());
            cartItems.add(newItem);
        }

        saveCartItems(sessionId, cartItems);
        return buildCartResponse(sessionId, cartItems);
    }

    @Override
    public GuestCartResponseDto getCart(String sessionId) {
        List<CartItemDto> cartItems = getCartItemsInternal(sessionId);
        return buildCartResponse(sessionId, cartItems);
    }

    @Override
    public GuestCartResponseDto updateQuantity(String sessionId, String itemId, int quantity) {
        List<CartItemDto> cartItems = getCartItemsInternal(sessionId);
        
        cartItems.stream()
                .filter(item -> item.getId().equals(itemId))
                .findFirst()
                .ifPresent(item -> item.setQuantity(quantity));

        saveCartItems(sessionId, cartItems);
        return buildCartResponse(sessionId, cartItems);
    }

    @Override
    public void removeItem(String sessionId, String itemId) {
        List<CartItemDto> cartItems = getCartItemsInternal(sessionId);
        cartItems.removeIf(item -> item.getId().equals(itemId));
        saveCartItems(sessionId, cartItems);
    }

    @Override
    public void clearCart(String sessionId) {
        String key = GUEST_CART_PREFIX + sessionId;
        redisTemplate.delete(key);
    }

    @Override
    public List<CartItemDto> getCartItems(String sessionId) {
        return getCartItemsInternal(sessionId);
    }

    @Override
    public boolean sessionExists(String sessionId) {
        String key = GUEST_CART_PREFIX + sessionId;
        return Boolean.TRUE.equals(redisTemplate.hasKey(key));
    }

    @Override
    public void deleteSession(String sessionId) {
        clearCart(sessionId);
    }

    private List<CartItemDto> getCartItemsInternal(String sessionId) {
        String key = GUEST_CART_PREFIX + sessionId;
        String json = redisTemplate.opsForValue().get(key);
        
        if (json == null || json.isEmpty()) {
            return new ArrayList<>();
        }

        try {
            return objectMapper.readValue(json, new TypeReference<List<CartItemDto>>() {});
        } catch (JsonProcessingException e) {
            log.error("Error parsing guest cart from Redis: {}", e.getMessage());
            return new ArrayList<>();
        }
    }

    private void saveCartItems(String sessionId, List<CartItemDto> cartItems) {
        String key = GUEST_CART_PREFIX + sessionId;
        try {
            String json = objectMapper.writeValueAsString(cartItems);
            redisTemplate.opsForValue().set(key, json, GUEST_CART_TTL_DAYS, TimeUnit.DAYS);
        } catch (JsonProcessingException e) {
            log.error("Error saving guest cart to Redis: {}", e.getMessage());
        }
    }

    private GuestCartResponseDto buildCartResponse(String sessionId, List<CartItemDto> cartItems) {
        double totalAmount = 0;
        int totalItems = 0;

        for (CartItemDto item : cartItems) {
            Optional<Artwork> artworkOpt = artworkRepository.findById(item.getArtworkId());
            if (artworkOpt.isPresent()) {
                Artwork artwork = artworkOpt.get();
                ArtworkDto artworkDto = new ArtworkDto();
                artworkDto.setId(artwork.getId());
                artworkDto.setTitle(artwork.getTitle());
                artworkDto.setPrice(artwork.getPrice());
                artworkDto.setImages(artwork.getImages());
                item.setArtwork(artworkDto);
                
                totalAmount += artwork.getPrice() * item.getQuantity();
                totalItems += item.getQuantity();
            }
        }

        return GuestCartResponseDto.builder()
                .sessionId(sessionId)
                .items(cartItems)
                .totalItems(totalItems)
                .totalAmount(totalAmount)
                .expiresIn(GUEST_CART_TTL_SECONDS)
                .build();
    }
}
