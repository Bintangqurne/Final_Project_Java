package com.finprodb.backendjava.admin;

import com.finprodb.backendjava.admin.dto.AdminOrderResponse;
import com.finprodb.backendjava.admin.dto.AdminSummaryResponse;
import com.finprodb.backendjava.order.OrderStatus;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminOrderController {
  private final AdminOrderService adminOrderService;

  public AdminOrderController(AdminOrderService adminOrderService) {
    this.adminOrderService = adminOrderService;
  }

  @GetMapping("/orders")
  public ResponseEntity<Page<AdminOrderResponse>> listOrders(
      @RequestParam(defaultValue = "0") int page,
      @RequestParam(defaultValue = "10") int size,
      @RequestParam(required = false) OrderStatus status) {
    return ResponseEntity.ok(adminOrderService.listOrders(Optional.ofNullable(status), page, size));
  }

  @GetMapping("/orders/{orderId}")
  public ResponseEntity<AdminOrderResponse> getOrder(@PathVariable Long orderId) {
    return ResponseEntity.ok(adminOrderService.getOrder(orderId));
  }

  @PostMapping("/orders/{orderId}/approve")
  public ResponseEntity<AdminOrderResponse> approveOrder(@PathVariable Long orderId) {
    return ResponseEntity.ok(adminOrderService.approveOrder(orderId));
  }

  @PostMapping("/orders/{orderId}/reject")
  public ResponseEntity<AdminOrderResponse> rejectOrder(@PathVariable Long orderId) {
    return ResponseEntity.ok(adminOrderService.rejectOrder(orderId));
  }

  @PostMapping("/orders/{orderId}/deliver")
  public ResponseEntity<AdminOrderResponse> startDelivery(@PathVariable Long orderId) {
    return ResponseEntity.ok(adminOrderService.startDelivery(orderId));
  }

  @PostMapping("/orders/{orderId}/delivered")
  public ResponseEntity<AdminOrderResponse> markDelivered(@PathVariable Long orderId) {
    return ResponseEntity.ok(adminOrderService.markDelivered(orderId));
  }

  @GetMapping("/summary")
  public ResponseEntity<AdminSummaryResponse> summary() {
    return ResponseEntity.ok(adminOrderService.summary());
  }
}
