package com.artwork.service.payment;

import com.artwork.entity.payment.SellerBankAccount;

import java.math.BigDecimal;

/**
 * Service interface for Razorpay X payout operations.
 * Handles direct bank transfers to sellers for their earnings.
 * 
 * @author Artwork Platform
 */
public interface RazorpayXPayoutService {
    
    /**
     * Create a contact in Razorpay X for a seller.
     * 
     * @param sellerId the seller's user ID
     * @param name seller's name
     * @param email seller's email
     * @param phone seller's phone
     * @return Razorpay contact ID
     */
    String createContact(String sellerId, String name, String email, String phone);
    
    /**
     * Create a fund account (bank account link) in Razorpay X.
     * 
     * @param contactId Razorpay contact ID
     * @param bankAccount seller's bank account details
     * @return Razorpay fund account ID
     */
    String createFundAccount(String contactId, SellerBankAccount bankAccount);
    
    /**
     * Initiate a payout to a seller's bank account.
     * 
     * @param fundAccountId Razorpay fund account ID
     * @param amount amount to transfer
     * @param currency currency code
     * @param referenceId internal reference ID
     * @param narration description for bank statement
     * @return PayoutResult containing status and payout ID
     */
    PayoutResult initiatePayout(String fundAccountId, BigDecimal amount, String currency, 
                                String referenceId, String narration);
    
    /**
     * Get payout status from Razorpay X.
     * 
     * @param payoutId Razorpay payout ID
     * @return PayoutResult with current status
     */
    PayoutResult getPayoutStatus(String payoutId);
    
    /**
     * Payout result DTO.
     */
    record PayoutResult(
        boolean success,
        String payoutId,
        String status,
        String utr,  // UTR number for bank reference
        String errorMessage
    ) {}
}
