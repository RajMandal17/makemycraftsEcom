package com.artwork.service.payment;

import com.artwork.dto.payment.*;
import java.util.List;

/**
 * Bank account service interface for managing seller bank accounts.
 * 
 * @author Artwork Platform
 */
public interface BankAccountService {
    
    /**
     * Add a new bank account.
     */
    BankAccountResponse addBankAccount(String userId, AddBankAccountRequest request);
    
    /**
     * Get all bank accounts for a user.
     */
    List<BankAccountResponse> getBankAccounts(String userId);
    
    /**
     * Get primary bank account for a user.
     */
    BankAccountResponse getPrimaryBankAccount(String userId);
    
    /**
     * Set a bank account as primary.
     */
    BankAccountResponse setPrimaryBankAccount(String userId, String bankAccountId);
    
    /**
     * Verify bank account via penny drop.
     */
    BankAccountResponse verifyBankAccount(String bankAccountId);
    
    /**
     * Deactivate a bank account.
     */
    void deactivateBankAccount(String userId, String bankAccountId);
}
