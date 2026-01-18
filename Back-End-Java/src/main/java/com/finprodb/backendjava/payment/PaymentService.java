package com.finprodb.backendjava.payment;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.finprodb.backendjava.order.Order;
import com.finprodb.backendjava.order.OrderItem;
import com.finprodb.backendjava.order.OrderRepository;
import com.finprodb.backendjava.order.OrderService;
import com.finprodb.backendjava.order.OrderStatus;
import com.finprodb.backendjava.payment.dto.SnapCreateResponse;
import com.finprodb.backendjava.product.Product;
import com.finprodb.backendjava.product.ProductRepository;
import com.finprodb.backendjava.user.User;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Duration;
import java.time.Instant;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class PaymentService {
  private final PaymentTransactionRepository paymentTransactionRepository;
  private final OrderService orderService;
  private final OrderRepository orderRepository;
  private final ProductRepository productRepository;
  private final MidtransClient midtransClient;
  private final MidtransProperties midtransProperties;
  private final ObjectMapper objectMapper;

  public PaymentService(
      PaymentTransactionRepository paymentTransactionRepository,
      OrderService orderService,
      OrderRepository orderRepository,
      ProductRepository productRepository,
      MidtransClient midtransClient,
      MidtransProperties midtransProperties,
      ObjectMapper objectMapper) {
    this.paymentTransactionRepository = paymentTransactionRepository;
    this.orderService = orderService;
    this.orderRepository = orderRepository;
    this.productRepository = productRepository;
    this.midtransClient = midtransClient;
    this.midtransProperties = midtransProperties;
    this.objectMapper = objectMapper;
  }

  @Transactional
  public SnapCreateResponse createSnap(User user, Long orderId) {
    if (midtransProperties.getServerKey() == null || midtransProperties.getServerKey().isBlank()) {
      throw new IllegalArgumentException("MIDTRANS_SERVER_KEY is not set");
    }

    Order order = orderService.getOrder(user, orderId);
    if (order.getStatus() != OrderStatus.PENDING_PAYMENT) {
      throw new IllegalArgumentException("Order is not pending payment");
    }

    PaymentTransaction existing =
        paymentTransactionRepository.findTopByOrderOrderByCreatedAtDesc(order).orElse(null);
    if (existing != null
        && existing.getProvider() == PaymentProvider.MIDTRANS
        && existing.getStatus() == PaymentStatus.PENDING
        && existing.getSnapToken() != null
        && existing.getRedirectUrl() != null
        && existing.getCreatedAt() != null
        && Duration.between(existing.getCreatedAt(), Instant.now()).toSeconds() <= 30) {
      return new SnapCreateResponse(
          existing.getId(), order.getId(), order.getOrderCode(), existing.getSnapToken(), existing.getRedirectUrl());
    }

    PaymentTransaction payment = new PaymentTransaction();
    payment.setOrder(order);
    payment.setProvider(PaymentProvider.MIDTRANS);
    payment.setStatus(PaymentStatus.CREATED);
    payment.setGrossAmount(order.getTotalAmount());

    PaymentTransaction saved = paymentTransactionRepository.save(payment);

    Map<String, Object> payload = buildSnapPayload(order, user, orderService.getItems(order));
    Map<String, Object> response = midtransClient.createSnapTransaction(payload);

    String token = response != null ? (String) response.get("token") : null;
    String redirectUrl = response != null ? (String) response.get("redirect_url") : null;

    saved.setSnapToken(token);
    saved.setRedirectUrl(redirectUrl);
    saved.setStatus(PaymentStatus.PENDING);
    paymentTransactionRepository.save(saved);

    return new SnapCreateResponse(saved.getId(), order.getId(), order.getOrderCode(), token, redirectUrl);
  }

  @Transactional
  public Map<String, Object> handleMidtransNotification(Map<String, Object> body) {
    String orderId = (String) body.get("order_id");
    String statusCode = toStringSafe(body.get("status_code"));
    String grossAmount = toStringSafe(body.get("gross_amount"));
    String signatureKey = toStringSafe(body.get("signature_key"));

    if (orderId == null) {
      throw new IllegalArgumentException("Missing order_id");
    }

    if (!isSignatureValid(orderId, statusCode, grossAmount, signatureKey)) {
      throw new IllegalArgumentException("Invalid signature");
    }

    Order order = orderService.getByOrderCode(orderId);
    PaymentTransaction tx =
        paymentTransactionRepository
            .findTopByOrderOrderByCreatedAtDesc(order)
            .orElseGet(
                () -> {
                  PaymentTransaction p = new PaymentTransaction();
                  p.setOrder(order);
                  p.setProvider(PaymentProvider.MIDTRANS);
                  p.setStatus(PaymentStatus.PENDING);
                  p.setGrossAmount(order.getTotalAmount());
                  return paymentTransactionRepository.save(p);
                });

    try {
      tx.setLastNotificationJson(objectMapper.writeValueAsString(body));
    } catch (Exception ignored) {
    }

    String transactionStatus = toStringSafe(body.get("transaction_status"));
    String fraudStatus = toStringSafe(body.get("fraud_status"));

    if (isSuccess(transactionStatus, fraudStatus)) {
      boolean shouldDecrementStock = order.getStatus() == OrderStatus.PENDING_PAYMENT;
      tx.setStatus(PaymentStatus.SUCCESS);
      if (order.getStatus() == OrderStatus.PENDING_PAYMENT) {
        order.setStatus(OrderStatus.PAID);
      }

      if (shouldDecrementStock) {
        List<OrderItem> items = orderService.getItems(order);
        for (OrderItem item : items) {
          Product p = item.getProduct();
          int current = p.getStock() == null ? 0 : p.getStock();
          int next = current - (item.getQuantity() == null ? 0 : item.getQuantity());
          if (next < 0) {
            next = 0;
          }
          p.setStock(next);
          productRepository.save(p);
        }
      }
    } else if (isFailure(transactionStatus)) {
      tx.setStatus(PaymentStatus.FAILED);
      if (order.getStatus() == OrderStatus.PENDING_PAYMENT) {
        order.setStatus(OrderStatus.CANCELLED);
      }
    } else {
      tx.setStatus(PaymentStatus.PENDING);
    }

    paymentTransactionRepository.save(tx);
    orderRepository.save(order);

    return Map.of(
        "orderCode", order.getOrderCode(),
        "orderStatus", order.getStatus().name(),
        "paymentStatus", tx.getStatus().name());
  }

  private Map<String, Object> buildSnapPayload(Order order, User user, List<OrderItem> items) {
    long grossAmount = order.getTotalAmount().longValue();
    Map<String, Object> transactionDetails =
        Map.of("order_id", order.getOrderCode(), "gross_amount", grossAmount);

    String frontendBaseUrl = System.getenv().getOrDefault("APP_FRONTEND_BASE_URL", "http://localhost:3000");
    String finishUrl = frontendBaseUrl + "/payment/finish";

    Map<String, Object> customerDetails =
        Map.of(
            "first_name", user.getName(),
            "email", user.getEmail(),
            "phone", "");

    java.util.List<Map<String, Object>> itemDetails =
        items.stream()
            .map(
                it -> {
                  Map<String, Object> m = new HashMap<>();
                  m.put("id", String.valueOf(it.getProduct().getId()));
                  m.put("price", it.getPrice().longValue());
                  m.put("quantity", it.getQuantity());
                  m.put("name", it.getProduct().getName());
                  return m;
                })
            .toList();

    Map<String, Object> payload = new HashMap<>();
    payload.put("transaction_details", transactionDetails);
    payload.put("customer_details", customerDetails);
    payload.put("item_details", itemDetails);
    payload.put("credit_card", Map.of("secure", true));
    payload.put("callbacks", Map.of("finish", finishUrl));

    return payload;
  }

  private boolean isSignatureValid(
      String orderId, String statusCode, String grossAmount, String signatureKey) {
    if (statusCode == null || grossAmount == null || signatureKey == null) {
      return false;
    }

    String serverKey = midtransProperties.getServerKey();
    String raw = orderId + statusCode + grossAmount + serverKey;
    String expected = sha512Hex(raw);
    return expected.equals(signatureKey);
  }

  private static boolean isSuccess(String transactionStatus, String fraudStatus) {
    if ("capture".equals(transactionStatus) && (fraudStatus == null || "accept".equals(fraudStatus))) {
      return true;
    }
    return "settlement".equals(transactionStatus);
  }

  private static boolean isFailure(String transactionStatus) {
    return "cancel".equals(transactionStatus)
        || "deny".equals(transactionStatus)
        || "expire".equals(transactionStatus);
  }

  private static String sha512Hex(String input) {
    try {
      MessageDigest md = MessageDigest.getInstance("SHA-512");
      byte[] bytes = md.digest(input.getBytes(StandardCharsets.UTF_8));
      StringBuilder sb = new StringBuilder();
      for (byte b : bytes) {
        sb.append(String.format("%02x", b));
      }
      return sb.toString();
    } catch (Exception e) {
      throw new IllegalStateException("SHA-512 not available", e);
    }
  }

  private static String toStringSafe(Object o) {
    return o == null ? null : String.valueOf(o);
  }
}
