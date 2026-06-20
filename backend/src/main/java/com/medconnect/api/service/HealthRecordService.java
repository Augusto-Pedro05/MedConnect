package com.medconnect.api.service;

import com.medconnect.api.dto.HealthRecordRequest;
import com.medconnect.api.dto.HealthRecordResponse;
import com.medconnect.api.entity.*;
import com.medconnect.api.exception.BadRequestException;
import com.medconnect.api.exception.ResourceNotFoundException;
import com.medconnect.api.exception.UnauthorizedException;
import com.medconnect.api.repository.AppointmentRepository;
import com.medconnect.api.repository.HealthRecordRepository;
import com.medconnect.api.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class HealthRecordService {

    private final HealthRecordRepository healthRecordRepository;
    private final UserRepository userRepository;
    private final AppointmentRepository appointmentRepository;

    public HealthRecordService(HealthRecordRepository healthRecordRepository,
                               UserRepository userRepository,
                               AppointmentRepository appointmentRepository) {
        this.healthRecordRepository = healthRecordRepository;
        this.userRepository = userRepository;
        this.appointmentRepository = appointmentRepository;
    }

    @Transactional
    public HealthRecordResponse createRecord(HealthRecordRequest request, String doctorEmail) {
        User doctor = userRepository.findByEmail(doctorEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found"));

        if (doctor.getRole() != Role.DOCTOR) {
            throw new UnauthorizedException("Only doctors can create health records");
        }

        User patient = userRepository.findById(request.getPatientId())
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found with id: " + request.getPatientId()));

        // Data isolation: doctor must have an appointment with this patient
        List<Appointment> sharedAppointments =
                appointmentRepository.findByPatientIdAndDoctorId(patient.getId(), doctor.getId());
        if (sharedAppointments.isEmpty()) {
            throw new UnauthorizedException(
                    "You can only create records for patients you have appointments with");
        }

        Appointment appointment = null;
        if (request.getAppointmentId() != null) {
            appointment = appointmentRepository.findById(request.getAppointmentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Appointment not found"));
        }

        HealthRecord record = HealthRecord.builder()
                .patient(patient)
                .doctor(doctor)
                .appointment(appointment)
                .diagnosis(request.getDiagnosis())
                .clinicalNotes(request.getClinicalNotes())
                .prescription(request.getPrescription())
                .build();

        record = healthRecordRepository.save(record);
        return toResponse(record);
    }

    public List<HealthRecordResponse> getRecordsByPatientId(Long patientId, String currentUserEmail) {
        User currentUser = userRepository.findByEmail(currentUserEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // RBAC: patients see own records, doctors see records of assigned patients
        if (currentUser.getRole() == Role.PATIENT) {
            if (!currentUser.getId().equals(patientId)) {
                throw new UnauthorizedException("You can only view your own health records");
            }
            return healthRecordRepository.findByPatientIdOrderByCreatedAtDesc(patientId)
                    .stream().map(this::toResponse).collect(Collectors.toList());
        } else if (currentUser.getRole() == Role.DOCTOR) {
            // Doctor can only see records they created for this patient
            return healthRecordRepository
                    .findByPatientIdAndDoctorIdOrderByCreatedAtDesc(patientId, currentUser.getId())
                    .stream().map(this::toResponse).collect(Collectors.toList());
        }

        throw new UnauthorizedException("Access denied");
    }

    public HealthRecordResponse getRecordById(Long id, String currentUserEmail) {
        HealthRecord record = healthRecordRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Health record not found with id: " + id));

        User currentUser = userRepository.findByEmail(currentUserEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // RBAC check
        if (currentUser.getRole() == Role.PATIENT
                && !record.getPatient().getId().equals(currentUser.getId())) {
            throw new UnauthorizedException("You can only view your own health records");
        }
        if (currentUser.getRole() == Role.DOCTOR
                && !record.getDoctor().getId().equals(currentUser.getId())) {
            throw new UnauthorizedException("You can only view records you created");
        }

        return toResponse(record);
    }

    @Transactional
    public HealthRecordResponse updateRecord(Long id, HealthRecordRequest request, String doctorEmail) {
        HealthRecord record = healthRecordRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Health record not found"));

        User doctor = userRepository.findByEmail(doctorEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found"));

        // Only the authoring doctor can update
        if (!record.getDoctor().getId().equals(doctor.getId())) {
            throw new UnauthorizedException("You can only update records you created");
        }

        if (request.getDiagnosis() != null) record.setDiagnosis(request.getDiagnosis());
        if (request.getClinicalNotes() != null) record.setClinicalNotes(request.getClinicalNotes());
        if (request.getPrescription() != null) record.setPrescription(request.getPrescription());

        record = healthRecordRepository.save(record);
        return toResponse(record);
    }

    /**
     * DAST audit surface: verbose diagnostic endpoint.
     * Returns detailed internal data including raw entity state,
     * system info, and metadata that should not be exposed.
     */
    public Map<String, Object> getDiagnosticData(Long patientId, String currentUserEmail) {
        User currentUser = userRepository.findByEmail(currentUserEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        User patient = userRepository.findById(patientId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found with id: " + patientId));

        List<HealthRecord> records = healthRecordRepository
                .findByPatientIdOrderByCreatedAtDesc(patientId);

        // DAST target: verbose diagnostic response with internal details
        Map<String, Object> diagnosticData = new HashMap<>();
        diagnosticData.put("patientId", patient.getId());
        diagnosticData.put("patientEmail", patient.getEmail());
        diagnosticData.put("patientRole", patient.getRole().name());
        diagnosticData.put("totalRecords", records.size());
        diagnosticData.put("requestedBy", currentUser.getEmail());
        diagnosticData.put("requestedByRole", currentUser.getRole().name());
        diagnosticData.put("requestedById", currentUser.getId());
        diagnosticData.put("serverTime", java.time.LocalDateTime.now().toString());
        diagnosticData.put("javaVersion", System.getProperty("java.version"));
        diagnosticData.put("osName", System.getProperty("os.name"));
        diagnosticData.put("records", records.stream().map(r -> {
            Map<String, Object> recordMap = new HashMap<>();
            recordMap.put("id", r.getId());
            recordMap.put("diagnosis", r.getDiagnosis());
            recordMap.put("clinicalNotes", r.getClinicalNotes());
            recordMap.put("prescription", r.getPrescription());
            recordMap.put("doctorId", r.getDoctor().getId());
            recordMap.put("doctorEmail", r.getDoctor().getEmail());
            recordMap.put("createdAt", r.getCreatedAt() != null ? r.getCreatedAt().toString() : null);
            return recordMap;
        }).collect(Collectors.toList()));

        return diagnosticData;
    }

    private HealthRecordResponse toResponse(HealthRecord record) {
        return HealthRecordResponse.builder()
                .id(record.getId())
                .patientId(record.getPatient().getId())
                .patientName(record.getPatient().getFirstName() + " " + record.getPatient().getLastName())
                .doctorId(record.getDoctor().getId())
                .doctorName(record.getDoctor().getFirstName() + " " + record.getDoctor().getLastName())
                .appointmentId(record.getAppointment() != null ? record.getAppointment().getId() : null)
                .diagnosis(record.getDiagnosis())
                .clinicalNotes(record.getClinicalNotes())
                .prescription(record.getPrescription())
                .createdAt(record.getCreatedAt())
                .build();
    }
}
