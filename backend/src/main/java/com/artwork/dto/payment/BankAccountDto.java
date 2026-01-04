package com.artwork.dto.payment;

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
public class BankAccountDto {
    private String id;
    private String sellerKycId;
    private String accountHolderName;
    private String accountNumberMasked;
    private String ifscCode;
    private String bankName;
    private String branchName;
    private String accountType;
    private String verificationStatus;
    private BigDecimal pennyDropAmount;
    private String pennyDropReference;
    private LocalDateTime verifiedAt;
    private Boolean isPrimary;
    private Boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
