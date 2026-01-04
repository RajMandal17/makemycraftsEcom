package com.artwork.dto.payment;

import com.artwork.entity.payment.KycStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * KYC response DTO.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class KycResponse {
    private String id;
    private String userId;
    private KycStatus status;
    private String message;
}
