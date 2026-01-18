package com.finprodb.backendjava.order;

import com.finprodb.backendjava.order.dto.CheckoutResponse;
import com.finprodb.backendjava.order.dto.CheckoutRequest;
import com.finprodb.backendjava.order.dto.OrderItemResponse;
import com.finprodb.backendjava.order.dto.OrderResponse;
import com.finprodb.backendjava.security.SecurityUtils;
import com.finprodb.backendjava.user.User;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/orders")
public class OrderController {
  private final OrderService orderService;

  public OrderController(OrderService orderService) {
    this.orderService = orderService;
  }

  @PostMapping("/checkout")
  public ResponseEntity<CheckoutResponse> checkout(@RequestBody(required = false) CheckoutRequest req) {
    User user = SecurityUtils.getCurrentUser();
    Order order = orderService.checkout(user, req);
    List<OrderItemResponse> items =
        orderService.getItems(order).stream().map(OrderController::toItemResponse).collect(Collectors.toList());

    return ResponseEntity.ok(
        new CheckoutResponse(
            order.getId(),
            order.getOrderCode(),
            order.getStatus(),
            order.getTotalAmount(),
            order.getShippingAddress(),
            order.getShippingPhone(),
            items));
  }

  @GetMapping
  public ResponseEntity<List<OrderResponse>> list() {
    User user = SecurityUtils.getCurrentUser();
    List<OrderResponse> orders =
        orderService.listOrders(user).stream()
            .map(
                order ->
                    new OrderResponse(
                        order.getId(),
                        order.getOrderCode(),
                        order.getStatus(),
                        order.getTotalAmount(),
                        order.getShippingAddress(),
                        order.getShippingPhone(),
                        order.getCourierPhone(),
                        order.getCourierPlate(),
                        order.getCreatedAt(),
                        orderService.getItems(order).stream()
                            .map(OrderController::toItemResponse)
                            .collect(Collectors.toList())))
            .collect(Collectors.toList());

    return ResponseEntity.ok(orders);
  }

  @GetMapping("/by-code/{orderCode}")
  public ResponseEntity<OrderResponse> getByCode(@PathVariable String orderCode) {
    User user = SecurityUtils.getCurrentUser();
    Order order = orderService.getOrderByCode(user, orderCode);
    List<OrderItemResponse> items =
        orderService.getItems(order).stream().map(OrderController::toItemResponse).collect(Collectors.toList());

    return ResponseEntity.ok(
        new OrderResponse(
            order.getId(),
            order.getOrderCode(),
            order.getStatus(),
            order.getTotalAmount(),
            order.getShippingAddress(),
            order.getShippingPhone(),
            order.getCourierPhone(),
            order.getCourierPlate(),
            order.getCreatedAt(),
            items));
  }

  @GetMapping("/{orderId}")
  public ResponseEntity<OrderResponse> get(@PathVariable Long orderId) {
    User user = SecurityUtils.getCurrentUser();
    Order order = orderService.getOrder(user, orderId);
    List<OrderItemResponse> items =
        orderService.getItems(order).stream().map(OrderController::toItemResponse).collect(Collectors.toList());

    return ResponseEntity.ok(
        new OrderResponse(
            order.getId(),
            order.getOrderCode(),
            order.getStatus(),
            order.getTotalAmount(),
            order.getShippingAddress(),
            order.getShippingPhone(),
            order.getCourierPhone(),
            order.getCourierPlate(),
            order.getCreatedAt(),
            items));
  }

  @PostMapping("/{orderId}/confirm-received")
  public ResponseEntity<OrderResponse> confirmReceived(@PathVariable Long orderId) {
    User user = SecurityUtils.getCurrentUser();
    Order order = orderService.confirmReceived(user, orderId);
    List<OrderItemResponse> items =
        orderService.getItems(order).stream().map(OrderController::toItemResponse).collect(Collectors.toList());

    return ResponseEntity.ok(
        new OrderResponse(
            order.getId(),
            order.getOrderCode(),
            order.getStatus(),
            order.getTotalAmount(),
            order.getShippingAddress(),
            order.getShippingPhone(),
            order.getCourierPhone(),
            order.getCourierPlate(),
            order.getCreatedAt(),
            items));
  }

  private static OrderItemResponse toItemResponse(OrderItem item) {
    return new OrderItemResponse(
        item.getProduct().getId(),
        item.getProduct().getName(),
        item.getQuantity(),
        item.getPrice(),
        item.getSubtotal());
  }
}
