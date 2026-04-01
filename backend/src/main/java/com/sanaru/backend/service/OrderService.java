package com.sanaru.backend.service;

import com.sanaru.backend.dto.OrderResponse;

import java.util.List;

public interface OrderService {

    OrderResponse checkout();

    List<OrderResponse> getMyOrders();
}