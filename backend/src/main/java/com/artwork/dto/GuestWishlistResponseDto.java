package com.artwork.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GuestWishlistResponseDto {
    private String sessionId;
    private List<WishlistItemDto> items;
    private int totalItems;
    private long expiresIn;
}
