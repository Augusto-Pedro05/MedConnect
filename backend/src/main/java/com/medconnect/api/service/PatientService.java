package com.medconnect.api.service;

import com.medconnect.api.dto.PatientResponse;
import com.medconnect.api.dto.PatientUpdateRequest;
import com.medconnect.api.entity.PatientProfile;
import com.medconnect.api.entity.Role;
import com.medconnect.api.entity.User;
import com.medconnect.api.exception.ResourceNotFoundException;
import com.medconnect.api.exception.UnauthorizedException;
import com.medconnect.api.repository.PatientProfileRepository;
import com.medconnect.api.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

@Service
public class PatientService {

    private final UserRepository userRepository;
    private final PatientProfileRepository patientProfileRepository;

    public PatientService(UserRepository userRepository,
                          PatientProfileRepository patientProfileRepository) {
        this.userRepository = userRepository;
        this.patientProfileRepository = patientProfileRepository;
    }

    public PatientResponse getPatientByUserId(Long userId, String currentUserEmail) {
        User currentUser = userRepository.findByEmail(currentUserEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Current user not found"));

        // RBAC: patients can only view their own profile
        if (currentUser.getRole() == Role.PATIENT && !currentUser.getId().equals(userId)) {
            throw new UnauthorizedException("You can only access your own patient profile");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found with id: " + userId));

        return toResponse(user);
    }

    @Transactional
    public PatientResponse updatePatient(Long userId, PatientUpdateRequest request, String currentUserEmail) {
        User currentUser = userRepository.findByEmail(currentUserEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Current user not found"));

        // Only the patient themselves can update their profile
        if (!currentUser.getId().equals(userId)) {
            throw new UnauthorizedException("You can only update your own profile");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found"));

        if (request.getFirstName() != null) user.setFirstName(request.getFirstName());
        if (request.getLastName() != null) user.setLastName(request.getLastName());
        userRepository.save(user);

        PatientProfile profile = patientProfileRepository.findByUserId(userId)
                .orElse(PatientProfile.builder().user(user).build());

        if (request.getDateOfBirth() != null) {
            profile.setDateOfBirth(LocalDate.parse(request.getDateOfBirth()));
        }
        if (request.getBloodType() != null) profile.setBloodType(request.getBloodType());
        if (request.getAllergies() != null) profile.setAllergies(request.getAllergies());

        patientProfileRepository.save(profile);
        return toResponse(user);
    }

    private PatientResponse toResponse(User user) {
        PatientProfile profile = patientProfileRepository.findByUserId(user.getId())
                .orElse(null);

        return PatientResponse.builder()
                .id(profile != null ? profile.getId() : null)
                .userId(user.getId())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .dateOfBirth(profile != null ? profile.getDateOfBirth() : null)
                .bloodType(profile != null ? profile.getBloodType() : null)
                .allergies(profile != null ? profile.getAllergies() : null)
                .build();
    }
}
