package com.artwork.service.impl;

import com.artwork.dto.*;
import com.artwork.entity.Order;
import com.artwork.entity.OrderItem;
import com.artwork.entity.CartItem;
import com.artwork.entity.Artwork;
import com.artwork.repository.OrderRepository;
import com.artwork.repository.OrderItemRepository;
import com.artwork.repository.CartItemRepository;
import com.artwork.repository.ArtworkRepository;
import com.artwork.repository.UserRepository;
import com.artwork.entity.User;
import com.artwork.util.JwtUtil;
import com.artwork.service.OrderService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.modelmapper.ModelMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.*;
import java.util.stream.Collectors;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
public class OrderServiceImpl implements OrderService {
    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final CartItemRepository cartItemRepository;
    private final ArtworkRepository artworkRepository;
    private final UserRepository userRepository;
    private final ModelMapper modelMapper;
    private final JwtUtil jwtUtil;
    private final org.springframework.context.ApplicationEventPublisher eventPublisher;
    
    @org.springframework.beans.factory.annotation.Value("${frontend.base-url}")
    private String frontendBaseUrl;
    
    @org.springframework.beans.factory.annotation.Value("${admin.email:mail@makemycrafts.com}")
    private String adminEmail;
    
    private static final double HIGH_VALUE_THRESHOLD = 10000.0; 

    @Override
    @Transactional
    public OrderDto placeOrder(OrderRequestDto orderRequestDto, String token) {
        String userId = jwtUtil.extractUserId(token);
        double totalAmount = 0;
        List<OrderItem> orderItems = new ArrayList<>();
        for (OrderItemRequestDto itemDto : orderRequestDto.getItems()) {
            Artwork artwork = artworkRepository.findById(itemDto.getArtworkId()).orElseThrow();
            double price = artwork.getPrice();
            totalAmount += price * itemDto.getQuantity();
            OrderItem orderItem = OrderItem.builder()
                    .artworkId(itemDto.getArtworkId())
                    .quantity(itemDto.getQuantity())
                    .price(price)
                    .build();
            orderItems.add(orderItem);
        }
        Order order = Order.builder()
                .customerId(userId)
                .totalAmount(totalAmount)
                .status(com.artwork.entity.OrderStatus.PENDING)
                .shippingAddress(orderRequestDto.getShippingAddress().toString())
                .paymentMethod(orderRequestDto.getPaymentMethod())
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
        orderRepository.save(order);
        for (OrderItem orderItem : orderItems) {
            orderItem.setOrderId(order.getId());
            orderItemRepository.save(orderItem);
        }
        
        List<CartItem> cartItems = cartItemRepository.findAll().stream()
                .filter(item -> item.getUserId().equals(userId))
                .collect(Collectors.toList());
        cartItemRepository.deleteAll(cartItems);
        
        
        userRepository.findById(userId).ifPresent(user -> {
            Map<String, Object> variables = new HashMap<>();
            variables.put("name", user.getFirstName());
            variables.put("orderId", order.getId());
            variables.put("amount", String.format("%.2f", order.getTotalAmount()));
            
            eventPublisher.publishEvent(new com.artwork.event.EmailEvent(
                this,
                user.getEmail(),
                "Order Confirmation - " + order.getId(),
                "email/order-confirmation",
                variables
            ));
        });
        
        
        notifyArtistsAboutOrder(order, orderItems);
        
        
        notifyAdminAboutOrder(order, userId);

        return convertToDto(order);
    }

    @Override
    @Transactional(readOnly = true)
    public List<OrderDto> getOrders(String token) {
        String userId = jwtUtil.extractUserId(token);
        List<Order> orders = orderRepository.findByCustomerId(userId);
        return orders.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }
    
    @Override
    @Transactional(readOnly = true)
    public Page<OrderDto> getOrdersPaged(String token, Pageable pageable) {
        String userId = jwtUtil.extractUserId(token);
        Page<Order> orderPage = orderRepository.findByCustomerId(userId, pageable);
        return orderPage.map(this::convertToDto);
    }
    
    @Override
    @Transactional(readOnly = true)
    public OrderDto getOrderById(String id, String token) {
        String userId = jwtUtil.extractUserId(token);
        Order order = orderRepository.findById(id).orElseThrow(() -> 
            new RuntimeException("Order not found with id: " + id)
        );
        
        
        
        if (!order.getCustomerId().equals(userId)) {
            throw new RuntimeException("You don't have permission to access this order");
        }
        
        return convertToDto(order);
    }
    
