package com.finprodb.backendjava.security;

import com.finprodb.backendjava.user.User;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

public final class SecurityUtils {
  private SecurityUtils() {}

  public static User getCurrentUser() {
    Authentication auth = SecurityContextHolder.getContext().getAuthentication();
    if (auth == null) {
      throw new IllegalStateException("Unauthenticated");
    }

    Object principal = auth.getPrincipal();
    if (principal instanceof UserPrincipal userPrincipal) {
      return userPrincipal.getUser();
    }

    throw new IllegalStateException("Unauthenticated");
  }
}
