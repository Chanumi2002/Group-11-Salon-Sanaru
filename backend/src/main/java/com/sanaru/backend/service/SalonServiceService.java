package com.sanaru.backend.service;

import com.sanaru.backend.dto.ServiceRequest;
import com.sanaru.backend.dto.ServiceResponse;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

public interface SalonServiceService {

    ServiceResponse createService(ServiceRequest request, MultipartFile imageFile) throws IOException;

    ServiceResponse updateService(Long id, ServiceRequest request, MultipartFile imageFile) throws IOException;

    List<ServiceResponse> getAllServices();

    ServiceResponse getServiceById(Long id);

    void deleteService(Long id);
}
