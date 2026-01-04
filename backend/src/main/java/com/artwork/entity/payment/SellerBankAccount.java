package com.artwork.entity.payment;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * SellerBankAccount entity for seller payout destinations.
 * 
 * @author Artwork Platform
 */
@Entity
@Table(name = "seller_bank_accounts", indexes = {
    @Index(name = "idx_bank_seller_kyc", columnList = "sellerKycId"),
    @Index(name = "idx_bank_verification_status", columnList = "verificationStatus")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EntityListeners(AuditingEntityListener.class)
public class SellerBankAccount {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;
    
    @Column(nullable = false)
    private String sellerKycId;
    
    @Column(nullable = false)
    private String accountHolderName;
    
    @Column(nullable = false)
    private String accountNumber; // Should be encrypted in production
    
    @Column(nullable = false, length = 11)
    private String ifscCode;
    
    private String bankName;
    
    private String branchName;
    
    @Enumerated(EnumType.STRING)
    @Builder.Default
    private AccountType accountType = AccountType.SAVINGS;
    
    @Enumerated(EnumType.STRING)
    @Builder.Default
    private VerificationStatus verificationStatus = VerificationStatus.PENDING;
    
    @Column(precision = 5, scale = 2)
    private BigDecimal pennyDropAmount;
    
    @Column(length = 100)
    private String pennyDropReference;
    
    private LocalDateTime verifiedAt;
    
    @Builder.Default
    private Boolean isPrimary = false;
    
    @Builder.Default
    private Boolean isActive = true;
    
    @CreatedDate
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @LastModifiedDate
    private LocalDateTime updatedAt;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sellerKycId", insertable = false, updatable = false)
    private SellerKyc sellerKyc;
}
