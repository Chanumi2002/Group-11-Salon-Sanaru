package com.sanaru.backend.repository;

import com.sanaru.backend.model.Service;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ServiceRepository extends JpaRepository<Service, Long> {
    List<Service> findAllByOrderByUpdatedAtDesc();
}
