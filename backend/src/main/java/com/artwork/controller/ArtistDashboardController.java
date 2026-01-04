package com.artwork.controller;

import com.artwork.entity.*;
import com.artwork.repository.*;
import com.artwork.security.JwtUtil;
import io.jsonwebtoken.Claims;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;


@RestController
@RequestMapping("/api/dashboard/artist")
@RequiredArgsConstructor
@Slf4j
public class ArtistDashboardController {
    
    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;
    private final ArtworkRepository artworkRepository;
    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final ReviewRepository reviewRepository;
    
    
    @GetMapping("/stats")
    @Transactional(readOnly = true)
    public ResponseEntity<?> getArtistStats(HttpServletRequest request) {
        try {
            
            String userId = getUserIdFromRequest(request);
            User artist = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Artist not found"));
            
            log.info("Fetching dashboard stats for artist: {}", artist.getEmail());
            
            
            List<Artwork> artworks = artworkRepository.findByArtistIdOrderByCreatedAtDesc(userId);
            int totalArtworks = artworks.size();
            
            
            List<String> artworkIds = artworks.stream()
                .map(Artwork::getId)
                .collect(Collectors.toList());
            
            
            List<OrderItem> allOrderItems = new ArrayList<>();
            if (!artworkIds.isEmpty()) {
                allOrderItems = orderItemRepository.findByArtworkIdIn(artworkIds);
            }
            
            
            Set<String> orderIds = allOrderItems.stream()
                .map(OrderItem::getOrderId)
                .collect(Collectors.toSet());
            
            List<Order> allOrders = new ArrayList<>();
            if (!orderIds.isEmpty()) {
                allOrders = orderRepository.findAllById(orderIds);
            }
            
            
            LocalDateTime startOfMonth = LocalDateTime.now().withDayOfMonth(1).truncatedTo(ChronoUnit.DAYS);
            double salesThisMonth = allOrders.stream()
                .filter(order -> order.getCreatedAt() != null && order.getCreatedAt().isAfter(startOfMonth))
                .filter(order -> order.getStatus() == OrderStatus.DELIVERED || 
                               order.getStatus() == OrderStatus.SHIPPED)
                .mapToDouble(order -> order.getTotalAmount() != null ? order.getTotalAmount() : 0.0)
                .sum();
            
            
            double totalRevenue = allOrders.stream()
                .filter(order -> order.getStatus() == OrderStatus.DELIVERED || 
                               order.getStatus() == OrderStatus.SHIPPED)
                .mapToDouble(order -> order.getTotalAmount() != null ? order.getTotalAmount() : 0.0)
                .sum();
            
            
            long totalOrders = allOrders.stream()
                .filter(order -> order.getStatus() == OrderStatus.DELIVERED || 
                               order.getStatus() == OrderStatus.SHIPPED)
                .count();
            
            
            long pendingOrders = allOrders.stream()
                .filter(order -> order.getStatus() == OrderStatus.PENDING || 
                               order.getStatus() == OrderStatus.CONFIRMED)
                .count();
            
            
            List<Review> allReviews = new ArrayList<>();
            for (Artwork artwork : artworks) {
                List<Review> artworkReviews = reviewRepository.findByArtworkId(artwork.getId());
                if (artworkReviews != null) {
                    allReviews.addAll(artworkReviews);
                }
            }
            
            double averageRating = allReviews.isEmpty() ? 0.0 :
                allReviews.stream()
                    .filter(review -> review != null && review.getRating() != null)
                    .mapToInt(Review::getRating)
                    .average()
                    .orElse(0.0);
            
            int totalReviews = allReviews.size();
            
            
            List<Map<String, Object>> recentActivity = getRecentActivity(artworks, allOrders, allReviews);
            
            
            Map<String, Long> orderCountByArtwork = allOrderItems.stream()
                .collect(Collectors.groupingBy(
                    OrderItem::getArtworkId,
                    Collectors.counting()
                ));
            
            List<Map<String, Object>> topArtworks = artworks.stream()
                .filter(artwork -> orderCountByArtwork.containsKey(artwork.getId()))
                .sorted((a1, a2) -> Long.compare(
                    orderCountByArtwork.getOrDefault(a2.getId(), 0L),
                    orderCountByArtwork.getOrDefault(a1.getId(), 0L)
                ))
                .limit(5)
                .map(artwork -> {
                    Map<String, Object> artworkInfo = new HashMap<>();
                    artworkInfo.put("id", artwork.getId());
                    artworkInfo.put("title", artwork.getTitle());
                    artworkInfo.put("price", artwork.getPrice());
                    artworkInfo.put("sales", orderCountByArtwork.getOrDefault(artwork.getId(), 0L));
                    artworkInfo.put("imageUrl", artwork.getImages() != null && !artwork.getImages().isEmpty() 
                        ? artwork.getImages().get(0) : null);
                    return artworkInfo;
                })
                .collect(Collectors.toList());
            
            
            Map<String, Object> stats = new HashMap<>();
            stats.put("totalArtworks", totalArtworks);
            stats.put("salesThisMonth", Math.round(salesThisMonth * 100.0) / 100.0);
            stats.put("totalRevenue", Math.round(totalRevenue * 100.0) / 100.0);
            stats.put("totalOrders", totalOrders);
            stats.put("pendingOrders", pendingOrders);
            stats.put("averageRating", Math.round(averageRating * 10.0) / 10.0);
            stats.put("totalReviews", totalReviews);
            stats.put("recentActivity", recentActivity);
            stats.put("topArtworks", topArtworks);
            
            log.info("Successfully fetched dashboard stats for artist: {}", artist.getEmail());
            return ResponseEntity.ok(stats);
            
        } catch (Exception e) {
            log.error("Error fetching artist dashboard stats", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to fetch dashboard statistics: " + e.getMessage()));
        }
    }
    
    
    private List<Map<String, Object>> getRecentActivity(
            List<Artwork> artworks, 
            List<Order> orders, 
            List<Review> reviews) {
        
        List<Map<String, Object>> activities = new ArrayList<>();
        
        
        artworks.stream()
            .filter(artwork -> artwork != null && artwork.getCreatedAt() != null)
            .limit(3)
            .forEach(artwork -> {
                Map<String, Object> activity = new HashMap<>();
                activity.put("type", "artwork_uploaded");
                activity.put("message", "You uploaded " + (artwork.getTitle() != null ? artwork.getTitle() : "an artwork"));
                activity.put("timestamp", artwork.getCreatedAt());
                activity.put("icon", "image");
                activities.add(activity);
            });
        
        
        orders.stream()
            .filter(order -> order != null && order.getCreatedAt() != null && order.getId() != null)
            .sorted((o1, o2) -> o2.getCreatedAt().compareTo(o1.getCreatedAt()))
            .limit(5)
            .forEach(order -> {
                Map<String, Object> activity = new HashMap<>();
                activity.put("type", "new_order");
                String orderId = order.getId();
                String shortOrderId = orderId.length() >= 8 ? orderId.substring(0, 8) : orderId;
                activity.put("message", "New order #" + shortOrderId);
                activity.put("timestamp", order.getCreatedAt());
                activity.put("icon", "shopping_bag");
                activities.add(activity);
            });
        
        
        reviews.stream()
            .filter(review -> review != null && review.getCreatedAt() != null)
            .sorted((r1, r2) -> r2.getCreatedAt().compareTo(r1.getCreatedAt()))
            .limit(5)
            .forEach(review -> {
                Map<String, Object> activity = new HashMap<>();
                activity.put("type", "new_review");
                Artwork artwork = artworks.stream()
                    .filter(a -> a.getId().equals(review.getArtworkId()))
                    .findFirst()
                    .orElse(null);
                String artworkTitle = artwork != null ? artwork.getTitle() : "your artwork";
                Integer rating = review.getRating();
                String ratingStr = rating != null ? rating.toString() : "N/A";
                activity.put("message", "New " + ratingStr + "-star review on " + artworkTitle);
                activity.put("timestamp", review.getCreatedAt());
                activity.put("icon", "star");
                activities.add(activity);
            });
        
        
        return activities.stream()
            .filter(a -> a.get("timestamp") != null) 
            .sorted((a1, a2) -> {
                LocalDateTime t1 = (LocalDateTime) a1.get("timestamp");
                LocalDateTime t2 = (LocalDateTime) a2.get("timestamp");
                if (t1 == null && t2 == null) return 0;
                if (t1 == null) return 1;
                if (t2 == null) return -1;
                return t2.compareTo(t1);
            })
            .limit(10)
            .collect(Collectors.toList());
    }
    
    
    private String getUserIdFromRequest(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new RuntimeException("No authorization token found");
        }
        
        String token = authHeader.substring(7);
        Claims claims = jwtUtil.getClaims(token);
        return claims.getSubject(); 
    }
}
