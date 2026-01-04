package com.artwork.entity.payment;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Refund entity for tracking refund transactions.
 * 
 * @author Artwork Platform
 */
@Entity
@Table(name = "refunds", indexes = {
    @Index(name = "idx_refunds_payment_id", columnList = "paymentId"),
    @Index(name = "idx_refunds_order_id", columnList = "orderId"),
    @Index(name = "idx_refunds_status", columnList = "status")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EntityListeners(AuditingEntityListener.class)
public class Refund {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;
    
    @Column(nullable = false)
    private String paymentId;
    
    @Column(nullable = false)
    private String orderId;
    
    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal refundAmount;
    
    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal originalAmount;
    
    @Column(nullable = false, length = 3)
    @Builder.Default
    private String currency = "INR";
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private RefundStatus status = RefundStatus.INITIATED;
    
    @Column(length = 100)
    private String gatewayRefundId;
    
    @Column(columnDefinition = "TEXT")
    private String reason;
    
    @Column(columnDefinition = "TEXT")
    private String failureReason;
    
    @Column(nullable = false)
    @Builder.Default
    private Boolean isPartial = false;
    
    private String initiatedBy;
    
    private LocalDateTime processedAt;
    
    @CreatedDate
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @LastModifiedDate
    private LocalDateTime updatedAt;
}
