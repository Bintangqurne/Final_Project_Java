package com.finprodb.backendjava.admin.dto;

import com.finprodb.backendjava.order.OrderApprovalStatus;
import com.finprodb.backendjava.order.OrderStatus;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

public class AdminOrderResponse {
  private Long id;
  private String orderCode;
  private OrderStatus status;
  private OrderApprovalStatus approvalStatus;
  private Instant approvedAt;
  private Instant rejectedAt;
  private Long approvedByUserId;
  private String approvedByUsername;
  private BigDecimal totalAmount;
  private Instant createdAt;

  private String shippingAddress;
  private String shippingPhone;

  private String courierPhone;
  private String courierPlate;

  private Long userId;
  private String username;
  private String email;

  private String paymentStatus;

  private List<AdminOrderItemResponse> items;

  public AdminOrderResponse(
      Long id,
      String orderCode,
      OrderStatus status,
      OrderApprovalStatus approvalStatus,
      Instant approvedAt,
      Instant rejectedAt,
      Long approvedByUserId,
      String approvedByUsername,
      BigDecimal totalAmount,
      Instant createdAt,
      String shippingAddress,
      String shippingPhone,
      String courierPhone,
      String courierPlate,
      Long userId,
      String username,
      String email,
      String paymentStatus,
      List<AdminOrderItemResponse> items) {
    this.id = id;
    this.orderCode = orderCode;
    this.status = status;
    this.approvalStatus = approvalStatus;
    this.approvedAt = approvedAt;
    this.rejectedAt = rejectedAt;
    this.approvedByUserId = approvedByUserId;
    this.approvedByUsername = approvedByUsername;
    this.totalAmount = totalAmount;
    this.createdAt = createdAt;
    this.shippingAddress = shippingAddress;
    this.shippingPhone = shippingPhone;
    this.courierPhone = courierPhone;
    this.courierPlate = courierPlate;
    this.userId = userId;
    this.username = username;
    this.email = email;
    this.paymentStatus = paymentStatus;
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

  public OrderApprovalStatus getApprovalStatus() {
    return approvalStatus;
  }

  public Instant getApprovedAt() {
    return approvedAt;
  }

  public Instant getRejectedAt() {
    return rejectedAt;
  }

  public Long getApprovedByUserId() {
    return approvedByUserId;
  }

  public String getApprovedByUsername() {
    return approvedByUsername;
  }

  public BigDecimal getTotalAmount() {
    return totalAmount;
  }

  public Instant getCreatedAt() {
    return createdAt;
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

  public Long getUserId() {
    return userId;
  }

  public String getUsername() {
    return username;
  }

  public String getEmail() {
    return email;
  }

  public String getPaymentStatus() {
    return paymentStatus;
  }

  public List<AdminOrderItemResponse> getItems() {
    return items;
  }
}
