# MEDNEXUS – AI Healthcare Intelligence
> **Smarter Healthcare. Better Decisions.**
> Full-Stack Production-Grade Hospital Information & Clinical Decision Support System  
> *Course: BTech DBMS Project-Based Learning (PBL)*

---

## 🏥 Project Overview
**MEDNEXUS** is an enterprise hospital SaaS and Electronic Health Record (EHR) platform engineered from the ground up to demonstrate relational database architecture in **Third Normal Form (3NF)**, robust role-based access control (RBAC), concurrency-safe transaction handling, and an evidence-based clinical decision support engine.

---

## ⚡ Tech Stack
- **Frontend & App Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS + Custom Medical Design System
- **Icons**: Lucide React
- **Backend**: Next.js 14 Route Handlers
- **Database**: PostgreSQL (Production) / SQLite (Zero-Config Local Dev)
- **ORM**: Prisma Client v5.22
- **Authentication**: NextAuth.js (Credentials Provider + JWT + Route Middleware)
- **Password Security**: bcryptjs (Salt rounds: 10)
- **Validation**: Zod schema validation
- **Charts**: Recharts (Consultation flow, Department occupancy)
- **PDF Generation**: jsPDF (Vector prescription slips & pathology reports)
- **Date Handling**: date-fns

---

## 🔐 Demo Credentials (Seeded)
The system is pre-seeded with realistic healthcare persona accounts:

| Role | Email | Password | Access Level |
| :--- | :--- | :--- | :--- |
| **ADMIN** | `admin@mednexus.com` | `Admin@123` | Full hospital administration, KPIs, DBMS Insights, Audit logs |
| **DOCTOR** | `doctor@mednexus.com` | `Doctor@123` | Consultation agenda, AI Decision Support, Prescription generation |
| **RECEPTIONIST** | `reception@mednexus.com` | `Reception@123` | Front-desk patient onboarding, appointment scheduling |
| **PATIENT** | `patient@mednexus.com` | `Patient@123` | Personal health portal, prescriptions, lab results |

*The login page also includes 1-click quick login buttons to switch between any role instantly during demonstrations.*

---

## 🗄️ Database Architecture (3NF Normalized Schema)

The database schema strictly adheres to **Third Normal Form (3NF)**, eliminating multi-valued repeating groups (1NF), partial dependencies (2NF), and transitive dependencies (3NF).

### Primary Relational Tables (14 Relations)
1. **`User`**: Central credentials entity with bcrypt hash, status flags, and RBAC roles.
2. **`Department`**: Hospital specialty wings (Cardiology, Neurology, Pediatrics, Orthopedics, Oncology, General Medicine).
3. **`Doctor`**: Medical faculty linked 1:1 to User and N:1 to Department with credentials and tariff.
4. **`Patient`**: Master patient index with decoupled atomic fields, blood group, allergies, and contact.
5. **`Staff`**: Non-clinical personnel and administrative shift assignments.
6. **`Appointment`**: Encounters between patient and doctor. Enforces a **Composite Unique Constraint** `("doctorId", "appointmentDate", "timeSlot")` preventing double-booking race conditions.
7. **`MedicalRecord`**: Attending doctor diagnoses, clinical observations, and vitals.
8. **`Medicine`**: Hospital formulary catalog with generic names, strength, form, and stock.
9. **`Prescription`**: Prescription header (patient, doctor, diagnosis, issue date).
10. **`PrescriptionItem`**: Normalized 1-to-many child table capturing medication line items, dosage, frequency, and instructions.
11. **`LabReport`**: Diagnostic investigations with JSONB test parameters and reference ranges.
12. **`AIAnalysis`**: Algorithmic clinical decision support logs with differential suggestions and doctor sign-off.
13. **`Notification`**: System and clinical alert notices.
14. **`AuditLog`**: Immutable historical audit trail recording user actions, IP addresses, and timestamps.

---

## 🧠 AI Healthcare Decision Support Engine
The flagship clinical decision module uses an algorithmic clinical expert engine following **NEWS2 (National Early Warning Score)** principles:
- **Triage Assessment**: Evaluates body temperature, systolic/diastolic BP, pulse rate, SpO2, and respiratory rate into color-coded triage bands (*Normal, Elevated, High Alert, Critical Alert*).
- **Differential Formulations**: Matches symptom clusters with ICD-10 diagnostic codes, confidence percentages, and medical rationales.
- **Contraindication Cross-Referencing**: Automatically cross-references patient allergy profiles against prescribed drug classes.
- **Red Flag Warnings**: Highlights immediate life-threatening indicators (e.g. radiating retrosternal pain, diaphoresis).
- **Mandatory Physician Sign-Off**: Requires licensed clinician verification and clinical sign-off notes before EHR commitment.
- **Medical Disclaimer**: Prominent legal disclaimer asserting decision-support scope.

---

## 🚀 Setup & Execution Guide

### 1. Prerequisites
- Node.js (v18.17+ or v20+)
- pnpm / npm

### 2. Quick Start (Instant Zero-Config SQLite)
```bash
# Navigate to the project root
cd mednexus

# Generate Prisma Client
pnpm prisma generate

# Synchronize Database Schema
pnpm prisma db push

# Seed 22+ Patients, 8+ Doctors, Appointments, Lab Reports & Accounts
node prisma/seed.js

# Start Next.js Development Server
pnpm dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

### 3. PostgreSQL Production Mode (Optional / Evaluation)
To connect to your PostgreSQL database (e.g. PostgreSQL 18):
1. In `.env`, uncomment and configure the PostgreSQL connection string:
   ```env
   DATABASE_URL="postgresql://postgres:your_password@localhost:5432/mednexus_db?schema=public"
   ```
2. Replace `prisma/schema.prisma` with `prisma/schema.postgresql.prisma` or run:
   ```bash
   pnpm prisma db push --schema=prisma/schema.postgresql.prisma
   node prisma/seed.js
   ```
3. Alternatively, you can directly execute the provided raw SQL script in pgAdmin or psql:
   ```bash
   psql -U postgres -d mednexus_db -f prisma/init_postgresql.sql
   ```

---

## 🔬 DBMS Insights Section
Available directly from the Admin control panel at `/dbms-insights`:
- **ER Diagram Visualization**: Interactive relationship graph with cardinality indicators.
- **Schema Viewer**: DDL definitions, primary keys, foreign keys, and check constraints for all 14 tables.
- **3NF Normalization Proof**: Step-by-step breakdown from Unnormalized Form (UNF) through 3NF with real medical examples.
- **Interactive SQL Laboratory**: Run sample complex JOINs, Aggregates, Correlated Subqueries, and Window Functions with live execution timing.
- **ACID Transactions**: Code samples demonstrating all-or-nothing multi-table commits and concurrency locks.
- **PostgreSQL Triggers**: Production PL/pgSQL trigger code for audit logging.
- **SQL vs MongoDB Comparison**: Relational vs Document data model trade-offs in healthcare systems.
