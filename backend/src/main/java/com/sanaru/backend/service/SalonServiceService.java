package com.sanaru.backend.service;

import com.sanaru.backend.dto.ServiceRequest;
import com.sanaru.backend.dto.ServiceResponse;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

public interface SalonServiceService {

    record ServiceImageData(byte[] data, String contentType) {}

    ServiceResponse createService(ServiceRequest request, MultipartFile imageFile) throws IOException;

    ServiceResponse updateService(Long id, ServiceRequest request, MultipartFile imageFile) throws IOException;

    List<ServiceResponse> getAllServices();

    List<ServiceResponse> getActiveServices();

    ServiceResponse getServiceById(Long id);

    ServiceResponse getActiveServiceById(Long id);

    ServiceImageData getServiceImage(Long id);

    void deleteService(Long id);
}
