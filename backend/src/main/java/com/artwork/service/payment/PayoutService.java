package com.artwork.service.payment;

import com.artwork.dto.payment.*;
import java.math.BigDecimal;
import java.util.List;


public interface PayoutService {
    
    
    BigDecimal getPendingPayoutBalance(String sellerId);
    
    
    List<PayoutResponse> getPayoutHistory(String sellerId, int page, int size);
    
    
    PayoutResponse requestPayout(String sellerId, BigDecimal amount);
    
    
    void processPendingPayouts();
    
    
    PayoutResponse getPayoutById(String payoutId);
    
    
    SellerEarningsResponse getSellerEarnings(String sellerId);
}
