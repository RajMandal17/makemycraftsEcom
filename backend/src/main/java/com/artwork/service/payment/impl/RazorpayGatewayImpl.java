package com.artwork.service.payment.impl;

import com.artwork.service.payment.PaymentGateway;
import com.razorpay.Order;
import com.razorpay.Payment;
import com.razorpay.Refund;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import com.razorpay.Utils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.util.Formatter;


@Component("razorpay")
@RequiredArgsConstructor
@Slf4j
public class RazorpayGatewayImpl implements PaymentGateway {
    
    private final RazorpayClient razorpayClient;
    
    @Value("${razorpay.key.secret}")
    private String razorpayKeySecret;
    
    @Override
    public String getGatewayName() {
        return "RAZORPAY";
    }
    
    @Override
    public PaymentOrderResponse createOrder(String orderId, BigDecimal amount, String currency) {
        try {
            JSONObject orderRequest = new JSONObject();
            orderRequest.put("amount", amount.multiply(new BigDecimal("100")).intValue()); 
            orderRequest.put("currency", currency);
            orderRequest.put("receipt", orderId);
            
            Order order = razorpayClient.orders.create(orderRequest);
            
            log.info("Razorpay order created: {} for order: {}", order.get("id"), orderId);
            
            return new PaymentOrderResponse(
                true,
                order.get("id"),
                null
            );
        } catch (RazorpayException e) {
            log.error("Failed to create Razorpay order for: {}", orderId, e);
            return new PaymentOrderResponse(
                false,
                null,
                e.getMessage()
            );
        }
    }
    
    @Override
    public PaymentOrderResponse createOrderWithTransfer(
            String orderId, 
            BigDecimal amount, 
            String currency,
            String linkedAccountId,
            BigDecimal transferAmount) {
        try {
            JSONObject orderRequest = new JSONObject();
            orderRequest.put("amount", amount.multiply(new BigDecimal("100")).intValue()); 
            orderRequest.put("currency", currency);
            orderRequest.put("receipt", orderId);
            
            
            if (linkedAccountId != null && !linkedAccountId.startsWith("acc_placeholder_") 
                    && !linkedAccountId.startsWith("acc_dev_") 
                    && !linkedAccountId.startsWith("FAILED_")) {
                
                JSONObject transfer = new JSONObject();
                transfer.put("account", linkedAccountId);
                transfer.put("amount", transferAmount.multiply(new BigDecimal("100")).intValue());
                transfer.put("currency", currency);
                transfer.put("on_hold", 0); 
                
                
                JSONObject notes = new JSONObject();
                notes.put("order_id", orderId);
                notes.put("type", "artist_payout");
                transfer.put("notes", notes);
                
                org.json.JSONArray transfers = new org.json.JSONArray();
                transfers.put(transfer);
                orderRequest.put("transfers", transfers);
                
                log.info("Creating Razorpay order with Route transfer: {} to account: {}", 
                    orderId, linkedAccountId);
            } else {
                log.info("Creating Razorpay order without Route transfer (placeholder account): {}", orderId);
            }
            
            Order order = razorpayClient.orders.create(orderRequest);
            
            log.info("Razorpay order created: {} for order: {} with transfer: {}", 
                order.get("id"), orderId, linkedAccountId != null);
            
            return new PaymentOrderResponse(
                true,
                order.get("id"),
                null
            );
        } catch (RazorpayException e) {
            log.error("Failed to create Razorpay order with transfer for: {}", orderId, e);
            return new PaymentOrderResponse(
                false,
                null,
                e.getMessage()
            );
        }
    }
    
    @Override
    public boolean verifyPayment(String gatewayOrderId, String gatewayPaymentId, String gatewaySignature) {
        try {
            String payload = gatewayOrderId + "|" + gatewayPaymentId;
            String generatedSignature = generateSignature(payload, razorpayKeySecret);
            
            boolean isValid = generatedSignature.equals(gatewaySignature);
            
            if (isValid) {
                log.info("Payment verification successful for payment: {}", gatewayPaymentId);
            } else {
                log.warn("Payment verification failed for payment: {}", gatewayPaymentId);
            }
            
            return isValid;
        } catch (Exception e) {
            log.error("Error verifying payment signature", e);
            return false;
        }
    }
    
    @Override
    public PaymentCaptureResponse capturePayment(String gatewayPaymentId, BigDecimal amount) {
        try {
            JSONObject captureRequest = new JSONObject();
            captureRequest.put("amount", amount.multiply(new BigDecimal("100")).intValue());
            
            Payment payment = razorpayClient.payments.capture(gatewayPaymentId, captureRequest);
            
            log.info("Payment captured: {} with status: {}", gatewayPaymentId, payment.get("status"));
            
            return new PaymentCaptureResponse(
                true,
                payment.get("status"),
                null
            );
        } catch (RazorpayException e) {
            log.error("Failed to capture payment: {}", gatewayPaymentId, e);
            return new PaymentCaptureResponse(
                false,
                "failed",
                e.getMessage()
            );
        }
    }
    
    @Override
    public RefundResponse initiateRefund(String gatewayPaymentId, BigDecimal amount, String reason) {
        try {
            JSONObject refundRequest = new JSONObject();
            refundRequest.put("amount", amount.multiply(new BigDecimal("100")).intValue());
            if (reason != null) {
                JSONObject notes = new JSONObject();
                notes.put("reason", reason);
                refundRequest.put("notes", notes);
            }
            
            Refund refund = razorpayClient.payments.refund(gatewayPaymentId, refundRequest);
            
            log.info("Refund initiated: {} for payment: {}", refund.get("id"), gatewayPaymentId);
            
            return new RefundResponse(
                true,
                refund.get("id"),
                refund.get("status"),
                null
            );
        } catch (RazorpayException e) {
            log.error("Failed to initiate refund for payment: {}", gatewayPaymentId, e);
            return new RefundResponse(
                false,
                null,
                "failed",
                e.getMessage()
            );
        }
    }
    
    @Override
    public RefundStatusResponse getRefundStatus(String gatewayRefundId) {
        try {
            Refund refund = razorpayClient.refunds.fetch(gatewayRefundId);
            
            BigDecimal amount = new BigDecimal(refund.get("amount").toString())
                .divide(new BigDecimal("100"));
            
            return new RefundStatusResponse(
                refund.get("status"),
                gatewayRefundId,
                amount
            );
        } catch (RazorpayException e) {
            log.error("Failed to fetch refund status: {}", gatewayRefundId, e);
            return new RefundStatusResponse(
                "unknown",
                gatewayRefundId,
                BigDecimal.ZERO
            );
        }
    }
    
    
    private String generateSignature(String payload, String secret) 
            throws NoSuchAlgorithmException, InvalidKeyException {
        Mac sha256Hmac = Mac.getInstance("HmacSHA256");
        SecretKeySpec secretKey = new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
        sha256Hmac.init(secretKey);
        
        byte[] hash = sha256Hmac.doFinal(payload.getBytes(StandardCharsets.UTF_8));
        
        return byteArrayToHex(hash);
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
