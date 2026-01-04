package com.artwork.controller.payment;

import com.artwork.dto.payment.PayoutResponse;
import com.artwork.dto.payment.SellerEarningsResponse;
import com.artwork.service.payment.PayoutService;
import com.artwork.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

/**
 * Payout controller for seller payout operations.
 * 
 * @author Artwork Platform
 */
@RestController
@RequestMapping("/api/payment/payouts")
@RequiredArgsConstructor
@Slf4j
public class PayoutController {
    
    private final PayoutService payoutService;
    
    @GetMapping("/balance")
    @PreAuthorize("hasRole('ARTIST')")
    public ResponseEntity<BigDecimal> getPendingBalance(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        String userId = userPrincipal.getId();
        BigDecimal balance = payoutService.getPendingPayoutBalance(userId);
        return ResponseEntity.ok(balance);
    }
    
    @GetMapping("/history")
    @PreAuthorize("hasRole('ARTIST')")
    public ResponseEntity<List<PayoutResponse>> getPayoutHistory(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        String userId = userPrincipal.getId();
        List<PayoutResponse> response = payoutService.getPayoutHistory(userId, page, size);
        return ResponseEntity.ok(response);
    }
    
    @PostMapping("/request")
    @PreAuthorize("hasRole('ARTIST')")
    public ResponseEntity<PayoutResponse> requestPayout(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @RequestParam BigDecimal amount) {
        String userId = userPrincipal.getId();
        log.info("Payout request from user: {}, amount: {}", userId, amount);
        PayoutResponse response = payoutService.requestPayout(userId, amount);
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/{payoutId}")
    @PreAuthorize("hasRole('ARTIST')")
    public ResponseEntity<PayoutResponse> getPayoutById(@PathVariable String payoutId) {
        PayoutResponse response = payoutService.getPayoutById(payoutId);
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/earnings")
    @PreAuthorize("hasRole('ARTIST')")
    public ResponseEntity<SellerEarningsResponse> getEarnings(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        String userId = userPrincipal.getId();
        SellerEarningsResponse response = payoutService.getSellerEarnings(userId);
        return ResponseEntity.ok(response);
    }
}
