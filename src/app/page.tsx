import Link from 'next/link';
import {
  Activity,
  BrainCircuit,
  Database,
  ShieldCheck,
  Stethoscope,
  Users,
  Calendar,
  FileCheck,
  ArrowRight,
  Sparkles,
  Layers,
  Lock,
  GitBranch,
} from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-medblue-500 selection:text-white">
      {/* Top Banner */}
      <div className="bg-navy-950 text-slate-300 px-4 py-2 text-xs border-b border-navy-800 flex items-center justify-between">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-tealaccent-400 animate-pulse"></span>
            <span className="font-medium text-white">MEDNEXUS Enterprise Engine</span>
            <span className="hidden sm:inline text-slate-500">• BTech DBMS Project-Based Learning</span>
          </div>
          <div className="flex items-center space-x-4 text-[11px]">
            <span className="text-tealaccent-400 font-mono">PostgreSQL 3NF</span>
            <span className="text-slate-500">|</span>
            <span className="text-medblue-400 font-mono">NEWS2 Clinical AI</span>
          </div>
        </div>
      </div>

      {/* Main Header / Nav */}
      <header className="border-b border-slate-200/80 bg-white/90 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-18 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-medblue-600 to-tealaccent-400 flex items-center justify-center text-white shadow-md shadow-medblue-500/20">
              <Activity className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <span className="font-extrabold text-xl tracking-tight text-slate-900">
                MEDNEXUS
              </span>
              <p className="text-[10px] font-semibold text-slate-400 tracking-wider">
                AI HEALTHCARE INTELLIGENCE
              </p>
            </div>
          </div>

          <nav className="hidden md:flex items-center space-x-8 text-sm font-semibold text-slate-600">
            <a href="#features" className="hover:text-medblue-600 transition-colors">Core Modules</a>
            <a href="#ai-engine" className="hover:text-medblue-600 transition-colors">Clinical AI</a>
            <a href="#dbms" className="hover:text-medblue-600 transition-colors">DBMS Architecture</a>
            <a href="#roles" className="hover:text-medblue-600 transition-colors">User Roles</a>
          </nav>

          <div className="flex items-center space-x-3">
            <Link
              href="/login"
              className="text-xs font-bold text-slate-700 hover:text-medblue-600 px-3.5 py-2 rounded-xl transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/login"
              className="text-xs font-bold bg-medblue-600 hover:bg-medblue-700 text-white px-4 py-2 rounded-xl shadow-md shadow-medblue-600/20 transition-all flex items-center space-x-1.5"
            >
              <span>Launch Demo</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-16 pb-20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center space-x-2 bg-medblue-50 border border-medblue-200/80 px-3.5 py-1.5 rounded-full text-xs font-bold text-medblue-700 shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-medblue-600" />
              <span>Full-Stack Production-Grade Hospital SaaS</span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
              Smarter Healthcare.{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-medblue-600 via-teal-500 to-medblue-700">
                Better Decisions.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
              An enterprise hospital information system with a normalized 3NF PostgreSQL database, role-based access control, real-time double-booking prevention, and an interactive AI clinical decision-support module.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Link
                href="/login"
                className="w-full sm:w-auto px-7 py-3.5 bg-gradient-to-r from-medblue-600 to-tealaccent-600 hover:from-medblue-700 hover:to-tealaccent-700 text-white rounded-xl font-bold text-sm shadow-xl shadow-medblue-600/25 transition-all flex items-center justify-center space-x-2"
              >
                <span>Access Clinical Workstation</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/login"
                className="w-full sm:w-auto px-7 py-3.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 rounded-xl font-bold text-sm shadow-xs transition-all flex items-center justify-center space-x-2"
              >
                <Database className="w-4 h-4 text-tealaccent-600" />
                <span>Explore 3NF Schema & DBMS</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Metric Cards Banner */}
      <section className="max-w-7xl mx-auto px-6 -mt-6 mb-16 w-full">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-lg shadow-slate-200/40">
          <div className="border-r border-slate-100 pr-4">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Database Norm</p>
            <p className="text-2xl font-extrabold text-slate-900 mt-1">3NF Verified</p>
            <p className="text-[11px] text-teal-600 font-medium mt-0.5">Zero Transitive Dependencies</p>
          </div>
          <div className="border-r border-slate-100 pr-4">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Security Engine</p>
            <p className="text-2xl font-extrabold text-slate-900 mt-1">NextAuth + BCrypt</p>
            <p className="text-[11px] text-medblue-600 font-medium mt-0.5">Role-Based Route Guards</p>
          </div>
          <div className="border-r border-slate-100 pr-4">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">AI Decision Engine</p>
            <p className="text-2xl font-extrabold text-slate-900 mt-1">NEWS2 & ICD-10</p>
            <p className="text-[11px] text-teal-600 font-medium mt-0.5">Transparent Clinical Rules</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Concurrency Control</p>
            <p className="text-2xl font-extrabold text-slate-900 mt-1">ACID Safe</p>
            <p className="text-[11px] text-indigo-600 font-medium mt-0.5">Strict Double-Booking Lock</p>
          </div>
        </div>
      </section>

      {/* Core Modules Grid */}
      <section id="features" className="max-w-7xl mx-auto px-6 py-12 w-full">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-xs font-bold uppercase tracking-widest text-medblue-600">Enterprise Capabilities</h2>
          <h3 className="text-3xl font-extrabold text-slate-900 mt-2">Engineered for Clinical & Academic Excellence</h3>
          <p className="text-sm text-slate-500 mt-2">Every module is fully wired to live database models with comprehensive CRUD workflows.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-xl bg-sky-50 text-medblue-600 flex items-center justify-center mb-4">
              <Users className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-slate-900 text-lg mb-2">Patient EHR Management</h4>
            <p className="text-xs text-slate-500 leading-relaxed mb-4">
              Comprehensive patient master records with blood group tracking, allergies, chronic history, emergency contacts, and linked clinical encounters.
            </p>
            <div className="text-[11px] font-mono text-slate-400">Atomic 3NF decomposition</div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-tealaccent-600 flex items-center justify-center mb-4">
              <BrainCircuit className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-slate-900 text-lg mb-2">AI Healthcare Decision Support</h4>
            <p className="text-xs text-slate-500 leading-relaxed mb-4">
              Algorithmic diagnostic differential synthesizer with vitals triage, allergy contraindication cross-referencing, red flag alerts, and mandatory clinician review.
            </p>
            <div className="text-[11px] font-mono text-slate-400">Deterministic Clinical Engine</div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-4">
              <Calendar className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-slate-900 text-lg mb-2">Appointment Scheduling</h4>
            <p className="text-xs text-slate-500 leading-relaxed mb-4">
              Doctor-department calendar dispatch with database-level composite unique constraint preventing simultaneous double-booking of any clinician.
            </p>
            <div className="text-[11px] font-mono text-slate-400">Race-condition protected</div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
              <FileCheck className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-slate-900 text-lg mb-2">Digital Prescriptions & PDF</h4>
            <p className="text-xs text-slate-500 leading-relaxed mb-4">
              Doctor-only prescription generation with multiple line items, dosage instructions, and client-side high-resolution PDF download.
            </p>
            <div className="text-[11px] font-mono text-slate-400">1-to-many ACID transaction</div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4">
              <Activity className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-slate-900 text-lg mb-2">Diagnostic Laboratory Reports</h4>
            <p className="text-xs text-slate-500 leading-relaxed mb-4">
              Structured pathology investigations (CBC, Lipid Panel, HbA1c, Thyroid) with reference interval evaluation and status flagging.
            </p>
            <div className="text-[11px] font-mono text-slate-400">JSONB parameter mapping</div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
              <Database className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-slate-900 text-lg mb-2">DBMS Academic Insights</h4>
            <p className="text-xs text-slate-500 leading-relaxed mb-4">
              Interactive ER diagram visualization, 1NF to 3NF proof walkthrough, live SQL query playground, ACID demonstrations, and MongoDB comparison.
            </p>
            <div className="text-[11px] font-mono text-slate-400">BTech PBL showcase</div>
          </div>
        </div>
      </section>

      {/* Role Access Matrix */}
      <section id="roles" className="bg-white border-y border-slate-200 py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h3 className="text-2xl font-extrabold text-slate-900">Role-Based Access Control Matrix</h3>
            <p className="text-xs text-slate-500 mt-1">Granular role authorization enforced on both middleware and API endpoints.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="border border-purple-200 bg-purple-50/40 rounded-2xl p-5">
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-purple-600 text-white uppercase">ADMIN</span>
              <h5 className="font-bold text-slate-900 mt-3 text-sm">Full System Control</h5>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Hospital KPIs, doctor onboarding, bed analytics, DBMS insights, and complete audit trail inspection.
              </p>
              <div className="mt-4 pt-3 border-t border-purple-100 text-[11px] font-mono text-purple-700">
                admin@mednexus.com
              </div>
            </div>

            <div className="border border-sky-200 bg-sky-50/40 rounded-2xl p-5">
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-medblue-600 text-white uppercase">DOCTOR</span>
              <h5 className="font-bold text-slate-900 mt-3 text-sm">Clinical & AI Workstation</h5>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Consultation queue, AI Decision Support inference, prescription issuance, and clinical sign-off notes.
              </p>
              <div className="mt-4 pt-3 border-t border-sky-100 text-[11px] font-mono text-medblue-700">
                doctor@mednexus.com
              </div>
            </div>

            <div className="border border-teal-200 bg-teal-50/40 rounded-2xl p-5">
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-tealaccent-600 text-white uppercase">RECEPTIONIST</span>
              <h5 className="font-bold text-slate-900 mt-3 text-sm">Patient & Front Desk</h5>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Patient EHR registration, appointment booking, slot conflict resolution, and daily department schedule.
              </p>
              <div className="mt-4 pt-3 border-t border-teal-100 text-[11px] font-mono text-teal-700">
                reception@mednexus.com
              </div>
            </div>

            <div className="border border-emerald-200 bg-emerald-50/40 rounded-2xl p-5">
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-600 text-white uppercase">PATIENT</span>
              <h5 className="font-bold text-slate-900 mt-3 text-sm">Personal Health Portal</h5>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Personal appointment history, active prescription slips (PDF download), and diagnostic laboratory results.
              </p>
              <div className="mt-4 pt-3 border-t border-emerald-100 text-[11px] font-mono text-emerald-700">
                patient@mednexus.com
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-navy-950 text-slate-400 py-12 border-t border-navy-900 mt-auto">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-medblue-600 flex items-center justify-center text-white font-bold">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <p className="text-white font-bold">MEDNEXUS – AI Healthcare Intelligence</p>
              <p className="text-[10px] text-slate-500">BTech DBMS Project-Based Learning System</p>
            </div>
          </div>
          <p className="text-slate-500">
            Engineered with Next.js 14, PostgreSQL, Prisma ORM, and Tailwind CSS.
          </p>
        </div>
      </footer>
    </div>
  );
}
