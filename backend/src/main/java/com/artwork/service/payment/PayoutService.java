package com.artwork.service.payment;

import com.artwork.dto.payment.*;
import java.math.BigDecimal;
import java.util.List;

/**
 * Payout service interface for managing seller payouts.
 * 
 * @author Artwork Platform
 */
public interface PayoutService {
    
    /**
     * Get pending payout balance for a seller.
     */
    BigDecimal getPendingPayoutBalance(String sellerId);
    
    /**
     * Get payout history for a seller.
     */
    List<PayoutResponse> getPayoutHistory(String sellerId, int page, int size);
    
    /**
     * Request a payout (seller initiated).
     */
    PayoutResponse requestPayout(String sellerId, BigDecimal amount);
    
    /**
     * Process pending payouts (scheduled job).
     */
    void processPendingPayouts();
    
    /**
     * Get payout details by ID.
     */
    PayoutResponse getPayoutById(String payoutId);
    
    /**
     * Get seller earnings summary.
     */
    SellerEarningsResponse getSellerEarnings(String sellerId);
}
