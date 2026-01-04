package com.artwork.service.impl;

import com.artwork.dto.WishlistItemDto;
import com.artwork.entity.WishlistItem;
import com.artwork.repository.WishlistItemRepository;
import com.artwork.service.WishlistService;
import com.artwork.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class WishlistServiceImpl implements WishlistService {
    private final WishlistItemRepository wishlistItemRepository;
    private final ModelMapper modelMapper;
    private final JwtUtil jwtUtil;

    @Override
    public WishlistItemDto addToWishlist(WishlistItemDto wishlistItemDto, String token) {
        String userId = jwtUtil.getClaims(token).getSubject();
        WishlistItem wishlistItem = WishlistItem.builder()
                .userId(userId)
                .artworkId(wishlistItemDto.getArtworkId())
                .build();
        wishlistItemRepository.save(wishlistItem);
        return modelMapper.map(wishlistItem, WishlistItemDto.class);
    }

    @Override
    public List<WishlistItemDto> getWishlist(String token) {
        String userId = jwtUtil.getClaims(token).getSubject();
        List<WishlistItem> items = wishlistItemRepository.findAll().stream()
                .filter(item -> item.getUserId().equals(userId))
                .collect(Collectors.toList());
        return items.stream().map(item -> modelMapper.map(item, WishlistItemDto.class)).collect(Collectors.toList());
    }
}
