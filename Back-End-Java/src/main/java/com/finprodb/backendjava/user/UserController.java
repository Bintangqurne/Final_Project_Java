package com.finprodb.backendjava.user;

import com.finprodb.backendjava.security.SecurityUtils;
import com.finprodb.backendjava.security.UserPrincipal;
import com.finprodb.backendjava.user.dto.UpdateProfileRequest;
import java.util.Map;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class UserController {
  private final UserRepository userRepository;

  public UserController(UserRepository userRepository) {
    this.userRepository = userRepository;
  }

  @GetMapping("/me")
  public ResponseEntity<Map<String, Object>> me() {
    Authentication auth = SecurityContextHolder.getContext().getAuthentication();
    Object principal = auth != null ? auth.getPrincipal() : null;

    if (principal instanceof UserPrincipal userPrincipal) {
      User user = userPrincipal.getUser();
      return ResponseEntity.ok(
          Map.of(
              "id", user.getId(),
              "name", user.getName(),
              "username", user.getUsername(),
              "email", user.getEmail(),
              "role", user.getRole().name()));
    }

    return ResponseEntity.ok(Map.of("message", "No authenticated user"));
  }

  @PutMapping("/me")
  public ResponseEntity<Map<String, Object>> updateMe(@RequestBody(required = false) UpdateProfileRequest req) {
    if (req == null) {
      throw new IllegalArgumentException("Invalid request");
    }

    User user = SecurityUtils.getCurrentUser();

    if (req.getName() != null && !req.getName().isBlank()) {
      user.setName(req.getName());
    }

    if (req.getUsername() != null && !req.getUsername().isBlank()) {
      if (!req.getUsername().equals(user.getUsername()) && userRepository.existsByUsername(req.getUsername())) {
        throw new IllegalArgumentException("Username already used");
      }
      user.setUsername(req.getUsername());
    }

    if (req.getEmail() != null && !req.getEmail().isBlank()) {
      if (!req.getEmail().equals(user.getEmail()) && userRepository.existsByEmail(req.getEmail())) {
        throw new IllegalArgumentException("Email already used");
      }
      user.setEmail(req.getEmail());
    }

    User saved = userRepository.save(user);
    return ResponseEntity.ok(
        Map.of(
            "id", saved.getId(),
            "name", saved.getName(),
            "username", saved.getUsername(),
            "email", saved.getEmail(),
            "role", saved.getRole().name()));
  }
}
