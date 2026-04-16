package com.sanaru.backend.repository;

import com.sanaru.backend.enums.OrderStatus;
import com.sanaru.backend.model.Order;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface OrderRepository extends JpaRepository<Order, Long> {

    List<Order> findByUserIdOrderByCreatedAtDesc(Long userId);

    Optional<Order> findByUserIdAndOrderNumber(Long userId, String orderNumber);

    Optional<Order> findByOrderNumber(String orderNumber);
    
    long countByStatus(OrderStatus status);
    
    long countByUserIdAndStatus(Long userId, OrderStatus status);
}