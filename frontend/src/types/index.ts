export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: 'PATIENT' | 'DOCTOR';
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  userId: number;
  email: string;
  firstName: string;
  lastName: string;
  role: 'PATIENT' | 'DOCTOR';
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: string;
  specialty?: string;
  licenseNumber?: string;
  bio?: string;
  dateOfBirth?: string;
  bloodType?: string;
  allergies?: string;
}

export interface DoctorProfile {
  id: number;
  userId: number;
  email: string;
  firstName: string;
  lastName: string;
  specialty: string;
  licenseNumber: string;
  bio: string;
}

export interface PatientProfile {
  id: number;
  userId: number;
  email: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string | null;
  bloodType: string | null;
  allergies: string | null;
}

export interface Appointment {
  id: number;
  patientId: number;
  patientName: string;
  doctorId: number;
  doctorName: string;
  doctorSpecialty: string | null;
  dateTime: string;
  durationMinutes: number;
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';
  notes: string | null;
}

export interface AppointmentRequest {
  doctorId: number;
  dateTime: string;
  notes?: string;
}

export interface HealthRecord {
  id: number;
  patientId: number;
  patientName: string;
  doctorId: number;
  doctorName: string;
  appointmentId: number | null;
  diagnosis: string;
  clinicalNotes: string;
  prescription: string;
  createdAt: string;
}

export interface HealthRecordRequest {
  patientId: number;
  appointmentId?: number;
  diagnosis: string;
  clinicalNotes?: string;
  prescription?: string;
}
