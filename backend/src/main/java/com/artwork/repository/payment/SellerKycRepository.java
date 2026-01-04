package com.artwork.repository.payment;

import com.artwork.entity.payment.SellerKyc;
import com.artwork.entity.payment.KycStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Repository for SellerKyc entity.
 * 
 * @author Artwork Platform
 */
@Repository
public interface SellerKycRepository extends JpaRepository<SellerKyc, String> {
    
    Optional<SellerKyc> findByUserId(String userId);
    
    Optional<SellerKyc> findByPanNumber(String panNumber);
    
    Page<SellerKyc> findByKycStatus(KycStatus status, Pageable pageable);
    
    boolean existsByUserId(String userId);
    
    long countByKycStatus(KycStatus status);
}
