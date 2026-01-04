package com.artwork.service.payment.impl;

import com.artwork.dto.payment.*;
import com.artwork.entity.payment.*;
import com.artwork.entity.payment.SellerLinkedAccount;
import com.artwork.repository.payment.PaymentRepository;
import com.artwork.repository.payment.PaymentSplitRepository;
import com.artwork.repository.payment.RefundRepository;
import com.artwork.repository.payment.SellerLinkedAccountRepository;
import com.artwork.service.payment.PaymentGateway;
import com.artwork.service.payment.PaymentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Optional;

/**
 * Payment service implementation.
 * 
 * Single Responsibility: Orchestrate payment operations.
 * Dependency Inversion: Depends on PaymentGateway interface, not concrete implementation.
 * 
 * @author Artwork Platform
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentServiceImpl implements PaymentService {
    
    private final PaymentRepository paymentRepository;
    private final PaymentSplitRepository paymentSplitRepository;
    private final RefundRepository refundRepository;
    private final SellerLinkedAccountRepository linkedAccountRepository;
    
    @Qualifier("razorpay")
    private final PaymentGateway paymentGateway;
    
    // Platform commission rate (5%)
    private static final BigDecimal PLATFORM_COMMISSION_RATE = new BigDecimal("0.05");
    
    @Override
    @Transactional
    public PaymentResponse createPayment(CreatePaymentRequest request) {
        log.info("Creating payment for order: {}", request.getOrderId());
        
        // Check for idempotency
        if (request.getIdempotencyKey() != null) {
            Optional<Payment> existing = paymentRepository.findByIdempotencyKey(request.getIdempotencyKey());
            if (existing.isPresent()) {
                log.info("Payment already exists for idempotency key: {}", request.getIdempotencyKey());
                return mapToResponse(existing.get());
            }
        }
        
        // Calculate split amounts for Route transfer
        String linkedAccountId = null;
        BigDecimal artistAmount = request.getAmount();
        
        if (request.getArtistId() != null && !request.getArtistId().isEmpty()) {
            // Look up artist's linked account
            SellerLinkedAccount linkedAccount = linkedAccountRepository
                .findBySellerId(request.getArtistId())
                .orElse(null);
            
            if (linkedAccount != null) {
                linkedAccountId = linkedAccount.getRazorpayAccountId();
                
                // Calculate: Platform gets 5%, Artist gets 95%
                BigDecimal platformCommission = request.getAmount()
                    .multiply(PLATFORM_COMMISSION_RATE)
                    .setScale(2, BigDecimal.ROUND_HALF_UP);
                artistAmount = request.getAmount().subtract(platformCommission);
                
                log.info("Split payment: Total={}, Commission={}, ArtistAmount={}",
                    request.getAmount(), platformCommission, artistAmount);
            } else {
                log.warn("No linked account found for artist: {}. Creating payment without split.",
                    request.getArtistId());
            }
        }
        
        // Create order in payment gateway (with or without Route transfer)
        PaymentGateway.PaymentOrderResponse orderResponse;
        
        if (linkedAccountId != null) {
            orderResponse = paymentGateway.createOrderWithTransfer(
                request.getOrderId(),
                request.getAmount(),
                request.getCurrency(),
                linkedAccountId,
                artistAmount
            );
        } else {
            orderResponse = paymentGateway.createOrder(
                request.getOrderId(),
                request.getAmount(),
                request.getCurrency()
            );
        }
        
        if (!orderResponse.success()) {
            throw new RuntimeException("Failed to create payment order: " + orderResponse.errorMessage());
        }
        
        // Create payment entity
        Payment payment = Payment.builder()
            .orderId(request.getOrderId())
            .customerId(request.getCustomerId())
            .amount(request.getAmount())
            .currency(request.getCurrency())
            .gateway(PaymentGatewayType.RAZORPAY)
            .gatewayOrderId(orderResponse.gatewayOrderId())
            .paymentStatus(PaymentStatus.INITIATED)
            .idempotencyKey(request.getIdempotencyKey())
            .initiatedAt(LocalDateTime.now())
            .build();
        
        payment = paymentRepository.save(payment);
        
        log.info("Payment created with ID: {}", payment.getId());
        
        return mapToResponse(payment);
    }
    
    @Override
    @Transactional
    public PaymentVerificationResponse verifyPayment(PaymentVerificationRequest request) {
        log.info("Verifying payment: {}", request.getGatewayPaymentId());
        
        // Verify signature
        boolean isValid = paymentGateway.verifyPayment(
            request.getGatewayOrderId(),
            request.getGatewayPaymentId(),
            request.getGatewaySignature()
        );
        
        if (!isValid) {
            log.warn("Payment verification failed for: {}", request.getGatewayPaymentId());
            return PaymentVerificationResponse.builder()
                .verified(false)
                .status("VERIFICATION_FAILED")
                .message("Invalid payment signature")
                .build();
        }
        
        // Find payment by gateway order ID
        Optional<Payment> paymentOpt = paymentRepository.findAll().stream()
            .filter(p -> p.getGatewayOrderId().equals(request.getGatewayOrderId()))
            .findFirst();
        
        if (paymentOpt.isEmpty()) {
            log.error("Payment not found for gateway order: {}", request.getGatewayOrderId());
            return PaymentVerificationResponse.builder()
                .verified(false)
                .status("NOT_FOUND")
                .message("Payment not found")
                .build();
        }
        
        Payment payment = paymentOpt.orElseThrow(() -> 
            new IllegalStateException("Payment should exist but could not be retrieved"));
        payment.setGatewayPaymentId(request.getGatewayPaymentId());
        payment.setPaymentStatus(PaymentStatus.CAPTURED);
        payment.setCompletedAt(LocalDateTime.now());
        
        paymentRepository.save(payment);
        
        log.info("Payment verified and captured: {}", payment.getId());
        
        return PaymentVerificationResponse.builder()
            .verified(true)
            .paymentId(payment.getId())
            .orderId(payment.getOrderId())
            .status("CAPTURED")
            .message("Payment verified successfully")
            .build();
    }
    
    @Override
    public PaymentResponse getPaymentById(String paymentId) {
        Payment payment = paymentRepository.findById(paymentId)
            .orElseThrow(() -> new RuntimeException("Payment not found: " + paymentId));
        return mapToResponse(payment);
    }
    
    @Override
    public PaymentResponse getPaymentByOrderId(String orderId) {
        Payment payment = paymentRepository.findByOrderId(orderId)
            .orElseThrow(() -> new RuntimeException("Payment not found for order: " + orderId));
        return mapToResponse(payment);
    }
    
    @Override
    @Transactional
    public RefundResponse initiateRefund(String paymentId, BigDecimal amount, String reason, String initiatedBy) {
        log.info("Initiating refund for payment: {}, amount: {}", paymentId, amount);
        
        Payment payment = paymentRepository.findById(paymentId)
            .orElseThrow(() -> new RuntimeException("Payment not found: " + paymentId));
        
        if (payment.getPaymentStatus() != PaymentStatus.CAPTURED) {
            throw new RuntimeException("Cannot refund payment with status: " + payment.getPaymentStatus());
        }
        
        // Initiate refund with gateway
        PaymentGateway.RefundResponse gatewayResponse = paymentGateway.initiateRefund(
            payment.getGatewayPaymentId(),
            amount,
            reason
        );
        
        if (!gatewayResponse.success()) {
            throw new RuntimeException("Gateway refund failed: " + gatewayResponse.errorMessage());
        }
        
        // Create refund entity
        boolean isPartial = amount.compareTo(payment.getAmount()) < 0;
        
        Refund refund = Refund.builder()
            .paymentId(paymentId)
            .orderId(payment.getOrderId())
            .refundAmount(amount)
            .originalAmount(payment.getAmount())
            .currency(payment.getCurrency())
            .status(RefundStatus.PROCESSING)
            .gatewayRefundId(gatewayResponse.gatewayRefundId())
            .reason(reason)
            .isPartial(isPartial)
            .initiatedBy(initiatedBy)
            .build();
        
        refund = refundRepository.save(refund);
        
        // Update payment status
        if (isPartial) {
            payment.setPaymentStatus(PaymentStatus.PARTIALLY_REFUNDED);
        } else {
            payment.setPaymentStatus(PaymentStatus.REFUNDED);
        }
        paymentRepository.save(payment);
        
        log.info("Refund created with ID: {}", refund.getId());
        
        return mapToRefundResponse(refund);
    }
    
    @Override
    public PaymentAnalyticsResponse getPaymentAnalytics(LocalDateTime startDate, LocalDateTime endDate) {
        // Get all payments in date range
        long totalTransactions = paymentRepository.count();
        long successfulTransactions = paymentRepository.countByPaymentStatus(PaymentStatus.CAPTURED);
        long failedTransactions = paymentRepository.countByPaymentStatus(PaymentStatus.FAILED);
        long pendingTransactions = paymentRepository.countByPaymentStatus(PaymentStatus.PENDING);
        
        BigDecimal totalRevenue = paymentRepository.getTotalRevenueInPeriod(startDate, endDate)
            .orElse(BigDecimal.ZERO);
        
        BigDecimal totalCommission = paymentSplitRepository.getTotalCommissionInPeriod(startDate, endDate)
            .orElse(BigDecimal.ZERO);
        
        BigDecimal averageTransactionValue = successfulTransactions > 0 
            ? totalRevenue.divide(BigDecimal.valueOf(successfulTransactions), 2, BigDecimal.ROUND_HALF_UP)
            : BigDecimal.ZERO;
        
        // Get refund stats
        long refundCount = refundRepository.countByStatus(RefundStatus.COMPLETED);
        
        return PaymentAnalyticsResponse.builder()
            .totalRevenue(totalRevenue)
            .totalCommission(totalCommission)
            .totalTransactions(totalTransactions)
            .successfulTransactions(successfulTransactions)
            .failedTransactions(failedTransactions)
            .pendingTransactions(pendingTransactions)
            .averageTransactionValue(averageTransactionValue)
            .refundCount(refundCount)
            .build();
    }
    
    private PaymentResponse mapToResponse(Payment payment) {
        return PaymentResponse.builder()
            .id(payment.getId())
            .orderId(payment.getOrderId())
            .customerId(payment.getCustomerId())
            .amount(payment.getAmount())
            .currency(payment.getCurrency())
            .gateway(payment.getGateway())
            .gatewayOrderId(payment.getGatewayOrderId())
            .gatewayPaymentId(payment.getGatewayPaymentId())
            .paymentMethod(payment.getPaymentMethod())
            .status(payment.getPaymentStatus())
            .failureReason(payment.getFailureReason())
            .initiatedAt(payment.getInitiatedAt())
            .completedAt(payment.getCompletedAt())
            .build();
    }
    
    private RefundResponse mapToRefundResponse(Refund refund) {
        return RefundResponse.builder()
            .id(refund.getId())
            .paymentId(refund.getPaymentId())
            .orderId(refund.getOrderId())
            .refundAmount(refund.getRefundAmount())
            .originalAmount(refund.getOriginalAmount())
            .currency(refund.getCurrency())
            .status(refund.getStatus())
            .gatewayRefundId(refund.getGatewayRefundId())
            .reason(refund.getReason())
            .failureReason(refund.getFailureReason())
            .isPartial(refund.getIsPartial())
            .processedAt(refund.getProcessedAt())
            .createdAt(refund.getCreatedAt())
            .build();
    }
}
