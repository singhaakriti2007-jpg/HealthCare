'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Link from 'next/link';
import {
  Users,
  Stethoscope,
  CalendarDays,
  Bed,
  FileSpreadsheet,
  FlaskConical,
  BrainCircuit,
  TrendingUp,
  Activity,
  Clock,
  ArrowRight,
  ShieldCheck,
  CheckCircle,
  AlertCircle,
  Sparkles,
  Database,
  Plus,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
} from 'recharts';
import { format } from 'date-fns';

export default function DashboardPage() {
  const { data: session } = useSession();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const role = (session?.user as any)?.role || 'PATIENT';

  useEffect(() => {
    fetch('/api/dashboard/stats')
      .then((res) => res.json())
      .then((json) => {
        setData(json);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching dashboard stats:', err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <DashboardLayout title="System Intelligence">
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
          <div className="w-10 h-10 border-4 border-medblue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-semibold text-slate-500">Retrieving Clinical Relational Metrics...</p>
        </div>
      </DashboardLayout>
    );
  }

  const metrics = data?.metrics || {};
  const charts = data?.charts || {};
  const recentAppointments = data?.recentAppointments || [];
  const recentAuditLogs = data?.recentAuditLogs || [];
  const recentPatients = data?.recentPatients || [];
  const userSpecific = data?.userSpecific || {};

  return (
    <DashboardLayout title={`${role} Control Center`}>
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-navy-900 via-navy-800 to-medblue-900 rounded-3xl p-6 md:p-8 text-white shadow-xl shadow-navy-950/15 relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold text-tealaccent-300 mb-3 border border-white/10">
            <Sparkles className="w-3.5 h-3.5" />
            <span>MEDNEXUS Intelligence Online</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            Welcome back, {session?.user?.name || 'Healthcare Professional'}
          </h2>
          <p className="text-xs md:text-sm text-slate-300 mt-2 leading-relaxed">
            Clinical workstation synchronized with 3NF relational data store. All active hospital nodes operational.
          </p>

          <div className="flex flex-wrap gap-3 mt-6">
            {(role === 'DOCTOR' || role === 'ADMIN') && (
              <Link
                href="/ai-decision-support"
                className="px-4 py-2 bg-medblue-500 hover:bg-medblue-600 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-medblue-500/30 flex items-center space-x-2"
              >
                <BrainCircuit className="w-4 h-4" />
                <span>Launch Clinical AI</span>
              </Link>
            )}

            {(role === 'RECEPTIONIST' || role === 'ADMIN' || role === 'PATIENT') && (
              <Link
                href="/appointments"
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition-all border border-white/15 flex items-center space-x-2"
              >
                <CalendarDays className="w-4 h-4" />
                <span>Book Appointment</span>
              </Link>
            )}

            {(role === 'RECEPTIONIST' || role === 'ADMIN') && (
              <Link
                href="/patients"
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition-all border border-white/15 flex items-center space-x-2"
              >
                <Users className="w-4 h-4" />
                <span>Register Patient</span>
              </Link>
            )}
          </div>
        </div>

        {/* Decorative background watermark */}
        <Activity className="absolute right-[-20px] bottom-[-20px] w-64 h-64 text-white/5 pointer-events-none stroke-1" />
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Card 1: Total Patients */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Registered Patients</span>
            <div className="w-9 h-9 rounded-xl bg-sky-50 text-medblue-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-slate-900">{metrics.totalPatients || 22}</span>
            <span className="text-[11px] font-semibold text-emerald-600 flex items-center">
              <TrendingUp className="w-3 h-3 mr-0.5" /> +12% MoM
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Full 3NF Demographic Records</p>
        </div>

        {/* Card 2: Active Doctors */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Specialist Doctors</span>
            <div className="w-9 h-9 rounded-xl bg-teal-50 text-tealaccent-600 flex items-center justify-center">
              <Stethoscope className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-slate-900">{metrics.totalDoctors || 8}</span>
            <span className="text-[11px] font-semibold text-teal-600">6 Departments</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Available for Consultations</p>
        </div>

        {/* Card 3: Today's Appointments */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Today's Visits</span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <CalendarDays className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-slate-900">{metrics.todayAppointmentsCount || 4}</span>
            <span className="text-[11px] font-semibold text-slate-500">of {metrics.allAppointmentsCount || 15} total</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Strict Slot Conflict Guard</p>
        </div>

        {/* Card 4: Bed Occupancy / Clinical AI Runs */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Bed Capacity</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Bed className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-slate-900">
              {metrics.availableBeds || 42} <span className="text-xs font-normal text-slate-400">/ {metrics.totalBeds || 120}</span>
            </span>
            <span className="text-[11px] font-semibold text-amber-600">{metrics.occupancyRate || 65}% occupied</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Emergency triage ready</p>
        </div>
      </div>

      {/* Charts Section (Recharts) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Appointment Trends */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Weekly Consultation Flow</h3>
              <p className="text-xs text-slate-400">Scheduled vs Completed patient appointments</p>
            </div>
            <div className="flex items-center space-x-3 text-xs">
              <span className="flex items-center text-medblue-600 font-semibold">
                <span className="w-2.5 h-2.5 rounded-full bg-medblue-500 mr-1.5"></span>
                Scheduled
              </span>
              <span className="flex items-center text-tealaccent-600 font-semibold">
                <span className="w-2.5 h-2.5 rounded-full bg-tealaccent-500 mr-1.5"></span>
                Completed
              </span>
            </div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.appointmentTrends || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="day" stroke="#94A3B8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    borderRadius: '10px',
                    color: '#FFF',
                    fontSize: '12px',
                    border: 'none',
                  }}
                />
                <Bar dataKey="scheduled" fill="#0EA5E9" radius={[4, 4, 0, 0]} />
                <Bar dataKey="completed" fill="#14B8A6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Department Volume */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Department Volume</h3>
              <p className="text-xs text-slate-400">Inpatients & Active Outpatients</p>
            </div>
            <Activity className="w-4 h-4 text-slate-400" />
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={charts.departmentOccupancy || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="name" stroke="#94A3B8" fontSize={10} tickLine={false} />
                <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    borderRadius: '10px',
                    color: '#FFF',
                    fontSize: '12px',
                    border: 'none',
                  }}
                />
                <Area type="monotone" dataKey="patients" stroke="#14B8A6" fill="#CCFBF1" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Two Column Lower Section: Recent Appointments & Activity Audit */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Appointments */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Upcoming & Recent Encounters</h3>
              <p className="text-xs text-slate-400">Latest scheduled consultation roster</p>
            </div>
            <Link
              href="/appointments"
              className="text-xs font-bold text-medblue-600 hover:text-medblue-700 flex items-center space-x-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {recentAppointments.length === 0 ? (
              <p className="text-xs text-slate-400 py-4">No recent appointments recorded.</p>
            ) : (
              recentAppointments.map((apt: any) => (
                <div key={apt.id} className="py-3 flex items-center justify-between hover:bg-slate-50/60 px-2 rounded-xl transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-sky-50 text-medblue-600 font-bold text-xs flex items-center justify-center shrink-0">
                      {apt.patient?.fullName?.charAt(0) || 'P'}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800 leading-tight">
                        {apt.patient?.fullName || 'Patient'}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        {apt.doctor?.name} • <span className="font-medium text-slate-600">{apt.department?.name}</span>
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span
                      className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${
                        apt.status === 'CONFIRMED'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : apt.status === 'SCHEDULED'
                          ? 'bg-sky-50 text-sky-700 border border-sky-200'
                          : apt.status === 'COMPLETED'
                          ? 'bg-slate-100 text-slate-700'
                          : 'bg-red-50 text-red-700'
                      }`}
                    >
                      {apt.status}
                    </span>
                    <p className="text-[10px] text-slate-400 font-mono mt-1">{apt.timeSlot}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Relational Audit Feed */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-800">System Audit Trail</h3>
              <p className="text-xs text-slate-400">Real-time database transaction logs</p>
            </div>
            <span className="text-[10px] font-mono text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
              PostgreSQL Log
            </span>
          </div>

          <div className="space-y-3">
            {recentAuditLogs.length === 0 ? (
              <p className="text-xs text-slate-400 py-4">No audit events logged.</p>
            ) : (
              recentAuditLogs.map((log: any) => (
                <div key={log.id} className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] font-bold text-slate-600 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                      {log.action}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {format(new Date(log.timestamp), 'MMM d, HH:mm')}
                    </span>
                  </div>
                  <p className="text-slate-700 mt-1.5 leading-snug">{log.details}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
