package com.artwork.service.payment;

import com.artwork.dto.payment.*;
import java.util.List;

/**
 * KYC service interface for seller verification.
 * 
 * @author Artwork Platform
 */
public interface KycService {
    
    /**
     * Submit KYC documents for verification.
     */
    KycResponse submitKyc(String userId, KycSubmissionRequest request);
    
    /**
     * Get KYC status for a user.
     */
    KycStatusResponse getKycStatus(String userId);
    
    /**
     * Get KYC details for a user.
     */
    KycDetailsResponse getKycDetails(String userId);
    
    /**
     * Verify/Approve KYC (admin operation).
     */
    KycResponse verifyKyc(String userId, String verifiedBy, boolean approve, String reason);
    
    /**
     * Get pending KYC submissions for admin review.
     */
    List<KycDto> getPendingKycSubmissions(int page, int size);
    
    /**
     * Get KYC submissions by status for admin review.
     */
    List<KycDto> getKycSubmissionsByStatus(String status, int page, int size);
}
