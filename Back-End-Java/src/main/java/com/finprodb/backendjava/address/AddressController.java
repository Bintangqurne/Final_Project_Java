package com.finprodb.backendjava.address;

import com.finprodb.backendjava.address.dto.AddressRequest;
import com.finprodb.backendjava.address.dto.AddressResponse;
import com.finprodb.backendjava.security.SecurityUtils;
import com.finprodb.backendjava.user.User;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/addresses")
public class AddressController {
  private final AddressService addressService;

  public AddressController(AddressService addressService) {
    this.addressService = addressService;
  }

  @GetMapping
  public ResponseEntity<List<AddressResponse>> list() {
    User user = SecurityUtils.getCurrentUser();
    return ResponseEntity.ok(addressService.list(user));
  }

  @PostMapping
  public ResponseEntity<AddressResponse> create(@RequestBody AddressRequest req) {
    User user = SecurityUtils.getCurrentUser();
    return ResponseEntity.ok(addressService.create(user, req));
  }

  @PutMapping("/{addressId}")
  public ResponseEntity<AddressResponse> update(
      @PathVariable Long addressId, @RequestBody AddressRequest req) {
    User user = SecurityUtils.getCurrentUser();
    return ResponseEntity.ok(addressService.update(user, addressId, req));
  }

  @DeleteMapping("/{addressId}")
  public ResponseEntity<Void> delete(@PathVariable Long addressId) {
    User user = SecurityUtils.getCurrentUser();
    addressService.delete(user, addressId);
    return ResponseEntity.noContent().build();
  }

  @PostMapping("/{addressId}/default")
  public ResponseEntity<AddressResponse> setDefault(@PathVariable Long addressId) {
    User user = SecurityUtils.getCurrentUser();
    return ResponseEntity.ok(addressService.setDefault(user, addressId));
  }
}
