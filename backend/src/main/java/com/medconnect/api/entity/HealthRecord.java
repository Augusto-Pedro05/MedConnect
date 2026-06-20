package com.medconnect.api.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

/**
 * Electronic Health Record (EHR) entity.
 * Stores clinical notes, diagnoses, and prescriptions.
 * Data isolation: doctors can only access records for their assigned patients.
 */
@Entity
@Table(name = "health_records")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HealthRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", nullable = false)
    private User patient;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "doctor_id", nullable = false)
    private User doctor;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "appointment_id")
    private Appointment appointment;

    @Column(nullable = false, length = 500)
    private String diagnosis;

    @Column(length = 5000)
    private String clinicalNotes;

    @Column(length = 2000)
    private String prescription;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;
}
