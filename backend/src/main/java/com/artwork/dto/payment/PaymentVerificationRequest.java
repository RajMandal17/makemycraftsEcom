package com.artwork.dto.payment;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request to verify a payment after gateway callback.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentVerificationRequest {
    private String gatewayOrderId;
    private String gatewayPaymentId;
    private String gatewaySignature;
}
