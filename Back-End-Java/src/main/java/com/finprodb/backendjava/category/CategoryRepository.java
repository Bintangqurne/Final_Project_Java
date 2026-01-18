package com.finprodb.backendjava.category;

import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CategoryRepository extends JpaRepository<Category, Long> {
  Page<Category> findByIsDeletedFalse(Pageable pageable);

  Optional<Category> findByIdAndIsDeletedFalse(Long id);
}
