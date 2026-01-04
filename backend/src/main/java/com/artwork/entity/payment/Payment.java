package com.artwork.entity.payment;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.LocalDateTime;


@Entity
@Table(name = "payments", indexes = {
    @Index(name = "idx_payments_order_id", columnList = "orderId"),
    @Index(name = "idx_payments_customer_id", columnList = "customerId"),
    @Index(name = "idx_payments_gateway_payment_id", columnList = "gatewayPaymentId"),
    @Index(name = "idx_payments_status", columnList = "paymentStatus"),
    @Index(name = "idx_payments_idempotency_key", columnList = "idempotencyKey")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EntityListeners(AuditingEntityListener.class)
public class Payment {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;
    
    @Column(nullable = false)
    private String orderId;
    
    @Column(nullable = false)
    private String customerId;
    
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal amount;
    
    @Column(length = 3)
    @Builder.Default
    private String currency = "INR";
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PaymentGatewayType gateway;
    
    private String gatewayOrderId;
    
    private String gatewayPaymentId;
    
    @Column(length = 50)
    private String paymentMethod; 
    
    @Enumerated(EnumType.STRING)
    @Builder.Default
    private PaymentStatus paymentStatus = PaymentStatus.INITIATED;
    
    @Column(columnDefinition = "TEXT")
    private String failureReason;
    
    @Column(unique = true)
    private String idempotencyKey;
    
    @Column(columnDefinition = "TEXT")
    @org.hibernate.annotations.JdbcTypeCode(org.hibernate.type.SqlTypes.JSON)
    private String metadata;
    
    @Builder.Default
    private LocalDateTime initiatedAt = LocalDateTime.now();
    
    private LocalDateTime completedAt;
    
    @CreatedDate
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @LastModifiedDate
    private LocalDateTime updatedAt;
}
