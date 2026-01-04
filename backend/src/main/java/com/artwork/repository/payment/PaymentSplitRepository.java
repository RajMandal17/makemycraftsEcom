package com.artwork.repository.payment;

import com.artwork.entity.payment.PaymentSplit;
import com.artwork.entity.payment.SplitStatus;
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


@Repository
public interface PaymentSplitRepository extends JpaRepository<PaymentSplit, String> {
    
    List<PaymentSplit> findByPaymentId(String paymentId);
    
    List<PaymentSplit> findBySellerId(String sellerId);
    
    Page<PaymentSplit> findBySellerIdAndSplitStatus(String sellerId, SplitStatus status, Pageable pageable);
    
    @Query("SELECT ps FROM PaymentSplit ps WHERE ps.splitStatus = 'PENDING' AND ps.holdUntil < :now")
    List<PaymentSplit> findReleasableSplits(@Param("now") LocalDateTime now);
    
    @Query("SELECT SUM(ps.netSellerAmount) FROM PaymentSplit ps WHERE ps.sellerId = :sellerId AND ps.splitStatus = 'SETTLED'")
    Optional<BigDecimal> getTotalEarningsForSeller(@Param("sellerId") String sellerId);
    
    @Query("SELECT SUM(ps.platformCommission) FROM PaymentSplit ps WHERE ps.createdAt BETWEEN :start AND :end")
    Optional<BigDecimal> getTotalCommissionInPeriod(
        @Param("start") LocalDateTime start,
        @Param("end") LocalDateTime end
    );
}
