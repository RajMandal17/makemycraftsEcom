package com.artwork.dto;

import lombok.Data;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.List;

@Data
public class OrderDto {
    private String id;
    private String customerId;
    private CustomerInfo customer;
    
    @NotNull(message = "Total amount is required")
    private Double totalAmount;

    @NotBlank(message = "Status is required")
    private String status;

    @NotNull(message = "Order items are required")
    private List<OrderItemDto> items;
    
    private String shippingAddress;
    private String paymentMethod;
    private String createdAt;
    private String updatedAt;
    
    @Data
    public static class CustomerInfo {
        private String firstName;
        private String lastName;
        private String email;
    }
}
