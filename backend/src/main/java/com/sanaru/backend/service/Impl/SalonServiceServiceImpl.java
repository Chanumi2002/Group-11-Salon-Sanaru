package com.sanaru.backend.service.impl;

import com.sanaru.backend.dto.ServiceRequest;
import com.sanaru.backend.dto.ServiceResponse;
import com.sanaru.backend.model.Service;
import com.sanaru.backend.repository.ServiceRepository;
import com.sanaru.backend.service.SalonServiceService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@org.springframework.stereotype.Service
public class SalonServiceServiceImpl implements SalonServiceService {

    private static final Set<String> ALLOWED_IMAGE_TYPES = Set.of("image/jpeg", "image/png");

    private final ServiceRepository serviceRepository;

    @Value("${app.service.upload.dir:uploads/services}")
    private String uploadDir;

    @Value("${app.service.image.max-size-bytes:10485760}")
    private long maxImageSizeBytes;

    public SalonServiceServiceImpl(ServiceRepository serviceRepository) {
        this.serviceRepository = serviceRepository;
    }

    @Override
    public ServiceResponse createService(ServiceRequest request, MultipartFile imageFile) throws IOException {
        validateServiceRequest(request);
        validateImageFile(imageFile, true);

        Service service = new Service();
        service.setName(request.getName().trim());
        service.setDescription(request.getDescription().trim());
        service.setPrice(request.getPrice());
        service.setImagePath(saveImageFile(imageFile));

        return mapToResponse(serviceRepository.save(service));
    }

    @Override
    public ServiceResponse updateService(Long id, ServiceRequest request, MultipartFile imageFile) throws IOException {
        validateServiceRequest(request);

        Service existing = serviceRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Service not found with id " + id));

        existing.setName(request.getName().trim());
        existing.setDescription(request.getDescription().trim());
        existing.setPrice(request.getPrice());

        if (imageFile != null && !imageFile.isEmpty()) {
            validateImageFile(imageFile, false);
            String oldImagePath = existing.getImagePath();
            String newImagePath = saveImageFile(imageFile);
            existing.setImagePath(newImagePath);
            deleteImageIfExists(oldImagePath);
        }

        return mapToResponse(serviceRepository.save(existing));
    }

    @Override
    public List<ServiceResponse> getAllServices() {
        return serviceRepository.findAllByOrderByUpdatedAtDesc()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public ServiceResponse getServiceById(Long id) {
        Service service = serviceRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Service not found with id " + id));
        return mapToResponse(service);
    }

    @Override
    public void deleteService(Long id) {
        Service service = serviceRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Service not found with id " + id));
        deleteImageIfExists(service.getImagePath());
        serviceRepository.delete(service);
    }

    private void validateServiceRequest(ServiceRequest request) {
        if (request == null) {
            throw new IllegalArgumentException("Service data is required");
        }

        String name = request.getName() == null ? "" : request.getName().trim();
        if (name.isEmpty()) {
            throw new IllegalArgumentException("Service name is required");
        }
        if (name.length() > 120) {
            throw new IllegalArgumentException("Service name must be 120 characters or fewer");
        }

        String description = request.getDescription() == null ? "" : request.getDescription().trim();
        if (description.isEmpty()) {
            throw new IllegalArgumentException("Service description is required");
        }
        if (description.length() > 1000) {
            throw new IllegalArgumentException("Service description must be 1000 characters or fewer");
        }

        BigDecimal price = request.getPrice();
        if (price == null) {
            throw new IllegalArgumentException("Service price is required");
        }
        if (price.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Service price must be greater than 0");
        }
        request.setPrice(price.setScale(2, RoundingMode.HALF_UP));
    }

    private void validateImageFile(MultipartFile imageFile, boolean required) {
        if (required && (imageFile == null || imageFile.isEmpty())) {
            throw new IllegalArgumentException("Service photo is required");
        }

        if (imageFile == null || imageFile.isEmpty()) {
            return;
        }

        if (imageFile.getSize() > maxImageSizeBytes) {
            long maxSizeMb = Math.max(1L, maxImageSizeBytes / (1024 * 1024));
            throw new IllegalArgumentException("Service photo is too large. Maximum size is " + maxSizeMb + "MB.");
        }

        String contentType = imageFile.getContentType();
        if (contentType == null || !ALLOWED_IMAGE_TYPES.contains(contentType.toLowerCase())) {
            throw new IllegalArgumentException("Invalid photo format. Only JPG and PNG are allowed.");
        }
    }

    private String saveImageFile(MultipartFile imageFile) throws IOException {
        Path uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();
        Files.createDirectories(uploadPath);

        String originalName = StringUtils.cleanPath(
                imageFile.getOriginalFilename() == null ? "service-image" : imageFile.getOriginalFilename()
        );
        String extension = extractExtension(originalName, imageFile.getContentType());
        String fileName = System.currentTimeMillis() + "_" + UUID.randomUUID().toString().replace("-", "") + extension;
        Path filePath = uploadPath.resolve(fileName).normalize();

        try (InputStream inputStream = imageFile.getInputStream()) {
            Files.copy(inputStream, filePath, StandardCopyOption.REPLACE_EXISTING);
        }

        return "uploads/services/" + fileName;
    }

    private String extractExtension(String originalName, String contentType) {
        int extensionIndex = originalName.lastIndexOf('.');
        if (extensionIndex > -1 && extensionIndex < originalName.length() - 1) {
            String ext = originalName.substring(extensionIndex).toLowerCase();
            if (".jpg".equals(ext) || ".jpeg".equals(ext) || ".png".equals(ext)) {
                return ext;
            }
        }

        if ("image/png".equalsIgnoreCase(contentType)) {
            return ".png";
        }
        return ".jpg";
    }

    private void deleteImageIfExists(String imagePath) {
        if (!StringUtils.hasText(imagePath)) {
            return;
        }

        String normalized = imagePath.replace("\\", "/");
        int uploadsIndex = normalized.toLowerCase().indexOf("uploads/");
        String relativePath = uploadsIndex >= 0 ? normalized.substring(uploadsIndex) : normalized;
        Path filePath = Paths.get(relativePath).toAbsolutePath().normalize();

        try {
            Files.deleteIfExists(filePath);
        } catch (IOException ignored) {
            // Keep DB operations resilient even if old file cleanup fails.
        }
    }

    private ServiceResponse mapToResponse(Service service) {
        ServiceResponse response = new ServiceResponse();
        response.setId(service.getId());
        response.setName(service.getName());
        response.setDescription(service.getDescription());
        response.setPrice(service.getPrice());
        response.setImagePath(service.getImagePath());
        response.setCreatedAt(service.getCreatedAt());
        response.setUpdatedAt(service.getUpdatedAt());
        return response;
    }
}
