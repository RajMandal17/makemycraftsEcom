package com.artwork.repository.payment;

import com.artwork.entity.payment.Payout;
import com.artwork.entity.payment.PayoutStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Repository for Payout entity.
 * 
 * @author Artwork Platform
 */
@Repository
public interface PayoutRepository extends JpaRepository<Payout, String> {
    
    List<Payout> findBySellerId(String sellerId);
    
    Page<Payout> findBySellerIdAndStatus(String sellerId, PayoutStatus status, Pageable pageable);
    
    Optional<Payout> findByGatewayPayoutId(String gatewayPayoutId);
    
    @Query("SELECT p FROM Payout p WHERE p.status = 'PENDING' AND p.scheduledAt <= :now")
    List<Payout> findPayoutsDueForProcessing(@Param("now") LocalDateTime now);
    
    @Query("SELECT SUM(p.amount) FROM Payout p WHERE p.sellerId = :sellerId AND p.status = 'COMPLETED'")
    Optional<BigDecimal> getTotalPayoutsForSeller(@Param("sellerId") String sellerId);
    
    long countByStatus(PayoutStatus status);
}
