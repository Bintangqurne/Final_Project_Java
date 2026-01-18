package com.finprodb.backendjava.order;

public enum OrderStatus {
  PENDING_PAYMENT,
  PAID,
  PROCESSING,
  DELIVERING,
  DELIVERED,
  COMPLETED,
  REJECTED,
  CANCELLED
}
