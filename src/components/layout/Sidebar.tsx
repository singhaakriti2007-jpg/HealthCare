'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import {
  LayoutDashboard,
  Users,
  UserCog,
  CalendarDays,
  BrainCircuit,
  FileSpreadsheet,
  FlaskConical,
  Database,
  LogOut,
  Activity,
  ShieldCheck,
  Stethoscope,
  ChevronRight,
} from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const role = (session?.user as any)?.role || 'PATIENT';

  const navItems = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
      roles: ['ADMIN', 'DOCTOR', 'RECEPTIONIST', 'PATIENT'],
    },
    {
      name: 'Patients',
      href: '/patients',
      icon: Users,
      roles: ['ADMIN', 'DOCTOR', 'RECEPTIONIST'],
    },
    {
      name: 'Doctors',
      href: '/doctors',
      icon: Stethoscope,
      roles: ['ADMIN', 'DOCTOR', 'RECEPTIONIST', 'PATIENT'],
    },
    {
      name: 'Appointments',
      href: '/appointments',
      icon: CalendarDays,
      roles: ['ADMIN', 'DOCTOR', 'RECEPTIONIST', 'PATIENT'],
    },
    {
      name: 'AI Decision Support',
      href: '/ai-decision-support',
      icon: BrainCircuit,
      badge: 'AI Engine',
      roles: ['ADMIN', 'DOCTOR'],
    },
    {
      name: 'Prescriptions',
      href: '/prescriptions',
      icon: FileSpreadsheet,
      roles: ['ADMIN', 'DOCTOR', 'RECEPTIONIST', 'PATIENT'],
    },
    {
      name: 'Lab Reports',
      href: '/lab-reports',
      icon: FlaskConical,
      roles: ['ADMIN', 'DOCTOR', 'RECEPTIONIST', 'PATIENT'],
    },
    {
      name: 'DBMS Insights',
      href: '/dbms-insights',
      icon: Database,
      badge: '3NF',
      roles: ['ADMIN', 'DOCTOR'],
    },
  ];

  const filteredNav = navItems.filter((item) => item.roles.includes(role));

  const roleBadgeColor = {
    ADMIN: 'bg-purple-100 text-purple-800 border-purple-200',
    DOCTOR: 'bg-sky-100 text-sky-800 border-sky-200',
    RECEPTIONIST: 'bg-teal-100 text-teal-800 border-teal-200',
    PATIENT: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  }[role as 'ADMIN' | 'DOCTOR' | 'RECEPTIONIST' | 'PATIENT'] || 'bg-slate-100 text-slate-800';

  return (
    <aside className="w-64 bg-navy-900 text-slate-200 flex flex-col shrink-0 h-screen sticky top-0 border-r border-navy-800 select-none z-30">
      {/* Brand Header */}
      <div className="p-5 border-b border-navy-800 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center space-x-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-medblue-600 to-tealaccent-400 flex items-center justify-center text-white shadow-lg shadow-medblue-500/20 group-hover:scale-105 transition-transform">
            <Activity className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <div className="font-bold tracking-tight text-white text-lg flex items-center gap-1.5">
              MEDNEXUS
            </div>
            <p className="text-[10px] text-slate-400 font-medium tracking-wide">
              AI HEALTHCARE INTELLIGENCE
            </p>
          </div>
        </Link>
      </div>

      {/* Role Pill Banner */}
      <div className="px-5 py-3 border-b border-navy-800/60 bg-navy-950/40">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-400 font-medium">Session Role</span>
          <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold tracking-wide border uppercase ${roleBadgeColor}`}>
            {role}
          </span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
        {filteredNav.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-150 group ${
                isActive
                  ? 'bg-medblue-600 text-white shadow-md shadow-medblue-600/30 font-semibold'
                  : 'text-slate-300 hover:bg-navy-800/80 hover:text-white'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Icon
                  className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                    isActive ? 'text-white' : 'text-slate-400 group-hover:text-medblue-400'
                  }`}
                />
                <span>{item.name}</span>
              </div>
              {item.badge ? (
                <span
                  className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : 'bg-tealaccent-500/20 text-tealaccent-300 border border-tealaccent-500/30'
                  }`}
                >
                  {item.badge}
                </span>
              ) : (
                isActive && <ChevronRight className="w-3.5 h-3.5 text-white/70" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* User Footer Profile & SignOut */}
      <div className="p-4 border-t border-navy-800 bg-navy-950/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 overflow-hidden">
            <div className="w-9 h-9 rounded-full bg-slate-700 border border-navy-700 flex items-center justify-center font-semibold text-xs text-white shrink-0 overflow-hidden">
              {session?.user?.name ? session.user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-semibold text-white truncate leading-tight">
                {session?.user?.name || 'Authorized User'}
              </p>
              <p className="text-[10px] text-slate-400 truncate">
                {session?.user?.email || 'user@mednexus.com'}
              </p>
            </div>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            title="Sign Out"
            className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-navy-800 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
