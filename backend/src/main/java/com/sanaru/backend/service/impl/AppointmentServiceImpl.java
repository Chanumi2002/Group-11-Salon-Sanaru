package com.sanaru.backend.service.impl;

import com.sanaru.backend.dto.AppointmentRequest;
import com.sanaru.backend.dto.AppointmentResponse;
import com.sanaru.backend.enums.AppointmentStatus;
import com.sanaru.backend.model.Appointment;
import com.sanaru.backend.model.Break;
import com.sanaru.backend.model.TimeSlot;
import com.sanaru.backend.model.User;
import com.sanaru.backend.repository.AppointmentRepository;
import com.sanaru.backend.repository.ClosedDateRepository;
import com.sanaru.backend.repository.ServiceRepository;
import com.sanaru.backend.repository.TimeSlotRepository;
import com.sanaru.backend.repository.UserRepository;
import com.sanaru.backend.service.AppointmentService;
import com.sanaru.backend.service.EmailService;
import com.sanaru.backend.service.HolidayService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;
import java.util.stream.Collectors;
import java.time.LocalDate;
import java.time.LocalTime;

@Service
@RequiredArgsConstructor
public class AppointmentServiceImpl implements AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final UserRepository userRepository;
    private final ServiceRepository serviceRepository;
    private final TimeSlotRepository timeSlotRepository;
    private final ClosedDateRepository closedDateRepository;
    private final HolidayService holidayService;
    private final EmailService emailService;

    @Override
    public AppointmentResponse createAppointment(AppointmentRequest request, String userEmail) {
        if (request.getServiceId() == null) {
            throw new IllegalArgumentException("Service ID is required");
        }

        User customer = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new NoSuchElementException("User not found"));

        com.sanaru.backend.model.Service service = serviceRepository.findById(request.getServiceId())
                .orElseThrow(() -> new NoSuchElementException("Service not found"));

        // Check if the requested date is marked as closed
        if (closedDateRepository.findByClosedDate(request.getDate()).isPresent()) {
            throw new IllegalArgumentException("The selected date is not available. Salon is closed on this date.");
        }

        // Check if the requested date is a holiday
        if (holidayService.isHoliday(request.getDate())) {
            throw new IllegalArgumentException("The selected date is a holiday. Salon is closed on this date.");
        }

        LocalTime requestedStartTime = request.getTime();
        LocalTime requestedEndTime = requestedStartTime.plusMinutes(service.getDurationMinutes());

        // Validate that the requested time falls within an active time slot for the day
        List<TimeSlot> activeSlots = timeSlotRepository.findByDayOfWeekAndIsActiveTrue(request.getDate().getDayOfWeek());
        TimeSlot matchingSlot = null;
        
        for (TimeSlot slot : activeSlots) {
            if (!requestedStartTime.isBefore(slot.getStartTime()) && 
                !requestedEndTime.isAfter(slot.getEndTime())) {
                matchingSlot = slot;
                break;
            }
        }

        if (matchingSlot == null) {
            throw new IllegalArgumentException("The selected time is outside operating hours");
        }

        // Check for breaks: ensure the appointment doesn't conflict with any breaks
        for (Break breakPeriod : matchingSlot.getBreaks()) {
            if (breakPeriod.getIsActive()) {
                LocalTime breakStart = breakPeriod.getStartTime();
                LocalTime breakEnd = breakPeriod.getEndTime();
                
                // Check if appointment overlaps with break
                if (requestedStartTime.isBefore(breakEnd) && requestedEndTime.isAfter(breakStart)) {
                    throw new IllegalArgumentException("The selected time conflicts with a break period (" + breakPeriod.getBreakName() + ")");
                }
            }
        }

        // Check capacity: count existing overlapping appointments at the requested time
        List<Appointment> existingAppointments = appointmentRepository.findByAppointmentDateAndStatusIn(
                request.getDate(),
                List.of(AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED)
        );

        long overlappingCount = existingAppointments.stream()
                .filter(existing -> {
                    LocalTime existingStartTime = existing.getAppointmentTime();
                    LocalTime existingEndTime = existingStartTime.plusMinutes(existing.getService().getDurationMinutes());
                    // Check if the time ranges overlap
                    return requestedStartTime.isBefore(existingEndTime) && requestedEndTime.isAfter(existingStartTime);
                })
                .count();

        if (overlappingCount >= matchingSlot.getCapacity()) {
            throw new IllegalArgumentException("Time slot is fully booked. No available spots for this time.");
        }

        Appointment appointment = new Appointment();
        appointment.setCustomer(customer);
        appointment.setService(service);
        appointment.setAppointmentDate(request.getDate());
        appointment.setAppointmentTime(request.getTime());
        appointment.setStatus(AppointmentStatus.PENDING);

        Appointment savedAppointment = appointmentRepository.save(appointment);

        // Send booking confirmation email to customer
        try {
            String customerEmail = savedAppointment.getCustomer().getEmail();
            String customerName = savedAppointment.getCustomer().getFirstName() + " " + savedAppointment.getCustomer().getLastName();
            String serviceName = savedAppointment.getService().getName();
            String appointmentDate = savedAppointment.getAppointmentDate().toString();
            String appointmentTime = savedAppointment.getAppointmentTime().toString();
            
            emailService.sendBookingRequestConfirmationEmail(customerEmail, customerName, serviceName, appointmentDate, appointmentTime);
        } catch (Exception e) {
            // Log error but don't fail the appointment creation
            System.err.println("Failed to send booking confirmation email: " + e.getMessage());
        }

        return mapToResponse(savedAppointment);
    }

    @Override
    @Transactional(readOnly = true)
    public List<AppointmentResponse> getAppointmentsByUser(String userEmail) {
        User customer = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new NoSuchElementException("User not found"));

        List<Appointment> appointments = appointmentRepository.findByCustomerOrderByAppointmentDateDescAppointmentTimeDesc(customer);

        return appointments.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<AppointmentResponse> getAppointmentsByDate(LocalDate date) {
        List<Appointment> appointments = appointmentRepository.findByAppointmentDateAndStatusIn(
                date,
                List.of(AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED)
        );
        return appointments.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Override
    public AppointmentResponse cancelAppointment(Long appointmentId, String userEmail) {
        User customer = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new NoSuchElementException("User not found"));

        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new NoSuchElementException("Appointment not found"));

        if (!appointment.getCustomer().getId().equals(customer.getId())) {
            throw new IllegalArgumentException("You are not authorized to cancel this appointment");
        }

        if (appointment.getStatus() != AppointmentStatus.PENDING && appointment.getStatus() != AppointmentStatus.CONFIRMED) {
            throw new IllegalStateException("Only pending or confirmed appointments can be cancelled");
        }

        appointment.setStatus(AppointmentStatus.CANCELLED);
        Appointment updatedAppointment = appointmentRepository.save(appointment);

        return mapToResponse(updatedAppointment);
    }

    @Override
    @Transactional(readOnly = true)
    public List<AppointmentResponse> getAllAppointments() {
        List<Appointment> appointments = appointmentRepository.findAllByOrderByAppointmentDateDescAppointmentTimeDesc();
        return appointments.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Override
    public AppointmentResponse approveAppointment(Long appointmentId) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new NoSuchElementException("Appointment not found"));

        if (appointment.getStatus() != AppointmentStatus.PENDING) {
            throw new IllegalStateException("Only pending appointments can be approved");
        }

        appointment.setStatus(AppointmentStatus.CONFIRMED);
        Appointment updatedAppointment = appointmentRepository.save(appointment);
        
        // Fetch all required data BEFORE spawning background thread to avoid Hibernate session issues
        String customerEmail = updatedAppointment.getCustomer().getEmail();
        String customerName = updatedAppointment.getCustomer().getFirstName() + " " + updatedAppointment.getCustomer().getLastName();
        String serviceName = updatedAppointment.getService().getName();
        String appointmentDate = updatedAppointment.getAppointmentDate().toString();
        String appointmentTime = updatedAppointment.getAppointmentTime().toString();
        
        // Send approval email to customer ASYNCHRONOUSLY - don't block the response
        new Thread(() -> {
            try {
                emailService.sendAppointmentApprovedEmail(customerEmail, customerName, serviceName, appointmentDate, appointmentTime);
            } catch (Exception e) {
                // Log error but don't fail the appointment approval (since it's already saved)
                System.err.println("Failed to send approval email (async): " + e.getMessage());
            }
        }).start();
        
        return mapToResponse(updatedAppointment);
    }

    @Override
    public AppointmentResponse rejectAppointment(Long appointmentId) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new NoSuchElementException("Appointment not found"));

        if (appointment.getStatus() != AppointmentStatus.PENDING) {
            throw new IllegalStateException("Only pending appointments can be rejected");
        }

        appointment.setStatus(AppointmentStatus.REJECTED);
        Appointment updatedAppointment = appointmentRepository.save(appointment);
        
        // Fetch all required data BEFORE spawning background thread to avoid Hibernate session issues
        String customerEmail = updatedAppointment.getCustomer().getEmail();
        String customerName = updatedAppointment.getCustomer().getFirstName() + " " + updatedAppointment.getCustomer().getLastName();
        String serviceName = updatedAppointment.getService().getName();
        String appointmentDate = updatedAppointment.getAppointmentDate().toString();
        String appointmentTime = updatedAppointment.getAppointmentTime().toString();
        
        // Send rejection email to customer ASYNCHRONOUSLY - don't block the response
        new Thread(() -> {
            try {
                emailService.sendAppointmentRejectedEmail(customerEmail, customerName, serviceName, appointmentDate, appointmentTime);
            } catch (Exception e) {
                // Log error but don't fail the appointment rejection (since it's already saved)
                System.err.println("Failed to send rejection email (async): " + e.getMessage());
            }
        }).start();
        
        // Send appointment cancellation notification to admin
        try {
            emailService.sendAppointmentCancellationNotificationToAdmin(
                    customerName,
                    serviceName,
                    appointmentDate,
                    "Admin rejected/cancelled this appointment"
            );
        } catch (Exception e) {
            // Log error but don't fail the appointment rejection (since it's already saved)
            System.err.println("Failed to send appointment cancellation notification to admin: " + e.getMessage());
        }
        
        return mapToResponse(updatedAppointment);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getSlotAvailability(LocalDate date) {
        // Get day of week for the requested date
        java.time.DayOfWeek dayOfWeek = date.getDayOfWeek();
        
        // Get all base time slots for this day of week
        List<TimeSlot> baseTimeSlots = timeSlotRepository.findByDayOfWeekAndIsActiveTrue(dayOfWeek);
        
        // Get all appointments for this date
        List<Appointment> appointments = appointmentRepository.findByAppointmentDateAndStatusIn(
                date,
                List.of(AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED)
        );
        
        // Build availability info for each individual appointment slot (generated from base slots)
        List<Map<String, Object>> availabilityList = new java.util.ArrayList<>();
        
        for (TimeSlot baseSlot : baseTimeSlots) {
            // Generate individual appointment slots from the base time slot
            LocalTime currentTime = baseSlot.getStartTime();
            int duration = baseSlot.getAppointmentDuration() != null ? baseSlot.getAppointmentDuration() : 30;
            
            while (currentTime.plusMinutes(duration).isBefore(baseSlot.getEndTime()) || 
                   currentTime.plusMinutes(duration).equals(baseSlot.getEndTime())) {
                
                // Create final variables for use in lambda/conditions
                final LocalTime slotStartTime = currentTime;
                final LocalTime slotEndTime = currentTime.plusMinutes(duration);
                
                // Check if this slot overlaps with any active break periods
                boolean isBreakTime = baseSlot.getBreaks().stream()
                        .filter(Break::getIsActive)
                        .anyMatch(breakPeriod -> {
                            LocalTime breakStart = breakPeriod.getStartTime();
                            LocalTime breakEnd = breakPeriod.getEndTime();
                            // Check if slot overlaps with break
                            return slotStartTime.isBefore(breakEnd) && slotEndTime.isAfter(breakStart);
                        });
                
                // Skip this slot if it overlaps with a break
                if (isBreakTime) {
                    currentTime = slotEndTime;
                    continue;
                }
                
                // Count appointments that overlap with this individual appointment slot
                long bookedCount = appointments.stream()
                        .filter(apt -> {
                            LocalTime aptStart = apt.getAppointmentTime();
                            LocalTime aptEnd = aptStart.plusMinutes(apt.getService().getDurationMinutes());
                            // Check if appointment overlaps with this appointment slot
                            return aptStart.isBefore(slotEndTime) && aptEnd.isAfter(slotStartTime);
                        })
                        .count();
                
                int availableSpots = Math.max(0, baseSlot.getCapacity() - (int) bookedCount);
                
                Map<String, Object> info = new java.util.HashMap<>();
                info.put("time", slotStartTime.toString().substring(0, 5)); // HH:MM format
                info.put("booked", bookedCount);
                info.put("capacity", baseSlot.getCapacity());
                info.put("available", availableSpots);
                info.put("isFull", availableSpots == 0);
                
                availabilityList.add(info);
                
                currentTime = slotEndTime;
            }
        }
        
        return availabilityList;
    }

    private AppointmentResponse mapToResponse(Appointment appointment) {
        AppointmentResponse response = new AppointmentResponse();
        response.setId(appointment.getId());
        response.setCustomerId(appointment.getCustomer().getId());
        response.setCustomerName(appointment.getCustomer().getFirstName() + " " + appointment.getCustomer().getLastName());
        response.setServiceId(appointment.getService().getId());
        response.setServiceName(appointment.getService().getName());
        response.setDate(appointment.getAppointmentDate());
        response.setTime(appointment.getAppointmentTime());
        response.setStatus(appointment.getStatus());
        return response;
    }

    @Override
    public long getPendingAppointmentCount() {
        return appointmentRepository.countByStatus(AppointmentStatus.PENDING);
    }

    @Override
    public Map<String, Integer> getCustomerAppointmentCounts(String userEmail) {
        User customer = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + userEmail));
        
        Map<String, Integer> counts = new HashMap<>();
        counts.put("pending", (int) appointmentRepository.countByCustomerIdAndStatus(customer.getId(), AppointmentStatus.PENDING));
        counts.put("confirmed", (int) appointmentRepository.countByCustomerIdAndStatus(customer.getId(), AppointmentStatus.CONFIRMED));
        counts.put("cancelled", (int) appointmentRepository.countByCustomerIdAndStatus(customer.getId(), AppointmentStatus.CANCELLED));
        counts.put("rejected", (int) appointmentRepository.countByCustomerIdAndStatus(customer.getId(), AppointmentStatus.REJECTED));
        return counts;
    }
}
