package com.artwork.entity.payment;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Payout entity for tracking seller payouts.
 * 
 * @author Artwork Platform
 */
@Entity
@Table(name = "payouts", indexes = {
    @Index(name = "idx_payouts_seller_id", columnList = "sellerId"),
    @Index(name = "idx_payouts_status", columnList = "status")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EntityListeners(AuditingEntityListener.class)
public class Payout {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;
    
    @Column(nullable = false)
    private String sellerId;
    
    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal amount;
    
    @Column(nullable = false, length = 3)
    @Builder.Default
    private String currency = "INR";
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private PayoutStatus status = PayoutStatus.PENDING;
    
    @Column(length = 100)
    private String gatewayPayoutId;
    
    @Column(length = 100)
    private String gatewayTransferId;
    
    @Column(length = 100)
    private String bankAccountId;
    
    @Column(columnDefinition = "TEXT")
    private String failureReason;
    
    private LocalDateTime scheduledAt;
    
    private LocalDateTime processedAt;
    
    @CreatedDate
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @LastModifiedDate
    private LocalDateTime updatedAt;
}
