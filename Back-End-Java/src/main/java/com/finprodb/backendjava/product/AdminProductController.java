package com.finprodb.backendjava.product;

import com.finprodb.backendjava.product.dto.ProductRequest;
import com.finprodb.backendjava.product.dto.ProductResponse;
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
@RequestMapping("/api/admin/products")
@PreAuthorize("permitAll()")
public class AdminProductController {
  private final ProductService productService;

  public AdminProductController(ProductService productService) {
    this.productService = productService;
  }

  @GetMapping
  public ResponseEntity<Page<ProductResponse>> list(
      @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "10") int size) {
    return ResponseEntity.ok(productService.listAll(page, size).map(ProductResponse::from));
  }

  @GetMapping("/{id}")
  public ResponseEntity<?> getById(@PathVariable Long id) {
    return productService
        .findById(id)
        .<ResponseEntity<?>>map(p -> ResponseEntity.ok(ProductResponse.from(p)))
        .orElseGet(() -> ResponseEntity.status(404).body(Map.of("message", "Product not found")));
  }

  @PostMapping
  public ResponseEntity<ProductResponse> create(@Valid @RequestBody ProductRequest req) {
    return ResponseEntity.ok(ProductResponse.from(productService.create(req)));
  }

  @PutMapping("/{id}")
  public ResponseEntity<ProductResponse> update(
      @PathVariable Long id, @Valid @RequestBody ProductRequest req) {
    return ResponseEntity.ok(ProductResponse.from(productService.update(id, req)));
  }

  @PostMapping(path = "/{id}/image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
  public ResponseEntity<ProductResponse> uploadImage(
      @PathVariable Long id, @RequestPart("file") MultipartFile file) {
    return ResponseEntity.ok(ProductResponse.from(productService.uploadImage(id, file)));
  }

  @DeleteMapping("/{id}")
  public ResponseEntity<?> delete(@PathVariable Long id) {
    if (productService.findById(id).isEmpty()) {
      return ResponseEntity.status(404).body(Map.of("message", "Product not found"));
    }

    productService.delete(id);
    return ResponseEntity.noContent().build();
  }
}
