package com.medconnect.api.controller;

import com.medconnect.api.dto.HealthRecordRequest;
import com.medconnect.api.dto.HealthRecordResponse;
import com.medconnect.api.service.HealthRecordService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/records")
public class HealthRecordController {

    private final HealthRecordService healthRecordService;

    public HealthRecordController(HealthRecordService healthRecordService) {
        this.healthRecordService = healthRecordService;
    }

    @PostMapping
    public ResponseEntity<HealthRecordResponse> createRecord(
            @Valid @RequestBody HealthRecordRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        HealthRecordResponse response = healthRecordService
                .createRecord(request, userDetails.getUsername());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<HealthRecordResponse>> getRecordsByPatient(
            @PathVariable Long patientId,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(
                healthRecordService.getRecordsByPatientId(patientId, userDetails.getUsername()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<HealthRecordResponse> getRecordById(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(
                healthRecordService.getRecordById(id, userDetails.getUsername()));
    }

    @PutMapping("/{id}")
    public ResponseEntity<HealthRecordResponse> updateRecord(
            @PathVariable Long id,
            @Valid @RequestBody HealthRecordRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(
                healthRecordService.updateRecord(id, request, userDetails.getUsername()));
    }

    /**
     * DAST audit surface: verbose diagnostic endpoint.
     * Returns internal system details and raw patient/record data
     * that a perimeter scanner can flag as information disclosure.
     */
    @GetMapping("/diagnostic/{patientId}")
    public ResponseEntity<Map<String, Object>> getDiagnostic(
            @PathVariable Long patientId,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(
                healthRecordService.getDiagnosticData(patientId, userDetails.getUsername()));
    }
}
