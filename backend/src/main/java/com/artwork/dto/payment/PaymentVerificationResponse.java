package com.artwork.dto.payment;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Payment verification response.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentVerificationResponse {
    private boolean verified;
    private String paymentId;
    private String orderId;
    private String status;
    private String message;
}
