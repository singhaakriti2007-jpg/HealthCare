export interface TableSchema {
  name: string;
  description: string;
  columns: {
    name: string;
    type: string;
    isPrimary?: boolean;
    isForeign?: boolean;
    references?: string;
    isUnique?: boolean;
    isNullable?: boolean;
    checkConstraint?: string;
    description: string;
  }[];
}

export const dbmsTables: TableSchema[] = [
  {
    name: 'User',
    description: 'Central identity and access management entity with bcrypt hashed passwords and RBAC.',
    columns: [
      { name: 'id', type: 'VARCHAR(64)', isPrimary: true, description: 'Surrogate primary key (cuid)' },
      { name: 'email', type: 'VARCHAR(255)', isUnique: true, description: 'Unique login credential' },
      { name: 'password', type: 'VARCHAR(255)', description: 'One-way cryptographic hash (bcrypt salt rounds = 10)' },
      { name: 'name', type: 'VARCHAR(255)', description: 'Full legal name of the user' },
      { name: 'role', type: 'VARCHAR(32)', checkConstraint: "IN ('ADMIN','DOCTOR','RECEPTIONIST','PATIENT')", description: 'System privilege level' },
      { name: 'isActive', type: 'BOOLEAN', description: 'Account status flag for soft deactivation' },
      { name: 'lastLogin', type: 'TIMESTAMP', isNullable: true, description: 'Session tracking timestamp' },
    ],
  },
  {
    name: 'Department',
    description: 'Clinical specialized hospital wings (Cardiology, Neurology, Pediatrics, etc.)',
    columns: [
      { name: 'id', type: 'VARCHAR(64)', isPrimary: true, description: 'Primary key' },
      { name: 'code', type: 'VARCHAR(16)', isUnique: true, description: 'Standard clinical department code (e.g. CARD, NEUR)' },
      { name: 'name', type: 'VARCHAR(255)', description: 'Department display title' },
      { name: 'headOfDept', type: 'VARCHAR(255)', isNullable: true, description: 'Physician head of department' },
    ],
  },
  {
    name: 'Doctor',
    description: 'Medical practitioners with clinical credentials, department linkages, and availability.',
    columns: [
      { name: 'id', type: 'VARCHAR(64)', isPrimary: true, description: 'Primary key' },
      { name: 'doctorId', type: 'VARCHAR(32)', isUnique: true, description: 'Hospital badge identifier (e.g. DOC-1001)' },
      { name: 'userId', type: 'VARCHAR(64)', isForeign: true, references: 'User(id)', isUnique: true, description: '1-to-1 linkage to User' },
      { name: 'departmentId', type: 'VARCHAR(64)', isForeign: true, references: 'Department(id)', description: 'Many-to-1 linkage to Department' },
      { name: 'specialization', type: 'VARCHAR(255)', description: 'Subspecialty domain' },
      { name: 'qualification', type: 'VARCHAR(255)', description: 'Medical degrees & fellowships' },
      { name: 'experience', type: 'INTEGER', checkConstraint: '>= 0', description: 'Years in active clinical practice' },
      { name: 'consultationFee', type: 'NUMERIC(10,2)', description: 'Standard visit tariff' },
      { name: 'availabilityStatus', type: 'VARCHAR(32)', checkConstraint: "IN ('AVAILABLE','ON_LEAVE','BUSY')", description: 'Current shift availability' },
    ],
  },
  {
    name: 'Patient',
    description: 'Patient master entity adhering strictly to 3NF with decoupled clinical observations.',
    columns: [
      { name: 'id', type: 'VARCHAR(64)', isPrimary: true, description: 'Primary key' },
      { name: 'patientId', type: 'VARCHAR(32)', isUnique: true, description: 'Unique Electronic Health Record (EHR) code' },
      { name: 'userId', type: 'VARCHAR(64)', isForeign: true, references: 'User(id)', isUnique: true, isNullable: true, description: 'Optional portal user account' },
      { name: 'fullName', type: 'VARCHAR(255)', description: 'Patient name' },
      { name: 'dob', type: 'TIMESTAMP', description: 'Date of birth for age calculation' },
      { name: 'gender', type: 'VARCHAR(16)', checkConstraint: "IN ('MALE','FEMALE','OTHER')", description: 'Biological sex' },
      { name: 'bloodGroup', type: 'VARCHAR(8)', checkConstraint: "IN ('A+','A-','B+','B-','AB+','AB-','O+','O-')", description: 'ABO and Rh blood group' },
      { name: 'contact', type: 'VARCHAR(32)', description: 'Primary phone number' },
      { name: 'allergies', type: 'TEXT', isNullable: true, description: 'Known drug or environmental sensitivities' },
      { name: 'medicalHistory', type: 'TEXT', isNullable: true, description: 'Pre-existing chronic diagnoses' },
    ],
  },
  {
    name: 'Appointment',
    description: 'Encounters between Patient and Doctor with composite uniqueness preventing double-booking.',
    columns: [
      { name: 'id', type: 'VARCHAR(64)', isPrimary: true, description: 'Primary key' },
      { name: 'appointmentId', type: 'VARCHAR(32)', isUnique: true, description: 'Hospital booking token (e.g. APT-4001)' },
      { name: 'patientId', type: 'VARCHAR(64)', isForeign: true, references: 'Patient(id)', description: 'Encounter patient' },
      { name: 'doctorId', type: 'VARCHAR(64)', isForeign: true, references: 'Doctor(id)', description: 'Encounter clinician' },
      { name: 'departmentId', type: 'VARCHAR(64)', isForeign: true, references: 'Department(id)', description: 'Clinical department' },
      { name: 'appointmentDate', type: 'TIMESTAMP', description: 'Calendar date of consultation' },
      { name: 'timeSlot', type: 'VARCHAR(64)', description: 'Allocated slot window' },
      { name: 'status', type: 'VARCHAR(32)', checkConstraint: "IN ('SCHEDULED','CONFIRMED','COMPLETED','CANCELLED')", description: 'Workflow state' },
    ],
  },
  {
    name: 'Prescription & PrescriptionItem',
    description: 'Normalized 1-to-Many relationship separating prescription header from medication line items.',
    columns: [
      { name: 'prescriptionId', type: 'VARCHAR(32)', isPrimary: true, description: 'Header token (e.g. RX-5001)' },
      { name: 'patientId', type: 'VARCHAR(64)', isForeign: true, references: 'Patient(id)', description: 'Prescribed recipient' },
      { name: 'doctorId', type: 'VARCHAR(64)', isForeign: true, references: 'Doctor(id)', description: 'Prescribing doctor' },
      { name: 'medicineId', type: 'VARCHAR(64)', isForeign: true, references: 'Medicine(id)', description: 'Formulary catalog reference in item row' },
      { name: 'dosage', type: 'VARCHAR(64)', description: 'Strength per administration' },
      { name: 'frequency', type: 'VARCHAR(128)', description: 'Dosing interval (e.g., 1-0-1 after food)' },
    ],
  },
  {
    name: 'AIAnalysis',
    description: 'Clinical Decision Support reasoning log storing algorithmic differential formulation and doctor signoff.',
    columns: [
      { name: 'id', type: 'VARCHAR(64)', isPrimary: true, description: 'Primary key' },
      { name: 'patientId', type: 'VARCHAR(64)', isForeign: true, references: 'Patient(id)', description: 'Evaluated patient' },
      { name: 'doctorId', type: 'VARCHAR(64)', isForeign: true, references: 'Doctor(id)', description: 'Reviewing doctor' },
      { name: 'vitals', type: 'JSONB', description: 'Structured vital sign parameters' },
      { name: 'differentialSuggestions', type: 'JSONB', description: 'Differential diagnoses with ICD-10 and confidence scores' },
      { name: 'reviewedByDoctor', type: 'BOOLEAN', description: 'Mandatory clinical review indicator' },
    ],
  },
  {
    name: 'AuditLog',
    description: 'Immutable historical audit trail recording system events, IP addresses, and user actions.',
    columns: [
      { name: 'id', type: 'VARCHAR(64)', isPrimary: true, description: 'Primary key' },
      { name: 'userId', type: 'VARCHAR(64)', isForeign: true, references: 'User(id)', isNullable: true, description: 'Actor initiating action' },
      { name: 'action', type: 'VARCHAR(64)', description: 'Event type (e.g. BOOK_APPOINTMENT, CREATE_PATIENT)' },
      { name: 'entity', type: 'VARCHAR(64)', description: 'Target entity type' },
      { name: 'entityId', type: 'VARCHAR(64)', isNullable: true, description: 'Target entity ID' },
      { name: 'timestamp', type: 'TIMESTAMP', description: 'UTC event occurrence timestamp' },
    ],
  },
];

