package com.artwork.service.payment.impl;

import com.artwork.dto.payment.*;
import com.artwork.entity.payment.BusinessType;
import com.artwork.entity.payment.KycStatus;
import com.artwork.entity.payment.SellerKyc;
import com.artwork.repository.payment.SellerKycRepository;
import com.artwork.service.payment.KycService;
import com.artwork.service.payment.RazorpayRouteService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;


@Service
@RequiredArgsConstructor
@Slf4j
public class KycServiceImpl implements KycService {
    
    private final SellerKycRepository sellerKycRepository;
    private final RazorpayRouteService razorpayRouteService;
    
    @Override
    @Transactional
    public KycResponse submitKyc(String userId, KycSubmissionRequest request) {
        log.info("Submitting KYC for user: {}", userId);
        
        
        SellerKyc existingKyc = sellerKycRepository.findByUserId(userId).orElse(null);
        if (existingKyc != null) {
            
            if (existingKyc.getKycStatus() != KycStatus.REJECTED) {
                throw new RuntimeException("KYC already submitted for user: " + userId);
            }
            
            sellerKycRepository.delete(existingKyc);
            log.info("Deleted rejected KYC for user: {} to allow resubmission", userId);
        }
        
        
        if (!isValidPanNumber(request.getPanNumber())) {
            throw new RuntimeException("Invalid PAN number format");
        }
        
        
        if (sellerKycRepository.findByPanNumber(request.getPanNumber()).isPresent()) {
            throw new RuntimeException("PAN number already registered");
        }
        
        SellerKyc kyc = SellerKyc.builder()
            .userId(userId)
            .businessName(request.getBusinessName())
            .businessType(request.getBusinessType())
            .panNumber(request.getPanNumber().toUpperCase())
            .panDocumentUrl(request.getPanDocumentUrl())
            .aadhaarNumber(request.getAadhaarNumber())
            .aadhaarDocumentUrl(request.getAadhaarDocumentUrl())
            .gstNumber(request.getGstNumber())
            .gstCertificateUrl(request.getGstCertificateUrl())
            .kycStatus(KycStatus.PENDING)
            .build();
        
        kyc = sellerKycRepository.save(kyc);
        
        log.info("KYC submitted successfully for user: {}", userId);
        
        return KycResponse.builder()
            .id(kyc.getId())
            .userId(userId)
            .status(KycStatus.PENDING)
            .message("KYC submitted successfully. It will be reviewed within 24-48 hours.")
            .build();
    }
    
    @Override
    public KycStatusResponse getKycStatus(String userId) {
        SellerKyc kyc = sellerKycRepository.findByUserId(userId)
            .orElse(null);
        
        if (kyc == null) {
            return KycStatusResponse.builder()
                .userId(userId)
                .status(null)
                .message("KYC not submitted")
                .canSubmit(true)
                .canAddBankAccount(false)
                .build();
        }
        
        boolean canAddBankAccount = kyc.getKycStatus() == KycStatus.VERIFIED;
        
        return KycStatusResponse.builder()
            .userId(userId)
            .status(kyc.getKycStatus().name())
            .message(getStatusMessage(kyc.getKycStatus(), kyc.getRejectionReason()))
            .rejectionReason(kyc.getRejectionReason())
            .canSubmit(kyc.getKycStatus() == KycStatus.REJECTED)
            .canAddBankAccount(canAddBankAccount)
            .build();
    }
    
    @Override
    public KycDetailsResponse getKycDetails(String userId) {
        SellerKyc kyc = sellerKycRepository.findByUserId(userId)
            .orElseThrow(() -> new RuntimeException("KYC not found for user: " + userId));
        
        return mapToDetailsResponse(kyc);
    }
    
    @Override
    @Transactional
    public KycResponse verifyKyc(String userId, String verifiedBy, boolean approve, String reason) {
        log.info("Verifying KYC for user: {}, approved: {}", userId, approve);
        
        SellerKyc kyc = sellerKycRepository.findByUserId(userId)
            .orElseThrow(() -> new RuntimeException("KYC not found for user: " + userId));
        
        if (kyc.getKycStatus() == KycStatus.VERIFIED) {
            throw new RuntimeException("KYC already verified");
        }
        
        if (approve) {
            kyc.setKycStatus(KycStatus.VERIFIED);
            kyc.setVerifiedAt(LocalDateTime.now());
            kyc.setVerifiedBy(verifiedBy);
            kyc.setRejectionReason(null);
            
            
            try {
                razorpayRouteService.createLinkedAccount(kyc);
                log.info("Created Razorpay linked account for seller: {}", userId);
            } catch (Exception e) {
                log.error("Failed to create Razorpay linked account for seller: {}. " +
                    "KYC still approved, linked account can be created later.", userId, e);
            }
        } else {
            kyc.setKycStatus(KycStatus.REJECTED);
            kyc.setRejectionReason(reason);
        }
        
        sellerKycRepository.save(kyc);
        
        log.info("KYC {} for user: {}", approve ? "approved" : "rejected", userId);
        
        return KycResponse.builder()
            .id(kyc.getId())
            .userId(userId)
            .status(kyc.getKycStatus())
            .message(approve ? "KYC verified successfully" : "KYC rejected: " + reason)
            .build();
    }
    
