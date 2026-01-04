package com.artwork.dto.payment;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class KycStatusResponse {
    private String userId;
    private String status; // PENDING, VERIFIED, REJECTED
    private String message;
    private String rejectionReason; // Reason for rejection if status is REJECTED
    private Boolean canSubmit;
    private Boolean canAddBankAccount;
}
