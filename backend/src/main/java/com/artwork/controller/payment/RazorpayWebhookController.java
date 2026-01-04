package com.artwork.controller.payment;

import com.artwork.entity.payment.Payment;
import com.artwork.entity.payment.PaymentStatus;
import com.artwork.entity.payment.Payout;
import com.artwork.entity.payment.PayoutStatus;
import com.artwork.repository.payment.PaymentRepository;
import com.artwork.repository.payment.PayoutRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.Formatter;

/**
 * Controller to handle Razorpay webhook events.
 * 
 * Handles payment, transfer, and payout status updates in real-time.
 * 
 * @author Artwork Platform
 */
@RestController
@RequestMapping("/api/webhooks")
@RequiredArgsConstructor
@Slf4j
public class RazorpayWebhookController {
    
    private final PaymentRepository paymentRepository;
    private final PayoutRepository payoutRepository;
    
    @Value("${razorpay.webhook.secret:}")
    private String webhookSecret;
    
    /**
     * Handle Razorpay webhook events.
     * 
     * Events handled:
     * - payment.captured: Payment was successfully captured
     * - payment.failed: Payment failed
     * - transfer.processed: Route transfer to linked account completed
     * - payout.processed: Razorpay X payout completed
     * - payout.failed: Razorpay X payout failed
     * - payout.reversed: Payout was reversed
     */
    @PostMapping("/razorpay")
    public ResponseEntity<String> handleRazorpayWebhook(
            @RequestBody String payload,
            @RequestHeader(value = "X-Razorpay-Signature", required = false) String signature) {
        
        log.info("Received Razorpay webhook");
        
        // Verify signature in production
        if (webhookSecret != null && !webhookSecret.isEmpty() && signature != null) {
            if (!verifySignature(payload, signature)) {
                log.warn("Invalid webhook signature received");
                return ResponseEntity.badRequest().body("Invalid signature");
            }
        }
        
        try {
            JSONObject event = new JSONObject(payload);
            String eventType = event.optString("event", "unknown");
            
            log.info("Processing webhook event: {}", eventType);
            
            JSONObject payloadData = event.optJSONObject("payload");
            if (payloadData == null) {
                log.warn("No payload data in webhook");
                return ResponseEntity.ok("No payload");
            }
            
            switch (eventType) {
                case "payment.captured" -> handlePaymentCaptured(payloadData);
                case "payment.failed" -> handlePaymentFailed(payloadData);
                case "transfer.processed" -> handleTransferProcessed(payloadData);
                case "payout.processed" -> handlePayoutProcessed(payloadData);
                case "payout.failed" -> handlePayoutFailed(payloadData);
                case "payout.reversed" -> handlePayoutReversed(payloadData);
                default -> log.info("Unhandled webhook event type: {}", eventType);
            }
            
            return ResponseEntity.ok("Webhook processed");
            
        } catch (Exception e) {
            log.error("Error processing webhook", e);
            return ResponseEntity.internalServerError().body("Error processing webhook");
        }
    }
    
    private void handlePaymentCaptured(JSONObject payloadData) {
        JSONObject payment = payloadData.optJSONObject("payment");
        if (payment == null) {
            payment = payloadData.optJSONObject("entity");
        }
        
        if (payment == null) {
            log.warn("No payment entity in payload");
            return;
        }
        
        String razorpayPaymentId = payment.optString("id");
        String razorpayOrderId = payment.optString("order_id");
        String method = payment.optString("method");
        
        log.info("Payment captured: paymentId={}, orderId={}, method={}", 
            razorpayPaymentId, razorpayOrderId, method);
        
        // Find and update payment record
        paymentRepository.findAll().stream()
            .filter(p -> razorpayOrderId.equals(p.getGatewayOrderId()))
            .findFirst()
            .ifPresent(p -> {
                p.setGatewayPaymentId(razorpayPaymentId);
                p.setPaymentStatus(PaymentStatus.CAPTURED);
                p.setPaymentMethod(method.toUpperCase());
                p.setCompletedAt(LocalDateTime.now());
                paymentRepository.save(p);
                log.info("Payment record updated: {}", p.getId());
            });
    }
    
    private void handlePaymentFailed(JSONObject payloadData) {
        JSONObject payment = payloadData.optJSONObject("payment");
        if (payment == null) {
            payment = payloadData.optJSONObject("entity");
        }
        
        if (payment == null) {
            log.warn("No payment entity in payload");
            return;
        }
        
        String razorpayPaymentId = payment.optString("id");
        String razorpayOrderId = payment.optString("order_id");
        String errorDescription = payment.optString("error_description", "Payment failed");
        
        log.info("Payment failed: paymentId={}, orderId={}, reason={}", 
            razorpayPaymentId, razorpayOrderId, errorDescription);
        
        paymentRepository.findAll().stream()
            .filter(p -> razorpayOrderId.equals(p.getGatewayOrderId()))
            .findFirst()
            .ifPresent(p -> {
                p.setGatewayPaymentId(razorpayPaymentId);
                p.setPaymentStatus(PaymentStatus.FAILED);
                p.setFailureReason(errorDescription);
                paymentRepository.save(p);
                log.info("Payment record marked as failed: {}", p.getId());
            });
    }
    
