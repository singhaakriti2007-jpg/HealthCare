'use client';

import React, { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import {
  Activity,
  ShieldCheck,
  Stethoscope,
  User,
  KeyRound,
  Mail,
  Lock,
  ArrowRight,
  Sparkles,
  Database,
  Info,
} from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [resetSuccess, setResetSuccess] = useState(false);

  const demoAccounts = [
    {
      role: 'ADMIN',
      title: 'Hospital Admin',
      email: 'admin@mednexus.com',
      password: 'Admin@123',
      icon: ShieldCheck,
      color: 'border-purple-200 bg-purple-50/60 hover:bg-purple-100/80 text-purple-900',
      badge: 'bg-purple-600 text-white',
    },
    {
      role: 'DOCTOR',
      title: 'Attending Doctor',
      email: 'doctor@mednexus.com',
      password: 'Doctor@123',
      icon: Stethoscope,
      color: 'border-sky-200 bg-sky-50/60 hover:bg-sky-100/80 text-sky-900',
      badge: 'bg-medblue-600 text-white',
    },
    {
      role: 'RECEPTIONIST',
      title: 'Front Desk / Staff',
      email: 'reception@mednexus.com',
      password: 'Reception@123',
      icon: User,
      color: 'border-teal-200 bg-teal-50/60 hover:bg-teal-100/80 text-teal-900',
      badge: 'bg-tealaccent-600 text-white',
    },
    {
      role: 'PATIENT',
      title: 'Patient Portal',
      email: 'patient@mednexus.com',
      password: 'Patient@123',
      icon: Activity,
      color: 'border-emerald-200 bg-emerald-50/60 hover:bg-emerald-100/80 text-emerald-900',
      badge: 'bg-emerald-600 text-white',
    },
  ];

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please enter both email and password');
      return;
    }

    setLoading(true);
    try {
      const res = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (res?.error) {
        toast.error(res.error || 'Authentication failed. Please verify credentials.');
      } else {
        toast.success('Welcome back to MEDNEXUS');
        router.push('/dashboard');
        router.refresh();
      }
    } catch (err) {
      toast.error('Network error occurred during authentication');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setLoading(true);
    try {
      const res = await signIn('credentials', {
        email: demoEmail,
        password: demoPass,
        redirect: false,
      });

      if (res?.error) {
        toast.error(res.error);
      } else {
        toast.success(`Signed in as ${demoEmail}`);
        router.push('/dashboard');
        router.refresh();
      }
    } catch (err) {
      toast.error('Failed to log in with demo account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background medical grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:3rem_3rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        {/* Brand Icon */}
        <div className="flex justify-center">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-medblue-600 to-tealaccent-400 flex items-center justify-center text-white shadow-xl shadow-medblue-500/25">
            <Activity className="w-8 h-8 stroke-[2.5]" />
          </div>
        </div>
        <h2 className="mt-4 text-center text-3xl font-extrabold text-slate-900 tracking-tight">
          MEDNEXUS
        </h2>
        <p className="mt-1 text-center text-sm font-medium text-slate-500">
          Smarter Healthcare. Better Decisions.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl relative z-10 px-4">
        <div className="bg-white py-8 px-6 shadow-xl shadow-slate-200/50 rounded-2xl sm:px-10 border border-slate-100">
          {/* Quick Demo Switcher */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-medblue-600" />
                1-Click Demo Evaluation Profiles
              </span>
              <span className="text-[11px] font-mono text-tealaccent-600 font-semibold bg-tealaccent-50 px-2 py-0.5 rounded-full border border-tealaccent-200/60">
                Pre-seeded
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              {demoAccounts.map((demo) => {
                const Icon = demo.icon;
                return (
                  <button
                    key={demo.role}
                    type="button"
                    onClick={() => handleQuickLogin(demo.email, demo.password)}
                    className={`flex items-center space-x-3 p-3 rounded-xl border text-left transition-all ${demo.color} group`}
                  >
                    <div className="w-8 h-8 rounded-lg bg-white shadow-xs flex items-center justify-center shrink-0">
                      <Icon className="w-4 h-4 text-slate-700 group-hover:scale-110 transition-transform" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold leading-tight">{demo.title}</p>
                      <p className="text-[10px] opacity-75 font-mono truncate">{demo.role}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-3 text-slate-400 font-medium">Or enter credentials</span>
            </div>
          </div>

          {/* Form */}
          <form className="space-y-4" onSubmit={handleLogin}>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Institutional Email
              </label>
              <div className="relative rounded-xl shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="doctor@mednexus.com"
                  className="block w-full pl-10 pr-3 py-2.5 sm:text-sm border border-slate-200 rounded-xl bg-slate-50/50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-medblue-500 focus:border-transparent transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowForgotModal(true)}
                  className="text-xs font-medium text-medblue-600 hover:text-medblue-500"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative rounded-xl shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full pl-10 pr-3 py-2.5 sm:text-sm border border-slate-200 rounded-xl bg-slate-50/50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-medblue-500 focus:border-transparent transition-all"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-xl shadow-md text-sm font-bold text-white bg-medblue-600 hover:bg-medblue-700 focus:outline-hidden focus:ring-2 focus:ring-offset-2 focus:ring-medblue-500 disabled:opacity-50 transition-all duration-150"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign In to System</span>
                  <ArrowRight className="ml-2 w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Registration link */}
          <div className="mt-6 text-center text-xs text-slate-500">
            Need a patient portal account?{' '}
            <Link href="/register" className="font-semibold text-medblue-600 hover:text-medblue-500">
              Register as New Patient
            </Link>
          </div>
        </div>

        {/* DBMS Footer Notice */}
        <div className="mt-6 flex items-center justify-center space-x-2 text-xs text-slate-400">
          <Database className="w-3.5 h-3.5 text-tealaccent-600" />
          <span>PostgreSQL 3NF Schema with Parametric Sanitization & Audit Trails</span>
        </div>
      </div>

      {/* Forgot Password Modal (Simulated) */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-sky-50 text-medblue-600 flex items-center justify-center">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-base">Reset Access Key</h3>
                <p className="text-xs text-slate-500">Simulated security token recovery protocol</p>
              </div>
            </div>

            {resetSuccess ? (
              <div className="py-4 text-center">
                <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <p className="text-sm font-bold text-slate-800">Password Reset Instructions Dispatched</p>
                <p className="text-xs text-slate-500 mt-1">
                  A secure one-time cryptographic reset token has been routed to <strong>{forgotEmail}</strong>.
                </p>
                <button
                  onClick={() => {
                    setShowForgotModal(false);
                    setResetSuccess(false);
                  }}
                  className="mt-5 w-full py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800"
                >
                  Return to Login
                </button>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!forgotEmail) {
                    toast.error('Please enter your email');
                    return;
                  }
                  setResetSuccess(true);
                  toast.success('Reset email simulated successfully');
                }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Institutional / Registered Email
                  </label>
                  <input
                    type="email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="doctor@mednexus.com"
                    className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-medblue-500 focus:outline-hidden"
                    required
                  />
                </div>
                <div className="flex items-center justify-end space-x-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(false)}
                    className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-xs font-bold text-white bg-medblue-600 hover:bg-medblue-700 rounded-xl shadow-xs"
                  >
                    Send Reset Token
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
