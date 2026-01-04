package com.artwork.dto;

import lombok.Data;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.NotBlank;
import java.util.List;
import java.util.Map;

@Data
public class OrderRequestDto {
    @NotEmpty(message = "Order items are required")
    private List<OrderItemRequestDto> items;

    @NotNull(message = "Shipping address is required")
    private Map<String, Object> shippingAddress;

    @NotBlank(message = "Payment method is required")
    private String paymentMethod;
}
