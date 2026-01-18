package com.finprodb.backendjava.address;

import com.finprodb.backendjava.user.User;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface AddressRepository extends JpaRepository<Address, Long> {
  List<Address> findByUserOrderByCreatedAtDesc(User user);

  Optional<Address> findFirstByUserAndIsDefaultTrue(User user);

  Optional<Address> findByIdAndUser(Long id, User user);

  long countByUser(User user);

  @Modifying
  @Query("update Address a set a.isDefault = false where a.user = :user and a.id <> :id")
  int unsetDefaultOtherThan(@Param("user") User user, @Param("id") Long id);

  @Modifying
  @Query("update Address a set a.isDefault = false where a.user = :user")
  int unsetAllDefault(@Param("user") User user);
}
