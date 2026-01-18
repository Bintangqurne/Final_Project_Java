package com.finprodb.backendjava.order.dto;

import java.math.BigDecimal;

public class OrderItemResponse {
  private Long productId;
  private String productName;
  private Integer quantity;
  private BigDecimal price;
  private BigDecimal subtotal;

  public OrderItemResponse(
      Long productId, String productName, Integer quantity, BigDecimal price, BigDecimal subtotal) {
    this.productId = productId;
    this.productName = productName;
    this.quantity = quantity;
    this.price = price;
    this.subtotal = subtotal;
  }

  public Long getProductId() {
    return productId;
  }

  public String getProductName() {
    return productName;
  }

  public Integer getQuantity() {
    return quantity;
  }

  public BigDecimal getPrice() {
    return price;
  }

  public BigDecimal getSubtotal() {
    return subtotal;
  }
}
