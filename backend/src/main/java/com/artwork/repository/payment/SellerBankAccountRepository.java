package com.artwork.repository.payment;

import com.artwork.entity.payment.SellerBankAccount;
import com.artwork.entity.payment.VerificationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository for SellerBankAccount entity.
 * 
 * @author Artwork Platform
 */
@Repository
public interface SellerBankAccountRepository extends JpaRepository<SellerBankAccount, String> {
    
    List<SellerBankAccount> findBySellerKycId(String sellerKycId);
    
    List<SellerBankAccount> findBySellerKycIdAndIsActiveTrue(String sellerKycId);
    
    Optional<SellerBankAccount> findBySellerKycIdAndIsPrimaryTrue(String sellerKycId);
    
    Optional<SellerBankAccount> findByAccountNumberAndIfscCode(String accountNumber, String ifscCode);
    
    long countByVerificationStatus(VerificationStatus status);
}
