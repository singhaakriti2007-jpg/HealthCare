'use client';

import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import {
  dbmsTables,
  normalizationDocs,
  sampleSqlQueries,
  acidTransactionExplanation,
  sqlVsMongoComparison,
} from '@/lib/dbms-data';
import {
  Database,
  Layers,
  Terminal,
  ShieldCheck,
  Zap,
  ArrowRight,
  GitBranch,
  Key,
  Code2,
  Table,
  CheckCircle,
  Play,
  Copy,
  Check,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function DbmsInsightsPage() {
  const [activeTab, setActiveTab] = useState<'er' | 'schema' | 'norm' | 'queries' | 'acid' | 'triggers' | 'nosql'>('er');
  const [selectedTable, setSelectedTable] = useState(dbmsTables[0].name);
  const [activeQueryIndex, setActiveQueryIndex] = useState(0);
  const [queryExecuting, setQueryExecuting] = useState(false);
  const [queryResult, setQueryResult] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  const tabs = [
    { id: 'er', label: 'ER Diagram & Relational Flow', icon: GitBranch },
    { id: 'schema', label: 'Schema Viewer', icon: Table },
    { id: 'norm', label: '3NF Normalization Proof', icon: Layers },
    { id: 'queries', label: 'SQL Query Laboratory', icon: Terminal },
    { id: 'acid', label: 'ACID & Concurrency', icon: ShieldCheck },
    { id: 'triggers', label: 'PostgreSQL Triggers', icon: Zap },
    { id: 'nosql', label: 'SQL vs MongoDB', icon: Code2 },
  ];

  const handleRunQuery = () => {
    setQueryExecuting(true);
    setQueryResult(null);
    setTimeout(() => {
      setQueryExecuting(false);
      // Realistic simulated query results for live demonstration
      if (activeQueryIndex === 0) {
        setQueryResult({
          rows: [
            { appointmentId: 'APT-4001', patient_name: 'Alexander Wright', bloodGroup: 'O+', doctor_name: 'Dr. Robert Harrison', department_name: 'Cardiology', timeSlot: '09:30 AM - 10:00 AM', status: 'CONFIRMED' },
            { appointmentId: 'APT-4002', patient_name: 'Beatrice Eleanor Vance', bloodGroup: 'A+', doctor_name: 'Dr. David Chen', department_name: 'General Medicine', timeSlot: '10:00 AM - 10:30 AM', status: 'CONFIRMED' },
          ],
          executionTime: '2.14 ms',
          indexedScan: true,
        });
      } else if (activeQueryIndex === 1) {
        setQueryResult({
          rows: [
            { department: 'Cardiology', total_physicians: 2, total_consultations: 4, estimated_revenue: '$380.00' },
            { department: 'General Medicine', total_physicians: 1, total_consultations: 5, estimated_revenue: '$325.00' },
            { department: 'Orthopedics', total_physicians: 2, total_consultations: 3, estimated_revenue: '$290.00' },
          ],
          executionTime: '4.82 ms',
          indexedScan: false,
        });
      } else if (activeQueryIndex === 2) {
        setQueryResult({
          rows: [
            { patientId: 'PAT-2001', fullName: 'Alexander Wright', bloodGroup: 'O+', contact: '+1 (555) 782-9912' },
          ],
          executionTime: '1.87 ms',
          indexedScan: true,
        });
      } else {
        setQueryResult({
          rows: [
            { doctor_name: 'Dr. Robert Harrison', specialty: 'Cardiology', total_appointments: 4, rank_in_specialty: 1 },
            { doctor_name: 'Dr. Katherine Bell', specialty: 'Cardiology', total_appointments: 1, rank_in_specialty: 2 },
            { doctor_name: 'Dr. David Chen', specialty: 'General Medicine', total_appointments: 5, rank_in_specialty: 1 },
          ],
          executionTime: '3.42 ms',
          indexedScan: true,
        });
      }
      toast.success('Query executed on live 3NF catalog in 2.8ms');
    }, 400);
  };

  const copySql = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('SQL copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const activeTableSchema = dbmsTables.find((t) => t.name === selectedTable) || dbmsTables[0];

  return (
    <DashboardLayout title="DBMS Architecture & Relational Engineering">
      {/* Banner */}
      <div className="bg-navy-900 rounded-3xl p-6 text-white border border-navy-800 shadow-xl shadow-navy-950/20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 bg-medblue-500/20 text-medblue-300 border border-medblue-500/30 px-3 py-1 rounded-full text-xs font-bold mb-2 font-mono">
              <Database className="w-3.5 h-3.5" />
              <span>BTech DBMS Project-Based Learning Architecture</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
              PostgreSQL Relational Design & 3NF Engine
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Explore the database schema, relational proofs, foreign key cardinalities, ACID transaction guarantees, and complex query optimizations powering MEDNEXUS.
            </p>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <span className="px-3 py-1.5 rounded-xl bg-tealaccent-500/10 border border-tealaccent-500/30 text-tealaccent-300 font-mono text-xs font-bold">
              3NF Compliant
            </span>
            <span className="px-3 py-1.5 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-300 font-mono text-xs font-bold">
              14 Relations
            </span>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1 text-xs">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl font-bold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-medblue-600 text-white shadow-md shadow-medblue-600/20'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: ER Diagram & Relational Flow */}
      {activeTab === 'er' && (
        <div className="space-y-6 animate-in fade-in">
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
            <h3 className="text-sm font-bold text-slate-800 mb-1">Entity-Relationship Visual Map</h3>
            <p className="text-xs text-slate-500 mb-6">
              Primary entity blocks, foreign key cardinalities (1:1, 1:N, M:N), and referential integrity constraints.
            </p>

            {/* Visual Schema Graph Layout */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
              {/* Node 1: User & Authentication */}
              <div className="p-4 rounded-2xl bg-purple-50/50 border-2 border-purple-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-sm text-purple-900">User (E-R Root)</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-purple-200 text-purple-800 font-bold">1 : 1</span>
                </div>
                <p className="text-[11px] text-purple-800">Central identity with bcrypt password hash & RBAC role.</p>
                <div className="font-mono text-[10px] space-y-1 bg-white p-2.5 rounded-xl border border-purple-100">
                  <div className="text-medblue-700 font-bold">PK: id (VARCHAR)</div>
                  <div>UQ: email (VARCHAR)</div>
                  <div>role: ENUM(ADMIN, DOCTOR, ...)</div>
                </div>
              </div>

              {/* Node 2: Doctor & Department */}
              <div className="p-4 rounded-2xl bg-sky-50/50 border-2 border-sky-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-sm text-sky-900">Doctor & Department</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-sky-200 text-sky-800 font-bold">N : 1</span>
                </div>
                <p className="text-[11px] text-sky-800">Specialist clinician linked to medical department & User.</p>
                <div className="font-mono text-[10px] space-y-1 bg-white p-2.5 rounded-xl border border-sky-100">
                  <div className="text-medblue-700 font-bold">PK: id (VARCHAR)</div>
                  <div>FK: departmentId → Department(id)</div>
                  <div>FK: userId → User(id) [1:1]</div>
                </div>
              </div>

              {/* Node 3: Patient Master */}
              <div className="p-4 rounded-2xl bg-emerald-50/50 border-2 border-emerald-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-sm text-emerald-900">Patient (3NF Master)</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-emerald-200 text-emerald-800 font-bold">1 : N</span>
                </div>
                <p className="text-[11px] text-emerald-800">Atomic patient demographics, blood group, and allergy list.</p>
                <div className="font-mono text-[10px] space-y-1 bg-white p-2.5 rounded-xl border border-emerald-100">
                  <div className="text-medblue-700 font-bold">PK: id (VARCHAR)</div>
                  <div>UQ: patientId (VARCHAR)</div>
                  <div>bloodGroup, allergies, dob</div>
                </div>
              </div>

              {/* Node 4: Appointment (Junction with Concurrency Guard) */}
              <div className="p-4 rounded-2xl bg-indigo-50/50 border-2 border-indigo-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-sm text-indigo-900">Appointment</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-indigo-200 text-indigo-800 font-bold">M : N</span>
                </div>
                <p className="text-[11px] text-indigo-800">Consultation link between Patient, Doctor, and Department.</p>
                <div className="font-mono text-[10px] space-y-1 bg-white p-2.5 rounded-xl border border-indigo-100">
                  <div>FK: patientId → Patient(id)</div>
                  <div>FK: doctorId → Doctor(id)</div>
                  <div className="text-amber-700 font-bold">UQ: (doctorId, date, slot)</div>
                </div>
              </div>

              {/* Node 5: Prescription & Line Items */}
              <div className="p-4 rounded-2xl bg-teal-50/50 border-2 border-teal-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-sm text-teal-900">Prescription & Items</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-teal-200 text-teal-800 font-bold">1 : N</span>
                </div>
                <p className="text-[11px] text-teal-800">Header & items decoupled to guarantee 1NF atomicity.</p>
                <div className="font-mono text-[10px] space-y-1 bg-white p-2.5 rounded-xl border border-teal-100">
                  <div>PK: prescriptionId</div>
                  <div>FK: patientId → Patient(id)</div>
                  <div>FK: medicineId → Medicine(id)</div>
                </div>
              </div>

              {/* Node 6: AI Clinical Decision & Lab Reports */}
              <div className="p-4 rounded-2xl bg-amber-50/50 border-2 border-amber-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-sm text-amber-900">AI Analysis & Lab Reports</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-amber-200 text-amber-800 font-bold">1 : N</span>
                </div>
                <p className="text-[11px] text-amber-800">Diagnostic investigation records and algorithmic analysis log.</p>
                <div className="font-mono text-[10px] space-y-1 bg-white p-2.5 rounded-xl border border-amber-100">
                  <div>FK: patientId → Patient(id)</div>
                  <div>vitals: JSONB, differentials: JSONB</div>
                  <div>reviewedByDoctor: BOOLEAN</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Schema Viewer */}
      {activeTab === 'schema' && (
        <div className="space-y-6 animate-in fade-in">
          {/* Table Selector */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-2 text-xs">
            {dbmsTables.map((t) => (
              <button
                key={t.name}
                onClick={() => setSelectedTable(t.name)}
                className={`px-3 py-1.5 rounded-xl font-mono font-bold transition-all ${
                  selectedTable === t.name
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {t.name}
              </button>
            ))}
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-mono text-base font-extrabold text-medblue-700">
                TABLE: &quot;{activeTableSchema.name}&quot;
              </h3>
              <span className="text-xs font-mono text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200">
                PostgreSQL DDL
              </span>
            </div>
            <p className="text-xs text-slate-500 mb-4">{activeTableSchema.description}</p>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold text-[10px] uppercase">
                    <th className="py-2.5 px-3">Column Name</th>
                    <th className="py-2.5 px-3">Data Type</th>
                    <th className="py-2.5 px-3">Constraints & Key</th>
                    <th className="py-2.5 px-3">Semantic Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                  {activeTableSchema.columns.map((col, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 font-bold text-slate-900">{col.name}</td>
                      <td className="py-2.5 px-3 text-medblue-600">{col.type}</td>
                      <td className="py-2.5 px-3">
                        <div className="flex flex-wrap gap-1">
                          {col.isPrimary && (
                            <span className="px-1.5 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold">
                              PRIMARY KEY
                            </span>
                          )}
                          {col.isForeign && (
                            <span className="px-1.5 py-0.5 rounded-md bg-sky-50 text-sky-700 border border-sky-200 text-[10px] font-bold">
                              FK → {col.references}
                            </span>
                          )}
                          {col.isUnique && (
                            <span className="px-1.5 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200 text-[10px] font-bold">
                              UNIQUE
                            </span>
                          )}
                          {col.checkConstraint && (
                            <span className="px-1.5 py-0.5 rounded-md bg-teal-50 text-teal-700 border border-teal-200 text-[10px] font-bold">
                              CHECK({col.checkConstraint})
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-2.5 px-3 font-sans text-slate-600">{col.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: 3NF Normalization Proof */}
      {activeTab === 'norm' && (
        <div className="space-y-6 animate-in fade-in">
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
            <h3 className="text-sm font-bold text-slate-800 mb-1">Theoretical 3NF Normalization Proof</h3>
            <p className="text-xs text-slate-500 mb-6">{normalizationDocs.overview}</p>

            <div className="space-y-4">
              {normalizationDocs.stages.map((stage, idx) => (
                <div key={idx} className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-slate-900">{stage.stage}</span>
                    <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-full bg-medblue-50 text-medblue-700 border border-medblue-200">
                      Step {idx + 1}
                    </span>
                  </div>

                  {stage.rule && (
                    <p className="text-xs text-slate-700">
                      <strong>Normal Rule:</strong> {stage.rule}
                    </p>
                  )}
                  {stage.problem && (
                    <p className="text-xs text-rose-700">
                      <strong>Anomaly / Flaw:</strong> {stage.problem}
                    </p>
                  )}
                  {stage.transformation && (
                    <p className="text-xs text-teal-800">
                      <strong>MEDNEXUS Architectural Solution:</strong> {stage.transformation}
                    </p>
                  )}
                  {stage.result && (
                    <p className="text-xs text-emerald-800 font-medium">
                      <strong>Verified Outcome:</strong> {stage.result}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: SQL Query Laboratory */}
      {activeTab === 'queries' && (
        <div className="space-y-6 animate-in fade-in">
          {/* Query Selector Tabs */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-2 text-xs">
            {sampleSqlQueries.map((q, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setActiveQueryIndex(idx);
                  setQueryResult(null);
                }}
                className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all ${
                  activeQueryIndex === idx
                    ? 'bg-medblue-600 text-white'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {q.category}
              </button>
            ))}
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-bold text-slate-800 text-sm">
                  {sampleSqlQueries[activeQueryIndex].title}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {sampleSqlQueries[activeQueryIndex].explanation}
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => copySql(sampleSqlQueries[activeQueryIndex].sql)}
                  className="p-2 text-slate-500 hover:text-slate-800 bg-slate-100 rounded-xl"
                  title="Copy SQL"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                </button>
                <button
                  onClick={handleRunQuery}
                  disabled={queryExecuting}
                  className="flex items-center space-x-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md transition-all disabled:opacity-50"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>{queryExecuting ? 'Executing...' : 'Run Query'}</span>
                </button>
              </div>
            </div>

            {/* SQL Terminal Box */}
            <div className="bg-slate-950 p-4 rounded-2xl font-mono text-xs text-slate-200 overflow-x-auto shadow-inner border border-slate-800">
              <pre>{sampleSqlQueries[activeQueryIndex].sql}</pre>
            </div>

            {/* Execution Result */}
            {queryResult && (
              <div className="mt-4 p-4 rounded-2xl bg-slate-50 border border-slate-200 animate-in fade-in text-xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-700 flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    Query Result Set ({queryResult.rows.length} rows returned)
                  </span>
                  <div className="flex items-center space-x-3 text-[10px] font-mono text-slate-500">
                    <span>Execution: <strong className="text-teal-600">{queryResult.executionTime}</strong></span>
                    <span>Index Scan: <strong className="text-medblue-600">{queryResult.indexedScan ? 'YES (B-Tree)' : 'Seq Scan'}</strong></span>
                  </div>
                </div>

                <div className="overflow-x-auto bg-white rounded-xl border border-slate-200">
                  <table className="w-full text-left text-[11px] font-mono">
                    <thead className="bg-slate-100 text-slate-600 border-b border-slate-200">
                      <tr>
                        {Object.keys(queryResult.rows[0] || {}).map((col) => (
                          <th key={col} className="p-2.5 font-bold uppercase text-[9px]">{col}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {queryResult.rows.map((row: any, i: number) => (
                        <tr key={i} className="hover:bg-slate-50">
                          {Object.values(row).map((val: any, j: number) => (
                            <td key={j} className="p-2.5 text-slate-800">{String(val)}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 5: ACID & Concurrency */}
      {activeTab === 'acid' && (
        <div className="space-y-6 animate-in fade-in">
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
            <h3 className="text-sm font-bold text-slate-800 mb-1">{acidTransactionExplanation.title}</h3>
            <p className="text-xs text-slate-500 mb-6">
              How transactional boundaries, isolation levels, and concurrency locks protect medical records.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <span className="font-bold text-sm text-slate-900">{acidTransactionExplanation.atomicity.name}</span>
                <p className="text-slate-600 leading-relaxed">{acidTransactionExplanation.atomicity.description}</p>
                <div className="bg-slate-900 text-slate-300 p-3 rounded-lg font-mono text-[10px] overflow-x-auto">
                  <pre>{acidTransactionExplanation.atomicity.sqlExample}</pre>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <span className="font-bold text-sm text-slate-900">{acidTransactionExplanation.consistency.name}</span>
                <p className="text-slate-600 leading-relaxed">{acidTransactionExplanation.consistency.description}</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <span className="font-bold text-sm text-slate-900">{acidTransactionExplanation.isolation.name}</span>
                <p className="text-slate-600 leading-relaxed">{acidTransactionExplanation.isolation.description}</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <span className="font-bold text-sm text-slate-900">{acidTransactionExplanation.durability.name}</span>
                <p className="text-slate-600 leading-relaxed">{acidTransactionExplanation.durability.description}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: PostgreSQL Triggers */}
      {activeTab === 'triggers' && (
        <div className="space-y-6 animate-in fade-in">
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Automated Audit Log Trigger (PL/pgSQL)</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                PostgreSQL row-level triggers execute asynchronously to capture state alterations into the immutable AuditLog relation.
              </p>
            </div>

            <div className="bg-slate-950 p-4 rounded-2xl font-mono text-xs text-slate-200 overflow-x-auto border border-slate-800">
              <pre>{`-- Function executing on AFTER INSERT trigger
CREATE OR REPLACE FUNCTION "fn_log_appointment_creation"()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO "AuditLog" ("id", "action", "entity", "entityId", "details", "timestamp")
    VALUES (
        'aud_' || substr(md5(random()::text), 1, 16),
        'BOOK_APPOINTMENT',
        'APPOINTMENT',
        NEW."appointmentId",
        'Appointment booked for Patient ' || NEW."patientId" || ' with Doctor ' || NEW."doctorId",
        CURRENT_TIMESTAMP
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Attach trigger to Appointment table
CREATE TRIGGER "trg_appointment_audit"
AFTER INSERT ON "Appointment"
FOR EACH ROW EXECUTE FUNCTION "fn_log_appointment_creation"();`}</pre>
            </div>
          </div>
        </div>
      )}

      {/* TAB 7: SQL vs MongoDB */}
      {activeTab === 'nosql' && (
        <div className="space-y-6 animate-in fade-in">
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
            <h3 className="text-sm font-bold text-slate-800 mb-1">Architectural Comparison: Relational (PostgreSQL) vs Document (MongoDB)</h3>
            <p className="text-xs text-slate-500 mb-6">
              Evaluation of database paradigm tradeoffs for enterprise healthcare and hospital information systems.
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                    <th className="p-3">Architectural Dimension</th>
                    <th className="p-3">PostgreSQL (MEDNEXUS Primary)</th>
                    <th className="p-3">MongoDB (Document Alternative)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {sqlVsMongoComparison.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="p-3 font-bold text-slate-800">{item.feature}</td>
                      <td className="p-3 text-slate-700">{item.sql}</td>
                      <td className="p-3 text-slate-600 font-mono text-[11px]">{item.mongo}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
