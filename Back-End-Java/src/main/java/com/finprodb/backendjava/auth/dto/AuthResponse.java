package com.finprodb.backendjava.auth.dto;

public class AuthResponse {
  private String token;
  private String tokenType;
  private Long userId;
  private String name;
  private String username;
  private String email;
  private String role;

  public AuthResponse(
      String token,
      String tokenType,
      Long userId,
      String name,
      String username,
      String email,
      String role) {
    this.token = token;
    this.tokenType = tokenType;
    this.userId = userId;
    this.name = name;
    this.username = username;
    this.email = email;
    this.role = role;
  }

  public String getToken() {
    return token;
  }

  public String getTokenType() {
    return tokenType;
  }

  public Long getUserId() {
    return userId;
  }

  public String getName() {
    return name;
  }

  public String getUsername() {
    return username;
  }

  public String getEmail() {
    return email;
  }

  public String getRole() {
    return role;
  }
}
