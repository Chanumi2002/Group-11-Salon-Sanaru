package com.sanaru.backend.service.impl;

import com.sanaru.backend.dto.AppointmentRequest;
import com.sanaru.backend.dto.AppointmentResponse;
import com.sanaru.backend.enums.AppointmentStatus;
import com.sanaru.backend.model.Appointment;
import com.sanaru.backend.model.Service;
import com.sanaru.backend.model.TimeSlot;
import com.sanaru.backend.model.User;
import com.sanaru.backend.repository.AppointmentRepository;
import com.sanaru.backend.repository.ServiceRepository;
import com.sanaru.backend.repository.TimeSlotRepository;
import com.sanaru.backend.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TimeSlotCapacityTest {

    @Mock
    private AppointmentRepository appointmentRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private ServiceRepository serviceRepository;

    @Mock
    private TimeSlotRepository timeSlotRepository;

    @InjectMocks
    private AppointmentServiceImpl appointmentService;

    private User testCustomer1;
    private User testCustomer2;
    private User testCustomer3;
    private Service testService;
    private TimeSlot capacityOneSlot;
    private TimeSlot capacityThreeSlot;
    private AppointmentRequest validRequest;
    private LocalDate testDate;

    @BeforeEach
    void setUp() {
        testDate = LocalDate.of(2024, 4, 15); // Monday

        // Customer 1
        testCustomer1 = new User();
        testCustomer1.setId(1L);
        testCustomer1.setEmail("customer1@test.com");
        testCustomer1.setFirstName("John");
        testCustomer1.setLastName("Doe");

        // Customer 2
        testCustomer2 = new User();
        testCustomer2.setId(2L);
        testCustomer2.setEmail("customer2@test.com");
        testCustomer2.setFirstName("Jane");
        testCustomer2.setLastName("Smith");

        // Customer 3
        testCustomer3 = new User();
        testCustomer3.setId(3L);
        testCustomer3.setEmail("customer3@test.com");
        testCustomer3.setFirstName("Bob");
        testCustomer3.setLastName("Johnson");

        // Service (30 minute duration)
        testService = new Service();
        testService.setId(1L);
        testService.setName("Haircut");
        testService.setDurationMinutes(30);

        // Time slot with capacity 1 (single beautician)
        capacityOneSlot = new TimeSlot();
        capacityOneSlot.setId(1L);
        capacityOneSlot.setDayOfWeek(DayOfWeek.MONDAY);
        capacityOneSlot.setStartTime(LocalTime.of(9, 0));
        capacityOneSlot.setEndTime(LocalTime.of(17, 0));
        capacityOneSlot.setCapacity(1);
        capacityOneSlot.setIsActive(true);

        // Time slot with capacity 3 (3 beauticians)
        capacityThreeSlot = new TimeSlot();
        capacityThreeSlot.setId(2L);
        capacityThreeSlot.setDayOfWeek(DayOfWeek.MONDAY);
        capacityThreeSlot.setStartTime(LocalTime.of(9, 0));
        capacityThreeSlot.setEndTime(LocalTime.of(17, 0));
        capacityThreeSlot.setCapacity(3);
        capacityThreeSlot.setIsActive(true);

        // Valid appointment request (10AM)
        validRequest = new AppointmentRequest();
        validRequest.setServiceId(1L);
        validRequest.setDate(testDate);
        validRequest.setTime(LocalTime.of(10, 0));
    }

    // ==================== CAPACITY 1 (SINGLE BEAUTICIAN) TESTS ====================

    @Test
    void testCapacityOne_FirstBooking_Success() {
        when(userRepository.findByEmail("customer1@test.com")).thenReturn(Optional.of(testCustomer1));
        when(serviceRepository.findById(1L)).thenReturn(Optional.of(testService));
        when(appointmentRepository.findByAppointmentDateAndStatusIn(testDate,
                List.of(AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED)))
                .thenReturn(Arrays.asList());
        when(timeSlotRepository.findByDayOfWeekAndIsActiveTrue(DayOfWeek.MONDAY))
                .thenReturn(Arrays.asList(capacityOneSlot));

        Appointment mockAppointment = new Appointment();
        mockAppointment.setId(1L);
        mockAppointment.setCustomer(testCustomer1);
        mockAppointment.setService(testService);
        mockAppointment.setAppointmentDate(testDate);
        mockAppointment.setAppointmentTime(LocalTime.of(10, 0));
        mockAppointment.setStatus(AppointmentStatus.PENDING);

        when(appointmentRepository.save(any(Appointment.class))).thenReturn(mockAppointment);

        AppointmentResponse response = appointmentService.createAppointment(validRequest, "customer1@test.com");

        assertNotNull(response);
        verify(appointmentRepository, times(1)).save(any(Appointment.class));
    }

    @Test
    void testCapacityOne_SecondBookingSameTime_Fails() {
        // Existing appointment at same time
        Appointment existingAppointment = new Appointment();
        existingAppointment.setId(1L);
        existingAppointment.setAppointmentTime(LocalTime.of(10, 0));
        existingAppointment.setService(testService);
        existingAppointment.setStatus(AppointmentStatus.CONFIRMED);

        when(userRepository.findByEmail("customer2@test.com")).thenReturn(Optional.of(testCustomer2));
        when(serviceRepository.findById(1L)).thenReturn(Optional.of(testService));
        when(appointmentRepository.findByAppointmentDateAndStatusIn(testDate,
                List.of(AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED)))
                .thenReturn(Arrays.asList(existingAppointment));
        when(timeSlotRepository.findByDayOfWeekAndIsActiveTrue(DayOfWeek.MONDAY))
                .thenReturn(Arrays.asList(capacityOneSlot));

        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> {
            appointmentService.createAppointment(validRequest, "customer2@test.com");
        });

        assertEquals("Time slot is fully booked. No available spots for this time.", exception.getMessage());
        verify(appointmentRepository, never()).save(any(Appointment.class));
    }

    @Test
    void testCapacityOne_DifferentTimeAllowed() {
        // Existing appointment at 10AM
        Appointment existingAppointment = new Appointment();
        existingAppointment.setId(1L);
        existingAppointment.setAppointmentTime(LocalTime.of(10, 0));
        existingAppointment.setService(testService);
        existingAppointment.setStatus(AppointmentStatus.CONFIRMED);

        // New request for 11AM (no overlap)
        AppointmentRequest newRequest = new AppointmentRequest();
        newRequest.setServiceId(1L);
        newRequest.setDate(testDate);
        newRequest.setTime(LocalTime.of(11, 0));

        when(userRepository.findByEmail("customer2@test.com")).thenReturn(Optional.of(testCustomer2));
        when(serviceRepository.findById(1L)).thenReturn(Optional.of(testService));
        when(appointmentRepository.findByAppointmentDateAndStatusIn(testDate,
                List.of(AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED)))
                .thenReturn(Arrays.asList(existingAppointment));
        when(timeSlotRepository.findByDayOfWeekAndIsActiveTrue(DayOfWeek.MONDAY))
                .thenReturn(Arrays.asList(capacityOneSlot));

        Appointment mockAppointment = new Appointment();
        mockAppointment.setId(2L);
        mockAppointment.setCustomer(testCustomer2);
        mockAppointment.setService(testService);
        mockAppointment.setAppointmentDate(testDate);
        mockAppointment.setAppointmentTime(LocalTime.of(11, 0));
        mockAppointment.setStatus(AppointmentStatus.PENDING);

        when(appointmentRepository.save(any(Appointment.class))).thenReturn(mockAppointment);

        AppointmentResponse response = appointmentService.createAppointment(newRequest, "customer2@test.com");

        assertNotNull(response);
        verify(appointmentRepository, times(1)).save(any(Appointment.class));
    }

    // ==================== CAPACITY 3 (MULTIPLE BEAUTICIANS) TESTS ====================

    @Test
    void testCapacityThree_FirstBooking_Success() {
        when(userRepository.findByEmail("customer1@test.com")).thenReturn(Optional.of(testCustomer1));
        when(serviceRepository.findById(1L)).thenReturn(Optional.of(testService));
        when(appointmentRepository.findByAppointmentDateAndStatusIn(testDate,
                List.of(AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED)))
                .thenReturn(Arrays.asList());
        when(timeSlotRepository.findByDayOfWeekAndIsActiveTrue(DayOfWeek.MONDAY))
                .thenReturn(Arrays.asList(capacityThreeSlot));

        Appointment mockAppointment = new Appointment();
        mockAppointment.setId(1L);
        mockAppointment.setCustomer(testCustomer1);
        mockAppointment.setService(testService);
        mockAppointment.setAppointmentDate(testDate);
        mockAppointment.setAppointmentTime(LocalTime.of(10, 0));
        mockAppointment.setStatus(AppointmentStatus.PENDING);

        when(appointmentRepository.save(any(Appointment.class))).thenReturn(mockAppointment);

        AppointmentResponse response = appointmentService.createAppointment(validRequest, "customer1@test.com");

        assertNotNull(response);
        verify(appointmentRepository, times(1)).save(any(Appointment.class));
    }

    @Test
    void testCapacityThree_SecondBookingSameTime_Success() {
        // Existing appointment at same time
        Appointment existingAppointment = new Appointment();
        existingAppointment.setId(1L);
        existingAppointment.setAppointmentTime(LocalTime.of(10, 0));
        existingAppointment.setService(testService);
        existingAppointment.setStatus(AppointmentStatus.CONFIRMED);

        when(userRepository.findByEmail("customer2@test.com")).thenReturn(Optional.of(testCustomer2));
        when(serviceRepository.findById(1L)).thenReturn(Optional.of(testService));
        when(appointmentRepository.findByAppointmentDateAndStatusIn(testDate,
                List.of(AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED)))
                .thenReturn(Arrays.asList(existingAppointment));
        when(timeSlotRepository.findByDayOfWeekAndIsActiveTrue(DayOfWeek.MONDAY))
                .thenReturn(Arrays.asList(capacityThreeSlot));

        Appointment mockAppointment = new Appointment();
        mockAppointment.setId(2L);
        mockAppointment.setCustomer(testCustomer2);
        mockAppointment.setService(testService);
        mockAppointment.setAppointmentDate(testDate);
        mockAppointment.setAppointmentTime(LocalTime.of(10, 0));
        mockAppointment.setStatus(AppointmentStatus.PENDING);

        when(appointmentRepository.save(any(Appointment.class))).thenReturn(mockAppointment);

        AppointmentResponse response = appointmentService.createAppointment(validRequest, "customer2@test.com");

        assertNotNull(response);
        assertEquals(response.getAppointmentTime(), LocalTime.of(10, 0));
        verify(appointmentRepository, times(1)).save(any(Appointment.class));
    }

    @Test
    void testCapacityThree_ThirdBookingSameTime_Success() {
        // Two existing appointments at same time
        Appointment existingAppointment1 = new Appointment();
        existingAppointment1.setId(1L);
        existingAppointment1.setAppointmentTime(LocalTime.of(10, 0));
        existingAppointment1.setService(testService);
        existingAppointment1.setStatus(AppointmentStatus.CONFIRMED);

        Appointment existingAppointment2 = new Appointment();
        existingAppointment2.setId(2L);
        existingAppointment2.setAppointmentTime(LocalTime.of(10, 0));
        existingAppointment2.setService(testService);
        existingAppointment2.setStatus(AppointmentStatus.CONFIRMED);

        when(userRepository.findByEmail("customer3@test.com")).thenReturn(Optional.of(testCustomer3));
        when(serviceRepository.findById(1L)).thenReturn(Optional.of(testService));
        when(appointmentRepository.findByAppointmentDateAndStatusIn(testDate,
                List.of(AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED)))
                .thenReturn(Arrays.asList(existingAppointment1, existingAppointment2));
        when(timeSlotRepository.findByDayOfWeekAndIsActiveTrue(DayOfWeek.MONDAY))
                .thenReturn(Arrays.asList(capacityThreeSlot));

        Appointment mockAppointment = new Appointment();
        mockAppointment.setId(3L);
        mockAppointment.setCustomer(testCustomer3);
        mockAppointment.setService(testService);
        mockAppointment.setAppointmentDate(testDate);
        mockAppointment.setAppointmentTime(LocalTime.of(10, 0));
        mockAppointment.setStatus(AppointmentStatus.PENDING);

        when(appointmentRepository.save(any(Appointment.class))).thenReturn(mockAppointment);

        AppointmentResponse response = appointmentService.createAppointment(validRequest, "customer3@test.com");

        assertNotNull(response);
        verify(appointmentRepository, times(1)).save(any(Appointment.class));
    }

    @Test
    void testCapacityThree_FourthBookingSameTime_Fails() {
        // Three existing appointments at same time (capacity reached)
        Appointment existingAppointment1 = new Appointment();
        existingAppointment1.setId(1L);
        existingAppointment1.setAppointmentTime(LocalTime.of(10, 0));
        existingAppointment1.setService(testService);
        existingAppointment1.setStatus(AppointmentStatus.CONFIRMED);

        Appointment existingAppointment2 = new Appointment();
        existingAppointment2.setId(2L);
        existingAppointment2.setAppointmentTime(LocalTime.of(10, 0));
        existingAppointment2.setService(testService);
        existingAppointment2.setStatus(AppointmentStatus.CONFIRMED);

        Appointment existingAppointment3 = new Appointment();
        existingAppointment3.setId(3L);
        existingAppointment3.setAppointmentTime(LocalTime.of(10, 0));
        existingAppointment3.setService(testService);
        existingAppointment3.setStatus(AppointmentStatus.CONFIRMED);

        when(userRepository.findByEmail("customer1@test.com")).thenReturn(Optional.of(testCustomer1));
        when(serviceRepository.findById(1L)).thenReturn(Optional.of(testService));
        when(appointmentRepository.findByAppointmentDateAndStatusIn(testDate,
                List.of(AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED)))
                .thenReturn(Arrays.asList(existingAppointment1, existingAppointment2, existingAppointment3));
        when(timeSlotRepository.findByDayOfWeekAndIsActiveTrue(DayOfWeek.MONDAY))
                .thenReturn(Arrays.asList(capacityThreeSlot));

        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> {
            appointmentService.createAppointment(validRequest, "customer1@test.com");
        });

        assertEquals("Time slot is fully booked. No available spots for this time.", exception.getMessage());
        verify(appointmentRepository, never()).save(any(Appointment.class));
    }

    @Test
    void testCapacityThree_PartialOverlap_CountsTowardCapacity() {
        // Existing appointment 10:00-10:30, new request 10:15-10:45 (overlaps)
        Appointment existingAppointment1 = new Appointment();
        existingAppointment1.setId(1L);
        existingAppointment1.setAppointmentTime(LocalTime.of(10, 0));
        existingAppointment1.setService(testService); // 30 min duration: 10:00-10:30
        existingAppointment1.setStatus(AppointmentStatus.CONFIRMED);

        Appointment existingAppointment2 = new Appointment();
        existingAppointment2.setId(2L);
        existingAppointment2.setAppointmentTime(LocalTime.of(10, 15));
        existingAppointment2.setService(testService); // 30 min: 10:15-10:45
        existingAppointment2.setStatus(AppointmentStatus.CONFIRMED);

        // Third request at 10:15-10:45
        AppointmentRequest thirdRequest = new AppointmentRequest();
        thirdRequest.setServiceId(1L);
        thirdRequest.setDate(testDate);
        thirdRequest.setTime(LocalTime.of(10, 15));

        when(userRepository.findByEmail("customer3@test.com")).thenReturn(Optional.of(testCustomer3));
        when(serviceRepository.findById(1L)).thenReturn(Optional.of(testService));
        when(appointmentRepository.findByAppointmentDateAndStatusIn(testDate,
                List.of(AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED)))
                .thenReturn(Arrays.asList(existingAppointment1, existingAppointment2));
        when(timeSlotRepository.findByDayOfWeekAndIsActiveTrue(DayOfWeek.MONDAY))
                .thenReturn(Arrays.asList(capacityThreeSlot));

        Appointment mockAppointment = new Appointment();
        mockAppointment.setId(3L);
        mockAppointment.setCustomer(testCustomer3);
        mockAppointment.setService(testService);
        mockAppointment.setAppointmentDate(testDate);
        mockAppointment.setAppointmentTime(LocalTime.of(10, 15));
        mockAppointment.setStatus(AppointmentStatus.PENDING);

        when(appointmentRepository.save(any(Appointment.class))).thenReturn(mockAppointment);

        // Should succeed since only 2 overlaps count (capacity is 3)
        AppointmentResponse response = appointmentService.createAppointment(thirdRequest, "customer3@test.com");

        assertNotNull(response);
        verify(appointmentRepository, times(1)).save(any(Appointment.class));
    }

    @Test
    void testCapacityEnforcement_AllStatusesCount() {
        // Both PENDING and CONFIRMED should count toward capacity
        Appointment pendingAppointment = new Appointment();
        pendingAppointment.setId(1L);
        pendingAppointment.setAppointmentTime(LocalTime.of(10, 0));
        pendingAppointment.setService(testService);
        pendingAppointment.setStatus(AppointmentStatus.PENDING);

        Appointment confirmedAppointment = new Appointment();
        confirmedAppointment.setId(2L);
        confirmedAppointment.setAppointmentTime(LocalTime.of(10, 0));
        confirmedAppointment.setService(testService);
        confirmedAppointment.setStatus(AppointmentStatus.CONFIRMED);

        when(userRepository.findByEmail("customer3@test.com")).thenReturn(Optional.of(testCustomer3));
        when(serviceRepository.findById(1L)).thenReturn(Optional.of(testService));
        when(appointmentRepository.findByAppointmentDateAndStatusIn(testDate,
                List.of(AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED)))
                .thenReturn(Arrays.asList(pendingAppointment, confirmedAppointment));
        when(timeSlotRepository.findByDayOfWeekAndIsActiveTrue(DayOfWeek.MONDAY))
                .thenReturn(Arrays.asList(capacityThreeSlot));

        // Capacity 3, but only 2 slots available (1 pending + 1 confirmed)
        Appointment mockAppointment = new Appointment();
        mockAppointment.setId(3L);
        mockAppointment.setCustomer(testCustomer3);
        mockAppointment.setService(testService);
        mockAppointment.setAppointmentDate(testDate);
        mockAppointment.setAppointmentTime(LocalTime.of(10, 0));
        mockAppointment.setStatus(AppointmentStatus.PENDING);

        when(appointmentRepository.save(any(Appointment.class))).thenReturn(mockAppointment);

        AppointmentResponse response = appointmentService.createAppointment(validRequest, "customer3@test.com");

        assertNotNull(response);
        verify(appointmentRepository, times(1)).save(any(Appointment.class));
    }
}
