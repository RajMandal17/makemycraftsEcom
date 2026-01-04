package com.artwork.repository.payment;

import com.artwork.entity.payment.Refund;
import com.artwork.entity.payment.RefundStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;


@Repository
public interface RefundRepository extends JpaRepository<Refund, String> {
    
    List<Refund> findByPaymentId(String paymentId);
    
    List<Refund> findByOrderId(String orderId);
    
    Optional<Refund> findByGatewayRefundId(String gatewayRefundId);
    
    Page<Refund> findByStatus(RefundStatus status, Pageable pageable);
    
    long countByStatus(RefundStatus status);
}
