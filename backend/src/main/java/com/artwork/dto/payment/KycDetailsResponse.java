package com.artwork.dto.payment;

import com.artwork.entity.payment.BusinessType;
import com.artwork.entity.payment.KycStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;


@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class KycDetailsResponse {
    private String id;
    private String userId;
    private String businessName;
    private BusinessType businessType;
    private String panNumber;
    private String panDocumentUrl;
    private String aadhaarNumber;
    private String aadhaarDocumentUrl;
    private String gstNumber;
    private String gstCertificateUrl;
    private KycStatus status;
    private String rejectionReason;
    private LocalDateTime verifiedAt;
    private String verifiedBy;
    private Boolean tdsExempt;
    private BigDecimal yearlyEarnings;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
