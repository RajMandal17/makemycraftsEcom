package com.artwork.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "orders", indexes = {
    @Index(name = "idx_order_customer", columnList = "customerId"),
    @Index(name = "idx_order_status", columnList = "status"),
    @Index(name = "idx_order_created", columnList = "createdAt")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Order {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false)
    private String customerId;

    private Double totalAmount;

    @Enumerated(EnumType.STRING)
    private OrderStatus status = OrderStatus.PENDING;

    @Column(columnDefinition = "TEXT")
    private String shippingAddress;
    
    private String trackingNumber;
    
    @Column(columnDefinition = "TEXT")
    private String adminNotes;
    
    @Column(columnDefinition = "TEXT")
    private String cancellationReason;
    
    private Boolean refunded = false;
    
    private Double refundAmount;
    
    private String refundTransactionId;
    
    private Boolean flagged = false;
    
    private String priority; // LOW, MEDIUM, HIGH

    private String paymentMethod;
    private LocalDateTime createdAt = LocalDateTime.now();
    private LocalDateTime updatedAt = LocalDateTime.now();

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        if (updatedAt == null) {
            updatedAt = LocalDateTime.now();
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    @ManyToOne
    @JoinColumn(name = "customerId", referencedColumnName = "id", insertable = false, updatable = false)
    private User customer;

    @OneToMany(mappedBy = "order")
    private List<OrderItem> items;
}

