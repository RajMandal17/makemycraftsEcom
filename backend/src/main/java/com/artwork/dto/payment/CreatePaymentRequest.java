package com.artwork.dto.payment;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;


@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreatePaymentRequest {
    private String orderId;
    private String customerId;
    private String artistId;  
    private BigDecimal amount;
    private String currency;
    private String idempotencyKey;
}
