package com.finprodb.backendjava.order;

import com.finprodb.backendjava.address.Address;
import com.finprodb.backendjava.address.AddressRepository;
import com.finprodb.backendjava.cart.CartItem;
import com.finprodb.backendjava.cart.CartItemRepository;
import com.finprodb.backendjava.order.dto.CheckoutRequest;
import com.finprodb.backendjava.user.User;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class OrderService {
  private final OrderRepository orderRepository;
  private final OrderItemRepository orderItemRepository;
  private final CartItemRepository cartItemRepository;
  private final AddressRepository addressRepository;

  public OrderService(
      OrderRepository orderRepository,
      OrderItemRepository orderItemRepository,
      CartItemRepository cartItemRepository,
      AddressRepository addressRepository) {
    this.orderRepository = orderRepository;
    this.orderItemRepository = orderItemRepository;
    this.cartItemRepository = cartItemRepository;
    this.addressRepository = addressRepository;
  }

  @Transactional
  public Order checkout(User user, CheckoutRequest req) {
    List<CartItem> cartItems = cartItemRepository.findByUser(user);
    if (cartItems.isEmpty()) {
      throw new IllegalArgumentException("Cart is empty");
    }

    Order order = new Order();
    order.setUser(user);
    order.setStatus(OrderStatus.PENDING_PAYMENT);
    order.setOrderCode(generateOrderCode());
    order.setTotalAmount(BigDecimal.ZERO);

    if (req != null) {
      Address selected = null;
      if (req.getAddressId() != null) {
        selected =
            addressRepository
                .findByIdAndUser(req.getAddressId(), user)
                .orElseThrow(() -> new IllegalArgumentException("Address not found"));
      } else {
        selected = addressRepository.findFirstByUserAndIsDefaultTrue(user).orElse(null);
      }

      if (selected != null) {
        order.setShippingAddress(selected.getAddressLine());
        order.setShippingPhone(selected.getPhone());
      } else {
        order.setShippingAddress(req.getShippingAddress());
        order.setShippingPhone(req.getShippingPhone());
      }
    }

    Order savedOrder = orderRepository.save(order);

    BigDecimal total = BigDecimal.ZERO;
    for (CartItem cartItem : cartItems) {
      if (cartItem.getProduct().getActive() == null || !cartItem.getProduct().getActive()) {
        throw new IllegalArgumentException("Some product is inactive");
      }

      BigDecimal price = cartItem.getProduct().getPrice();
      BigDecimal subtotal = price.multiply(BigDecimal.valueOf(cartItem.getQuantity()));

      OrderItem item = new OrderItem();
      item.setOrder(savedOrder);
      item.setProduct(cartItem.getProduct());
      item.setQuantity(cartItem.getQuantity());
      item.setPrice(price);
      item.setSubtotal(subtotal);

      orderItemRepository.save(item);
      total = total.add(subtotal);
    }

    savedOrder.setTotalAmount(total);
    Order updated = orderRepository.save(savedOrder);

    cartItemRepository.deleteByUser(user);
    return updated;
  }

  @Transactional
  public Order checkout(User user) {
    return checkout(user, null);
  }

  public List<Order> listOrders(User user) {
    return orderRepository.findByUserOrderByCreatedAtDesc(user);
  }

  public Order getOrder(User user, Long orderId) {
    return orderRepository
        .findByIdAndUser(orderId, user)
        .orElseThrow(() -> new IllegalArgumentException("Order not found"));
  }

  public Order getOrderByCode(User user, String orderCode) {
    return orderRepository
        .findByOrderCodeAndUser(orderCode, user)
        .orElseThrow(() -> new IllegalArgumentException("Order not found"));
  }

  @Transactional
  public Order confirmReceived(User user, Long orderId) {
    Order order = getOrder(user, orderId);
    if (order.getStatus() != OrderStatus.DELIVERED) {
      throw new IllegalArgumentException("Order is not delivered yet");
    }
    order.setStatus(OrderStatus.COMPLETED);
    return orderRepository.save(order);
  }

  public List<OrderItem> getItems(Order order) {
    return orderItemRepository.findByOrder(order);
  }

  public Order getByOrderCode(String orderCode) {
    return orderRepository
        .findByOrderCode(orderCode)
        .orElseThrow(() -> new IllegalArgumentException("Order not found"));
  }

  private static String generateOrderCode() {
    String suffix = UUID.randomUUID().toString().replace("-", "").substring(0, 10);
    return "ORD-" + Instant.now().toEpochMilli() + "-" + suffix;
  }
}
