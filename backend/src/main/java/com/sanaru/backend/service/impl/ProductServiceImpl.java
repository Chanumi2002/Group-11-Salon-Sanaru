package com.sanaru.backend.service.impl;

import com.sanaru.backend.dto.ProductRequest;
import com.sanaru.backend.dto.ProductResponse;
import com.sanaru.backend.model.Category;
import com.sanaru.backend.model.Product;
import com.sanaru.backend.repository.CategoryRepository;
import com.sanaru.backend.repository.ProductRepository;
import com.sanaru.backend.service.ProductService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.math.BigDecimal;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;

    @Value("${app.upload.dir:uploads}")
    private String uploadDir;

    public ProductServiceImpl(ProductRepository productRepository, CategoryRepository categoryRepository) {
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
    }

    // CREATE
    @Override
    public ProductResponse createProduct(ProductRequest dto, MultipartFile imageFile) throws IOException {

        // Price validation
        validatePrice(dto.getPrice());

        // Image validation
        if (imageFile == null || imageFile.isEmpty()) {
            throw new IllegalArgumentException("Image file is missing");
        }
        validateImageFile(imageFile);

        String imagePath = saveImageFile(imageFile);

        Product product = new Product();
        product.setName(dto.getName());
        product.setDescription(dto.getDescription());
        product.setPrice(dto.getPrice());
        product.setImagePath(imagePath);

        if (dto.getCategoryIds() != null && !dto.getCategoryIds().isEmpty()) {
            List<Category> categories = categoryRepository.findAllById(dto.getCategoryIds());
            product.setCategories(categories);
        }

        if (dto.getStockQuantity() != null) {
            product.setStockQuantity(dto.getStockQuantity());
        }
        if (dto.getLowStockThreshold() != null) {
            product.setLowStockThreshold(dto.getLowStockThreshold());
        }

        return mapToResponse(productRepository.save(product));
    }

    // UPDATE
    @Override
    public ProductResponse updateProduct(Long id, ProductRequest dto, MultipartFile imageFile) throws IOException {

        Product product = productRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Product not found with id " + id));

        // Price validation
        validatePrice(dto.getPrice());

        product.setName(dto.getName());
        product.setDescription(dto.getDescription());
        product.setPrice(dto.getPrice());

        if (imageFile != null && !imageFile.isEmpty()) {

            // Image validation
            validateImageFile(imageFile);

            String imagePath = saveImageFile(imageFile);
            product.setImagePath(imagePath);
        }

        if (dto.getCategoryIds() != null) {
            List<Category> categories = categoryRepository.findAllById(dto.getCategoryIds());
            product.setCategories(categories);
        }

        if (dto.getStockQuantity() != null) {
            product.setStockQuantity(dto.getStockQuantity());
        }
        if (dto.getLowStockThreshold() != null) {
            product.setLowStockThreshold(dto.getLowStockThreshold());
        }

        return mapToResponse(productRepository.save(product));
    }

    //  GET ALL
    @Override
    public List<ProductResponse> getAllProducts() {
        return productRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // GET BY ID
    @Override
    public ProductResponse getProductById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Product not found with id " + id));
        return mapToResponse(product);
    }

    // DELETE
    @Override
    public void deleteProduct(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Product not found with id " + id));
        productRepository.delete(product);
    }

    //  FILTER
    @Override
    public List<ProductResponse> getProductsFiltered(Long categoryId, BigDecimal minPrice, BigDecimal maxPrice) {
        return productRepository.findByFilters(categoryId, minPrice, maxPrice)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // STORY 1 - INVENTORY TRACKING METHODS

    @Override
    public ProductResponse updateProductStock(Long id, com.sanaru.backend.dto.InventoryUpdateRequest request) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Product not found with id " + id));

        if (request.getStockQuantity() != null) {
            product.setStockQuantity(request.getStockQuantity());
        }
        if (request.getLowStockThreshold() != null) {
            product.setLowStockThreshold(request.getLowStockThreshold());
        }

        return mapToResponse(productRepository.save(product));
    }

    @Override
    public List<com.sanaru.backend.dto.LowStockAlertResponse> getLowStockAlerts() {
        return productRepository.findLowStockProducts().stream().map(product -> {
            com.sanaru.backend.dto.LowStockAlertResponse alert = new com.sanaru.backend.dto.LowStockAlertResponse();
            alert.setProductId(product.getId());
            alert.setProductName(product.getName());
            alert.setStockQuantity(product.getStockQuantity());
            alert.setLowStockThreshold(product.getLowStockThreshold());
            alert.setOutOfStock(product.getStockQuantity() == 0);
            return alert;
        }).collect(Collectors.toList());
    }

    @Override
    public void deductStock(Long id, Integer quantity) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Product not found with id " + id));

        int newStock = product.getStockQuantity() - quantity;
        if (newStock < 0) {
            throw new IllegalArgumentException("Insufficient stock for product: " + product.getName());
        }

        product.setStockQuantity(newStock);
        productRepository.save(product);
    }

    // VALIDATIONS
    private void validatePrice(BigDecimal price) {
        if (price == null || price.compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("Price must be a positive value");
        }
    }

    private void validateImageFile(MultipartFile file) {
        String contentType = file.getContentType();
        String fileName = file.getOriginalFilename();

        boolean validType = contentType != null &&
                (contentType.equals("image/jpeg") ||
                        contentType.equals("image/png") ||
                        contentType.equals("image/jpg") ||
                        contentType.equals("image/webp"));

        boolean validExtension = fileName != null &&
                (fileName.toLowerCase().endsWith(".jpg") ||
                        fileName.toLowerCase().endsWith(".jpeg") ||
                        fileName.toLowerCase().endsWith(".png") ||
                        fileName.toLowerCase().endsWith(".webp"));

        if (!validType || !validExtension) {
            throw new IllegalArgumentException("Only image files (JPG, JPEG, PNG, WEBP) are allowed");
        }
    }

    //  MAPPER
    private ProductResponse mapToResponse(Product product) {
        ProductResponse response = new ProductResponse();
        response.setId(product.getId());
        response.setName(product.getName());
        response.setDescription(product.getDescription());
        response.setPrice(product.getPrice());
        response.setImagePath(product.getImagePath());
        response.setCreatedAt(product.getCreatedAt());
        response.setUpdatedAt(product.getUpdatedAt());
        response.setCategories(product.getCategories());

        response.setStockQuantity(product.getStockQuantity());
        response.setLowStockThreshold(product.getLowStockThreshold());
        response.setLowStock(product.getStockQuantity() <= product.getLowStockThreshold());
        response.setOutOfStock(product.getStockQuantity() <= 0);

        return response;
    }

    // FILE SAVE
    private String saveImageFile(MultipartFile imageFile) throws IOException {
        Path uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();

        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        String originalName = imageFile.getOriginalFilename();
        if (originalName == null || originalName.isBlank()) {
            originalName = "image";
        }

        String fileName = System.currentTimeMillis() + "_" + originalName.replaceAll("\\s+", "_");

        Path filePath = uploadPath.resolve(fileName).normalize();
        imageFile.transferTo(filePath.toFile());

        return "uploads/" + fileName;
    }
}