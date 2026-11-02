const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('--- Cleaning previous data ---');
  await prisma.auditLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.aIAnalysis.deleteMany();
  await prisma.labReport.deleteMany();
  await prisma.prescriptionItem.deleteMany();
  await prisma.prescription.deleteMany();
  await prisma.medicalRecord.deleteMany();
  await prisma.appointment.deleteMany();
  await prisma.medicine.deleteMany();
  await prisma.staff.deleteMany();
  await prisma.patient.deleteMany();
  await prisma.doctor.deleteMany();
  await prisma.department.deleteMany();
  await prisma.user.deleteMany();

  console.log('--- Seeding Departments ---');
  const departmentsData = [
    { code: 'CARD', name: 'Cardiology', description: 'Advanced cardiovascular diagnostics, interventions, and intensive cardiac care.', headOfDept: 'Dr. Robert Harrison, MD, FACC' },
    { code: 'NEUR', name: 'Neurology', description: 'Comprehensive neurological assessment, stroke care, and neurodegenerative disorders.', headOfDept: 'Dr. Elena Rostova, MD, PhD' },
    { code: 'PEDI', name: 'Pediatrics', description: 'Infant, child, and adolescent healthcare, immunizations, and developmental medicine.', headOfDept: 'Dr. Sarah Jenkins, MD, FAAP' },
    { code: 'ORTH', name: 'Orthopedics', description: 'Musculoskeletal surgery, trauma rehabilitation, joint replacement, and sports medicine.', headOfDept: 'Dr. Marcus Vance, MS, FRCS' },
    { code: 'ONCO', name: 'Oncology', description: 'Medical oncology, precision therapeutics, clinical trials, and palliative care.', headOfDept: 'Dr. Priya Sharma, MD, DM' },
    { code: 'GENM', name: 'General Medicine', description: 'Internal medicine, chronic illness management, triage, and preventive health screenings.', headOfDept: 'Dr. David Chen, MD, FACP' },
  ];

  const departments = {};
  for (const dept of departmentsData) {
    const created = await prisma.department.create({ data: dept });
    departments[dept.code] = created;
  }

  console.log('--- Seeding Medicines ---');
  const medicinesData = [
    { code: 'MED-101', name: 'Amoxicillin & Clavulanate', genericName: 'Amoxicillin / Clavulanic Acid', category: 'ANTIBIOTIC', form: 'TABLET', strength: '625mg', stockQuantity: 250, unitPrice: 18.50 },
    { code: 'MED-102', name: 'Azithromycin', genericName: 'Azithromycin Dihydrate', category: 'ANTIBIOTIC', form: 'TABLET', strength: '500mg', stockQuantity: 180, unitPrice: 22.00 },
    { code: 'MED-103', name: 'Paracetamol / Acetaminophen', genericName: 'Paracetamol', category: 'ANALGESIC', form: 'TABLET', strength: '650mg', stockQuantity: 600, unitPrice: 4.50 },
    { code: 'MED-104', name: 'Ibuprofen', genericName: 'Ibuprofen', category: 'NSAID', form: 'TABLET', strength: '400mg', stockQuantity: 320, unitPrice: 6.00 },
    { code: 'MED-105', name: 'Metformin HCl', genericName: 'Metformin Hydrochloride', category: 'ANTIDIABETIC', form: 'TABLET', strength: '500mg', stockQuantity: 450, unitPrice: 8.00 },
    { code: 'MED-106', name: 'Glimepiride', genericName: 'Glimepiride', category: 'ANTIDIABETIC', form: 'TABLET', strength: '2mg', stockQuantity: 280, unitPrice: 12.00 },
    { code: 'MED-107', name: 'Amlodipine Besylate', genericName: 'Amlodipine', category: 'ANTIHYPERTENSIVE', form: 'TABLET', strength: '5mg', stockQuantity: 350, unitPrice: 9.50 },
    { code: 'MED-108', name: 'Telmisartan', genericName: 'Telmisartan', category: 'ANTIHYPERTENSIVE', form: 'TABLET', strength: '40mg', stockQuantity: 310, unitPrice: 14.00 },
    { code: 'MED-109', name: 'Atorvastatin Calcium', genericName: 'Atorvastatin', category: 'LIPID_LOWERING', form: 'TABLET', strength: '20mg', stockQuantity: 290, unitPrice: 16.50 },
    { code: 'MED-110', name: 'Pantoprazole Gastro-resistant', genericName: 'Pantoprazole Sodium', category: 'ANTACID_PPI', form: 'TABLET', strength: '40mg', stockQuantity: 500, unitPrice: 11.00 },
    { code: 'MED-111', name: 'Levothyroxine Sodium', genericName: 'Levothyroxine', category: 'ENDOCRINOLOGY', form: 'TABLET', strength: '50mcg', stockQuantity: 220, unitPrice: 15.00 },
    { code: 'MED-112', name: 'Salbutamol Inhaler', genericName: 'Albuterol Sulfate', category: 'RESPIRATORY', form: 'INHALER', strength: '100mcg/puff', stockQuantity: 120, unitPrice: 45.00 },
    { code: 'MED-113', name: 'Montelukast Sodium', genericName: 'Montelukast', category: 'RESPIRATORY', form: 'TABLET', strength: '10mg', stockQuantity: 190, unitPrice: 19.00 },
    { code: 'MED-114', name: 'Cetirizine HCl', genericName: 'Cetirizine', category: 'ANTIHISTAMINE', form: 'TABLET', strength: '10mg', stockQuantity: 420, unitPrice: 5.00 },
    { code: 'MED-115', name: 'Tramadol HCl', genericName: 'Tramadol Hydrochloride', category: 'ANALGESIC_OPIOID', form: 'CAPSULE', strength: '50mg', stockQuantity: 95, unitPrice: 28.00 },
  ];

  const medicines = [];
  for (const m of medicinesData) {
    const med = await prisma.medicine.create({ data: m });
    medicines.push(med);
  }

  console.log('--- Seeding Default Authentication Accounts ---');
  const adminPassword = await bcrypt.hash('Admin@123', 10);
  const doctorPassword = await bcrypt.hash('Doctor@123', 10);
  const receptionPassword = await bcrypt.hash('Reception@123', 10);
  const patientPassword = await bcrypt.hash('Patient@123', 10);

  // 1. Admin User
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@mednexus.com',
      password: adminPassword,
      name: 'Dr. Gregory House (Chief Admin)',
      role: 'ADMIN',
      phone: '+1 (555) 019-2831',
      avatar: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=256&q=80',
    },
  });

  // 2. Main Doctor User
  const doctorUser = await prisma.user.create({
    data: {
      email: 'doctor@mednexus.com',
      password: doctorPassword,
      name: 'Dr. Robert Harrison',
      role: 'DOCTOR',
      phone: '+1 (555) 304-1829',
      avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=256&q=80',
    },
  });

  // 3. Receptionist User
  const receptionUser = await prisma.user.create({
    data: {
      email: 'reception@mednexus.com',
      password: receptionPassword,
      name: 'Clara Oswald',
      role: 'RECEPTIONIST',
      phone: '+1 (555) 441-9281',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=256&q=80',
    },
  });

  await prisma.staff.create({
    data: {
      staffId: 'STF-3001',
      userId: receptionUser.id,
      name: receptionUser.name,
      email: receptionUser.email,
      contact: receptionUser.phone,
      role: 'RECEPTIONIST',
      shift: 'MORNING',
      departmentId: departments['GENM'].id,
    },
  });

  // 4. Main Patient User
  const patientUser = await prisma.user.create({
    data: {
      email: 'patient@mednexus.com',
      password: patientPassword,
      name: 'Alexander Wright',
      role: 'PATIENT',
      phone: '+1 (555) 782-9912',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80',
    },
  });

  console.log('--- Seeding Doctors (8-10 specialized doctors) ---');
  const doctorsList = [
    {
      doctorId: 'DOC-1001',
      userId: doctorUser.id,
      name: 'Dr. Robert Harrison',
      email: 'doctor@mednexus.com',
      contact: '+1 (555) 304-1829',
      departmentId: departments['CARD'].id,
      specialization: 'Interventional Cardiology & Electrophysiology',
      qualification: 'MD (Cardiology), FACC, FSCAI',
      experience: 16,
      consultationFee: 95.0,
      consultationTimings: '09:00 AM - 01:00 PM',
      availabilityStatus: 'AVAILABLE',
    },
    {
      doctorId: 'DOC-1002',
      name: 'Dr. Elena Rostova',
      email: 'e.rostova@mednexus.com',
      contact: '+1 (555) 601-3841',
      departmentId: departments['NEUR'].id,
      specialization: 'Cerebrovascular Disease & Neuro-immunology',
      qualification: 'MD, PhD (Neuroscience), FAAN',
      experience: 14,
      consultationFee: 110.0,
      consultationTimings: '10:00 AM - 02:00 PM',
      availabilityStatus: 'AVAILABLE',
    },
    {
      doctorId: 'DOC-1003',
      name: 'Dr. Sarah Jenkins',
      email: 's.jenkins@mednexus.com',
      contact: '+1 (555) 882-9014',
      departmentId: departments['PEDI'].id,
      specialization: 'Pediatric Pulmonology & Neonatology',
      qualification: 'MD (Pediatrics), FAAP',
      experience: 11,
      consultationFee: 75.0,
      consultationTimings: '08:30 AM - 12:30 PM',
      availabilityStatus: 'AVAILABLE',
    },
    {
      doctorId: 'DOC-1004',
      name: 'Dr. Marcus Vance',
      email: 'm.vance@mednexus.com',
      contact: '+1 (555) 472-1092',
      departmentId: departments['ORTH'].id,
      specialization: 'Joint Reconstruction & Arthroscopic Surgery',
      qualification: 'MS (Orthopedics), FRCS',
      experience: 18,
      consultationFee: 100.0,
      consultationTimings: '01:00 PM - 05:00 PM',
      availabilityStatus: 'AVAILABLE',
    },
    {
      doctorId: 'DOC-1005',
      name: 'Dr. Priya Sharma',
      email: 'p.sharma@mednexus.com',
      contact: '+1 (555) 912-4431',
      departmentId: departments['ONCO'].id,
      specialization: 'Clinical Oncology & Targeted Chemotherapy',
      qualification: 'MD, DM (Medical Oncology), ESMO Certified',
      experience: 13,
      consultationFee: 125.0,
      consultationTimings: '11:00 AM - 03:00 PM',
      availabilityStatus: 'AVAILABLE',
    },
    {
      doctorId: 'DOC-1006',
      name: 'Dr. David Chen',
      email: 'd.chen@mednexus.com',
      contact: '+1 (555) 349-8109',
      departmentId: departments['GENM'].id,
      specialization: 'Internal Medicine & Metabolic Health',
      qualification: 'MD (Internal Medicine), FACP',
      experience: 9,
      consultationFee: 65.0,
      consultationTimings: '09:00 AM - 01:00 PM, 04:00 PM - 07:00 PM',
      availabilityStatus: 'AVAILABLE',
    },
    {
      doctorId: 'DOC-1007',
      name: 'Dr. Katherine Bell',
      email: 'k.bell@mednexus.com',
      contact: '+1 (555) 784-2190',
      departmentId: departments['CARD'].id,
      specialization: 'Congestive Heart Failure & Cardiac Rehabilitation',
      qualification: 'MD (Cardiovascular Medicine)',
      experience: 8,
      consultationFee: 85.0,
      consultationTimings: '02:00 PM - 06:00 PM',
      availabilityStatus: 'AVAILABLE',
    },
    {
      doctorId: 'DOC-1008',
      name: 'Dr. Arjun Mehta',
      email: 'a.mehta@mednexus.com',
      contact: '+1 (555) 554-9022',
      departmentId: departments['ORTH'].id,
      specialization: 'Spine Surgery & Trauma Care',
      qualification: 'MS, DNB (Orthopedics)',
      experience: 12,
      consultationFee: 90.0,
      consultationTimings: '09:30 AM - 01:30 PM',
      availabilityStatus: 'BUSY',
    },
  ];

  const doctors = [];
  for (const doc of doctorsList) {
    const created = await prisma.doctor.create({ data: doc });
    doctors.push(created);
  }

  console.log('--- Seeding Patients (22 realistic patient profiles) ---');
  const patientsData = [
    {
      patientId: 'PAT-2001',
      userId: patientUser.id,
      fullName: 'Alexander Wright',
      dob: new Date('1984-06-14'),
      gender: 'MALE',
      contact: '+1 (555) 782-9912',
      email: 'patient@mednexus.com',
      address: '742 Evergreen Terrace, Springfield, OR',
      bloodGroup: 'O+',
      emergencyContact: '+1 (555) 782-9915',
      emergencyContactRelation: 'Spouse (Emily Wright)',
      medicalHistory: 'Essential Hypertension (5 yrs), Mild hyperlipidemia',
      allergies: 'Penicillin (mild cutaneous rash), Shellfish',
    },
    {
      patientId: 'PAT-2002',
      fullName: 'Beatrice Eleanor Vance',
      dob: new Date('1962-11-20'),
      gender: 'FEMALE',
      contact: '+1 (555) 201-9481',
      email: 'beatrice.vance@example.com',
      address: '14 Elmwood Drive, Boston, MA',
      bloodGroup: 'A+',
      emergencyContact: '+1 (555) 201-9482',
      emergencyContactRelation: 'Son (Thomas Vance)',
      medicalHistory: 'Type 2 Diabetes Mellitus, Osteoarthritis of knees',
      allergies: 'Sulfa Drugs',
    },
    {
      patientId: 'PAT-2003',
      fullName: 'Carlos Mendoza',
      dob: new Date('1991-03-05'),
      gender: 'MALE',
      contact: '+1 (555) 674-1294',
      email: 'carlos.m@example.com',
      address: '88 Sol Del Mar Ave, San Diego, CA',
      bloodGroup: 'B+',
      emergencyContact: '+1 (555) 674-1299',
      emergencyContactRelation: 'Brother (Mateo Mendoza)',
      medicalHistory: 'Asthma since childhood (well-controlled on ICS)',
      allergies: 'Aspirin (bronchospasm)',
    },
    {
      patientId: 'PAT-2004',
      fullName: 'Diana Prince',
      dob: new Date('1978-08-18'),
      gender: 'FEMALE',
      contact: '+1 (555) 431-8890',
      email: 'diana.prince@example.com',
      address: '220 Gateway Blvd, Austin, TX',
      bloodGroup: 'AB-',
      emergencyContact: '+1 (555) 431-8891',
      emergencyContactRelation: 'Sister (Hippolyta Prince)',
      medicalHistory: 'Hypothyroidism (treated with levothyroxine 50mcg)',
      allergies: 'None known',
    },
    {
      patientId: 'PAT-2005',
      fullName: 'Ethan James Cooper',
      dob: new Date('2001-12-09'),
      gender: 'MALE',
      contact: '+1 (555) 902-3145',
      email: 'ethan.cooper@example.com',
      address: '53 University Way, Seattle, WA',
      bloodGroup: 'O-',
      emergencyContact: '+1 (555) 902-3140',
      emergencyContactRelation: 'Mother (Sarah Cooper)',
      medicalHistory: 'No significant past medical history',
      allergies: 'Latex',
    },
    {
      patientId: 'PAT-2006',
      fullName: 'Fatima Al-Mansoor',
      dob: new Date('1970-04-25'),
      gender: 'FEMALE',
      contact: '+1 (555) 318-7742',
      email: 'fatima.m@example.com',
      address: '104 Michigan Ave, Chicago, IL',
      bloodGroup: 'B-',
      emergencyContact: '+1 (555) 318-7740',
      emergencyContactRelation: 'Husband (Tariq Al-Mansoor)',
      medicalHistory: 'Coronary artery disease, stent placed 2021',
      allergies: 'ACE inhibitors (chronic cough)',
    },
    {
      patientId: 'PAT-2007',
      fullName: 'George William Sterling',
      dob: new Date('1955-09-12'),
      gender: 'MALE',
      contact: '+1 (555) 749-3321',
      email: 'george.sterling@example.com',
      address: '34 Pine Ridge Road, Denver, CO',
      bloodGroup: 'A-',
      emergencyContact: '+1 (555) 749-3325',
      emergencyContactRelation: 'Daughter (Rachel Sterling)',
      medicalHistory: 'Benign Prostatic Hyperplasia, Chronic Kidney Disease Stage 2',
      allergies: 'Contrast dye',
    },
    {
      patientId: 'PAT-2008',
      fullName: 'Hannah Marie Scott',
      dob: new Date('1995-07-30'),
      gender: 'FEMALE',
      contact: '+1 (555) 830-1928',
      email: 'hannah.scott@example.com',
      address: '404 Peachtree St, Atlanta, GA',
      bloodGroup: 'O+',
      emergencyContact: '+1 (555) 830-1930',
      emergencyContactRelation: 'Partner (Liam Evans)',
      medicalHistory: 'Migraine with aura, Polycystic Ovary Syndrome',
      allergies: 'None reported',
    },
    {
      patientId: 'PAT-2009',
      fullName: 'Isaac Newton Campbell',
      dob: new Date('1968-01-15'),
      gender: 'MALE',
      contact: '+1 (555) 492-7612',
      email: 'isaac.c@example.com',
      address: '912 Broadway, New York, NY',
      bloodGroup: 'AB+',
      emergencyContact: '+1 (555) 492-7619',
      emergencyContactRelation: 'Wife (Miriam Campbell)',
      medicalHistory: 'Hyperuricemia / Gout, Dyslipidemia',
      allergies: 'Allopurinol (rash)',
    },
    {
      patientId: 'PAT-2010',
      fullName: 'Jasmine Kaur Sandhu',
      dob: new Date('1988-10-04'),
      gender: 'FEMALE',
      contact: '+1 (555) 621-0983',
      email: 'jasmine.sandhu@example.com',
      address: '56 Silicon Ave, San Jose, CA',
      bloodGroup: 'B+',
      emergencyContact: '+1 (555) 621-0985',
      emergencyContactRelation: 'Brother (Harpreet Sandhu)',
      medicalHistory: 'Gestational diabetes (resolved 2022)',
      allergies: 'Ibuprofen',
    },
    {
      patientId: 'PAT-2011',
      fullName: 'Kenneth O’Connor',
      dob: new Date('1975-05-19'),
      gender: 'MALE',
      contact: '+1 (555) 381-4472',
      email: 'k.oconnor@example.com',
      address: '77 Harbour View, Portland, ME',
      bloodGroup: 'O+',
      emergencyContact: '+1 (555) 381-4470',
      emergencyContactRelation: 'Spouse (Brigid O’Connor)',
      medicalHistory: 'Atrial fibrillation on oral anticoagulants',
      allergies: 'Codeine',
    },
    {
      patientId: 'PAT-2012',
      fullName: 'Lin Wei-Ting',
      dob: new Date('1993-02-28'),
      gender: 'FEMALE',
      contact: '+1 (555) 914-7263',
      email: 'lin.weiting@example.com',
      address: '15 Maple Leaf Blvd, Toronto, ON',
      bloodGroup: 'A+',
      emergencyContact: '+1 (555) 914-7260',
      emergencyContactRelation: 'Father (Chen Wei-Ting)',
      medicalHistory: 'Allergic rhinitis, eczema',
      allergies: 'Peanuts, Tree nuts',
    },
    {
      patientId: 'PAT-2013',
      fullName: 'Michael Anthony Rossi',
      dob: new Date('1980-11-11'),
      gender: 'MALE',
      contact: '+1 (555) 723-5590',
      email: 'michael.rossi@example.com',
      address: '62 Little Italy Way, Philadelphia, PA',
      bloodGroup: 'B+',
      emergencyContact: '+1 (555) 723-5595',
      emergencyContactRelation: 'Sister (Gina Rossi)',
      medicalHistory: 'GERD, Lumbar disc herniation (L4-L5)',
      allergies: 'Morphine (severe nausea)',
    },
    {
      patientId: 'PAT-2014',
      fullName: 'Nadia Valerie Petrova',
      dob: new Date('1986-09-03'),
      gender: 'FEMALE',
      contact: '+1 (555) 819-3304',
      email: 'nadia.petrova@example.com',
      address: '290 Lakeview Crescent, Minneapolis, MN',
      bloodGroup: 'O-',
      emergencyContact: '+1 (555) 819-3300',
      emergencyContactRelation: 'Husband (Dmitri Petrov)',
      medicalHistory: 'Iron deficiency anemia',
      allergies: 'Sulfa',
    },
    {
      patientId: 'PAT-2015',
      fullName: 'Omar Farooq Malik',
      dob: new Date('1964-12-22'),
      gender: 'MALE',
      contact: '+1 (555) 642-1875',
      email: 'omar.malik@example.com',
      address: '410 Sunset Strip, Dallas, TX',
      bloodGroup: 'A-',
      emergencyContact: '+1 (555) 642-1870',
      emergencyContactRelation: 'Wife (Zainab Malik)',
      medicalHistory: 'Metabolic syndrome, NAFLD, Hypertension',
      allergies: 'None reported',
    },
    {
      patientId: 'PAT-2016',
      fullName: 'Patricia Ann Murphy',
      dob: new Date('1959-03-17'),
      gender: 'FEMALE',
      contact: '+1 (555) 508-6623',
      email: 'patricia.murphy@example.com',
      address: '18 Clover Lane, Dublin, OH',
      bloodGroup: 'O+',
      emergencyContact: '+1 (555) 508-6620',
      emergencyContactRelation: 'Son (Kevin Murphy)',
      medicalHistory: 'Osteoporosis, previous wrist fracture',
      allergies: 'Penicillin',
    },
    {
      patientId: 'PAT-2017',
      fullName: 'Quinn Riley Mercer',
      dob: new Date('1999-07-07'),
      gender: 'OTHER',
      contact: '+1 (555) 931-4082',
      email: 'quinn.mercer@example.com',
      address: '730 Bohemian Park, Portland, OR',
      bloodGroup: 'AB+',
      emergencyContact: '+1 (555) 931-4080',
      emergencyContactRelation: 'Friend (Sam Taylor)',
      medicalHistory: 'Generalized anxiety, insomnia',
      allergies: 'Ciprofloxacin',
    },
    {
      patientId: 'PAT-2018',
      fullName: 'Ravi Teja Varma',
      dob: new Date('1972-06-29'),
      gender: 'MALE',
      contact: '+1 (555) 463-7719',
      email: 'ravi.varma@example.com',
      address: '88 Cyber Gateway, Phoenix, AZ',
      bloodGroup: 'B+',
      emergencyContact: '+1 (555) 463-7710',
      emergencyContactRelation: 'Wife (Sunita Varma)',
      medicalHistory: 'Type 2 Diabetes, Diabetic retinopathy stage 1',
      allergies: 'None reported',
    },
    {
      patientId: 'PAT-2019',
      fullName: 'Sofia Isabella Reyes',
      dob: new Date('2003-08-14'),
      gender: 'FEMALE',
      contact: '+1 (555) 877-2291',
      email: 'sofia.reyes@example.com',
      address: '315 Ocean Promenade, Miami, FL',
      bloodGroup: 'O+',
      emergencyContact: '+1 (555) 877-2290',
      emergencyContactRelation: 'Mother (Elena Reyes)',
      medicalHistory: 'Appendectomy (2020)',
      allergies: 'Amoxicillin',
    },
    {
      patientId: 'PAT-2020',
      fullName: 'Tobias George Fletcher',
      dob: new Date('1967-10-10'),
      gender: 'MALE',
      contact: '+1 (555) 321-9984',
      email: 'tobias.fletcher@example.com',
      address: '50 River Road, Richmond, VA',
      bloodGroup: 'A+',
      emergencyContact: '+1 (555) 321-9980',
      emergencyContactRelation: 'Wife (Margaret Fletcher)',
      medicalHistory: 'Chronic obstructive pulmonary disease (COPD)',
      allergies: 'Erythromycin',
    },
    {
      patientId: 'PAT-2021',
      fullName: 'Uma Thurman Patel',
      dob: new Date('1983-04-12'),
      gender: 'FEMALE',
      contact: '+1 (555) 755-1209',
      email: 'uma.patel@example.com',
      address: '612 Innovation Way, Raleigh, NC',
      bloodGroup: 'B-',
      emergencyContact: '+1 (555) 755-1200',
      emergencyContactRelation: 'Husband (Vikram Patel)',
      medicalHistory: 'Celiac disease, autoimmune thyroiditis',
      allergies: 'Gluten, Iodine contrast',
    },
    {
      patientId: 'PAT-2022',
      fullName: 'Victor Emmanuel Rossi',
      dob: new Date('1976-01-23'),
      gender: 'MALE',
      contact: '+1 (555) 890-4412',
      email: 'victor.rossi@example.com',
      address: '100 Central Park South, New York, NY',
      bloodGroup: 'AB-',
      emergencyContact: '+1 (555) 890-4410',
      emergencyContactRelation: 'Brother (Marco Rossi)',
      medicalHistory: 'Early stage osteoarthritis, mild sleep apnea',
      allergies: 'Sulfa antibiotics',
    },
  ];

  const patients = [];
  for (const p of patientsData) {
    const created = await prisma.patient.create({ data: p });
    patients.push(created);
  }

  console.log('--- Seeding Appointments (18 appointments across past, today, future) ---');
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 9, 0, 0);

  const appointmentsData = [
    {
      appointmentId: 'APT-4001',
      patientId: patients[0].id,
      doctorId: doctors[0].id,
      departmentId: departments['CARD'].id,
      appointmentDate: today,
      timeSlot: '09:30 AM - 10:00 AM',
      status: 'CONFIRMED',
      type: 'FOLLOW_UP',
      reason: 'Routine quarterly hypertensive review & ECG evaluation',
      notes: 'Patient reports mild occasional morning headache. Blood pressure log brought in.',
    },
    {
      appointmentId: 'APT-4002',
      patientId: patients[1].id,
      doctorId: doctors[5].id,
      departmentId: departments['GENM'].id,
      appointmentDate: today,
      timeSlot: '10:00 AM - 10:30 AM',
      status: 'CONFIRMED',
      type: 'GENERAL',
      reason: 'Review HbA1c and fasting blood sugar markers',
      notes: 'Adjust Metformin dosage based on latest lab results.',
    },
    {
      appointmentId: 'APT-4003',
      patientId: patients[2].id,
      doctorId: doctors[2].id,
      departmentId: departments['PEDI'].id,
      appointmentDate: today,
      timeSlot: '11:00 AM - 11:30 AM',
      status: 'SCHEDULED',
      type: 'CONSULTATION',
      reason: 'Persistent seasonal wheezing and nocturnal cough',
      notes: 'Evaluate peak flow measurements.',
    },
    {
      appointmentId: 'APT-4004',
      patientId: patients[3].id,
      doctorId: doctors[5].id,
      departmentId: departments['GENM'].id,
      appointmentDate: today,
      timeSlot: '11:30 AM - 12:00 PM',
      status: 'SCHEDULED',
      type: 'FOLLOW_UP',
      reason: 'Thyroid profile follow-up and dosage titration',
      notes: 'Check for signs of hyperthyroidism palpitations.',
    },
    {
      appointmentId: 'APT-4005',
      patientId: patients[4].id,
      doctorId: doctors[3].id,
      departmentId: departments['ORTH'].id,
      appointmentDate: new Date(today.getTime() + 86400000 * 1), // Tomorrow
      timeSlot: '01:30 PM - 02:00 PM',
      status: 'SCHEDULED',
      type: 'CONSULTATION',
      reason: 'Sports-related right knee injury during soccer match',
      notes: 'MRI scan recommended if anterior drawer test is positive.',
    },
    {
      appointmentId: 'APT-4006',
      patientId: patients[5].id,
      doctorId: doctors[0].id,
      departmentId: departments['CARD'].id,
      appointmentDate: new Date(today.getTime() + 86400000 * 1), // Tomorrow
      timeSlot: '10:30 AM - 11:00 AM',
      status: 'SCHEDULED',
      type: 'FOLLOW_UP',
      reason: 'Post-stent 3-year surveillance & echocardiography review',
      notes: 'Assess compliance with dual antiplatelet therapy.',
    },
    {
      appointmentId: 'APT-4007',
      patientId: patients[6].id,
      doctorId: doctors[5].id,
      departmentId: departments['GENM'].id,
      appointmentDate: new Date(today.getTime() + 86400000 * 2),
      timeSlot: '09:00 AM - 09:30 AM',
      status: 'SCHEDULED',
      type: 'GENERAL',
      reason: 'Renal function test follow-up & creatinine check',
      notes: 'Monitor eGFR trend over the past 6 months.',
    },
    {
      appointmentId: 'APT-4008',
      patientId: patients[7].id,
      doctorId: doctors[1].id,
      departmentId: departments['NEUR'].id,
      appointmentDate: new Date(today.getTime() + 86400000 * 2),
      timeSlot: '10:00 AM - 10:30 AM',
      status: 'SCHEDULED',
      type: 'CONSULTATION',
      reason: 'Increasing frequency of unilateral pulsatile headaches',
      notes: 'Evaluate candidate for CGRP antagonist prophylaxis.',
    },
    {
      appointmentId: 'APT-4009',
      patientId: patients[8].id,
      doctorId: doctors[5].id,
      departmentId: departments['GENM'].id,
      appointmentDate: new Date(today.getTime() + 86400000 * 3),
      timeSlot: '04:00 PM - 04:30 PM',
      status: 'SCHEDULED',
      type: 'FOLLOW_UP',
      reason: 'Recurrent podagra attack in left first metatarsophalangeal joint',
      notes: 'Review serum uric acid level.',
    },
    {
      appointmentId: 'APT-4010',
      patientId: patients[9].id,
      doctorId: doctors[4].id,
      departmentId: departments['ONCO'].id,
      appointmentDate: new Date(today.getTime() + 86400000 * 4),
      timeSlot: '11:00 AM - 11:30 AM',
      status: 'SCHEDULED',
      type: 'CONSULTATION',
      reason: 'Second opinion on breast ultrasound screening results',
      notes: 'Review BIRADS category 3 imaging report.',
    },
    // Past completed appointments
    {
      appointmentId: 'APT-4011',
      patientId: patients[0].id,
      doctorId: doctors[0].id,
      departmentId: departments['CARD'].id,
      appointmentDate: new Date(today.getTime() - 86400000 * 7),
      timeSlot: '09:00 AM - 09:30 AM',
      status: 'COMPLETED',
      type: 'GENERAL',
      reason: 'Initial consultation for elevated home blood pressure readings',
      notes: 'Patient was prescribed Telmisartan 40mg. Advised DASH diet and sodium reduction.',
    },
    {
      appointmentId: 'APT-4012',
      patientId: patients[1].id,
      doctorId: doctors[5].id,
      departmentId: departments['GENM'].id,
      appointmentDate: new Date(today.getTime() - 86400000 * 14),
      timeSlot: '10:30 AM - 11:00 AM',
      status: 'COMPLETED',
      type: 'GENERAL',
      reason: 'Diabetic foot check and neuropathy screening',
      notes: 'Monofilament test normal. Fasting lipid panel ordered.',
    },
    {
      appointmentId: 'APT-4013',
      patientId: patients[2].id,
      doctorId: doctors[5].id,
      departmentId: departments['GENM'].id,
      appointmentDate: new Date(today.getTime() - 86400000 * 10),
      timeSlot: '02:00 PM - 02:30 PM',
      status: 'COMPLETED',
      type: 'GENERAL',
      reason: 'Acute bronchitis and upper respiratory symptoms',
      notes: 'Chest clear on auscultation. Symptomatic treatment prescribed.',
    },
    {
      appointmentId: 'APT-4014',
      patientId: patients[10].id,
      doctorId: doctors[0].id,
      departmentId: departments['CARD'].id,
      appointmentDate: new Date(today.getTime() - 86400000 * 3),
      timeSlot: '11:30 AM - 12:00 PM',
      status: 'COMPLETED',
      type: 'FOLLOW_UP',
      reason: 'Holter monitor result analysis for suspected paroxysmal AFib',
      notes: 'Confirmed 3 episodes of non-sustained atrial tachycardia.',
    },
    {
      appointmentId: 'APT-4015',
      patientId: patients[12].id,
      doctorId: doctors[3].id,
      departmentId: departments['ORTH'].id,
      appointmentDate: new Date(today.getTime() - 86400000 * 2),
      timeSlot: '03:00 PM - 03:30 PM',
      status: 'CANCELLED',
      type: 'CONSULTATION',
      reason: 'Lower back spasm - rescheduled due to patient travel',
      notes: 'Patient called to reschedule for next month.',
    },
  ];

  const appointments = [];
  for (const a of appointmentsData) {
    const created = await prisma.appointment.create({ data: a });
    appointments.push(created);
  }

  console.log('--- Seeding Prescriptions & Items ---');
  const rx1 = await prisma.prescription.create({
    data: {
      prescriptionId: 'RX-5001',
      patientId: patients[0].id,
      doctorId: doctors[0].id,
      appointmentId: appointments[10].id,
      diagnosis: 'Primary Essential Hypertension (Stage 1), Mild Hypercholesterolemia',
      notes: 'Review in 4 weeks. Maintain regular blood pressure log. Reduce dietary sodium.',
      issueDate: new Date(today.getTime() - 86400000 * 7),
      status: 'ACTIVE',
      items: {
        create: [
          {
            medicineId: medicines[7].id,
            medicineName: 'Telmisartan 40mg',
            dosage: '1 Tablet (40mg)',
            frequency: 'Once daily in the morning (1-0-0)',
            duration: '30 days',
            instructions: 'Take after breakfast with plenty of water. Monitor morning BP.',
          },
          {
            medicineId: medicines[8].id,
            medicineName: 'Atorvastatin 20mg',
            dosage: '1 Tablet (20mg)',
            frequency: 'Once daily at bedtime (0-0-1)',
            duration: '30 days',
            instructions: 'Take at night. Avoid grapefruit juice.',
          },
        ],
      },
    },
  });

  const rx2 = await prisma.prescription.create({
    data: {
      prescriptionId: 'RX-5002',
      patientId: patients[1].id,
      doctorId: doctors[5].id,
      appointmentId: appointments[11].id,
      diagnosis: 'Type 2 Diabetes Mellitus with bilateral mild knee osteoarthritis',
      notes: 'Daily foot examination recommended. Regular HbA1c testing every 3 months.',
      issueDate: new Date(today.getTime() - 86400000 * 14),
      status: 'ACTIVE',
      items: {
        create: [
          {
            medicineId: medicines[4].id,
            medicineName: 'Metformin HCl 500mg',
            dosage: '1 Tablet (500mg)',
            frequency: 'Twice daily after meals (1-0-1)',
            duration: '60 days',
            instructions: 'Take with or immediately after meals to reduce gastrointestinal upset.',
          },
          {
            medicineId: medicines[3].id,
            medicineName: 'Ibuprofen 400mg',
            dosage: '1 Tablet (400mg)',
            frequency: 'As needed for joint pain (SOS)',
            duration: '10 days',
            instructions: 'Only if knee pain is severe. Always take after food.',
          },
        ],
      },
    },
  });

  console.log('--- Seeding Laboratory Reports ---');
  await prisma.labReport.create({
    data: {
      reportId: 'LAB-6001',
      patientId: patients[0].id,
      testName: 'Comprehensive Metabolic & Lipid Panel',
      category: 'BIOCHEMISTRY',
      testDate: new Date(today.getTime() - 86400000 * 8),
      resultDate: new Date(today.getTime() - 86400000 * 7),
      status: 'COMPLETED',
      technicianName: 'Robert Vance, MLS(ASCP)',
      referredByDoctor: 'Dr. Robert Harrison',
      summary: 'Mild hyperlipidemia noted. Fasting glucose and renal profile within acceptable reference ranges.',
      testParameters: JSON.stringify([
        { parameter: 'Total Cholesterol', result: '228', unit: 'mg/dL', referenceRange: '< 200', status: 'HIGH' },
        { parameter: 'Triglycerides', result: '175', unit: 'mg/dL', referenceRange: '< 150', status: 'HIGH' },
        { parameter: 'HDL Cholesterol', result: '46', unit: 'mg/dL', referenceRange: '> 40', status: 'NORMAL' },
        { parameter: 'LDL Cholesterol (Calculated)', result: '147', unit: 'mg/dL', referenceRange: '< 100', status: 'HIGH' },
        { parameter: 'Fasting Blood Glucose', result: '94', unit: 'mg/dL', referenceRange: '70 - 99', status: 'NORMAL' },
        { parameter: 'Serum Creatinine', result: '0.98', unit: 'mg/dL', referenceRange: '0.70 - 1.30', status: 'NORMAL' },
        { parameter: 'eGFR', result: '92', unit: 'mL/min/1.73m²', referenceRange: '> 90', status: 'NORMAL' },
      ]),
    },
  });

  await prisma.labReport.create({
    data: {
      reportId: 'LAB-6002',
      patientId: patients[0].id,
      testName: 'Complete Blood Count (CBC) with Differential',
      category: 'HEMATOLOGY',
      testDate: new Date(today.getTime() - 86400000 * 8),
      resultDate: new Date(today.getTime() - 86400000 * 7),
      status: 'COMPLETED',
      technicianName: 'Elena Rostova, MD',
      referredByDoctor: 'Dr. Robert Harrison',
      summary: 'All hematological parameters within normal limits. No evidence of cytopenia or leukocytosis.',
      testParameters: JSON.stringify([
        { parameter: 'Hemoglobin', result: '15.4', unit: 'g/dL', referenceRange: '13.8 - 17.2', status: 'NORMAL' },
        { parameter: 'RBC Count', result: '5.1', unit: '10^6/µL', referenceRange: '4.5 - 5.9', status: 'NORMAL' },
        { parameter: 'Hematocrit', result: '45.2', unit: '%', referenceRange: '40.7 - 50.3', status: 'NORMAL' },
        { parameter: 'WBC Count', result: '6,800', unit: '/µL', referenceRange: '4,500 - 11,000', status: 'NORMAL' },
        { parameter: 'Platelet Count', result: '240,000', unit: '/µL', referenceRange: '150,000 - 450,000', status: 'NORMAL' },
      ]),
    },
  });

  await prisma.labReport.create({
    data: {
      reportId: 'LAB-6003',
      patientId: patients[1].id,
      testName: 'Glycated Hemoglobin (HbA1c) & Renal Function',
      category: 'BIOCHEMISTRY',
      testDate: new Date(today.getTime() - 86400000 * 15),
      resultDate: new Date(today.getTime() - 86400000 * 14),
      status: 'COMPLETED',
      technicianName: 'James Wilson, MLS',
      referredByDoctor: 'Dr. David Chen',
      summary: 'HbA1c of 7.2% indicates sub-optimal glycemic control. Renal markers stable.',
      testParameters: JSON.stringify([
        { parameter: 'HbA1c', result: '7.2', unit: '%', referenceRange: '< 5.7 (Good Control: < 7.0)', status: 'HIGH' },
        { parameter: 'Estimated Average Glucose (eAG)', result: '160', unit: 'mg/dL', referenceRange: '< 154', status: 'HIGH' },
        { parameter: 'Blood Urea Nitrogen (BUN)', result: '16', unit: 'mg/dL', referenceRange: '7 - 20', status: 'NORMAL' },
        { parameter: 'Serum Creatinine', result: '0.85', unit: 'mg/dL', referenceRange: '0.50 - 1.10', status: 'NORMAL' },
      ]),
    },
  });

  console.log('--- Seeding AI Clinical Decision Support Runs ---');
  await prisma.aIAnalysis.create({
    data: {
      patientId: patients[0].id,
      doctorId: doctors[0].id,
      symptoms: 'Exertional chest tightness, shortness of breath on climbing 2 flights of stairs, mild morning occipital headaches',
      symptomDuration: '3 weeks',
      vitals: JSON.stringify({
        temp: 98.4,
        bp: '148/92',
        hr: 78,
        spo2: 98,
        respiratoryRate: 16,
      }),
      existingConditions: 'Essential Hypertension (5 yrs), Mild Hyperlipidemia',
      allergies: 'Penicillin (cutaneous rash)',
      patientSummary: '42-year-old male with known essential hypertension presenting with new-onset exertional chest discomfort and elevated stage-2 blood pressure.',
      differentialSuggestions: JSON.stringify([
        {
          condition: 'Stable Angina Pectoris (Coronary Artery Disease)',
          icd10: 'I20.9',
          confidence: 84,
          rationale: 'Exertional symptom onset relieved by rest, underlying hypertension, dyslipidemia, and age/gender risk profile.',
          urgency: 'HIGH',
        },
        {
          condition: 'Uncontrolled Essential Stage-2 Hypertension with Cardiac Strain',
          icd10: 'I10',
          confidence: 76,
          rationale: 'Recorded systolic pressure > 140 mmHg and diastolic > 90 mmHg with occipital cephalalgia and exertional dyspnea.',
          urgency: 'MODERATE',
        },
        {
          condition: 'Gastroesophageal Reflux Disease (Atypical Presentation)',
          icd10: 'K21.9',
          confidence: 38,
          rationale: 'Can mimic angina, though typically related to meals or supine posture rather than exertion.',
          urgency: 'LOW',
        },
      ]),
      clinicalObservations: 'Cardiovascular exam reveals S4 gallop rhythm on auscultation. No peripheral edema or jugular venous distention. High risk for atherosclerotic cardiovascular disease (ASCVD).',
      recommendedNextSteps: JSON.stringify([
        'Order 12-lead Electrocardiogram (ECG) to evaluate for LVH or ischemia patterns',
        'Schedule Transthoracic Echocardiogram (TTE) to assess ejection fraction and wall motion',
        'Cardiac stress test (Exercise Treadmill Test or Myocardial Perfusion Imaging)',
        'Check High-Sensitivity Cardiac Troponin T/I to rule out acute coronary syndrome',
        'Titrate antihypertensive regimen and add beta-blocker if angina confirmed',
      ]),
      redFlags: JSON.stringify([
        'Exertional chest discomfort with radiation to jaw, neck, or left arm',
        'Sudden acute dyspnea or diaphoresis',
        'Syncope or presyncope episodes',
        'Systolic BP > 180 mmHg or Diastolic > 120 mmHg (Hypertensive Urgency)',
      ]),
      disclaimer: 'LEGAL & MEDICAL NOTICE: This decision-support analysis was generated by the MEDNEXUS Clinical AI Engine for academic and observational decision support only. It does NOT constitute a confirmed medical diagnosis and must be independently verified by a licensed physician before any treatment decision.',
      reviewedByDoctor: true,
      clinicianNotes: 'Agreed with differential. Scheduled diagnostic stress echo and updated medication regimen.',
    },
  });

  console.log('--- Seeding Notifications & Audit Logs ---');
  await prisma.notification.createMany({
    data: [
      {
        userId: adminUser.id,
        title: 'System Initialized',
        message: 'MEDNEXUS Enterprise Hospital System successfully booted with full 3NF database schema.',
        type: 'SUCCESS',
      },
      {
        userId: doctorUser.id,
        title: 'New Appointment Scheduled',
        message: 'Patient Alexander Wright has a confirmed appointment today at 09:30 AM.',
        type: 'INFO',
      },
      {
        userId: patientUser.id,
        title: 'Prescription Issued',
        message: 'Dr. Robert Harrison has generated Prescription #RX-5001. You can view or download it now.',
        type: 'INFO',
      },
      {
        userId: patientUser.id,
        title: 'Lab Report Ready',
        message: 'Your Comprehensive Metabolic & Lipid Panel results are now available online.',
        type: 'SUCCESS',
      },
    ],
  });

  await prisma.auditLog.createMany({
    data: [
      {
        userId: adminUser.id,
        action: 'SYSTEM_BOOTSTRAP',
        entity: 'DATABASE',
        entityId: 'SYS-001',
        details: 'Initial database seeding and role initialization executed successfully.',
        ipAddress: '127.0.0.1',
      },
      {
        userId: doctorUser.id,
        action: 'AI_ANALYSIS_RUN',
        entity: 'PATIENT',
        entityId: patients[0].id,
        details: 'Clinical decision support analysis executed for exertional chest tightness symptoms.',
        ipAddress: '192.168.1.45',
      },
      {
        userId: doctorUser.id,
        action: 'GENERATE_PRESCRIPTION',
        entity: 'PRESCRIPTION',
        entityId: rx1.id,
        details: 'Prescription RX-5001 generated with 2 items for Patient Alexander Wright.',
        ipAddress: '192.168.1.45',
      },
    ],
  });

  console.log('====================================================');
  console.log('MEDNEXUS SEEDING COMPLETED SUCCESSFULLY!');
  console.log('Demo Credentials:');
  console.log('  Admin:        admin@mednexus.com      / Admin@123');
  console.log('  Doctor:       doctor@mednexus.com     / Doctor@123');
  console.log('  Receptionist: reception@mednexus.com  / Reception@123');
  console.log('  Patient:      patient@mednexus.com    / Patient@123');
  console.log('====================================================');
}

main()
  .catch((e) => {
    console.error('Seed script failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
