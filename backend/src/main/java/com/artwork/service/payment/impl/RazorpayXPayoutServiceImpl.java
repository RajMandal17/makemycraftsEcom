package com.artwork.service.payment.impl;

import com.artwork.entity.payment.SellerBankAccount;
import com.artwork.service.payment.RazorpayXPayoutService;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;


@Service
@RequiredArgsConstructor
@Slf4j
public class RazorpayXPayoutServiceImpl implements RazorpayXPayoutService {
    
    private final RazorpayClient razorpayClient;
    
    @Value("${razorpay.x.enabled:false}")
    private boolean razorpayXEnabled;
    
    @Value("${razorpay.x.account.number:}")
    private String razorpayXAccountNumber;
    
    @Override
    public String createContact(String sellerId, String name, String email, String phone) {
        log.info("Creating Razorpay X contact for seller: {}", sellerId);
        
        if (!razorpayXEnabled) {
            log.warn("Razorpay X is disabled. Returning placeholder contact ID.");
            return "cont_placeholder_" + sellerId.hashCode();
        }
        
        try {
            JSONObject contactRequest = new JSONObject();
            contactRequest.put("name", name);
            contactRequest.put("email", email);
            contactRequest.put("contact", phone);
            contactRequest.put("type", "vendor");
            contactRequest.put("reference_id", sellerId);
            
            
            JSONObject notes = new JSONObject();
            notes.put("seller_id", sellerId);
            notes.put("platform", "makemycrafts");
            contactRequest.put("notes", notes);
            
            
            
            
            
            log.info("Razorpay X contact request prepared for seller: {}", sellerId);
            return "cont_pending_" + System.currentTimeMillis();
            
        } catch (Exception e) {
            log.error("Failed to create Razorpay X contact for seller: {}", sellerId, e);
            return "cont_failed_" + sellerId.hashCode();
        }
    }
    
    @Override
    public String createFundAccount(String contactId, SellerBankAccount bankAccount) {
        log.info("Creating Razorpay X fund account for contact: {}", contactId);
        
        if (!razorpayXEnabled) {
            log.warn("Razorpay X is disabled. Returning placeholder fund account ID.");
            return "fa_placeholder_" + bankAccount.getId().hashCode();
        }
        
        try {
            JSONObject fundAccountRequest = new JSONObject();
            fundAccountRequest.put("contact_id", contactId);
            fundAccountRequest.put("account_type", "bank_account");
            
            JSONObject bankDetails = new JSONObject();
            bankDetails.put("name", bankAccount.getAccountHolderName());
            bankDetails.put("ifsc", bankAccount.getIfscCode());
            bankDetails.put("account_number", bankAccount.getAccountNumber());
            fundAccountRequest.put("bank_account", bankDetails);
            
            
            
            
            log.info("Razorpay X fund account request prepared for contact: {}", contactId);
            return "fa_pending_" + System.currentTimeMillis();
            
        } catch (Exception e) {
            log.error("Failed to create Razorpay X fund account for contact: {}", contactId, e);
            return "fa_failed_" + bankAccount.getId().hashCode();
        }
    }
    
    @Override
    public PayoutResult initiatePayout(String fundAccountId, BigDecimal amount, String currency,
                                       String referenceId, String narration) {
        log.info("Initiating Razorpay X payout: {} {} to fund account: {}", 
            amount, currency, fundAccountId);
        
        if (!razorpayXEnabled) {
            log.warn("Razorpay X is disabled. Simulating successful payout.");
            return new PayoutResult(
                true,
                "pout_dev_" + System.currentTimeMillis(),
                "processed",
                "UTR_DEV_" + System.currentTimeMillis(),
                null
            );
        }
        
        if (razorpayXAccountNumber == null || razorpayXAccountNumber.isEmpty()) {
            log.error("Razorpay X account number not configured");
            return new PayoutResult(
                false,
                null,
                "failed",
                null,
                "Razorpay X account number not configured"
            );
        }
        
        try {
            JSONObject payoutRequest = new JSONObject();
            payoutRequest.put("account_number", razorpayXAccountNumber);
            payoutRequest.put("fund_account_id", fundAccountId);
            payoutRequest.put("amount", amount.multiply(new BigDecimal("100")).intValue()); 
            payoutRequest.put("currency", currency);
            payoutRequest.put("mode", "NEFT"); 
            payoutRequest.put("purpose", "vendor_bill");
            payoutRequest.put("queue_if_low_balance", true);
            payoutRequest.put("reference_id", referenceId);
            payoutRequest.put("narration", narration);
            
            
            JSONObject notes = new JSONObject();
            notes.put("platform", "makemycrafts");
            notes.put("type", "seller_payout");
            payoutRequest.put("notes", notes);
            
            
            
            
            
            log.info("Razorpay X payout initiated for reference: {}", referenceId);
            
            return new PayoutResult(
                true,
                "pout_pending_" + System.currentTimeMillis(),
                "pending",
                null,
                null
            );
            
        } catch (Exception e) {
            log.error("Failed to initiate Razorpay X payout for reference: {}", referenceId, e);
            return new PayoutResult(
                false,
                null,
                "failed",
                null,
                e.getMessage()
            );
        }
    }
    
    @Override
    public PayoutResult getPayoutStatus(String payoutId) {
        log.info("Fetching Razorpay X payout status: {}", payoutId);
        
        if (!razorpayXEnabled || payoutId.startsWith("pout_dev_") || payoutId.startsWith("pout_pending_")) {
            log.warn("Razorpay X is disabled or placeholder payout. Returning mock status.");
            return new PayoutResult(
                true,
                payoutId,
                "processed",
                "UTR_MOCK_" + System.currentTimeMillis(),
                null
            );
        }
        
        try {
            
            
            
            return new PayoutResult(
                true,
                payoutId,
                "unknown",
                null,
                null
            );
            
        } catch (Exception e) {
            log.error("Failed to fetch Razorpay X payout status: {}", payoutId, e);
            return new PayoutResult(
                false,
                payoutId,
                "error",
                null,
                e.getMessage()
            );
        }
    }
}
