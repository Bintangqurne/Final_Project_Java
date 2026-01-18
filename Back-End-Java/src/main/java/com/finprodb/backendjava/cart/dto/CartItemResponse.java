package com.finprodb.backendjava.cart.dto;

import java.math.BigDecimal;

public class CartItemResponse {
  private Long id;
  private Long productId;
  private String productName;
  private BigDecimal price;
  private Integer quantity;
  private BigDecimal subtotal;

  public CartItemResponse(
      Long id,
      Long productId,
      String productName,
      BigDecimal price,
      Integer quantity,
      BigDecimal subtotal) {
    this.id = id;
    this.productId = productId;
    this.productName = productName;
    this.price = price;
    this.quantity = quantity;
    this.subtotal = subtotal;
  }

  public Long getId() {
    return id;
  }

  public Long getProductId() {
    return productId;
  }

  public String getProductName() {
    return productName;
  }

  public BigDecimal getPrice() {
    return price;
  }

  public Integer getQuantity() {
    return quantity;
  }

  public BigDecimal getSubtotal() {
    return subtotal;
  }
}
