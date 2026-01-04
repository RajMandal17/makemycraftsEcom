package com.artwork.dto.payment;

import com.artwork.entity.payment.AccountType;
import com.artwork.entity.payment.VerificationStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;


@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BankAccountResponse {
    private String id;
    private String accountHolderName;
    private String maskedAccountNumber;  
    private String ifscCode;
    private String bankName;
    private String branchName;
    private AccountType accountType;
    private VerificationStatus verificationStatus;
    private Boolean isPrimary;
    private Boolean isActive;
    private LocalDateTime verifiedAt;
    private LocalDateTime createdAt;
}
