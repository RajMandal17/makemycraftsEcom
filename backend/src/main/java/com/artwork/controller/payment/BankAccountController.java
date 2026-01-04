package com.artwork.controller.payment;

import com.artwork.dto.payment.AddBankAccountRequest;
import com.artwork.dto.payment.BankAccountResponse;
import com.artwork.service.payment.BankAccountService;
import com.artwork.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;


@RestController
@RequestMapping("/api/payment/bank-accounts")
@RequiredArgsConstructor
@Slf4j
public class BankAccountController {
    
    private final BankAccountService bankAccountService;
    
    @PostMapping
    @PreAuthorize("hasRole('ARTIST')")
    public ResponseEntity<BankAccountResponse> addBankAccount(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @RequestBody AddBankAccountRequest request) {
        String userId = userPrincipal.getId();
        log.info("Adding bank account for user: {}", userId);
        BankAccountResponse response = bankAccountService.addBankAccount(userId, request);
        return ResponseEntity.ok(response);
    }
    
    @GetMapping
    @PreAuthorize("hasRole('ARTIST')")
    public ResponseEntity<List<BankAccountResponse>> getBankAccounts(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        String userId = userPrincipal.getId();
        List<BankAccountResponse> response = bankAccountService.getBankAccounts(userId);
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/primary")
    @PreAuthorize("hasRole('ARTIST')")
    public ResponseEntity<BankAccountResponse> getPrimaryBankAccount(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        String userId = userPrincipal.getId();
        BankAccountResponse response = bankAccountService.getPrimaryBankAccount(userId);
        return ResponseEntity.ok(response);
    }
    
    @PutMapping("/{bankAccountId}/set-primary")
    @PreAuthorize("hasRole('ARTIST')")
    public ResponseEntity<BankAccountResponse> setPrimaryBankAccount(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable String bankAccountId) {
        String userId = userPrincipal.getId();
        log.info("Setting primary bank account: {}", bankAccountId);
        BankAccountResponse response = bankAccountService.setPrimaryBankAccount(userId, bankAccountId);
        return ResponseEntity.ok(response);
    }
    
    @PostMapping("/{bankAccountId}/verify")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BankAccountResponse> verifyBankAccount(@PathVariable String bankAccountId) {
        log.info("Verifying bank account: {}", bankAccountId);
        BankAccountResponse response = bankAccountService.verifyBankAccount(bankAccountId);
        return ResponseEntity.ok(response);
    }
    
    @DeleteMapping("/{bankAccountId}")
    @PreAuthorize("hasRole('ARTIST')")
    public ResponseEntity<Void> deactivateBankAccount(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable String bankAccountId) {
        String userId = userPrincipal.getId();
        log.info("Deactivating bank account: {}", bankAccountId);
        bankAccountService.deactivateBankAccount(userId, bankAccountId);
        return ResponseEntity.noContent().build();
    }
}
