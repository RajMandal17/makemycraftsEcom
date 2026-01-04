package com.artwork.repository;

import com.artwork.entity.Order;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, String> {
    List<Order> findByCustomerId(String customerId);
    Page<Order> findByCustomerId(String customerId, Pageable pageable);
    
    
    @Query("SELECT COALESCE(SUM(o.totalAmount), 0) FROM Order o WHERE o.status IN ('DELIVERED', 'CONFIRMED')")
    BigDecimal getTotalSalesAmount();
    
    long countByStatus(com.artwork.entity.OrderStatus status);
    
    
    @Query("SELECT o FROM Order o WHERE COALESCE(o.createdAt, o.updatedAt) >= :startDate AND COALESCE(o.createdAt, o.updatedAt) <= :endDate")
    List<Order> findOrdersByDateRange(@Param("startDate") LocalDateTime startDate, 
                                      @Param("endDate") LocalDateTime endDate);
    
    
    @Query("SELECT o FROM Order o WHERE o.createdAt >= :startDate AND o.createdAt <= :endDate AND o.status IN :statuses")
    List<Order> findOrdersByDateRangeAndStatus(@Param("startDate") LocalDateTime startDate, 
                                                @Param("endDate") LocalDateTime endDate,
                                                @Param("statuses") List<com.artwork.entity.OrderStatus> statuses);
    
    
    @Query("SELECT COALESCE(SUM(o.totalAmount), 0.0) FROM Order o")
    Double sumTotalAmount();
}

