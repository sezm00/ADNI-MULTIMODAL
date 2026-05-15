import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';

const NAV_ICONS = {
  activities: (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="5" r="2"/>
      <path d="M5 12c1.5-1 3.5-1.5 4-1l3 4 3-4c.5-.5 2.5 0 4 1"/>
      <path d="M9 11l-2 6"/>
      <path d="M15 11l2 6"/>
    </svg>
  ),
  appointments: (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
      <line x1="16" y1="2" x2="16" y2="6"/>
      <line x1="8" y1="2" x2="8" y2="6"/>
      <line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  ),
  medications: (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
    </svg>
  ),
};

const NAV = [
  { view: 'activities',   label: 'Daily Activities' },
  { view: 'appointments', label: 'Appointments'     },
  { view: 'medications',  label: 'Medications'      },
];

/* ─── NavItem — full pill, Explore Categories style ─── */
function NavItem({ view, label, activeView, onClick }) {
  const active = activeView === view;
  return (
    <button
      onClick={() => onClick(view)}
      style={{
        display: 'flex', alignItems: 'center', gap: 18,
        padding: '15px 22px',
        borderRadius: 999,
        background: 'rgba(255,255,255,0.88)',
        border: active ? '1.5px solid rgba(26,42,58,0.18)' : '1.5px solid rgba(255,255,255,0.6)',
        color: '#1a2a3a',
        fontSize: 16, fontWeight: 500,
        cursor: 'pointer', textAlign: 'left', width: '100%',
        transition: 'all 0.15s',
        boxShadow: active
          ? '0 4px 16px rgba(26,42,58,0.12)'
          : '0 2px 8px rgba(26,42,58,0.06)',
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
      <span style={{ display: 'flex', alignItems: 'center', flexShrink: 0, color: '#1a2a3a' }}>
        {NAV_ICONS[view]}
      </span>
      <span style={{ flex: 1 }}>{label}</span>
      <span style={{ fontSize: 20, lineHeight: 1, fontWeight: 300, color: 'rgba(26,42,58,0.4)' }}>›</span>
    </button>
  );
}

/* ─── Frosted glass card style helper ─── */
const GLASS = {
  background: 'rgba(255,255,255,0.65)',
  backdropFilter: 'blur(16px)',
  WebkitBackdropFilter: 'blur(16px)',
  border: '0.5px solid rgba(255,255,255,0.75)',
  borderRadius: 20,
};

/* ─── Daily Activities ─── */
function ActivitiesView({ user }) {
  const activities = [
    { time: '7:00 AM',  task: 'Morning walk — 20 minutes',      done: true,  tag: 'Exercise',  tagColor: '#dcfce7', tagText: '#166534' },
    { time: '8:30 AM',  task: 'Breakfast & morning medications', done: true,  tag: 'Nutrition', tagColor: '#fef9c3', tagText: '#854d0e' },
    { time: '10:00 AM', task: 'Cognitive puzzle — 15 minutes',   done: true,  tag: 'Brain',     tagColor: '#ede9fe', tagText: '#5b21b6' },
    { time: '12:30 PM', task: 'Lunch & hydration check',         done: false, tag: 'Nutrition', tagColor: '#fef9c3', tagText: '#854d0e' },
    { time: '2:00 PM',  task: 'Rest period — 30 minutes',        done: false, tag: 'Rest',      tagColor: '#e0f2fe', tagText: '#0369a1' },
    { time: '4:00 PM',  task: 'Social activity / family call',   done: false, tag: 'Social',    tagColor: '#fce7f3', tagText: '#9d174d' },
    { time: '6:00 PM',  task: 'Evening medications',             done: false, tag: 'Medical',   tagColor: '#fee2e2', tagText: '#991b1b' },
    { time: '8:00 PM',  task: 'Light reading — 20 minutes',      done: false, tag: 'Brain',     tagColor: '#ede9fe', tagText: '#5b21b6' },
  ];

  const metrics = [
    { label: 'Steps today',      value: '4,280', goal: '6,000',  pct: 71, color: '#2563eb' },
    { label: 'Water intake',     value: '5 / 8', goal: 'glasses', pct: 62, color: '#0891b2' },
    { label: 'Sleep last night', value: '7.2h',  goal: '8h',     pct: 90, color: '#7c3aed' },
    { label: 'Tasks done',       value: '3 / 8', goal: 'today',  pct: 37, color: '#059669' },
  ];

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 26, fontWeight: 600, color: '#1a2a3a', marginBottom: 4 }}>
          Good morning, {user?.name?.split(' ')[0] || 'Patient'} 👋
        </h2>
        <p style={{ fontSize: 12, color: 'rgba(26,42,58,0.45)' }}>
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Metric cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }}>
        {metrics.map((m) => (
          <div key={m.label} style={{ ...GLASS, padding: '16px 18px' }}>
            <p style={{ fontSize: 11, color: 'rgba(26,42,58,0.45)', marginBottom: 6, fontWeight: 500 }}>{m.label}</p>
            <p style={{ fontSize: 22, fontWeight: 600, color: '#1a2a3a', marginBottom: 2 }}>{m.value}</p>
            <p style={{ fontSize: 10, color: 'rgba(26,42,58,0.35)', marginBottom: 10 }}>Goal: {m.goal}</p>
            <div style={{ height: 4, background: 'rgba(26,42,58,0.08)', borderRadius: 99, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${m.pct}%`, background: m.color, borderRadius: 99 }} />
            </div>
          </div>
        ))}
      </div>

      {/* Activities list */}
      <div style={{ ...GLASS, overflow: 'hidden' }}>
        <div style={{
          padding: '18px 22px',
          borderBottom: '0.5px solid rgba(255,255,255,0.5)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <p style={{ fontSize: 14, fontWeight: 600, color: '#1a2a3a' }}>Today's Schedule</p>
          <span style={{ fontSize: 11, color: 'rgba(26,42,58,0.4)', fontWeight: 500 }}>3 of 8 completed</span>
        </div>
        <div style={{ padding: '8px 0' }}>
          {activities.map((a, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 16,
              padding: '12px 22px',
              background: a.done ? 'rgba(16,185,129,0.04)' : 'transparent',
              borderBottom: i < activities.length - 1 ? '0.5px solid rgba(255,255,255,0.4)' : 'none',
            }}>
              <div style={{
                width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
                background: a.done ? '#10b981' : 'transparent',
                border: a.done ? 'none' : '1.5px solid rgba(26,42,58,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {a.done && (
                  <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                    <path d="M2 6l3 3 5-5" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </div>
              <span style={{ fontSize: 11, color: 'rgba(26,42,58,0.4)', width: 68, flexShrink: 0, fontWeight: 500 }}>{a.time}</span>
              <span style={{
                flex: 1, fontSize: 13, fontWeight: 500,
                color: a.done ? 'rgba(26,42,58,0.35)' : '#1a2a3a',
                textDecoration: a.done ? 'line-through' : 'none',
              }}>{a.task}</span>
              <span style={{
                padding: '3px 10px', borderRadius: 999, fontSize: 10, fontWeight: 600,
                background: a.tagColor, color: a.tagText,
              }}>{a.tag}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Appointments ─── */
function AppointmentsView({ user }) {
  const upcoming = [
    { date: 'May 20, 2026', day: 'Wednesday', time: '10:00 AM', doctor: 'Dr. Sarah Mitchell', specialty: 'Neurologist',  type: 'Follow-up',           status: 'confirmed', avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=80&h=80&fit=crop&crop=face' },
    { date: 'May 27, 2026', day: 'Wednesday', time: '2:30 PM',  doctor: 'Dr. James Carter',  specialty: 'Geriatrician', type: 'Check-up',             status: 'confirmed', avatar: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=80&h=80&fit=crop&crop=face' },
    { date: 'Jun 3, 2026',  day: 'Wednesday', time: '11:00 AM', doctor: 'Dr. Aisha Patel',   specialty: 'Psychiatrist', type: 'Cognitive assessment', status: 'pending',   avatar: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=80&h=80&fit=crop&crop=face' },
  ];

  const past = [
    { date: 'May 6, 2026',  doctor: 'Dr. Sarah Mitchell', specialty: 'Neurologist',  type: 'Follow-up',           result: 'Stable',   resultColor: '#059669' },
    { date: 'Apr 15, 2026', doctor: 'Dr. James Carter',   specialty: 'Geriatrician', type: 'Check-up',             result: 'Good',     resultColor: '#059669' },
    { date: 'Mar 28, 2026', doctor: 'Dr. Aisha Patel',    specialty: 'Psychiatrist', type: 'Cognitive assessment', result: 'Reviewed', resultColor: '#2563eb' },
  ];

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 26, fontWeight: 600, color: '#1a2a3a', marginBottom: 4 }}>Appointments</h2>
        <p style={{ fontSize: 12, color: 'rgba(26,42,58,0.45)' }}>Your upcoming and past visits</p>
      </div>

      <p style={{ fontSize: 12, fontWeight: 600, color: 'rgba(26,42,58,0.45)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>Upcoming</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 28 }}>
        {upcoming.map((a, i) => (
          <div key={i} style={{
            ...GLASS,
            padding: '18px 22px', display: 'flex', alignItems: 'center', gap: 18,
          }}>
            {/* Date block */}
            <div style={{
              width: 56, flexShrink: 0, textAlign: 'center',
              background: 'rgba(255,255,255,0.55)', borderRadius: 12, padding: '10px 6px',
              border: '0.5px solid rgba(255,255,255,0.6)',
            }}>
              <p style={{ fontSize: 20, fontWeight: 700, color: '#1a2a3a', lineHeight: 1 }}>{a.date.split(' ')[1].replace(',', '')}</p>
              <p style={{ fontSize: 10, color: 'rgba(26,42,58,0.4)', fontWeight: 500, marginTop: 2 }}>{a.date.split(' ')[0].toUpperCase()}</p>
            </div>
            <img src={a.avatar} alt={a.doctor} style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 14, fontWeight: 600, color: '#1a2a3a' }}>{a.doctor}</p>
              <p style={{ fontSize: 12, color: 'rgba(26,42,58,0.45)', marginTop: 1 }}>{a.specialty} · {a.type}</p>
              <p style={{ fontSize: 11, color: 'rgba(26,42,58,0.4)', marginTop: 4 }}>📅 {a.day} · ⏰ {a.time}</p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
              <span style={{
                padding: '4px 12px', borderRadius: 999, fontSize: 11, fontWeight: 600,
                background: a.status === 'confirmed' ? '#dcfce7' : '#fef9c3',
                color: a.status === 'confirmed' ? '#166534' : '#854d0e',
              }}>
                {a.status === 'confirmed' ? 'Confirmed' : 'Pending'}
              </span>
              <button style={{
                padding: '5px 14px', borderRadius: 8, fontSize: 11, fontWeight: 500,
                background: 'rgba(255,255,255,0.6)', border: '0.5px solid rgba(26,42,58,0.15)',
                color: 'rgba(26,42,58,0.55)', cursor: 'pointer',
              }}>Reschedule</button>
            </div>
          </div>
        ))}
      </div>

      <p style={{ fontSize: 12, fontWeight: 600, color: 'rgba(26,42,58,0.45)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>Past Visits</p>
      <div style={{ ...GLASS, overflow: 'hidden' }}>
        {past.map((a, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: 16,
            padding: '14px 22px',
            borderBottom: i < past.length - 1 ? '0.5px solid rgba(255,255,255,0.4)' : 'none',
          }}>
            <span style={{ fontSize: 12, color: 'rgba(26,42,58,0.4)', width: 90, flexShrink: 0 }}>{a.date}</span>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 13, fontWeight: 500, color: '#1a2a3a' }}>{a.doctor}</p>
              <p style={{ fontSize: 11, color: 'rgba(26,42,58,0.4)' }}>{a.specialty} · {a.type}</p>
            </div>
            <span style={{ fontSize: 12, fontWeight: 600, color: a.resultColor }}>{a.result}</span>
            <button style={{
              padding: '4px 12px', borderRadius: 8, fontSize: 11, fontWeight: 500,
              background: 'rgba(255,255,255,0.7)', border: '0.5px solid rgba(26,42,58,0.1)',
              color: '#2563eb', cursor: 'pointer',
            }}>View notes</button>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Medications ─── */
function MedicationsView({ user }) {
  const meds = [
    { name: 'Donepezil',        dose: '10 mg',    times: ['8:00 AM'],            type: 'Tablet',  purpose: "Alzheimer's treatment", color: '#ede9fe', textColor: '#5b21b6', taken: [true] },
    { name: 'Memantine',        dose: '10 mg',    times: ['8:00 AM', '8:00 PM'], type: 'Tablet',  purpose: 'Cognitive support',      color: '#dbeafe', textColor: '#1d4ed8', taken: [true, false] },
    { name: 'Vitamin D3',       dose: '2000 IU',  times: ['8:00 AM'],            type: 'Capsule', purpose: 'Bone & brain health',    color: '#fef9c3', textColor: '#854d0e', taken: [true] },
    { name: 'Omega-3 Fish Oil', dose: '1000 mg',  times: ['12:00 PM'],           type: 'Capsule', purpose: 'Brain health',           color: '#dcfce7', textColor: '#166534', taken: [false] },
    { name: 'Amlodipine',       dose: '5 mg',     times: ['8:00 PM'],            type: 'Tablet',  purpose: 'Blood pressure',         color: '#fee2e2', textColor: '#991b1b', taken: [false] },
    { name: 'Multivitamin',     dose: '1 tablet', times: ['8:00 AM'],            type: 'Tablet',  purpose: 'General health',         color: '#f0fdf4', textColor: '#166534', taken: [true] },
  ];

  const takenCount = meds.reduce((sum, m) => sum + m.taken.filter(Boolean).length, 0);
  const totalCount = meds.reduce((sum, m) => sum + m.taken.length, 0);

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 26, fontWeight: 600, color: '#1a2a3a', marginBottom: 4 }}>Medications</h2>
        <p style={{ fontSize: 12, color: 'rgba(26,42,58,0.45)' }}>Your daily medication schedule</p>
      </div>

      {/* Summary stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 24 }}>
        {[
          { label: 'Taken today', value: `${takenCount} / ${totalCount}`, color: '#059669', bg: '#dcfce7' },
          { label: 'Medications', value: meds.length,                     color: '#2563eb', bg: '#dbeafe' },
          { label: 'Next dose',   value: '12:00 PM',                      color: '#7c3aed', bg: '#ede9fe' },
        ].map((s) => (
          <div key={s.label} style={{
            ...GLASS, padding: '16px 18px',
            display: 'flex', alignItems: 'center', gap: 14,
          }}>
            <div style={{
              width: 40, height: 40, borderRadius: 12, background: s.bg,
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <span style={{ fontSize: 18, fontWeight: 700, color: s.color }}>
                {typeof s.value === 'number' ? s.value : ''}
              </span>
            </div>
            <div>
              <p style={{ fontSize: 18, fontWeight: 700, color: '#1a2a3a' }}>{s.value}</p>
              <p style={{ fontSize: 11, color: 'rgba(26,42,58,0.45)', marginTop: 1 }}>{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Med list */}
      <div style={{ ...GLASS, overflow: 'hidden' }}>
        <div style={{ padding: '18px 22px', borderBottom: '0.5px solid rgba(255,255,255,0.5)' }}>
          <p style={{ fontSize: 14, fontWeight: 600, color: '#1a2a3a' }}>Today's Medications</p>
        </div>
        {meds.map((med, i) => (
          <div key={i} style={{
            padding: '16px 22px',
            borderBottom: i < meds.length - 1 ? '0.5px solid rgba(255,255,255,0.4)' : 'none',
            display: 'flex', alignItems: 'center', gap: 16,
          }}>
            <div style={{
              width: 44, height: 44, borderRadius: 12, background: med.color,
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 20,
            }}>💊</div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                <p style={{ fontSize: 14, fontWeight: 600, color: '#1a2a3a' }}>{med.name}</p>
                <span style={{ padding: '2px 8px', borderRadius: 999, fontSize: 10, fontWeight: 600, background: med.color, color: med.textColor }}>{med.type}</span>
              </div>
              <p style={{ fontSize: 11, color: 'rgba(26,42,58,0.45)' }}>{med.dose} · {med.purpose}</p>
              <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
                {med.times.map((t, ti) => (
                  <span key={ti} style={{
                    display: 'flex', alignItems: 'center', gap: 4,
                    fontSize: 11, fontWeight: 500,
                    color: med.taken[ti] ? '#059669' : 'rgba(26,42,58,0.45)',
                  }}>
                    {med.taken[ti]
                      ? <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><circle cx="6" cy="6" r="5.5" fill="#dcfce7"/><path d="M3.5 6l1.8 1.8 3.2-3.2" stroke="#059669" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      : <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><circle cx="6" cy="6" r="5.5" stroke="rgba(26,42,58,0.2)"/></svg>
                    }
                    {t}
                  </span>
                ))}
              </div>
            </div>
            {med.taken.some(t => !t) && (
              <button
                style={{
                  padding: '7px 16px', borderRadius: 10, fontSize: 12, fontWeight: 600,
                  background: '#2563eb', color: '#fff', border: 'none', cursor: 'pointer',
                  transition: 'background 0.12s', flexShrink: 0,
                }}
                onMouseEnter={e => e.target.style.background = '#1d4ed8'}
                onMouseLeave={e => e.target.style.background = '#2563eb'}
              >Mark taken</button>
            )}
            {med.taken.every(t => t) && (
              <span style={{ fontSize: 12, fontWeight: 600, color: '#059669', flexShrink: 0 }}>All done ✓</span>
            )}
          </div>
        ))}
      </div>

      {/* Disclaimer */}
      <div style={{
        marginTop: 16, padding: '12px 16px', borderRadius: 12,
        background: 'rgba(37,99,235,0.07)', border: '0.5px solid rgba(37,99,235,0.15)',
      }}>
        <p style={{ fontSize: 11, color: '#1d4ed8', lineHeight: 1.6 }}>
          <strong>Reminder:</strong> Always take medications as prescribed by your doctor. Do not skip doses or change dosage without consulting your healthcare provider.
        </p>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   PATIENT DASHBOARD
═══════════════════════════════════════════ */
export default function PatientDashboard() {
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState('activities');
  const [user, setUser] = useState(null);

  const sidebarRef = useRef(null);
  const navListRef = useRef(null);
  const mainRef    = useRef(null);
  const contentRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    if (!token || !userStr) { navigate('/'); return; }
    const u = JSON.parse(userStr);
    setUser(u);
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
        { x: 0, opacity: 1, stagger: 0.14, duration: 0.65, ease: 'power2.out', delay: 0.5 }
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
    gsap.fromTo(contentRef.current,
      { opacity: 0, y: 22 },
      { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }
    );
  }, [activeView]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  return (
    <div style={{
      minHeight: '100vh', width: '100%',
      background: 'linear-gradient(135deg, #c5d5e8 0%, #d4c5e2 35%, #e8c5d0 70%, #c5d8e8 100%)',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      position: 'relative',
      padding: '48px 24px 48px 0',
      boxSizing: 'border-box',
    }}>
      {/* Atmospheric blobs */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
        <div style={{ position: 'absolute', width: 420, height: 420, borderRadius: '50%', background: 'rgba(150,120,200,0.22)', top: -80, left: -80, filter: 'blur(90px)' }} />
        <div style={{ position: 'absolute', width: 360, height: 360, borderRadius: '50%', background: 'rgba(200,140,180,0.2)', top: 40, right: -60, filter: 'blur(80px)' }} />
        <div style={{ position: 'absolute', width: 320, height: 320, borderRadius: '50%', background: 'rgba(120,160,220,0.22)', bottom: -40, left: '30%', filter: 'blur(85px)' }} />
        <div style={{ position: 'absolute', width: 260, height: 260, borderRadius: '50%', background: 'rgba(180,120,210,0.16)', bottom: 80, right: '18%', filter: 'blur(70px)' }} />
      </div>

        {/* Floating nav panel — fixed, centered vertically on the left */}
        <aside ref={sidebarRef} style={{
          position: 'fixed',
          left: 24,
          top: '50%',
          transform: 'translateY(-50%)',
          zIndex: 100,
          width: 320,
          background: 'rgba(200,205,235,0.55)',
          backdropFilter: 'blur(28px)',
          WebkitBackdropFilter: 'blur(28px)',
          border: '1px solid rgba(255,255,255,0.45)',
          borderRadius: 28,
          boxShadow: '0 16px 56px rgba(80,80,140,0.18), 0 2px 12px rgba(80,80,140,0.1)',
          display: 'flex', flexDirection: 'column',
          padding: '32px 20px',
          gap: 0,
        }}>
          {/* Title — centered, uppercase, bold, letter-spaced */}
          <p style={{
            fontSize: 12, fontWeight: 800, letterSpacing: '0.13em',
            textTransform: 'uppercase', textAlign: 'center',
            color: '#1a2a3a', marginBottom: 28,
            fontFamily: 'ui-monospace, "SF Mono", monospace',
          }}>Navigation</p>

          {/* Nav items */}
          <div ref={navListRef} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {NAV.map((item) => (
              <NavItem
                key={item.view}
                view={item.view}
                label={item.label}
                activeView={activeView}
                onClick={setActiveView}
              />
            ))}
          </div>

          {/* Divider + bottom actions */}
          <div style={{ marginTop: 24, borderTop: '1px solid rgba(255,255,255,0.4)', paddingTop: 20 }}>
            {/* Profile row */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14,
              padding: '0 4px',
            }}>
              <div style={{
                width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                background: 'linear-gradient(135deg, #93c5fd, #6366f1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontWeight: 700, fontSize: 13,
              }}>
                {user?.name?.[0]?.toUpperCase() || 'P'}
              </div>
              <div style={{ minWidth: 0, flex: 1 }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: '#1a2a3a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user?.name || 'Patient'}
                </p>
                <p style={{ fontSize: 11, color: 'rgba(26,42,58,0.45)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user?.email || ''}
                </p>
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
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
              Log Out
            </button>
          </div>
        </aside>

        {/* Main — offset by floating nav width */}
        <div ref={mainRef} style={{
          position: 'relative', zIndex: 1,
          marginLeft: 368,
          minHeight: 'calc(100vh - 96px)',
          display: 'flex', flexDirection: 'column',
          background: 'transparent',
        }}>
          {/* Content */}
          <main style={{ flex: 1, padding: '20px 20px 20px', overflowY: 'auto' }}>
            <div ref={contentRef} style={{
              background: 'rgba(200,205,235,0.55)',
              backdropFilter: 'blur(28px)',
              WebkitBackdropFilter: 'blur(28px)',
              borderRadius: 28,
              border: '1px solid rgba(255,255,255,0.45)',
              boxShadow: '0 16px 56px rgba(80,80,140,0.18), 0 2px 12px rgba(80,80,140,0.1)',
              padding: 28,
              minHeight: 'calc(100vh - 216px)',
            }}>
              {activeView === 'activities'   && <ActivitiesView user={user} />}
              {activeView === 'appointments' && <AppointmentsView user={user} />}
              {activeView === 'medications'  && <MedicationsView user={user} />}
            </div>
          </main>
        </div>
    </div>
  );
}