    @Override
    public List<KycDto> getPendingKycSubmissions(int page, int size) {
        Page<SellerKyc> kycPage = sellerKycRepository.findByKycStatus(
            KycStatus.PENDING,
            PageRequest.of(page, size)
        );
        
        return kycPage.getContent().stream()
            .map(this::mapToKycDto)
            .collect(Collectors.toList());
    }
    
    @Override
    public List<KycDto> getKycSubmissionsByStatus(String status, int page, int size) {
        KycStatus kycStatus;
        try {
            kycStatus = KycStatus.valueOf(status.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid KYC status: " + status);
        }
        
        Page<SellerKyc> kycPage = sellerKycRepository.findByKycStatus(
            kycStatus,
            PageRequest.of(page, size)
        );
        
        return kycPage.getContent().stream()
            .map(this::mapToKycDto)
            .collect(Collectors.toList());
    }
    
    private KycDto mapToKycDto(SellerKyc kyc) {
        return KycDto.builder()
            .id(kyc.getId())
            .userId(kyc.getUserId())
            .businessName(kyc.getBusinessName())
            .businessType(kyc.getBusinessType() != null ? kyc.getBusinessType().name() : null)
            .panNumber(kyc.getPanNumber())
            .panDocumentUrl(kyc.getPanDocumentUrl())
            .aadhaarNumber(maskAadhaar(kyc.getAadhaarNumber()))
            .aadhaarDocumentUrl(kyc.getAadhaarDocumentUrl())
            .gstNumber(kyc.getGstNumber())
            .gstCertificateUrl(kyc.getGstCertificateUrl())
            .kycStatus(kyc.getKycStatus().name())
            .rejectionReason(kyc.getRejectionReason())
            .verifiedAt(kyc.getVerifiedAt() != null ? kyc.getVerifiedAt().toString() : null)
            .verifiedBy(kyc.getVerifiedBy())
            .createdAt(kyc.getCreatedAt().toString())
            .updatedAt(kyc.getUpdatedAt().toString())
            .build();
    }
    
    private boolean isValidPanNumber(String pan) {
        if (pan == null || pan.length() != 10) {
            return false;
        }
        
        return pan.matches("[A-Z]{5}[0-9]{4}[A-Z]{1}");
    }
    
    private String getStatusMessage(KycStatus status, String rejectionReason) {
        return switch (status) {
            case PENDING -> "KYC verification is pending";
            case UNDER_REVIEW -> "KYC is under review";
            case VERIFIED -> "KYC verified. You can receive payouts.";
            case REJECTED -> "KYC rejected: " + (rejectionReason != null ? rejectionReason : "Please resubmit");
        };
    }
    
    private KycDetailsResponse mapToDetailsResponse(SellerKyc kyc) {
        return KycDetailsResponse.builder()
            .id(kyc.getId())
            .userId(kyc.getUserId())
            .businessName(kyc.getBusinessName())
            .businessType(kyc.getBusinessType())
            .panNumber(kyc.getPanNumber())
            .panDocumentUrl(kyc.getPanDocumentUrl())
            .aadhaarNumber(maskAadhaar(kyc.getAadhaarNumber()))
            .aadhaarDocumentUrl(kyc.getAadhaarDocumentUrl())
            .gstNumber(kyc.getGstNumber())
            .gstCertificateUrl(kyc.getGstCertificateUrl())
            .status(kyc.getKycStatus())
            .rejectionReason(kyc.getRejectionReason())
            .verifiedAt(kyc.getVerifiedAt())
            .verifiedBy(kyc.getVerifiedBy())
            .tdsExempt(kyc.getTdsExempt())
            .yearlyEarnings(kyc.getYearlyEarnings())
            .createdAt(kyc.getCreatedAt())
            .updatedAt(kyc.getUpdatedAt())
            .build();
    }
    
    private String maskAadhaar(String aadhaar) {
        if (aadhaar == null || aadhaar.length() < 4) {
            return aadhaar;
        }
        return "XXXX-XXXX-" + aadhaar.substring(aadhaar.length() - 4);
    }
}
