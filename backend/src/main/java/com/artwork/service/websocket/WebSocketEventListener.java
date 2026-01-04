package com.artwork.service.websocket;

import com.artwork.dto.websocket.NotificationDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;


@Component
@Slf4j
@RequiredArgsConstructor
public class WebSocketEventListener {
    
    private final WebSocketDashboardService dashboardService;
    
    
    @Async
    @EventListener
    public void handleNewOrder(NewOrderEvent event) {
        log.info("New order event received: {}", event.getOrderId());
        
        NotificationDto notification = NotificationDto.newOrder(
            event.getOrderId(),
            event.getCustomerName(),
            event.getAmount()
        );
        
        dashboardService.sendNotification("orders", notification);
        dashboardService.triggerImmediateUpdate();
    }
    
    
    @Async
    @EventListener
    public void handleNewUser(NewUserEvent event) {
        log.info("New user event received: {}", event.getUserId());
        
        NotificationDto notification = NotificationDto.newUser(
            event.getUserId(),
            event.getUserName(),
            event.getRole()
        );
        
        dashboardService.sendNotification("users", notification);
        dashboardService.triggerImmediateUpdate();
    }
    
    
    @Async
    @EventListener
    public void handlePendingArtwork(PendingArtworkEvent event) {
        log.info("Pending artwork event received: {}", event.getArtworkId());
        
        NotificationDto notification = NotificationDto.pendingArtwork(
            event.getArtworkId(),
            event.getArtworkTitle(),
            event.getArtistName()
        );
        
        dashboardService.sendNotification("artworks", notification);
        dashboardService.triggerImmediateUpdate();
    }
    
    
    @lombok.Data
    @lombok.AllArgsConstructor
    public static class NewOrderEvent {
        private String orderId;
        private String customerName;
        private double amount;
    }
    
    @lombok.Data
    @lombok.AllArgsConstructor
    public static class NewUserEvent {
        private String userId;
        private String userName;
        private String role;
    }
    
    @lombok.Data
    @lombok.AllArgsConstructor
    public static class PendingArtworkEvent {
        private String artworkId;
        private String artworkTitle;
        private String artistName;
    }
}
