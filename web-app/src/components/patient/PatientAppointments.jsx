import React, { useEffect, useState } from 'react';
import { appointmentsAPI } from '../../services/api';

function formatDateTime(dateStr, timeStr) {
  try {
    const dt = new Date(`${dateStr} ${timeStr || ''}`.trim());
    if (Number.isNaN(dt.getTime())) return `${dateStr}${timeStr ? ` ${timeStr}` : ''}`;
    return dt.toLocaleString();
  } catch {
    return `${dateStr}${timeStr ? ` ${timeStr}` : ''}`;
  }
}

function statusBadgeClass(status) {
  switch (status) {
    case 'confirmed':
      return 'bg-emerald-500/20 text-emerald-200 border-emerald-500/30';
    case 'completed':
      return 'bg-blue-500/20 text-blue-200 border-blue-500/30';
    case 'cancelled':
      return 'bg-red-500/20 text-red-200 border-red-500/30';
    default:
      return 'bg-yellow-500/20 text-yellow-200 border-yellow-500/30';
  }
}

export default function PatientAppointments() {
  // Sample appointments data
  const sampleAppointments = [
    {
      _id: '1',
      date: '2025-12-30',
      time: '09:00',
      duration: 45,
      status: 'confirmed',
      condition: 'Routine Checkup',
      symptoms: 'Annual physical examination',
      doctorId: { name: 'Dr. Sarah Johnson', email: 'sarah.j@hospital.com' },
      consultationNotes: 'Scheduled for annual health assessment',
      fee: 150,
      paymentStatus: 'Paid'
    },
    {
      _id: '2',
      date: '2026-01-05',
      time: '14:30',
      duration: 30,
      status: 'pending',
      condition: 'Follow-up Consultation',
      symptoms: 'Memory assessment follow-up',
      doctorId: { name: 'Dr. Michael Chen', email: 'michael.c@hospital.com' },
      consultationNotes: 'Review recent test results',
      fee: 120,
      paymentStatus: 'Pending'
    },
    {
      _id: '3',
      date: '2026-01-15',
      time: '11:00',
      duration: 60,
      status: 'pending',
      condition: 'Cognitive Assessment',
      symptoms: 'Comprehensive cognitive evaluation',
      doctorId: { name: 'Dr. Emily Roberts', email: 'emily.r@hospital.com' },
      consultationNotes: 'Full neurological assessment scheduled',
      fee: 250,
      paymentStatus: 'Insurance Pending'
    },
    {
      _id: '4',
      date: '2025-12-15',
      time: '10:00',
      duration: 45,
      status: 'completed',
      condition: 'Blood Work Review',
      symptoms: 'Review lab results',
      doctorId: { name: 'Dr. Sarah Johnson', email: 'sarah.j@hospital.com' },
      consultationNotes: 'All lab values within normal range. Continue current treatment plan.',
      fee: 100,
      paymentStatus: 'Paid'
    },
    {
      _id: '5',
      date: '2025-11-20',
      time: '15:00',
      duration: 30,
      status: 'completed',
      condition: 'Medication Review',
      symptoms: 'Adjust current medications',
      doctorId: { name: 'Dr. Michael Chen', email: 'michael.c@hospital.com' },
      consultationNotes: 'Adjusted dosage for better symptom management.',
      fee: 120,
      paymentStatus: 'Paid'
    },
    {
      _id: '6',
      date: '2025-10-10',
      time: '09:30',
      duration: 45,
      status: 'completed',
      condition: 'Initial Consultation',
      symptoms: 'Memory concerns, mild confusion',
      doctorId: { name: 'Dr. Emily Roberts', email: 'emily.r@hospital.com' },
      consultationNotes: 'Patient presenting with early signs. Recommended comprehensive assessment.',
      fee: 200,
      paymentStatus: 'Paid'
    },
    {
      _id: '7',
      date: '2025-12-28',
      time: '13:00',
      duration: 30,
      status: 'cancelled',
      condition: 'General Checkup',
      symptoms: 'Routine visit',
      doctorId: { name: 'Dr. Sarah Johnson', email: 'sarah.j@hospital.com' },
      consultationNotes: 'Cancelled due to scheduling conflict',
      fee: 150,
      paymentStatus: 'Refunded'
    }
  ];

  const [appointments] = useState(sampleAppointments);
  const [loading] = useState(false);
  const [error] = useState('');
  const [viewMode, setViewMode] = useState('upcoming');

  const now = new Date();
  const upcomingAppointments = appointments.filter(apt => {
    const aptDate = new Date(apt.date);
    return aptDate >= now && apt.status !== 'cancelled' && apt.status !== 'completed';
  });
  const pastAppointments = appointments.filter(apt => {
    const aptDate = new Date(apt.date);
    return aptDate < now || apt.status === 'completed';
  });
  const cancelledAppointments = appointments.filter(apt => apt.status === 'cancelled');

  const displayedAppointments = viewMode === 'upcoming' ? upcomingAppointments : 
                                viewMode === 'past' ? pastAppointments : appointments;

  return (
    <div className="w-full">
      <div className="mb-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">Appointments</h2>
            <p className="text-gray-300 text-sm">Manage your medical visits</p>
          </div>
          <button className="px-4 py-2 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 text-white text-sm font-medium hover:opacity-90 transition-all shadow-lg shadow-blue-500/50">
            + Schedule New
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-5">
          <div className="glass-card p-4 border border-white/10 bg-gradient-to-br from-indigo-500/35 to-purple-600/25">
            <div className="text-indigo-100 text-xs mb-1 font-semibold">Total</div>
            <div className="text-white text-2xl font-bold">{appointments.length}</div>
          </div>
          <div className="glass-card p-4 border border-white/10 bg-gradient-to-br from-sky-500/35 to-blue-600/25">
            <div className="text-sky-100 text-xs mb-1 font-semibold">Upcoming</div>
            <div className="text-white text-2xl font-bold">{upcomingAppointments.length}</div>
          </div>
          <div className="glass-card p-4 border border-white/10 bg-gradient-to-br from-emerald-500/35 to-teal-600/25">
            <div className="text-emerald-100 text-xs mb-1 font-semibold">Completed</div>
            <div className="text-white text-2xl font-bold">{pastAppointments.length}</div>
          </div>
          <div className="glass-card p-4 border border-white/10 bg-gradient-to-br from-rose-500/35 to-red-600/25">
            <div className="text-rose-100 text-xs mb-1 font-semibold">Cancelled</div>
            <div className="text-white text-2xl font-bold">{cancelledAppointments.length}</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('upcoming')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all border ${
              viewMode === 'upcoming' ? 'bg-blue-500/30 text-white border-white/20' : 'text-gray-400 hover:text-white border-transparent'
            }`}
          >
            Upcoming ({upcomingAppointments.length})
          </button>
          <button
            onClick={() => setViewMode('past')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all border ${
              viewMode === 'past' ? 'bg-blue-500/30 text-white border-white/20' : 'text-gray-400 hover:text-white border-transparent'
            }`}
          >
            Past ({pastAppointments.length})
          </button>
          <button
            onClick={() => setViewMode('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all border ${
              viewMode === 'all' ? 'bg-blue-500/30 text-white border-white/20' : 'text-gray-400 hover:text-white border-transparent'
            }`}
          >
            All ({appointments.length})
          </button>
        </div>
      </div>

      {error && (
        <div className="glass-card p-4 border border-red-500/30 bg-red-500/10 text-red-200 text-sm mb-4">
          {error}
        </div>
      )}

      <div className="glass-card p-5">
        {loading ? (
          <div className="text-gray-300 text-sm">Loading appointments…</div>
        ) : displayedAppointments.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-400 text-sm mb-2">No {viewMode} appointments found</div>
            {viewMode === 'upcoming' && (
              <button className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm transition-all mt-2">
                Schedule an appointment
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {displayedAppointments.map((apt) => {
              const colorScheme = apt.status === 'confirmed' ? {
                bgGradient: 'from-teal-500/35 to-emerald-600/25',
                borderColor: 'border-teal-400/60',
                badgeBg: 'bg-teal-500/40',
                badgeText: 'text-teal-100',
                badgeBorder: 'border-teal-400/50'
              } : apt.status === 'completed' ? {
                bgGradient: 'from-cyan-500/35 to-blue-600/25',
                borderColor: 'border-cyan-400/60',
                badgeBg: 'bg-cyan-500/40',
                badgeText: 'text-cyan-100',
                badgeBorder: 'border-cyan-400/50'
              } : apt.status === 'cancelled' ? {
                bgGradient: 'from-rose-500/35 to-red-600/25',
                borderColor: 'border-rose-400/60',
                badgeBg: 'bg-rose-500/40',
                badgeText: 'text-rose-100',
                badgeBorder: 'border-rose-400/50'
              } : {
                bgGradient: 'from-slate-400/35 to-gray-500/25',
                borderColor: 'border-slate-300/60',
                badgeBg: 'bg-slate-400/40',
                badgeText: 'text-slate-100',
                badgeBorder: 'border-slate-300/50'
              };
              
              return (
                <div 
                  key={apt._id} 
                  className={`
                    glass-card p-5 transition-colors duration-200 border border-white/10
                    bg-gradient-to-br ${colorScheme.bgGradient}
                    hover:border-white/20
                  `}
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex-1">
                      <div className="text-white font-bold text-base mb-2">{apt.condition || 'Consultation'}</div>
                      <div className="text-gray-200 text-sm font-semibold mb-1">
                        📅 {formatDateTime(apt.date, apt.time)}
                      </div>
                      <div className="text-gray-300 text-sm">
                        👨‍⚕️ {apt.doctorId?.name || 'Assigned Doctor'}
                      </div>
                    </div>
                    <span
                      className={`
                        px-3 py-1.5 rounded-xl text-xs font-bold border border-white/20
                        ${colorScheme.badgeBg} ${colorScheme.badgeText}
                        shadow-sm
                      `}
                    >
                      {apt.status || 'pending'}
                    </span>
                  </div>

                  {(apt.consultationNotes || apt.notes) && (
                    <div className="mt-3 text-gray-200 text-sm bg-white/10 rounded-xl p-3 border border-white/10 leading-relaxed">
                      {apt.consultationNotes || apt.notes}
                    </div>
                  )}
                  
                  {apt.paymentStatus && (
                    <div className="mt-3 flex items-center justify-between text-xs">
                      <span className="text-gray-300">Payment Status:</span>
                      <span className="text-white font-semibold">{apt.paymentStatus}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
