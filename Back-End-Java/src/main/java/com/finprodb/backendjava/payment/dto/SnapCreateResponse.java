package com.finprodb.backendjava.payment.dto;

public class SnapCreateResponse {
  private Long paymentId;
  private Long orderId;
  private String orderCode;
  private String snapToken;
  private String redirectUrl;

  public SnapCreateResponse(
      Long paymentId, Long orderId, String orderCode, String snapToken, String redirectUrl) {
    this.paymentId = paymentId;
    this.orderId = orderId;
    this.orderCode = orderCode;
    this.snapToken = snapToken;
    this.redirectUrl = redirectUrl;
  }

  public Long getPaymentId() {
    return paymentId;
  }

  public Long getOrderId() {
    return orderId;
  }

  public String getOrderCode() {
    return orderCode;
  }

  public String getSnapToken() {
    return snapToken;
  }

  public String getRedirectUrl() {
    return redirectUrl;
  }
}
