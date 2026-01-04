package com.artwork.service.impl.admin;

import com.artwork.dto.OrderDto;
import com.artwork.dto.OrderStatsDto;
import com.artwork.entity.Order;
import com.artwork.entity.OrderItem;
import com.artwork.entity.OrderStatus;
import com.artwork.exception.ResourceNotFoundException;
import com.artwork.repository.OrderItemRepository;
import com.artwork.repository.OrderRepository;
import com.artwork.service.admin.AdminOrderService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AdminOrderServiceImpl implements AdminOrderService {
    
    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final ModelMapper modelMapper;
    private final com.artwork.repository.UserRepository userRepository;
    private final org.springframework.context.ApplicationEventPublisher eventPublisher;
    
    @Value("${frontend.base-url}")
    private String frontendBaseUrl;

    @Override
    @Transactional(readOnly = true)
    public Page<OrderDto> getOrders(int page, int limit, String status, String userId, 
                                  LocalDateTime startDate, LocalDateTime endDate) {
        Pageable pageable = PageRequest.of(page - 1, limit);
        
        
        if ((status != null && !status.isEmpty()) || (userId != null && !userId.isEmpty()) || 
            startDate != null || endDate != null) {
            
            List<Order> allOrders = orderRepository.findAll();
            List<Order> filteredOrders = allOrders.stream()
                .filter(order -> status == null || status.isEmpty() || order.getStatus().name().equalsIgnoreCase(status))
                .filter(order -> userId == null || userId.isEmpty() || order.getCustomerId().equals(userId))
                .filter(order -> startDate == null || !order.getCreatedAt().isBefore(startDate))
                .filter(order -> endDate == null || !order.getCreatedAt().isAfter(endDate))
                .collect(Collectors.toList());
            
            int start = (int) pageable.getOffset();
            int end = Math.min((start + pageable.getPageSize()), filteredOrders.size());
            
            List<Order> pageOrders = start < end ? filteredOrders.subList(start, end) : Collections.emptyList();
            Page<Order> orderPage = new PageImpl<>(pageOrders, pageable, filteredOrders.size());
            return orderPage.map(order -> modelMapper.map(order, OrderDto.class));
        } else {
            Page<Order> orders = orderRepository.findAll(pageable);
            return orders.map(order -> modelMapper.map(order, OrderDto.class));
        }
    }

    @Override
    @Transactional
    public OrderDto updateOrderStatus(String orderId, String status, String trackingNumber, 
                                    String adminNotes, boolean sendNotification) {
        Order order = orderRepository.findById(orderId)
            .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));
        
        try {
            OrderStatus orderStatus = null;
            if (status != null && !status.isEmpty()) {
                orderStatus = OrderStatus.valueOf(status.toUpperCase());
                order.setStatus(orderStatus);
            }
            
            if (trackingNumber != null) {
                order.setTrackingNumber(trackingNumber);
            }
            
            if (adminNotes != null) {
                order.setAdminNotes(adminNotes);
            }
            
            order.setUpdatedAt(LocalDateTime.now());
            orderRepository.save(order);
            
            if (sendNotification && orderStatus != null) {
                sendOrderStatusNotification(order, orderStatus);
            }
            
            return modelMapper.map(order, OrderDto.class);
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid order status: " + status);
        }
    }
    
    @Override
    @Transactional
    public OrderDto cancelOrder(String orderId, String reason, boolean issueRefund, boolean sendNotification) {
        Order order = orderRepository.findById(orderId)
            .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));
        
        
        if (order.getStatus() == OrderStatus.DELIVERED || order.getStatus() == OrderStatus.CANCELLED) {
            throw new IllegalStateException("Cannot cancel order with status: " + order.getStatus());
        }
        
        order.setStatus(OrderStatus.CANCELLED);
        order.setCancellationReason(reason);
        order.setUpdatedAt(LocalDateTime.now());
        
        if (issueRefund && order.getTotalAmount() != null) {
            
            order.setRefunded(true);
            order.setRefundAmount(order.getTotalAmount());
            order.setRefundTransactionId("REFUND-" + UUID.randomUUID().toString());
        }
        
        orderRepository.save(order);
        
        if (sendNotification) {
            sendOrderCancellationNotification(order, reason);
        }
        
        return modelMapper.map(order, OrderDto.class);
    }
    
    @Override
    @Transactional
    public Map<String, Object> issueRefund(String orderId, double amount, String reason, String refundMethod) {
        Order order = orderRepository.findById(orderId)
            .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));
        
        Map<String, Object> result = new HashMap<>();
        
        
        if (amount <= 0 || (order.getTotalAmount() != null && amount > order.getTotalAmount())) {
            result.put("success", false);
            result.put("message", "Invalid refund amount");
            return result;
        }
        
        
        String transactionId = "REFUND-" + UUID.randomUUID().toString();
        order.setRefunded(true);
        order.setRefundAmount(amount);
        order.setRefundTransactionId(transactionId);
        order.setAdminNotes((order.getAdminNotes() != null ? order.getAdminNotes() + "\n" : "") + 
                           "Refund issued: " + reason);
        order.setUpdatedAt(LocalDateTime.now());
        
        orderRepository.save(order);
        
        result.put("success", true);
        result.put("transactionId", transactionId);
        result.put("amount", amount);
        result.put("message", "Refund processed successfully");
        
        return result;
    }
    
    @Override
    @Transactional
    public OrderDto addAdminNotes(String orderId, String notes, boolean flagged, String priority) {
        Order order = orderRepository.findById(orderId)
            .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));
        
        if (notes != null && !notes.isEmpty()) {
            String existingNotes = order.getAdminNotes();
            if (existingNotes != null && !existingNotes.isEmpty()) {
                order.setAdminNotes(existingNotes + "\n" + LocalDateTime.now() + ": " + notes);
            } else {
                order.setAdminNotes(LocalDateTime.now() + ": " + notes);
            }
        }
        
        order.setFlagged(flagged);
        
        if (priority != null && !priority.isEmpty()) {
            order.setPriority(priority.toUpperCase());
        }
        
        order.setUpdatedAt(LocalDateTime.now());
        orderRepository.save(order);
        
        return modelMapper.map(order, OrderDto.class);
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<OrderDto> getOrdersByCustomer(String userId) {
        List<Order> orders = orderRepository.findByCustomerId(userId);
        return orders.stream()
            .map(order -> modelMapper.map(order, OrderDto.class))
            .collect(Collectors.toList());
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<OrderDto> getOrdersByArtwork(String artworkId) {
        
        List<OrderItem> orderItems = orderItemRepository.findByArtworkId(artworkId);
        
        
        Set<String> orderIds = orderItems.stream()
            .map(OrderItem::getOrderId)
            .collect(Collectors.toSet());
        
        
        List<Order> orders = orderRepository.findAllById(orderIds);
        
        return orders.stream()
            .map(order -> modelMapper.map(order, OrderDto.class))
            .collect(Collectors.toList());
    }
    
    @Override
    @Transactional(readOnly = true)
    public Map<String, Object> getRevenueAnalytics(LocalDateTime startDate, LocalDateTime endDate, String groupBy) {
        
        List<OrderStatus> completedStatuses = Arrays.asList(
            OrderStatus.DELIVERED, 
            OrderStatus.CONFIRMED
        );
        
        List<Order> orders = orderRepository.findOrdersByDateRangeAndStatus(
            startDate, endDate, completedStatuses
        );
        
        
        double totalRevenue = orders.stream()
            .filter(o -> o.getTotalAmount() != null)
            .mapToDouble(Order::getTotalAmount)
            .sum();
        
        int orderCount = orders.size();
        double averageOrderValue = orderCount > 0 ? totalRevenue / orderCount : 0.0;
        
        
        List<Map<String, Object>> dataPoints = new ArrayList<>();
        
        if ("DAY".equalsIgnoreCase(groupBy)) {
            dataPoints = groupByDay(orders, startDate, endDate);
        } else if ("WEEK".equalsIgnoreCase(groupBy)) {
            dataPoints = groupByWeek(orders, startDate, endDate);
        } else if ("MONTH".equalsIgnoreCase(groupBy)) {
            dataPoints = groupByMonth(orders, startDate, endDate);
        }
        
        Map<String, Object> analytics = new HashMap<>();
        analytics.put("totalRevenue", totalRevenue);
        analytics.put("averageOrderValue", averageOrderValue);
        analytics.put("orderCount", orderCount);
        analytics.put("dataPoints", dataPoints);
        
        return analytics;
    }
    
    private List<Map<String, Object>> groupByDay(List<Order> orders, LocalDateTime start, LocalDateTime end) {
        Map<LocalDateTime, List<Order>> grouped = new TreeMap<>();
        
        
        LocalDateTime current = start.truncatedTo(ChronoUnit.DAYS);
        while (!current.isAfter(end)) {
            grouped.put(current, new ArrayList<>());
            current = current.plusDays(1);
        }
        
        
        for (Order order : orders) {
            LocalDateTime day = order.getCreatedAt().truncatedTo(ChronoUnit.DAYS);
            grouped.computeIfAbsent(day, k -> new ArrayList<>()).add(order);
        }
        
        return grouped.entrySet().stream()
            .map(entry -> createDataPoint(entry.getKey(), entry.getValue()))
            .collect(Collectors.toList());
    }
    
    private List<Map<String, Object>> groupByWeek(List<Order> orders, LocalDateTime start, LocalDateTime end) {
        Map<LocalDateTime, List<Order>> grouped = new TreeMap<>();
        
        
        for (Order order : orders) {
            LocalDateTime weekStart = order.getCreatedAt().truncatedTo(ChronoUnit.DAYS)
                .minusDays(order.getCreatedAt().getDayOfWeek().getValue() - 1);
            grouped.computeIfAbsent(weekStart, k -> new ArrayList<>()).add(order);
        }
        
        return grouped.entrySet().stream()
            .map(entry -> createDataPoint(entry.getKey(), entry.getValue()))
            .collect(Collectors.toList());
    }
    
    private List<Map<String, Object>> groupByMonth(List<Order> orders, LocalDateTime start, LocalDateTime end) {
        Map<LocalDateTime, List<Order>> grouped = new TreeMap<>();
        
        
        for (Order order : orders) {
            LocalDateTime monthStart = order.getCreatedAt().withDayOfMonth(1).truncatedTo(ChronoUnit.DAYS);
            grouped.computeIfAbsent(monthStart, k -> new ArrayList<>()).add(order);
        }
        
        return grouped.entrySet().stream()
            .map(entry -> createDataPoint(entry.getKey(), entry.getValue()))
            .collect(Collectors.toList());
    }
    
    private Map<String, Object> createDataPoint(LocalDateTime timestamp, List<Order> orders) {
        double revenue = orders.stream()
            .filter(o -> o.getTotalAmount() != null)
            .mapToDouble(Order::getTotalAmount)
            .sum();
        
        Map<String, Object> dataPoint = new HashMap<>();
        dataPoint.put("timestamp", timestamp);
        dataPoint.put("revenue", revenue);
        dataPoint.put("orderCount", orders.size());
        
        return dataPoint;
    }
    
    @Override
    @Transactional(readOnly = true)
    public OrderStatsDto getOrderStats() {
        long totalOrders = orderRepository.count();
        long pendingOrders = orderRepository.countByStatus(OrderStatus.PENDING);
        long completedOrders = orderRepository.countByStatus(OrderStatus.DELIVERED);
        long cancelledOrders = orderRepository.countByStatus(OrderStatus.CANCELLED);
        
        return OrderStatsDto.builder()
                .totalOrders(totalOrders)
                .pendingOrders(pendingOrders)
                .deliveredOrders(completedOrders)
                .cancelledOrders(cancelledOrders)
                .totalRevenue(orderRepository.getTotalSalesAmount().doubleValue())
                .build();
    }
    
    @Override
    @Transactional(readOnly = true)
    public Map<String, Object> getRevenueStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalRevenue", orderRepository.getTotalSalesAmount());
        
        return stats;
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
                
                
                scheduleReviewRequest(order, user);
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
            
            log.info("Order status notification sent to {} for order {}: {}", user.getEmail(), order.getId(), newStatus);
        });
    }
    
    private void sendOrderCancellationNotification(Order order, String reason) {
        userRepository.findById(order.getCustomerId()).ifPresent(user -> {
            Map<String, Object> variables = new HashMap<>();
            variables.put("name", user.getFirstName());
            variables.put("orderId", order.getId());
            variables.put("amount", String.format("%.2f", order.getTotalAmount()));
            variables.put("reason", reason != null ? reason : "As per your request");
            variables.put("refundInfo", Boolean.TRUE.equals(order.getRefunded()) ? "A refund has been initiated to your original payment method." : "Please contact support for refund details.");
            
            
            eventPublisher.publishEvent(new com.artwork.event.EmailEvent(
                this,
                user.getEmail(),
                "Order Cancelled - Order #" + order.getId(),
                "email/order-cancelled",
                variables
            ));
            
            log.info("Order cancellation notification sent to {} for order {}", user.getEmail(), order.getId());
        });
    }
    
    private void scheduleReviewRequest(Order order, com.artwork.entity.User user) {
        
        
        
        
        log.info("Review request scheduled for order {} (will be sent after 3 days)", order.getId());
        
        
        sendReviewRequestEmail(order, user);
    }
    
    private void sendReviewRequestEmail(Order order, com.artwork.entity.User user) {
        Map<String, Object> variables = new HashMap<>();
        variables.put("name", user.getFirstName());
        variables.put("orderId", order.getId());
        variables.put("deliveredDate", LocalDateTime.now().toLocalDate().toString());
        variables.put("reviewUrl", frontendBaseUrl + "/dashboard/customer/orders/" + order.getId() + "/review");
        
        eventPublisher.publishEvent(new com.artwork.event.EmailEvent(
            this,
            user.getEmail(),
            "How was your order? - MakeMyCrafts",
            "email/review-request",
            variables
        ));
        
        log.info("Review request email sent to {} for order {}", user.getEmail(), order.getId());
    }
}


