package com.artwork.controller.payment;

import com.artwork.dto.payment.*;
import com.artwork.service.payment.KycService;
import com.artwork.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * KYC controller for seller verification.
 * 
 * @author Artwork Platform
 */
@RestController
@RequestMapping("/api/payment/kyc")
@RequiredArgsConstructor
@Slf4j
public class KycController {
    
    private final KycService kycService;
    
    @PostMapping("/submit")
    @PreAuthorize("hasRole('ARTIST')")
    public ResponseEntity<KycResponse> submitKyc(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @RequestBody KycSubmissionRequest request) {
        String userId = userPrincipal.getId();
        log.info("KYC submission for user: {}", userId);
        KycResponse response = kycService.submitKyc(userId, request);
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/status")
    @PreAuthorize("hasRole('ARTIST')")
    public ResponseEntity<KycStatusResponse> getKycStatus(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        String userId = userPrincipal.getId();
        KycStatusResponse response = kycService.getKycStatus(userId);
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/details")
    @PreAuthorize("hasRole('ARTIST')")
    public ResponseEntity<KycDetailsResponse> getKycDetails(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        String userId = userPrincipal.getId();
        KycDetailsResponse response = kycService.getKycDetails(userId);
        return ResponseEntity.ok(response);
    }
    
    @PutMapping("/verify/{userId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<KycResponse> verifyKyc(
            @PathVariable String userId,
            @RequestParam boolean approve,
            @RequestParam(required = false) String reason,
            @AuthenticationPrincipal UserPrincipal adminPrincipal) {
        String adminId = adminPrincipal.getId();
        log.info("Admin {} verifying KYC for user: {}", adminId, userId);
        KycResponse response = kycService.verifyKyc(userId, adminId, approve, reason);
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/pending")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<KycDto>> getPendingKyc(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        List<KycDto> response = kycService.getPendingKycSubmissions(page, size);
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/status/{status}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<KycDto>> getKycByStatus(
            @PathVariable String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        List<KycDto> response = kycService.getKycSubmissionsByStatus(status, page, size);
        return ResponseEntity.ok(response);
    }
}
