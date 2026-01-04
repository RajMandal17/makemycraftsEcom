package com.artwork.dto.payment;

import com.artwork.entity.payment.RefundStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Refund response DTO.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RefundResponse {
    private String id;
    private String paymentId;
    private String orderId;
    private BigDecimal refundAmount;
    private BigDecimal originalAmount;
    private String currency;
    private RefundStatus status;
    private String gatewayRefundId;
    private String reason;
    private String failureReason;
    private Boolean isPartial;
    private LocalDateTime processedAt;
    private LocalDateTime createdAt;
}
