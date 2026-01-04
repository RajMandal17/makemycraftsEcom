package com.artwork.entity.payment;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.LocalDateTime;


@Entity
@Table(name = "seller_kyc", indexes = {
    @Index(name = "idx_kyc_user_id", columnList = "userId"),
    @Index(name = "idx_kyc_status", columnList = "kycStatus")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EntityListeners(AuditingEntityListener.class)
public class SellerKyc {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;
    
    @Column(nullable = false, unique = true)
    private String userId;
    
    private String businessName;
    
    @Enumerated(EnumType.STRING)
    private BusinessType businessType;
    
    @Column(nullable = false, length = 10)
    private String panNumber;
    
    @Column(length = 500)
    private String panDocumentUrl;
    
    @Column(length = 12)
    private String aadhaarNumber;
    
    @Column(length = 500)
    private String aadhaarDocumentUrl;
    
    @Column(length = 15)
    private String gstNumber;
    
    @Column(length = 500)
    private String gstCertificateUrl;
    
    @Enumerated(EnumType.STRING)
    @Builder.Default
    private KycStatus kycStatus = KycStatus.PENDING;
    
    @Column(columnDefinition = "TEXT")
    private String rejectionReason;
    
    private LocalDateTime verifiedAt;
    
    private String verifiedBy;
    
    
    @Builder.Default
    private Boolean tdsExempt = false;
    
    @Column(precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal yearlyEarnings = BigDecimal.ZERO;
    
    @CreatedDate
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @LastModifiedDate
    private LocalDateTime updatedAt;
}
