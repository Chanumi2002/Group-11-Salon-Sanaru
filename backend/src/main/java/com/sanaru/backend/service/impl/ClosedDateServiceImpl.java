package com.sanaru.backend.service.impl;

import com.sanaru.backend.dto.ClosedDateRequest;
import com.sanaru.backend.dto.ClosedDateResponse;
import com.sanaru.backend.model.ClosedDate;
import com.sanaru.backend.repository.ClosedDateRepository;
import com.sanaru.backend.service.ClosedDateService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ClosedDateServiceImpl implements ClosedDateService {

    private final ClosedDateRepository closedDateRepository;

    @Override
    public ClosedDateResponse addClosedDate(ClosedDateRequest request) {
        if (request.getClosedDate() == null) {
            throw new IllegalArgumentException("Closed date cannot be null");
        }

        // Check if date is already closed
        if (closedDateRepository.findByClosedDate(request.getClosedDate()).isPresent()) {
            throw new IllegalArgumentException("Date is already marked as closed");
        }

        // Check if date is in the past
        if (request.getClosedDate().isBefore(LocalDate.now())) {
            throw new IllegalArgumentException("Cannot add closed date in the past");
        }

        ClosedDate closedDate = new ClosedDate();
        closedDate.setClosedDate(request.getClosedDate());
        closedDate.setReason(request.getReason() != null ? request.getReason().trim() : "");
        closedDate.setIsActive(request.getIsActive() != null ? request.getIsActive() : true);

        ClosedDate saved = closedDateRepository.save(closedDate);
        return mapToResponse(saved);
    }

    @Override
    public List<ClosedDateResponse> getAllClosedDates() {
        return closedDateRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<ClosedDateResponse> getActiveClosedDates() {
        return closedDateRepository.findByIsActiveTrue().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public ClosedDateResponse updateClosedDate(Long id, ClosedDateRequest request) {
        ClosedDate closedDate = closedDateRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Closed date not found with id: " + id));

        if (request.getReason() != null) {
            closedDate.setReason(request.getReason().trim());
        }

        if (request.getIsActive() != null) {
            closedDate.setIsActive(request.getIsActive());
        }

        ClosedDate updated = closedDateRepository.save(closedDate);
        return mapToResponse(updated);
    }

    @Override
    public void deleteClosedDate(Long id) {
        if (!closedDateRepository.existsById(id)) {
            throw new IllegalArgumentException("Closed date not found with id: " + id);
        }
        closedDateRepository.deleteById(id);
    }

    @Override
    public boolean isDateClosed(LocalDate date) {
        return closedDateRepository.findByClosedDate(date)
                .map(ClosedDate::getIsActive)
                .orElse(false);
    }

    private ClosedDateResponse mapToResponse(ClosedDate closedDate) {
        return new ClosedDateResponse(
                closedDate.getId(),
                closedDate.getClosedDate(),
                closedDate.getReason(),
                closedDate.getIsActive(),
                closedDate.getCreatedAt(),
                closedDate.getUpdatedAt()
        );
    }
}
