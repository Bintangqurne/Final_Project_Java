package com.finprodb.backendjava.auth;

import com.finprodb.backendjava.auth.dto.AuthResponse;
import com.finprodb.backendjava.auth.dto.LoginRequest;
import com.finprodb.backendjava.auth.dto.RegisterRequest;
import com.finprodb.backendjava.security.JwtService;
import com.finprodb.backendjava.user.Role;
import com.finprodb.backendjava.user.User;
import com.finprodb.backendjava.user.UserRepository;
import java.util.Map;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {
  private final UserRepository userRepository;
  private final PasswordEncoder passwordEncoder;
  private final AuthenticationManager authenticationManager;
  private final JwtService jwtService;

  public AuthService(
      UserRepository userRepository,
      PasswordEncoder passwordEncoder,
      AuthenticationManager authenticationManager,
      JwtService jwtService) {
    this.userRepository = userRepository;
    this.passwordEncoder = passwordEncoder;
    this.authenticationManager = authenticationManager;
    this.jwtService = jwtService;
  }

  public AuthResponse register(RegisterRequest req) {
    if (userRepository.existsByUsername(req.getUsername())) {
      throw new IllegalArgumentException("Username already used");
    }
    if (userRepository.existsByEmail(req.getEmail())) {
      throw new IllegalArgumentException("Email already used");
    }

    User user = new User();
    user.setName(req.getName());
    user.setUsername(req.getUsername());
    user.setEmail(req.getEmail());
    user.setPasswordHash(passwordEncoder.encode(req.getPassword()));
    user.setRole(Role.USER);

    User saved = userRepository.save(user);

    String token =
        jwtService.generateToken(
            saved.getUsername(),
            Map.of("role", saved.getRole().name(), "userId", saved.getId()));

    return new AuthResponse(
        token,
        "Bearer",
        saved.getId(),
        saved.getName(),
        saved.getUsername(),
        saved.getEmail(),
        saved.getRole().name());
  }

  public AuthResponse login(LoginRequest req) {
    User user =
        userRepository
            .findByUsernameOrEmail(req.getIdentifier(), req.getIdentifier())
            .orElseThrow(() -> new IllegalArgumentException("Invalid credentials"));

    authenticationManager.authenticate(
        new UsernamePasswordAuthenticationToken(user.getUsername(), req.getPassword()));

    String token =
        jwtService.generateToken(
            user.getUsername(),
            Map.of("role", user.getRole().name(), "userId", user.getId()));

    return new AuthResponse(
        token,
        "Bearer",
        user.getId(),
        user.getName(),
        user.getUsername(),
        user.getEmail(),
        user.getRole().name());
  }
}
