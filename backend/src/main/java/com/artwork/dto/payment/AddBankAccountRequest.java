package com.artwork.dto.payment;

import com.artwork.entity.payment.AccountType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request to add a new bank account.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AddBankAccountRequest {
    private String accountHolderName;
    private String accountNumber;
    private String ifscCode;
    private String bankName;
    private String branchName;
    private AccountType accountType;
    private Boolean isPrimary;
}
