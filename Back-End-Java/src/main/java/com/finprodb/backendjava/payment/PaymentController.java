package com.finprodb.backendjava.payment;

import com.finprodb.backendjava.payment.dto.SnapCreateResponse;
import com.finprodb.backendjava.security.SecurityUtils;
import com.finprodb.backendjava.user.User;
import java.util.Map;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {
  private final PaymentService paymentService;

  public PaymentController(PaymentService paymentService) {
    this.paymentService = paymentService;
  }

  @PostMapping("/midtrans/snap/{orderId}")
  public ResponseEntity<SnapCreateResponse> createSnap(@PathVariable Long orderId) {
    User user = SecurityUtils.getCurrentUser();
    return ResponseEntity.ok(paymentService.createSnap(user, orderId));
  }

  @PostMapping("/midtrans/notification")
  public ResponseEntity<Map<String, Object>> notification(@RequestBody Map<String, Object> body) {
    return ResponseEntity.ok(paymentService.handleMidtransNotification(body));
  }
}
