package com.finprodb.backendjava.cart;

import com.finprodb.backendjava.product.Product;
import com.finprodb.backendjava.product.ProductRepository;
import com.finprodb.backendjava.user.User;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CartService {
  private final CartItemRepository cartItemRepository;
  private final ProductRepository productRepository;

  public CartService(CartItemRepository cartItemRepository, ProductRepository productRepository) {
    this.cartItemRepository = cartItemRepository;
    this.productRepository = productRepository;
  }

  public List<CartItem> getCart(User user) {
    return cartItemRepository.findByUser(user);
  }

  @Transactional
  public CartItem addItem(User user, Long productId, int quantity) {
    Product product =
        productRepository
            .findById(productId)
            .orElseThrow(() -> new IllegalArgumentException("Product not found"));

    if (product.getActive() == null || !product.getActive()) {
      throw new IllegalArgumentException("Product is inactive");
    }

    CartItem item =
        cartItemRepository
            .findByUserAndProduct(user, product)
            .orElseGet(
                () -> {
                  CartItem newItem = new CartItem();
                  newItem.setUser(user);
                  newItem.setProduct(product);
                  newItem.setQuantity(0);
                  return newItem;
                });

    item.setQuantity(item.getQuantity() + quantity);
    return cartItemRepository.save(item);
  }

  @Transactional
  public CartItem updateQuantity(User user, Long cartItemId, int quantity) {
    CartItem item =
        cartItemRepository
            .findById(cartItemId)
            .orElseThrow(() -> new IllegalArgumentException("Cart item not found"));

    if (!item.getUser().getId().equals(user.getId())) {
      throw new IllegalArgumentException("Forbidden");
    }

    item.setQuantity(quantity);
    return cartItemRepository.save(item);
  }

  @Transactional
  public void removeItem(User user, Long cartItemId) {
    CartItem item =
        cartItemRepository
            .findById(cartItemId)
            .orElseThrow(() -> new IllegalArgumentException("Cart item not found"));

    if (!item.getUser().getId().equals(user.getId())) {
      throw new IllegalArgumentException("Forbidden");
    }

    cartItemRepository.delete(item);
  }

  @Transactional
  public void clear(User user) {
    cartItemRepository.deleteByUser(user);
  }
}
