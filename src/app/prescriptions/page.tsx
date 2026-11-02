'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import toast from 'react-hot-toast';
import {
  FileSpreadsheet,
  Plus,
  Download,
  Trash2,
  Stethoscope,
  User,
  Pill,
  Search,
  X,
  FileCheck,
} from 'lucide-react';
import { format } from 'date-fns';
import { jsPDF } from 'jspdf';

export default function PrescriptionsPage() {
  const { data: session } = useSession();
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [medicines, setMedicines] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRx, setSelectedRx] = useState<any>(null);

  const role = (session?.user as any)?.role || 'PATIENT';
  const isDoctorOrAdmin = role === 'DOCTOR' || role === 'ADMIN';

  // Form State
  const [formData, setFormData] = useState({
    patientId: '',
    diagnosis: '',
    notes: 'Take all medications strictly as prescribed. Review in 2 weeks.',
    items: [
      {
        medicineId: '',
        medicineName: 'Amoxicillin & Clavulanate 625mg',
        dosage: '1 Tablet (625mg)',
        frequency: 'Twice daily after meals (1-0-1)',
        duration: '5 days',
        instructions: 'Take with full glass of water after food',
      },
    ],
  });

  const loadData = () => {
    setLoading(true);
    Promise.all([
      fetch('/api/prescriptions').then((res) => res.json()),
      fetch('/api/patients').then((res) => res.json()),
      fetch('/api/medicines').then((res) => res.json()),
    ])
      .then(([rxData, patData, medData]) => {
        setPrescriptions(rxData.prescriptions || []);
        setPatients(patData.patients || []);
        setMedicines(medData.medicines || []);
        if (patData.patients?.length > 0 && !formData.patientId) {
          setFormData((prev) => ({ ...prev, patientId: patData.patients[0].id }));
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load prescriptions:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddItem = () => {
    setFormData({
      ...formData,
      items: [
        ...formData.items,
        {
          medicineId: '',
          medicineName: '',
          dosage: '1 Tablet',
          frequency: 'Once daily (1-0-0)',
          duration: '7 days',
          instructions: 'Take after breakfast',
        },
      ],
    });
  };

  const handleRemoveItem = (index: number) => {
    if (formData.items.length === 1) {
      toast.error('Prescription must contain at least one medication');
      return;
    }
    const updated = [...formData.items];
    updated.splice(index, 1);
    setFormData({ ...formData, items: updated });
  };

  const handleItemChange = (index: number, field: string, value: string) => {
    const updated = [...formData.items];
    (updated[index] as any)[field] = value;
    setFormData({ ...formData, items: updated });
  };

  const handleMedicineSelect = (index: number, medId: string) => {
    const med = medicines.find((m) => m.id === medId);
    if (med) {
      const updated = [...formData.items];
      updated[index].medicineId = med.id;
      updated[index].medicineName = `${med.name} (${med.strength})`;
      setFormData({ ...formData, items: updated });
    }
  };

  const handleCreatePrescription = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/prescriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || 'Failed to issue prescription');
      } else {
        toast.success(`Prescription ${data.prescription.prescriptionId} issued successfully!`);
        setIsModalOpen(false);
        loadData();
      }
    } catch (err) {
      toast.error('Network error during prescription issuance');
    }
  };

  // Generate Professional Medical PDF using jsPDF
  const generatePDF = (rx: any) => {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    // 1. Hospital Header
    doc.setFillColor(15, 23, 42); // Navy 900
    doc.rect(0, 0, 210, 36, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.text('MEDNEXUS HEALTHCARE SYSTEM', 15, 16);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(203, 213, 225);
    doc.text('Tertiary Care Hospital & Research Institute | Department of Clinical Medicine', 15, 23);
    doc.text('Emergency: +1 (800) 555-0199 | Hospital EHR: https://mednexus.health', 15, 29);

    // Prescription ID & Date Box
    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text(`PRESCRIPTION: ${rx.prescriptionId}`, 15, 48);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`Issue Date: ${format(new Date(rx.issueDate), 'MMMM dd, yyyy')}`, 140, 48);

    // Patient & Doctor Demographics Box
    doc.setDrawColor(226, 232, 240);
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(15, 54, 180, 32, 3, 3, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text('PATIENT DEMOGRAPHICS:', 20, 62);
    doc.text('PRESCRIBING PHYSICIAN:', 110, 62);

    doc.setFont('helvetica', 'normal');
    doc.text(`Name: ${rx.patient?.fullName || 'N/A'}`, 20, 68);
    doc.text(`ID: ${rx.patient?.patientId} | Blood: ${rx.patient?.bloodGroup}`, 20, 74);
    doc.text(`Allergies: ${rx.patient?.allergies || 'None reported'}`, 20, 80);

    doc.text(`Doctor: ${rx.doctor?.name || 'Dr. Attending'}`, 110, 68);
    doc.text(`Specialty: ${rx.doctor?.specialization || 'Clinical Specialist'}`, 110, 74);
    doc.text(`Department: ${rx.doctor?.department?.name || 'General Medicine'}`, 110, 80);

    // Diagnosis Banner
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('Clinical Diagnosis:', 15, 96);
    doc.setFont('helvetica', 'normal');
    doc.text(`${rx.diagnosis}`, 55, 96);

    // Rx Symbol
    doc.setFont('times', 'bolditalic');
    doc.setFontSize(22);
    doc.setTextColor(14, 165, 233); // Medical Blue
    doc.text('Rx', 15, 108);

    // Medication Items Table Header
    doc.setDrawColor(203, 213, 225);
    doc.setFillColor(241, 245, 249);
    doc.rect(15, 112, 180, 8, 'FD');

    doc.setTextColor(71, 85, 105);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.text('#', 18, 117);
    doc.text('MEDICATION / FORM', 28, 117);
    doc.text('DOSAGE', 85, 117);
    doc.text('FREQUENCY', 115, 117);
    doc.text('DURATION', 150, 117);
    doc.text('INSTRUCTIONS', 170, 117);

    // Medication Rows
    let currentY = 124;
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(8.5);

    rx.items?.forEach((item: any, i: number) => {
      doc.text(`${i + 1}`, 18, currentY);
      doc.setFont('helvetica', 'bold');
      doc.text(`${item.medicineName}`, 28, currentY);
      doc.setFont('helvetica', 'normal');
      doc.text(`${item.dosage}`, 85, currentY);
      doc.text(`${item.frequency}`, 115, currentY);
      doc.text(`${item.duration}`, 150, currentY);
      doc.text(`${item.instructions || 'As advised'}`, 170, currentY);

      doc.setDrawColor(241, 245, 249);
      doc.line(15, currentY + 3, 195, currentY + 3);
      currentY += 10;
    });

    // Notes
    if (rx.notes) {
      currentY += 5;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.text('Physician Instructions / Dietary Advice:', 15, currentY);
      currentY += 5;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.text(`${rx.notes}`, 15, currentY);
    }

    // Doctor Signature Area
    const footerY = 250;
    doc.setDrawColor(148, 163, 184);
    doc.line(135, footerY, 190, footerY);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text(`${rx.doctor?.name}`, 135, footerY + 5);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text('Digitally Verified Physician Signature', 135, footerY + 9);
    doc.text(`Stamp Token: MED-${rx.prescriptionId}`, 135, footerY + 13);

    // Disclaimer
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);
    doc.text(
      'This document is an electronically signed institutional medical prescription. Valid only if verified through MEDNEXUS EHR platform.',
      15,
      280
    );

    doc.save(`Prescription_${rx.prescriptionId}_${rx.patient?.fullName?.replace(/\s+/g, '_')}.pdf`);
    toast.success(`Downloaded ${rx.prescriptionId} PDF`);
  };

  return (
    <DashboardLayout title="Prescription Dispensation & Formulary">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-base font-bold text-slate-800">Prescription Registry</h2>
          <p className="text-xs text-slate-500">Authorized Physician Medication Orders & Digital PDF Slips</p>
        </div>

        {isDoctorOrAdmin && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center space-x-2 bg-medblue-600 hover:bg-medblue-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-md shadow-medblue-600/20 transition-all self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Issue New Prescription</span>
          </button>
        )}
      </div>

      {/* Prescriptions List */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3.5 px-4">Rx Token</th>
                <th className="py-3.5 px-4">Patient</th>
                <th className="py-3.5 px-4">Physician</th>
                <th className="py-3.5 px-4">Diagnosis</th>
                <th className="py-3.5 px-4">Medications</th>
                <th className="py-3.5 px-4">Issue Date</th>
                <th className="py-3.5 px-4 text-right">Download PDF</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400">
                    <div className="w-6 h-6 border-2 border-medblue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    Loading Prescriptions...
                  </td>
                </tr>
              ) : prescriptions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400">
                    No prescription records found.
                  </td>
                </tr>
              ) : (
                prescriptions.map((rx) => (
                  <tr key={rx.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-medblue-700">
                      {rx.prescriptionId}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-800">{rx.patient?.fullName}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{rx.patient?.patientId}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-800">{rx.doctor?.name}</div>
                      <div className="text-[11px] text-teal-600">{rx.doctor?.department?.name}</div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 font-medium max-w-xs truncate">
                      {rx.diagnosis}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex flex-wrap gap-1">
                        {rx.items?.map((item: any, i: number) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 rounded-md bg-teal-50 text-teal-800 border border-teal-200 text-[10px] font-medium"
                          >
                            {item.medicineName}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 font-mono">
                      {format(new Date(rx.issueDate), 'MMM d, yyyy')}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => generatePDF(rx)}
                        className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-sky-50 text-medblue-700 hover:bg-sky-100 font-bold transition-colors text-[11px]"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>PDF Slip</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Issue Prescription Modal (Doctor Only) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div className="flex items-center space-x-2">
                <FileCheck className="w-5 h-5 text-medblue-600" />
                <h3 className="font-bold text-slate-800 text-base">Issue Clinical Prescription</h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePrescription} className="space-y-4 pt-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Select Patient</label>
                  <select
                    required
                    value={formData.patientId}
                    onChange={(e) => setFormData({ ...formData, patientId: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white font-semibold text-slate-800"
                  >
                    {patients.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.fullName} ({p.patientId})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Clinical Diagnosis</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Essential Hypertension, Bronchitis"
                    value={formData.diagnosis}
                    onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white"
                  />
                </div>
              </div>

              {/* Dynamic Medicine Rows */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="font-bold text-slate-700 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                    <Pill className="w-3.5 h-3.5 text-medblue-600" />
                    Prescribed Medicines ({formData.items.length})
                  </label>
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="text-[11px] font-bold text-medblue-600 hover:text-medblue-700 flex items-center space-x-1 bg-sky-50 px-2.5 py-1 rounded-lg"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Medicine</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {formData.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 relative"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[10px] font-bold text-slate-500">
                          Medication Item #{idx + 1}
                        </span>
                        {formData.items.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(idx)}
                            className="text-slate-400 hover:text-red-500"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[10px] text-slate-500 font-semibold mb-0.5">
                            Formulary Quick-Pick
                          </label>
                          <select
                            onChange={(e) => handleMedicineSelect(idx, e.target.value)}
                            className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white"
                          >
                            <option value="">Select from catalog...</option>
                            {medicines.map((m) => (
                              <option key={m.id} value={m.id}>
                                {m.name} ({m.strength}) - {m.category}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-[10px] text-slate-500 font-semibold mb-0.5">
                            Medicine Name & Strength
                          </label>
                          <input
                            type="text"
                            required
                            value={item.medicineName}
                            onChange={(e) => handleItemChange(idx, 'medicineName', e.target.value)}
                            className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white font-medium"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <label className="block text-[10px] text-slate-500 font-semibold mb-0.5">
                            Dosage
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="1 Tablet / 10ml"
                            value={item.dosage}
                            onChange={(e) => handleItemChange(idx, 'dosage', e.target.value)}
                            className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] text-slate-500 font-semibold mb-0.5">
                            Frequency
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="Twice daily (1-0-1)"
                            value={item.frequency}
                            onChange={(e) => handleItemChange(idx, 'frequency', e.target.value)}
                            className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] text-slate-500 font-semibold mb-0.5">
                            Duration
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="7 days"
                            value={item.duration}
                            onChange={(e) => handleItemChange(idx, 'duration', e.target.value)}
                            className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] text-slate-500 font-semibold mb-0.5">
                          Patient Instructions
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Take with plenty of water after food"
                          value={item.instructions}
                          onChange={(e) => handleItemChange(idx, 'instructions', e.target.value)}
                          className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  General Dietary Advice & Review Schedule
                </label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-bold text-white bg-medblue-600 hover:bg-medblue-700 rounded-xl shadow-md"
                >
                  Issue & Commit Prescription
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
