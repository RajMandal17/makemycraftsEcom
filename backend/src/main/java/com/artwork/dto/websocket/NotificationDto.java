package com.artwork.dto.websocket;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;


@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationDto {
    
    public enum NotificationType {
        ORDER, USER, ARTWORK, SYSTEM, PAYMENT
    }
    
    public enum Severity {
        INFO, SUCCESS, WARNING, ERROR
    }
    
    private NotificationType type;
    private Severity severity;
    private String title;
    private String message;
    private LocalDateTime timestamp;
    private String actionUrl;
    private Object data;
    
    
    public static NotificationDto newOrder(String orderId, String customerName, double amount) {
        return NotificationDto.builder()
            .type(NotificationType.ORDER)
            .severity(Severity.SUCCESS)
            .title("New Order")
            .message(String.format("Order from %s - ₹%.2f", customerName, amount))
            .timestamp(LocalDateTime.now())
            .actionUrl("/dashboard/admin/orders/" + orderId)
            .data(java.util.Map.of("orderId", orderId, "amount", amount))
            .build();
    }
    
    public static NotificationDto newUser(String userId, String userName, String role) {
        return NotificationDto.builder()
            .type(NotificationType.USER)
            .severity(Severity.INFO)
            .title("New Registration")
            .message(String.format("%s registered as %s", userName, role))
            .timestamp(LocalDateTime.now())
            .actionUrl("/dashboard/admin/users/" + userId)
            .data(java.util.Map.of("userId", userId, "role", role))
            .build();
    }
    
    public static NotificationDto pendingArtwork(String artworkId, String artworkTitle, String artistName) {
        return NotificationDto.builder()
            .type(NotificationType.ARTWORK)
            .severity(Severity.WARNING)
            .title("Pending Approval")
            .message(String.format("'%s' by %s needs approval", artworkTitle, artistName))
            .timestamp(LocalDateTime.now())
            .actionUrl("/dashboard/admin/settings")
            .data(java.util.Map.of("artworkId", artworkId, "title", artworkTitle))
            .build();
    }
    
    public static NotificationDto systemAlert(String message, Severity severity) {
        return NotificationDto.builder()
            .type(NotificationType.SYSTEM)
            .severity(severity)
            .title("System Alert")
            .message(message)
            .timestamp(LocalDateTime.now())
            .build();
    }
}
