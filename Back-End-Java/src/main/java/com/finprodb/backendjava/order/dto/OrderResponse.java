package com.finprodb.backendjava.order.dto;

import com.finprodb.backendjava.order.OrderStatus;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

public class OrderResponse {
  private Long id;
  private String orderCode;
  private OrderStatus status;
  private BigDecimal totalAmount;
  private String shippingAddress;
  private String shippingPhone;
  private String courierPhone;
  private String courierPlate;
  private Instant createdAt;
  private List<OrderItemResponse> items;

  public OrderResponse(
      Long id,
      String orderCode,
      OrderStatus status,
      BigDecimal totalAmount,
      String shippingAddress,
      String shippingPhone,
      String courierPhone,
      String courierPlate,
      Instant createdAt,
      List<OrderItemResponse> items) {
    this.id = id;
    this.orderCode = orderCode;
    this.status = status;
    this.totalAmount = totalAmount;
    this.shippingAddress = shippingAddress;
    this.shippingPhone = shippingPhone;
    this.courierPhone = courierPhone;
    this.courierPlate = courierPlate;
    this.createdAt = createdAt;
    this.items = items;
  }

  public Long getId() {
    return id;
  }

  public String getOrderCode() {
    return orderCode;
  }

  public OrderStatus getStatus() {
    return status;
  }

  public BigDecimal getTotalAmount() {
    return totalAmount;
  }

  public String getShippingAddress() {
    return shippingAddress;
  }

  public String getShippingPhone() {
    return shippingPhone;
  }

  public String getCourierPhone() {
    return courierPhone;
  }

  public String getCourierPlate() {
    return courierPlate;
  }

  public Instant getCreatedAt() {
    return createdAt;
  }

  public List<OrderItemResponse> getItems() {
    return items;
  }
}
