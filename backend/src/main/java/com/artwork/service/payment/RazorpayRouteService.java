package com.artwork.service.payment;

import com.artwork.entity.payment.SellerKyc;
import com.artwork.entity.payment.SellerLinkedAccount;


public interface RazorpayRouteService {
    
    
    SellerLinkedAccount createLinkedAccount(SellerKyc kyc);
    
    
    SellerLinkedAccount getLinkedAccount(String sellerId);
    
    
    SellerLinkedAccount refreshAccountStatus(String accountId);
    
    
    SellerLinkedAccount suspendAccount(String sellerId, String reason);
}
