'use client';

import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import {
  Bell,
  Search,
  ShieldAlert,
  Sparkles,
  Server,
  CheckCircle2,
  Calendar,
} from 'lucide-react';
import Link from 'next/link';

export default function Navbar({ title }: { title?: string }) {
  const { data: session } = useSession();
  const [showNotifications, setShowNotifications] = useState(false);
  const role = (session?.user as any)?.role || 'PATIENT';

  const mockNotifications = [
    { id: 1, title: 'High NEWS2 Vitals Triage', time: '10m ago', unread: true },
    { id: 2, title: 'Prescription #RX-5001 Dispatched', time: '1h ago', unread: true },
    { id: 3, title: 'Lab Panel Completed (CBC)', time: '3h ago', unread: false },
  ];

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-20 shadow-xs">
      {/* Title & Status */}
      <div className="flex items-center space-x-4">
        <div>
          <h1 className="text-lg font-bold text-slate-800 tracking-tight">
            {title || 'Healthcare Control Center'}
          </h1>
          <div className="flex items-center space-x-2 text-[11px] text-slate-500">
            <span className="flex items-center text-teal-600 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse mr-1"></span>
              Live Clinical Node
            </span>
            <span>•</span>
            <span className="text-slate-400 font-mono">DBMS 3NF Architecture</span>
          </div>
        </div>
      </div>

      {/* Action shortcuts & Notifications */}
      <div className="flex items-center space-x-3">
        {/* AI Quick Button for Doctors */}
        {(role === 'DOCTOR' || role === 'ADMIN') && (
          <Link
            href="/ai-decision-support"
            className="flex items-center space-x-1.5 bg-gradient-to-r from-medblue-600 to-tealaccent-600 hover:from-medblue-700 hover:to-tealaccent-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-sm transition-all"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Decision Support</span>
          </Link>
        )}

        {/* DBMS Insights Button for Admins */}
        {(role === 'ADMIN' || role === 'DOCTOR') && (
          <Link
            href="/dbms-insights"
            className="flex items-center space-x-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors border border-slate-200"
          >
            <Server className="w-3.5 h-3.5 text-medblue-600" />
            <span>DBMS Insights</span>
          </Link>
        )}

        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors relative"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-teal-500"></span>
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">Clinical Alerts</span>
                <span className="text-[10px] text-teal-600 font-semibold bg-teal-50 px-2 py-0.5 rounded-full">
                  2 New
                </span>
              </div>
              <div className="divide-y divide-slate-100">
                {mockNotifications.map((n) => (
                  <div key={n.id} className={`px-4 py-2.5 hover:bg-slate-50 text-xs ${n.unread ? 'bg-sky-50/40' : ''}`}>
                    <p className="font-medium text-slate-800">{n.title}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{n.time}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
