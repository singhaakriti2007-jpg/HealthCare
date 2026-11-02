export interface VitalSignsInput {
  temp?: number;          // Fahrenheit
  bpSystolic?: number;    // mmHg
  bpDiastolic?: number;   // mmHg
  hr?: number;            // bpm
  spo2?: number;          // %
  respiratoryRate?: number; // breaths/min
}

export interface DecisionSupportInput {
  patientId?: string;
  patientName?: string;
  age?: number;
  gender?: string;
  symptoms: string;
  symptomDuration: string;
  vitals: VitalSignsInput;
  existingConditions?: string;
  allergies?: string;
}

export interface DifferentialSuggestion {
  condition: string;
  icd10: string;
  confidence: number;
  urgency: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  rationale: string;
}

export interface DecisionSupportResult {
  patientSummary: string;
  vitalsTriage: {
    score: number;
    level: 'NORMAL' | 'ELEVATED' | 'HIGH_ALERT' | 'CRITICAL_ALERT';
    flags: string[];
  };
  differentialSuggestions: DifferentialSuggestion[];
  clinicalObservations: string;
  recommendedNextSteps: string[];
  redFlags: string[];
  allergyWarnings: string[];
  disclaimer: string;
}

export function runClinicalDecisionSupport(input: DecisionSupportInput): DecisionSupportResult {
  const symptomsLower = (input.symptoms || '').toLowerCase();
  const conditionsLower = (input.existingConditions || '').toLowerCase();
  const allergiesLower = (input.allergies || '').toLowerCase();
  const vitals = input.vitals || {};

  // 1. Vitals Triage Assessment (NEWS2 inspired)
  const vitalsFlags: string[] = [];
  let triageScore = 0;

  // Temperature
  if (vitals.temp) {
    if (vitals.temp >= 102.5) {
      vitalsFlags.push(`High Pyrexia: Temp ${vitals.temp}°F`);
      triageScore += 3;
    } else if (vitals.temp >= 100.4) {
      vitalsFlags.push(`Low-grade Pyrexia: Temp ${vitals.temp}°F`);
      triageScore += 1;
    } else if (vitals.temp < 95.0) {
      vitalsFlags.push(`Hypothermia Alert: Temp ${vitals.temp}°F`);
      triageScore += 3;
    }
  }

  // Blood Pressure
  if (vitals.bpSystolic) {
    if (vitals.bpSystolic >= 180) {
      vitalsFlags.push(`Hypertensive Crisis / Severe Elevation: Systolic ${vitals.bpSystolic} mmHg`);
      triageScore += 3;
    } else if (vitals.bpSystolic >= 140) {
      vitalsFlags.push(`Stage 2 Hypertension: Systolic ${vitals.bpSystolic} mmHg`);
      triageScore += 2;
    } else if (vitals.bpSystolic < 90) {
      vitalsFlags.push(`Hypotension Risk: Systolic ${vitals.bpSystolic} mmHg`);
      triageScore += 3;
    }
  }

  // Heart Rate
  if (vitals.hr) {
    if (vitals.hr > 120) {
      vitalsFlags.push(`Significant Tachycardia: HR ${vitals.hr} bpm`);
      triageScore += 3;
    } else if (vitals.hr > 100) {
      vitalsFlags.push(`Mild Tachycardia: HR ${vitals.hr} bpm`);
      triageScore += 1;
    } else if (vitals.hr < 50) {
      vitalsFlags.push(`Bradycardia Alert: HR ${vitals.hr} bpm`);
      triageScore += 2;
    }
  }

  // SpO2
  if (vitals.spo2) {
    if (vitals.spo2 <= 91) {
      vitalsFlags.push(`Critical Hypoxemia: SpO2 ${vitals.spo2}%`);
      triageScore += 3;
    } else if (vitals.spo2 <= 94) {
      vitalsFlags.push(`Mild-to-Moderate Hypoxemia: SpO2 ${vitals.spo2}%`);
      triageScore += 2;
    }
  }

  let triageLevel: 'NORMAL' | 'ELEVATED' | 'HIGH_ALERT' | 'CRITICAL_ALERT' = 'NORMAL';
  if (triageScore >= 6) triageLevel = 'CRITICAL_ALERT';
  else if (triageScore >= 4) triageLevel = 'HIGH_ALERT';
  else if (triageScore >= 2) triageLevel = 'ELEVATED';

  // 2. Differential Diagnostic Rules Engine
  const differentials: DifferentialSuggestion[] = [];
  const redFlags: string[] = [];
  const nextSteps: string[] = [];
  const observations: string[] = [];
  const allergyWarnings: string[] = [];

  // Cardiac / Vascular
  if (
    symptomsLower.includes('chest pain') ||
    symptomsLower.includes('chest tightness') ||
    symptomsLower.includes('angina') ||
    symptomsLower.includes('palpitation')
  ) {
    differentials.push({
      condition: 'Ischemic Heart Disease / Acute Coronary Syndrome',
      icd10: 'I25.10 / I21.9',
      confidence: (input.age && input.age > 45 ? 85 : 70) + (conditionsLower.includes('hypertension') ? 10 : 0),
      urgency: 'CRITICAL',
      rationale: 'Patient presents with thoracic discomfort/tightness. Cardiovascular comorbidities substantially escalate ACS probability.',
    });
    differentials.push({
      condition: 'Gastroesophageal Reflux Disease (Atypical Thoracic Mimic)',
      icd10: 'K21.9',
      confidence: 42,
      urgency: 'LOW',
      rationale: 'Esophageal spasms or acid irritation can present with retrosternal tightness resembling cardiac angina.',
    });

    redFlags.push('Chest pain radiating to mandible, left arm, or intrascapular region');
    redFlags.push('Diaphoresis, acute presyncope, or feeling of impending doom');
    nextSteps.push('Immediate 12-Lead Electrocardiogram (ECG) within 10 minutes');
    nextSteps.push('Serum High-Sensitivity Cardiac Troponin I/T baseline and 2-hour delta');
    nextSteps.push('Continuous cardiac rhythm telemetry and supplemental oxygen if SpO2 < 94%');
    observations.push('Cardiovascular risk indicators detected. Immediate rule-out of myocardial ischemia required prior to non-emergent investigations.');
  }

  // Respiratory / Pulmonary
  if (
    symptomsLower.includes('cough') ||
    symptomsLower.includes('breath') ||
    symptomsLower.includes('wheez') ||
    symptomsLower.includes('dyspnea') ||
    symptomsLower.includes('fever')
  ) {
    if (symptomsLower.includes('fever') || (vitals.temp && vitals.temp > 100)) {
      differentials.push({
        condition: 'Community-Acquired Pneumonia / Lower Respiratory Tract Infection',
        icd10: 'J18.9',
        confidence: 78,
        urgency: 'HIGH',
        rationale: 'Co-occurrence of febrile state, cough, and potential alveolar consolidation indicators.',
      });
      nextSteps.push('Standard Posteroanterior (PA) & Lateral Chest Radiograph (X-Ray)');
      nextSteps.push('Complete Blood Count (CBC) with differential to assess neutrophilia / bandemia');
      nextSteps.push('Sputum culture and blood cultures prior to empiric antimicrobial initiation');
    } else {
      differentials.push({
        condition: 'Bronchial Asthma Exacerbation / Acute Bronchospasm',
        icd10: 'J45.901',
        confidence: 74,
        urgency: 'MODERATE',
        rationale: 'Expiratory wheezing, shortness of breath, responsive to bronchodilators.',
      });
      nextSteps.push('Peak Expiratory Flow Rate (PEFR) or bedside spirometry');
      nextSteps.push('Inhaled short-acting beta-2 agonist (SABA) nebulization trial');
    }

    if (vitals.spo2 && vitals.spo2 < 92) {
      redFlags.push(`Severe arterial desaturation (SpO2 ${vitals.spo2}%) requiring rapid oxygen therapy`);
    }
    observations.push('Pulmonary airway involvement noted. Respiratory effort and oxygenation saturation must be prioritized.');
  }

  // Neurological / Headache / Stroke
  if (
    symptomsLower.includes('headache') ||
    symptomsLower.includes('dizziness') ||
    symptomsLower.includes('numbness') ||
    symptomsLower.includes('migraine') ||
    symptomsLower.includes('vision')
  ) {
    if (symptomsLower.includes('numbness') || symptomsLower.includes('weakness') || symptomsLower.includes('slur')) {
      differentials.push({
        condition: 'Transient Ischemic Attack (TIA) / Acute Ischemic Stroke',
        icd10: 'G45.9 / I63.9',
        confidence: 90,
        urgency: 'CRITICAL',
        rationale: 'Focal neurological deficits mandate urgent BE-FAST protocol and acute vascular imaging.',
      });
      redFlags.push('Focal neurological deficit (facial droop, arm drift, dysarthria)');
      nextSteps.push('Emergency Non-contrast Head CT / Brain MRI Diffusion-Weighted Imaging');
      nextSteps.push('Assess eligibility for IV thrombolysis (r-tPA) if within 4.5-hour therapeutic window');
    } else {
      differentials.push({
        condition: 'Primary Migraine Cephalea / Tension-Type Headache',
        icd10: 'G43.909',
        confidence: 68,
        urgency: 'LOW',
        rationale: 'Unilateral or bilateral throbbing cephalalgia without red-flag meningeal or focal signs.',
      });
      nextSteps.push('Neurological exam including cranial nerve testing and fundoscopic examination');
      nextSteps.push('Trial of non-opioid analgesics or triptan therapy with hydration');
    }
  }

  // Metabolic / Endocrine / Diabetes
  if (
    symptomsLower.includes('polyuria') ||
    symptomsLower.includes('thirst') ||
    symptomsLower.includes('fatigue') ||
    conditionsLower.includes('diabetes')
  ) {
    differentials.push({
      condition: 'Type 2 Diabetes Mellitus with Hyperglycemic Episode',
      icd10: 'E11.65',
      confidence: 72,
      urgency: 'MODERATE',
      rationale: 'Classic osmotic symptoms (polyuria, polydipsia) or established diabetic metabolic derangement.',
    });
    nextSteps.push('Point-of-care capillary blood glucose and venous HbA1c');
    nextSteps.push('Urinalysis for glucosuria and microalbuminuria; serum electrolytes');
  }

  // Gastrointestinal / Abdominal
  if (
    symptomsLower.includes('abdominal pain') ||
    symptomsLower.includes('stomach') ||
    symptomsLower.includes('nausea') ||
    symptomsLower.includes('vomit')
  ) {
    differentials.push({
      condition: 'Acute Gastritis / Peptic Ulcer Disease',
      icd10: 'K29.70',
      confidence: 65,
      urgency: 'MODERATE',
      rationale: 'Epigastric tenderness or dyspeptic symptoms aggravated or relieved by ingestion.',
    });
    differentials.push({
      condition: 'Acute Appendicitis / Acute Abdomen',
      icd10: 'K35.80',
      confidence: 45,
      urgency: 'HIGH',
      rationale: 'Consider if localized right lower quadrant pain with rebound tenderness or guarding.',
    });
    nextSteps.push('Targeted physical examination for peritoneal signs (Murphy, McBurney, Rovsing)');
    nextSteps.push('Abdominal ultrasound or contrast-enhanced CT abdomen if acute abdomen suspected');
  }

  // Fallback differential if none specifically matched
  if (differentials.length === 0) {
    differentials.push({
      condition: 'Unspecified Acute Constitutional Syndrome',
      icd10: 'R68.89',
      confidence: 50,
      urgency: 'MODERATE',
      rationale: 'Generalized symptomatology requiring targeted clinical history and foundational laboratory workup.',
    });
    nextSteps.push('Comprehensive physical examination and review of systems');
    nextSteps.push('Baseline routine blood work: CBC, Comprehensive Metabolic Panel, Urinalysis');
  }

  // Allergy Cross-Referencing
  if (allergiesLower.includes('penicillin')) {
    allergyWarnings.push('PENICILLIN ALLERGY: Avoid Amoxicillin, Ampicillin, Piperacillin. Exercise caution with 1st-gen cephalosporins.');
  }
  if (allergiesLower.includes('sulfa')) {
    allergyWarnings.push('SULFONAMIDE ALLERGY: Avoid Trimethoprim-Sulfamethoxazole (Bactrim) and sulfonylurea cross-reactivity surveillance.');
  }
  if (allergiesLower.includes('aspirin') || allergiesLower.includes('nsaid')) {
    allergyWarnings.push('NSAID / ASPIRIN HYPERSENSITIVITY: Avoid Ibuprofen, Naproxen, Ketorolac. Recommend Paracetamol / Acetaminophen for analgesia.');
  }

  // Summary generation
  const patientSummary = `${input.patientName || 'Patient'} (${input.age || 'Adult'}yo ${input.gender || 'Individual'}) presented with ${input.symptoms} lasting for ${input.symptomDuration}. Pertinent history includes: ${input.existingConditions || 'None reported'}. Known drug allergies: ${input.allergies || 'No known drug allergies'}.`;

  const finalObservations = observations.length > 0
    ? observations.join(' ')
    : 'Clinical presentation evaluated across evidence-based algorithmic decision matrices. Patient vitals and symptoms classified in accordance with standard medical guidelines.';

  return {
    patientSummary,
    vitalsTriage: {
      score: triageScore,
      level: triageLevel,
      flags: vitalsFlags,
    },
    differentialSuggestions: differentials.sort((a, b) => b.confidence - a.confidence),
    clinicalObservations: finalObservations,
    recommendedNextSteps: nextSteps.length > 0 ? nextSteps : ['Perform detailed clinical assessment', 'Order routine baseline metabolic laboratory investigations'],
    redFlags: redFlags.length > 0 ? redFlags : ['Sudden deterioration of consciousness or mentation', 'Hemodynamic instability or collapse', 'New-onset intractable pain'],
    allergyWarnings,
    disclaimer: 'LEGAL & MEDICAL DISCLAIMER: MEDNEXUS AI Decision Support is an academic informational tool intended solely for licensed healthcare practitioners. It does not provide medical diagnoses, dispense medical advice, or replace direct clinician evaluation. All suggestions must be verified with independent clinical judgment.',
  };
}
