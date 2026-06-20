package com.medconnect.api.service;

import com.medconnect.api.dto.AppointmentRequest;
import com.medconnect.api.dto.AppointmentResponse;
import com.medconnect.api.entity.*;
import com.medconnect.api.exception.*;
import com.medconnect.api.repository.AppointmentRepository;
import com.medconnect.api.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final UserRepository userRepository;

    public AppointmentService(AppointmentRepository appointmentRepository,
                              UserRepository userRepository) {
        this.appointmentRepository = appointmentRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public AppointmentResponse bookAppointment(AppointmentRequest request, String patientEmail) {
        User patient = userRepository.findByEmail(patientEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found"));

        if (patient.getRole() != Role.PATIENT) {
            throw new BadRequestException("Only patients can book appointments");
        }

        User doctor = userRepository.findById(request.getDoctorId())
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found with id: " + request.getDoctorId()));

        if (doctor.getRole() != Role.DOCTOR) {
            throw new BadRequestException("Selected user is not a doctor");
        }

        // Scheduling rules: must be in the future
        if (request.getDateTime().isBefore(LocalDateTime.now())) {
            throw new BadRequestException("Appointment must be scheduled in the future");
        }

        // Scheduling rules: 30-minute slot alignment
        if (request.getDateTime().getMinute() % 30 != 0) {
            throw new BadRequestException("Appointments must be scheduled on 30-minute intervals (e.g. :00 or :30)");
        }

        // Scheduling rules: no double-booking
        if (appointmentRepository.existsConflict(doctor.getId(), request.getDateTime())) {
            throw new ConflictException("Doctor already has an appointment at this time slot");
        }

        Appointment appointment = Appointment.builder()
                .patient(patient)
                .doctor(doctor)
                .dateTime(request.getDateTime())
                .durationMinutes(30)
                .status(AppointmentStatus.SCHEDULED)
                .notes(request.getNotes())
                .build();

        appointment = appointmentRepository.save(appointment);
        return toResponse(appointment);
    }

    public List<AppointmentResponse> getAppointmentsForUser(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        List<Appointment> appointments;
        if (user.getRole() == Role.DOCTOR) {
            appointments = appointmentRepository.findByDoctorIdOrderByDateTimeDesc(user.getId());
        } else {
            appointments = appointmentRepository.findByPatientIdOrderByDateTimeDesc(user.getId());
        }

        return appointments.stream().map(this::toResponse).collect(Collectors.toList());
    }

    public AppointmentResponse getAppointmentById(Long id, String email) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found with id: " + id));

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // RBAC: only the patient or doctor of this appointment can view it
        if (!appointment.getPatient().getId().equals(user.getId())
                && !appointment.getDoctor().getId().equals(user.getId())) {
            throw new UnauthorizedException("You are not authorized to view this appointment");
        }

        return toResponse(appointment);
    }

    @Transactional
    public AppointmentResponse updateStatus(Long id, String status, String email) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found"));

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // RBAC: only the patient or doctor of this appointment can update it
        if (!appointment.getPatient().getId().equals(user.getId())
                && !appointment.getDoctor().getId().equals(user.getId())) {
            throw new UnauthorizedException("You are not authorized to update this appointment");
        }

        AppointmentStatus newStatus;
        try {
            newStatus = AppointmentStatus.valueOf(status.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Invalid status. Must be SCHEDULED, COMPLETED, or CANCELLED");
        }

        appointment.setStatus(newStatus);
        appointment = appointmentRepository.save(appointment);
        return toResponse(appointment);
    }

    private AppointmentResponse toResponse(Appointment appointment) {
        return AppointmentResponse.builder()
                .id(appointment.getId())
                .patientId(appointment.getPatient().getId())
                .patientName(appointment.getPatient().getFirstName() + " " + appointment.getPatient().getLastName())
                .doctorId(appointment.getDoctor().getId())
                .doctorName(appointment.getDoctor().getFirstName() + " " + appointment.getDoctor().getLastName())
                .doctorSpecialty(null) // Will be populated by controller if needed
                .dateTime(appointment.getDateTime())
                .durationMinutes(appointment.getDurationMinutes())
                .status(appointment.getStatus().name())
                .notes(appointment.getNotes())
                .build();
    }
}
