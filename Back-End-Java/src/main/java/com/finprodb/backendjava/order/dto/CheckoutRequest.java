package com.finprodb.backendjava.order.dto;

public class CheckoutRequest {
  private Long addressId;
  private String shippingAddress;
  private String shippingPhone;

  public Long getAddressId() {
    return addressId;
  }

  public void setAddressId(Long addressId) {
    this.addressId = addressId;
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
}
