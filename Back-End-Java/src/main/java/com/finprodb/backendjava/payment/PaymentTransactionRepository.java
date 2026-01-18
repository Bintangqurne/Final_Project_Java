package com.finprodb.backendjava.payment;

import com.finprodb.backendjava.order.Order;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PaymentTransactionRepository extends JpaRepository<PaymentTransaction, Long> {
  Optional<PaymentTransaction> findTopByOrderOrderByCreatedAtDesc(Order order);
}
