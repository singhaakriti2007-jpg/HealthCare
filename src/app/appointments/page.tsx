'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import toast from 'react-hot-toast';
import {
  CalendarDays,
  Plus,
  Clock,
  User,
  Stethoscope,
  Filter,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Calendar as CalendarIcon,
  X,
  ShieldAlert,
} from 'lucide-react';
import { format } from 'date-fns';

export default function AppointmentsPage() {
  const { data: session } = useSession();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [dateFilter, setDateFilter] = useState('');

  // Booking Modal
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    patientId: '',
    doctorId: '',
    departmentId: '',
    appointmentDate: new Date().toISOString().split('T')[0],
    timeSlot: '10:00 AM - 10:30 AM',
    type: 'GENERAL',
    reason: '',
    notes: '',
  });

  const timeSlots = [
    '09:00 AM - 09:30 AM',
    '09:30 AM - 10:00 AM',
    '10:00 AM - 10:30 AM',
    '10:30 AM - 11:00 AM',
    '11:00 AM - 11:30 AM',
    '11:30 AM - 12:00 PM',
    '01:00 PM - 01:30 PM',
    '01:30 PM - 02:00 PM',
    '02:00 PM - 02:30 PM',
    '02:30 PM - 03:00 PM',
    '03:00 PM - 03:30 PM',
    '04:00 PM - 04:30 PM',
    '04:30 PM - 05:00 PM',
  ];

  const loadAppointments = () => {
    setLoading(true);
    let url = `/api/appointments?`;
    if (statusFilter !== 'ALL') url += `status=${statusFilter}&`;
    if (dateFilter) url += `date=${dateFilter}&`;

    Promise.all([
      fetch(url).then((res) => res.json()),
      fetch('/api/doctors').then((res) => res.json()),
      fetch('/api/departments').then((res) => res.json()),
      fetch('/api/patients').then((res) => res.json()),
    ])
      .then(([aptData, docData, deptData, patData]) => {
        setAppointments(aptData.appointments || []);
        setDoctors(docData.doctors || []);
        setDepartments(deptData.departments || []);
        setPatients(patData.patients || []);

        // Initial default form selections
        if (patData.patients?.length > 0 && !formData.patientId) {
          setFormData((prev) => ({
            ...prev,
            patientId: patData.patients[0].id,
            doctorId: docData.doctors?.[0]?.id || '',
            departmentId: deptData.departments?.[0]?.id || '',
          }));
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load appointments:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadAppointments();
  }, [statusFilter, dateFilter]);

  const handleStatusChange = async (appointmentId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/appointments/${appointmentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || 'Failed to update status');
      } else {
        toast.success(`Appointment status updated to ${newStatus}`);
        loadAppointments();
      }
    } catch (err) {
      toast.error('Network error updating status');
    }
  };

  const handleBookSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        // Double-booking conflict or other error
        toast.error(data.error || 'Failed to book appointment', { duration: 5000 });
      } else {
        toast.success(`Appointment ${data.appointment.appointmentId} confirmed successfully!`);
        setIsBookModalOpen(false);
        loadAppointments();
      }
    } catch (err) {
      toast.error('Booking failed due to network error');
    }
  };

  return (
    <DashboardLayout title="Appointment Dispatch & Roster">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-base font-bold text-slate-800">Clinical Consultation Schedule</h2>
          <p className="text-xs text-slate-500">Atomic Schedule Roster with Race-Condition Double-Booking Lock</p>
        </div>

        <button
          onClick={() => setIsBookModalOpen(true)}
          className="flex items-center space-x-2 bg-medblue-600 hover:bg-medblue-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-md shadow-medblue-600/20 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Book New Encounter</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs text-xs">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center space-x-2">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-semibold text-slate-600">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-hidden"
            >
              <option value="ALL">All Statuses</option>
              <option value="SCHEDULED">Scheduled</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <CalendarIcon className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-semibold text-slate-600">Specific Date:</span>
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-3 py-1.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-hidden text-xs"
            />
            {dateFilter && (
              <button
                onClick={() => setDateFilter('')}
                className="text-[11px] text-medblue-600 hover:underline"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        <div className="text-[11px] font-mono text-teal-700 bg-teal-50 px-2.5 py-1 rounded-full border border-teal-200">
          Composite Key: (doctorId, date, slot)
        </div>
      </div>

      {/* Appointments Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3.5 px-4">Token ID</th>
                <th className="py-3.5 px-4">Patient</th>
                <th className="py-3.5 px-4">Doctor & Department</th>
                <th className="py-3.5 px-4">Date & Slot</th>
                <th className="py-3.5 px-4">Encounter Reason</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Workflow Transition</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400">
                    <div className="w-6 h-6 border-2 border-medblue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    Fetching Appointment Grid...
                  </td>
                </tr>
              ) : appointments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400">
                    No consultations found for current filter criteria.
                  </td>
                </tr>
              ) : (
                appointments.map((apt) => (
                  <tr key={apt.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-medblue-700">
                      {apt.appointmentId}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-800">{apt.patient?.fullName}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{apt.patient?.patientId}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-800">{apt.doctor?.name}</div>
                      <div className="text-[11px] text-teal-600 font-medium">{apt.department?.name}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-slate-800">
                        {format(new Date(apt.appointmentDate), 'EEE, MMM d, yyyy')}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">{apt.timeSlot}</div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 max-w-xs truncate">
                      {apt.reason || 'General Consultation'}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${
                          apt.status === 'CONFIRMED'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : apt.status === 'SCHEDULED'
                            ? 'bg-sky-50 text-sky-700 border border-sky-200'
                            : apt.status === 'COMPLETED'
                            ? 'bg-slate-100 text-slate-700'
                            : 'bg-red-50 text-red-700 border border-red-200'
                        }`}
                      >
                        {apt.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-1 whitespace-nowrap">
                      {apt.status !== 'COMPLETED' && apt.status !== 'CANCELLED' && (
                        <>
                          <button
                            onClick={() => handleStatusChange(apt.id, 'COMPLETED')}
                            className="px-2 py-1 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors"
                          >
                            Complete
                          </button>
                          <button
                            onClick={() => handleStatusChange(apt.id, 'CANCELLED')}
                            className="px-2 py-1 rounded-md text-[10px] font-bold bg-red-50 text-red-700 hover:bg-red-100 transition-colors"
                          >
                            Cancel
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Book Appointment Modal with Double-Booking Prevention */}
      {isBookModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div className="flex items-center space-x-2">
                <CalendarDays className="w-5 h-5 text-medblue-600" />
                <h3 className="font-bold text-slate-800 text-base">Book Clinical Consultation</h3>
              </div>
              <button onClick={() => setIsBookModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 my-3 bg-sky-50 border border-sky-200 rounded-xl text-[11px] text-sky-800 flex items-start space-x-2">
              <ShieldAlert className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
              <span>
                <strong>ACID Integrity:</strong> Double-booking is strictly prohibited by relational constraints. If the selected physician is occupied during that slot, the system will reject the request.
              </span>
            </div>

            <form onSubmit={handleBookSubmit} className="space-y-4 pt-2 text-xs">
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
                      {p.fullName} ({p.patientId} - {p.bloodGroup})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Department</label>
                  <select
                    required
                    value={formData.departmentId}
                    onChange={(e) => {
                      const newDeptId = e.target.value;
                      const matchedDocs = doctors.filter((d) => d.departmentId === newDeptId);
                      setFormData({
                        ...formData,
                        departmentId: newDeptId,
                        doctorId: matchedDocs.length > 0 ? matchedDocs[0].id : formData.doctorId,
                      });
                    }}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white"
                  >
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Doctor</label>
                  <select
                    required
                    value={formData.doctorId}
                    onChange={(e) => setFormData({ ...formData, doctorId: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white font-semibold text-medblue-700"
                  >
                    {doctors.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name} ({d.department?.name})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Appointment Date</label>
                  <input
                    type="date"
                    required
                    value={formData.appointmentDate}
                    onChange={(e) => setFormData({ ...formData, appointmentDate: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white font-medium"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Time Slot</label>
                  <select
                    required
                    value={formData.timeSlot}
                    onChange={(e) => setFormData({ ...formData, timeSlot: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white font-mono"
                  >
                    {timeSlots.map((slot) => (
                      <option key={slot} value={slot}>
                        {slot}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Chief Complaint / Reason for Visit</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Follow-up for elevated blood pressure, chest tightness"
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsBookModalOpen(false)}
                  className="px-4 py-2 font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-bold text-white bg-medblue-600 hover:bg-medblue-700 rounded-xl shadow-md"
                >
                  Verify & Book Slot
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
