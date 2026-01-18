package com.finprodb.backendjava.category;

import com.finprodb.backendjava.category.dto.CategoryRequest;
import jakarta.validation.Valid;
import java.util.Map;
import org.springframework.data.domain.Page;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/admin/categories")
@PreAuthorize("hasRole('ADMIN')")
public class AdminCategoryController {
  private final CategoryService categoryService;

  public AdminCategoryController(CategoryService categoryService) {
    this.categoryService = categoryService;
  }

  @GetMapping
  public ResponseEntity<Page<Category>> list(
      @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "10") int size) {
    return ResponseEntity.ok(categoryService.listAll(page, size));
  }

  @GetMapping("/{id}")
  public ResponseEntity<?> getById(@PathVariable Long id) {
    return categoryService
        .findById(id)
        .<ResponseEntity<?>>map(ResponseEntity::ok)
        .orElseGet(() -> ResponseEntity.status(404).body(Map.of("message", "Category not found")));
  }

  @PostMapping
  public ResponseEntity<Category> create(@Valid @RequestBody CategoryRequest req) {
    return ResponseEntity.ok(categoryService.create(req));
  }

  @PutMapping("/{id}")
  public ResponseEntity<Category> update(@PathVariable Long id, @Valid @RequestBody CategoryRequest req) {
    return ResponseEntity.ok(categoryService.update(id, req));
  }

  @PostMapping(path = "/{id}/image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
  public ResponseEntity<Category> uploadImage(
      @PathVariable Long id, @RequestPart("file") MultipartFile file) {
    return ResponseEntity.ok(categoryService.uploadImage(id, file));
  }

  @DeleteMapping("/{id}")
  public ResponseEntity<?> delete(@PathVariable Long id) {
    if (categoryService.findById(id).isEmpty()) {
      return ResponseEntity.status(404).body(Map.of("message", "Category not found"));
    }

    categoryService.delete(id);
    return ResponseEntity.noContent().build();
  }
}
