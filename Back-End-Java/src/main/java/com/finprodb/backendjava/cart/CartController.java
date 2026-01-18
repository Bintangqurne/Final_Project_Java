package com.finprodb.backendjava.cart;

import com.finprodb.backendjava.cart.dto.CartItemResponse;
import com.finprodb.backendjava.cart.dto.AddCartItemRequest;
import com.finprodb.backendjava.cart.dto.UpdateCartItemRequest;
import com.finprodb.backendjava.security.SecurityUtils;
import com.finprodb.backendjava.user.User;
import jakarta.validation.Valid;
import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/cart")
public class CartController {
  private final CartService cartService;

  public CartController(CartService cartService) {
    this.cartService = cartService;
  }

  @GetMapping
  public ResponseEntity<List<CartItemResponse>> getCart() {
    User user = SecurityUtils.getCurrentUser();
    List<CartItemResponse> items =
        cartService.getCart(user).stream().map(CartController::toResponse).collect(Collectors.toList());
    return ResponseEntity.ok(items);
  }

  @PostMapping("/items")
  public ResponseEntity<CartItemResponse> addItem(@Valid @RequestBody AddCartItemRequest req) {
    User user = SecurityUtils.getCurrentUser();
    return ResponseEntity.ok(toResponse(cartService.addItem(user, req.getProductId(), req.getQuantity())));
  }

  @PatchMapping("/items/{cartItemId}")
  public ResponseEntity<CartItemResponse> updateQty(
      @PathVariable Long cartItemId, @Valid @RequestBody UpdateCartItemRequest req) {
    User user = SecurityUtils.getCurrentUser();
    return ResponseEntity.ok(toResponse(cartService.updateQuantity(user, cartItemId, req.getQuantity())));
  }

  @DeleteMapping("/items/{cartItemId}")
  public ResponseEntity<Void> remove(@PathVariable Long cartItemId) {
    User user = SecurityUtils.getCurrentUser();
    cartService.removeItem(user, cartItemId);
    return ResponseEntity.noContent().build();
  }

  @DeleteMapping
  public ResponseEntity<Void> clear() {
    User user = SecurityUtils.getCurrentUser();
    cartService.clear(user);
    return ResponseEntity.noContent().build();
  }

  private static CartItemResponse toResponse(CartItem item) {
    BigDecimal price = item.getProduct().getPrice();
    BigDecimal subtotal = price.multiply(BigDecimal.valueOf(item.getQuantity()));
    return new CartItemResponse(
        item.getId(),
        item.getProduct().getId(),
        item.getProduct().getName(),
        price,
        item.getQuantity(),
        subtotal);
  }
}