export const normalizationDocs = {
  overview: 'Normalization organizes columns and tables in a relational database to minimize data redundancy and prevent insertion, update, and deletion anomalies. MEDNEXUS is engineered in Third Normal Form (3NF).',
  stages: [
    {
      stage: 'Unnormalized Form (UNF)',
      problem: 'A single monolithic "Patient_Visits" table where patient demographics, doctor details, multiple medicines, and vitals were stored together with multi-valued repeating groups.',
      example: 'Patient_Visits(PatientID, Name, DoctorName, DoctorDept, Med1, Dose1, Med2, Dose2, Vitals)',
      anomaly: 'Repeating medication columns, wasted NULL storage, unable to add doctor without a patient.',
    },
    {
      stage: 'First Normal Form (1NF)',
      rule: 'Eliminate repeating groups; each column must contain atomic (indivisible) values; define a Primary Key.',
      transformation: 'Decomposed medication arrays into separate line records. Separated Patient and Prescription items into discrete atomic entries.',
      result: 'All columns hold scalar values. Composite primary keys or surrogate keys introduced.',
    },
    {
      stage: 'Second Normal Form (2NF)',
      rule: 'Must be in 1NF and have NO Partial Functional Dependencies (all non-key attributes fully functionally dependent on the entire Primary Key).',
      transformation: 'In a composite key (PrescriptionID, MedicineID), Doctor details depended only on PrescriptionID. We isolated Doctor and Medicine into distinct tables, referencing them via Foreign Keys.',
      result: 'No non-key attribute depends on a proper subset of candidate keys.',
    },
    {
      stage: 'Third Normal Form (3NF)',
      rule: 'Must be in 2NF and have NO Transitive Dependencies (non-key attributes must depend solely on the candidate key: X → Y and Y → Z eliminated).',
      transformation: 'Doctor entity previously had DepartmentName dependent on DepartmentCode, which depended on DoctorID. We normalized Department into its own entity: Doctor → DepartmentID → Department.',
      result: 'Zero transitive dependencies. High structural integrity and minimal redundant storage.',
    },
  ],
};

