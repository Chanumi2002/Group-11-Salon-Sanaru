package com.sanaru.backend.service.impl;

import com.sanaru.backend.dto.CategoryRequest;
import com.sanaru.backend.dto.CategoryResponse;
import com.sanaru.backend.model.Category;
import com.sanaru.backend.repository.CategoryRepository;
import com.sanaru.backend.service.CategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CategoryServiceImpl implements CategoryService {

    private final CategoryRepository categoryRepository;

    @Value("${app.upload.dir:uploads/categories}")
    private String uploadDir;

    @Override
    public CategoryResponse createCategory(CategoryRequest request, MultipartFile imageFile) throws IOException {
        if (categoryRepository.existsByName(request.getName())) {
            throw new RuntimeException("Category already exists");
        }

        Category category = new Category();
        category.setName(request.getName());

        // ✅ handle image upload
        if (imageFile != null && !imageFile.isEmpty()) {
            Path uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }
            String fileName = System.currentTimeMillis() + "_" + imageFile.getOriginalFilename().replaceAll("\\s+", "_");
            Path filePath = uploadPath.resolve(fileName).normalize();
            imageFile.transferTo(filePath.toFile());
            category.setImagePath(filePath.toString());
        }

        Category saved = categoryRepository.save(category);
        return mapToResponse(saved);
    }

    @Override
    public List<CategoryResponse> getAllCategories() {
        return categoryRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public CategoryResponse getCategoryById(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Category not found"));
        return mapToResponse(category);
    }

    @Override
    public CategoryResponse updateCategory(Long id, CategoryRequest request, MultipartFile imageFile) throws IOException {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Category not found"));
        category.setName(request.getName());

        // ✅ handle updating image
        if (imageFile != null && !imageFile.isEmpty()) {
            Path uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }
            String fileName = System.currentTimeMillis() + "_" + imageFile.getOriginalFilename().replaceAll("\\s+", "_");
            Path filePath = uploadPath.resolve(fileName).normalize();
            imageFile.transferTo(filePath.toFile());
            category.setImagePath(filePath.toString());
        }

        Category updated = categoryRepository.save(category);
        return mapToResponse(updated);
    }

    @Override
    public void deleteCategory(Long id) {
        categoryRepository.deleteById(id);
    }

    private CategoryResponse mapToResponse(Category category) {
        CategoryResponse response = new CategoryResponse();
        response.setId(category.getId());
        response.setName(category.getName());
        response.setImagePath(category.getImagePath()); // include image path
        return response;
    }
}