import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import { appointmentsAPI, doctorsAPI } from '../services/api';
import AIDiagnosis from './AIDiagnosis';
import BrainCanvasMini from '../components/BrainCanvasMini';
import { toAppointmentList as toMockAppointments } from '../data/mockPatients';

/* ─── glass card style ─── */
const glass = {
  background: 'rgba(255,255,255,0.65)',
  backdropFilter: 'blur(16px)',
  WebkitBackdropFilter: 'blur(16px)',
  border: '0.5px solid rgba(255,255,255,0.75)',
  borderRadius: 20,
};
const glassHover = {
  background: 'rgba(255,255,255,0.78)',
};

/* ─── tiny reusable skeleton ─── */
const Sk = ({ w = 'w-24', h = 'h-3', extra = '' }) => (
  <div className={`${w} ${h} rounded-full animate-pulse ${extra}`} style={{ background: 'rgba(26,42,58,0.08)' }} />
);

/* ─── mini sparkline shapes ─── */
const SparkUp = () => (
  <svg viewBox="0 0 80 32" className="w-full h-8" preserveAspectRatio="none">
    <defs>
      <linearGradient id="su" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#2563eb" stopOpacity="0.25" />
        <stop offset="100%" stopColor="#2563eb" stopOpacity="0" />
      </linearGradient>
    </defs>
    <path d="M0 28 Q10 24 20 20 T40 16 T60 12 T80 6" fill="none" stroke="#2563eb" strokeWidth="2" />
    <path d="M0 28 Q10 24 20 20 T40 16 T60 12 T80 6 L80 32 L0 32Z" fill="url(#su)" />
  </svg>
);
const SparkDown = () => (
  <svg viewBox="0 0 80 32" className="w-full h-8" preserveAspectRatio="none">
    <defs>
      <linearGradient id="sd" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#f97316" stopOpacity="0.25" />
        <stop offset="100%" stopColor="#f97316" stopOpacity="0" />
      </linearGradient>
    </defs>
    <path d="M0 6 Q10 10 20 14 T40 18 T60 22 T80 26" fill="none" stroke="#f97316" strokeWidth="2" />
    <path d="M0 6 Q10 10 20 14 T40 18 T60 22 T80 26 L80 32 L0 32Z" fill="url(#sd)" />
  </svg>
);

