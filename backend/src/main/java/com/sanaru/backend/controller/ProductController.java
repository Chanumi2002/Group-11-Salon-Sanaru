package com.sanaru.backend.controller;

import com.sanaru.backend.dto.ProductRequest;
import com.sanaru.backend.dto.ProductResponse;
import com.sanaru.backend.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;


    // ADMIN ENDPOINTS

    // GET LOW STOCK ALERTS
    @GetMapping("/admin/inventory/low-stock")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<com.sanaru.backend.dto.LowStockAlertResponse>> getLowStockAlerts() {
        return ResponseEntity.ok(productService.getLowStockAlerts());
    }

    // UPDATE PRODUCT STOCK
    @PatchMapping("/admin/products/{id}/stock")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> updateProductStock(
            @PathVariable Long id,
            @RequestBody @jakarta.validation.Valid com.sanaru.backend.dto.InventoryUpdateRequest request) {
        
        ProductResponse updatedProduct = productService.updateProductStock(id, request);
        return ResponseEntity.ok(Map.of(
                "message", "Stock updated successfully",
                "product", updatedProduct
        ));
    }

    // CREATE PRODUCT
    @PostMapping(value = "/admin/products", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Map<String, Object>> createProduct(
            @RequestParam("name") String name,
            @RequestParam("description") String description,
            @RequestParam("price") String price,
            @RequestParam("image") MultipartFile imageFile,
            @RequestParam(value = "categoryIds", required = false) List<Long> categoryIds,
            @RequestParam(value = "stockQuantity", required = false) Integer stockQuantity,
            @RequestParam(value = "lowStockThreshold", required = false) Integer lowStockThreshold
    ) throws IOException {

        ProductRequest productRequest = new ProductRequest();
        productRequest.setName(name);
        productRequest.setDescription(description);
        productRequest.setPrice(new BigDecimal(price));
        productRequest.setCategoryIds(categoryIds);
        if (stockQuantity != null) productRequest.setStockQuantity(stockQuantity);
        if (lowStockThreshold != null) productRequest.setLowStockThreshold(lowStockThreshold);

        ProductResponse createdProduct = productService.createProduct(productRequest, imageFile);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(Map.of(
                        "message", "Product created successfully",
                        "product", createdProduct
                ));
    }

    // UPDATE PRODUCT
    @PutMapping(value = "/admin/products/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Map<String, Object>> updateProduct(
            @PathVariable Long id,
            @RequestParam("name") String name,
            @RequestParam("description") String description,
            @RequestParam("price") String price,
            @RequestParam(value = "image", required = false) MultipartFile imageFile,
            @RequestParam(value = "categoryIds", required = false) List<Long> categoryIds,
            @RequestParam(value = "stockQuantity", required = false) Integer stockQuantity,
            @RequestParam(value = "lowStockThreshold", required = false) Integer lowStockThreshold
    ) throws IOException {

        ProductRequest productRequest = new ProductRequest();
        productRequest.setName(name);
        productRequest.setDescription(description);
        productRequest.setPrice(new BigDecimal(price));
        productRequest.setCategoryIds(categoryIds);
        if (stockQuantity != null) productRequest.setStockQuantity(stockQuantity);
        if (lowStockThreshold != null) productRequest.setLowStockThreshold(lowStockThreshold);

        ProductResponse updatedProduct = productService.updateProduct(id, productRequest, imageFile);

        return ResponseEntity.ok(Map.of(
                "message", "Product updated successfully",
                "product", updatedProduct
        ));
    }

    // DELETE PRODUCT
    @DeleteMapping("/admin/products/{id}")
    public ResponseEntity<Map<String, String>> deleteProduct(@PathVariable Long id) {
        productService.deleteProduct(id);
        return ResponseEntity.ok(Map.of("message", "Product deleted successfully"));
    }


    // PUBLIC ENDPOINTS (GUEST/CUSTOMER)
    // GET ALL PRODUCTS
    @GetMapping("/products")
    public ResponseEntity<List<ProductResponse>> getAllProducts(
            @RequestParam(required = false) Long category,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice) {

        if (category != null || minPrice != null || maxPrice != null) {
            return ResponseEntity.ok(
                    productService.getProductsFiltered(category, minPrice, maxPrice)
            );
        }

        return ResponseEntity.ok(productService.getAllProducts());
    }

    // GET PRODUCT BY ID
    @GetMapping("/products/{id}")
    public ResponseEntity<ProductResponse> getProductById(@PathVariable Long id) {
        return ResponseEntity.ok(productService.getProductById(id));
    }
}