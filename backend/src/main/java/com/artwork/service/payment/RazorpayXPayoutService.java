package com.artwork.service.payment;

import com.artwork.entity.payment.SellerBankAccount;

import java.math.BigDecimal;


public interface RazorpayXPayoutService {
    
    
    String createContact(String sellerId, String name, String email, String phone);
    
    
    String createFundAccount(String contactId, SellerBankAccount bankAccount);
    
    
    PayoutResult initiatePayout(String fundAccountId, BigDecimal amount, String currency, 
                                String referenceId, String narration);
    
    
    PayoutResult getPayoutStatus(String payoutId);
    
    
    record PayoutResult(
        boolean success,
        String payoutId,
        String status,
        String utr,  
        String errorMessage
    ) {}
}
