package com.artwork.entity.payment;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;


@Entity
@Table(name = "seller_linked_accounts", indexes = {
    @Index(name = "idx_linked_seller_id", columnList = "sellerId"),
    @Index(name = "idx_linked_razorpay_id", columnList = "razorpayAccountId"),
    @Index(name = "idx_linked_status", columnList = "accountStatus")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EntityListeners(AuditingEntityListener.class)
public class SellerLinkedAccount {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;
    
    @Column(nullable = false, unique = true)
    private String sellerId;
    
    @Column(nullable = false, unique = true)
    private String razorpayAccountId;
    
    @Enumerated(EnumType.STRING)
    @Builder.Default
    private LinkedAccountStatus accountStatus = LinkedAccountStatus.CREATED;
    
    
    private String razorpayContactId;
    
    
    private String razorpayFundAccountId;
    
    private String email;
    
    private String phone;
    
    private String businessName;
    
    @Column(columnDefinition = "TEXT")
    private String errorMessage;
    
    private LocalDateTime activatedAt;
    
    private LocalDateTime suspendedAt;
    
    @CreatedDate
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @LastModifiedDate
    private LocalDateTime updatedAt;
}
