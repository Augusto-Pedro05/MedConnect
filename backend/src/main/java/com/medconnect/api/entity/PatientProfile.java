package com.medconnect.api.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

/**
 * Extended profile for users with PATIENT role.
 * Linked 1:1 with the User entity.
 */
@Entity
@Table(name = "patient_profiles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PatientProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    private LocalDate dateOfBirth;

    @Column(length = 10)
    private String bloodType;

    @Column(length = 500)
    private String allergies;
}
