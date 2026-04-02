package com.sanaru.backend.service;

import com.sanaru.backend.dto.CategoryRequest;
import com.sanaru.backend.dto.CategoryResponse;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
@Service

public interface CategoryService {

    CategoryResponse createCategory(CategoryRequest request, MultipartFile imageFile) throws IOException;

    List<CategoryResponse> getAllCategories();

    CategoryResponse getCategoryById(Long id);

    CategoryResponse updateCategory(Long id, CategoryRequest request, MultipartFile imageFile) throws IOException;

    void deleteCategory(Long id);
}