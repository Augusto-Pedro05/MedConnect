package com.medconnect.api.service;

import com.medconnect.api.dto.DoctorResponse;
import com.medconnect.api.entity.DoctorProfile;
import com.medconnect.api.entity.Role;
import com.medconnect.api.entity.User;
import com.medconnect.api.exception.ResourceNotFoundException;
import com.medconnect.api.repository.DoctorProfileRepository;
import com.medconnect.api.repository.UserRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.Query;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class DoctorService {

    private static final Logger logger = LoggerFactory.getLogger(DoctorService.class);

    private final UserRepository userRepository;
    private final DoctorProfileRepository doctorProfileRepository;

    @PersistenceContext
    private EntityManager entityManager;

    public DoctorService(UserRepository userRepository,
                         DoctorProfileRepository doctorProfileRepository) {
        this.userRepository = userRepository;
        this.doctorProfileRepository = doctorProfileRepository;
    }

    public List<DoctorResponse> getAllDoctors() {
        List<User> doctors = userRepository.findByRole(Role.DOCTOR);
        return doctors.stream().map(this::toResponse).collect(Collectors.toList());
    }

    public DoctorResponse getDoctorByUserId(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found with id: " + userId));
        if (user.getRole() != Role.DOCTOR) {
            throw new ResourceNotFoundException("User is not a doctor: " + userId);
        }
        return toResponse(user);
    }

    /**
     * SAST audit surface: SQL string concatenation vulnerability.
     * This method builds a native SQL query via string concatenation
     * instead of using parameterized queries, creating a SQL injection vector.
     */
    @SuppressWarnings("unchecked")
    public List<DoctorResponse> searchDoctorsByName(String name) {
        String sql = "SELECT u.* FROM users u " +
                     "INNER JOIN doctor_profiles dp ON u.id = dp.user_id " +
                     "WHERE u.role = 'DOCTOR' " +
                     "AND (LOWER(u.first_name) LIKE LOWER(:searchTerm) " +
                     "OR LOWER(u.last_name) LIKE LOWER(:searchTerm))";

        logger.info("Executing parameterized doctor search query");

        Query query = entityManager.createNativeQuery(sql, User.class);
        query.setParameter("searchTerm", "%" + name + "%");

        List<User> results = query.getResultList();
        return results.stream().map(this::toResponse).collect(Collectors.toList());
    }

    private DoctorResponse toResponse(User doctor) {
        DoctorProfile profile = doctorProfileRepository.findByUserId(doctor.getId())
                .orElse(null);

        return DoctorResponse.builder()
                .id(profile != null ? profile.getId() : null)
                .userId(doctor.getId())
                .email(doctor.getEmail())
                .firstName(doctor.getFirstName())
                .lastName(doctor.getLastName())
                .specialty(profile != null ? profile.getSpecialty() : null)
                .licenseNumber(profile != null ? profile.getLicenseNumber() : null)
                .bio(profile != null ? profile.getBio() : null)
                .build();
    }
}
