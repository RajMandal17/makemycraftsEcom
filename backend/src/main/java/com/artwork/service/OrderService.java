package com.artwork.service;

import com.artwork.dto.OrderRequestDto;
import com.artwork.dto.OrderDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.List;

public interface OrderService {
    OrderDto placeOrder(OrderRequestDto orderRequestDto, String token);
    List<OrderDto> getOrders(String token); // Keep for backward compatibility
    Page<OrderDto> getOrdersPaged(String token, Pageable pageable);
    OrderDto getOrderById(String id, String token);
}
