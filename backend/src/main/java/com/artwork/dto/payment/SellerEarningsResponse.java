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
public class SellerEarningsResponse {
    private String sellerId;
    private BigDecimal totalEarnings;
    private BigDecimal pendingSettlement;
    private BigDecimal availableForPayout;
    private BigDecimal totalPaidOut;
    private BigDecimal totalCommissionPaid;
    private BigDecimal totalTdsDeducted;
    private long completedOrders;
}
