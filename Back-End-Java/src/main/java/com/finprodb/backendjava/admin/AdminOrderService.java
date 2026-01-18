package com.finprodb.backendjava.admin;

import com.finprodb.backendjava.admin.dto.AdminOrderItemResponse;
import com.finprodb.backendjava.admin.dto.AdminOrderResponse;
import com.finprodb.backendjava.admin.dto.AdminSummaryResponse;
import com.finprodb.backendjava.order.Order;
import com.finprodb.backendjava.order.OrderApprovalStatus;
import com.finprodb.backendjava.order.OrderItem;
import com.finprodb.backendjava.order.OrderItemRepository;
import com.finprodb.backendjava.order.OrderRepository;
import com.finprodb.backendjava.order.OrderStatus;
import com.finprodb.backendjava.payment.PaymentTransaction;
import com.finprodb.backendjava.payment.PaymentTransactionRepository;
import com.finprodb.backendjava.security.SecurityUtils;
import com.finprodb.backendjava.user.User;
import com.finprodb.backendjava.user.Role;
import com.finprodb.backendjava.user.UserRepository;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.concurrent.ThreadLocalRandom;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AdminOrderService {
  private final OrderRepository orderRepository;
  private final OrderItemRepository orderItemRepository;
  private final PaymentTransactionRepository paymentTransactionRepository;
  private final UserRepository userRepository;

  public AdminOrderService(
      OrderRepository orderRepository,
      OrderItemRepository orderItemRepository,
      PaymentTransactionRepository paymentTransactionRepository,
      UserRepository userRepository) {
    this.orderRepository = orderRepository;
    this.orderItemRepository = orderItemRepository;
    this.paymentTransactionRepository = paymentTransactionRepository;
    this.userRepository = userRepository;
  }

  public Page<AdminOrderResponse> listOrders(Optional<OrderStatus> status, int page, int size) {
    Pageable pageable = PageRequest.of(Math.max(page, 0), Math.min(Math.max(size, 1), 100));

    Page<Order> ordersPage =
        status
            .map(s -> orderRepository.findByStatusOrderByCreatedAtDesc(s, pageable))
            .orElseGet(() -> orderRepository.findAllByOrderByCreatedAtDesc(pageable));

    return ordersPage.map(order -> toResponse(order, false));
  }

  public AdminOrderResponse getOrder(Long orderId) {
    Order order =
        orderRepository.findById(orderId).orElseThrow(() -> new IllegalArgumentException("Order not found"));
    return toResponse(order, true);
  }

  @Transactional
  public AdminOrderResponse approveOrder(Long orderId) {
    Order order =
        orderRepository.findById(orderId).orElseThrow(() -> new IllegalArgumentException("Order not found"));
    if (order.getStatus() != OrderStatus.PAID) {
      throw new IllegalArgumentException("Order is not ready for approval");
    }

    if (order.getApprovalStatus() == OrderApprovalStatus.APPROVED
        || order.getApprovalStatus() == OrderApprovalStatus.REJECTED) {
      throw new IllegalArgumentException("Order is already decided");
    }

    User admin = SecurityUtils.getCurrentUser();
    order.setApprovalStatus(OrderApprovalStatus.APPROVED);
    order.setApprovedAt(Instant.now());
    order.setRejectedAt(null);
    order.setApprovedBy(admin);

    if (order.getCourierPhone() == null || order.getCourierPhone().isBlank()) {
      order.setCourierPhone(generateCourierPhone());
    }
    if (order.getCourierPlate() == null || order.getCourierPlate().isBlank()) {
      order.setCourierPlate(generateCourierPlate());
    }

    // After admin approval, order is handed to courier (delivery started)
    order.setStatus(OrderStatus.DELIVERING);
    orderRepository.save(order);
    return toResponse(order, true);
  }

  @Transactional
  public AdminOrderResponse rejectOrder(Long orderId) {
    Order order =
        orderRepository.findById(orderId).orElseThrow(() -> new IllegalArgumentException("Order not found"));
    if (order.getStatus() != OrderStatus.PAID) {
      throw new IllegalArgumentException("Order is not ready for rejection");
    }

    if (order.getApprovalStatus() == OrderApprovalStatus.APPROVED
        || order.getApprovalStatus() == OrderApprovalStatus.REJECTED) {
      throw new IllegalArgumentException("Order is already decided");
    }

    User admin = SecurityUtils.getCurrentUser();
    order.setApprovalStatus(OrderApprovalStatus.REJECTED);
    order.setRejectedAt(Instant.now());
    order.setApprovedAt(null);
    order.setApprovedBy(admin);
    order.setStatus(OrderStatus.REJECTED);
    orderRepository.save(order);
    return toResponse(order, true);
  }

  @Transactional
  public AdminOrderResponse startDelivery(Long orderId) {
    Order order =
        orderRepository.findById(orderId).orElseThrow(() -> new IllegalArgumentException("Order not found"));
    if (order.getStatus() == OrderStatus.DELIVERING) {
      return toResponse(order, true);
    }

    if (order.getStatus() == OrderStatus.PAID
        && (order.getApprovalStatus() == null || order.getApprovalStatus() == OrderApprovalStatus.APPROVED)) {
      order.setStatus(OrderStatus.DELIVERING);
    } else {
      throw new IllegalArgumentException("Order is not ready for delivery");
    }

    if (order.getCourierPhone() == null || order.getCourierPhone().isBlank()) {
      order.setCourierPhone(generateCourierPhone());
    }
    if (order.getCourierPlate() == null || order.getCourierPlate().isBlank()) {
      order.setCourierPlate(generateCourierPlate());
    }

    orderRepository.save(order);
    return toResponse(order, true);
  }

  @Transactional
  public AdminOrderResponse markDelivered(Long orderId) {
    Order order =
        orderRepository.findById(orderId).orElseThrow(() -> new IllegalArgumentException("Order not found"));
    if (order.getStatus() != OrderStatus.DELIVERING) {
      throw new IllegalArgumentException("Order is not delivering");
    }
    order.setStatus(OrderStatus.DELIVERED);
    orderRepository.save(order);
    return toResponse(order, true);
  }

  public AdminSummaryResponse summary() {
    long totalOrders = orderRepository.count();
    long pending = orderRepository.countByStatus(OrderStatus.PENDING_PAYMENT);
    long paid = orderRepository.countByStatus(OrderStatus.PAID);
    long cancelled = orderRepository.countByStatus(OrderStatus.CANCELLED);
    BigDecimal paidRevenue = orderRepository.sumTotalAmountByStatus(OrderStatus.PAID);
    long totalUserRoleUser = userRepository.countByRole(Role.USER);

    return new AdminSummaryResponse(
        totalOrders,
        pending,
        paid,
        cancelled,
        paidRevenue,
        totalUserRoleUser);
  }

  private AdminOrderResponse toResponse(Order order, boolean includeItems) {
    String paymentStatus =
        paymentTransactionRepository
            .findTopByOrderOrderByCreatedAtDesc(order)
            .map(PaymentTransaction::getStatus)
            .map(Enum::name)
            .orElse(null);

    List<AdminOrderItemResponse> items = null;
    if (includeItems) {
      List<OrderItem> orderItems = orderItemRepository.findByOrder(order);
      items =
          orderItems.stream()
              .map(
                  it ->
                      new AdminOrderItemResponse(
                          it.getProduct().getId(),
                          it.getProduct().getName(),
                          it.getQuantity(),
                          it.getPrice(),
                          it.getSubtotal()))
              .collect(Collectors.toList());
    }

    OrderApprovalStatus approvalStatus =
        order.getApprovalStatus() != null ? order.getApprovalStatus() : OrderApprovalStatus.PENDING;
    Long approvedByUserId = order.getApprovedBy() != null ? order.getApprovedBy().getId() : null;
    String approvedByUsername = order.getApprovedBy() != null ? order.getApprovedBy().getUsername() : null;

    return new AdminOrderResponse(
        order.getId(),
        order.getOrderCode(),
        order.getStatus(),
        approvalStatus,
        order.getApprovedAt(),
        order.getRejectedAt(),
        approvedByUserId,
        approvedByUsername,
        order.getTotalAmount(),
        order.getCreatedAt(),
        order.getShippingAddress(),
        order.getShippingPhone(),
        order.getCourierPhone(),
        order.getCourierPlate(),
        order.getUser().getId(),
        order.getUser().getUsername(),
        order.getUser().getEmail(),
        paymentStatus,
        items);
  }

  private static String generateCourierPhone() {
    // Simple Indonesian-like mobile number
    long tail = ThreadLocalRandom.current().nextLong(100000000L, 999999999L);
    return "08" + tail;
  }

  private static String generateCourierPlate() {
    String[] regions = {"B", "D", "F", "L", "N"};
    String region = regions[ThreadLocalRandom.current().nextInt(regions.length)];
    int num = ThreadLocalRandom.current().nextInt(1000, 9999);
    char a = (char) ('A' + ThreadLocalRandom.current().nextInt(0, 26));
    char b = (char) ('A' + ThreadLocalRandom.current().nextInt(0, 26));
    return region + " " + num + " " + a + b;
  }
}
