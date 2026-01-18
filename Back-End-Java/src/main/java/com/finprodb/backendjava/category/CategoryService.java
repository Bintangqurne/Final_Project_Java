package com.finprodb.backendjava.category;

import com.finprodb.backendjava.category.dto.CategoryRequest;
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
public class CategoryService {
  private final CategoryRepository categoryRepository;

  public CategoryService(CategoryRepository categoryRepository) {
    this.categoryRepository = categoryRepository;
  }

  public Page<Category> listActive(int page, int size) {
    Pageable pageable = PageRequest.of(Math.max(page, 0), Math.min(Math.max(size, 1), 100));
    return categoryRepository.findByIsDeletedFalse(pageable);
  }

  public Page<Category> listAll(int page, int size) {
    Pageable pageable =
        PageRequest.of(
            Math.max(page, 0),
            Math.min(Math.max(size, 1), 100),
            Sort.by(Sort.Direction.DESC, "createdAt"));
    return categoryRepository.findByIsDeletedFalse(pageable);
  }

  public Optional<Category> findById(Long id) {
    return categoryRepository.findByIdAndIsDeletedFalse(id);
  }

  public Category create(CategoryRequest req) {
    Category category = new Category();
    category.setName(req.getName());
    category.setDescription(req.getDescription());
    return categoryRepository.save(category);
  }

  public Category update(Long id, CategoryRequest req) {
    Category category =
        categoryRepository
            .findByIdAndIsDeletedFalse(id)
            .orElseThrow(() -> new IllegalArgumentException("Category not found"));
    category.setName(req.getName());
    category.setDescription(req.getDescription());
    return categoryRepository.save(category);
  }

  public void delete(Long id) {
    Category category =
        categoryRepository
            .findByIdAndIsDeletedFalse(id)
            .orElseThrow(() -> new IllegalArgumentException("Category not found"));
    category.setIsDeleted(true);
    categoryRepository.save(category);
  }

  public Category uploadImage(Long categoryId, MultipartFile file) {
    if (file == null || file.isEmpty()) {
      throw new IllegalArgumentException("File is required");
    }

    String contentType = file.getContentType();
    if (contentType == null || !contentType.toLowerCase().startsWith("image/")) {
      throw new IllegalArgumentException("File must be an image");
    }

    Category category =
        categoryRepository
            .findByIdAndIsDeletedFalse(categoryId)
            .orElseThrow(() -> new IllegalArgumentException("Category not found"));

    String original = file.getOriginalFilename();
    String ext = "";
    if (original != null) {
      int dot = original.lastIndexOf('.');
      if (dot >= 0 && dot < original.length() - 1) {
        ext = original.substring(dot);
      }
    }

    Path dir = Paths.get("uploads", "categories");
    String filename = "category-" + categoryId + "-" + Instant.now().toEpochMilli() + ext;
    Path target = dir.resolve(filename);

    try {
      Files.createDirectories(dir);
      file.transferTo(target);
    } catch (IOException e) {
      throw new IllegalStateException("Failed to store file", e);
    }

    category.setImagePath("/uploads/categories/" + filename);
    return categoryRepository.save(category);
  }
}
