package com.artwork.dto.payment;

import com.artwork.entity.payment.BusinessType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;


@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class KycSubmissionRequest {
    private String businessName;
    private BusinessType businessType;
    private String panNumber;
    private String panDocumentUrl;
    private String aadhaarNumber;
    private String aadhaarDocumentUrl;
    private String gstNumber;
    private String gstCertificateUrl;
}
