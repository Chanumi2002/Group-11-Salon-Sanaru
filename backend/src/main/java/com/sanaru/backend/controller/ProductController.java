package com.sanaru.backend.controller;

import com.sanaru.backend.dto.ProductRequest;
import com.sanaru.backend.dto.ProductResponse;
import com.sanaru.backend.service.ProductService;
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
public class ProductController {

    private final ProductService productService;

    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    //  CREATE PRODUCT
    @PostMapping(value = "/admin/products", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Map<String, Object>> createProduct(
            @RequestParam("name") String name,
            @RequestParam("description") String description,
            @RequestParam("price") BigDecimal price,
            @RequestParam("image") MultipartFile imageFile
    ) throws IOException {

        // Convert to DTO manually
        ProductRequest productRequest = new ProductRequest();
        productRequest.setName(name);
        productRequest.setDescription(description);
        productRequest.setPrice(price);

        ProductResponse createdProduct = productService.createProduct(productRequest, imageFile);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(Map.of(
                        "message", "Product created successfully",
                        "product", createdProduct
                ));
    }

    //  GET ALL PRODUCTS
    @GetMapping("/products")
    public ResponseEntity<List<ProductResponse>> getAllProducts() {
        return ResponseEntity.ok(productService.getAllProducts());
    }

    //  GET PRODUCT BY ID
    @GetMapping("/products/{id}")
    public ResponseEntity<ProductResponse> getProductById(@PathVariable Long id) {
        return ResponseEntity.ok(productService.getProductById(id));
    }

    // DELETE PRODUCT
    @DeleteMapping("/admin/products/{id}")
    public ResponseEntity<Map<String, String>> deleteProduct(@PathVariable Long id) {
        productService.deleteProduct(id);
        return ResponseEntity.ok(Map.of("message", "Product deleted successfully"));
    }
}