export const sampleSqlQueries = [
  {
    title: 'Multi-Table INNER JOIN: Comprehensive Clinical Consultation Roster',
    category: 'JOIN Operations',
    sql: `SELECT 
    a."appointmentId",
    p."fullName" AS patient_name,
    p."bloodGroup",
    d."name" AS doctor_name,
    dep."name" AS department_name,
    a."appointmentDate",
    a."timeSlot",
    a."status"
FROM "Appointment" a
JOIN "Patient" p ON a."patientId" = p."id"
JOIN "Doctor" d ON a."doctorId" = d."id"
JOIN "Department" dep ON a."departmentId" = dep."id"
WHERE a."status" = 'CONFIRMED'
ORDER BY a."appointmentDate" ASC;`,
    explanation: 'Combines four normalized entities (Appointment, Patient, Doctor, Department) using Foreign Key references with indexing on appointmentDate and status.',
  },
  {
    title: 'Aggregate & GROUP BY: Departmental Revenue & Patient Volume Analytics',
    category: 'Aggregations',
    sql: `SELECT 
    dep."name" AS department,
    COUNT(DISTINCT d."id") AS total_physicians,
    COUNT(a."id") AS total_consultations,
    SUM(CASE WHEN a."status" = 'COMPLETED' THEN d."consultationFee" ELSE 0 END) AS estimated_revenue
FROM "Department" dep
LEFT JOIN "Doctor" d ON dep."id" = d."departmentId"
LEFT JOIN "Appointment" a ON d."id" = a."doctorId"
GROUP BY dep."id", dep."name"
HAVING COUNT(a."id") > 0
ORDER BY estimated_revenue DESC;`,
    explanation: 'Uses aggregate functions (COUNT, SUM with conditional CASE expression), LEFT JOIN to preserve departments, and HAVING clause filtering.',
  },
  {
    title: 'Correlated Subquery: High-Risk Patients with Multiple Urgent Alerts',
    category: 'Nested Subqueries',
    sql: `SELECT 
    p."patientId",
    p."fullName",
    p."bloodGroup",
    p."contact"
FROM "Patient" p
WHERE (
    SELECT COUNT(*) 
    FROM "AIAnalysis" ai 
    WHERE ai."patientId" = p."id" 
      AND ai."vitals"::jsonb->>'spo2' IS NOT NULL 
      AND (ai."vitals"::jsonb->>'spo2')::numeric < 92
) > 0;`,
    explanation: 'Correlated subquery evaluating nested JSONB fields in AIAnalysis to retrieve patients with critical oxygen saturation drops.',
  },
  {
    title: 'Window Function: Doctor Consultation Ranking within Each Specialty',
    category: 'Window Functions',
    sql: `SELECT 
    d."name" AS doctor_name,
    dep."name" AS specialty,
    COUNT(a."id") AS total_appointments,
    DENSE_RANK() OVER (
        PARTITION BY dep."id" 
        ORDER BY COUNT(a."id") DESC
    ) AS rank_in_specialty
FROM "Doctor" d
JOIN "Department" dep ON d."departmentId" = dep."id"
LEFT JOIN "Appointment" a ON d."id" = a."doctorId"
GROUP BY d."id", d."name", dep."id", dep."name";`,
    explanation: 'Demonstrates analytical PARTITION BY and DENSE_RANK() to classify doctors by workload per department without collapsing rows.',
  },
];

