package com.finprodb.backendjava.admin.dto;

import java.math.BigDecimal;

public class AdminSummaryResponse {
  private long totalOrders;
  private long pendingPaymentOrders;
  private long paidOrders;
  private long cancelledOrders;
  private BigDecimal paidRevenue;
  private long totalUserRoleUser;

  public AdminSummaryResponse(
      long totalOrders,
      long pendingPaymentOrders,
      long paidOrders,
      long cancelledOrders,
      BigDecimal paidRevenue,
      long totalUserRoleUser) {
    this.totalOrders = totalOrders;
    this.pendingPaymentOrders = pendingPaymentOrders;
    this.paidOrders = paidOrders;
    this.cancelledOrders = cancelledOrders;
    this.paidRevenue = paidRevenue;
    this.totalUserRoleUser = totalUserRoleUser;
  }

  public long getTotalOrders() {
    return totalOrders;
  }

  public long getPendingPaymentOrders() {
    return pendingPaymentOrders;
  }

  public long getPaidOrders() {
    return paidOrders;
  }

  public long getCancelledOrders() {
    return cancelledOrders;
  }

  public BigDecimal getPaidRevenue() {
    return paidRevenue;
  }

  public long getTotalUserRoleUser() {
    return totalUserRoleUser;
  }
}
