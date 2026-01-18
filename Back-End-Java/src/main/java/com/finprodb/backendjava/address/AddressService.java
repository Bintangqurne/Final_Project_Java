package com.finprodb.backendjava.address;

import com.finprodb.backendjava.address.dto.AddressRequest;
import com.finprodb.backendjava.address.dto.AddressResponse;
import com.finprodb.backendjava.user.User;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AddressService {
  private final AddressRepository addressRepository;

  public AddressService(AddressRepository addressRepository) {
    this.addressRepository = addressRepository;
  }

  public List<AddressResponse> list(User user) {
    return addressRepository.findByUserOrderByCreatedAtDesc(user).stream().map(AddressService::toResponse).toList();
  }

  @Transactional
  public AddressResponse create(User user, AddressRequest req) {
    if (req == null) {
      throw new IllegalArgumentException("Invalid request");
    }
    if (req.getLabel() == null || req.getLabel().isBlank()) {
      throw new IllegalArgumentException("Label is required");
    }
    if (req.getAddressLine() == null || req.getAddressLine().isBlank()) {
      throw new IllegalArgumentException("Address is required");
    }
    if (req.getPhone() == null || req.getPhone().isBlank()) {
      throw new IllegalArgumentException("Phone is required");
    }

    boolean firstAddress = addressRepository.countByUser(user) == 0;
    boolean makeDefault = Boolean.TRUE.equals(req.getIsDefault()) || firstAddress;

    Address address = new Address();
    address.setUser(user);
    address.setLabel(req.getLabel());
    address.setRecipientName(req.getRecipientName());
    address.setAddressLine(req.getAddressLine());
    address.setPhone(req.getPhone());
    address.setIsDefault(makeDefault);

    Address saved = addressRepository.save(address);

    if (makeDefault) {
      addressRepository.unsetDefaultOtherThan(user, saved.getId());
    }

    return toResponse(saved);
  }

  @Transactional
  public AddressResponse update(User user, Long addressId, AddressRequest req) {
    Address address =
        addressRepository
            .findByIdAndUser(addressId, user)
            .orElseThrow(() -> new IllegalArgumentException("Address not found"));

    if (req.getLabel() != null && !req.getLabel().isBlank()) {
      address.setLabel(req.getLabel());
    }
    if (req.getRecipientName() != null) {
      address.setRecipientName(req.getRecipientName());
    }
    if (req.getAddressLine() != null && !req.getAddressLine().isBlank()) {
      address.setAddressLine(req.getAddressLine());
    }
    if (req.getPhone() != null && !req.getPhone().isBlank()) {
      address.setPhone(req.getPhone());
    }

    if (Boolean.TRUE.equals(req.getIsDefault())) {
      address.setIsDefault(true);
      addressRepository.unsetDefaultOtherThan(user, address.getId());
    }

    Address saved = addressRepository.save(address);
    return toResponse(saved);
  }

  @Transactional
  public void delete(User user, Long addressId) {
    Address address =
        addressRepository
            .findByIdAndUser(addressId, user)
            .orElseThrow(() -> new IllegalArgumentException("Address not found"));

    boolean wasDefault = Boolean.TRUE.equals(address.getIsDefault());
    addressRepository.delete(address);

    if (wasDefault) {
      addressRepository
          .findByUserOrderByCreatedAtDesc(user)
          .stream()
          .findFirst()
          .ifPresent(
              a -> {
                a.setIsDefault(true);
                addressRepository.save(a);
                addressRepository.unsetDefaultOtherThan(user, a.getId());
              });
    }
  }

  @Transactional
  public AddressResponse setDefault(User user, Long addressId) {
    Address address =
        addressRepository
            .findByIdAndUser(addressId, user)
            .orElseThrow(() -> new IllegalArgumentException("Address not found"));

    address.setIsDefault(true);
    Address saved = addressRepository.save(address);
    addressRepository.unsetDefaultOtherThan(user, saved.getId());
    return toResponse(saved);
  }

  private static AddressResponse toResponse(Address address) {
    return new AddressResponse(
        address.getId(),
        address.getLabel(),
        address.getRecipientName(),
        address.getAddressLine(),
        address.getPhone(),
        address.getIsDefault() != null ? address.getIsDefault() : false,
        address.getCreatedAt(),
        address.getUpdatedAt());
  }
}
