package com.finprodb.backendjava.order;

import com.finprodb.backendjava.user.User;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "orders")
public class Order {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "user_id", nullable = false)
  private User user;

  @Column(nullable = false, unique = true)
  private String orderCode;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false, length = 32, columnDefinition = "VARCHAR(32)")
  private OrderStatus status;

  @Enumerated(EnumType.STRING)
  @Column(length = 16, columnDefinition = "VARCHAR(16)")
  private OrderApprovalStatus approvalStatus;

  @Column
  private Instant approvedAt;

  @Column
  private Instant rejectedAt;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "approved_by_user_id")
  private User approvedBy;

  @Column(nullable = false, precision = 19, scale = 2)
  private BigDecimal totalAmount;

  @Column(columnDefinition = "TEXT")
  private String shippingAddress;

  @Column
  private String shippingPhone;

  @Column
  private String courierPhone;

  @Column
  private String courierPlate;

  @Column(nullable = false)
  private Instant createdAt;

  @Column(nullable = false)
  private Instant updatedAt;

  @PrePersist
  void onCreate() {
    Instant now = Instant.now();
    this.createdAt = now;
    this.updatedAt = now;

    if (this.approvalStatus == null) {
      this.approvalStatus = OrderApprovalStatus.PENDING;
    }
  }

  @PreUpdate
  void onUpdate() {
    this.updatedAt = Instant.now();
  }

  public Long getId() {
    return id;
  }

  public void setId(Long id) {
    this.id = id;
  }

  public User getUser() {
    return user;
  }

  public void setUser(User user) {
    this.user = user;
  }

  public String getOrderCode() {
    return orderCode;
  }

  public void setOrderCode(String orderCode) {
    this.orderCode = orderCode;
  }

  public OrderStatus getStatus() {
    return status;
  }

  public void setStatus(OrderStatus status) {
    this.status = status;
  }

  public OrderApprovalStatus getApprovalStatus() {
    return approvalStatus;
  }

  public void setApprovalStatus(OrderApprovalStatus approvalStatus) {
    this.approvalStatus = approvalStatus;
  }

  public Instant getApprovedAt() {
    return approvedAt;
  }

  public void setApprovedAt(Instant approvedAt) {
    this.approvedAt = approvedAt;
  }

  public Instant getRejectedAt() {
    return rejectedAt;
  }

  public void setRejectedAt(Instant rejectedAt) {
    this.rejectedAt = rejectedAt;
  }

  public User getApprovedBy() {
    return approvedBy;
  }

  public void setApprovedBy(User approvedBy) {
    this.approvedBy = approvedBy;
  }

  public BigDecimal getTotalAmount() {
    return totalAmount;
  }

  public void setTotalAmount(BigDecimal totalAmount) {
    this.totalAmount = totalAmount;
  }

  public String getShippingAddress() {
    return shippingAddress;
  }

  public void setShippingAddress(String shippingAddress) {
    this.shippingAddress = shippingAddress;
  }

  public String getShippingPhone() {
    return shippingPhone;
  }

  public void setShippingPhone(String shippingPhone) {
    this.shippingPhone = shippingPhone;
  }

  public String getCourierPhone() {
    return courierPhone;
  }

  public void setCourierPhone(String courierPhone) {
    this.courierPhone = courierPhone;
  }

  public String getCourierPlate() {
    return courierPlate;
  }

  public void setCourierPlate(String courierPlate) {
    this.courierPlate = courierPlate;
  }

  public Instant getCreatedAt() {
    return createdAt;
  }

  public Instant getUpdatedAt() {
    return updatedAt;
  }
}
