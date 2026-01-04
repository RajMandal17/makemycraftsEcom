package com.artwork.service.impl;

import com.artwork.dto.CartItemDto;
import com.artwork.entity.CartItem;
import com.artwork.exception.ResourceNotFoundException;
import com.artwork.repository.CartItemRepository;
import com.artwork.service.CartService;
import com.artwork.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CartServiceImpl implements CartService {
    private final CartItemRepository cartItemRepository;
    private final ModelMapper modelMapper;
    private final JwtUtil jwtUtil;

    @Override
    public CartItemDto addToCart(CartItemDto cartItemDto, String token) {
        String userId = jwtUtil.getClaims(token).getSubject();
        
        
        Optional<CartItem> existingItem = cartItemRepository.findAll().stream()
                .filter(item -> item.getUserId().equals(userId) && item.getArtworkId().equals(cartItemDto.getArtworkId()))
                .findFirst();
        
        if (existingItem.isPresent()) {
            
            CartItem item = existingItem.get();
            item.setQuantity(item.getQuantity() + cartItemDto.getQuantity());
            cartItemRepository.save(item);
            return modelMapper.map(item, CartItemDto.class);
        }
        
        
        CartItem cartItem = CartItem.builder()
                .userId(userId)
                .artworkId(cartItemDto.getArtworkId())
                .quantity(cartItemDto.getQuantity())
                .build();
        cartItemRepository.save(cartItem);
        return modelMapper.map(cartItem, CartItemDto.class);
    }

    @Override
    public List<CartItemDto> getCart(String token) {
        String userId = jwtUtil.getClaims(token).getSubject();
        List<CartItem> items = cartItemRepository.findAll().stream()
                .filter(item -> item.getUserId().equals(userId))
                .collect(Collectors.toList());
        return items.stream().map(item -> modelMapper.map(item, CartItemDto.class)).collect(Collectors.toList());
    }

    @Override
    public Map<String, Object> getCartSummary(String token) {
        String userId = jwtUtil.getClaims(token).getSubject();
        List<CartItem> items = cartItemRepository.findAll().stream()
                .filter(item -> item.getUserId().equals(userId))
                .collect(Collectors.toList());
        List<CartItemDto> itemDtos = items.stream().map(item -> modelMapper.map(item, CartItemDto.class)).collect(Collectors.toList());
        int totalItems = items.stream().mapToInt(CartItem::getQuantity).sum();
        double totalAmount = items.stream().mapToDouble(item -> item.getQuantity() * (item.getArtwork() != null ? item.getArtwork().getPrice() : 0)).sum();
        Map<String, Object> summary = new HashMap<>();
        summary.put("items", itemDtos);
        summary.put("totalItems", totalItems);
        summary.put("totalAmount", totalAmount);
        return summary;
    }
    
    @Override
    public CartItemDto updateCartItemQuantity(String itemId, int quantity, String token) {
        String userId = jwtUtil.getClaims(token).getSubject();
        
        CartItem cartItem = cartItemRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart item not found"));
        
        
        if (!cartItem.getUserId().equals(userId)) {
            throw new IllegalArgumentException("You don't have permission to update this cart item");
        }
        
        if (quantity <= 0) {
            throw new IllegalArgumentException("Quantity must be greater than zero");
        }
        
        cartItem.setQuantity(quantity);
        cartItemRepository.save(cartItem);
        
        return modelMapper.map(cartItem, CartItemDto.class);
    }
    
    @Override
    public void removeCartItem(String itemId, String token) {
        String userId = jwtUtil.getClaims(token).getSubject();
        
        CartItem cartItem = cartItemRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart item not found"));
                
        
        if (!cartItem.getUserId().equals(userId)) {
            throw new IllegalArgumentException("You don't have permission to remove this cart item");
        }
        
        cartItemRepository.delete(cartItem);
    }
    
    @Override
    @Transactional
    public void clearCart(String token) {
        String userId = jwtUtil.getClaims(token).getSubject();
        
        List<CartItem> userItems = cartItemRepository.findAll().stream()
                .filter(item -> item.getUserId().equals(userId))
                .collect(Collectors.toList());
                
        cartItemRepository.deleteAll(userItems);
    }
}
