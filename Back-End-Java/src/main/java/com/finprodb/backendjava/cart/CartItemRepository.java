package com.finprodb.backendjava.cart;

import com.finprodb.backendjava.product.Product;
import com.finprodb.backendjava.user.User;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CartItemRepository extends JpaRepository<CartItem, Long> {
  @EntityGraph(attributePaths = {"product"})
  List<CartItem> findByUser(User user);

  Optional<CartItem> findByUserAndProduct(User user, Product product);

  void deleteByUser(User user);
}
