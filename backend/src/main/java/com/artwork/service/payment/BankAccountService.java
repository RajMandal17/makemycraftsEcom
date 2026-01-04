package com.artwork.service.payment;

import com.artwork.dto.payment.*;
import java.util.List;


public interface BankAccountService {
    
    
    BankAccountResponse addBankAccount(String userId, AddBankAccountRequest request);
    
    
    List<BankAccountResponse> getBankAccounts(String userId);
    
    
    BankAccountResponse getPrimaryBankAccount(String userId);
    
    
    BankAccountResponse setPrimaryBankAccount(String userId, String bankAccountId);
    
    
    BankAccountResponse verifyBankAccount(String bankAccountId);
    
    
    void deactivateBankAccount(String userId, String bankAccountId);
}
