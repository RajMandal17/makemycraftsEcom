package com.artwork.service.payment.impl;

import com.artwork.dto.payment.PayoutResponse;
import com.artwork.dto.payment.SellerEarningsResponse;
import com.artwork.entity.payment.*;
import com.artwork.repository.payment.*;
import com.artwork.service.payment.PayoutService;
import com.artwork.service.payment.RazorpayXPayoutService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;


@Service
@RequiredArgsConstructor
@Slf4j
public class PayoutServiceImpl implements PayoutService {
    
    private final PayoutRepository payoutRepository;
    private final PaymentSplitRepository paymentSplitRepository;
    private final SellerKycRepository sellerKycRepository;
    private final SellerBankAccountRepository bankAccountRepository;
    private final SellerLinkedAccountRepository linkedAccountRepository;
    private final RazorpayXPayoutService razorpayXPayoutService;
    
    @Value("${payment.payout.minimum:500}")
    private BigDecimal minimumPayoutAmount;
    
    @Override
    public BigDecimal getPendingPayoutBalance(String sellerId) {
        
        List<PaymentSplit> settledSplits = paymentSplitRepository.findBySellerIdAndSplitStatus(
            sellerId, 
            SplitStatus.SETTLED, 
            PageRequest.of(0, Integer.MAX_VALUE)
        ).getContent();
        
        
        return settledSplits.stream()
            .map(PaymentSplit::getNetSellerAmount)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
    }
    
    @Override
    public List<PayoutResponse> getPayoutHistory(String sellerId, int page, int size) {
        Page<Payout> payoutPage = payoutRepository.findBySellerIdAndStatus(
            sellerId,
            null, 
            PageRequest.of(page, size)
        );
        
        return payoutPage.getContent().stream()
            .map(this::mapToResponse)
            .collect(Collectors.toList());
    }
    
    @Override
    @Transactional
    public PayoutResponse requestPayout(String sellerId, BigDecimal amount) {
        log.info("Payout requested by seller: {}, amount: {}", sellerId, amount);
        
        
        SellerKyc kyc = sellerKycRepository.findByUserId(sellerId)
            .orElseThrow(() -> new RuntimeException("KYC not found"));
        
        if (kyc.getKycStatus() != KycStatus.VERIFIED) {
            throw new RuntimeException("KYC not verified. Cannot process payout.");
        }
        
        
        SellerBankAccount bankAccount = bankAccountRepository.findBySellerKycIdAndIsPrimaryTrue(kyc.getId())
            .orElseThrow(() -> new RuntimeException("No primary bank account found"));
        
        if (bankAccount.getVerificationStatus() != VerificationStatus.VERIFIED) {
            throw new RuntimeException("Bank account not verified");
        }
        
        
        if (amount.compareTo(minimumPayoutAmount) < 0) {
            throw new RuntimeException("Minimum payout amount is ₹" + minimumPayoutAmount);
        }
        
        
        BigDecimal availableBalance = getPendingPayoutBalance(sellerId);
        if (amount.compareTo(availableBalance) > 0) {
            throw new RuntimeException("Insufficient balance. Available: ₹" + availableBalance);
        }
        
        
        Payout payout = Payout.builder()
            .sellerId(sellerId)
            .amount(amount)
            .currency("INR")
            .status(PayoutStatus.PENDING)
            .bankAccountId(bankAccount.getId())
            .scheduledAt(LocalDateTime.now().plusDays(1)) 
            .build();
        
        payout = payoutRepository.save(payout);
        
        log.info("Payout created with ID: {}", payout.getId());
        
        return mapToResponse(payout);
    }
    
    @Override
    @Scheduled(cron = "0 0 2 * * *") 
    @Transactional
    public void processPendingPayouts() {
        log.info("Processing pending payouts...");
        
        List<Payout> pendingPayouts = payoutRepository.findPayoutsDueForProcessing(LocalDateTime.now());
        
        for (Payout payout : pendingPayouts) {
            try {
                processPayout(payout);
            } catch (Exception e) {
                log.error("Failed to process payout: {}", payout.getId(), e);
                payout.setStatus(PayoutStatus.FAILED);
                payout.setFailureReason(e.getMessage());
                payoutRepository.save(payout);
            }
        }
        
        log.info("Processed {} payouts", pendingPayouts.size());
    }
    
