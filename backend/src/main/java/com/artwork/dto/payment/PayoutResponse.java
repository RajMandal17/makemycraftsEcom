package com.artwork.dto.payment;

import com.artwork.entity.payment.PayoutStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Payout response DTO.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PayoutResponse {
    private String id;
    private String sellerId;
    private BigDecimal amount;
    private String currency;
    private PayoutStatus status;
    private String gatewayPayoutId;
    private String bankAccountId;
    private String failureReason;
    private LocalDateTime scheduledAt;
    private LocalDateTime processedAt;
    private LocalDateTime createdAt;
}
