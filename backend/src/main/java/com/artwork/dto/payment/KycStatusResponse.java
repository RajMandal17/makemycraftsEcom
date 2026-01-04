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
    private String status; 
    private String message;
    private String rejectionReason; 
    private Boolean canSubmit;
    private Boolean canAddBankAccount;
}
