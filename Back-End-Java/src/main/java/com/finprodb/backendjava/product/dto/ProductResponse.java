package com.finprodb.backendjava.product.dto;

import com.finprodb.backendjava.product.Product;
import java.math.BigDecimal;
import java.time.Instant;

public class ProductResponse {
  private Long id;
  private String name;
  private String description;
  private BigDecimal price;
  private Integer stock;
  private Boolean active;
  private String imagePath;
  private Long categoryId;
  private Instant createdAt;
  private Instant updatedAt;

  public static ProductResponse from(Product product) {
    ProductResponse res = new ProductResponse();
    res.setId(product.getId());
    res.setName(product.getName());
    res.setDescription(product.getDescription());
    res.setPrice(product.getPrice());
    res.setStock(product.getStock());
    res.setActive(product.getActive());
    res.setImagePath(product.getImagePath());
    res.setCategoryId(product.getCategory() != null ? product.getCategory().getId() : null);
    res.setCreatedAt(product.getCreatedAt());
    res.setUpdatedAt(product.getUpdatedAt());
    return res;
  }

  public Long getId() {
    return id;
  }

  public void setId(Long id) {
    this.id = id;
  }

  public String getName() {
    return name;
  }

  public void setName(String name) {
    this.name = name;
  }

  public String getDescription() {
    return description;
  }

  public void setDescription(String description) {
    this.description = description;
  }

  public BigDecimal getPrice() {
    return price;
  }

  public void setPrice(BigDecimal price) {
    this.price = price;
  }

  public Integer getStock() {
    return stock;
  }

  public void setStock(Integer stock) {
    this.stock = stock;
  }

  public Boolean getActive() {
    return active;
  }

  public void setActive(Boolean active) {
    this.active = active;
  }

  public String getImagePath() {
    return imagePath;
  }

  public void setImagePath(String imagePath) {
    this.imagePath = imagePath;
  }

  public Long getCategoryId() {
    return categoryId;
  }

  public void setCategoryId(Long categoryId) {
    this.categoryId = categoryId;
  }

  public Instant getCreatedAt() {
    return createdAt;
  }

  public void setCreatedAt(Instant createdAt) {
    this.createdAt = createdAt;
  }

  public Instant getUpdatedAt() {
    return updatedAt;
  }

  public void setUpdatedAt(Instant updatedAt) {
    this.updatedAt = updatedAt;
  }
}
