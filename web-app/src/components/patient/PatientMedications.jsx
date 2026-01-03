import React, { useEffect, useMemo, useState } from 'react';
import { medicalRecordsAPI } from '../../services/api';

function toDateLabel(d) {
  try {
    const dt = new Date(d);
    if (Number.isNaN(dt.getTime())) return '';
    return dt.toLocaleDateString();
  } catch {
    return '';
  }
}

export default function PatientMedications() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [checkedMeds, setCheckedMeds] = useState({});
  const [viewMode, setViewMode] = useState('active'); // active, schedule, history

  const user = useMemo(() => {
    try {
      const s = localStorage.getItem('user');
      return s ? JSON.parse(s) : null;
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        setLoading(true);
        setError('');

        if (!user?.id) {
          setError('Missing user session. Please login again.');
          return;
        }

        // Prescriptions are stored as medical records with recordType: 'prescription'
        const res = await medicalRecordsAPI.getByType(user.id, 'prescription');
        if (!mounted) return;

        if (res.data?.success) {
          setRecords(res.data.records || []);
        } else {
          setError(res.data?.message || 'Failed to load medications');
        }
      } catch (e) {
        if (!mounted) return;
        setError(e.response?.data?.message || 'Failed to load medications');
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, [user?.id]);

  const medicationItems = useMemo(() => {
    const items = [];
    for (const r of records) {
      const meds = Array.isArray(r.medications) ? r.medications : [];
      for (const m of meds) {
        items.push({
          key: `${r._id}-${m.name}-${m.dosage}-${m.frequency}`,
          recordId: r._id,
          recordTitle: r.title || 'Prescription',
          recordDate: toDateLabel(r.date || r.createdAt),
          medication: m,
          doctorName: r.doctorId?.name,
        });
      }
    }
    return items;
  }, [records]);

  return (
    <div className="w-full">
      <div className="mb-5">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold text-white mb-1">Medications</h2>
            <p className="text-gray-300 text-sm">Manage prescriptions & track adherence</p>
          </div>
          <button className="px-5 py-3 rounded-2xl bg-gradient-to-br from-pink-500 to-pink-700 text-white text-sm font-bold hover:opacity-90 transition-all shadow-lg shadow-pink-500/50">
            + New Prescription
          </button>
        </div>

        {/* Large Feature Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
          <div className="glass-card p-4 border border-white/10 bg-gradient-to-br from-pink-500/35 to-pink-600/25 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-pink-500/10 rounded-full blur-3xl"></div>
            <div className="relative">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-pink-500/40 flex items-center justify-center">
                  <svg className="w-5 h-5 text-pink-100" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                  </svg>
                </div>
                <div>
                  <div className="text-pink-100 text-xs font-semibold">ACTIVE</div>
                  <div className="text-white text-2xl font-bold">3</div>
                </div>
              </div>
              <div className="text-pink-100 text-sm">Medications</div>
            </div>
          </div>
          <div className="glass-card p-4 border border-white/10 bg-gradient-to-br from-emerald-500/35 to-teal-600/25 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-3xl"></div>
            <div className="relative">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/40 flex items-center justify-center">
                  <svg className="w-5 h-5 text-emerald-100" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <div className="text-emerald-100 text-xs font-semibold">ADHERENCE</div>
                  <div className="text-white text-2xl font-bold">85%</div>
                </div>
              </div>
              <div className="text-emerald-100 text-sm">Today's compliance</div>
            </div>
          </div>
          <div className="glass-card p-4 border border-white/10 bg-gradient-to-br from-purple-500/35 to-purple-600/25 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-full blur-3xl"></div>
            <div className="relative">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-purple-500/40 flex items-center justify-center">
                  <svg className="w-5 h-5 text-purple-100" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div>
                  <div className="text-purple-100 text-xs font-semibold">URGENT</div>
                  <div className="text-white text-2xl font-bold">2</div>
                </div>
              </div>
              <div className="text-purple-100 text-sm">Refills needed</div>
            </div>
          </div>
        </div>

        {/* Timeline Schedule */}
        <div className="glass-card p-6 mb-5 border border-white/10 bg-slate-500/10">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-white font-bold text-lg">Today's Timeline</h3>
            <div className="text-xs text-gray-400">December 27, 2025</div>
          </div>
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500/30 to-amber-600/20 border border-amber-400/30 flex flex-col items-center justify-center">
                  <div className="text-amber-200 text-xs font-bold">08:00</div>
                  <div className="text-amber-300 text-xs">AM</div>
                </div>
                <div className="w-px h-full bg-gradient-to-b from-amber-400/50 to-transparent"></div>
              </div>
              <div className="flex-1 pb-4">
                <div className="text-amber-200 text-sm font-bold mb-2">Morning Routine</div>
                <div className="space-y-2">
                  <label className="flex items-center gap-3 p-3 rounded-xl bg-amber-500/10 border border-amber-400/20 cursor-pointer group hover:bg-amber-500/15 transition-colors">
                    <input type="checkbox" className="w-5 h-5 rounded-lg accent-amber-500 cursor-pointer flex-shrink-0" defaultChecked />
                    <div>
                      <div className="text-white font-semibold text-sm">Donepezil 10mg</div>
                      <div className="text-amber-200 text-xs">With breakfast</div>
                    </div>
                  </label>
                  <label className="flex items-center gap-3 p-3 rounded-xl bg-amber-500/10 border border-amber-400/20 cursor-pointer group hover:bg-amber-500/15 transition-colors">
                    <input type="checkbox" className="w-5 h-5 rounded-lg accent-amber-500 cursor-pointer flex-shrink-0" />
                    <div>
                      <div className="text-white font-semibold text-sm">Vitamin D 1000IU</div>
                      <div className="text-amber-200 text-xs">After meal</div>
                    </div>
                  </label>
                </div>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500/30 to-orange-600/20 border border-orange-400/30 flex flex-col items-center justify-center">
                  <div className="text-orange-200 text-xs font-bold">14:00</div>
                  <div className="text-orange-300 text-xs">PM</div>
                </div>
                <div className="w-px h-full bg-gradient-to-b from-orange-400/50 to-transparent"></div>
              </div>
              <div className="flex-1 pb-4">
                <div className="text-orange-200 text-sm font-bold mb-2">Afternoon Dose</div>
                <label className="flex items-center gap-3 p-3 rounded-xl bg-orange-500/10 border border-orange-400/20 cursor-pointer group hover:bg-orange-500/15 transition-colors">
                  <input type="checkbox" className="w-5 h-5 rounded-lg accent-orange-500 cursor-pointer flex-shrink-0" defaultChecked />
                  <div>
                    <div className="text-white font-semibold text-sm">Memantine 5mg</div>
                    <div className="text-orange-200 text-xs">After lunch</div>
                  </div>
                </label>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500/30 to-purple-600/20 border border-purple-400/30 flex flex-col items-center justify-center">
                <div className="text-purple-200 text-xs font-bold">20:00</div>
                <div className="text-purple-300 text-xs">PM</div>
              </div>
              <div className="flex-1">
                <div className="text-purple-200 text-sm font-bold mb-2">Evening Supplements</div>
                <div className="space-y-2">
                  <label className="flex items-center gap-3 p-3 rounded-xl bg-purple-500/10 border border-purple-400/20 cursor-pointer group hover:bg-purple-500/15 transition-colors">
                    <input type="checkbox" className="w-5 h-5 rounded-lg accent-purple-500 cursor-pointer flex-shrink-0" />
                    <div>
                      <div className="text-white font-semibold text-sm">Omega-3 1000mg</div>
                      <div className="text-purple-200 text-xs">With dinner</div>
                    </div>
                  </label>
                  <label className="flex items-center gap-3 p-3 rounded-xl bg-purple-500/10 border border-purple-400/20 cursor-pointer group hover:bg-purple-500/15 transition-colors">
                    <input type="checkbox" className="w-5 h-5 rounded-lg accent-purple-500 cursor-pointer flex-shrink-0" />
                    <div>
                      <div className="text-white font-semibold text-sm">Melatonin 3mg</div>
                      <div className="text-purple-200 text-xs">Before bed</div>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setViewMode('active')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all border ${
              viewMode === 'active' ? 'bg-pink-500/30 text-white border-white/20' : 'text-gray-400 hover:text-white border-transparent'
            }`}
          >
            Active Medications
          </button>
          <button
            onClick={() => setViewMode('schedule')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all border ${
              viewMode === 'schedule' ? 'bg-pink-500/30 text-white border-white/20' : 'text-gray-400 hover:text-white border-transparent'
            }`}
          >
            Refill Schedule
          </button>
        </div>
      </div>

      {error && (
        <div className="glass-card p-4 border border-red-500/30 bg-red-500/10 text-red-200 text-sm mb-4">
          {error}
        </div>
      )}

      {/* Active Medications List */}
      <div className="glass-card p-5 border border-white/10 bg-pink-500/5">
        <h3 className="text-white font-semibold text-base mb-3">Active Medications</h3>
        {loading ? (
          <div className="text-gray-300 text-sm">Loading medications…</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="bg-gradient-to-br from-amber-500/15 to-amber-600/10 rounded-lg p-3 border border-amber-400/20">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="text-white font-bold text-sm">Vitamin D</div>
                  <div className="text-amber-200 text-xs">1000 IU • Morning</div>
                </div>
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-200">
                  Active
                </span>
              </div>
              <div className="text-gray-300 text-xs">After meal</div>
            </div>

            <div className="bg-gradient-to-br from-purple-500/15 to-purple-600/10 rounded-lg p-3 border border-purple-400/20">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="text-white font-bold text-sm">Omega-3</div>
                  <div className="text-purple-200 text-xs">1000mg • Evening</div>
                </div>
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-200">
                  Active
                </span>
              </div>
              <div className="text-gray-300 text-xs">With dinner</div>
            </div>

            <div className="bg-gradient-to-br from-purple-500/15 to-purple-600/10 rounded-lg p-3 border border-purple-400/20">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="text-white font-bold text-sm">Melatonin</div>
                  <div className="text-purple-200 text-xs">3mg • Evening</div>
                </div>
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-200">
                  Active
                </span>
              </div>
              <div className="text-gray-300 text-xs">Before bed</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
