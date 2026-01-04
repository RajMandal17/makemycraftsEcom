package com.artwork.service.payment.impl;

import com.artwork.dto.payment.AddBankAccountRequest;
import com.artwork.dto.payment.BankAccountResponse;
import com.artwork.entity.payment.SellerBankAccount;
import com.artwork.entity.payment.SellerKyc;
import com.artwork.entity.payment.VerificationStatus;
import com.artwork.repository.payment.SellerBankAccountRepository;
import com.artwork.repository.payment.SellerKycRepository;
import com.artwork.service.payment.BankAccountService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Bank account service implementation.
 * 
 * Single Responsibility: Manage seller bank accounts only.
 * 
 * @author Artwork Platform
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class BankAccountServiceImpl implements BankAccountService {
    
    private final SellerBankAccountRepository bankAccountRepository;
    private final SellerKycRepository sellerKycRepository;
    
    @Override
    @Transactional
    public BankAccountResponse addBankAccount(String userId, AddBankAccountRequest request) {
        log.info("Adding bank account for user: {}", userId);
        
        // Verify KYC exists
        SellerKyc kyc = sellerKycRepository.findByUserId(userId)
            .orElseThrow(() -> new RuntimeException("KYC not found. Please complete KYC first."));
        
        // Validate IFSC code format
        if (!isValidIfscCode(request.getIfscCode())) {
            throw new RuntimeException("Invalid IFSC code format");
        }
        
        // Check for duplicate account
        if (bankAccountRepository.findByAccountNumberAndIfscCode(
                request.getAccountNumber(), request.getIfscCode()).isPresent()) {
            throw new RuntimeException("Bank account already exists");
        }
        
        // If this is set as primary, unset other primary accounts
        if (Boolean.TRUE.equals(request.getIsPrimary())) {
            bankAccountRepository.findBySellerKycIdAndIsPrimaryTrue(kyc.getId())
                .ifPresent(existing -> {
                    existing.setIsPrimary(false);
                    bankAccountRepository.save(existing);
                });
        }
        
        SellerBankAccount bankAccount = SellerBankAccount.builder()
            .sellerKycId(kyc.getId())
            .accountHolderName(request.getAccountHolderName())
            .accountNumber(request.getAccountNumber()) // TODO: Encrypt in production
            .ifscCode(request.getIfscCode().toUpperCase())
            .bankName(request.getBankName())
            .branchName(request.getBranchName())
            .accountType(request.getAccountType())
            .verificationStatus(VerificationStatus.PENDING)
            .isPrimary(request.getIsPrimary() != null ? request.getIsPrimary() : false)
            .isActive(true)
            .build();
        
        bankAccount = bankAccountRepository.save(bankAccount);
        
        log.info("Bank account added successfully for user: {}", userId);
        
        return mapToResponse(bankAccount);
    }
    
    @Override
    public List<BankAccountResponse> getBankAccounts(String userId) {
        SellerKyc kyc = sellerKycRepository.findByUserId(userId)
            .orElseThrow(() -> new RuntimeException("KYC not found for user: " + userId));
        
        return bankAccountRepository.findBySellerKycIdAndIsActiveTrue(kyc.getId())
            .stream()
            .map(this::mapToResponse)
            .collect(Collectors.toList());
    }
    
    @Override
    public BankAccountResponse getPrimaryBankAccount(String userId) {
        SellerKyc kyc = sellerKycRepository.findByUserId(userId)
            .orElseThrow(() -> new RuntimeException("KYC not found for user: " + userId));
        
        SellerBankAccount bankAccount = bankAccountRepository.findBySellerKycIdAndIsPrimaryTrue(kyc.getId())
            .orElseThrow(() -> new RuntimeException("No primary bank account found"));
        
        return mapToResponse(bankAccount);
    }
    
    @Override
    @Transactional
    public BankAccountResponse setPrimaryBankAccount(String userId, String bankAccountId) {
        log.info("Setting primary bank account: {} for user: {}", bankAccountId, userId);
        
        SellerKyc kyc = sellerKycRepository.findByUserId(userId)
            .orElseThrow(() -> new RuntimeException("KYC not found for user: " + userId));
        
        SellerBankAccount bankAccount = bankAccountRepository.findById(bankAccountId)
            .orElseThrow(() -> new RuntimeException("Bank account not found: " + bankAccountId));
        
        if (!bankAccount.getSellerKycId().equals(kyc.getId())) {
            throw new RuntimeException("Bank account does not belong to user");
        }
        
        // Unset current primary
        bankAccountRepository.findBySellerKycIdAndIsPrimaryTrue(kyc.getId())
            .ifPresent(existing -> {
                existing.setIsPrimary(false);
                bankAccountRepository.save(existing);
            });
        
        // Set new primary
        bankAccount.setIsPrimary(true);
        bankAccount = bankAccountRepository.save(bankAccount);
        
        log.info("Primary bank account set successfully");
        
        return mapToResponse(bankAccount);
    }
    
    @Override
    @Transactional
    public BankAccountResponse verifyBankAccount(String bankAccountId) {
        log.info("Verifying bank account: {}", bankAccountId);
        
        SellerBankAccount bankAccount = bankAccountRepository.findById(bankAccountId)
            .orElseThrow(() -> new RuntimeException("Bank account not found: " + bankAccountId));
        
        // TODO: Implement penny drop verification with payment gateway
        // For now, mark as verified
        bankAccount.setVerificationStatus(VerificationStatus.VERIFIED);
        bankAccount.setVerifiedAt(java.time.LocalDateTime.now());
        
        bankAccount = bankAccountRepository.save(bankAccount);
        
        log.info("Bank account verified successfully");
        
        return mapToResponse(bankAccount);
    }
    
    @Override
    @Transactional
    public void deactivateBankAccount(String userId, String bankAccountId) {
        log.info("Deactivating bank account: {} for user: {}", bankAccountId, userId);
        
        SellerKyc kyc = sellerKycRepository.findByUserId(userId)
            .orElseThrow(() -> new RuntimeException("KYC not found for user: " + userId));
        
        SellerBankAccount bankAccount = bankAccountRepository.findById(bankAccountId)
            .orElseThrow(() -> new RuntimeException("Bank account not found: " + bankAccountId));
        
        if (!bankAccount.getSellerKycId().equals(kyc.getId())) {
            throw new RuntimeException("Bank account does not belong to user");
        }
        
        if (Boolean.TRUE.equals(bankAccount.getIsPrimary())) {
            throw new RuntimeException("Cannot deactivate primary bank account. Set another account as primary first.");
        }
        
        bankAccount.setIsActive(false);
        bankAccountRepository.save(bankAccount);
        
        log.info("Bank account deactivated successfully");
    }
    
    private boolean isValidIfscCode(String ifsc) {
        if (ifsc == null || ifsc.length() != 11) {
            return false;
        }
        // IFSC format: AAAA0BBBBBB
        return ifsc.matches("[A-Z]{4}0[A-Z0-9]{6}");
    }
    
    private BankAccountResponse mapToResponse(SellerBankAccount bankAccount) {
        return BankAccountResponse.builder()
            .id(bankAccount.getId())
            .accountHolderName(bankAccount.getAccountHolderName())
            .maskedAccountNumber(maskAccountNumber(bankAccount.getAccountNumber()))
            .ifscCode(bankAccount.getIfscCode())
            .bankName(bankAccount.getBankName())
            .branchName(bankAccount.getBranchName())
            .accountType(bankAccount.getAccountType())
            .verificationStatus(bankAccount.getVerificationStatus())
            .isPrimary(bankAccount.getIsPrimary())
            .isActive(bankAccount.getIsActive())
            .verifiedAt(bankAccount.getVerifiedAt())
            .createdAt(bankAccount.getCreatedAt())
            .build();
    }
    
    private String maskAccountNumber(String accountNumber) {
        if (accountNumber == null || accountNumber.length() < 4) {
            return "****";
        }
        return "****" + accountNumber.substring(accountNumber.length() - 4);
    }
}
