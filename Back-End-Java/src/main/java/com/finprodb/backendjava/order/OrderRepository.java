package com.finprodb.backendjava.order;

import com.finprodb.backendjava.user.User;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface OrderRepository extends JpaRepository<Order, Long> {
  List<Order> findByUserOrderByCreatedAtDesc(User user);

  Optional<Order> findByIdAndUser(Long id, User user);

  Optional<Order> findByOrderCodeAndUser(String orderCode, User user);

  Optional<Order> findByOrderCode(String orderCode);

  @EntityGraph(attributePaths = {"user"})
  Page<Order> findAllByOrderByCreatedAtDesc(Pageable pageable);

  @EntityGraph(attributePaths = {"user"})
  Page<Order> findByStatusOrderByCreatedAtDesc(OrderStatus status, Pageable pageable);

  long countByStatus(OrderStatus status);

  @Query("select coalesce(sum(o.totalAmount), 0) from Order o where o.status = :status")
  BigDecimal sumTotalAmountByStatus(@Param("status") OrderStatus status);
}
