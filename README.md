# MedConnect — Telemedicine Platform

A full-stack telemedicine platform for virtual consultations, appointment scheduling, and Electronic Health Records (EHR) management. Built with **Spring Boot 3** + **React (Vite + TypeScript)** + **PostgreSQL**, orchestrated via **Docker Compose**.

> ⚠️ **DevSecOps Training Project**: This application intentionally contains security vulnerabilities for CI/CD scanner calibration (SAST, SCA, IaC, DAST). See the [Security Audit Surface](#security-audit-surface) section below.

---

## Architecture

```
┌──────────────┐     ┌──────────────────┐     ┌──────────────┐
│   Frontend   │────▶│   Backend API    │────▶│  PostgreSQL  │
│  React/Vite  │     │  Spring Boot 3   │     │   Database   │
│  Port: 3000  │     │   Port: 8080     │     │  Port: 5432  │
└──────────────┘     └──────────────────┘     └──────────────┘
     Nginx                JWT + RBAC              JPA/Hibernate
```

## Quick Start

### Prerequisites
- [Docker](https://docs.docker.com/get-docker/) & [Docker Compose](https://docs.docker.com/compose/)

### Run
```bash
docker compose up --build
```

| Service  | URL                      |
|----------|--------------------------|
| Frontend | http://localhost:3000     |
| Backend  | http://localhost:8080     |
| Database | localhost:5432            |

### Default Credentials

All seed accounts use the password: `password123`

| Role    | Email                          |
|---------|--------------------------------|
| Doctor  | dr.silva@medconnect.com        |
| Doctor  | dr.santos@medconnect.com       |
| Doctor  | dr.oliveira@medconnect.com     |
| Patient | patient.costa@gmail.com        |
| Patient | patient.lima@gmail.com         |
| Patient | patient.ferreira@gmail.com     |

---

## Local Development (without Docker)

### Backend
```bash
cd backend
./mvnw spring-boot:run
# Requires Java 17 and a running PostgreSQL on localhost:5432
```

### Frontend
```bash
cd frontend
npm install
npm run dev
# Opens on http://localhost:5173
```

---

## API Endpoints

### Authentication
| Method | Endpoint              | Auth | Description              |
|--------|-----------------------|------|--------------------------|
| POST   | `/api/auth/register`  | No   | Register new user        |
| POST   | `/api/auth/login`     | No   | Login, returns JWT       |
| POST   | `/api/auth/refresh`   | No   | Refresh access token     |
| GET    | `/api/auth/health`    | No   | Health check             |

### Doctors
| Method | Endpoint                    | Auth     | Description              |
|--------|-----------------------------|----------|--------------------------|
| GET    | `/api/doctors`              | No       | List all doctors         |
| GET    | `/api/doctors/{id}`         | No       | Get doctor profile       |
| GET    | `/api/doctors/search?name=` | No       | Search doctors by name   |

### Patients
| Method | Endpoint            | Auth       | Description                |
|--------|---------------------|------------|----------------------------|
| GET    | `/api/patients/{id}`| PATIENT/DR | Get patient profile        |
| PUT    | `/api/patients/{id}`| PATIENT    | Update own profile         |

### Appointments
| Method | Endpoint                         | Auth    | Description              |
|--------|----------------------------------|---------|--------------------------|
| POST   | `/api/appointments`              | PATIENT | Book appointment         |
| GET    | `/api/appointments`              | Any     | List own appointments    |
| GET    | `/api/appointments/{id}`         | Any     | Get single appointment   |
| PATCH  | `/api/appointments/{id}/status`  | Any     | Update status            |

### Health Records (EHR)
| Method | Endpoint                            | Auth   | Description              |
|--------|-------------------------------------|--------|--------------------------|
| POST   | `/api/records`                      | DOCTOR | Create health record     |
| GET    | `/api/records/patient/{patientId}`  | Any    | List patient records     |
| GET    | `/api/records/{id}`                 | Any    | Get single record        |
| PUT    | `/api/records/{id}`                 | DOCTOR | Update record            |
| GET    | `/api/records/diagnostic/{id}`      | Any    | Diagnostic endpoint      |

---

## Tech Stack

| Layer    | Technology                                      |
|----------|------------------------------------------------|
| Frontend | React 19, TypeScript, Vite, Zustand, React Router |
| Backend  | Java 17, Spring Boot 3.3.x, Spring Security, JPA |
| Database | PostgreSQL 17                                   |
| Auth     | JWT (access + refresh tokens), BCrypt           |
| Infra    | Docker, Docker Compose, Nginx                   |

---

## Security Audit Surface

This project intentionally includes the following vulnerability patterns for DevSecOps CI/CD scanner calibration:

| Category     | Location                                 | Finding                              |
|-------------|------------------------------------------|--------------------------------------|
| **IaC**     | `backend/Dockerfile`, `frontend/Dockerfile` | Containers run as root             |
| **IaC**     | `application.yml`                        | Hardcoded database credentials       |
| **SCA**     | `pom.xml` — jjwt 0.11.5                 | Known CVEs in older JWT library      |
| **SCA**     | `pom.xml` — snakeyaml 1.33              | CVE-2022-1471                        |
| **SAST**    | `DoctorService.searchDoctorsByName()`    | SQL injection via string concatenation |
| **SAST**    | `GlobalExceptionHandler`                 | Verbose stack traces in 500 responses |
| **SAST**    | `JwtTokenProvider.validateToken()`       | Unsanitized token logging            |
| **DAST**    | `POST /api/auth/login`                   | User context info disclosure         |
| **DAST**    | `GET /api/records/diagnostic/{id}`       | Verbose system info endpoint         |

---

## Project Structure

```
MedConnect/
├── backend/
│   ├── Dockerfile
│   ├── pom.xml
│   └── src/main/java/com/medconnect/api/
│       ├── config/          # Spring Security config
│       ├── controller/      # REST controllers
│       ├── dto/             # Request/response DTOs
│       ├── entity/          # JPA entities
│       ├── exception/       # Global error handling
│       ├── repository/      # Spring Data JPA repos
│       ├── security/        # JWT + auth filter
│       └── service/         # Business logic
├── frontend/
│   ├── Dockerfile
│   ├── nginx.conf
│   └── src/
│       ├── features/        # Feature modules
│       │   ├── auth/
│       │   ├── dashboard/
│       │   ├── appointments/
│       │   └── ehr/
│       ├── layouts/
│       ├── lib/             # Axios config
│       ├── router/
│       ├── store/           # Zustand stores
│       └── types/
├── docker-compose.yml
└── README.md
```

---

## License

This project is for educational/training purposes only.
