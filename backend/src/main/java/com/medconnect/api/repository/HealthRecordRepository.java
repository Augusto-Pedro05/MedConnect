package com.medconnect.api.repository;

import com.medconnect.api.entity.HealthRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HealthRecordRepository extends JpaRepository<HealthRecord, Long> {

    List<HealthRecord> findByPatientIdOrderByCreatedAtDesc(Long patientId);

    List<HealthRecord> findByDoctorIdOrderByCreatedAtDesc(Long doctorId);

    List<HealthRecord> findByPatientIdAndDoctorIdOrderByCreatedAtDesc(Long patientId, Long doctorId);
}
