package com.artwork.service.payment;

import com.artwork.dto.payment.*;
import java.util.List;


public interface KycService {
    
    
    KycResponse submitKyc(String userId, KycSubmissionRequest request);
    
    
    KycStatusResponse getKycStatus(String userId);
    
    
    KycDetailsResponse getKycDetails(String userId);
    
    
    KycResponse verifyKyc(String userId, String verifiedBy, boolean approve, String reason);
    
    
    List<KycDto> getPendingKycSubmissions(int page, int size);
    
    
    List<KycDto> getKycSubmissionsByStatus(String status, int page, int size);
}
