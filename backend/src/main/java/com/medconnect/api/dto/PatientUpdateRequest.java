package com.medconnect.api.dto;

import lombok.Data;

@Data
public class PatientUpdateRequest {
    private String firstName;
    private String lastName;
    private String dateOfBirth;
    private String bloodType;
    private String allergies;
}
