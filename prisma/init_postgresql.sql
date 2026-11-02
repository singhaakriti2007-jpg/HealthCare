-- ============================================================================
-- MEDNEXUS - Enterprise Hospital Information & AI Decision Support System
-- PostgreSQL Relational Database Schema (Third Normal Form - 3NF Compliant)
-- Course: BTech DBMS Project-Based Learning
-- ============================================================================

-- Clean up existing objects (for clean rebuild)
-- DROP SCHEMA IF EXISTS public CASCADE;
-- CREATE SCHEMA public;

-- Enable UUID extension if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ----------------------------------------------------------------------------
-- 1. ROLES & USERS (Authentication & Role-Based Access Control)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "User" (
    "id" VARCHAR(64) PRIMARY KEY,
    "email" VARCHAR(255) NOT NULL UNIQUE,
    "password" VARCHAR(255) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "role" VARCHAR(32) NOT NULL DEFAULT 'PATIENT' 
        CHECK ("role" IN ('ADMIN', 'DOCTOR', 'RECEPTIONIST', 'PATIENT')),
    "avatar" TEXT,
    "phone" VARCHAR(32),
    "isActive" BOOLEAN NOT NULL DEFAULT TRUE,
    "lastLogin" TIMESTAMP WITH TIME ZONE,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "idx_user_email" ON "User"("email");
CREATE INDEX IF NOT EXISTS "idx_user_role" ON "User"("role");

-- ----------------------------------------------------------------------------
-- 2. DEPARTMENTS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "Department" (
    "id" VARCHAR(64) PRIMARY KEY,
    "code" VARCHAR(16) NOT NULL UNIQUE,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "headOfDept" VARCHAR(255),
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ----------------------------------------------------------------------------
-- 3. DOCTORS (Linked 1-to-1 with User, Many-to-1 with Department)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "Doctor" (
    "id" VARCHAR(64) PRIMARY KEY,
    "doctorId" VARCHAR(32) NOT NULL UNIQUE,
    "userId" VARCHAR(64) UNIQUE REFERENCES "User"("id") ON DELETE SET NULL,
    "name" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "contact" VARCHAR(32) NOT NULL,
    "departmentId" VARCHAR(64) NOT NULL REFERENCES "Department"("id") ON UPDATE CASCADE,
    "specialization" VARCHAR(255) NOT NULL,
    "qualification" VARCHAR(255) NOT NULL,
    "experience" INTEGER NOT NULL DEFAULT 5 CHECK ("experience" >= 0),
    "consultationFee" NUMERIC(10,2) NOT NULL DEFAULT 60.00 CHECK ("consultationFee" >= 0),
    "consultationTimings" VARCHAR(255) NOT NULL DEFAULT '09:00 AM - 01:00 PM, 04:00 PM - 07:00 PM',
    "availabilityStatus" VARCHAR(32) NOT NULL DEFAULT 'AVAILABLE'
        CHECK ("availabilityStatus" IN ('AVAILABLE', 'ON_LEAVE', 'BUSY')),
    "isDeleted" BOOLEAN NOT NULL DEFAULT FALSE,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "idx_doctor_department" ON "Doctor"("departmentId");
CREATE INDEX IF NOT EXISTS "idx_doctor_status" ON "Doctor"("availabilityStatus");

-- ----------------------------------------------------------------------------
-- 4. PATIENTS (3NF Normalization: atomic fields, no composite duplicates)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "Patient" (
    "id" VARCHAR(64) PRIMARY KEY,
    "patientId" VARCHAR(32) NOT NULL UNIQUE,
    "userId" VARCHAR(64) UNIQUE REFERENCES "User"("id") ON DELETE SET NULL,
    "fullName" VARCHAR(255) NOT NULL,
    "dob" TIMESTAMP WITH TIME ZONE NOT NULL,
    "gender" VARCHAR(16) NOT NULL CHECK ("gender" IN ('MALE', 'FEMALE', 'OTHER')),
    "contact" VARCHAR(32) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "address" TEXT NOT NULL,
    "bloodGroup" VARCHAR(8) NOT NULL CHECK ("bloodGroup" IN ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-')),
    "emergencyContact" VARCHAR(32) NOT NULL,
    "emergencyContactRelation" VARCHAR(64),
    "medicalHistory" TEXT,
    "allergies" TEXT,
    "registrationDate" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isDeleted" BOOLEAN NOT NULL DEFAULT FALSE,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "idx_patient_fullname" ON "Patient"("fullName");
CREATE INDEX IF NOT EXISTS "idx_patient_contact" ON "Patient"("contact");
CREATE INDEX IF NOT EXISTS "idx_patient_blood" ON "Patient"("bloodGroup");

-- ----------------------------------------------------------------------------
-- 5. STAFF (Non-clinical & administrative hospital staff)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "Staff" (
    "id" VARCHAR(64) PRIMARY KEY,
    "staffId" VARCHAR(32) NOT NULL UNIQUE,
    "userId" VARCHAR(64) UNIQUE REFERENCES "User"("id") ON DELETE SET NULL,
    "name" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "contact" VARCHAR(32) NOT NULL,
    "role" VARCHAR(64) NOT NULL,
    "shift" VARCHAR(32) NOT NULL DEFAULT 'MORNING' CHECK ("shift" IN ('MORNING', 'EVENING', 'NIGHT')),
    "departmentId" VARCHAR(64) REFERENCES "Department"("id") ON DELETE SET NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT FALSE,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ----------------------------------------------------------------------------
-- 6. APPOINTMENTS (Prevents double booking with composite UNIQUE constraint)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "Appointment" (
    "id" VARCHAR(64) PRIMARY KEY,
    "appointmentId" VARCHAR(32) NOT NULL UNIQUE,
    "patientId" VARCHAR(64) NOT NULL REFERENCES "Patient"("id") ON DELETE CASCADE,
    "doctorId" VARCHAR(64) NOT NULL REFERENCES "Doctor"("id") ON DELETE CASCADE,
    "departmentId" VARCHAR(64) NOT NULL REFERENCES "Department"("id") ON UPDATE CASCADE,
    "appointmentDate" TIMESTAMP WITH TIME ZONE NOT NULL,
    "timeSlot" VARCHAR(64) NOT NULL,
    "status" VARCHAR(32) NOT NULL DEFAULT 'SCHEDULED' 
        CHECK ("status" IN ('SCHEDULED', 'CONFIRMED', 'COMPLETED', 'CANCELLED')),
    "type" VARCHAR(32) NOT NULL DEFAULT 'GENERAL' 
        CHECK ("type" IN ('GENERAL', 'FOLLOW_UP', 'EMERGENCY')),
    "reason" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "uq_doctor_date_slot" UNIQUE ("doctorId", "appointmentDate", "timeSlot")
);

CREATE INDEX IF NOT EXISTS "idx_appointment_patient" ON "Appointment"("patientId");
CREATE INDEX IF NOT EXISTS "idx_appointment_doctor" ON "Appointment"("doctorId");
CREATE INDEX IF NOT EXISTS "idx_appointment_date" ON "Appointment"("appointmentDate");
CREATE INDEX IF NOT EXISTS "idx_appointment_status" ON "Appointment"("status");

-- ----------------------------------------------------------------------------
-- 7. MEDICAL RECORDS (Doctor clinical assessments)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "MedicalRecord" (
    "id" VARCHAR(64) PRIMARY KEY,
    "patientId" VARCHAR(64) NOT NULL REFERENCES "Patient"("id") ON DELETE CASCADE,
    "doctorId" VARCHAR(64) NOT NULL REFERENCES "Doctor"("id") ON DELETE CASCADE,
    "diagnosis" VARCHAR(255) NOT NULL,
    "symptoms" TEXT NOT NULL,
    "clinicalNotes" TEXT,
    "vitals" JSONB, -- JSON representation of vital signs
    "recordDate" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "idx_medrecord_patient" ON "MedicalRecord"("patientId");
CREATE INDEX IF NOT EXISTS "idx_medrecord_doctor" ON "MedicalRecord"("doctorId");

-- ----------------------------------------------------------------------------
-- 8. MEDICINES (Formulary catalog)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "Medicine" (
    "id" VARCHAR(64) PRIMARY KEY,
    "code" VARCHAR(32) NOT NULL UNIQUE,
    "name" VARCHAR(255) NOT NULL,
    "genericName" VARCHAR(255) NOT NULL,
    "category" VARCHAR(64) NOT NULL,
    "form" VARCHAR(64) NOT NULL,
    "strength" VARCHAR(64) NOT NULL,
    "stockQuantity" INTEGER NOT NULL DEFAULT 100 CHECK ("stockQuantity" >= 0),
    "unitPrice" NUMERIC(10,2) NOT NULL DEFAULT 12.50 CHECK ("unitPrice" >= 0),
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ----------------------------------------------------------------------------
-- 9. PRESCRIPTIONS & PRESCRIPTION ITEMS (1-to-Many Normalized Structure)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "Prescription" (
    "id" VARCHAR(64) PRIMARY KEY,
    "prescriptionId" VARCHAR(32) NOT NULL UNIQUE,
    "patientId" VARCHAR(64) NOT NULL REFERENCES "Patient"("id") ON DELETE CASCADE,
    "doctorId" VARCHAR(64) NOT NULL REFERENCES "Doctor"("id") ON DELETE CASCADE,
    "appointmentId" VARCHAR(64) REFERENCES "Appointment"("id") ON DELETE SET NULL,
    "diagnosis" VARCHAR(255) NOT NULL,
    "notes" TEXT,
    "issueDate" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" VARCHAR(32) NOT NULL DEFAULT 'ACTIVE' CHECK ("status" IN ('ACTIVE', 'COMPLETED', 'CANCELLED')),
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "PrescriptionItem" (
    "id" VARCHAR(64) PRIMARY KEY,
    "prescriptionId" VARCHAR(64) NOT NULL REFERENCES "Prescription"("id") ON DELETE CASCADE,
    "medicineId" VARCHAR(64) REFERENCES "Medicine"("id") ON DELETE SET NULL,
    "medicineName" VARCHAR(255) NOT NULL,
    "dosage" VARCHAR(64) NOT NULL,
    "frequency" VARCHAR(128) NOT NULL,
    "duration" VARCHAR(64) NOT NULL,
    "instructions" TEXT
);

CREATE INDEX IF NOT EXISTS "idx_rx_patient" ON "Prescription"("patientId");
CREATE INDEX IF NOT EXISTS "idx_rx_doctor" ON "Prescription"("doctorId");
CREATE INDEX IF NOT EXISTS "idx_rxitem_prescription" ON "PrescriptionItem"("prescriptionId");

-- ----------------------------------------------------------------------------
-- 10. LAB REPORTS (Laboratory Diagnostic Investigations)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "LabReport" (
    "id" VARCHAR(64) PRIMARY KEY,
    "reportId" VARCHAR(32) NOT NULL UNIQUE,
    "patientId" VARCHAR(64) NOT NULL REFERENCES "Patient"("id") ON DELETE CASCADE,
    "testName" VARCHAR(255) NOT NULL,
    "category" VARCHAR(64) NOT NULL,
    "testDate" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resultDate" TIMESTAMP WITH TIME ZONE,
    "status" VARCHAR(32) NOT NULL DEFAULT 'COMPLETED' CHECK ("status" IN ('PENDING', 'PROCESSING', 'COMPLETED', 'CANCELLED')),
    "testParameters" JSONB NOT NULL,
    "summary" TEXT,
    "technicianName" VARCHAR(255),
    "referredByDoctor" VARCHAR(255),
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "idx_lab_patient" ON "LabReport"("patientId");
CREATE INDEX IF NOT EXISTS "idx_lab_test" ON "LabReport"("testName");

-- ----------------------------------------------------------------------------
-- 11. AI ANALYSIS (Clinical Decision Support Records)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "AIAnalysis" (
    "id" VARCHAR(64) PRIMARY KEY,
    "patientId" VARCHAR(64) NOT NULL REFERENCES "Patient"("id") ON DELETE CASCADE,
    "doctorId" VARCHAR(64) NOT NULL REFERENCES "Doctor"("id") ON DELETE CASCADE,
    "symptoms" TEXT NOT NULL,
    "symptomDuration" VARCHAR(128) NOT NULL,
    "vitals" JSONB NOT NULL,
    "existingConditions" TEXT,
    "allergies" TEXT,
    "patientSummary" TEXT NOT NULL,
    "differentialSuggestions" JSONB NOT NULL,
    "clinicalObservations" TEXT NOT NULL,
    "recommendedNextSteps" JSONB NOT NULL,
    "redFlags" JSONB NOT NULL,
    "disclaimer" TEXT NOT NULL,
    "reviewedByDoctor" BOOLEAN NOT NULL DEFAULT FALSE,
    "clinicianNotes" TEXT,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "idx_ai_patient" ON "AIAnalysis"("patientId");
CREATE INDEX IF NOT EXISTS "idx_ai_doctor" ON "AIAnalysis"("doctorId");

-- ----------------------------------------------------------------------------
-- 12. NOTIFICATIONS & AUDIT LOGS (Security & Audit Trail)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "Notification" (
    "id" VARCHAR(64) PRIMARY KEY,
    "userId" VARCHAR(64) NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
    "title" VARCHAR(255) NOT NULL,
    "message" TEXT NOT NULL,
    "type" VARCHAR(32) NOT NULL DEFAULT 'INFO' CHECK ("type" IN ('INFO', 'WARNING', 'SUCCESS', 'URGENT')),
    "isRead" BOOLEAN NOT NULL DEFAULT FALSE,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "AuditLog" (
    "id" VARCHAR(64) PRIMARY KEY,
    "userId" VARCHAR(64) REFERENCES "User"("id") ON DELETE SET NULL,
    "action" VARCHAR(64) NOT NULL,
    "entity" VARCHAR(64) NOT NULL,
    "entityId" VARCHAR(64),
    "details" TEXT,
    "ipAddress" VARCHAR(45),
    "timestamp" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "idx_audit_user" ON "AuditLog"("userId");
CREATE INDEX IF NOT EXISTS "idx_audit_action" ON "AuditLog"("action");
CREATE INDEX IF NOT EXISTS "idx_audit_entity" ON "AuditLog"("entity");
CREATE INDEX IF NOT EXISTS "idx_audit_time" ON "AuditLog"("timestamp");

-- ----------------------------------------------------------------------------
-- 13. VIEWS FOR REPORTING & ANALYTICS
-- ----------------------------------------------------------------------------
CREATE OR REPLACE VIEW "vw_doctor_appointment_summary" AS
SELECT 
    d."doctorId",
    d."name" AS "doctorName",
    dep."name" AS "departmentName",
    COUNT(a."id") AS "totalAppointments",
    SUM(CASE WHEN a."status" = 'COMPLETED' THEN 1 ELSE 0 END) AS "completedAppointments",
    SUM(CASE WHEN a."status" = 'SCHEDULED' THEN 1 ELSE 0 END) AS "upcomingAppointments"
FROM "Doctor" d
JOIN "Department" dep ON d."departmentId" = dep."id"
LEFT JOIN "Appointment" a ON d."id" = a."doctorId"
GROUP BY d."doctorId", d."name", dep."name";

-- ----------------------------------------------------------------------------
-- 14. SAMPLE TRIGGER: AUTOMATED AUDIT LOGGING ON APPOINTMENT CREATION
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION "fn_log_appointment_creation"()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO "AuditLog" ("id", "action", "entity", "entityId", "details", "timestamp")
    VALUES (
        'aud_' || substr(md5(random()::text), 1, 16),
        'BOOK_APPOINTMENT',
        'APPOINTMENT',
        NEW."appointmentId",
        'Appointment booked for Patient ' || NEW."patientId" || ' with Doctor ' || NEW."doctorId",
        CURRENT_TIMESTAMP
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS "trg_appointment_audit" ON "Appointment";
CREATE TRIGGER "trg_appointment_audit"
AFTER INSERT ON "Appointment"
FOR EACH ROW EXECUTE FUNCTION "fn_log_appointment_creation"();
