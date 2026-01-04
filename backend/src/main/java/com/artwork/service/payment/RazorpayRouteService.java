package com.artwork.service.payment;

import com.artwork.entity.payment.SellerKyc;
import com.artwork.entity.payment.SellerLinkedAccount;

/**
 * Service interface for Razorpay Route operations.
 * Handles linked account creation and management for marketplace sellers.
 * 
 * @author Artwork Platform
 */
public interface RazorpayRouteService {
    
    /**
     * Create a linked account for a verified seller.
     * 
     * @param kyc the seller's verified KYC details
     * @return the created linked account
     */
    SellerLinkedAccount createLinkedAccount(SellerKyc kyc);
    
    /**
     * Get linked account for a seller.
     * 
     * @param sellerId the seller's user ID
     * @return the linked account or null if not found
     */
    SellerLinkedAccount getLinkedAccount(String sellerId);
    
    /**
     * Refresh linked account status from Razorpay.
     * 
     * @param accountId the Razorpay account ID
     * @return updated linked account
     */
    SellerLinkedAccount refreshAccountStatus(String accountId);
    
    /**
     * Suspend a linked account.
     * 
     * @param sellerId the seller's user ID
     * @param reason suspension reason
     * @return updated linked account
     */
    SellerLinkedAccount suspendAccount(String sellerId, String reason);
}
