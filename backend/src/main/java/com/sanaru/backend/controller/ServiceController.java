package com.sanaru.backend.controller;

import com.sanaru.backend.dto.ServiceRequest;
import com.sanaru.backend.dto.ServiceResponse;
import com.sanaru.backend.service.SalonServiceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class ServiceController {

    private final SalonServiceService salonServiceService;

    @PostMapping(value = "/admin/services", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Map<String, Object>> createService(
            @RequestParam("name") String name,
            @RequestParam("description") String description,
            @RequestParam("price") String price,
            @RequestParam("image") MultipartFile imageFile
    ) throws IOException {
        ServiceRequest request = new ServiceRequest();
        request.setName(name);
        request.setDescription(description);
        request.setPrice(parsePrice(price));

        ServiceResponse created = salonServiceService.createService(request, imageFile);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(Map.of(
                        "message", "Service created successfully",
                        "service", created
                ));
    }

    @PutMapping(value = "/admin/services/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Map<String, Object>> updateService(
            @PathVariable Long id,
            @RequestParam("name") String name,
            @RequestParam("description") String description,
            @RequestParam("price") String price,
            @RequestParam(value = "image", required = false) MultipartFile imageFile
    ) throws IOException {
        ServiceRequest request = new ServiceRequest();
        request.setName(name);
        request.setDescription(description);
        request.setPrice(parsePrice(price));

        ServiceResponse updated = salonServiceService.updateService(id, request, imageFile);
        return ResponseEntity.ok(Map.of(
                "message", "Service updated successfully",
                "service", updated
        ));
    }

    @DeleteMapping("/admin/services/{id}")
    public ResponseEntity<Map<String, String>> deleteService(@PathVariable Long id) {
        salonServiceService.deleteService(id);
        return ResponseEntity.ok(Map.of("message", "Service deleted successfully"));
    }

    @GetMapping("/services")
    public ResponseEntity<List<ServiceResponse>> getAllServices() {
        return ResponseEntity.ok(salonServiceService.getAllServices());
    }

    @GetMapping("/services/{id}")
    public ResponseEntity<ServiceResponse> getServiceById(@PathVariable Long id) {
        return ResponseEntity.ok(salonServiceService.getServiceById(id));
    }

    @GetMapping(value = "/services/{id}/image")
    public ResponseEntity<byte[]> getServiceImage(@PathVariable Long id) {
        SalonServiceService.ServiceImageData imageData = salonServiceService.getServiceImage(id);

        MediaType mediaType;
        try {
            mediaType = MediaType.parseMediaType(imageData.contentType());
        } catch (Exception ex) {
            mediaType = MediaType.IMAGE_JPEG;
        }

        return ResponseEntity.ok()
                .contentType(mediaType)
                .body(imageData.data());
    }

    private BigDecimal parsePrice(String price) {
        try {
            return new BigDecimal(price);
        } catch (NumberFormatException ex) {
            throw new IllegalArgumentException("Service price must be a valid number");
        }
    }
}
