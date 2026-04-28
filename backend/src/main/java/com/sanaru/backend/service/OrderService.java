package com.sanaru.backend.service;

import com.sanaru.backend.dto.OrderResponse;

import java.util.List;
import java.util.Map;

public interface OrderService {

    OrderResponse checkout(String deliveryAddress, boolean requiresDelivery);

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

    /** Admin: update delivery status (PROCESSING, GIVEN_TO_DELIVERY_PARTNER, DELIVERED) */
    OrderResponse updateDeliveryStatus(Long orderId, String newStatus);

    /** Customer: mark order as received when delivered */
    OrderResponse markOrderAsReceived(Long orderId);
    
    long getPendingApprovalOrderCount();
    
    Map<String, Integer> getCustomerOrderStatusCounts(String userEmail);
}