    private void handleTransferProcessed(JSONObject payloadData) {
        JSONObject transfer = payloadData.optJSONObject("transfer");
        if (transfer == null) {
            transfer = payloadData.optJSONObject("entity");
        }
        
        if (transfer == null) {
            log.warn("No transfer entity in payload");
            return;
        }
        
        String transferId = transfer.optString("id");
        String sourcePaymentId = transfer.optString("source");
        String recipientAccountId = transfer.optString("recipient");
        int amountPaise = transfer.optInt("amount");
        
        log.info("Transfer processed: transferId={}, source={}, recipient={}, amount={}", 
            transferId, sourcePaymentId, recipientAccountId, amountPaise / 100.0);
        
        // Transfer to linked account completed - can update split status here
        // This indicates the artist's share has been transferred
    }
    
    private void handlePayoutProcessed(JSONObject payloadData) {
        JSONObject payout = payloadData.optJSONObject("payout");
        if (payout == null) {
            payout = payloadData.optJSONObject("entity");
        }
        
        if (payout == null) {
            log.warn("No payout entity in payload");
            return;
        }
        
        String razorpayPayoutId = payout.optString("id");
        String referenceId = payout.optString("reference_id");
        String utr = payout.optString("utr");
        
        log.info("Payout processed: payoutId={}, referenceId={}, utr={}", 
            razorpayPayoutId, referenceId, utr);
        
        // Reference ID is our internal payout ID
        if (referenceId != null && !referenceId.isEmpty()) {
            payoutRepository.findById(referenceId)
                .ifPresent(p -> {
                    p.setStatus(PayoutStatus.COMPLETED);
                    p.setGatewayPayoutId(razorpayPayoutId);
                    p.setProcessedAt(LocalDateTime.now());
                    payoutRepository.save(p);
                    log.info("Payout record marked as completed: {}", p.getId());
                });
        }
    }
    
    private void handlePayoutFailed(JSONObject payloadData) {
        JSONObject payout = payloadData.optJSONObject("payout");
        if (payout == null) {
            payout = payloadData.optJSONObject("entity");
        }
        
        if (payout == null) {
            log.warn("No payout entity in payload");
            return;
        }
        
        String razorpayPayoutId = payout.optString("id");
        String referenceId = payout.optString("reference_id");
        String failureReason = payout.optString("failure_reason", "Payout failed");
        
        log.info("Payout failed: payoutId={}, referenceId={}, reason={}", 
            razorpayPayoutId, referenceId, failureReason);
        
        if (referenceId != null && !referenceId.isEmpty()) {
            payoutRepository.findById(referenceId)
                .ifPresent(p -> {
                    p.setStatus(PayoutStatus.FAILED);
                    p.setGatewayPayoutId(razorpayPayoutId);
                    p.setFailureReason(failureReason);
                    p.setProcessedAt(LocalDateTime.now());
                    payoutRepository.save(p);
                    log.info("Payout record marked as failed: {}", p.getId());
                });
        }
    }
    
    private void handlePayoutReversed(JSONObject payloadData) {
        JSONObject payout = payloadData.optJSONObject("payout");
        if (payout == null) {
            payout = payloadData.optJSONObject("entity");
        }
        
        if (payout == null) {
            log.warn("No payout entity in payload");
            return;
        }
        
        String razorpayPayoutId = payout.optString("id");
        String referenceId = payout.optString("reference_id");
        
        log.info("Payout reversed: payoutId={}, referenceId={}", razorpayPayoutId, referenceId);
        
        if (referenceId != null && !referenceId.isEmpty()) {
            payoutRepository.findById(referenceId)
                .ifPresent(p -> {
                    p.setStatus(PayoutStatus.FAILED);
                    p.setFailureReason("Payout was reversed by bank");
                    p.setProcessedAt(LocalDateTime.now());
                    payoutRepository.save(p);
                    log.info("Payout record marked as reversed: {}", p.getId());
                });
        }
    }
    
    /**
     * Verify webhook signature using HMAC SHA256.
     */
    private boolean verifySignature(String payload, String signature) {
        try {
            Mac sha256Hmac = Mac.getInstance("HmacSHA256");
            SecretKeySpec secretKey = new SecretKeySpec(
                webhookSecret.getBytes(StandardCharsets.UTF_8), 
                "HmacSHA256"
            );
            sha256Hmac.init(secretKey);
            
            byte[] hash = sha256Hmac.doFinal(payload.getBytes(StandardCharsets.UTF_8));
            String computedSignature = byteArrayToHex(hash);
            
            return computedSignature.equals(signature);
        } catch (Exception e) {
            log.error("Error verifying webhook signature", e);
            return false;
        }
    }
    
    private String byteArrayToHex(byte[] bytes) {
        Formatter formatter = new Formatter();
        for (byte b : bytes) {
            formatter.format("%02x", b);
        }
        String result = formatter.toString();
        formatter.close();
        return result;
    }
}
