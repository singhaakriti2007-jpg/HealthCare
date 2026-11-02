'use client';

import React, { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import toast from 'react-hot-toast';
import {
  Stethoscope,
  Plus,
  Mail,
  Phone,
  Clock,
  Award,
  DollarSign,
  Filter,
  CheckCircle,
  XCircle,
  AlertCircle,
  X,
} from 'lucide-react';

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    contact: '',
    departmentId: '',
    specialization: '',
    qualification: '',
    experience: 5,
    consultationFee: 75,
    consultationTimings: '09:00 AM - 01:00 PM, 04:00 PM - 07:00 PM',
    availabilityStatus: 'AVAILABLE',
  });

  const loadData = () => {
    setLoading(true);
    let url = `/api/doctors?`;
    if (selectedDept !== 'ALL') url += `departmentId=${selectedDept}&`;
    if (selectedStatus !== 'ALL') url += `status=${selectedStatus}&`;

    Promise.all([
      fetch(url).then((res) => res.json()),
      fetch('/api/departments').then((res) => res.json()),
    ])
      .then(([docData, deptData]) => {
        setDoctors(docData.doctors || []);
        setDepartments(deptData.departments || []);
        if (deptData.departments?.length > 0 && !formData.departmentId) {
          setFormData((prev) => ({ ...prev, departmentId: deptData.departments[0].id }));
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load doctors data:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadData();
  }, [selectedDept, selectedStatus]);

  const handleStatusToggle = async (doctor: any, newStatus: string) => {
    try {
      const res = await fetch(`/api/doctors/${doctor.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ availabilityStatus: newStatus }),
      });
      if (res.ok) {
        toast.success(`Updated status for ${doctor.name}`);
        loadData();
      }
    } catch (err) {
      toast.error('Failed to update doctor status');
    }
  };

  const handleAddDoctor = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/doctors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || 'Failed to onboard doctor');
      } else {
        toast.success(`Doctor ${data.doctor.doctorId} onboarded`);
        setIsAddModalOpen(false);
        loadData();
      }
    } catch (err) {
      toast.error('Network error during doctor onboarding');
    }
  };

  return (
    <DashboardLayout title="Physician Directory & Departments">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-base font-bold text-slate-800">Clinical Medical Faculty</h2>
          <p className="text-xs text-slate-500">Board-Certified Specialists Across Hospital Wings</p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center space-x-2 bg-medblue-600 hover:bg-medblue-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-md shadow-medblue-600/20 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Onboard New Physician</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs text-xs">
        <div className="flex items-center space-x-2">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <span className="font-semibold text-slate-600">Department:</span>
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="px-3 py-1.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-hidden"
          >
            <option value="ALL">All Departments</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name} ({d.code})
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center space-x-2">
          <span className="font-semibold text-slate-600">Shift Status:</span>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-1.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-hidden"
          >
            <option value="ALL">All Statuses</option>
            <option value="AVAILABLE">Available</option>
            <option value="BUSY">In Consultation / Busy</option>
            <option value="ON_LEAVE">On Leave</option>
          </select>
        </div>
      </div>

      {/* Doctor Cards Grid */}
      {loading ? (
        <div className="text-center py-16 text-slate-400">
          <div className="w-8 h-8 border-2 border-medblue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          Loading Physician Roster...
        </div>
      ) : doctors.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 text-slate-400 text-xs">
          No physicians matching the selected filters.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {doctors.map((doc) => {
            const isAvailable = doc.availabilityStatus === 'AVAILABLE';
            const isBusy = doc.availabilityStatus === 'BUSY';

            return (
              <div
                key={doc.id}
                className="bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all p-5 flex flex-col justify-between"
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-mono text-[10px] font-bold text-medblue-700 bg-sky-50 px-2 py-0.5 rounded-md border border-sky-200">
                        {doc.doctorId}
                      </span>
                      <h3 className="text-base font-bold text-slate-800 mt-1.5 leading-snug">
                        {doc.name}
                      </h3>
                      <p className="text-xs font-semibold text-teal-600 mt-0.5">
                        {doc.department?.name}
                      </p>
                    </div>

                    <div className="flex flex-col items-end">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                          isAvailable
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : isBusy
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}
                      >
                        {doc.availabilityStatus}
                      </span>
                    </div>
                  </div>

                  {/* Specialization & Credentials */}
                  <div className="mt-4 space-y-2 text-xs">
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                      <p className="text-[11px] font-semibold text-slate-700 leading-snug">
                        {doc.specialization}
                      </p>
                      <p className="text-[10px] text-slate-500 mt-0.5">
                        {doc.qualification} • {doc.experience} yrs exp
                      </p>
                    </div>

                    <div className="flex items-center space-x-2 text-slate-500 text-[11px]">
                      <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{doc.consultationTimings}</span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] pt-1">
                      <span className="text-slate-500 flex items-center gap-1 font-mono">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        {doc.email}
                      </span>
                      <span className="font-bold text-slate-800 font-mono">
                        ${doc.consultationFee} / visit
                      </span>
                    </div>
                  </div>
                </div>

                {/* Footer status buttons */}
                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-[10px] text-slate-400 font-medium">Quick Status Shift:</span>
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => handleStatusToggle(doc, 'AVAILABLE')}
                      className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition-colors ${
                        isAvailable ? 'bg-emerald-600 text-white' : 'text-slate-500 hover:bg-slate-100'
                      }`}
                    >
                      Avail
                    </button>
                    <button
                      onClick={() => handleStatusToggle(doc, 'BUSY')}
                      className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition-colors ${
                        isBusy ? 'bg-amber-600 text-white' : 'text-slate-500 hover:bg-slate-100'
                      }`}
                    >
                      Busy
                    </button>
                    <button
                      onClick={() => handleStatusToggle(doc, 'ON_LEAVE')}
                      className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition-colors ${
                        doc.availabilityStatus === 'ON_LEAVE' ? 'bg-slate-700 text-white' : 'text-slate-500 hover:bg-slate-100'
                      }`}
                    >
                      Leave
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Onboard Doctor Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <h3 className="font-bold text-slate-800 text-base">Onboard Clinical Doctor</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddDoctor} className="space-y-4 pt-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Doctor Name (with title)</label>
                  <input
                    type="text"
                    required
                    placeholder="Dr. John Smith, MD"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Department</label>
                  <select
                    value={formData.departmentId}
                    onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white font-semibold text-medblue-700"
                  >
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Institutional Email</label>
                  <input
                    type="email"
                    required
                    placeholder="j.smith@mednexus.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Contact Number</label>
                  <input
                    type="text"
                    required
                    placeholder="+1 (555) 019-2831"
                    value={formData.contact}
                    onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Specialization</label>
                  <input
                    type="text"
                    required
                    placeholder="Interventional Cardiology"
                    value={formData.specialization}
                    onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Qualification Degrees</label>
                  <input
                    type="text"
                    required
                    placeholder="MD, FACC, FSCAI"
                    value={formData.qualification}
                    onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Years of Experience</label>
                  <input
                    type="number"
                    min={0}
                    value={formData.experience}
                    onChange={(e) => setFormData({ ...formData, experience: parseInt(e.target.value, 10) })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Consultation Fee ($)</label>
                  <input
                    type="number"
                    min={0}
                    value={formData.consultationFee}
                    onChange={(e) => setFormData({ ...formData, consultationFee: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Consultation Timings</label>
                <input
                  type="text"
                  value={formData.consultationTimings}
                  onChange={(e) => setFormData({ ...formData, consultationTimings: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white"
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
                  Confirm Onboarding
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