export const acidTransactionExplanation = {
  title: 'ACID Properties in Hospital Management Systems',
  atomicity: {
    name: 'Atomicity (All-or-Nothing)',
    description: 'When a doctor writes a prescription with 5 medicines, either all 5 line items and the prescription header are committed together, or none are. If an error occurs midway, the entire transaction is rolled back.',
    sqlExample: `BEGIN TRANSACTION;
  INSERT INTO "Prescription" ("id", "prescriptionId", "patientId", "doctorId", "diagnosis")
  VALUES ('rx_01', 'RX-9901', 'pat_01', 'doc_01', 'Bacterial Pharyngitis');

  INSERT INTO "PrescriptionItem" ("id", "prescriptionId", "medicineName", "dosage")
  VALUES ('item_01', 'rx_01', 'Amoxicillin 500mg', '1 TID');

  INSERT INTO "PrescriptionItem" ("id", "prescriptionId", "medicineName", "dosage")
  VALUES ('item_02', 'rx_01', 'Paracetamol 650mg', '1 PRN');
COMMIT;`,
  },
  consistency: {
    name: 'Consistency (Constraint Preservation)',
    description: 'The database guarantees that business rules and constraints are never violated. For example, a patient cannot be double-booked for the exact same doctor and time slot due to UNIQUE ("doctorId", "appointmentDate", "timeSlot").',
  },
  isolation: {
    name: 'Isolation (Concurrency Control)',
    description: 'Two receptionists attempting to book the last available appointment slot at the same second are handled via Serializable or Read Committed isolation levels with row locks, preventing race conditions.',
  },
  durability: {
    name: 'Durability (Persistence)',
    description: 'Once a laboratory report or prescription is committed, Write-Ahead Logging (WAL) ensures that data will not be lost even in the event of an immediate power outage or server crash.',
  },
};

export const sqlVsMongoComparison = [
  {
    feature: 'Data Model',
    sql: 'Relational 3NF Tables with strict schema, foreign keys, and typed columns',
    mongo: 'Document-oriented BSON collections with dynamic/flexible schema',
  },
  {
    feature: 'Relationships',
    sql: 'Normalized Foreign Keys with declarative constraints (ON DELETE CASCADE)',
    mongo: 'Embedded subdocuments (e.g., items array inside prescription) or Manual References ($lookup)',
  },
  {
    feature: 'ACID Support',
    sql: 'First-class native multi-table ACID transactions supported out-of-the-box',
    mongo: 'Single-document atomicity; multi-document transactions supported since v4.0 but with performance overhead',
  },
  {
    feature: 'Complex Queries',
    sql: 'Powerful expressive JOINs, Window Functions, Aggregate CTEs, and Groupings',
    mongo: 'Aggregation Pipeline ($match, $group, $unwind, $lookup)',
  },
  {
    feature: 'Healthcare Fit',
    sql: 'Ideal for billing, clinical EHR, lab audits, and compliance where zero data duplication is paramount',
    mongo: 'Ideal for unstructured medical telemetry, wearable time-series, or variable IoT medical device packets',
  },
];
