import React, { useState, useEffect, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { appointmentsAPI, doctorsAPI } from '../services/api';
import AIDiagnosis from './AIDiagnosis';
import BrainCanvasMini from '../components/BrainCanvasMini';

/* ─── tiny reusable skeleton ─── */
const Sk = ({ w = 'w-24', h = 'h-3', extra = '' }) => (
  <div className={`${w} ${h} bg-gray-200 rounded-full animate-pulse ${extra}`} />
);

/* ─── mini sparkline shapes ─── */
const SparkUp = () => (
  <svg viewBox="0 0 80 32" className="w-full h-8" preserveAspectRatio="none">
    <defs>
      <linearGradient id="su" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#14b8a6" stopOpacity="0.3" />
        <stop offset="100%" stopColor="#14b8a6" stopOpacity="0" />
      </linearGradient>
    </defs>
    <path d="M0 28 Q10 24 20 20 T40 16 T60 12 T80 6" fill="none" stroke="#14b8a6" strokeWidth="2" />
    <path d="M0 28 Q10 24 20 20 T40 16 T60 12 T80 6 L80 32 L0 32Z" fill="url(#su)" />
  </svg>
);
const SparkDown = () => (
  <svg viewBox="0 0 80 32" className="w-full h-8" preserveAspectRatio="none">
    <defs>
      <linearGradient id="sd" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#f97316" stopOpacity="0.3" />
        <stop offset="100%" stopColor="#f97316" stopOpacity="0" />
      </linearGradient>
    </defs>
    <path d="M0 6 Q10 10 20 14 T40 18 T60 22 T80 26" fill="none" stroke="#f97316" strokeWidth="2" />
    <path d="M0 6 Q10 10 20 14 T40 18 T60 22 T80 26 L80 32 L0 32Z" fill="url(#sd)" />
  </svg>
);
const SparkFlat = ({ color = '#8b5cf6' }) => (
  <svg viewBox="0 0 80 32" className="w-full h-8" preserveAspectRatio="none">
    <path d="M0 22 Q15 18 25 20 T45 16 T65 18 T80 14" fill="none" stroke={color} strokeWidth="2" />
  </svg>
);

/* ─── bar chart for demographics ─── */
const MiniBarChart = () => {
  const bars = [
    { label: '18–30', val: 68, color: 'bg-teal-400' },
    { label: '31–45', val: 85, color: 'bg-teal-500' },
    { label: '46–60', val: 72, color: 'bg-emerald-400' },
    { label: '61–70', val: 54, color: 'bg-emerald-500' },
    { label: '70+',  val: 40, color: 'bg-teal-300' },
  ];
  return (
    <div className="flex items-end gap-3 h-28 pt-2">
      {bars.map((b) => (
        <div key={b.label} className="flex-1 flex flex-col items-center gap-1">
          <div
            className={`w-full rounded-t-lg ${b.color} opacity-80 transition-all`}
            style={{ height: `${b.val}%` }}
          />
          <span className="text-[10px] text-gray-400">{b.label}</span>
        </div>
      ))}
    </div>
  );
};

/* ─── smooth line chart for trends ─── */
const TrendChart = () => (
  <svg viewBox="0 0 340 90" className="w-full h-24" preserveAspectRatio="none">
    <defs>
      <linearGradient id="tc" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#14b8a6" stopOpacity="0.25" />
        <stop offset="100%" stopColor="#14b8a6" stopOpacity="0" />
      </linearGradient>
    </defs>
    <path
      d="M0 70 C20 65 30 55 50 50 S80 35 100 38 S140 20 170 18 S210 30 230 28 S270 15 300 12 S330 18 340 14"
      fill="none" stroke="#14b8a6" strokeWidth="2.5" strokeLinecap="round"
    />
    <path
      d="M0 70 C20 65 30 55 50 50 S80 35 100 38 S140 20 170 18 S210 30 230 28 S270 15 300 12 S330 18 340 14 L340 90 L0 90Z"
      fill="url(#tc)"
    />
    <circle cx="170" cy="18" r="5" fill="#14b8a6" />
    <rect x="148" y="4" width="44" height="18" rx="9" fill="#0f766e" />
    <text x="170" y="16" textAnchor="middle" fill="white" fontSize="9" fontWeight="bold">Peak</text>
  </svg>
);

/* ─── donut-style distribution ─── */
const DistChart = () => (
  <svg viewBox="0 0 120 120" className="w-28 h-28">
    <circle cx="60" cy="60" r="44" fill="none" stroke="#f1f5f9" strokeWidth="16" />
    <circle cx="60" cy="60" r="44" fill="none" stroke="#14b8a6" strokeWidth="16"
      strokeDasharray="110 167" strokeDashoffset="-20" strokeLinecap="round" />
    <circle cx="60" cy="60" r="44" fill="none" stroke="#f97316" strokeWidth="16"
      strokeDasharray="55 222" strokeDashoffset="-130" strokeLinecap="round" />
    <circle cx="60" cy="60" r="44" fill="none" stroke="#ef4444" strokeWidth="16"
      strokeDasharray="32 245" strokeDashoffset="-185" strokeLinecap="round" />
    <text x="60" y="56" textAnchor="middle" fill="#111827" fontSize="16" fontWeight="bold">92%</text>
    <text x="60" y="70" textAnchor="middle" fill="#6b7280" fontSize="8">Accuracy</text>
  </svg>
);

/* ═══════════════════════════════════════════
   SIDEBAR NAV ITEM
═══════════════════════════════════════════ */
const NavItem = ({ icon, label, view, activeView, onClick, badge }) => {
  const active = activeView === view;
  return (
    <button
      onClick={() => onClick(view)}
      className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
        active
          ? 'bg-teal-50 text-teal-600'
          : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
      }`}
    >
      <span className={`w-5 h-5 flex-shrink-0 ${active ? 'text-teal-600' : 'text-gray-400'}`}>
        {icon}
      </span>
      <span className="flex-1 text-left">{label}</span>
      {badge && (
        <span className="w-5 h-5 rounded-full bg-teal-500 text-white text-[10px] flex items-center justify-center">
          {badge}
        </span>
      )}
    </button>
  );
};

/* ─── icons ─── */
const Icons = {
  dashboard: <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>,
  patients: <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/></svg>,
  calendar: <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>,
  reports: <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>,
  messages: <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/></svg>,
  ai: <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/></svg>,
  settings: <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>,
  logout: <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>,
  bell: <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/></svg>,
  user: <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>,
  search: <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>,
  arrow: <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M7 17L17 7M17 7H7M17 7v10"/></svg>,
  chevUp: <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7"/></svg>,
  chevDn: <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/></svg>,
};

/* ═══════════════════════════════════════════
   METRIC CARD
═══════════════════════════════════════════ */
const MetricCard = ({ title, value, sub1, sub2, sub1Label, sub2Label, trend, trendVal, chart }) => (
  <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between gap-3">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-xs text-gray-400 mb-1">{title}</p>
        <p className="text-3xl font-bold text-gray-900">{value}</p>
      </div>
      <div className="w-9 h-9 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-400">
        {chart}
      </div>
    </div>
    <div className="flex items-center justify-between text-xs text-gray-400">
      <span>{sub1Label} <span className="font-medium text-gray-700">{sub1}</span></span>
      <span>{sub2Label} <span className="font-medium text-gray-700">{sub2}</span></span>
    </div>
    <div>
      {trendVal && (
        <div className={`flex items-center gap-1 text-xs font-medium ${trend === 'up' ? 'text-emerald-500' : 'text-orange-500'} mb-1`}>
          <span className="w-3 h-3">{trend === 'up' ? Icons.chevUp : Icons.chevDn}</span>
          <span>{trendVal}</span>
        </div>
      )}
      <div className="h-8">{trend === 'up' ? <SparkUp /> : <SparkDown />}</div>
    </div>
  </div>
);

/* ═══════════════════════════════════════════
   OVERVIEW VIEW
═══════════════════════════════════════════ */
const OverviewView = ({ statistics, appointments, loading }) => {
  const avatarColors = ['bg-teal-200', 'bg-blue-200', 'bg-purple-200', 'bg-orange-200', 'bg-emerald-200', 'bg-pink-200'];

  return (
    <div className="space-y-6">
      {/* ── top metrics ── */}
      <div className="grid grid-cols-4 gap-5">
        <MetricCard
          title="Total Patients"
          value={statistics?.totalPatients || '—'}
          sub1={statistics?.activePatients || '—'}
          sub2={statistics?.recoveredPatients || '—'}
          sub1Label="Active"
          sub2Label="Recovered"
          trend="up"
          trendVal="↑ 12% this month"
          chart={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0"/></svg>}
        />
        <MetricCard
          title="Active Appointments"
          value={statistics?.totalAppointments || '—'}
          sub1={statistics?.completedAppointments || '—'}
          sub2={statistics?.pendingAppointments || '—'}
          sub1Label="Done"
          sub2Label="Pending"
          trend="up"
          trendVal="↑ 8% this week"
          chart={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>}
        />
        <MetricCard
          title="AI Diagnoses Run"
          value="—"
          sub1="CN"
          sub2="MCI"
          sub1Label="Normal"
          sub2Label="Impaired"
          trend="down"
          trendVal="↓ 3% vs last week"
          chart={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/></svg>}
        />
        <MetricCard
          title="Monthly Scans"
          value="—"
          sub1="MRI"
          sub2="PET"
          sub1Label="Type"
          sub2Label="Type"
          trend="up"
          trendVal="↑ 5% this month"
          chart={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>}
        />
      </div>

      {/* ── middle row ── */}
      <div className="grid grid-cols-[1fr_1.6fr_1fr] gap-5">

        {/* Diagnosis Trends */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-start justify-between mb-1">
            <div>
              <p className="text-sm font-semibold text-gray-800">Diagnosis Trends</p>
              <p className="text-xs text-gray-400">Weekly case distribution</p>
            </div>
            <button className="w-7 h-7 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-400 hover:bg-gray-100 transition-all">
              <span className="w-4 h-4">{Icons.arrow}</span>
            </button>
          </div>
          <div className="flex gap-6 mb-3">
            <div>
              <p className="text-xs text-gray-400">This week</p>
              <p className="text-2xl font-bold text-gray-900">{appointments.length || '—'}</p>
              <p className="text-xs text-orange-400 flex items-center gap-0.5"><span className="w-3 h-3">{Icons.chevDn}</span> 2.1%</p>
            </div>
            <div className="flex flex-col gap-1.5 self-end pb-1">
              <span className="flex items-center gap-1.5 text-xs text-gray-400"><span className="w-2 h-2 rounded-full bg-teal-500 inline-block"/>Completed</span>
              <span className="flex items-center gap-1.5 text-xs text-gray-400"><span className="w-2 h-2 rounded-full bg-orange-400 inline-block"/>Pending</span>
            </div>
          </div>
          <TrendChart />
        </div>

        {/* Brain Model — center, full card */}
        <div
          className="rounded-2xl overflow-hidden shadow-sm border border-gray-100"
          style={{
            background: 'radial-gradient(ellipse at 50% 40%, #ccfbf1 0%, #d1fae5 35%, #f0fdf4 70%, #f8fafc 100%)',
            minHeight: 280,
          }}
        >
          <Suspense fallback={
            <div className="w-full h-full flex items-center justify-center" style={{ minHeight: 280 }}>
              <div className="w-20 h-20 rounded-full bg-teal-100 animate-pulse" />
            </div>
          }>
            <BrainCanvasMini />
          </Suspense>
        </div>

        {/* Prediction Distribution */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-sm font-semibold text-gray-800">Class Distribution</p>
              <p className="text-xs text-emerald-500 flex items-center gap-1"><span className="w-3 h-3">{Icons.chevUp}</span> Model accuracy</p>
            </div>
            <button className="w-7 h-7 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-400 hover:bg-gray-100 transition-all">
              <span className="w-4 h-4">{Icons.arrow}</span>
            </button>
          </div>
          <div className="flex flex-col items-center gap-4">
            <DistChart />
            <div className="w-full space-y-2">
              {[
                { label: 'CN — Normal',    pct: 40, color: 'bg-teal-500' },
                { label: 'MCI — Impaired', pct: 35, color: 'bg-orange-400' },
                { label: 'Dementia',       pct: 25, color: 'bg-red-400' },
              ].map((d) => (
                <div key={d.label}>
                  <div className="flex justify-between text-xs text-gray-500 mb-0.5">
                    <span>{d.label}</span><span>{d.pct}%</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full ${d.color} rounded-full`} style={{ width: `${d.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── bottom row ── */}
      <div className="grid grid-cols-[1.8fr_1fr] gap-5">

        {/* Patient Demographics */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-start justify-between mb-1">
            <div>
              <p className="text-sm font-semibold text-gray-800">Patient Demographics</p>
              <p className="text-xs text-gray-400">{statistics?.totalPatients || '—'} Total Patients</p>
              <p className="text-xs text-orange-400 mt-0.5 flex items-center gap-0.5"><span className="w-3 h-3">{Icons.chevDn}</span> 3.5%</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex gap-3">
                {['18–30', '31–45', '46–60', '61–70', '70+'].map((ag, i) => {
                  const counts = [220, 195, 175, 130, 100];
                  return (
                    <div key={ag} className="text-center">
                      <p className="text-xs font-bold text-gray-700">{counts[i]}</p>
                      <p className="text-[9px] text-gray-400">{ag}</p>
                    </div>
                  );
                })}
              </div>
              <button className="w-7 h-7 rounded-xl bg-teal-500 text-white flex items-center justify-center hover:bg-teal-600 transition-all ml-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/></svg>
              </button>
            </div>
          </div>
          <MiniBarChart />
          <div className="flex gap-4 mt-2 flex-wrap">
            {[
              { label: '70+: 10.0%', color: 'bg-teal-300' },
              { label: '18–30: 25.0%', color: 'bg-teal-400' },
              { label: '51–70: 30.0%', color: 'bg-emerald-400' },
              { label: '31–50: 35.0%', color: 'bg-emerald-500' },
            ].map((l) => (
              <span key={l.label} className="flex items-center gap-1.5 text-[10px] text-gray-400">
                <span className={`w-2 h-2 rounded-sm ${l.color} inline-block`} />{l.label}
              </span>
            ))}
          </div>
        </div>

        {/* Ongoing + Awaiting */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-teal-400 inline-block" />
              <p className="text-xs font-semibold text-gray-700">Ongoing Treatments</p>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-2">
              <div className="h-full bg-gradient-to-r from-teal-400 to-emerald-400 rounded-full" style={{ width: '67%' }} />
            </div>
            <p className="text-xs text-gray-400">
              <span className="font-bold text-gray-700">{statistics?.completedAppointments || 8}</span> active cases tracked
            </p>
            <div className="flex -space-x-2 mt-3">
              {avatarColors.slice(0, 4).map((c, i) => (
                <div key={i} className={`w-7 h-7 rounded-full ${c} border-2 border-white flex items-center justify-center text-[10px] font-bold text-gray-600`}>
                  {String.fromCharCode(65 + i)}
                </div>
              ))}
              <div className="w-7 h-7 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center text-[10px] text-gray-400">+4</div>
            </div>
          </div>

          <div className="border-t border-gray-50 pt-4 flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-orange-400 inline-block" />
              <p className="text-xs font-semibold text-gray-700">Awaiting Follow-up</p>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-2">
              <div className="h-full bg-gradient-to-r from-orange-300 to-orange-400 rounded-full" style={{ width: '33%' }} />
            </div>
            <p className="text-xs text-gray-400">
              <span className="font-bold text-gray-700">4</span> patients need review
            </p>
            <div className="flex -space-x-2 mt-3">
              {avatarColors.slice(2, 5).map((c, i) => (
                <div key={i} className={`w-7 h-7 rounded-full ${c} border-2 border-white flex items-center justify-center text-[10px] font-bold text-gray-600`}>
                  {String.fromCharCode(69 + i)}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════ */
function DoctorManagement() {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(15);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [activeView, setActiveView] = useState('overview');
  const [appointments, setAppointments] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    if (!token || !userStr) { navigate('/'); return; }
    const u = JSON.parse(userStr);
    if (u.role !== 'doctor') { navigate('/'); return; }
    setUser(u);
    fetchAppointments();
    fetchStatistics(u.id);
  }, [navigate]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await appointmentsAPI.getAll();
      if (response.data.success) {
        const formattedAppointments = response.data.appointments.map(apt => ({
          id: apt._id,
          time: new Date(apt.date + ' ' + apt.time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          patientName: apt.patientId?.name || 'Unknown Patient',
          condition: apt.condition,
          status: apt.status,
          avatar: apt.patientId?.avatar || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
          patientDetails: {
            age: apt.patientId?.age ? `${apt.patientId.age} Years, ${apt.patientId.gender}` : 'N/A',
            mrn: `MRN-${apt.patientId?._id?.slice(-8) || '00000000'}`,
            time: apt.time,
            specialNote: apt.consultationNotes || apt.notes || 'No notes available',
            fee: `${apt.fee || 0}$`,
            paymentStatus: apt.paymentStatus || 'Pending',
            cardInfo: apt.cardInfo || 'N/A',
          },
        }));
        setAppointments(formattedAppointments);
      }
    } catch (err) {
      setError('Failed to load appointments.');
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async (userId) => {
    try {
      if (userId) {
        const response = await doctorsAPI.getStatistics(userId);
        if (response.data.success) setStatistics(response.data.statistics);
      }
    } catch {}
  };

  const handleUpdateAppointment = async (appointmentId, updates) => {
    try {
      const response = await appointmentsAPI.update(appointmentId, updates);
      if (response.data.success) await fetchAppointments();
    } catch { setError('Failed to update appointment'); }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  const dates = [
    [null, null, null, null, 1, 2, 3],
    [4, 5, 6, 7, 8, 9, 10],
    [11, 12, 13, 14, 15, 16, 17],
    [18, 19, 20, 21, 22, 23, 24],
    [25, 26, 27, 28, 29, 30, null],
  ];

  const currentPatient = selectedAppointment ? {
    name: selectedAppointment.patientName,
    age: selectedAppointment.patientDetails?.age || 'N/A',
    time: selectedAppointment.patientDetails?.time || 'N/A',
    mrn: selectedAppointment.patientDetails?.mrn || 'N/A',
    type: 'Consultation',
    condition: selectedAppointment.condition,
    specialNote: selectedAppointment.patientDetails?.specialNote || 'No notes available',
    fee: selectedAppointment.patientDetails?.fee || '0$',
    paymentStatus: selectedAppointment.patientDetails?.paymentStatus || 'Pending',
    cardInfo: selectedAppointment.patientDetails?.cardInfo || 'N/A',
  } : null;

  const navItems = [
    { view: 'overview',      label: 'Dashboard',       icon: Icons.dashboard },
    { view: 'appointments',  label: 'Appointments',    icon: Icons.calendar,  badge: appointments.length || null },
    { view: 'patients',      label: 'Patients',        icon: Icons.patients },
    { view: 'calendar',      label: 'Schedule',        icon: Icons.calendar },
    { view: 'reports',       label: 'Reports',         icon: Icons.reports },
    { view: 'messages',      label: 'Messages',        icon: Icons.messages },
    { view: 'ai-diagnosis',  label: 'AI Diagnosis',    icon: Icons.ai },
  ];

  return (
    <div className="min-h-screen w-full bg-[#e8eaed] p-4 flex items-start justify-center">
      <div
        className="w-full max-w-[1600px] flex rounded-3xl overflow-hidden shadow-2xl"
        style={{ minHeight: 'calc(100vh - 2rem)' }}
      >
        {/* ══════════ SIDEBAR ══════════ */}
        <aside className="w-60 flex-shrink-0 bg-white flex flex-col py-6 px-4 gap-2 rounded-r-3xl">
          {/* Logo */}
          <div className="flex items-center gap-2.5 px-2 mb-4">
            <div>
              <p className="text-sm font-bold text-gray-900 leading-none">ALZ ForeSight</p>
              <p className="text-[10px] text-gray-400 mt-0.5">For Doctors</p>
            </div>
          </div>

          {/* Nav */}
          <nav className="flex flex-col gap-0.5 flex-1">
            {navItems.map((item) => (
              <NavItem
                key={item.view}
                view={item.view}
                label={item.label}
                icon={item.icon}
                activeView={activeView}
                onClick={setActiveView}
                badge={item.badge}
              />
            ))}
          </nav>

          {/* Settings + Logout */}
          <div className="flex flex-col gap-0.5 border-t border-gray-100 pt-3">
            <NavItem view="settings" label="Settings" icon={Icons.settings} activeView={activeView} onClick={setActiveView} />
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:bg-red-50 transition-all"
            >
              <span className="w-5 h-5 flex-shrink-0">{Icons.logout}</span>
              <span>Log Out</span>
            </button>
          </div>

          {/* User profile card */}
          <div className="mt-2 p-3 rounded-2xl bg-gray-50 border border-gray-100 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-teal-300 to-emerald-400 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
              {user?.name?.[0]?.toUpperCase() || 'D'}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-800 truncate">{user?.name || 'Doctor'}</p>
              <p className="text-[10px] text-gray-400 truncate">{user?.email || 'doctor@alzforesight.com'}</p>
            </div>
          </div>

          {/* Promo card */}
          <div className="mt-2 p-4 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-500 text-white overflow-hidden relative">
            <div className="absolute -top-4 -right-4 w-16 h-16 bg-white/10 rounded-full" />
            <div className="absolute -bottom-4 -left-2 w-12 h-12 bg-white/10 rounded-full" />
            <p className="text-xs font-semibold mb-1 relative z-10">AI Update</p>
            <p className="text-[10px] opacity-80 mb-3 relative z-10 leading-relaxed">XGBoost model improves diagnosis accuracy by 27%</p>
            <button
              onClick={() => setActiveView('ai-diagnosis')}
              className="w-full py-1.5 bg-gray-900 text-white text-[11px] font-semibold rounded-xl hover:bg-gray-800 transition-all relative z-10"
            >
              Run Diagnosis
            </button>
          </div>
        </aside>

        {/* ══════════ MAIN CONTENT ══════════ */}
        <div className="flex-1 flex flex-col bg-transparent">

          {/* ── HEADER ── */}
          <div className="px-4 pt-4 flex-shrink-0">
          <header className="h-14 bg-white rounded-2xl shadow-sm flex items-center gap-4 px-5">
            {/* Search */}
            <div className="relative flex-1 max-w-sm">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400">{Icons.search}</span>
              <input
                type="text"
                placeholder="Search patients, appointments…"
                className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-teal-300 transition-all"
              />
            </div>

            <div className="flex items-center gap-2 ml-auto">
              {/* Notification */}
              <button className="relative w-9 h-9 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-all">
                <span className="w-5 h-5">{Icons.bell}</span>
                <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-teal-400 rounded-full" />
              </button>
              {/* User icon */}
              <button className="w-9 h-9 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-all">
                <span className="w-5 h-5">{Icons.user}</span>
              </button>
              {/* Date pill */}
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 border border-gray-100 rounded-xl">
                <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                <span className="text-xs text-gray-500 font-medium">
                  {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              </div>
              {/* Action button */}
              <button
                onClick={() => setActiveView('ai-diagnosis')}
                className="flex items-center gap-2 px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white text-sm font-semibold rounded-xl transition-all shadow-sm"
              >
                <span className="w-4 h-4">{Icons.ai}</span>
                Run AI Diagnosis
              </button>
            </div>
          </header>
          </div>

          {/* ── CONTENT AREA ── */}
          <main className="flex-1 p-4 overflow-y-auto">

            {/* ── OVERVIEW ── */}
            {activeView === 'overview' && (
              <>
                <div className="mb-5">
                  <h2 className="text-4xl font-bold text-gray-800">Overview</h2>
                  <p className="text-xs text-gray-400 mt-0.5">Welcome back, Dr. {user?.name?.split(' ')[0] || 'Doctor'}</p>
                </div>
                <OverviewView statistics={statistics} appointments={appointments} loading={loading} />
              </>
            )}

            {/* ── APPOINTMENTS ── */}
            {activeView === 'appointments' && (
              <>
                <div className="mb-5">
                  <h2 className="text-2xl font-bold text-gray-800">Appointments</h2>
                  <p className="text-xs text-gray-400 mt-0.5">{loading ? 'Loading…' : `${appointments.length} appointments found`}</p>
                </div>
                <div className="grid grid-cols-[1fr_1.2fr] gap-4">
                  {/* list */}
                  <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-sm font-semibold text-gray-800">All Appointments</p>
                      <button className="text-xs text-teal-500 hover:text-teal-600">Show all</button>
                    </div>
                    {loading ? (
                      <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="flex gap-3 items-center"><div className="w-9 h-9 rounded-full bg-gray-100 animate-pulse"/><div className="flex-1 space-y-1.5"><Sk w="w-32"/><Sk w="w-20" h="h-2"/></div></div>)}</div>
                    ) : error ? (
                      <p className="text-sm text-red-400 py-8 text-center">{error}</p>
                    ) : (
                      <div className="space-y-1.5">
                        {appointments.map((apt) => (
                          <div
                            key={apt.id}
                            onClick={() => setSelectedAppointment(apt)}
                            className={`flex items-center gap-3 p-2.5 rounded-xl cursor-pointer transition-all ${
                              selectedAppointment?.id === apt.id
                                ? 'bg-teal-50 border border-teal-100'
                                : 'hover:bg-gray-50'
                            }`}
                          >
                            <p className="text-xs text-gray-400 w-14 flex-shrink-0">{apt.time}</p>
                            <div className={`w-2 h-2 rounded-full flex-shrink-0 ${apt.status === 'completed' ? 'bg-emerald-400' : apt.status === 'current' ? 'bg-teal-500' : 'bg-orange-400'}`} />
                            <img src={apt.avatar} alt={apt.patientName} className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-800 truncate">{apt.patientName}</p>
                              <p className="text-xs text-gray-400 truncate">{apt.condition}</p>
                            </div>
                            <div className={`px-2 py-0.5 rounded-full text-[10px] font-medium flex-shrink-0 ${apt.status === 'completed' ? 'bg-emerald-50 text-emerald-600' : apt.status === 'current' ? 'bg-teal-50 text-teal-600' : 'bg-orange-50 text-orange-500'}`}>
                              {apt.status}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  {/* detail */}
                  <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <p className="text-sm font-semibold text-gray-800 mb-3">Ongoing Appointment</p>
                    {selectedAppointment && currentPatient ? (
                      <div className="grid grid-cols-[1fr_1.2fr] gap-4">
                        <div className="space-y-3">
                          <div className="flex items-center gap-3 mb-2">
                            <img src={selectedAppointment.avatar} alt={currentPatient.name} className="w-10 h-10 rounded-full object-cover" />
                            <div>
                              <p className="text-sm font-semibold text-gray-800">{currentPatient.name}</p>
                              <p className="text-xs text-gray-400">{currentPatient.condition}</p>
                            </div>
                          </div>
                          {[
                            ['Age', currentPatient.age],
                            ['Time', currentPatient.time],
                            ['MRN', currentPatient.mrn],
                            ['Type', currentPatient.type],
                          ].map(([k, v]) => (
                            <div key={k} className="flex justify-between text-xs border-b border-gray-50 pb-1.5">
                              <span className="text-gray-400">{k}</span>
                              <span className="text-gray-700 font-medium">{v}</span>
                            </div>
                          ))}
                          <div className="mt-2">
                            <p className="text-xs text-gray-400 mb-1">Special Note</p>
                            <p className="text-xs text-gray-600 leading-relaxed">{currentPatient.specialNote}</p>
                          </div>
                          <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-xs text-gray-500">Fee — {currentPatient.fee}</span>
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${currentPatient.paymentStatus === 'Paid' ? 'bg-emerald-50 text-emerald-600' : 'bg-orange-50 text-orange-500'}`}>{currentPatient.paymentStatus}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col">
                          <p className="text-xs text-gray-400 mb-2">Consultation Notes</p>
                          <div className="bg-gray-50 rounded-xl p-3 flex-1 overflow-y-auto mb-3 border border-gray-100">
                            <p className="text-xs text-gray-600 leading-relaxed">Patient presents with cognitive assessment scores requiring evaluation. Recommend follow-up neurological testing and review of current medication regimen.</p>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleUpdateAppointment(selectedAppointment.id, { status: 'rescheduled' })}
                              className="flex-1 py-2.5 rounded-xl border border-gray-200 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-all"
                            >
                              Reschedule
                            </button>
                            <button
                              onClick={() => handleUpdateAppointment(selectedAppointment.id, { status: 'completed' })}
                              className="flex-1 py-2.5 rounded-xl bg-teal-500 text-white text-xs font-semibold hover:bg-teal-600 transition-all"
                            >
                              Finish
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-64 text-gray-300">
                        <div className="text-center">
                          <svg className="w-12 h-12 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
                          <p className="text-sm">Select an appointment</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}

            {/* ── PATIENTS ── */}
            {activeView === 'patients' && (
              <>
                <div className="mb-5">
                  <h2 className="text-2xl font-bold text-gray-800">Patient Management</h2>
                  <p className="text-xs text-gray-400 mt-0.5">All registered patients</p>
                </div>
                {loading ? (
                  <div className="grid grid-cols-1 gap-3">{[...Array(4)].map((_, i) => <div key={i} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex gap-4 items-center"><div className="w-14 h-14 rounded-full bg-gray-100 animate-pulse"/><div className="flex-1 space-y-2"><Sk w="w-40"/><Sk w="w-24" h="h-2"/></div></div>)}</div>
                ) : (
                  <div className="grid grid-cols-1 gap-3">
                    {appointments.map((apt) => (
                      <div key={apt.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center gap-4 hover:border-teal-100 transition-all">
                        <img src={apt.avatar} alt={apt.patientName} className="w-14 h-14 rounded-full object-cover flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-800">{apt.patientName}</p>
                          <p className="text-xs text-gray-400">MRN: {apt.patientDetails?.mrn || 'N/A'}</p>
                          <p className="text-xs text-gray-400">{apt.patientDetails?.age || 'N/A'}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-700">{apt.condition}</p>
                          <p className={`text-xs mt-0.5 ${apt.patientDetails?.paymentStatus === 'Paid' ? 'text-emerald-500' : 'text-orange-400'}`}>{apt.patientDetails?.paymentStatus}</p>
                        </div>
                        <button className="px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white text-xs font-semibold rounded-xl transition-all ml-2">
                          View
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {/* ── CALENDAR ── */}
            {activeView === 'calendar' && (
              <>
                <div className="mb-5">
                  <h2 className="text-2xl font-bold text-gray-800">Calendar & Schedule</h2>
                  <p className="text-xs text-gray-400 mt-0.5">Manage appointments</p>
                </div>
                <div className="grid grid-cols-[500px_1fr] gap-5 items-start">
                  {/* calendar widget */}
                  <div className="bg-white rounded-2xl p-7 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-bold text-gray-900">December 2025</h3>
                      <div className="flex gap-2">
                        <button className="w-9 h-9 bg-gray-50 border border-gray-200 text-gray-500 rounded-xl hover:bg-gray-100 transition-all flex items-center justify-center">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/></svg>
                        </button>
                        <button className="w-9 h-9 bg-gray-50 border border-gray-200 text-gray-500 rounded-xl hover:bg-gray-100 transition-all flex items-center justify-center">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/></svg>
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-7 gap-2 mb-2">
                      {days.map((d) => <div key={d} className="text-center text-sm text-gray-400 font-semibold py-1">{d.slice(0,2)}</div>)}
                    </div>
                    <div className="grid grid-cols-7 gap-2">
                      {dates.flat().map((date, idx) => (
                        <button
                          key={idx}
                          onClick={() => date && setSelectedDate(date)}
                          className={`w-full h-12 flex items-center justify-center rounded-xl text-base font-medium transition-all
                            ${!date ? 'invisible' : ''}
                            ${date === selectedDate ? 'bg-teal-500 text-white shadow-sm' : 'hover:bg-gray-100 text-gray-600'}`}
                        >
                          {date}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* appointments list */}
                  <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <p className="text-base font-semibold text-gray-800 mb-4">
                      Appointments — <span className="text-teal-500">Dec {selectedDate}</span>
                    </p>
                    <div className="space-y-3">
                      {appointments.length === 0 ? (
                        <p className="text-sm text-gray-400 py-10 text-center">No appointments for this day</p>
                      ) : appointments.slice(0, 8).map((apt) => (
                        <div key={apt.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-all">
                          <span className="text-sm text-gray-400 w-20 flex-shrink-0 font-medium">{apt.time}</span>
                          <span className={`w-2 h-2 rounded-full flex-shrink-0 ${apt.status === 'completed' ? 'bg-emerald-400' : apt.status === 'current' ? 'bg-teal-500' : 'bg-orange-400'}`} />
                          <img src={apt.avatar} alt={apt.patientName} className="w-10 h-10 rounded-full object-cover flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-800 truncate">{apt.patientName}</p>
                            <p className="text-xs text-gray-400 truncate mt-0.5">{apt.condition}</p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold flex-shrink-0 ${apt.status === 'completed' ? 'bg-emerald-50 text-emerald-600' : apt.status === 'current' ? 'bg-teal-50 text-teal-600' : 'bg-orange-50 text-orange-500'}`}>
                            {apt.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* ── REPORTS ── */}
            {activeView === 'reports' && (
              <>
                <div className="mb-5">
                  <h2 className="text-2xl font-bold text-gray-800">Medical Reports</h2>
                  <p className="text-xs text-gray-400 mt-0.5">Patient medical record overview</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: 'Lab Results', sub: '48 reports', color: 'text-blue-500', bg: 'bg-blue-50', btn: 'bg-blue-500 hover:bg-blue-600', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/> },
                    { label: 'Imaging Studies', sub: '23 scans', color: 'text-purple-500', bg: 'bg-purple-50', btn: 'bg-purple-500 hover:bg-purple-600', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/> },
                    { label: 'Prescriptions', sub: '156 entries', color: 'text-emerald-500', bg: 'bg-emerald-50', btn: 'bg-emerald-500 hover:bg-emerald-600', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/> },
                    { label: 'Visit History', sub: '98 visits', color: 'text-orange-500', bg: 'bg-orange-50', btn: 'bg-orange-500 hover:bg-orange-600', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/> },
                  ].map((r) => (
                    <div key={r.label} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:border-gray-200 transition-all">
                      <div className="flex items-center gap-3 mb-4">
                        <div className={`w-10 h-10 ${r.bg} rounded-xl flex items-center justify-center`}>
                          <svg className={`w-5 h-5 ${r.color}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">{r.icon}</svg>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-800">{r.label}</p>
                          <p className="text-xs text-gray-400">{r.sub}</p>
                        </div>
                      </div>
                      <button className={`w-full py-2 ${r.btn} text-white text-xs font-semibold rounded-xl transition-all`}>View All</button>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* ── MESSAGES ── */}
            {activeView === 'messages' && (
              <>
                <div className="mb-5">
                  <h2 className="text-2xl font-bold text-gray-800">Messages</h2>
                  <p className="text-xs text-gray-400 mt-0.5">Patient communications</p>
                </div>
                <div className="grid grid-cols-3 gap-4" style={{ height: 'calc(100vh - 220px)' }}>
                  <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col">
                    <input type="text" placeholder="Search…" className="w-full px-3 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm placeholder-gray-400 focus:outline-none mb-3" />
                    <div className="flex-1 overflow-y-auto space-y-1.5">
                      {appointments.map((apt) => (
                        <div key={apt.id} className="p-3 bg-gray-50 hover:bg-gray-100 rounded-xl cursor-pointer transition-all flex items-center gap-3">
                          <img src={apt.avatar} alt={apt.patientName} className="w-9 h-9 rounded-full object-cover flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-gray-700 truncate">{apt.patientName}</p>
                            <p className="text-[10px] text-gray-400 truncate">Last message preview…</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="col-span-2 bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center justify-center text-gray-300">
                    <div className="text-center">
                      <svg className="w-14 h-14 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/></svg>
                      <p className="text-sm">Select a conversation</p>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* ── AI DIAGNOSIS ── */}
            {activeView === 'ai-diagnosis' && (
              <div className="flex-1 flex flex-col min-h-0">
                <AIDiagnosis />
              </div>
            )}

          </main>
        </div>
      </div>
    </div>
  );
}

export default DoctorManagement;
