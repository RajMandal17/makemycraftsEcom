package com.artwork.repository.payment;

import com.artwork.entity.payment.LedgerEntry;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;


@Repository
public interface LedgerEntryRepository extends JpaRepository<LedgerEntry, String> {
    
    List<LedgerEntry> findByTransactionId(String transactionId);
    
    Page<LedgerEntry> findByAccountTypeAndAccountId(String accountType, String accountId, Pageable pageable);
    
    @Query("SELECT l FROM LedgerEntry l WHERE l.accountId = :accountId ORDER BY l.createdAt DESC")
    Page<LedgerEntry> findByAccountId(@Param("accountId") String accountId, Pageable pageable);
    
    @Query("SELECT SUM(l.creditAmount) - SUM(l.debitAmount) FROM LedgerEntry l WHERE l.accountId = :accountId")
    BigDecimal getBalanceForAccount(@Param("accountId") String accountId);
    
    @Query("SELECT l FROM LedgerEntry l WHERE l.accountType = 'PLATFORM' AND l.createdAt BETWEEN :start AND :end")
    List<LedgerEntry> getPlatformEntriesInPeriod(
        @Param("start") LocalDateTime start,
        @Param("end") LocalDateTime end
    );
}
