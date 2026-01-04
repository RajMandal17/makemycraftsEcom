package com.artwork.service.impl.artist;

import com.artwork.dto.OrderDto;
import com.artwork.dto.OrderItemDto;
import com.artwork.entity.Order;
import com.artwork.entity.OrderItem;
import com.artwork.entity.OrderStatus;
import com.artwork.exception.ResourceNotFoundException;
import com.artwork.repository.OrderRepository;
import com.artwork.repository.OrderItemRepository;
import com.artwork.repository.ArtworkRepository;
import com.artwork.service.artist.ArtistOrderService;
import com.artwork.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ArtistOrderServiceImpl implements ArtistOrderService {
    
    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final ArtworkRepository artworkRepository;
    private final ModelMapper modelMapper;
    private final JwtUtil jwtUtil;
    private final com.artwork.repository.UserRepository userRepository;
    private final org.springframework.context.ApplicationEventPublisher eventPublisher;
    
    @Value("${frontend.base-url}")
    private String frontendBaseUrl;

    @Override
    @Transactional(readOnly = true)
    public Page<OrderDto> getArtistOrders(String token, int page, int size, String status) {
        String artistId = jwtUtil.extractUserId(token);
        
        
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        
        
        Page<Order> allOrders = orderRepository.findAll(pageable);
        
        
        List<OrderDto> artistOrders = allOrders.getContent().stream()
            .map(order -> filterOrderForArtist(order, artistId))
            .filter(Objects::nonNull) 
            .filter(order -> status == null || order.getStatus().equalsIgnoreCase(status))
            .collect(Collectors.toList());
        
        return new PageImpl<>(artistOrders, pageable, artistOrders.size());
    }

    @Override
    @Transactional(readOnly = true)
    public OrderDto getOrderById(String orderId, String token) {
        String artistId = jwtUtil.extractUserId(token);
        
        Order order = orderRepository.findById(orderId)
            .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));
        
        OrderDto filteredOrder = filterOrderForArtist(order, artistId);
        
        if (filteredOrder == null) {
            throw new ResourceNotFoundException("No items found in this order for artist: " + artistId);
        }
        
        return filteredOrder;
    }

    @Override
    @Transactional
    public OrderDto updateOrderStatus(String orderId, String status, String trackingNumber, 
                                     String notes, String token) {
        String artistId = jwtUtil.extractUserId(token);
        
        Order order = orderRepository.findById(orderId)
            .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));
        
        
        List<OrderItem> orderItems = orderItemRepository.findByOrderId(orderId);
        boolean hasArtistItems = orderItems.stream()
            .anyMatch(item -> {
                return artworkRepository.findById(item.getArtworkId())
                    .map(artwork -> artwork.getArtistId().equals(artistId))
                    .orElse(false);
            });
        
        if (!hasArtistItems) {
            throw new IllegalArgumentException("You don't have permission to update this order");
        }
        
        
        OrderStatus newStatus = null;
        if (status != null && !status.isEmpty()) {
            newStatus = validateAndGetArtistStatus(status);
            order.setStatus(newStatus);
        }
        
        if (trackingNumber != null && !trackingNumber.isEmpty()) {
            order.setTrackingNumber(trackingNumber);
        }
        
        if (notes != null && !notes.isEmpty()) {
            
            String existingNotes = order.getAdminNotes() != null ? order.getAdminNotes() : "";
            String artistNotes = "\n[Artist Note - " + LocalDateTime.now() + "]: " + notes;
            order.setAdminNotes(existingNotes + artistNotes);
        }
        
        order.setUpdatedAt(LocalDateTime.now());
        orderRepository.save(order);
        
        
        if (newStatus != null) {
            sendOrderStatusNotification(order, newStatus);
        }
        
        return filterOrderForArtist(order, artistId);
    }

    @Override
    @Transactional(readOnly = true)
    public Map<String, Object> getArtistOrderStats(String token) {
        String artistId = jwtUtil.extractUserId(token);
        
        
        List<Order> allOrders = orderRepository.findAll();
        
        
        List<OrderDto> artistOrders = allOrders.stream()
            .map(order -> filterOrderForArtist(order, artistId))
            .filter(Objects::nonNull)
            .collect(Collectors.toList());
        
        
        double totalSales = artistOrders.stream()
            .mapToDouble(OrderDto::getTotalAmount)
            .sum();
        
        long pendingCount = artistOrders.stream()
            .filter(order -> "PENDING".equalsIgnoreCase(order.getStatus()))
            .count();
        
        long confirmedCount = artistOrders.stream()
            .filter(order -> "CONFIRMED".equalsIgnoreCase(order.getStatus()))
            .count();
        
        long shippedCount = artistOrders.stream()
            .filter(order -> "SHIPPED".equalsIgnoreCase(order.getStatus()))
            .count();
        
        long deliveredCount = artistOrders.stream()
            .filter(order -> "DELIVERED".equalsIgnoreCase(order.getStatus()))
            .count();
        
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalOrders", artistOrders.size());
        stats.put("totalSales", totalSales);
        stats.put("pendingOrders", pendingCount);
        stats.put("confirmedOrders", confirmedCount);
        stats.put("shippedOrders", shippedCount);
        stats.put("deliveredOrders", deliveredCount);
        
        return stats;
    }

    
    private OrderDto filterOrderForArtist(Order order, String artistId) {
        List<OrderItem> orderItems = orderItemRepository.findByOrderId(order.getId());
        
        
        List<OrderItem> artistItems = orderItems.stream()
            .filter(item -> {
                return artworkRepository.findById(item.getArtworkId())
                    .map(artwork -> artwork.getArtistId().equals(artistId))
                    .orElse(false);
            })
            .collect(Collectors.toList());
        
        if (artistItems.isEmpty()) {
            return null;
        }
        
        
        OrderDto orderDto = modelMapper.map(order, OrderDto.class);
        
        
        List<OrderItemDto> itemDtos = artistItems.stream()
            .map(item -> {
                OrderItemDto dto = modelMapper.map(item, OrderItemDto.class);
                
                artworkRepository.findById(item.getArtworkId()).ifPresent(artwork -> {
                    dto.setArtwork(modelMapper.map(artwork, com.artwork.dto.ArtworkDto.class));
                    dto.setTitle(artwork.getTitle());
                });
                return dto;
            })
            .collect(Collectors.toList());
        
        orderDto.setItems(itemDtos);
        
        
        double artistTotal = artistItems.stream()
            .mapToDouble(item -> item.getPrice() * item.getQuantity())
            .sum();
        orderDto.setTotalAmount(artistTotal);
        
        return orderDto;
    }

    
    private OrderStatus validateAndGetArtistStatus(String status) {
        try {
            OrderStatus orderStatus = OrderStatus.valueOf(status.toUpperCase());
            
            
            if (orderStatus == OrderStatus.CONFIRMED || 
                orderStatus == OrderStatus.SHIPPED || 
                orderStatus == OrderStatus.DELIVERED) {
                return orderStatus;
            } else {
                throw new IllegalArgumentException(
                    "Artists can only update status to: CONFIRMED, SHIPPED, or DELIVERED. Provided: " + status
                );
            }
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid order status: " + status);
        }
    }
    
    private void sendOrderStatusNotification(Order order, OrderStatus newStatus) {
        userRepository.findById(order.getCustomerId()).ifPresent(user -> {
            Map<String, Object> variables = new HashMap<>();
            variables.put("name", user.getFirstName());
            variables.put("orderId", order.getId());
            
            String subject = "";
            String template = "";
            
            if (newStatus == OrderStatus.SHIPPED) {
                subject = "Your Order Has Shipped! - Order #" + order.getId();
                template = "email/order-shipped";
                variables.put("shippedDate", LocalDateTime.now().toLocalDate().toString());
                variables.put("estimatedDelivery", LocalDateTime.now().plusDays(5).toLocalDate().toString());
                variables.put("trackingNumber", order.getTrackingNumber() != null ? order.getTrackingNumber() : "TBD");
                variables.put("trackingUrl", frontendBaseUrl + "/track-order/" + order.getId());
            } else if (newStatus == OrderStatus.DELIVERED) {
                subject = "Your Order Has Been Delivered! - Order #" + order.getId();
                template = "email/order-delivered";
                variables.put("deliveredDate", LocalDateTime.now().toLocalDate().toString());
                variables.put("orderUrl", frontendBaseUrl + "/dashboard/customer/orders/" + order.getId());
            } else if (newStatus == OrderStatus.CONFIRMED) {
                subject = "Your Order Has Been Confirmed! - Order #" + order.getId();
                template = "email/order-confirmation";
                variables.put("amount", String.format("%.2f", order.getTotalAmount()));
            } else {
                return;
            }
            
            eventPublisher.publishEvent(new com.artwork.event.EmailEvent(
                this,
                user.getEmail(),
                subject,
                template,
                variables
            ));
            
            log.info("Artist order status notification sent to {} for order {}: {}", user.getEmail(), order.getId(), newStatus);
        });
    }
}
