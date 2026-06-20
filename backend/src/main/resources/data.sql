-- ============================================================
-- MedConnect — Database Seed Data
-- All passwords are BCrypt-hashed. Raw password: "password123"
-- ============================================================

-- ===== Users (Doctors) =====
-- BCrypt hash of "password123"
INSERT INTO users (id, email, password, first_name, last_name, role, created_at)
VALUES
    (1, 'dr.silva@medconnect.com',   '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Ana',     'Silva',    'DOCTOR',  NOW()),
    (2, 'dr.santos@medconnect.com',  '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Carlos',  'Santos',   'DOCTOR',  NOW()),
    (3, 'dr.oliveira@medconnect.com','$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Marina',  'Oliveira', 'DOCTOR',  NOW())
ON CONFLICT (id) DO NOTHING;

-- ===== Users (Patients) =====
INSERT INTO users (id, email, password, first_name, last_name, role, created_at)
VALUES
    (4, 'patient.costa@gmail.com',   '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Lucas',   'Costa',    'PATIENT', NOW()),
    (5, 'patient.lima@gmail.com',    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Juliana', 'Lima',     'PATIENT', NOW()),
    (6, 'patient.ferreira@gmail.com','$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Pedro',   'Ferreira', 'PATIENT', NOW())
ON CONFLICT (id) DO NOTHING;

-- ===== Doctor Profiles =====
INSERT INTO doctor_profiles (id, user_id, specialty, license_number, bio)
VALUES
    (1, 1, 'Cardiology',       'CRM-SP-123456', 'Board-certified cardiologist with 15 years of experience in interventional cardiology and heart failure management.'),
    (2, 2, 'Dermatology',      'CRM-RJ-789012', 'Specialist in clinical and cosmetic dermatology, treating skin conditions from acne to melanoma.'),
    (3, 3, 'General Practice', 'CRM-MG-345678', 'Family medicine physician focused on preventive care, chronic disease management, and holistic patient wellness.')
ON CONFLICT (id) DO NOTHING;

-- ===== Patient Profiles =====
INSERT INTO patient_profiles (id, user_id, date_of_birth, blood_type, allergies)
VALUES
    (1, 4, '1990-03-15', 'O+',  'Penicillin'),
    (2, 5, '1985-07-22', 'A-',  'None'),
    (3, 6, '1998-11-08', 'B+',  'Latex, Sulfa drugs')
ON CONFLICT (id) DO NOTHING;

-- ===== Appointments =====
INSERT INTO appointments (id, patient_id, doctor_id, date_time, duration_minutes, status, notes)
VALUES
    (1, 4, 1, NOW() + INTERVAL '2 days'  + INTERVAL '9 hours',  30, 'SCHEDULED', 'Annual cardiac checkup — please bring previous ECG results.'),
    (2, 5, 2, NOW() + INTERVAL '3 days'  + INTERVAL '10 hours', 30, 'SCHEDULED', 'Follow-up on eczema treatment progress.'),
    (3, 6, 3, NOW() + INTERVAL '1 day'   + INTERVAL '14 hours', 30, 'SCHEDULED', 'General wellness consultation.'),
    (4, 4, 3, NOW() - INTERVAL '7 days'  + INTERVAL '11 hours', 30, 'COMPLETED', 'Routine checkup — vitals normal.'),
    (5, 5, 1, NOW() - INTERVAL '14 days' + INTERVAL '15 hours', 30, 'COMPLETED', 'Heart palpitations evaluation — referred to cardiologist.'),
    (6, 6, 2, NOW() - INTERVAL '5 days'  + INTERVAL '9 hours',  30, 'CANCELLED', 'Patient cancelled due to scheduling conflict.')
ON CONFLICT (id) DO NOTHING;

-- ===== Health Records (EHR) =====
INSERT INTO health_records (id, patient_id, doctor_id, appointment_id, diagnosis, clinical_notes, prescription, created_at)
VALUES
    (1, 4, 3, 4,
     'Healthy — no abnormalities detected',
     'Patient presents in good general health. Blood pressure: 120/80 mmHg. Heart rate: 72 bpm. BMI: 24.1. No complaints reported. All routine blood panels within normal range.',
     'Continue current multivitamin regimen. Schedule follow-up in 12 months.',
     NOW() - INTERVAL '7 days'),

    (2, 5, 1, 5,
     'Supraventricular tachycardia (SVT) — benign',
     'Patient reports occasional heart palpitations lasting 30-60 seconds, occurring 2-3 times per week. ECG shows paroxysmal SVT episodes. Echocardiogram: normal LV function, EF 62%. No structural abnormalities.',
     'Metoprolol 25mg once daily. Avoid excessive caffeine. Return in 4 weeks for follow-up ECG.',
     NOW() - INTERVAL '14 days'),

    (3, 4, 1, NULL,
     'Mild hypertension — Stage 1',
     'Blood pressure readings consistently 135-140/85-90 mmHg over the past 3 visits. No target organ damage. Family history positive for cardiovascular disease. Recommended lifestyle modifications.',
     'Lisinopril 10mg once daily. DASH diet. Exercise 150 min/week. Home BP monitoring twice daily. Follow-up in 8 weeks.',
     NOW() - INTERVAL '30 days')
ON CONFLICT (id) DO NOTHING;

-- Reset sequences to avoid ID conflicts with new inserts
SELECT setval('users_id_seq', (SELECT MAX(id) FROM users));
SELECT setval('doctor_profiles_id_seq', (SELECT MAX(id) FROM doctor_profiles));
SELECT setval('patient_profiles_id_seq', (SELECT MAX(id) FROM patient_profiles));
SELECT setval('appointments_id_seq', (SELECT MAX(id) FROM appointments));
SELECT setval('health_records_id_seq', (SELECT MAX(id) FROM health_records));
