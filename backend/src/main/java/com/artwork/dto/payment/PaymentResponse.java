package com.artwork.dto.payment;

import com.artwork.entity.payment.PaymentGatewayType;
import com.artwork.entity.payment.PaymentStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Payment response DTO.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentResponse {
    private String id;
    private String orderId;
    private String customerId;
    private BigDecimal amount;
    private String currency;
    private PaymentGatewayType gateway;
    private String gatewayOrderId;
    private String gatewayPaymentId;
    private String paymentMethod;
    private PaymentStatus status;
    private String failureReason;
    private LocalDateTime initiatedAt;
    private LocalDateTime completedAt;
}
