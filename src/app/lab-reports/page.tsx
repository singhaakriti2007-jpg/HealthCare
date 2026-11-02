'use client';

import React, { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import toast from 'react-hot-toast';
import {
  FlaskConical,
  Download,
  Filter,
  Eye,
  CheckCircle2,
  AlertCircle,
  Plus,
  X,
  FileText,
  Activity,
  Layers,
} from 'lucide-react';
import { format } from 'date-fns';
import { jsPDF } from 'jspdf';

export default function LabReportsPage() {
  const [reports, setReports] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form State for new Lab Report
  const [formData, setFormData] = useState({
    patientId: '',
    testName: 'Thyroid Function Profile (T3, T4, TSH)',
    category: 'ENDOCRINOLOGY',
    summary: 'Serum TSH elevated with borderline low Free T4, consistent with primary hypothyroidism.',
    technicianName: 'Robert Vance, MLS(ASCP)',
    referredByDoctor: 'Dr. David Chen',
    parameters: [
      { parameter: 'Total Triiodothyronine (T3)', result: '1.1', unit: 'ng/mL', referenceRange: '0.8 - 2.0', status: 'NORMAL' },
      { parameter: 'Free Thyroxine (FT4)', result: '0.72', unit: 'ng/dL', referenceRange: '0.8 - 1.8', status: 'LOW' },
      { parameter: 'Thyroid Stimulating Hormone (TSH)', result: '6.85', unit: 'µIU/mL', referenceRange: '0.40 - 4.50', status: 'HIGH' },
    ],
  });

  const loadData = () => {
    setLoading(true);
    let url = `/api/lab-reports?`;
    if (categoryFilter !== 'ALL') url += `category=${categoryFilter}&`;

    Promise.all([
      fetch(url).then((res) => res.json()),
      fetch('/api/patients').then((res) => res.json()),
    ])
      .then(([labData, patData]) => {
        setReports(labData.labReports || []);
        setPatients(patData.patients || []);
        if (patData.patients?.length > 0 && !formData.patientId) {
          setFormData((prev) => ({ ...prev, patientId: patData.patients[0].id }));
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load lab reports:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadData();
  }, [categoryFilter]);

  const handleCreateReport = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/lab-reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId: formData.patientId,
          testName: formData.testName,
          category: formData.category,
          testParameters: JSON.stringify(formData.parameters),
          summary: formData.summary,
          technicianName: formData.technicianName,
          referredByDoctor: formData.referredByDoctor,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || 'Failed to publish lab report');
      } else {
        toast.success(`Lab Report ${data.report.reportId} published successfully!`);
        setIsAddModalOpen(false);
        loadData();
      }
    } catch (err) {
      toast.error('Network error creating report');
    }
  };

  // Download Diagnostic Laboratory PDF
  const downloadLabPDF = (report: any) => {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    // Header
    doc.setFillColor(15, 23, 42);
    doc.rect(0, 0, 210, 34, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text('MEDNEXUS CLINICAL LABORATORY SERVICES', 15, 15);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(203, 213, 225);
    doc.text('Accredited College of American Pathologists (CAP) & NABL Certified Node', 15, 22);
    doc.text('Report ID: ' + report.reportId + ' | Electronic Diagnostic Record', 15, 28);

    // Patient & Report Meta
    doc.setDrawColor(226, 232, 240);
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(15, 42, 180, 26, 3, 3, 'FD');

    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.text(`PATIENT: ${report.patient?.fullName}`, 20, 50);
    doc.text(`INVESTIGATION: ${report.testName}`, 110, 50);

    doc.setFont('helvetica', 'normal');
    doc.text(`ID: ${report.patient?.patientId} | Gender: ${report.patient?.gender}`, 20, 56);
    doc.text(`Category: ${report.category}`, 110, 56);
    doc.text(`Specimen Collection Date: ${format(new Date(report.testDate), 'MMM d, yyyy')}`, 20, 62);
    doc.text(`Referred By: ${report.referredByDoctor || 'Clinical Dept'}`, 110, 62);

    // Parameters Table Header
    doc.setDrawColor(203, 213, 225);
    doc.setFillColor(241, 245, 249);
    doc.rect(15, 75, 180, 8, 'FD');

    doc.setTextColor(71, 85, 105);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.text('TEST PARAMETER', 20, 80);
    doc.text('OBSERVED RESULT', 95, 80);
    doc.text('UNIT', 135, 80);
    doc.text('REFERENCE INTERVAL', 155, 80);

    let params: any[] = [];
    try {
      params = JSON.parse(report.testParameters || '[]');
    } catch (e) {
      params = [];
    }

    let y = 88;
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(8.5);

    params.forEach((p: any) => {
      doc.text(`${p.parameter}`, 20, y);

      if (p.status === 'HIGH' || p.status === 'LOW') {
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(220, 38, 38);
        doc.text(`${p.result} (${p.status})`, 95, y);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(15, 23, 42);
      } else {
        doc.text(`${p.result}`, 95, y);
      }

      doc.text(`${p.unit || '-'}`, 135, y);
      doc.text(`${p.referenceRange || '-'}`, 155, y);

      doc.setDrawColor(241, 245, 249);
      doc.line(15, y + 3, 195, y + 3);
      y += 9;
    });

    // Summary / Interpretation
    if (report.summary) {
      y += 8;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.text('Pathologist Summary & Clinical Interpretation:', 15, y);
      y += 5;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.text(doc.splitTextToSize(report.summary, 180), 15, y);
    }

    // Signatures
    const signY = 245;
    doc.setDrawColor(148, 163, 184);
    doc.line(20, signY, 70, signY);
    doc.line(140, signY, 190, signY);

    doc.setFontSize(8);
    doc.text('Technologist Signature', 20, signY + 5);
    doc.text(`${report.technicianName || 'Verified Tech'}`, 20, signY + 9);

    doc.text('Consultant Pathologist', 140, signY + 5);
    doc.text('MD (Pathology), DNB', 140, signY + 9);

    doc.save(`LabReport_${report.reportId}_${report.patient?.fullName?.replace(/\s+/g, '_')}.pdf`);
    toast.success(`Downloaded ${report.reportId} PDF`);
  };

  return (
    <DashboardLayout title="Laboratory Diagnostics & Pathology">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-base font-bold text-slate-800">Diagnostic Laboratory Registry</h2>
          <p className="text-xs text-slate-500">Hematology, Biochemistry, Endocrinology, and Pathology Records</p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center space-x-2 bg-medblue-600 hover:bg-medblue-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-md shadow-medblue-600/20 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Publish Laboratory Report</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex items-center space-x-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs text-xs">
        <Filter className="w-3.5 h-3.5 text-slate-400" />
        <span className="font-semibold text-slate-600">Discipline Category:</span>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-3 py-1.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-hidden"
        >
          <option value="ALL">All Categories</option>
          <option value="HEMATOLOGY">Hematology (CBC)</option>
          <option value="BIOCHEMISTRY">Biochemistry (Lipids, Renal, Glucose)</option>
          <option value="ENDOCRINOLOGY">Endocrinology (Thyroid, HbA1c)</option>
          <option value="PATHOLOGY">General Pathology</option>
        </select>
      </div>

      {/* Reports Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3.5 px-4">Report ID</th>
                <th className="py-3.5 px-4">Patient Name</th>
                <th className="py-3.5 px-4">Investigation Test</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Test Date</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400">
                    <div className="w-6 h-6 border-2 border-medblue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    Querying Laboratory Catalog...
                  </td>
                </tr>
              ) : reports.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400">
                    No diagnostic laboratory records found.
                  </td>
                </tr>
              ) : (
                reports.map((rep) => (
                  <tr key={rep.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-medblue-700">
                      {rep.reportId}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-800">{rep.patient?.fullName}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{rep.patient?.patientId}</div>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-800">
                      {rep.testName}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700">
                        {rep.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 font-mono">
                      {format(new Date(rep.testDate), 'MMM d, yyyy')}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {rep.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-2">
                      <button
                        onClick={() => setSelectedReport(rep)}
                        className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition-colors text-[11px]"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect</span>
                      </button>
                      <button
                        onClick={() => downloadLabPDF(rep)}
                        className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-sky-50 text-medblue-700 hover:bg-sky-100 font-bold transition-colors text-[11px]"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>PDF</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Inspect Lab Report Slideover / Modal */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div>
                <span className="font-mono text-xs font-bold text-medblue-700 bg-sky-50 px-2 py-0.5 rounded-md">
                  {selectedReport.reportId}
                </span>
                <h3 className="font-bold text-slate-800 text-base mt-1">{selectedReport.testName}</h3>
                <p className="text-xs text-slate-500">Patient: {selectedReport.patient?.fullName}</p>
              </div>
              <button onClick={() => setSelectedReport(null)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 space-y-4 text-xs">
              {/* Parameters Breakdown */}
              <div className="rounded-xl border border-slate-200 overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold text-[10px] uppercase">
                    <tr>
                      <th className="p-3">Parameter</th>
                      <th className="p-3">Result</th>
                      <th className="p-3">Unit</th>
                      <th className="p-3">Reference</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {(() => {
                      try {
                        const list = JSON.parse(selectedReport.testParameters || '[]');
                        return list.map((p: any, i: number) => (
                          <tr key={i} className="hover:bg-slate-50">
                            <td className="p-3 font-semibold text-slate-800">{p.parameter}</td>
                            <td className="p-3 font-bold">
                              <span
                                className={
                                  p.status === 'HIGH' || p.status === 'LOW'
                                    ? 'text-red-600 bg-red-50 px-2 py-0.5 rounded-md'
                                    : 'text-slate-800'
                                }
                              >
                                {p.result} {p.status !== 'NORMAL' ? `(${p.status})` : ''}
                              </span>
                            </td>
                            <td className="p-3 font-mono text-slate-500">{p.unit}</td>
                            <td className="p-3 font-mono text-slate-500">{p.referenceRange}</td>
                          </tr>
                        ));
                      } catch (e) {
                        return (
                          <tr>
                            <td colSpan={4} className="p-3 text-slate-400">Raw parameter payload.</td>
                          </tr>
                        );
                      }
                    })()}
                  </tbody>
                </table>
              </div>

              {selectedReport.summary && (
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <h4 className="font-bold text-slate-700 mb-1">Pathologist Interpretation</h4>
                  <p className="text-slate-600 leading-relaxed">{selectedReport.summary}</p>
                </div>
              )}

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => downloadLabPDF(selectedReport)}
                  className="px-4 py-2 font-bold text-white bg-medblue-600 hover:bg-medblue-700 rounded-xl shadow-xs flex items-center space-x-1.5"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Formal Report PDF</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
