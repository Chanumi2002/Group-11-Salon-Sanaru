package com.sanaru.backend.repository;

import com.sanaru.backend.enums.AppointmentStatus;
import com.sanaru.backend.model.Appointment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {
    boolean existsByAppointmentDateAndAppointmentTimeAndStatusIn(LocalDate date, LocalTime time, List<AppointmentStatus> statuses);

    List<Appointment> findByAppointmentDateAndStatusIn(LocalDate date, List<AppointmentStatus> statuses);

    List<Appointment> findByCustomerOrderByAppointmentDateDescAppointmentTimeDesc(com.sanaru.backend.model.User customer);

    List<Appointment> findAllByOrderByAppointmentDateDescAppointmentTimeDesc();
}
