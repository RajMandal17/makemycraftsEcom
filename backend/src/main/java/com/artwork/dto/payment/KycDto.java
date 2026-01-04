package com.artwork.dto.payment;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class KycDto {
    private String id;
    private String userId;
    private String businessName;
    private String businessType;
    private String panNumber;
    private String panDocumentUrl;
    private String aadhaarNumber;
    private String aadhaarDocumentUrl;
    private String gstNumber;
    private String gstCertificateUrl;
    private String kycStatus;
    private String rejectionReason;
    private String verifiedAt;
    private String verifiedBy;
    private String createdAt;
    private String updatedAt;
}
