package com.artwork.service.websocket;

import com.artwork.dto.websocket.DashboardUpdateDto;
import com.artwork.dto.websocket.NotificationDto;
import com.artwork.entity.ApprovalStatus;
import com.artwork.entity.OrderStatus;
import com.artwork.repository.ArtworkRepository;
import com.artwork.repository.OrderRepository;
import com.artwork.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.lang.management.ManagementFactory;
import java.lang.management.MemoryMXBean;
import java.lang.management.OperatingSystemMXBean;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.concurrent.atomic.AtomicReference;


@Service
@Slf4j
@RequiredArgsConstructor
public class WebSocketDashboardService {

    private final SimpMessagingTemplate messagingTemplate;
    private final UserRepository userRepository;
    private final ArtworkRepository artworkRepository;
    private final OrderRepository orderRepository;
    
    
    private final AtomicReference<DashboardUpdateDto> lastSentUpdate = new AtomicReference<>();
    
    
    private static final long MIN_BROADCAST_INTERVAL = 5000; 
    private volatile long lastBroadcastTime = 0;
    
    
    @Scheduled(fixedRate = 30000) 
    public void scheduledDashboardUpdate() {
        try {
            broadcastDashboardUpdate();
        } catch (Exception e) {
            log.error("Error in scheduled dashboard update", e);
        }
    }
    
    
    public void broadcastDashboardUpdate() {
        
        long now = System.currentTimeMillis();
        if (now - lastBroadcastTime < MIN_BROADCAST_INTERVAL) {
            return;
        }
        
        DashboardUpdateDto update = buildDashboardUpdate();
        
        
        DashboardUpdateDto lastUpdate = lastSentUpdate.get();
        if (lastUpdate != null && isSameData(lastUpdate, update)) {
            log.debug("Dashboard data unchanged, skipping broadcast");
            return;
        }
        
        lastSentUpdate.set(update);
        lastBroadcastTime = now;
        
        messagingTemplate.convertAndSend("/topic/dashboard", update);
        log.debug("Broadcasted dashboard update");
    }
    
    
    public void sendNotificationToAdmins(NotificationDto notification) {
        messagingTemplate.convertAndSend("/topic/admin/notifications", notification);
        log.info("Sent notification to admins: {}", notification.getTitle());
    }
    
    
    public void sendNotification(String topic, NotificationDto notification) {
        messagingTemplate.convertAndSend("/topic/admin/" + topic, notification);
    }
    
    
    public void sendNotificationToUser(String userId, NotificationDto notification) {
        messagingTemplate.convertAndSendToUser(userId, "/queue/notifications", notification);
    }
    
    
    public void triggerImmediateUpdate() {
        lastBroadcastTime = 0; 
        broadcastDashboardUpdate();
    }
    
    
    private DashboardUpdateDto buildDashboardUpdate() {
        return DashboardUpdateDto.builder()
            .userStats(buildUserStats())
            .artworkStats(buildArtworkStats())
            .orderStats(buildOrderStats())
            .systemHealth(buildSystemHealth())
            .build();
    }
    
    private DashboardUpdateDto.UserStats buildUserStats() {
        long totalUsers = userRepository.count();
        long newUsersToday = countNewUsersToday();
        long artistsPending = countPendingArtistApprovals();
        
        return DashboardUpdateDto.UserStats.builder()
            .totalUsers(totalUsers)
            .activeUsers(totalUsers) 
            .newUsersToday(newUsersToday)
            .pendingApprovals(artistsPending)
            .build();
    }
    
    private DashboardUpdateDto.ArtworkStats buildArtworkStats() {
        long total = artworkRepository.count();
        long pending = artworkRepository.countByApprovalStatus(ApprovalStatus.PENDING);
        long approved = artworkRepository.countByApprovalStatus(ApprovalStatus.APPROVED);
        long featured = countFeaturedArtworks();
        
        return DashboardUpdateDto.ArtworkStats.builder()
            .totalArtworks(total)
            .pendingApproval(pending)
            .approvedArtworks(approved)
            .featuredArtworks(featured)
            .build();
    }
    
    private DashboardUpdateDto.OrderStats buildOrderStats() {
        long total = orderRepository.count();
        long pending = countOrdersByStatus(OrderStatus.PENDING);
        long shipped = countOrdersByStatus(OrderStatus.SHIPPED);
        double revenue = calculateTotalRevenue();
        
        return DashboardUpdateDto.OrderStats.builder()
            .totalOrders(total)
            .pendingOrders(pending)
            .shippedOrders(shipped)
            .totalRevenue(revenue)
            .build();
    }
    
    private DashboardUpdateDto.SystemHealth buildSystemHealth() {
        OperatingSystemMXBean osBean = ManagementFactory.getOperatingSystemMXBean();
        MemoryMXBean memoryBean = ManagementFactory.getMemoryMXBean();
        
        double cpuLoad = osBean.getSystemLoadAverage();
        if (cpuLoad < 0) cpuLoad = 0; 
        
        long usedMemory = memoryBean.getHeapMemoryUsage().getUsed();
        long maxMemory = memoryBean.getHeapMemoryUsage().getMax();
        double memoryUsage = (double) usedMemory / maxMemory * 100;
        
        return DashboardUpdateDto.SystemHealth.builder()
            .status("HEALTHY")
            .activeServices(5) 
            .totalServices(5)
            .cpuUsage(Math.min(cpuLoad * 10, 100)) 
            .memoryUsage(memoryUsage)
            .build();
    }
    
    
    private long countNewUsersToday() {
        try {
            LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
            return userRepository.countByCreatedAtAfter(startOfDay);
        } catch (Exception e) {
            return 0;
        }
    }
    
    private long countPendingArtistApprovals() {
        try {
            return userRepository.countByRoleAndStatus(com.artwork.entity.Role.ARTIST, com.artwork.entity.UserStatus.PENDING);
        } catch (Exception e) {
            return 0;
        }
    }
    
    private long countFeaturedArtworks() {
        try {
            return artworkRepository.findByFeaturedTrue(org.springframework.data.domain.Pageable.unpaged()).size();
        } catch (Exception e) {
            return 0;
        }
    }
    
    private long countOrdersByStatus(OrderStatus status) {
        try {
            return orderRepository.countByStatus(status);
        } catch (Exception e) {
            return 0;
        }
    }
    
    private double calculateTotalRevenue() {
        try {
            Double revenue = orderRepository.sumTotalAmount();
            return revenue != null ? revenue : 0.0;
        } catch (Exception e) {
            return 0.0;
        }
    }
    
    private boolean isSameData(DashboardUpdateDto a, DashboardUpdateDto b) {
        
        return a.getUserStats().getTotalUsers() == b.getUserStats().getTotalUsers()
            && a.getArtworkStats().getPendingApproval() == b.getArtworkStats().getPendingApproval()
            && a.getOrderStats().getTotalOrders() == b.getOrderStats().getTotalOrders();
    }
}
