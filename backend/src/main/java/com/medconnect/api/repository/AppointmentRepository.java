package com.medconnect.api.repository;

import com.medconnect.api.entity.Appointment;
import com.medconnect.api.entity.AppointmentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {

    List<Appointment> findByPatientIdOrderByDateTimeDesc(Long patientId);

    List<Appointment> findByDoctorIdOrderByDateTimeDesc(Long doctorId);

    @Query("SELECT a FROM Appointment a WHERE a.doctor.id = :doctorId " +
           "AND a.status = :status " +
           "AND a.dateTime BETWEEN :start AND :end")
    List<Appointment> findByDoctorIdAndStatusAndDateTimeBetween(
            @Param("doctorId") Long doctorId,
            @Param("status") AppointmentStatus status,
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end);

    @Query("SELECT CASE WHEN COUNT(a) > 0 THEN true ELSE false END " +
           "FROM Appointment a WHERE a.doctor.id = :doctorId " +
           "AND a.status = 'SCHEDULED' " +
           "AND a.dateTime = :dateTime")
    boolean existsConflict(@Param("doctorId") Long doctorId,
                           @Param("dateTime") LocalDateTime dateTime);

    @Query("SELECT a FROM Appointment a WHERE a.patient.id = :patientId " +
           "AND a.doctor.id = :doctorId")
    List<Appointment> findByPatientIdAndDoctorId(
            @Param("patientId") Long patientId,
            @Param("doctorId") Long doctorId);
}
