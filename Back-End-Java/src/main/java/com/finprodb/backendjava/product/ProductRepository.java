package com.finprodb.backendjava.product;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ProductRepository extends JpaRepository<Product, Long> {
  Page<Product> findByActiveTrueAndDeletedAtIsNull(Pageable pageable);

  Page<Product> findByActiveTrueAndDeletedAtIsNullAndNameContainingIgnoreCase(
      String name, Pageable pageable);

  Page<Product> findByActiveTrueAndDeletedAtIsNullAndCategory_Id(Long categoryId, Pageable pageable);

  Page<Product> findByActiveTrueAndDeletedAtIsNullAndCategory_IdAndNameContainingIgnoreCase(
      Long categoryId, String name, Pageable pageable);

  Page<Product> findByDeletedAtIsNull(Pageable pageable);

  Optional<Product> findByIdAndDeletedAtIsNull(Long id);
}