    private OrderDto convertToDto(Order order) {
        OrderDto orderDto = new OrderDto();
        orderDto.setId(order.getId());
        orderDto.setCustomerId(order.getCustomerId());
        orderDto.setTotalAmount(order.getTotalAmount());
        orderDto.setStatus(order.getStatus().name());
        orderDto.setShippingAddress(order.getShippingAddress());
        orderDto.setPaymentMethod(order.getPaymentMethod());
        orderDto.setCreatedAt(order.getCreatedAt() != null ? order.getCreatedAt().toString() : null);
        orderDto.setUpdatedAt(order.getUpdatedAt() != null ? order.getUpdatedAt().toString() : null);
        
        
        userRepository.findById(order.getCustomerId()).ifPresent(user -> {
            OrderDto.CustomerInfo customerInfo = new OrderDto.CustomerInfo();
            customerInfo.setFirstName(user.getFirstName());
            customerInfo.setLastName(user.getLastName());
            customerInfo.setEmail(user.getEmail());
            orderDto.setCustomer(customerInfo);
        });
        
        
        List<OrderItem> orderItems = orderItemRepository.findByOrderId(order.getId());
        List<OrderItemDto> itemDtos = orderItems.stream()
                .map(this::convertItemToDto)
                .collect(Collectors.toList());
        orderDto.setItems(itemDtos);
        
        return orderDto;
    }
    
    private OrderItemDto convertItemToDto(OrderItem item) {
        OrderItemDto dto = new OrderItemDto();
        dto.setId(item.getId());
        dto.setArtworkId(item.getArtworkId());
        dto.setPrice(item.getPrice());
        dto.setQuantity(item.getQuantity());
        
        
        artworkRepository.findById(item.getArtworkId()).ifPresent(artwork -> {
            dto.setTitle(artwork.getTitle());
            dto.setArtwork(modelMapper.map(artwork, ArtworkDto.class));
        });
        
        return dto;
    }
    
    private void notifyArtistsAboutOrder(Order order, List<OrderItem> orderItems) {
        
        Map<String, List<OrderItem>> itemsByArtist = new HashMap<>();
        
        for (OrderItem item : orderItems) {
            artworkRepository.findById(item.getArtworkId()).ifPresent(artwork -> {
                String artistId = artwork.getArtistId();
                itemsByArtist.computeIfAbsent(artistId, k -> new ArrayList<>()).add(item);
            });
        }
        
        
        itemsByArtist.forEach((artistId, items) -> {
            userRepository.findById(artistId).ifPresent(artist -> {
                double artistTotal = items.stream()
                    .mapToDouble(item -> item.getPrice() * item.getQuantity())
                    .sum();
                
                
                double artistEarnings = artistTotal * 0.85;
                
                List<Map<String, Object>> itemDetails = new ArrayList<>();
                for (OrderItem item : items) {
                    artworkRepository.findById(item.getArtworkId()).ifPresent(artwork -> {
                        Map<String, Object> itemMap = new HashMap<>();
                        itemMap.put("title", artwork.getTitle());
                        itemMap.put("quantity", item.getQuantity());
                        itemMap.put("price", String.format("%.2f", item.getPrice()));
                        itemDetails.add(itemMap);
                    });
                }
                
                Map<String, Object> variables = new HashMap<>();
                variables.put("artistName", artist.getFirstName());
                variables.put("orderId", order.getId());
                variables.put("orderDate", java.time.LocalDateTime.now().toLocalDate().toString());
                variables.put("customerName", "Customer"); 
                variables.put("items", itemDetails);
                variables.put("artistEarnings", String.format("%.2f", artistEarnings));
                variables.put("orderUrl", frontendBaseUrl + "/dashboard/artist/orders/" + order.getId());
                
                eventPublisher.publishEvent(new com.artwork.event.EmailEvent(
                    this,
                    artist.getEmail(),
                    "New Order Received - MakeMyCrafts",
                    "email/artist-new-order",
                    variables
                ));
                
                log.info("Artist notification sent to {} for order {}", artist.getEmail(), order.getId());
            });
        });
    }
    
    private void notifyAdminAboutOrder(Order order, String customerId) {
        userRepository.findById(customerId).ifPresent(customer -> {
            Map<String, Object> variables = new HashMap<>();
            variables.put("orderId", order.getId());
            variables.put("orderAmount", String.format("%.2f", order.getTotalAmount()));
            variables.put("itemCount", orderItemRepository.findByOrderId(order.getId()).size());
            variables.put("customerName", customer.getFirstName() + " " + customer.getLastName());
            variables.put("customerEmail", customer.getEmail());
            variables.put("orderDate", java.time.LocalDateTime.now().toLocalDate().toString());
            variables.put("paymentMethod", order.getPaymentMethod());
            variables.put("isHighValue", order.getTotalAmount() >= HIGH_VALUE_THRESHOLD);
            variables.put("orderUrl", frontendBaseUrl + "/dashboard/admin/orders/" + order.getId());
            
            String subject = order.getTotalAmount() >= HIGH_VALUE_THRESHOLD 
                ? "🚨 High Value Order Alert - " + order.getId()
                : "New Order Notification - " + order.getId();
            
            eventPublisher.publishEvent(new com.artwork.event.EmailEvent(
                this,
                adminEmail,
                subject,
                "email/admin-new-order",
                variables
            ));
            
            log.info("Admin notification sent for order {}", order.getId());
        });
    }
}
