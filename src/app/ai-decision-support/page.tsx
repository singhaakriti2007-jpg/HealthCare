'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import toast from 'react-hot-toast';
import {
  BrainCircuit,
  Sparkles,
  AlertTriangle,
  ShieldAlert,
  CheckCircle,
  FileText,
  User,
  Heart,
  Activity,
  Thermometer,
  Gauge,
  Wind,
  Droplets,
  Stethoscope,
  Info,
  Clock,
  Save,
  CheckSquare,
  ArrowRight,
  Flame,
} from 'lucide-react';
import { format } from 'date-fns';

export default function AiDecisionSupportPage() {
  const { data: session } = useSession();
  const [patients, setPatients] = useState<any[]>([]);
  const [loadingPatients, setLoadingPatients] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [analysisId, setAnalysisId] = useState<string | null>(null);
  const [clinicianNotes, setClinicianNotes] = useState('');
  const [reviewed, setReviewed] = useState(false);

  // Form Inputs
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [symptoms, setSymptoms] = useState('Exertional chest tightness, shortness of breath upon climbing stairs, mild dizziness');
  const [duration, setDuration] = useState('2 weeks');
  const [vitals, setVitals] = useState({
    temp: 98.6,
    bpSystolic: 148,
    bpDiastolic: 92,
    hr: 82,
    spo2: 97,
    respiratoryRate: 18,
  });
  const [conditions, setConditions] = useState('Essential Hypertension, Mild Dyslipidemia');
  const [allergies, setAllergies] = useState('Penicillin (mild cutaneous rash)');

  useEffect(() => {
    fetch('/api/patients')
      .then((res) => res.json())
      .then((data) => {
        const list = data.patients || [];
        setPatients(list);
        if (list.length > 0) {
          const p = list[0];
          setSelectedPatientId(p.id);
          setConditions(p.medicalHistory || 'None');
          setAllergies(p.allergies || 'No known allergies');
        }
        setLoadingPatients(false);
      })
      .catch((err) => {
        console.error('Failed to load patients for AI module:', err);
        setLoadingPatients(false);
      });
  }, []);

  const handlePatientSelect = (patientId: string) => {
    setSelectedPatientId(patientId);
    const p = patients.find((x) => x.id === patientId);
    if (p) {
      setConditions(p.medicalHistory || 'None reported');
      setAllergies(p.allergies || 'None reported');
    }
  };

  const handleRunAnalysis = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatientId) {
      toast.error('Please select a patient EHR');
      return;
    }

    setAnalyzing(true);
    setResult(null);
    setReviewed(false);

    try {
      const res = await fetch('/api/ai-decision-support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId: selectedPatientId,
          symptoms,
          symptomDuration: duration,
          vitals,
          existingConditions: conditions,
          allergies,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || 'Clinical decision engine failed');
      } else {
        setResult(data.result);
        setAnalysisId(data.analysisId);
        toast.success('Clinical decision analysis formulated successfully');
      }
    } catch (err) {
      toast.error('Network error executing AI inference');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleDoctorSignOff = async () => {
    if (!analysisId) return;

    try {
      const res = await fetch('/api/ai-decision-support', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: analysisId,
          reviewedByDoctor: true,
          clinicianNotes,
        }),
      });

      if (res.ok) {
        setReviewed(true);
        toast.success('Physician review and sign-off recorded in clinical audit log');
      }
    } catch (err) {
      toast.error('Failed to submit doctor review');
    }
  };

  const selectedPatientObj = patients.find((p) => p.id === selectedPatientId);

  return (
    <DashboardLayout title="Clinical AI Decision Support System">
      {/* Prominent Mandatory Academic & Clinical Disclaimer */}
      <div className="bg-amber-500/10 border-2 border-amber-500/30 rounded-2xl p-4 text-amber-900 flex items-start space-x-3 shadow-xs">
        <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="text-xs">
          <p className="font-extrabold uppercase tracking-wider text-amber-900">
            Mandatory Medical & Academic Disclaimer
          </p>
          <p className="text-amber-800/90 mt-1 leading-relaxed">
            This module is an academic proof-of-concept decision-support assistant designed for licensed healthcare providers. It demonstrates deterministic clinical rule clustering and NEWS2 vitals triage. <strong>It does NOT replace human physician diagnosis or clinical judgment.</strong> All differential considerations and next steps must be verified by the attending physician before patient care decisions.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Doctor Inputs (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center space-x-2 pb-4 mb-4 border-b border-slate-100">
              <Stethoscope className="w-5 h-5 text-medblue-600" />
              <h2 className="text-sm font-bold text-slate-800">Clinical Data Intake</h2>
            </div>

            <form onSubmit={handleRunAnalysis} className="space-y-4 text-xs">
              {/* Patient Selector */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Select Patient EHR</label>
                <select
                  value={selectedPatientId}
                  onChange={(e) => handlePatientSelect(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white font-bold text-slate-800"
                >
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.fullName} ({p.patientId} - {p.gender})
                    </option>
                  ))}
                </select>

                {selectedPatientObj && (
                  <div className="mt-2 p-2.5 bg-slate-50 rounded-xl border border-slate-200/60 text-[11px] text-slate-600 flex justify-between">
                    <span>Blood: <strong className="text-red-600">{selectedPatientObj.bloodGroup}</strong></span>
                    <span>DOB: <strong>{format(new Date(selectedPatientObj.dob), 'MMM d, yyyy')}</strong></span>
                  </div>
                )}
              </div>

              {/* Symptoms & Duration */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Presenting Symptoms</label>
                <textarea
                  rows={3}
                  required
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                  placeholder="e.g. Sharp retrosternal chest pain with left arm radiation..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white leading-relaxed"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Symptom Duration</label>
                <input
                  type="text"
                  required
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  placeholder="e.g. 3 days, 2 weeks, sudden acute onset 30 mins ago"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white"
                />
              </div>

              {/* Vital Signs Grid */}
              <div className="pt-2">
                <label className="block font-semibold text-slate-700 mb-2 flex items-center justify-between">
                  <span>Objective Vital Signs</span>
                  <span className="text-[10px] text-teal-600 font-mono">NEWS2 Standard</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-[10px] text-slate-500 font-semibold flex items-center gap-1">
                      <Thermometer className="w-3 h-3 text-red-500" /> Temp (°F)
                    </span>
                    <input
                      type="number"
                      step="0.1"
                      value={vitals.temp}
                      onChange={(e) => setVitals({ ...vitals, temp: parseFloat(e.target.value) })}
                      className="w-full px-3 py-1.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white font-mono mt-1"
                    />
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-500 font-semibold flex items-center gap-1">
                      <Gauge className="w-3 h-3 text-medblue-500" /> BP Systolic (mmHg)
                    </span>
                    <input
                      type="number"
                      value={vitals.bpSystolic}
                      onChange={(e) => setVitals({ ...vitals, bpSystolic: parseInt(e.target.value, 10) })}
                      className="w-full px-3 py-1.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white font-mono mt-1"
                    />
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-500 font-semibold flex items-center gap-1">
                      <Gauge className="w-3 h-3 text-medblue-500" /> BP Diastolic (mmHg)
                    </span>
                    <input
                      type="number"
                      value={vitals.bpDiastolic}
                      onChange={(e) => setVitals({ ...vitals, bpDiastolic: parseInt(e.target.value, 10) })}
                      className="w-full px-3 py-1.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white font-mono mt-1"
                    />
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-500 font-semibold flex items-center gap-1">
                      <Heart className="w-3 h-3 text-rose-500" /> Heart Rate (bpm)
                    </span>
                    <input
                      type="number"
                      value={vitals.hr}
                      onChange={(e) => setVitals({ ...vitals, hr: parseInt(e.target.value, 10) })}
                      className="w-full px-3 py-1.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white font-mono mt-1"
                    />
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-500 font-semibold flex items-center gap-1">
                      <Droplets className="w-3 h-3 text-teal-500" /> SpO2 (%)
                    </span>
                    <input
                      type="number"
                      value={vitals.spo2}
                      onChange={(e) => setVitals({ ...vitals, spo2: parseInt(e.target.value, 10) })}
                      className="w-full px-3 py-1.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white font-mono mt-1"
                    />
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-500 font-semibold flex items-center gap-1">
                      <Wind className="w-3 h-3 text-indigo-500" /> Resp Rate (/min)
                    </span>
                    <input
                      type="number"
                      value={vitals.respiratoryRate}
                      onChange={(e) => setVitals({ ...vitals, respiratoryRate: parseInt(e.target.value, 10) })}
                      className="w-full px-3 py-1.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white font-mono mt-1"
                    />
                  </div>
                </div>
              </div>

              {/* Pre-existing Conditions & Allergies */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Pre-Existing Conditions</label>
                <input
                  type="text"
                  value={conditions}
                  onChange={(e) => setConditions(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Known Drug Allergies</label>
                <input
                  type="text"
                  value={allergies}
                  onChange={(e) => setAllergies(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white"
                />
              </div>

              <button
                type="submit"
                disabled={analyzing}
                className="w-full mt-4 flex items-center justify-center space-x-2 py-3 px-4 bg-gradient-to-r from-medblue-600 to-tealaccent-600 hover:from-medblue-700 hover:to-tealaccent-700 text-white rounded-xl font-bold shadow-lg shadow-medblue-600/20 disabled:opacity-50 transition-all text-sm"
              >
                {analyzing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Synthesizing Differential Matrices...</span>
                  </>
                ) : (
                  <>
                    <BrainCircuit className="w-4 h-4" />
                    <span>Run Clinical Decision Support</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Structured AI Decision-Support Report (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {!result && !analyzing && (
            <div className="bg-white p-12 rounded-2xl border border-slate-200/80 shadow-xs text-center flex flex-col items-center justify-center min-h-[500px]">
              <div className="w-16 h-16 rounded-2xl bg-sky-50 text-medblue-600 flex items-center justify-center mb-4">
                <BrainCircuit className="w-8 h-8 stroke-[1.5]" />
              </div>
              <h3 className="text-base font-bold text-slate-800">Awaiting Clinical Data Submission</h3>
              <p className="text-xs text-slate-500 max-w-sm mt-1 leading-relaxed">
                Enter the patient's symptoms, duration, and objective vitals on the left to generate an evidence-based clinical decision report.
              </p>
            </div>
          )}

          {analyzing && (
            <div className="bg-white p-12 rounded-2xl border border-slate-200/80 shadow-xs text-center flex flex-col items-center justify-center min-h-[500px]">
              <div className="w-12 h-12 border-4 border-medblue-600 border-t-transparent rounded-full animate-spin mb-4" />
              <p className="font-bold text-slate-800 text-sm">Evaluating Symptom Complexes</p>
              <p className="text-xs text-slate-500 mt-1">
                Comparing physiological indicators against clinical differential models...
              </p>
            </div>
          )}

          {result && !analyzing && (
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden animate-in fade-in duration-300">
              {/* Report Header */}
              <div className="p-6 bg-slate-900 text-white flex items-start justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-tealaccent-500/20 text-tealaccent-300 border border-tealaccent-500/30">
                      DECISION SUPPORT PROTOCOL
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {format(new Date(), 'MMM d, yyyy HH:mm')}
                    </span>
                  </div>
                  <h3 className="text-lg font-extrabold mt-1 tracking-tight">
                    Structured Clinical Analysis
                  </h3>
                  <p className="text-xs text-slate-300 mt-0.5">
                    {result.patientSummary}
                  </p>
                </div>

                <div className="text-right">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                      result.vitalsTriage.level === 'CRITICAL_ALERT'
                        ? 'bg-red-500 text-white animate-pulse'
                        : result.vitalsTriage.level === 'HIGH_ALERT'
                        ? 'bg-amber-500 text-white'
                        : result.vitalsTriage.level === 'ELEVATED'
                        ? 'bg-sky-500 text-white'
                        : 'bg-emerald-500 text-white'
                    }`}
                  >
                    {result.vitalsTriage.level.replace('_', ' ')}
                  </span>
                  <p className="text-[10px] text-slate-400 font-mono mt-1">
                    NEWS2 Triage Score: {result.vitalsTriage.score}
                  </p>
                </div>
              </div>

              <div className="p-6 space-y-6 text-xs">
                {/* Allergy Alerts (if any) */}
                {result.allergyWarnings?.length > 0 && (
                  <div className="p-3.5 rounded-xl bg-red-50 border border-red-200">
                    <span className="text-xs font-bold text-red-800 flex items-center gap-1.5 mb-1">
                      <Flame className="w-4 h-4 text-red-600" />
                      Critical Allergy Contraindication Warning
                    </span>
                    <ul className="list-disc pl-5 text-red-700 space-y-0.5">
                      {result.allergyWarnings.map((warn: string, idx: number) => (
                        <li key={idx}>{warn}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Vitals Triage Flags (if any) */}
                {result.vitalsTriage.flags?.length > 0 && (
                  <div className="p-3.5 rounded-xl bg-sky-50 border border-sky-200">
                    <span className="text-xs font-bold text-medblue-800 flex items-center gap-1.5 mb-1">
                      <Activity className="w-4 h-4 text-medblue-600" />
                      Physiological Triage Flags
                    </span>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {result.vitalsTriage.flags.map((flag: string, idx: number) => (
                        <span key={idx} className="px-2 py-0.5 rounded-md bg-white border border-sky-300 text-sky-900 font-mono text-[11px]">
                          {flag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Section 1: Differential Suggestions */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center justify-between">
                    <span>Possible Conditions to Consider (Differential Suggestions)</span>
                    <span className="font-mono text-[10px] text-slate-400">Ranked by Algorithmic Fit</span>
                  </h4>
                  <div className="space-y-3">
                    {result.differentialSuggestions?.map((diff: any, idx: number) => (
                      <div
                        key={idx}
                        className="p-4 rounded-xl border border-slate-200 bg-white shadow-xs hover:border-slate-300 transition-all"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="font-extrabold text-sm text-slate-900">
                              {diff.condition}
                            </span>
                            <span className="ml-2 font-mono text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md border border-slate-200">
                              ICD-10: {diff.icd10}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                                diff.urgency === 'CRITICAL'
                                  ? 'bg-red-50 text-red-700 border border-red-200'
                                  : diff.urgency === 'HIGH'
                                  ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                  : 'bg-slate-100 text-slate-700'
                              }`}
                            >
                              {diff.urgency}
                            </span>
                            <span className="font-mono font-bold text-medblue-700 text-xs">
                              {diff.confidence}% Match
                            </span>
                          </div>
                        </div>
                        <p className="text-slate-600 mt-2 leading-relaxed text-[11px]">
                          {diff.rationale}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Section 2: Clinical Observations */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <h4 className="text-xs font-bold text-slate-800 mb-1 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-medblue-600" />
                    Synthesized Clinical Observations
                  </h4>
                  <p className="text-slate-700 leading-relaxed">{result.clinicalObservations}</p>
                </div>

                {/* Section 3: Recommended Next Steps */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                    Recommended Evidence-Based Next Steps
                  </h4>
                  <ul className="space-y-2">
                    {result.recommendedNextSteps?.map((step: string, idx: number) => (
                      <li
                        key={idx}
                        className="flex items-start space-x-2.5 p-2.5 rounded-xl bg-tealaccent-50/40 border border-tealaccent-200/60 text-slate-800"
                      >
                        <CheckSquare className="w-4 h-4 text-tealaccent-600 shrink-0 mt-0.5" />
                        <span className="leading-snug">{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Section 4: Warning Indicators & Red Flags */}
                <div className="p-4 rounded-xl bg-rose-50/60 border border-rose-200">
                  <h4 className="text-xs font-bold text-rose-900 mb-2 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                    Clinical Red Flags & Decompensation Triggers
                  </h4>
                  <ul className="list-disc pl-5 text-rose-800 space-y-1">
                    {result.redFlags?.map((flag: string, idx: number) => (
                      <li key={idx}>{flag}</li>
                    ))}
                  </ul>
                </div>

                {/* Section 5: Mandatory Clinician Review & Sign-Off */}
                <div className="p-4 rounded-2xl bg-white border-2 border-dashed border-slate-300">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <Stethoscope className="w-4 h-4 text-medblue-600" />
                      Attending Physician Verification & Sign-Off
                    </h4>
                    {reviewed ? (
                      <span className="inline-flex items-center text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Clinician Reviewed
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                        Review Pending
                      </span>
                    )}
                  </div>

                  <p className="text-[11px] text-slate-500 mb-3">
                    As the attending clinician, review the decision-support findings above and append your clinical assessment notes before committing to the patient's EHR.
                  </p>

                  <textarea
                    rows={2}
                    disabled={reviewed}
                    value={clinicianNotes}
                    onChange={(e) => setClinicianNotes(e.target.value)}
                    placeholder="Physician notes: Agreed with CAD differential, ordered stat ECG and troponin, scheduled follow-up..."
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white text-xs disabled:opacity-75"
                  />

                  {!reviewed && (
                    <button
                      type="button"
                      onClick={handleDoctorSignOff}
                      className="mt-3 flex items-center space-x-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>Confirm Physician Review & Sign-Off</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
