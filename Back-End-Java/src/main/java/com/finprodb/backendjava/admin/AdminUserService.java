package com.finprodb.backendjava.admin;

import com.finprodb.backendjava.admin.dto.AdminUserResponse;
import com.finprodb.backendjava.user.User;
import com.finprodb.backendjava.user.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
public class AdminUserService {
  private final UserRepository userRepository;

  public AdminUserService(UserRepository userRepository) {
    this.userRepository = userRepository;
  }

  public Page<AdminUserResponse> listUsers(int page, int size) {
    Pageable pageable = PageRequest.of(Math.max(page, 0), Math.min(Math.max(size, 1), 100));
    return userRepository.findAll(pageable).map(this::toResponse);
  }

  private AdminUserResponse toResponse(User user) {
    return new AdminUserResponse(
        user.getId(),
        user.getName(),
        user.getUsername(),
        user.getEmail(),
        user.getRole() != null ? user.getRole().name() : null);
  }
}
