package com.artwork.entity.payment;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * LedgerEntry entity for financial transaction auditing.
 * Double-entry bookkeeping support.
 * 
 * @author Artwork Platform
 */
@Entity
@Table(name = "ledger_entries", indexes = {
    @Index(name = "idx_ledger_transaction_id", columnList = "transactionId"),
    @Index(name = "idx_ledger_account_type", columnList = "accountType"),
    @Index(name = "idx_ledger_created_at", columnList = "createdAt")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EntityListeners(AuditingEntityListener.class)
public class LedgerEntry {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;
    
    @Column(nullable = false)
    private String transactionId; // Payment ID, Payout ID, or Refund ID
    
    @Column(nullable = false, length = 50)
    private String transactionType; // PAYMENT, PAYOUT, REFUND, COMMISSION
    
    @Column(nullable = false, length = 50)
    private String accountType; // CUSTOMER, SELLER, PLATFORM, TAX
    
    @Column(length = 50)
    private String accountId; // User ID or Platform ID
    
    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal debitAmount;
    
    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal creditAmount;
    
    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal balance;
    
    @Column(nullable = false, length = 3)
    @Builder.Default
    private String currency = "INR";
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    @Column(columnDefinition = "TEXT")
    private String metadata; // JSON string for additional data
    
    @CreatedDate
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
