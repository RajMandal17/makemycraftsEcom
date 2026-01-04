package com.artwork.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "email_logs")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EmailLog {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;
    
    @Column(nullable = false)
    private String recipient;
    
    @Column(nullable = false)
    private String subject;
    
    @Column(nullable = false)
    private String templateName;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EmailStatus status;
    
    @Column(length = 1000)
    private String errorMessage;
    
    @Column(nullable = false)
    private LocalDateTime sentAt;
    
    private LocalDateTime deliveredAt;
    
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (sentAt == null) {
            sentAt = LocalDateTime.now();
        }
    }
    
    public enum EmailStatus {
        PENDING,
        SENT,
        DELIVERED,
        FAILED,
        BOUNCED
    }
}
