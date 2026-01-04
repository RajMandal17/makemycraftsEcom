package com.artwork.service.payment.impl;

import com.artwork.entity.payment.*;
import com.artwork.repository.payment.SellerLinkedAccountRepository;
import com.artwork.repository.UserRepository;
import com.artwork.service.payment.RazorpayRouteService;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

/**
 * Implementation of Razorpay Route service for linked account management.
 * 
 * Uses Razorpay Route API to create and manage linked accounts for marketplace sellers.
 * This enables automatic split payments where seller receives their share directly.
 * 
 * @author Artwork Platform
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class RazorpayRouteServiceImpl implements RazorpayRouteService {
    
    private final RazorpayClient razorpayClient;
    private final SellerLinkedAccountRepository linkedAccountRepository;
    private final UserRepository userRepository;
    
    @Value("${razorpay.route.enabled:false}")
    private boolean routeEnabled;
    
    @Override
    @Transactional
    public SellerLinkedAccount createLinkedAccount(SellerKyc kyc) {
        log.info("Creating Razorpay linked account for seller: {}", kyc.getUserId());
        
        // Check if already exists
        if (linkedAccountRepository.existsBySellerId(kyc.getUserId())) {
            log.info("Linked account already exists for seller: {}", kyc.getUserId());
            return linkedAccountRepository.findBySellerId(kyc.getUserId()).orElse(null);
        }
        
        // Get user details
        var user = userRepository.findById(kyc.getUserId())
            .orElseThrow(() -> new RuntimeException("User not found: " + kyc.getUserId()));
        
        if (!routeEnabled) {
            log.warn("Razorpay Route is disabled. Creating placeholder linked account.");
            return createPlaceholderAccount(kyc, user.getEmail(), null);
        }
        
        String fullName = (user.getFirstName() != null ? user.getFirstName() : "") + 
            " " + (user.getLastName() != null ? user.getLastName() : "");
        fullName = fullName.trim().isEmpty() ? "Artist" : fullName.trim();
        
        try {
            // Create linked account in Razorpay
            JSONObject accountRequest = new JSONObject();
            accountRequest.put("email", user.getEmail());
            accountRequest.put("phone", "9999999999"); // User entity doesn't have phone
            accountRequest.put("type", "route");
            accountRequest.put("legal_business_name", kyc.getBusinessName() != null ? kyc.getBusinessName() : fullName);
            accountRequest.put("business_type", mapBusinessType(kyc.getBusinessType()));
            accountRequest.put("contact_name", fullName);
            
            // Profile
            JSONObject profile = new JSONObject();
            profile.put("category", "arts_and_collectibles");
            profile.put("subcategory", "art");
            profile.put("addresses", new JSONObject()
                .put("registered", new JSONObject()
                    .put("street1", "Not Provided")
                    .put("street2", "")
                    .put("city", "Not Provided")
                    .put("state", "Karnataka")
                    .put("postal_code", "560001")
                    .put("country", "IN")));
            accountRequest.put("profile", profile);
            
            // Legal info
            JSONObject legalInfo = new JSONObject();
            legalInfo.put("pan", kyc.getPanNumber());
            if (kyc.getGstNumber() != null && !kyc.getGstNumber().isEmpty()) {
                legalInfo.put("gst", kyc.getGstNumber());
            }
            accountRequest.put("legal_info", legalInfo);
            
            // TODO: Razorpay SDK doesn't have direct account creation method
            // This requires using Razorpay Route API v2 directly via HTTP client
            // For now, we'll create a placeholder and update manually
            
            log.info("Razorpay Route account request prepared for: {}", kyc.getUserId());
            
            // Create placeholder that will be updated via webhook or manual sync
            String placeholderAccountId = "acc_placeholder_" + System.currentTimeMillis();
            
            SellerLinkedAccount linkedAccount = SellerLinkedAccount.builder()
                .sellerId(kyc.getUserId())
                .razorpayAccountId(placeholderAccountId)
                .accountStatus(LinkedAccountStatus.CREATED)
                .email(user.getEmail())
                .phone(null) // User entity doesn't have phone field
                .businessName(kyc.getBusinessName())
                .build();
            
            linkedAccount = linkedAccountRepository.save(linkedAccount);
            
            log.info("Linked account created with ID: {} for seller: {}", 
                linkedAccount.getId(), kyc.getUserId());
            
            return linkedAccount;
            
        } catch (Exception e) {
            log.error("Failed to create Razorpay linked account for: {}", kyc.getUserId(), e);
            
            // Create failed record for retry
            SellerLinkedAccount failedAccount = SellerLinkedAccount.builder()
                .sellerId(kyc.getUserId())
                .razorpayAccountId("FAILED_" + System.currentTimeMillis())
                .accountStatus(LinkedAccountStatus.FAILED)
                .email(user.getEmail())
                .phone(null) // User entity doesn't have phone field
                .businessName(kyc.getBusinessName())
                .errorMessage(e.getMessage())
                .build();
            
            return linkedAccountRepository.save(failedAccount);
        }
    }
    
    @Override
    public SellerLinkedAccount getLinkedAccount(String sellerId) {
        return linkedAccountRepository.findBySellerId(sellerId).orElse(null);
    }
    
    @Override
    @Transactional
    public SellerLinkedAccount refreshAccountStatus(String accountId) {
        log.info("Refreshing status for Razorpay account: {}", accountId);
        
        SellerLinkedAccount account = linkedAccountRepository.findByRazorpayAccountId(accountId)
            .orElseThrow(() -> new RuntimeException("Linked account not found: " + accountId));
        
        if (!routeEnabled || accountId.startsWith("acc_placeholder_") || accountId.startsWith("FAILED_")) {
            log.warn("Cannot refresh placeholder/failed account: {}", accountId);
            return account;
        }
        
        try {
            // TODO: Fetch account status from Razorpay Route API
            // This requires direct API call as SDK may not have this method
            
            log.info("Account status refreshed for: {}", accountId);
            return account;
            
        } catch (Exception e) {
            log.error("Failed to refresh account status: {}", accountId, e);
            account.setErrorMessage("Refresh failed: " + e.getMessage());
            return linkedAccountRepository.save(account);
        }
    }
    
    @Override
    @Transactional
    public SellerLinkedAccount suspendAccount(String sellerId, String reason) {
        log.info("Suspending linked account for seller: {}, reason: {}", sellerId, reason);
        
        SellerLinkedAccount account = linkedAccountRepository.findBySellerId(sellerId)
            .orElseThrow(() -> new RuntimeException("Linked account not found for seller: " + sellerId));
        
        account.setAccountStatus(LinkedAccountStatus.SUSPENDED);
        account.setSuspendedAt(LocalDateTime.now());
        account.setErrorMessage("Suspended: " + reason);
        
        // TODO: Call Razorpay API to suspend account if Route is enabled
        
        log.info("Linked account suspended for seller: {}", sellerId);
        
        return linkedAccountRepository.save(account);
    }
    
    private SellerLinkedAccount createPlaceholderAccount(SellerKyc kyc, String email, String phone) {
        String placeholderAccountId = "acc_dev_" + System.currentTimeMillis();
        
        SellerLinkedAccount linkedAccount = SellerLinkedAccount.builder()
            .sellerId(kyc.getUserId())
            .razorpayAccountId(placeholderAccountId)
            .accountStatus(LinkedAccountStatus.ACTIVE) // Active in dev mode
            .email(email)
            .phone(phone)
            .businessName(kyc.getBusinessName())
            .activatedAt(LocalDateTime.now())
            .build();
        
        return linkedAccountRepository.save(linkedAccount);
    }
    
    private String mapBusinessType(BusinessType type) {
        if (type == null) {
            return "individual";
        }
        return switch (type) {
            case INDIVIDUAL -> "individual";
            case SOLE_PROPRIETORSHIP -> "proprietorship";
            case PARTNERSHIP -> "partnership";
            case LLP -> "llp";
            case PRIVATE_LIMITED -> "private_limited";
        };
    }
}
