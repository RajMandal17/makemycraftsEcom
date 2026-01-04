package com.artwork.dto.payment;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * Payment analytics response for admin dashboard.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentAnalyticsResponse {
    private BigDecimal totalRevenue;
    private BigDecimal totalCommission;
    private long totalTransactions;
    private long successfulTransactions;
    private long failedTransactions;
    private long pendingTransactions;
    private BigDecimal averageTransactionValue;
    private BigDecimal refundedAmount;
    private long refundCount;
}
