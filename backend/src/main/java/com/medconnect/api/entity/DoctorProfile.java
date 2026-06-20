package com.medconnect.api.entity;

import jakarta.persistence.*;
import lombok.*;

/**
 * Extended profile for users with DOCTOR role.
 * Linked 1:1 with the User entity.
 */
@Entity
@Table(name = "doctor_profiles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DoctorProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(nullable = false)
    private String specialty;

    @Column(nullable = false, unique = true)
    private String licenseNumber;

    @Column(length = 1000)
    private String bio;
}