/* ─── bar chart for demographics ─── */
const MiniBarChart = () => {
  const bars = [
    { label: '18–30', val: 68 },
    { label: '31–45', val: 85 },
    { label: '46–60', val: 72 },
    { label: '61–70', val: 54 },
    { label: '70+',  val: 40 },
  ];
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, height: 112, paddingTop: 8 }}>
      {bars.map((b, i) => (
        <div key={b.label} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
          <div
            style={{
              width: '100%',
              borderRadius: '6px 6px 0 0',
              height: `${b.val}%`,
              background: `rgba(37,99,235,${0.4 + i * 0.12})`,
              transition: 'all 0.3s',
            }}
          />
          <span style={{ fontSize: 9, color: 'rgba(26,42,58,0.4)' }}>{b.label}</span>
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
        <stop offset="0%" stopColor="#2563eb" stopOpacity="0.18" />
        <stop offset="100%" stopColor="#2563eb" stopOpacity="0" />
      </linearGradient>
    </defs>
    <path
      d="M0 70 C20 65 30 55 50 50 S80 35 100 38 S140 20 170 18 S210 30 230 28 S270 15 300 12 S330 18 340 14"
      fill="none" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round"
    />
    <path
      d="M0 70 C20 65 30 55 50 50 S80 35 100 38 S140 20 170 18 S210 30 230 28 S270 15 300 12 S330 18 340 14 L340 90 L0 90Z"
      fill="url(#tc)"
    />
    <circle cx="170" cy="18" r="5" fill="#2563eb" />
    <rect x="148" y="4" width="44" height="18" rx="9" fill="#1d4ed8" />
    <text x="170" y="16" textAnchor="middle" fill="white" fontSize="9" fontWeight="bold">Peak</text>
  </svg>
);

/* ─── donut-style distribution ─── */
const DistChart = () => (
  <svg viewBox="0 0 120 120" className="w-28 h-28">
    <circle cx="60" cy="60" r="44" fill="none" stroke="rgba(26,42,58,0.07)" strokeWidth="16" />
    <circle cx="60" cy="60" r="44" fill="none" stroke="#2563eb" strokeWidth="16"
      strokeDasharray="110 167" strokeDashoffset="-20" strokeLinecap="round" />
    <circle cx="60" cy="60" r="44" fill="none" stroke="#f97316" strokeWidth="16"
      strokeDasharray="55 222" strokeDashoffset="-130" strokeLinecap="round" />
    <circle cx="60" cy="60" r="44" fill="none" stroke="#ef4444" strokeWidth="16"
      strokeDasharray="32 245" strokeDashoffset="-185" strokeLinecap="round" />
    <text x="60" y="56" textAnchor="middle" fill="#1a2a3a" fontSize="16" fontWeight="bold">92%</text>
    <text x="60" y="70" textAnchor="middle" fill="rgba(26,42,58,0.45)" fontSize="8">Accuracy</text>
  </svg>
);

/* ═══════════════════════════════════════════
   SIDEBAR NAV ITEM — full pill, Explore Categories style
═══════════════════════════════════════════ */
const NavItem = ({ icon, label, view, activeView, onClick, badge }) => {
  const active = activeView === view;
  return (
    <button
      onClick={() => onClick(view)}
      style={{
        display: 'flex', alignItems: 'center', gap: 16,
        padding: '13px 20px',
        borderRadius: 999,
        background: 'rgba(255,255,255,0.88)',
        border: active ? '1.5px solid rgba(26,42,58,0.18)' : '1.5px solid rgba(255,255,255,0.6)',
        color: '#1a2a3a',
        fontSize: 15, fontWeight: 500,
        cursor: 'pointer', textAlign: 'left', width: '100%',
        transition: 'all 0.15s',
        boxShadow: active ? '0 4px 16px rgba(26,42,58,0.12)' : '0 2px 8px rgba(26,42,58,0.06)',
        letterSpacing: '-0.01em',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.background = 'rgba(255,255,255,0.98)';
        e.currentTarget.style.boxShadow = '0 4px 16px rgba(26,42,58,0.12)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = 'rgba(255,255,255,0.88)';
        e.currentTarget.style.boxShadow = active ? '0 4px 16px rgba(26,42,58,0.12)' : '0 2px 8px rgba(26,42,58,0.06)';
      }}
    >
      <span style={{ width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: '#1a2a3a' }}>
        {icon}
      </span>
      <span style={{ flex: 1 }}>{label}</span>
      {badge ? (
        <span style={{ minWidth: 20, height: 20, borderRadius: 999, background: '#2563eb', color: '#fff', fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 5px' }}>
          {badge}
        </span>
      ) : (
        <span style={{ fontSize: 20, lineHeight: 1, fontWeight: 300, color: 'rgba(26,42,58,0.4)' }}>›</span>
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
  <div style={{ ...glass, padding: 24, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 12 }}>
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
      <div>
        <p style={{ fontSize: 11, color: 'rgba(26,42,58,0.45)', marginBottom: 4 }}>{title}</p>
        <p style={{ fontSize: 28, fontWeight: 700, color: '#1a2a3a' }}>{value}</p>
      </div>
      <div style={{ width: 36, height: 36, borderRadius: 12, background: 'rgba(37,99,235,0.07)', border: '0.5px solid rgba(37,99,235,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563eb' }}>
        {chart}
      </div>
    </div>
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 11, color: 'rgba(26,42,58,0.45)' }}>
      <span>{sub1Label} <span style={{ fontWeight: 600, color: '#1a2a3a' }}>{sub1}</span></span>
      <span>{sub2Label} <span style={{ fontWeight: 600, color: '#1a2a3a' }}>{sub2}</span></span>
    </div>
    <div>
      {trendVal && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 600, color: trend === 'up' ? '#16a34a' : '#f97316', marginBottom: 4 }}>
          <span style={{ width: 12, height: 12 }}>{trend === 'up' ? Icons.chevUp : Icons.chevDn}</span>
          <span>{trendVal}</span>
        </div>
      )}
      <div style={{ height: 32 }}>{trend === 'up' ? <SparkUp /> : <SparkDown />}</div>
    </div>
  </div>
);

/* ═══════════════════════════════════════════
   OVERVIEW VIEW
═══════════════════════════════════════════ */
const OverviewView = ({ statistics, appointments, loading }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* ── top metrics ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
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
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.6fr 1fr', gap: 16 }}>

        {/* Diagnosis Trends */}
        <div style={{ ...glass, padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 4 }}>
            <div>
              <p style={{ fontSize: 13, fontWeight: 600, color: '#1a2a3a' }}>Diagnosis Trends</p>
              <p style={{ fontSize: 11, color: 'rgba(26,42,58,0.4)' }}>Weekly case distribution</p>
            </div>
            <button style={{ width: 28, height: 28, borderRadius: 10, background: 'rgba(26,42,58,0.04)', border: '0.5px solid rgba(26,42,58,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(26,42,58,0.4)', cursor: 'pointer' }}>
              <span style={{ width: 14, height: 14 }}>{Icons.arrow}</span>
            </button>
          </div>
          <div style={{ display: 'flex', gap: 20, marginBottom: 12 }}>
            <div>
              <p style={{ fontSize: 11, color: 'rgba(26,42,58,0.4)' }}>This week</p>
              <p style={{ fontSize: 22, fontWeight: 700, color: '#1a2a3a' }}>{appointments.length || '—'}</p>
              <p style={{ fontSize: 11, color: '#f97316', display: 'flex', alignItems: 'center', gap: 2 }}><span style={{ width: 12, height: 12 }}>{Icons.chevDn}</span> 2.1%</p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignSelf: 'flex-end', paddingBottom: 4 }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'rgba(26,42,58,0.45)' }}><span style={{ width: 8, height: 8, borderRadius: '50%', background: '#2563eb', display: 'inline-block' }}/>Completed</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'rgba(26,42,58,0.45)' }}><span style={{ width: 8, height: 8, borderRadius: '50%', background: '#f97316', display: 'inline-block' }}/>Pending</span>
            </div>
          </div>
          <TrendChart />
        </div>

        {/* Brain Model — center, full card */}
        <div
          style={{
            borderRadius: 20,
            overflow: 'hidden',
            border: '0.5px solid rgba(255,255,255,0.75)',
            background: 'radial-gradient(ellipse at 50% 40%, #dbeafe 0%, #ede9fe 40%, #f0f9ff 70%, rgba(255,255,255,0.6) 100%)',
            minHeight: 280,
          }}
        >
          <Suspense fallback={
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 280 }}>
              <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(37,99,235,0.12)', animation: 'pulse 2s infinite' }} />
            </div>
          }>
            <BrainCanvasMini />
          </Suspense>
        </div>

        {/* Prediction Distribution */}
        <div style={{ ...glass, padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
            <div>
              <p style={{ fontSize: 13, fontWeight: 600, color: '#1a2a3a' }}>Class Distribution</p>
              <p style={{ fontSize: 11, color: '#16a34a', display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 12, height: 12 }}>{Icons.chevUp}</span> Model accuracy</p>
            </div>
            <button style={{ width: 28, height: 28, borderRadius: 10, background: 'rgba(26,42,58,0.04)', border: '0.5px solid rgba(26,42,58,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(26,42,58,0.4)', cursor: 'pointer' }}>
              <span style={{ width: 14, height: 14 }}>{Icons.arrow}</span>
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
            <DistChart />
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { label: 'CN — Normal',    pct: 40, color: '#2563eb' },
                { label: 'MCI — Impaired', pct: 35, color: '#f97316' },
                { label: 'Dementia',       pct: 25, color: '#ef4444' },
              ].map((d) => (
                <div key={d.label}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'rgba(26,42,58,0.5)', marginBottom: 3 }}>
                    <span>{d.label}</span><span>{d.pct}%</span>
                  </div>
                  <div style={{ height: 6, background: 'rgba(26,42,58,0.07)', borderRadius: 999, overflow: 'hidden' }}>
                    <div style={{ height: '100%', background: d.color, borderRadius: 999, width: `${d.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── bottom row ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1fr', gap: 16 }}>

        {/* Patient Demographics */}
        <div style={{ ...glass, padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 4 }}>
            <div>
              <p style={{ fontSize: 13, fontWeight: 600, color: '#1a2a3a' }}>Patient Demographics</p>
              <p style={{ fontSize: 11, color: 'rgba(26,42,58,0.4)' }}>{statistics?.totalPatients || '—'} Total Patients</p>
              <p style={{ fontSize: 11, color: '#f97316', marginTop: 2, display: 'flex', alignItems: 'center', gap: 2 }}><span style={{ width: 12, height: 12 }}>{Icons.chevDn}</span> 3.5%</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ display: 'flex', gap: 16 }}>
                {['18–30', '31–45', '46–60', '61–70', '70+'].map((ag, i) => {
                  const counts = [220, 195, 175, 130, 100];
                  return (
                    <div key={ag} style={{ textAlign: 'center' }}>
                      <p style={{ fontSize: 11, fontWeight: 700, color: '#1a2a3a' }}>{counts[i]}</p>
                      <p style={{ fontSize: 9, color: 'rgba(26,42,58,0.4)' }}>{ag}</p>
                    </div>
                  );
                })}
              </div>
              <button style={{ width: 28, height: 28, borderRadius: 10, background: '#2563eb', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer' }}>
                <svg style={{ width: 14, height: 14 }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/></svg>
              </button>
            </div>
          </div>
          <MiniBarChart />
          <div style={{ display: 'flex', gap: 16, marginTop: 8, flexWrap: 'wrap' }}>
            {[
              { label: '70+: 10.0%', color: 'rgba(37,99,235,0.4)' },
              { label: '18–30: 25.0%', color: 'rgba(37,99,235,0.55)' },
              { label: '51–70: 30.0%', color: 'rgba(37,99,235,0.7)' },
              { label: '31–50: 35.0%', color: 'rgba(37,99,235,0.85)' },
            ].map((l) => (
              <span key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10, color: 'rgba(26,42,58,0.4)' }}>
                <span style={{ width: 8, height: 8, borderRadius: 2, background: l.color, display: 'inline-block' }} />{l.label}
              </span>
            ))}
          </div>
        </div>

        {/* Ongoing + Awaiting */}
        <div style={{ ...glass, padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#2563eb', display: 'inline-block' }} />
              <p style={{ fontSize: 12, fontWeight: 600, color: '#1a2a3a' }}>Ongoing Treatments</p>
            </div>
            <div style={{ height: 6, background: 'rgba(26,42,58,0.07)', borderRadius: 999, overflow: 'hidden', marginBottom: 8 }}>
              <div style={{ height: '100%', background: 'linear-gradient(90deg, #93c5fd, #2563eb)', borderRadius: 999, width: '67%' }} />
            </div>
            <p style={{ fontSize: 11, color: 'rgba(26,42,58,0.45)' }}>
              <span style={{ fontWeight: 700, color: '#1a2a3a' }}>{statistics?.completedAppointments || 8}</span> active cases tracked
            </p>
            <div style={{ display: 'flex', marginTop: 12 }}>
              {['A','B','C','D'].map((l, i) => (
                <div key={i} style={{ width: 28, height: 28, borderRadius: '50%', background: ['#bfdbfe','#ddd6fe','#fbcfe8','#bbf7d0'][i], border: '2px solid rgba(255,255,255,0.8)', marginLeft: i > 0 ? -8 : 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: '#1a2a3a' }}>
                  {l}
                </div>
              ))}
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(26,42,58,0.07)', border: '2px solid rgba(255,255,255,0.8)', marginLeft: -8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: 'rgba(26,42,58,0.4)' }}>+4</div>
            </div>
          </div>

          <div style={{ borderTop: '0.5px solid rgba(26,42,58,0.06)', paddingTop: 16, flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#f97316', display: 'inline-block' }} />
              <p style={{ fontSize: 12, fontWeight: 600, color: '#1a2a3a' }}>Awaiting Follow-up</p>
            </div>
            <div style={{ height: 6, background: 'rgba(26,42,58,0.07)', borderRadius: 999, overflow: 'hidden', marginBottom: 8 }}>
              <div style={{ height: '100%', background: 'linear-gradient(90deg, #fed7aa, #f97316)', borderRadius: 999, width: '33%' }} />
            </div>
            <p style={{ fontSize: 11, color: 'rgba(26,42,58,0.45)' }}>
              <span style={{ fontWeight: 700, color: '#1a2a3a' }}>4</span> patients need review
            </p>
            <div style={{ display: 'flex', marginTop: 12 }}>
              {['E','F','G'].map((l, i) => (
                <div key={i} style={{ width: 28, height: 28, borderRadius: '50%', background: ['#fbcfe8','#bbf7d0','#ddd6fe'][i], border: '2px solid rgba(255,255,255,0.8)', marginLeft: i > 0 ? -8 : 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: '#1a2a3a' }}>
                  {l}
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
  const [selectedDate, setSelectedDate] = useState(5);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [activeView, setActiveView] = useState('overview');
  const [appointments, setAppointments] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);
  const [aiFullscreen, setAiFullscreen] = useState(false);
  const [aiPhase, setAiPhase] = useState('input'); // 'input' | 'results'
  const [selectedConversationId, setSelectedConversationId] = useState(null);
  const [messageDraft, setMessageDraft] = useState('');
  const [conversationOverrides, setConversationOverrides] = useState({}); // id -> appended messages

  const sidebarRef  = useRef(null);
  const navListRef  = useRef(null);
  const mainRef     = useRef(null);
  const contentRef  = useRef(null);
  const aiOverlayRef = useRef(null);

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

  /* ── mount: sidebar + main entrance ── */
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(sidebarRef.current,
        { x: -80, opacity: 0 },
        { x: 0, opacity: 1, duration: 1.1, ease: 'power3.out' }
      );
      gsap.fromTo(
        navListRef.current?.querySelectorAll('button') ?? [],
        { x: -32, opacity: 0 },
        { x: 0, opacity: 1, stagger: 0.1, duration: 0.6, ease: 'power2.out', delay: 0.5 }
      );
      gsap.fromTo(mainRef.current,
        { opacity: 0, y: 36 },
        { opacity: 1, y: 0, duration: 0.9, delay: 0.3, ease: 'power2.out' }
      );
    });
    return () => ctx.revert();
  }, []);

  /* ── view switch: content fade-slide ── */
  useEffect(() => {
    if (!contentRef.current) return;
    if (activeView === 'ai-diagnosis') return; // handled by cinematic transition
    gsap.fromTo(contentRef.current,
      { opacity: 0, y: 22 },
      { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }
    );
  }, [activeView]);

  /* ── cinematic enter: sidebar out-left, main out-right, then show overlay ── */
  const enterAIFullscreen = () => {
    const tl = gsap.timeline();
    tl.to(sidebarRef.current, {
      x: -340, opacity: 0, duration: 0.52, ease: 'power2.inOut',
    }, 0);
    tl.to(mainRef.current, {
      x: 120, opacity: 0, duration: 0.52, ease: 'power2.inOut',
    }, 0);
    tl.call(() => {
      // Show overlay — entrance animation handled by useEffect
      setAiFullscreen(true);
    });
  };

  /* ── cinematic exit: overlay out, then slide dashboard back in ── */
  const exitAIFullscreen = () => {
    if (aiOverlayRef.current) {
      gsap.to(aiOverlayRef.current, {
        opacity: 0, y: 30, duration: 0.4, ease: 'power2.in',
        onComplete: () => {
          setAiFullscreen(false);
          setActiveView('overview');
          // Restore dashboard positions and animate them back in
          gsap.set(sidebarRef.current, { x: -340, opacity: 0 });
          gsap.set(mainRef.current, { x: 120, opacity: 0 });
          gsap.to(sidebarRef.current, { x: 0, opacity: 1, duration: 0.6, ease: 'power3.out', delay: 0.05 });
          gsap.to(mainRef.current, { x: 0, opacity: 1, duration: 0.6, ease: 'power3.out', delay: 0.05 });
        },
      });
    }
  };

  /* AI overlay entrance animation (after React renders it) */
  useEffect(() => {
    if (aiFullscreen && aiOverlayRef.current) {
      gsap.fromTo(aiOverlayRef.current,
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, duration: 0.65, ease: 'power3.out' }
      );
    }
  }, [aiFullscreen]);

  // Dashboard runs entirely off the hardcoded mock roster — no backend round trip.
  // This keeps every section (Appointments, Patients, Schedule, Messages)
  // populated with the same 10-patient set including conversations.
  const fetchAppointments = async () => {
    setLoading(true);
    setError('');
    setAppointments(toMockAppointments());
    setLoading(false);
  };

  const fetchStatistics = async (userId) => {
    try {
      if (userId) {
        const response = await doctorsAPI.getStatistics(userId);
        if (response.data.success) setStatistics(response.data.statistics);
      }
    } catch {}
  };

  // Local-only update — works against the mock roster without needing a backend record.
  const handleUpdateAppointment = (appointmentId, updates) => {
    setAppointments(prev => prev.map(apt =>
      apt.id === appointmentId ? { ...apt, ...updates } : apt
    ));
    setSelectedAppointment(prev =>
      prev && prev.id === appointmentId ? { ...prev, ...updates } : prev
    );
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

  const statusColor = (s) => s === 'completed' ? '#16a34a' : s === 'current' ? '#2563eb' : '#f97316';
  const statusBg = (s) => s === 'completed' ? 'rgba(22,163,74,0.08)' : s === 'current' ? 'rgba(37,99,235,0.08)' : 'rgba(249,115,22,0.08)';

  return (
    <div style={{ minHeight: '100vh', width: '100%', background: 'linear-gradient(135deg, #c5d5e8 0%, #d4c5e2 35%, #e8c5d0 70%, #c5d8e8 100%)', position: 'relative', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
      {/* Atmospheric blobs */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
        <div style={{ position: 'absolute', width: 500, height: 500, borderRadius: '50%', background: 'rgba(180,160,220,0.3)', top: -120, left: -100, filter: 'blur(80px)' }} />
        <div style={{ position: 'absolute', width: 400, height: 400, borderRadius: '50%', background: 'rgba(240,180,200,0.25)', top: 60, right: -80, filter: 'blur(70px)' }} />
        <div style={{ position: 'absolute', width: 360, height: 360, borderRadius: '50%', background: 'rgba(160,200,230,0.25)', bottom: -60, left: '30%', filter: 'blur(70px)' }} />
      </div>

        {/* ══════════ FLOATING NAV PANEL ══════════ */}
        <aside ref={sidebarRef} style={{
          position: 'fixed',
          left: 24, top: '50%', transform: 'translateY(-50%)',
          zIndex: 100,
          width: 320,
          background: 'rgba(200,205,235,0.55)',
          backdropFilter: 'blur(28px)', WebkitBackdropFilter: 'blur(28px)',
          border: '1px solid rgba(255,255,255,0.45)',
          borderRadius: 28,
          boxShadow: '0 16px 56px rgba(80,80,140,0.18), 0 2px 12px rgba(80,80,140,0.1)',
          display: 'flex', flexDirection: 'column',
          padding: '28px 18px',
          maxHeight: 'calc(100vh - 48px)',
          overflowY: 'auto',
        }}>
          {/* Title */}
          <p style={{
            fontSize: 12, fontWeight: 800, letterSpacing: '0.13em',
            textTransform: 'uppercase', textAlign: 'center',
            color: '#1a2a3a', marginBottom: 22,
            fontFamily: 'ui-monospace, "SF Mono", monospace',
          }}>Navigation</p>

          {/* Nav items */}
          <div ref={navListRef} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {navItems.map((item) => (
              <NavItem
                key={item.view}
                view={item.view}
                label={item.label}
                icon={item.icon}
                activeView={activeView}
                onClick={(v) => {
                  if (v === 'ai-diagnosis') {
                    enterAIFullscreen();
                  } else {
                    setActiveView(v);
                  }
                }}
                badge={item.badge}
              />
            ))}
            <NavItem view="settings" label="Settings" icon={Icons.settings} activeView={activeView} onClick={setActiveView} />
          </div>

          {/* Divider + profile + logout */}
          <div style={{ marginTop: 20, borderTop: '1px solid rgba(255,255,255,0.4)', paddingTop: 18 }}>
            {/* Profile row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12, padding: '0 4px' }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 13, flexShrink: 0, background: 'linear-gradient(135deg, #93c5fd, #6366f1)' }}>
                {user?.name?.[0]?.toUpperCase() || 'D'}
              </div>
              <div style={{ minWidth: 0, flex: 1 }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: '#1a2a3a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name || 'Doctor'}</p>
                <p style={{ fontSize: 11, color: 'rgba(26,42,58,0.45)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.email || 'doctor@alzforesight.com'}</p>
              </div>
            </div>
            {/* Logout */}
            <button
              onClick={handleLogout}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                width: '100%', padding: '11px 20px', borderRadius: 999,
                background: 'rgba(255,255,255,0.7)', border: '1px solid rgba(220,38,38,0.25)',
                color: '#dc2626', fontSize: 13, fontWeight: 600,
                cursor: 'pointer', transition: 'all 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(254,226,226,0.9)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.7)'; }}
            >
              <span style={{ width: 15, height: 15, display: 'flex' }}>{Icons.logout}</span>
              Log Out
            </button>
          </div>
        </aside>

        {/* ══════════ MAIN CONTENT ══════════ */}
        <div ref={mainRef} style={{ position: 'relative', zIndex: 1, marginLeft: 368, minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'transparent' }}>

          {/* ── HEADER ── */}
          <div style={{ padding: '20px 20px 0' }}>
            <header style={{ height: 56, borderRadius: 16, display: 'flex', alignItems: 'center', gap: 16, padding: '0 20px', background: 'rgba(255,255,255,0.78)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', border: '0.5px solid rgba(255,255,255,0.7)' }}>
              {/* Search */}
              <div style={{ position: 'relative', flex: 1, maxWidth: 380 }}>
                <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', width: 16, height: 16, color: 'rgba(26,42,58,0.35)' }}>{Icons.search}</span>
                <input
                  type="text"
                  placeholder="Search patients, appointments…"
                  style={{ width: '100%', paddingLeft: 36, paddingRight: 16, paddingTop: 8, paddingBottom: 8, borderRadius: 12, fontSize: 13, background: 'rgba(26,42,58,0.04)', border: '0.5px solid rgba(26,42,58,0.08)', color: '#1a2a3a', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 'auto' }}>
                {/* Notification */}
                <button style={{ position: 'relative', width: 36, height: 36, borderRadius: 12, background: 'rgba(26,42,58,0.04)', border: '0.5px solid rgba(26,42,58,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(26,42,58,0.5)', cursor: 'pointer' }}>
                  <span style={{ width: 20, height: 20 }}>{Icons.bell}</span>
                  <span style={{ position: 'absolute', top: 8, right: 8, width: 6, height: 6, background: '#2563eb', borderRadius: '50%' }} />
                </button>
                {/* User icon */}
                <button style={{ width: 36, height: 36, borderRadius: 12, background: 'rgba(26,42,58,0.04)', border: '0.5px solid rgba(26,42,58,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(26,42,58,0.5)', cursor: 'pointer' }}>
                  <span style={{ width: 20, height: 20 }}>{Icons.user}</span>
                </button>
                {/* Date pill */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 12, background: 'rgba(26,42,58,0.04)', border: '0.5px solid rgba(26,42,58,0.07)' }}>
                  <svg style={{ width: 14, height: 14, color: 'rgba(26,42,58,0.35)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                  <span style={{ fontSize: 12, fontWeight: 500, color: 'rgba(26,42,58,0.5)' }}>
                    {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>
                {/* Action button */}
                <button
                  onClick={enterAIFullscreen}
                  style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', color: '#fff', fontSize: 13, fontWeight: 600, borderRadius: 12, background: '#2563eb', border: 'none', cursor: 'pointer', transition: 'background 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#1d4ed8'}
                  onMouseLeave={e => e.currentTarget.style.background = '#2563eb'}
                >
                  <span style={{ width: 16, height: 16 }}>{Icons.ai}</span>
                  Run AI Diagnosis
                </button>
              </div>
            </header>
          </div>

          {/* ── CONTENT AREA ── */}
          <main style={{ flex: 1, padding: '12px 20px 20px', overflowY: 'auto', background: 'transparent' }}>
            <div ref={contentRef} style={{
              background: 'rgba(200,205,235,0.55)',
              backdropFilter: 'blur(28px)',
              WebkitBackdropFilter: 'blur(28px)',
              borderRadius: 28,
              border: '1px solid rgba(255,255,255,0.45)',
              boxShadow: '0 16px 56px rgba(80,80,140,0.18), 0 2px 12px rgba(80,80,140,0.1)',
              padding: 28,
              minHeight: 'calc(100vh - 112px)',
            }}>

            {/* ── OVERVIEW — always mounted to keep 3D brain alive ── */}
            <div style={{ display: activeView === 'overview' ? 'block' : 'none' }}>
              <div style={{ marginBottom: 20 }}>
                <h2 style={{ fontSize: 32, fontWeight: 700, color: '#1a2a3a' }}>Overview</h2>
                <p style={{ fontSize: 12, color: 'rgba(26,42,58,0.4)', marginTop: 2 }}>Welcome back, Dr. {user?.name?.split(' ')[0] || 'Doctor'}</p>
              </div>
              <OverviewView statistics={statistics} appointments={appointments} loading={loading} />
            </div>

            {/* ── APPOINTMENTS ── */}
            {activeView === 'appointments' && (
              <>
                <div style={{ marginBottom: 20 }}>
                  <h2 style={{ fontSize: 24, fontWeight: 700, color: '#1a2a3a' }}>Appointments</h2>
                  <p style={{ fontSize: 12, color: 'rgba(26,42,58,0.4)', marginTop: 2 }}>{loading ? 'Loading…' : `${appointments.length} appointments found`}</p>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: 16 }}>
                  {/* list */}
                  <div style={{ ...glass, padding: 24 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                      <p style={{ fontSize: 13, fontWeight: 600, color: '#1a2a3a' }}>All Appointments</p>
                      <button style={{ fontSize: 12, color: '#2563eb', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500 }}>Show all</button>
                    </div>
                    {loading ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>{[...Array(5)].map((_, i) => <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'center' }}><div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(26,42,58,0.08)', animation: 'pulse 2s infinite' }}/><div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}><Sk w="w-32"/><Sk w="w-20" h="h-2"/></div></div>)}</div>
                    ) : error ? (
                      <p style={{ fontSize: 13, color: '#ef4444', textAlign: 'center', padding: '32px 0' }}>{error}</p>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        {appointments.map((apt) => (
                          <div
                            key={apt.id}
                            onClick={() => setSelectedAppointment(apt)}
                            style={{
                              display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 14, cursor: 'pointer', transition: 'all 0.15s',
                              background: selectedAppointment?.id === apt.id ? 'rgba(37,99,235,0.08)' : 'transparent',
                              border: selectedAppointment?.id === apt.id ? '0.5px solid rgba(37,99,235,0.15)' : '0.5px solid transparent',
                            }}
                            onMouseEnter={e => { if (selectedAppointment?.id !== apt.id) e.currentTarget.style.background = 'rgba(26,42,58,0.03)'; }}
                            onMouseLeave={e => { if (selectedAppointment?.id !== apt.id) e.currentTarget.style.background = 'transparent'; }}
                          >
                            <p style={{ fontSize: 11, color: 'rgba(26,42,58,0.4)', width: 56, flexShrink: 0 }}>{apt.time}</p>
                            <div style={{ width: 8, height: 8, borderRadius: '50%', flexShrink: 0, background: statusColor(apt.status) }} />
                            <img src={apt.avatar} alt={apt.patientName} style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <p style={{ fontSize: 13, fontWeight: 500, color: '#1a2a3a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{apt.patientName}</p>
                              <p style={{ fontSize: 11, color: 'rgba(26,42,58,0.4)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{apt.condition}</p>
                            </div>
                            <div style={{ padding: '3px 10px', borderRadius: 999, fontSize: 10, fontWeight: 600, flexShrink: 0, background: statusBg(apt.status), color: statusColor(apt.status) }}>
                              {apt.status}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  {/* detail */}
                  <div style={{ ...glass, padding: 24 }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: '#1a2a3a', marginBottom: 12 }}>Ongoing Appointment</p>
                    {selectedAppointment && currentPatient ? (
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: 16 }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                            <img src={selectedAppointment.avatar} alt={currentPatient.name} style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover' }} />
                            <div>
                              <p style={{ fontSize: 13, fontWeight: 600, color: '#1a2a3a' }}>{currentPatient.name}</p>
                              <p style={{ fontSize: 11, color: 'rgba(26,42,58,0.45)' }}>{currentPatient.condition}</p>
                            </div>
                          </div>
                          {[['Age', currentPatient.age],['Time', currentPatient.time],['MRN', currentPatient.mrn],['Type', currentPatient.type]].map(([k, v]) => (
                            <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, borderBottom: '0.5px solid rgba(26,42,58,0.05)', paddingBottom: 6 }}>
                              <span style={{ color: 'rgba(26,42,58,0.45)' }}>{k}</span>
                              <span style={{ color: '#1a2a3a', fontWeight: 600 }}>{v}</span>
                            </div>
                          ))}
                          <div style={{ marginTop: 8 }}>
                            <p style={{ fontSize: 11, color: 'rgba(26,42,58,0.45)', marginBottom: 4 }}>Special Note</p>
                            <p style={{ fontSize: 12, color: '#1a2a3a', lineHeight: 1.6 }}>{currentPatient.specialNote}</p>
                          </div>
                          <div style={{ padding: 12, borderRadius: 14, background: 'rgba(26,42,58,0.03)', border: '0.5px solid rgba(26,42,58,0.06)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                              <span style={{ fontSize: 12, color: 'rgba(26,42,58,0.5)' }}>Fee — {currentPatient.fee}</span>
                              <span style={{ padding: '2px 8px', borderRadius: 999, fontSize: 10, fontWeight: 600, background: currentPatient.paymentStatus === 'Paid' ? 'rgba(22,163,74,0.08)' : 'rgba(249,115,22,0.08)', color: currentPatient.paymentStatus === 'Paid' ? '#16a34a' : '#f97316' }}>{currentPatient.paymentStatus}</span>
                            </div>
                          </div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <p style={{ fontSize: 12, color: 'rgba(26,42,58,0.45)', marginBottom: 8 }}>Consultation Notes</p>
                          <div style={{ background: 'rgba(26,42,58,0.03)', borderRadius: 14, padding: 12, flex: 1, overflowY: 'auto', marginBottom: 12, border: '0.5px solid rgba(26,42,58,0.06)' }}>
                            <p style={{ fontSize: 12, color: '#1a2a3a', lineHeight: 1.7 }}>Patient presents with cognitive assessment scores requiring evaluation. Recommend follow-up neurological testing and review of current medication regimen.</p>
                          </div>
                          <div style={{ display: 'flex', gap: 8 }}>
                            <button
                              onClick={() => handleUpdateAppointment(selectedAppointment.id, { status: 'rescheduled' })}
                              style={{ flex: 1, padding: '10px 0', borderRadius: 12, border: '0.5px solid rgba(26,42,58,0.12)', fontSize: 12, fontWeight: 500, color: 'rgba(26,42,58,0.6)', background: 'transparent', cursor: 'pointer', transition: 'background 0.15s' }}
                              onMouseEnter={e => e.currentTarget.style.background = 'rgba(26,42,58,0.04)'}
                              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                            >
                              Reschedule
                            </button>
                            <button
                              onClick={() => handleUpdateAppointment(selectedAppointment.id, { status: 'completed' })}
                              style={{ flex: 1, padding: '10px 0', borderRadius: 12, background: '#2563eb', color: '#fff', fontSize: 12, fontWeight: 600, border: 'none', cursor: 'pointer', transition: 'background 0.15s' }}
                              onMouseEnter={e => e.currentTarget.style.background = '#1d4ed8'}
                              onMouseLeave={e => e.currentTarget.style.background = '#2563eb'}
                            >
                              Finish
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 256 }}>
                        <div style={{ textAlign: 'center', color: 'rgba(26,42,58,0.2)' }}>
                          <svg style={{ width: 48, height: 48, margin: '0 auto 8px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
                          <p style={{ fontSize: 13 }}>Select an appointment</p>
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
                <div style={{ marginBottom: 20 }}>
                  <h2 style={{ fontSize: 24, fontWeight: 700, color: '#1a2a3a' }}>Patient Management</h2>
                  <p style={{ fontSize: 12, color: 'rgba(26,42,58,0.4)', marginTop: 2 }}>All registered patients</p>
                </div>
                {loading ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>{[...Array(4)].map((_, i) => <div key={i} style={{ ...glass, padding: 16, display: 'flex', gap: 16, alignItems: 'center' }}><div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(26,42,58,0.08)', animation: 'pulse 2s infinite' }}/><div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}><Sk w="w-40"/><Sk w="w-24" h="h-2"/></div></div>)}</div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {appointments.map((apt) => (
                      <div
                        key={apt.id}
                        style={{ ...glass, padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 16, cursor: 'pointer', transition: 'all 0.15s' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.8)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.65)'}
                      >
                        <img src={apt.avatar} alt={apt.patientName} style={{ width: 52, height: 52, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontSize: 14, fontWeight: 600, color: '#1a2a3a' }}>{apt.patientName}</p>
                          <p style={{ fontSize: 11, color: 'rgba(26,42,58,0.45)', marginTop: 2 }}>MRN: {apt.patientDetails?.mrn || 'N/A'}</p>
                          <p style={{ fontSize: 11, color: 'rgba(26,42,58,0.45)' }}>{apt.patientDetails?.age || 'N/A'}</p>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <p style={{ fontSize: 13, fontWeight: 500, color: '#1a2a3a' }}>{apt.condition}</p>
                          <p style={{ fontSize: 11, marginTop: 2, color: apt.patientDetails?.paymentStatus === 'Paid' ? '#16a34a' : '#f97316' }}>{apt.patientDetails?.paymentStatus}</p>
                        </div>
                        <button style={{ padding: '8px 16px', background: '#2563eb', color: '#fff', fontSize: 12, fontWeight: 600, borderRadius: 12, border: 'none', cursor: 'pointer', marginLeft: 8, transition: 'background 0.15s' }}
                          onMouseEnter={e => e.target.style.background = '#1d4ed8'}
                          onMouseLeave={e => e.target.style.background = '#2563eb'}
                        >
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
                <div style={{ marginBottom: 20 }}>
                  <h2 style={{ fontSize: 24, fontWeight: 700, color: '#1a2a3a' }}>Calendar & Schedule</h2>
                  <p style={{ fontSize: 12, color: 'rgba(26,42,58,0.4)', marginTop: 2 }}>Manage appointments</p>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '500px 1fr', gap: 20, alignItems: 'start' }}>
                  {/* calendar widget */}
                  <div style={{ ...glass, padding: 28 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
                      <h3 style={{ fontSize: 17, fontWeight: 700, color: '#1a2a3a' }}>December 2025</h3>
                      <div style={{ display: 'flex', gap: 8 }}>
                        {['M15 19l-7-7 7-7', 'M9 5l7 7-7 7'].map((d, i) => (
                          <button key={i} style={{ width: 36, height: 36, background: 'rgba(26,42,58,0.04)', border: '0.5px solid rgba(26,42,58,0.1)', color: 'rgba(26,42,58,0.5)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                            <svg style={{ width: 14, height: 14 }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d={d}/></svg>
                          </button>
                        ))}
                      </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 8, marginBottom: 8 }}>
                      {days.map((d) => <div key={d} style={{ textAlign: 'center', fontSize: 12, color: 'rgba(26,42,58,0.4)', fontWeight: 600, padding: '4px 0' }}>{d.slice(0,2)}</div>)}
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 8 }}>
                      {dates.flat().map((date, idx) => {
                        const dayCount = date ? appointments.filter(a => a.dateNum === date).length : 0;
                        return (
                        <button
                          key={idx}
                          onClick={() => date && setSelectedDate(date)}
                          style={{
                            width: '100%', height: 44, position: 'relative',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            borderRadius: 14, fontSize: 14, fontWeight: 500,
                            cursor: date ? 'pointer' : 'default',
                            visibility: date ? 'visible' : 'hidden',
                            background: date === selectedDate ? '#2563eb' : 'transparent',
                            color: date === selectedDate ? '#fff' : '#1a2a3a',
                            border: 'none',
                            transition: 'all 0.15s',
                          }}
                          onMouseEnter={e => { if (date && date !== selectedDate) e.currentTarget.style.background = 'rgba(26,42,58,0.05)'; }}
                          onMouseLeave={e => { if (date && date !== selectedDate) e.currentTarget.style.background = 'transparent'; }}
                        >
                          {date}
                          {dayCount > 0 && (
                            <span style={{
                              position: 'absolute', bottom: 6, left: '50%', transform: 'translateX(-50%)',
                              width: 4, height: 4, borderRadius: '50%',
                              background: date === selectedDate ? '#fff' : '#2563eb',
                            }} />
                          )}
                        </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* appointments list — filtered by the selected calendar day */}
                  {(() => {
                    const dayApts = appointments
                      .filter(a => a.dateNum === selectedDate)
                      .sort((a, b) => a.time.localeCompare(b.time));
                    return (
                  <div style={{ ...glass, padding: 24 }}>
                    <p style={{ fontSize: 14, fontWeight: 600, color: '#1a2a3a', marginBottom: 16 }}>
                      Appointments — <span style={{ color: '#2563eb' }}>Dec {selectedDate}</span>
                      <span style={{ fontSize: 11, color: 'rgba(26,42,58,0.4)', fontWeight: 500, marginLeft: 8 }}>· {dayApts.length} scheduled</span>
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {dayApts.length === 0 ? (
                        <p style={{ fontSize: 13, color: 'rgba(26,42,58,0.35)', textAlign: 'center', padding: '40px 0' }}>No appointments for this day</p>
                      ) : dayApts.map((apt) => (
                        <div key={apt.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 16px', background: 'rgba(26,42,58,0.03)', borderRadius: 16, border: '0.5px solid rgba(26,42,58,0.05)', cursor: 'pointer', transition: 'all 0.15s' }}
                          onMouseEnter={e => e.currentTarget.style.background = 'rgba(26,42,58,0.06)'}
                          onMouseLeave={e => e.currentTarget.style.background = 'rgba(26,42,58,0.03)'}
                        >
                          <span style={{ fontSize: 12, color: 'rgba(26,42,58,0.45)', width: 72, flexShrink: 0, fontWeight: 500 }}>{apt.time}</span>
                          <span style={{ width: 8, height: 8, borderRadius: '50%', flexShrink: 0, background: statusColor(apt.status) }} />
                          <img src={apt.avatar} alt={apt.patientName} style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ fontSize: 13, fontWeight: 600, color: '#1a2a3a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{apt.patientName}</p>
                            <p style={{ fontSize: 11, color: 'rgba(26,42,58,0.4)', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{apt.condition}</p>
                          </div>
                          <span style={{ padding: '4px 12px', borderRadius: 999, fontSize: 11, fontWeight: 600, flexShrink: 0, background: statusBg(apt.status), color: statusColor(apt.status) }}>
                            {apt.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                    );
                  })()}
                </div>
              </>
            )}

            {/* ── REPORTS ── */}
            {activeView === 'reports' && (() => {
              const kpis = [
                { label: 'Lab Results',     count: 48,  delta: '+12%', positive: true,  color: '#2563eb', bg: 'rgba(37,99,235,0.10)',  spark: [12, 14, 11, 16, 18, 17, 22, 24], iconPath: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
                { label: 'Imaging Studies', count: 23,  delta: '+3',   positive: true,  color: '#7c3aed', bg: 'rgba(124,58,237,0.10)', spark: [5, 6, 4, 7, 8, 7, 9, 11],         iconPath: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
                { label: 'Prescriptions',   count: 156, delta: '+8%',  positive: true,  color: '#16a34a', bg: 'rgba(22,163,74,0.10)',  spark: [120, 128, 132, 134, 141, 145, 150, 156], iconPath: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
                { label: 'Critical Flags',  count: 4,   delta: '-1',   positive: true,  color: '#ef4444', bg: 'rgba(239,68,68,0.10)',  spark: [7, 8, 6, 6, 5, 5, 5, 4],          iconPath: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z' },
              ];

              const reportTypes = [
                { label: 'Lab Results',     count: 48,  pct: 48 / 325 * 100, color: '#2563eb' },
                { label: 'Prescriptions',   count: 156, pct: 156 / 325 * 100, color: '#16a34a' },
                { label: 'Visit History',   count: 98,  pct: 98 / 325 * 100, color: '#f97316' },
                { label: 'Imaging Studies', count: 23,  pct: 23 / 325 * 100, color: '#7c3aed' },
              ];

              const recentReports = appointments.slice(0, 8).map((apt, i) => {
                const types = [
                  { type: 'Lab Panel',       color: '#2563eb', bg: 'rgba(37,99,235,0.10)' },
                  { type: 'MRI Scan',        color: '#7c3aed', bg: 'rgba(124,58,237,0.10)' },
                  { type: 'Prescription',    color: '#16a34a', bg: 'rgba(22,163,74,0.10)' },
                  { type: 'Visit Note',      color: '#f97316', bg: 'rgba(249,115,22,0.10)' },
                  { type: 'Cognitive Test',  color: '#0ea5e9', bg: 'rgba(14,165,233,0.10)' },
                  { type: 'Genetic Panel',   color: '#ec4899', bg: 'rgba(236,72,153,0.10)' },
                ];
                const t = types[i % types.length];
                const ages = ['2h ago', '5h ago', 'Yesterday', '2d ago', '3d ago', '5d ago', '1w ago', '2w ago'];
                return { ...apt, reportType: t.type, typeColor: t.color, typeBg: t.bg, when: ages[i] || `${i}d ago` };
              });

              const criticalFindings = [
                { patient: 'David Okonkwo',   note: 'CDR-SB rose from 1.5 → 2.5 over 6 months — escalate review',       severity: 'high' },
                { patient: 'Sofia Bianchi',   note: 'Caregiver burnout flagged — schedule respite consult',              severity: 'medium' },
                { patient: 'Walter Ekstrand', note: 'Wandering incident reported — safety plan urgent',                  severity: 'high' },
                { patient: 'Theodore Park',   note: 'Lecanemab month-3 MRI due in 5 days — watch for ARIA',              severity: 'medium' },
              ];

              const sevColor = (s) => s === 'high' ? '#ef4444' : '#f97316';
              const sevBg    = (s) => s === 'high' ? 'rgba(239,68,68,0.06)' : 'rgba(249,115,22,0.06)';
              const sevBorder= (s) => s === 'high' ? 'rgba(239,68,68,0.18)' : 'rgba(249,115,22,0.18)';

              return (
                <>
                  <div style={{ marginBottom: 20, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16 }}>
                    <div>
                      <h2 style={{ fontSize: 24, fontWeight: 700, color: '#1a2a3a' }}>Medical Reports</h2>
                      <p style={{ fontSize: 12, color: 'rgba(26,42,58,0.4)', marginTop: 2 }}>Clinical record overview — last 30 days</p>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button style={{ padding: '8px 14px', borderRadius: 12, border: '0.5px solid rgba(26,42,58,0.10)', background: 'rgba(255,255,255,0.6)', fontSize: 12, fontWeight: 500, color: '#1a2a3a', cursor: 'pointer' }}>Last 30 days ▾</button>
                      <button style={{ padding: '8px 14px', borderRadius: 12, border: 'none', background: '#2563eb', color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                        <svg style={{ width: 13, height: 13 }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
                        Export
                      </button>
                    </div>
                  </div>

                  {/* ── KPI strip ── */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 16 }}>
                    {kpis.map(k => {
                      const maxV = Math.max(...k.spark);
                      return (
                        <div key={k.label} style={{ ...glass, padding: 18, transition: 'all 0.15s', cursor: 'pointer' }}
                          onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.82)'}
                          onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.65)'}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                            <div style={{ width: 34, height: 34, background: k.bg, borderRadius: 11, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <svg style={{ width: 16, height: 16, color: k.color }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={k.iconPath}/></svg>
                            </div>
                            <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 999, background: k.positive ? 'rgba(22,163,74,0.10)' : 'rgba(239,68,68,0.10)', color: k.positive ? '#16a34a' : '#ef4444' }}>{k.delta}</span>
                          </div>
                          <p style={{ fontSize: 26, fontWeight: 700, color: '#1a2a3a', lineHeight: 1 }}>{k.count}</p>
                          <p style={{ fontSize: 11, color: 'rgba(26,42,58,0.5)', marginTop: 4, marginBottom: 10 }}>{k.label}</p>
                          {/* sparkline */}
                          <svg viewBox={`0 0 ${(k.spark.length - 1) * 14} 30`} style={{ width: '100%', height: 30, display: 'block' }} preserveAspectRatio="none">
                            <defs>
                              <linearGradient id={`spark-${k.label}`} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor={k.color} stopOpacity="0.30" />
                                <stop offset="100%" stopColor={k.color} stopOpacity="0" />
                              </linearGradient>
                            </defs>
                            <polyline
                              fill="none" stroke={k.color} strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round"
                              points={k.spark.map((v, i) => `${i * 14},${30 - (v / maxV) * 28}`).join(' ')}
                            />
                            <polygon
                              fill={`url(#spark-${k.label})`}
                              points={`0,30 ${k.spark.map((v, i) => `${i * 14},${30 - (v / maxV) * 28}`).join(' ')} ${(k.spark.length - 1) * 14},30`}
                            />
                          </svg>
                        </div>
                      );
                    })}
                  </div>

                  {/* ── middle row: recent + distribution ── */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1.55fr 1fr', gap: 16, marginBottom: 16 }}>
                    {/* Recent Reports */}
                    <div style={{ ...glass, padding: 20 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                        <div>
                          <p style={{ fontSize: 14, fontWeight: 700, color: '#1a2a3a' }}>Recent Reports</p>
                          <p style={{ fontSize: 11, color: 'rgba(26,42,58,0.4)', marginTop: 2 }}>Latest activity across all patients</p>
                        </div>
                        <button style={{ fontSize: 12, fontWeight: 600, color: '#2563eb', background: 'none', border: 'none', cursor: 'pointer' }}>View all →</button>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {recentReports.map((r, i) => (
                          <div key={r.id + '-' + i} style={{
                            display: 'flex', alignItems: 'center', gap: 12,
                            padding: '10px 12px', borderRadius: 12,
                            background: 'rgba(26,42,58,0.025)',
                            border: '0.5px solid rgba(26,42,58,0.04)',
                            cursor: 'pointer', transition: 'all 0.15s',
                          }}
                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(26,42,58,0.05)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'rgba(26,42,58,0.025)'}
                          >
                            <img src={r.avatar} alt={r.patientName} style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <p style={{ fontSize: 13, fontWeight: 600, color: '#1a2a3a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.patientName}</p>
                              <p style={{ fontSize: 11, color: 'rgba(26,42,58,0.45)', marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.condition}</p>
                            </div>
                            <span style={{ padding: '4px 10px', borderRadius: 999, fontSize: 10, fontWeight: 700, background: r.typeBg, color: r.typeColor, flexShrink: 0 }}>{r.reportType}</span>
                            <span style={{ fontSize: 11, color: 'rgba(26,42,58,0.4)', minWidth: 70, textAlign: 'right', flexShrink: 0 }}>{r.when}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Distribution */}
                    <div style={{ ...glass, padding: 20 }}>
                      <p style={{ fontSize: 14, fontWeight: 700, color: '#1a2a3a' }}>Reports by Type</p>
                      <p style={{ fontSize: 11, color: 'rgba(26,42,58,0.4)', marginTop: 2, marginBottom: 18 }}>325 total this period</p>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                        {reportTypes.map(rt => (
                          <div key={rt.label}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
                              <span style={{ fontSize: 12, fontWeight: 600, color: '#1a2a3a' }}>{rt.label}</span>
                              <span style={{ fontSize: 12, fontWeight: 700, color: rt.color }}>{rt.count}</span>
                            </div>
                            <div style={{ width: '100%', height: 8, background: 'rgba(26,42,58,0.06)', borderRadius: 999, overflow: 'hidden' }}>
                              <div style={{ height: '100%', borderRadius: 999, width: `${rt.pct}%`, background: `linear-gradient(90deg, ${rt.color}, ${rt.color}dd)`, transition: 'width 0.6s ease' }} />
                            </div>
                          </div>
                        ))}
                      </div>
                      <div style={{ marginTop: 22, padding: 14, borderRadius: 14, background: 'rgba(37,99,235,0.05)', border: '0.5px solid rgba(37,99,235,0.12)' }}>
                        <p style={{ fontSize: 11, color: '#1d4ed8', fontWeight: 600, marginBottom: 4 }}>Insight</p>
                        <p style={{ fontSize: 12, color: '#1a2a3a', lineHeight: 1.55 }}>Prescription volume is up <strong>8%</strong> vs. last month — driven mostly by AD treatment adjustments.</p>
                      </div>
                    </div>
                  </div>

                  {/* ── Critical Findings ── */}
                  <div style={{ ...glass, padding: 20 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                      <div style={{ width: 26, height: 26, borderRadius: 9, background: 'rgba(239,68,68,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <svg style={{ width: 14, height: 14, color: '#ef4444' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: 14, fontWeight: 700, color: '#1a2a3a' }}>Critical Findings</p>
                        <p style={{ fontSize: 11, color: 'rgba(26,42,58,0.4)' }}>Items flagged for review this week</p>
                      </div>
                      <span style={{ fontSize: 11, fontWeight: 700, color: '#ef4444', padding: '4px 10px', borderRadius: 999, background: 'rgba(239,68,68,0.10)' }}>{criticalFindings.length} active</span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
                      {criticalFindings.map((c, i) => (
                        <div key={i} style={{ padding: '12px 14px', borderRadius: 12, background: sevBg(c.severity), border: `0.5px solid ${sevBorder(c.severity)}`, display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                          <div style={{ width: 6, height: 6, borderRadius: '50%', background: sevColor(c.severity), marginTop: 6, flexShrink: 0 }} />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ fontSize: 13, fontWeight: 600, color: '#1a2a3a' }}>{c.patient}</p>
                            <p style={{ fontSize: 11, color: 'rgba(26,42,58,0.65)', marginTop: 2, lineHeight: 1.5 }}>{c.note}</p>
                          </div>
                          <span style={{ fontSize: 10, fontWeight: 700, color: sevColor(c.severity), padding: '2px 8px', borderRadius: 999, background: '#fff', textTransform: 'uppercase', letterSpacing: '0.04em', flexShrink: 0 }}>{c.severity}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              );
            })()}

            {/* ── MESSAGES ── */}
            {activeView === 'messages' && (() => {
              const selectedConvo = appointments.find(a => a.id === selectedConversationId) || null;
              const baseMessages = selectedConvo?.messages || [];
              const extraMessages = conversationOverrides[selectedConversationId] || [];
              const allMessages = [...baseMessages, ...extraMessages];

              const sendMessage = () => {
                const text = messageDraft.trim();
                if (!text || !selectedConvo) return;
                const now = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
                setConversationOverrides(prev => ({
                  ...prev,
                  [selectedConvo.id]: [...(prev[selectedConvo.id] || []), { from: 'doctor', time: now, text }],
                }));
                setMessageDraft('');
              };

              return (
                <>
                  <div style={{ marginBottom: 20 }}>
                    <h2 style={{ fontSize: 24, fontWeight: 700, color: '#1a2a3a' }}>Messages</h2>
                    <p style={{ fontSize: 12, color: 'rgba(26,42,58,0.4)', marginTop: 2 }}>Patient communications</p>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 16, height: 'calc(100vh - 220px)' }}>
                    {/* ── conversation list ── */}
                    <div style={{ ...glass, padding: 16, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                      <input type="text" placeholder="Search patients…" style={{ width: '100%', padding: '9px 12px', background: 'rgba(26,42,58,0.04)', border: '0.5px solid rgba(26,42,58,0.08)', borderRadius: 12, fontSize: 13, color: '#1a2a3a', outline: 'none', marginBottom: 12, boxSizing: 'border-box' }} />
                      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 4 }}>
                        {appointments.map((apt) => {
                          const last = apt.messages?.[apt.messages.length - 1];
                          const isActive = selectedConversationId === apt.id;
                          return (
                            <div
                              key={apt.id}
                              onClick={() => setSelectedConversationId(apt.id)}
                              style={{
                                padding: 12, borderRadius: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12,
                                background: isActive ? 'rgba(37,99,235,0.10)' : 'rgba(26,42,58,0.03)',
                                border: isActive ? '0.5px solid rgba(37,99,235,0.20)' : '0.5px solid transparent',
                                transition: 'all 0.15s',
                              }}
                              onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'rgba(26,42,58,0.06)'; }}
                              onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'rgba(26,42,58,0.03)'; }}
                            >
                              <img src={apt.avatar} alt={apt.patientName} style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 6 }}>
                                  <p style={{ fontSize: 13, fontWeight: 600, color: '#1a2a3a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{apt.patientName}</p>
                                  <span style={{ fontSize: 10, color: 'rgba(26,42,58,0.4)', flexShrink: 0 }}>{last?.time || ''}</span>
                                </div>
                                <p style={{ fontSize: 11, color: 'rgba(26,42,58,0.55)', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                  {last ? (last.from === 'doctor' ? 'You: ' : '') + last.text : 'No messages yet'}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* ── chat pane ── */}
                    <div style={{ ...glass, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                      {selectedConvo ? (
                        <>
                          {/* header */}
                          <div style={{ padding: '16px 20px', borderBottom: '0.5px solid rgba(26,42,58,0.08)', display: 'flex', alignItems: 'center', gap: 12 }}>
                            <img src={selectedConvo.avatar} alt={selectedConvo.patientName} style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover' }} />
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <p style={{ fontSize: 14, fontWeight: 600, color: '#1a2a3a' }}>{selectedConvo.patientName}</p>
                              <p style={{ fontSize: 11, color: 'rgba(26,42,58,0.45)' }}>{selectedConvo.condition} · {selectedConvo.patientDetails?.age}</p>
                            </div>
                            <span style={{ padding: '4px 10px', borderRadius: 999, fontSize: 10, fontWeight: 600, background: statusBg(selectedConvo.status), color: statusColor(selectedConvo.status) }}>
                              {selectedConvo.status}
                            </span>
                          </div>

                          {/* messages */}
                          <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                            {allMessages.map((m, i) => {
                              const isDoctor = m.from === 'doctor';
                              return (
                                <div key={i} style={{ display: 'flex', justifyContent: isDoctor ? 'flex-end' : 'flex-start' }}>
                                  <div style={{ maxWidth: '70%' }}>
                                    <div style={{
                                      padding: '10px 14px', borderRadius: 16,
                                      borderBottomRightRadius: isDoctor ? 4 : 16,
                                      borderBottomLeftRadius: isDoctor ? 16 : 4,
                                      background: isDoctor ? '#2563eb' : 'rgba(26,42,58,0.06)',
                                      color: isDoctor ? '#fff' : '#1a2a3a',
                                      fontSize: 13, lineHeight: 1.55,
                                    }}>{m.text}</div>
                                    <p style={{ fontSize: 10, color: 'rgba(26,42,58,0.4)', marginTop: 4, textAlign: isDoctor ? 'right' : 'left' }}>{m.time}</p>
                                  </div>
                                </div>
                              );
                            })}
                            {allMessages.length === 0 && (
                              <p style={{ fontSize: 12, color: 'rgba(26,42,58,0.4)', textAlign: 'center', marginTop: 40 }}>No messages yet — start the conversation below.</p>
                            )}
                          </div>

                          {/* composer */}
                          <div style={{ padding: '14px 18px', borderTop: '0.5px solid rgba(26,42,58,0.08)', display: 'flex', gap: 10 }}>
                            <input
                              type="text"
                              value={messageDraft}
                              onChange={e => setMessageDraft(e.target.value)}
                              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                              placeholder={`Message ${selectedConvo.patientName.split(' ')[0]}…`}
                              style={{ flex: 1, padding: '10px 14px', background: 'rgba(26,42,58,0.04)', border: '0.5px solid rgba(26,42,58,0.08)', borderRadius: 12, fontSize: 13, color: '#1a2a3a', outline: 'none', boxSizing: 'border-box' }}
                            />
                            <button
                              onClick={sendMessage}
                              disabled={!messageDraft.trim()}
                              style={{
                                padding: '10px 20px', borderRadius: 12, border: 'none',
                                background: messageDraft.trim() ? '#2563eb' : 'rgba(37,99,235,0.4)',
                                color: '#fff', fontSize: 13, fontWeight: 600,
                                cursor: messageDraft.trim() ? 'pointer' : 'not-allowed',
                                transition: 'background 0.15s',
                              }}
                            >Send</button>
                          </div>
                        </>
                      ) : (
                        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <div style={{ textAlign: 'center', color: 'rgba(26,42,58,0.25)' }}>
                            <svg style={{ width: 56, height: 56, margin: '0 auto 12px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/></svg>
                            <p style={{ fontSize: 13 }}>Select a conversation to start chatting</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              );
            })()}

            </div>
          </main>
        </div>

      {/* ══════════ AI FULLSCREEN OVERLAY ══════════ */}
      {aiFullscreen && (
        <div
          ref={aiOverlayRef}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 200,
            overflowY: 'auto',
            background: 'linear-gradient(135deg, #c5d5e8 0%, #d4c5e2 35%, #e8c5d0 70%, #c5d8e8 100%)',
          }}
        >
          {/* Atmospheric blobs */}
          <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
            <div style={{ position: 'absolute', width: 600, height: 600, borderRadius: '50%', background: 'rgba(180,160,220,0.28)', top: -150, left: -120, filter: 'blur(100px)' }} />
            <div style={{ position: 'absolute', width: 500, height: 500, borderRadius: '50%', background: 'rgba(240,180,200,0.22)', top: 80, right: -100, filter: 'blur(90px)' }} />
            <div style={{ position: 'absolute', width: 400, height: 400, borderRadius: '50%', background: 'rgba(160,200,230,0.22)', bottom: -80, left: '30%', filter: 'blur(80px)' }} />
          </div>

          {/* AIDiagnosis — manages its own input/results phases */}
          <AIDiagnosis
            onBack={exitAIFullscreen}
            onPhaseChange={(p) => setAiPhase(p)}
          />
        </div>
      )}
    </div>
  );
}

export default DoctorManagement;
