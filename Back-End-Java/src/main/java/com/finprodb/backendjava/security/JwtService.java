package com.finprodb.backendjava.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.security.MessageDigest;
import java.time.Instant;
import java.util.Date;
import java.util.Map;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class JwtService {
  private final Key signingKey;
  private final long expirationMinutes;

  public JwtService(
      @Value("${app.jwt.secret}") String secret,
      @Value("${app.jwt.expiration-minutes}") long expirationMinutes) {
    this.signingKey = Keys.hmacShaKeyFor(secretToKeyBytes(secret));
    this.expirationMinutes = expirationMinutes;
  }

  public String generateToken(String username, Map<String, Object> extraClaims) {
    Instant now = Instant.now();
    Instant exp = now.plusSeconds(expirationMinutes * 60);

    return Jwts.builder()
        .setClaims(extraClaims)
        .setSubject(username)
        .setIssuedAt(Date.from(now))
        .setExpiration(Date.from(exp))
        .signWith(signingKey, SignatureAlgorithm.HS256)
        .compact();
  }

  public String extractUsername(String token) {
    return extractAllClaims(token).getSubject();
  }

  public boolean isTokenValid(String token, String expectedUsername) {
    String username = extractUsername(token);
    return username != null && username.equals(expectedUsername) && !isTokenExpired(token);
  }

  private boolean isTokenExpired(String token) {
    Date exp = extractAllClaims(token).getExpiration();
    return exp.before(new Date());
  }

  private Claims extractAllClaims(String token) {
    return Jwts.parserBuilder().setSigningKey(signingKey).build().parseClaimsJws(token).getBody();
  }

  private static byte[] secretToKeyBytes(String secret) {
    byte[] secretBytes = decodeBase64IfLooksLikeBase64(secret);
    if (secretBytes.length >= 32) {
      return secretBytes;
    }
    return sha256(secretBytes);
  }

  private static byte[] decodeBase64IfLooksLikeBase64(String secret) {
    boolean looksBase64 = secret.matches("^[A-Za-z0-9+/=]+$") && secret.length() % 4 == 0;
    if (!looksBase64) {
      return secret.getBytes(StandardCharsets.UTF_8);
    }
    try {
      return Decoders.BASE64.decode(secret);
    } catch (Exception ignored) {
      return secret.getBytes(StandardCharsets.UTF_8);
    }
  }

  private static byte[] sha256(byte[] input) {
    try {
      MessageDigest digest = MessageDigest.getInstance("SHA-256");
      return digest.digest(input);
    } catch (Exception e) {
      throw new IllegalStateException("SHA-256 not available", e);
    }
  }
}
