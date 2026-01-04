package com.artwork.entity.payment;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * PaymentSplit entity for marketplace split payments.
 * Handles commission calculation, GST, TDS deductions.
 * 
 * @author Artwork Platform
 */
@Entity
@Table(name = "payment_splits", indexes = {
    @Index(name = "idx_splits_payment_id", columnList = "paymentId"),
    @Index(name = "idx_splits_seller_id", columnList = "sellerId"),
    @Index(name = "idx_splits_status", columnList = "splitStatus"),
    @Index(name = "idx_splits_hold_status", columnList = "holdStatus")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EntityListeners(AuditingEntityListener.class)
public class PaymentSplit {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;
    
    @Column(nullable = false)
    private String paymentId;
    
    @Column(nullable = false)
    private String orderItemId;
    
    @Column(nullable = false)
    private String sellerId;
    
    // Base amounts
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal grossAmount;
    
    // Commission calculation
    @Column(precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal platformCommissionRate = new BigDecimal("5.00");
    
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal platformCommission;
    
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal sellerAmount;
    
    // GST on commission
    @Column(precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal gstRate = new BigDecimal("18.00");
    
    @Column(precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal gstOnCommission = BigDecimal.ZERO;
    
    // GST on artwork
    @Column(precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal gstAmount = BigDecimal.ZERO;
    
    @Column(precision = 10, scale = 2)
    private BigDecimal baseAmount;
    
    // TDS deduction
    @Column(precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal tdsRate = new BigDecimal("1.00");
    
    @Column(precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal tdsDeducted = BigDecimal.ZERO;
    
    // Final amount to seller
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal netSellerAmount;
    
    // Status tracking
    @Enumerated(EnumType.STRING)
    @Builder.Default
    private SplitStatus splitStatus = SplitStatus.PENDING;
    
    // Hold/Escrow period
    private LocalDateTime holdUntil;
    
    @Column(length = 100)
    private String holdReason;
    
    @Enumerated(EnumType.STRING)
    @Builder.Default
    private HoldStatus holdStatus = HoldStatus.NONE;
    
    // GST invoice details
    @Column(length = 50)
    private String gstInvoiceNumber;
    
    @Column(length = 500)
    private String gstInvoiceUrl;
    
    // TDS certificate
    @Column(length = 50)
    private String tdsDeductionId;
    
    @CreatedDate
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @LastModifiedDate
    private LocalDateTime updatedAt;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "paymentId", insertable = false, updatable = false)
    private Payment payment;
}
