package com.artwork.repository.payment;

import com.artwork.entity.payment.Payment;
import com.artwork.entity.payment.PaymentStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;


@Repository
public interface PaymentRepository extends JpaRepository<Payment, String> {
    
    Optional<Payment> findByOrderId(String orderId);
    
    Optional<Payment> findByGatewayPaymentId(String gatewayPaymentId);
    
    Optional<Payment> findByIdempotencyKey(String idempotencyKey);
    
    List<Payment> findByCustomerId(String customerId);
    
    Page<Payment> findByPaymentStatus(PaymentStatus status, Pageable pageable);
    
    @Query("SELECT p FROM Payment p WHERE p.paymentStatus = :status AND p.createdAt < :before")
    List<Payment> findPendingPaymentsOlderThan(
        @Param("status") PaymentStatus status, 
        @Param("before") LocalDateTime before
    );
    
    @Query("SELECT SUM(p.amount) FROM Payment p WHERE p.paymentStatus = 'CAPTURED' AND p.completedAt BETWEEN :start AND :end")
    Optional<java.math.BigDecimal> getTotalRevenueInPeriod(
        @Param("start") LocalDateTime start, 
        @Param("end") LocalDateTime end
    );
    
    long countByPaymentStatus(PaymentStatus status);
}
