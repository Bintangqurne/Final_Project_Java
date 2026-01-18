package com.finprodb.backendjava.product;

import com.finprodb.backendjava.category.Category;
import com.finprodb.backendjava.category.CategoryRepository;
import com.finprodb.backendjava.product.dto.ProductRequest;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.Instant;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
public class ProductService {
  private final ProductRepository productRepository;
  private final CategoryRepository categoryRepository;

  public ProductService(ProductRepository productRepository, CategoryRepository categoryRepository) {
    this.productRepository = productRepository;
    this.categoryRepository = categoryRepository;
  }

  public Page<Product> listActive(int page, int size) {
    return listActive(page, size, null, null);
  }

  public Page<Product> listActive(int page, int size, String q, Long categoryId) {
    Pageable pageable = PageRequest.of(Math.max(page, 0), Math.min(Math.max(size, 1), 100));
    String query = q != null ? q.trim() : null;
    if (query != null && query.isBlank()) {
      query = null;
    }

    if (categoryId != null && query != null) {
      return productRepository
          .findByActiveTrueAndDeletedAtIsNullAndCategory_IdAndNameContainingIgnoreCase(
              categoryId, query, pageable);
    }
    if (categoryId != null) {
      return productRepository.findByActiveTrueAndDeletedAtIsNullAndCategory_Id(categoryId, pageable);
    }
    if (query != null) {
      return productRepository.findByActiveTrueAndDeletedAtIsNullAndNameContainingIgnoreCase(query, pageable);
    }
    return productRepository.findByActiveTrueAndDeletedAtIsNull(pageable);
  }

  public Page<Product> listAll(int page, int size) {
    Pageable pageable =
        PageRequest.of(
            Math.max(page, 0),
            Math.min(Math.max(size, 1), 100),
            Sort.by(Sort.Direction.DESC, "createdAt"));
    return productRepository.findByDeletedAtIsNull(pageable);
  }

  public Optional<Product> findById(Long id) {
    return productRepository.findByIdAndDeletedAtIsNull(id);
  }

  public Product create(ProductRequest req) {
    Product product = new Product();
    product.setName(req.getName());
    product.setDescription(req.getDescription());
    product.setPrice(req.getPrice());
    product.setStock(req.getStock());
    if (req.getActive() != null) {
      product.setActive(req.getActive());
    }

    if (req.getCategoryId() != null) {
      Category category =
          categoryRepository
              .findByIdAndIsDeletedFalse(req.getCategoryId())
              .orElseThrow(() -> new IllegalArgumentException("Category not found"));
      product.setCategory(category);
    } else {
      product.setCategory(null);
    }
    return productRepository.save(product);
  }

  public Product update(Long id, ProductRequest req) {
    Product product =
        productRepository
            .findByIdAndDeletedAtIsNull(id)
            .orElseThrow(() -> new IllegalArgumentException("Product not found"));
    product.setName(req.getName());
    product.setDescription(req.getDescription());
    product.setPrice(req.getPrice());
    product.setStock(req.getStock());
    if (req.getActive() != null) {
      product.setActive(req.getActive());
    }

    if (req.getCategoryId() != null) {
      Category category =
          categoryRepository
              .findByIdAndIsDeletedFalse(req.getCategoryId())
              .orElseThrow(() -> new IllegalArgumentException("Category not found"));
      product.setCategory(category);
    } else {
      product.setCategory(null);
    }
    return productRepository.save(product);
  }

  public void delete(Long id) {
    Product product =
        productRepository
            .findByIdAndDeletedAtIsNull(id)
            .orElseThrow(() -> new IllegalArgumentException("Product not found"));
    product.setDeletedAt(Instant.now());
    productRepository.save(product);
  }

  public Product uploadImage(Long productId, MultipartFile file) {
    if (file == null || file.isEmpty()) {
      throw new IllegalArgumentException("File is required");
    }

    String contentType = file.getContentType();
    if (contentType == null || !contentType.toLowerCase().startsWith("image/")) {
      throw new IllegalArgumentException("File must be an image");
    }

    Product product =
        productRepository
            .findByIdAndDeletedAtIsNull(productId)
            .orElseThrow(() -> new IllegalArgumentException("Product not found"));

    String original = file.getOriginalFilename();
    String ext = "";
    if (original != null) {
      int dot = original.lastIndexOf('.');
      if (dot >= 0 && dot < original.length() - 1) {
        ext = original.substring(dot);
      }
    }

    Path dir = Paths.get("uploads", "products");
    String filename = "product-" + productId + "-" + Instant.now().toEpochMilli() + ext;
    Path target = dir.resolve(filename);

    try {
      Files.createDirectories(dir);
      file.transferTo(target);
    } catch (IOException e) {
      throw new IllegalStateException("Failed to store file", e);
    }

    product.setImagePath("/uploads/products/" + filename);
    return productRepository.save(product);
  }
}
