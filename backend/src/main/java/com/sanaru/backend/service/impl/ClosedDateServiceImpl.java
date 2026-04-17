package com.sanaru.backend.service.impl;

import com.sanaru.backend.dto.ClosedDateRequest;
import com.sanaru.backend.dto.ClosedDateResponse;
import com.sanaru.backend.enums.AppointmentStatus;
import com.sanaru.backend.model.Appointment;
import com.sanaru.backend.model.ClosedDate;
import com.sanaru.backend.repository.AppointmentRepository;
import com.sanaru.backend.repository.ClosedDateRepository;
import com.sanaru.backend.service.ClosedDateService;
import com.sanaru.backend.service.EmailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ClosedDateServiceImpl implements ClosedDateService {

    private final ClosedDateRepository closedDateRepository;
    private final AppointmentRepository appointmentRepository;
    private final EmailService emailService;

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

        // Find and cancel all appointments on this date
        List<AppointmentStatus> activeStatuses = Arrays.asList(
                AppointmentStatus.PENDING,
                AppointmentStatus.CONFIRMED
        );
        
        List<Appointment> appointmentsToCancel = appointmentRepository.findByAppointmentDateAndStatusIn(
                request.getClosedDate(),
                activeStatuses
        );
        
        // Cancel appointments and send notification emails
        int cancelledCount = 0;
        DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("MMMM dd, yyyy");
        String formattedDate = request.getClosedDate().format(dateFormatter);
        
        for (Appointment appointment : appointmentsToCancel) {
            try {
                // Cancel the appointment
                appointment.setStatus(AppointmentStatus.CANCELLED);
                appointmentRepository.save(appointment);
                cancelledCount++;
                
                // Send cancellation email to customer
                String customerEmail = appointment.getCustomer().getEmail();
                String customerName = appointment.getCustomer().getFirstName();
                String serviceName = appointment.getService().getName();
                String cancellationReason = "The salon is closed on this date. Please rebook your appointment on another day.";
                
                emailService.sendAppointmentCancellationEmail(
                        customerEmail,
                        customerName,
                        serviceName,
                        formattedDate,
                        cancellationReason
                );
                
                log.info("Appointment {} cancelled and email sent to {}", appointment.getId(), customerEmail);
            } catch (Exception e) {
                log.error("Error cancelling appointment {} or sending email: {}", appointment.getId(), e.getMessage(), e);
            }
        }
        
        // Send bulk cancellation notification to admin
        if (cancelledCount > 0) {
            emailService.sendBulkAppointmentCancellationNotificationToAdmin(
                    cancelledCount,
                    "Salon closed on " + formattedDate + (request.getReason() != null ? ": " + request.getReason() : "")
            );
        }
        
        // Create and save the closed date
        ClosedDate closedDate = new ClosedDate();
        closedDate.setClosedDate(request.getClosedDate());
        
        // Update reason to include cancellation info if appointments were cancelled
        String reason = request.getReason() != null ? request.getReason().trim() : "";
        if (cancelledCount > 0) {
            reason += (reason.isEmpty() ? "" : " | ") + "(" + cancelledCount + " appointment(s) cancelled and notified)";
        }
        closedDate.setReason(reason);
        closedDate.setIsActive(request.getIsActive() != null ? request.getIsActive() : true);

        ClosedDate saved = closedDateRepository.save(closedDate);
        log.info("Closed date added for {} with {} appointments cancelled", request.getClosedDate(), cancelledCount);
        
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
