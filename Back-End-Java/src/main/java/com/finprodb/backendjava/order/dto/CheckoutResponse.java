package com.finprodb.backendjava.order.dto;

import com.finprodb.backendjava.order.OrderStatus;
import java.math.BigDecimal;
import java.util.List;

public class CheckoutResponse {
  private Long orderId;
  private String orderCode;
  private OrderStatus status;
  private BigDecimal totalAmount;
  private String shippingAddress;
  private String shippingPhone;
  private List<OrderItemResponse> items;

  public CheckoutResponse(
      Long orderId,
      String orderCode,
      OrderStatus status,
      BigDecimal totalAmount,
      String shippingAddress,
      String shippingPhone,
      List<OrderItemResponse> items) {
    this.orderId = orderId;
    this.orderCode = orderCode;
    this.status = status;
    this.totalAmount = totalAmount;
    this.shippingAddress = shippingAddress;
    this.shippingPhone = shippingPhone;
    this.items = items;
  }

  public Long getOrderId() {
    return orderId;
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

  public List<OrderItemResponse> getItems() {
    return items;
  }
}
