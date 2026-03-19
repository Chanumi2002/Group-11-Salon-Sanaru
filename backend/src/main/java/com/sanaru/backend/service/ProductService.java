package com.sanaru.backend.service;

import com.sanaru.backend.dto.ProductRequest;
import com.sanaru.backend.dto.ProductResponse;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.math.BigDecimal;
import java.util.List;

public interface ProductService {

    ProductResponse createProduct(ProductRequest dto, MultipartFile imageFile) throws IOException;

    ProductResponse updateProduct(Long id, ProductRequest dto, MultipartFile imageFile) throws IOException;

    List<ProductResponse> getAllProducts();

    ProductResponse getProductById(Long id);

    void deleteProduct(Long id);

    List<ProductResponse> getProductsFiltered(Long categoryId, BigDecimal minPrice, BigDecimal maxPrice);
}