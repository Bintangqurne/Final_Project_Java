package com.finprodb.backendjava.address.dto;

import java.time.Instant;

public class AddressResponse {
  private Long id;
  private String label;
  private String recipientName;
  private String addressLine;
  private String phone;
  private Boolean isDefault;
  private Instant createdAt;
  private Instant updatedAt;

  public AddressResponse(
      Long id,
      String label,
      String recipientName,
      String addressLine,
      String phone,
      Boolean isDefault,
      Instant createdAt,
      Instant updatedAt) {
    this.id = id;
    this.label = label;
    this.recipientName = recipientName;
    this.addressLine = addressLine;
    this.phone = phone;
    this.isDefault = isDefault;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  public Long getId() {
    return id;
  }

  public String getLabel() {
    return label;
  }

  public String getRecipientName() {
    return recipientName;
  }

  public String getAddressLine() {
    return addressLine;
  }

  public String getPhone() {
    return phone;
  }

  public Boolean getIsDefault() {
    return isDefault;
  }

  public Instant getCreatedAt() {
    return createdAt;
  }

  public Instant getUpdatedAt() {
    return updatedAt;
  }
}
