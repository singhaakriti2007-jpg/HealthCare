'use client';

import React, { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import toast from 'react-hot-toast';
import {
  Users,
  Search,
  Filter,
  Plus,
  Eye,
  Edit2,
  Trash2,
  Activity,
  HeartPulse,
  AlertTriangle,
  FileText,
  Calendar,
  X,
  Check,
  Droplet,
} from 'lucide-react';
import { format } from 'date-fns';

export default function PatientsPage() {
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [bloodFilter, setBloodFilter] = useState('ALL');
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<any>(null);

  // Form states
  const [formData, setFormData] = useState({
    fullName: '',
    dob: '1988-06-15',
    gender: 'MALE',
    contact: '',
    email: '',
    address: '',
    bloodGroup: 'O+',
    emergencyContact: '',
    emergencyContactRelation: 'Spouse',
    medicalHistory: '',
    allergies: '',
  });

  const loadPatients = () => {
    setLoading(true);
    let url = `/api/patients?search=${encodeURIComponent(search)}`;
    if (bloodFilter !== 'ALL') url += `&bloodGroup=${bloodFilter}`;

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        setPatients(data.patients || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error loading patients:', err);
        toast.error('Failed to load patient records');
        setLoading(false);
      });
  };

  useEffect(() => {
    loadPatients();
  }, [bloodFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadPatients();
  };

  const handleAddPatient = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/patients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || 'Failed to register patient');
      } else {
        toast.success(`Patient ${data.patient.patientId} registered successfully`);
        setIsAddModalOpen(false);
        loadPatients();
        // Reset form
        setFormData({
          fullName: '',
          dob: '1988-06-15',
          gender: 'MALE',
          contact: '',
          email: '',
          address: '',
          bloodGroup: 'O+',
          emergencyContact: '',
          emergencyContactRelation: 'Spouse',
          medicalHistory: '',
          allergies: '',
        });
      }
    } catch (err) {
      toast.error('Network error during patient registration');
    }
  };

  const handleEditPatient = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/patients/${editingPatient.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingPatient),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || 'Failed to update patient');
      } else {
        toast.success('Patient record updated');
        setIsEditModalOpen(false);
        loadPatients();
        if (selectedPatient?.id === editingPatient.id) {
          viewPatientDetails(editingPatient.id);
        }
      }
    } catch (err) {
      toast.error('Failed to update patient');
    }
  };

  const handleDeletePatient = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to soft-delete patient record for ${name}?`)) return;

    try {
      const res = await fetch(`/api/patients/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || 'Delete failed');
      } else {
        toast.success(`Patient record archived`);
        if (selectedPatient?.id === id) setSelectedPatient(null);
        loadPatients();
      }
    } catch (err) {
      toast.error('Error soft-deleting patient');
    }
  };

  const viewPatientDetails = async (id: string) => {
    try {
      const res = await fetch(`/api/patients/${id}`);
      const data = await res.json();
      if (res.ok) {
        setSelectedPatient(data.patient);
      }
    } catch (err) {
      toast.error('Could not load detailed EHR');
    }
  };

  return (
    <DashboardLayout title="Patient Master Index (EHR)">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-base font-bold text-slate-800">Master Patient Index</h2>
          <p className="text-xs text-slate-500">3NF Normalized Clinical Demographics & History</p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center space-x-2 bg-medblue-600 hover:bg-medblue-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-md shadow-medblue-600/20 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Register New Patient</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, patient ID, email, contact..."
            className="w-full pl-10 pr-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-medblue-500 focus:outline-hidden"
          />
        </form>

        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <div className="flex items-center space-x-2 text-xs text-slate-500">
            <Droplet className="w-3.5 h-3.5 text-red-500" />
            <span className="font-semibold">Blood Group:</span>
          </div>
          <select
            value={bloodFilter}
            onChange={(e) => setBloodFilter(e.target.value)}
            className="text-xs font-semibold px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-hidden"
          >
            <option value="ALL">All Groups</option>
            <option value="O+">O+</option>
            <option value="O-">O-</option>
            <option value="A+">A+</option>
            <option value="A-">A-</option>
            <option value="B+">B+</option>
            <option value="B-">B-</option>
            <option value="AB+">AB+</option>
            <option value="AB-">AB-</option>
          </select>
        </div>
      </div>

      {/* Patients Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3.5 px-4">Patient ID</th>
                <th className="py-3.5 px-4">Full Name</th>
                <th className="py-3.5 px-4">Age / Gender</th>
                <th className="py-3.5 px-4">Blood Group</th>
                <th className="py-3.5 px-4">Contact</th>
                <th className="py-3.5 px-4">Allergies & Alerts</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400">
                    <div className="w-6 h-6 border-2 border-medblue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    Querying Patient Indexes...
                  </td>
                </tr>
              ) : patients.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400">
                    No matching patient records found.
                  </td>
                </tr>
              ) : (
                patients.map((p) => {
                  const age = Math.floor(
                    (new Date().getTime() - new Date(p.dob).getTime()) / (365.25 * 24 * 60 * 60 * 1000)
                  );
                  return (
                    <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-medblue-700">
                        {p.patientId}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-800">{p.fullName}</div>
                        <div className="text-[11px] text-slate-400 truncate max-w-xs">{p.email}</div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">
                        {age} yrs • <span className="capitalize">{p.gender?.toLowerCase()}</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-red-50 text-red-700 border border-red-200">
                          {p.bloodGroup}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 font-mono">
                        {p.contact}
                      </td>
                      <td className="py-3.5 px-4">
                        {p.allergies ? (
                          <span className="inline-flex items-center text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200 max-w-[200px] truncate">
                            <AlertTriangle className="w-3 h-3 mr-1 text-amber-600 shrink-0" />
                            {p.allergies}
                          </span>
                        ) : (
                          <span className="text-[11px] text-slate-400">None reported</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right space-x-1 whitespace-nowrap">
                        <button
                          onClick={() => viewPatientDetails(p.id)}
                          title="View Complete Clinical EHR"
                          className="p-1.5 text-slate-500 hover:text-medblue-600 hover:bg-sky-50 rounded-lg transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setEditingPatient(p);
                            setIsEditModalOpen(true);
                          }}
                          title="Edit Demographics"
                          className="p-1.5 text-slate-500 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeletePatient(p.id, p.fullName)}
                          title="Archive Patient"
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Slideover / Modal Drawer */}
      {selectedPatient && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-slate-900/40 backdrop-blur-xs p-2 sm:p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full h-[95vh] shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in slide-in-from-right duration-200">
            {/* Header */}
            <div className="p-6 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-11 h-11 rounded-2xl bg-medblue-600 text-white font-extrabold text-base flex items-center justify-center shadow-md">
                  {selectedPatient.fullName?.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="font-extrabold text-slate-900 text-lg leading-tight">
                      {selectedPatient.fullName}
                    </h3>
                    <span className="font-mono text-xs font-bold text-medblue-700 bg-sky-100 px-2 py-0.5 rounded-md">
                      {selectedPatient.patientId}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    Registered on {format(new Date(selectedPatient.registrationDate), 'MMMM dd, yyyy')}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedPatient(null)}
                className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-xl transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Clinical Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs">
              {/* Vitals & Demographics Badges */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Blood Group</span>
                  <p className="text-base font-bold text-red-600 mt-0.5">{selectedPatient.bloodGroup}</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Gender</span>
                  <p className="text-base font-bold text-slate-800 mt-0.5 capitalize">{selectedPatient.gender?.toLowerCase()}</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Contact</span>
                  <p className="text-xs font-bold text-slate-800 mt-1 font-mono">{selectedPatient.contact}</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Emergency</span>
                  <p className="text-xs font-bold text-slate-800 mt-1 font-mono">{selectedPatient.emergencyContact}</p>
                </div>
              </div>

              {/* Medical History & Allergies */}
              <div className="space-y-3">
                <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200">
                  <span className="text-[11px] font-bold text-amber-900 flex items-center gap-1.5 mb-1">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                    Allergies & Contraindications
                  </span>
                  <p className="text-amber-800">{selectedPatient.allergies || 'No known drug or food allergies on record.'}</p>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5 mb-1">
                    <HeartPulse className="w-3.5 h-3.5 text-medblue-600" />
                    Pre-Existing Medical History
                  </span>
                  <p className="text-slate-600">{selectedPatient.medicalHistory || 'No prior chronic conditions recorded.'}</p>
                </div>
              </div>

              {/* Linked Consultations */}
              <div>
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center justify-between">
                  <span>Consultations ({selectedPatient.appointments?.length || 0})</span>
                </h4>
                <div className="space-y-2">
                  {selectedPatient.appointments?.map((apt: any) => (
                    <div key={apt.id} className="p-3 rounded-xl border border-slate-200 bg-white flex items-center justify-between">
                      <div>
                        <p className="font-bold text-slate-800">{apt.doctor?.name} • {apt.department?.name}</p>
                        <p className="text-slate-500 text-[11px] mt-0.5">{apt.reason || 'General Follow-up'}</p>
                      </div>
                      <div className="text-right font-mono">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-50 text-medblue-700">
                          {apt.status}
                        </span>
                        <p className="text-slate-400 text-[10px] mt-1">{format(new Date(apt.appointmentDate), 'MMM d, yyyy')}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Linked Prescriptions */}
              <div>
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                  Prescription History ({selectedPatient.prescriptions?.length || 0})
                </h4>
                <div className="space-y-2">
                  {selectedPatient.prescriptions?.map((rx: any) => (
                    <div key={rx.id} className="p-3 rounded-xl border border-slate-200 bg-white">
                      <div className="flex items-center justify-between font-bold text-slate-800">
                        <span>{rx.prescriptionId}</span>
                        <span className="text-[10px] text-slate-400 font-normal">{format(new Date(rx.issueDate), 'MMM d, yyyy')}</span>
                      </div>
                      <p className="text-slate-600 mt-1">{rx.diagnosis}</p>
                      <div className="mt-2 flex flex-wrap gap-1">
                        {rx.items?.map((item: any, i: number) => (
                          <span key={i} className="px-2 py-0.5 rounded-md bg-teal-50 text-teal-800 border border-teal-200 text-[10px]">
                            {item.medicineName} ({item.dosage})
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Register New Patient Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <h3 className="font-bold text-slate-800 text-base">Register New Patient</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddPatient} className="space-y-4 pt-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-medblue-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Email</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-medblue-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Contact Phone</label>
                  <input
                    type="text"
                    required
                    value={formData.contact}
                    onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-medblue-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Date of Birth</label>
                  <input
                    type="date"
                    required
                    value={formData.dob}
                    onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-medblue-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Gender</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-hidden"
                  >
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Blood Group</label>
                  <select
                    value={formData.bloodGroup}
                    onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-hidden font-bold text-red-600"
                  >
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Emergency Contact</label>
                  <input
                    type="text"
                    required
                    value={formData.emergencyContact}
                    onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-medblue-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Emergency Relation</label>
                  <input
                    type="text"
                    value={formData.emergencyContactRelation}
                    onChange={(e) => setFormData({ ...formData, emergencyContactRelation: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-medblue-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Address</label>
                <input
                  type="text"
                  required
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-medblue-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Known Allergies</label>
                <input
                  type="text"
                  value={formData.allergies}
                  onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
                  placeholder="e.g. Penicillin, Sulfa, Aspirin"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-medblue-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Chronic Medical History</label>
                <textarea
                  rows={2}
                  value={formData.medicalHistory}
                  onChange={(e) => setFormData({ ...formData, medicalHistory: e.target.value })}
                  placeholder="e.g. Hypertension 5yrs, Diabetes Mellitus"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-medblue-500 focus:outline-hidden"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-bold text-white bg-medblue-600 hover:bg-medblue-700 rounded-xl shadow-md"
                >
                  Save Patient Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Patient Modal */}
      {isEditModalOpen && editingPatient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <h3 className="font-bold text-slate-800 text-base">Edit Patient ({editingPatient.patientId})</h3>
              <button onClick={() => setIsEditModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditPatient} className="space-y-4 pt-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={editingPatient.fullName}
                    onChange={(e) => setEditingPatient({ ...editingPatient, fullName: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Contact</label>
                  <input
                    type="text"
                    required
                    value={editingPatient.contact}
                    onChange={(e) => setEditingPatient({ ...editingPatient, contact: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Blood Group</label>
                  <select
                    value={editingPatient.bloodGroup}
                    onChange={(e) => setEditingPatient({ ...editingPatient, bloodGroup: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white font-bold text-red-600"
                  >
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Address</label>
                  <input
                    type="text"
                    value={editingPatient.address}
                    onChange={(e) => setEditingPatient({ ...editingPatient, address: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Allergies</label>
                <input
                  type="text"
                  value={editingPatient.allergies || ''}
                  onChange={(e) => setEditingPatient({ ...editingPatient, allergies: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Medical History</label>
                <textarea
                  rows={2}
                  value={editingPatient.medicalHistory || ''}
                  onChange={(e) => setEditingPatient({ ...editingPatient, medicalHistory: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-bold text-white bg-medblue-600 hover:bg-medblue-700 rounded-xl shadow-md"
                >
                  Update Patient
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
