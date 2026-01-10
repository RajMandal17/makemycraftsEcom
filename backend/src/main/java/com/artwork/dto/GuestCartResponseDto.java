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
public class GuestCartResponseDto {
    private String sessionId;
    private List<CartItemDto> items;
    private int totalItems;
    private double totalAmount;
    private long expiresIn;
}
