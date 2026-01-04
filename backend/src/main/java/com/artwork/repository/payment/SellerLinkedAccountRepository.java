package com.artwork.repository.payment;

import com.artwork.entity.payment.LinkedAccountStatus;
import com.artwork.entity.payment.SellerLinkedAccount;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;


@Repository
public interface SellerLinkedAccountRepository extends JpaRepository<SellerLinkedAccount, String> {
    
    Optional<SellerLinkedAccount> findBySellerId(String sellerId);
    
    Optional<SellerLinkedAccount> findByRazorpayAccountId(String razorpayAccountId);
    
    List<SellerLinkedAccount> findByAccountStatus(LinkedAccountStatus status);
    
    boolean existsBySellerId(String sellerId);
}
