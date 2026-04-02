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
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.Set;
import java.util.stream.Collectors;

@org.springframework.stereotype.Service
public class SalonServiceServiceImpl implements SalonServiceService {

    private static final Set<String> ALLOWED_IMAGE_TYPES = Set.of("image/jpeg", "image/png");
    private static final Set<Integer> ALLOWED_DURATIONS = Set.of(15, 30, 45, 60, 90, 120);
    private static final String DEFAULT_IMAGE_CONTENT_TYPE = "image/jpeg";
    private static final String DB_IMAGE_PLACEHOLDER = "db://image";
    private static final int DEFAULT_DURATION_MINUTES = 30;

    private final ServiceRepository serviceRepository;

    @Value("${app.service.image.max-size-bytes:1048576}")
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
        service.setDurationMinutes(request.getDurationMinutes());
        service.setActive(request.getActive());
        service.setImageData(imageFile.getBytes());
        service.setImageContentType(normalizeContentType(imageFile.getContentType()));
        service.setImagePath(DB_IMAGE_PLACEHOLDER);

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
        existing.setDurationMinutes(request.getDurationMinutes());
        existing.setActive(request.getActive());

        if (imageFile != null && !imageFile.isEmpty()) {
            validateImageFile(imageFile, false);
            existing.setImageData(imageFile.getBytes());
            existing.setImageContentType(normalizeContentType(imageFile.getContentType()));
            existing.setImagePath(DB_IMAGE_PLACEHOLDER);
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
    public List<ServiceResponse> getActiveServices() {
        return serviceRepository.findAllByOrderByUpdatedAtDesc()
                .stream()
                .filter(service -> !Boolean.FALSE.equals(service.getActive()))
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
    public ServiceResponse getActiveServiceById(Long id) {
        Service service = serviceRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Service not found with id " + id));

        if (Boolean.FALSE.equals(service.getActive())) {
            throw new NoSuchElementException("Service not found with id " + id);
        }

        return mapToResponse(service);
    }

    @Override
    public ServiceImageData getServiceImage(Long id) {
        Service service = serviceRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Service not found with id " + id));

        if (service.getImageData() != null && service.getImageData().length > 0) {
            return new ServiceImageData(service.getImageData(), normalizeContentType(service.getImageContentType()));
        }

        Path fallbackPath = resolveLegacyImagePath(service.getImagePath());
        if (fallbackPath != null && Files.exists(fallbackPath)) {
            try {
                String detectedType = Files.probeContentType(fallbackPath);
                return new ServiceImageData(Files.readAllBytes(fallbackPath), normalizeContentType(detectedType));
            } catch (IOException ex) {
                throw new IllegalStateException("Failed to load service photo for service id " + id);
            }
        }

        throw new NoSuchElementException("Service photo not found for service id " + id);
    }

    @Override
    public void deleteService(Long id) {
        Service service = serviceRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Service not found with id " + id));
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

        Integer durationMinutes = request.getDurationMinutes();
        if (durationMinutes == null) {
            throw new IllegalArgumentException("Service duration is required");
        }
        if (!ALLOWED_DURATIONS.contains(durationMinutes)) {
            throw new IllegalArgumentException("Duration must be 15, 30, 45, 60, 90, or 120");
        }

        if (request.getActive() == null) {
            request.setActive(true);
        }
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

    private String normalizeContentType(String rawContentType) {
        if ("image/png".equalsIgnoreCase(rawContentType)) {
            return "image/png";
        }
        return DEFAULT_IMAGE_CONTENT_TYPE;
    }

    private Path resolveLegacyImagePath(String imagePath) {
        if (!StringUtils.hasText(imagePath)) {
            return null;
        }
        if (imagePath.startsWith("db://")) {
            return null;
        }

        String normalized = imagePath.replace("\\", "/");
        int uploadsIndex = normalized.toLowerCase().indexOf("uploads/");
        String relativePath = uploadsIndex >= 0 ? normalized.substring(uploadsIndex) : normalized;
        return Paths.get(relativePath).toAbsolutePath().normalize();
    }

    private ServiceResponse mapToResponse(Service service) {
        ServiceResponse response = new ServiceResponse();
        response.setId(service.getId());
        response.setName(service.getName());
        response.setDescription(service.getDescription());
        response.setPrice(service.getPrice());
        response.setDurationMinutes(
                service.getDurationMinutes() == null ? DEFAULT_DURATION_MINUTES : service.getDurationMinutes()
        );
        response.setActive(!Boolean.FALSE.equals(service.getActive()));
        if (StringUtils.hasText(service.getImagePath()) && !service.getImagePath().startsWith("db://")) {
            response.setImagePath(service.getImagePath());
        }
        if (StringUtils.hasText(service.getImageContentType()) || StringUtils.hasText(service.getImagePath())) {
            response.setImageUrl("/api/services/" + service.getId() + "/image");
        }
        response.setCreatedAt(service.getCreatedAt());
        response.setUpdatedAt(service.getUpdatedAt());
        return response;
    }
}
