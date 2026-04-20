package com.sanaru.backend.service;

import com.sanaru.backend.dto.OrderResponse;

import java.util.List;
import java.util.Map;

public interface OrderService {

    OrderResponse checkout();

    List<OrderResponse> getMyOrders();

    OrderResponse getMyOrderByReference(String orderReference);

    List<OrderResponse> getAllOrders();

    /** Customer: request cancellation of any non-terminal order */
    OrderResponse requestCancellation(Long orderId);

    /** Admin: approve a cancellation request → sets order to CANCELLED */
    OrderResponse adminCancelOrder(Long orderId);

    /** Admin: reject a cancellation request → reverts order to CONFIRMED */
    OrderResponse adminRejectCancellation(Long orderId);

    /** Admin: manually approve an order regardless of payment state → sets order to CONFIRMED */
    OrderResponse adminApproveOrder(Long orderId);
    
    long getPendingApprovalOrderCount();
    
    Map<String, Integer> getCustomerOrderStatusCounts(String userEmail);
}
