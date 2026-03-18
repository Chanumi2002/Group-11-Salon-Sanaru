package com.sanaru.backend.controller;

import com.sanaru.backend.dto.CategoryRequest;
import com.sanaru.backend.dto.CategoryResponse;
import com.sanaru.backend.service.CategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/admin/categories")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService categoryService;

    //  Create category with image
    @PostMapping(consumes = {"multipart/form-data"})
    public ResponseEntity<CategoryResponse> createCategory(
            @RequestParam("name") String name,
            @RequestParam(value = "image", required = false) MultipartFile imageFile
    ) throws IOException {
        CategoryRequest request = new CategoryRequest();
        request.setName(name);
        return ResponseEntity.ok(categoryService.createCategory(request, imageFile));
    }

    //  Get all categories
    @GetMapping
    public ResponseEntity<List<CategoryResponse>> getAllCategories() {
        return ResponseEntity.ok(categoryService.getAllCategories());
    }

    //  Get category by id
    @GetMapping("/{id}")
    public ResponseEntity<CategoryResponse> getCategory(@PathVariable Long id) {
        return ResponseEntity.ok(categoryService.getCategoryById(id));
    }

    //  Update category with optional image
    @PutMapping(value = "/{id}", consumes = {"multipart/form-data"})
    public ResponseEntity<CategoryResponse> updateCategory(
            @PathVariable Long id,
            @RequestParam("name") String name,
            @RequestParam(value = "image", required = false) MultipartFile imageFile
    ) throws IOException {
        CategoryRequest request = new CategoryRequest();
        request.setName(name);
        return ResponseEntity.ok(categoryService.updateCategory(id, request, imageFile));
    }

    //  Delete category
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteCategory(@PathVariable Long id) {
        categoryService.deleteCategory(id);
        return ResponseEntity.ok("Category deleted successfully");
    }
}