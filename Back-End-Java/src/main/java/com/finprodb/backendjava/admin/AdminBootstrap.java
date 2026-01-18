package com.finprodb.backendjava.admin;

import com.finprodb.backendjava.user.Role;
import com.finprodb.backendjava.user.User;
import com.finprodb.backendjava.user.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class AdminBootstrap implements ApplicationRunner {
  private final UserRepository userRepository;
  private final PasswordEncoder passwordEncoder;

  private final boolean enabled;
  private final String username;
  private final String email;
  private final String name;
  private final String password;

  public AdminBootstrap(
      UserRepository userRepository,
      PasswordEncoder passwordEncoder,
      @Value("${app.admin.bootstrap-enabled:false}") boolean enabled,
      @Value("${app.admin.username:admin}") String username,
      @Value("${app.admin.email:admin@mail.com}") String email,
      @Value("${app.admin.name:Admin}") String name,
      @Value("${app.admin.password:admin12345}") String password) {
    this.userRepository = userRepository;
    this.passwordEncoder = passwordEncoder;
    this.enabled = enabled;
    this.username = username;
    this.email = email;
    this.name = name;
    this.password = password;
  }

  @Override
  public void run(ApplicationArguments args) {
    if (!enabled) {
      return;
    }

    if (userRepository.existsByUsername(username) || userRepository.existsByEmail(email)) {
      return;
    }

    User admin = new User();
    admin.setName(name);
    admin.setUsername(username);
    admin.setEmail(email);
    admin.setPasswordHash(passwordEncoder.encode(password));
    admin.setRole(Role.ADMIN);

    userRepository.save(admin);
  }
}