    @Override
    public PayoutResponse getPayoutById(String payoutId) {
        Payout payout = payoutRepository.findById(payoutId)
            .orElseThrow(() -> new RuntimeException("Payout not found: " + payoutId));
        return mapToResponse(payout);
    }
    
    @Override
    public SellerEarningsResponse getSellerEarnings(String sellerId) {
        BigDecimal totalEarnings = paymentSplitRepository.getTotalEarningsForSeller(sellerId)
            .orElse(BigDecimal.ZERO);
        
        BigDecimal totalPaidOut = payoutRepository.getTotalPayoutsForSeller(sellerId)
            .orElse(BigDecimal.ZERO);
        
        BigDecimal pendingSettlement = getPendingPayoutBalance(sellerId);
        
        
        BigDecimal availableForPayout = pendingSettlement;
        
        
        long completedOrders = paymentSplitRepository.findBySellerId(sellerId).size();
        
        return SellerEarningsResponse.builder()
            .sellerId(sellerId)
            .totalEarnings(totalEarnings)
            .pendingSettlement(pendingSettlement)
            .availableForPayout(availableForPayout)
            .totalPaidOut(totalPaidOut)
            .totalCommissionPaid(BigDecimal.ZERO) 
            .totalTdsDeducted(BigDecimal.ZERO) 
            .completedOrders(completedOrders)
            .build();
    }
    
    private void processPayout(Payout payout) {
        log.info("Processing payout: {} for seller: {}", payout.getId(), payout.getSellerId());
        
        try {
            
            SellerLinkedAccount linkedAccount = linkedAccountRepository
                .findBySellerId(payout.getSellerId())
                .orElse(null);
            
            if (linkedAccount == null) {
                throw new RuntimeException("No linked account found for seller: " + payout.getSellerId());
            }
            
            
            String fundAccountId = linkedAccount.getRazorpayFundAccountId();
            
            if (fundAccountId == null || fundAccountId.isEmpty()) {
                
                SellerBankAccount bankAccount = bankAccountRepository
                    .findById(payout.getBankAccountId())
                    .orElseThrow(() -> new RuntimeException("Bank account not found: " + payout.getBankAccountId()));
                
                
                String contactId = linkedAccount.getRazorpayContactId();
                if (contactId == null || contactId.isEmpty()) {
                    contactId = razorpayXPayoutService.createContact(
                        payout.getSellerId(),
                        bankAccount.getAccountHolderName(),
                        linkedAccount.getEmail(),
                        linkedAccount.getPhone()
                    );
                    linkedAccount.setRazorpayContactId(contactId);
                }
                
                
                fundAccountId = razorpayXPayoutService.createFundAccount(contactId, bankAccount);
                linkedAccount.setRazorpayFundAccountId(fundAccountId);
                linkedAccountRepository.save(linkedAccount);
            }
            
            
            RazorpayXPayoutService.PayoutResult result = razorpayXPayoutService.initiatePayout(
                fundAccountId,
                payout.getAmount(),
                payout.getCurrency(),
                payout.getId(),
                "MakeMyCrafts seller payout"
            );
            
            if (result.success()) {
                payout.setStatus(PayoutStatus.PROCESSING);
                payout.setGatewayPayoutId(result.payoutId());
                log.info("Payout initiated successfully: {} -> {}", payout.getId(), result.payoutId());
            } else {
                payout.setStatus(PayoutStatus.FAILED);
                payout.setFailureReason(result.errorMessage());
                log.error("Payout initiation failed: {} - {}", payout.getId(), result.errorMessage());
            }
            
        } catch (Exception e) {
            log.error("Error processing payout: {}", payout.getId(), e);
            payout.setStatus(PayoutStatus.FAILED);
            payout.setFailureReason(e.getMessage());
        }
        
        payout.setProcessedAt(LocalDateTime.now());
        payoutRepository.save(payout);
    }
    
    private PayoutResponse mapToResponse(Payout payout) {
        return PayoutResponse.builder()
            .id(payout.getId())
            .sellerId(payout.getSellerId())
            .amount(payout.getAmount())
            .currency(payout.getCurrency())
            .status(payout.getStatus())
            .gatewayPayoutId(payout.getGatewayPayoutId())
            .bankAccountId(payout.getBankAccountId())
            .failureReason(payout.getFailureReason())
            .scheduledAt(payout.getScheduledAt())
            .processedAt(payout.getProcessedAt())
            .createdAt(payout.getCreatedAt())
            .build();
    }
}
