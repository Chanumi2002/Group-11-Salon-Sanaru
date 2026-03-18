package com.sanaru.backend.service;

import com.sanaru.backend.dto.ProductResponse;
import com.sanaru.backend.dto.ProductRequest;
import com.sanaru.backend.model.Product;
import com.sanaru.backend.repository.ProductRepository;
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
public class ProductService {

    private final ProductRepository productRepository;


    @Value("${app.upload.dir:uploads}")
    private String uploadDir;

    public ProductService(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    // CREATE PRODUCT WITH IMAGE
    public ProductResponse createProduct(ProductRequest dto, MultipartFile imageFile) throws IOException {

        // Check image exists
        if (imageFile == null || imageFile.isEmpty()) {
            throw new RuntimeException("Image file is missing");
        }

        // Create folder if not exists
        Path uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        // Make safe + unique filename
        String originalName = imageFile.getOriginalFilename();
        if (originalName == null || originalName.isBlank()) {
            originalName = "image";
        }
        String fileName = System.currentTimeMillis() + "_" +
                originalName.replaceAll("\\s+", "_");

        Path filePath = uploadPath.resolve(fileName).normalize();

        //  Save image
        imageFile.transferTo(filePath.toFile());

        //  Save product to DB
        Product product = new Product();
        product.setName(dto.getName());
        product.setDescription(dto.getDescription());
        product.setPrice(dto.getPrice());
        product.setImagePath(filePath.toString());

        Product savedProduct = productRepository.save(product);

        return mapToResponse(savedProduct);
    }

    // GET ALL PRODUCTS
    public List<ProductResponse> getAllProducts() {
        return productRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // GET PRODUCT BY ID
    public ProductResponse getProductById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found with id " + id));

        return mapToResponse(product);
    }

    // DELETE PRODUCT
    public void deleteProduct(Long id) {
        productRepository.deleteById(id);
    }

    // MAPPER METHOD
    private ProductResponse mapToResponse(Product product) {
        ProductResponse response = new ProductResponse();
        response.setId(product.getId());
        response.setName(product.getName());
        response.setDescription(product.getDescription());
        response.setPrice(product.getPrice());
        response.setImagePath(product.getImagePath());
        response.setCreatedAt(product.getCreatedAt());
        response.setUpdatedAt(product.getUpdatedAt());
        return response;
    }
}