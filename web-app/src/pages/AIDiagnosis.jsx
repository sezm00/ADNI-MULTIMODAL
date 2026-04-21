import React, { useState } from 'react';
import axios from 'axios';

const DIAGNOSIS_LABELS = {
  CN: 'Cognitively Normal',
  MCI: 'Mild Cognitive Impairment',
  Dementia: "Alzheimer's Disease",
};
const DIAGNOSIS_COLORS = {
  CN:       { grad: 'from-emerald-400 to-emerald-600', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  MCI:      { grad: 'from-orange-400 to-orange-500',   bg: 'bg-orange-50',  text: 'text-orange-700',  border: 'border-orange-200'  },
  Dementia: { grad: 'from-red-400 to-red-600',         bg: 'bg-red-50',     text: 'text-red-700',     border: 'border-red-200'     },
};

/* ─── shared input styles ─── */
const inputCls = `w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm
  text-gray-900 placeholder-gray-300 focus:outline-none focus:border-teal-400
  focus:ring-2 focus:ring-teal-50 transition-all shadow-sm`;
const selectCls = `w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm
  text-gray-900 focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-50
  transition-all shadow-sm appearance-none cursor-pointer`;

/* ─── field label ─── */
const Label = ({ text, hint }) => (
  <div className="mb-1.5">
    <span className="text-xs font-semibold text-gray-700">{text}</span>
    {hint && <span className="text-[10px] text-gray-400 ml-1.5">{hint}</span>}
  </div>
);

function NumInput({ name, value, onChange, placeholder, min, max, step = '0.1' }) {
  return (
    <input type="number" step={step} name={name} value={value} onChange={onChange}
      min={min} max={max} placeholder={placeholder} className={inputCls} />
  );
}

function SelectInput({ name, value, onChange, options }) {
  return (
    <div className="relative">
      <select name={name} value={value} onChange={onChange} className={selectCls}>
        {options.map(([v, t]) => <option key={v} value={v}>{t}</option>)}
      </select>
      <svg className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
        fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
      </svg>
    </div>
  );
}

/* ─── AI Insights full-width section ─── */
function AIInsights({ text, loading }) {
  const SECTION_META = {
    '1': { icon: '📊', title: 'What These Results Mean', color: 'border-teal-200 bg-teal-50', titleColor: 'text-teal-800' },
    '2': { icon: '🔬', title: 'Why This Prediction',     color: 'border-blue-200 bg-blue-50',  titleColor: 'text-blue-800'  },
    '3': { icon: '🌱', title: 'What the Patient Can Do', color: 'border-emerald-200 bg-emerald-50', titleColor: 'text-emerald-800' },
  };

  if (loading) return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-6 h-6 bg-gradient-to-br from-violet-400 to-violet-600 rounded-lg flex items-center justify-center">
          <svg className="w-3.5 h-3.5 text-white animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
          </svg>
        </div>
        <p className="text-sm font-semibold text-gray-700">Generating AI Insights…</p>
      </div>
      <div className="grid grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-gray-50 rounded-xl p-4 space-y-2 animate-pulse">
            <div className="h-3 bg-gray-200 rounded w-2/3"/>
            <div className="h-2 bg-gray-200 rounded w-full"/>
            <div className="h-2 bg-gray-200 rounded w-5/6"/>
            <div className="h-2 bg-gray-200 rounded w-4/5"/>
          </div>
        ))}
      </div>
    </div>
  );

  if (!text) return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-3">
      <div className="w-8 h-8 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
        <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
        </svg>
      </div>
      <div>
        <p className="text-sm font-semibold text-gray-600">AI Insights Unavailable</p>
        <p className="text-xs text-gray-400 mt-0.5">Add your <code className="bg-gray-100 px-1 rounded text-gray-600">ANTHROPIC_API_KEY</code> to <code className="bg-gray-100 px-1 rounded text-gray-600">backend/.env</code> to enable Claude-powered insights.</p>
      </div>
    </div>
  );

  // Parse using explicit delimiters — immune to numbered sub-points
  const raw = text.split(/##SECTION(\d)##/).filter(s => s.trim());
  // raw is alternating: ['1', 'content1', '2', 'content2', '3', 'content3']
  const sections = [];
  for (let i = 0; i < raw.length - 1; i += 2) {
    sections.push({ num: raw[i].trim(), body: raw[i + 1].trim() });
  }
  // Fallback: if delimiters weren't used, split on top-level digit headings only
  const parsed = sections.length === 3 ? sections : text
    .split(/(?=^[123]\. [A-Z])/m)
    .slice(0, 3)
    .map((sec, i) => ({
      num: String(i + 1),
      body: sec.replace(/^[123]\.[^\n]*\n/, '').trim(),
    }));

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <div className="flex items-center gap-2 mb-4">
        <p className="text-sm font-bold text-gray-800">AI Insights</p>
      </div>
      <div className="grid grid-cols-3 gap-4">
        {parsed.map(({ num, body }) => {
          const meta = SECTION_META[num] || { icon: '💡', title: `Section ${num}`, color: 'border-gray-200 bg-gray-50', titleColor: 'text-gray-700' };
          return (
            <div key={num} className={`rounded-xl border p-4 ${meta.color}`}>
              <p className={`text-sm font-bold mb-2 flex items-center gap-1.5 ${meta.titleColor}`}>
                <span>{meta.icon}</span>{meta.title}
              </p>
              <p className="text-sm text-gray-700 leading-relaxed">{body}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─── hint chip ─── */
const HintRow = ({ items }) => (
  <div className="flex flex-wrap gap-1.5 mt-1.5">
    {items.map(([label, color]) => (
      <span key={label} className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${color}`}>{label}</span>
    ))}
  </div>
);

const INIT = {
  CDRSB: '', CDRSB_bl: '', FAQ: '', ADAS13: '', MMSE_bl: '',
  LDELTOTAL_BL: '', mPACCtrailsB: '', mPACCtrailsB_bl: '', mPACCdigit: '', mPACCdigit_bl: '',
  ORIGPROT: 'ADNI2', PTCOGBEG: '1', PTADDX: '2',
};

export default function AIDiagnosis() {
  const [form, setForm]       = useState(INIT);
  const [tab, setTab]         = useState('cognitive');
  const [result, setResult]   = useState(null);
  const [aiRecs, setAiRecs]   = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  const onChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const onSubmit = async e => {
    e.preventDefault();
    setLoading(true); setError(''); setResult(null); setAiRecs(null);
    try {
      const payload = {};
      Object.entries(form).forEach(([k, v]) => {
        if (v === '') return;
        payload[k] = ['ORIGPROT', 'PTCOGBEG', 'PTADDX'].includes(k) ? v : parseFloat(v);
        if (!['ORIGPROT', 'PTCOGBEG', 'PTADDX'].includes(k) && isNaN(payload[k])) delete payload[k];
      });
      const res = await axios.post('http://localhost:5001/api/predict', payload);
      if (res.data.success) { setResult(res.data.prediction); setAiRecs(res.data.aiRecommendations || null); }
    } catch (err) {
      setError(err.response?.data?.message || 'Prediction failed. Check your inputs and try again.');
    } finally { setLoading(false); }
  };

  const tabs = [
    { id: 'cognitive', label: 'Core Cognitive', icon: '🧠' },
    { id: 'memory',    label: 'Memory Tests',   icon: '📝' },
    { id: 'protocol',  label: 'Protocol Info',  icon: '⚙️' },
  ];

  const col = result ? DIAGNOSIS_COLORS[result.prediction] : null;

  return (
    <div className="w-full space-y-5 pb-6">

      {/* ── Page header ── */}
      <div className="flex items-center gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">AI-Powered Alzheimer's Diagnosis</h1>
          <p className="text-xs text-gray-400 mt-0.5">XGBoost Top-15 Feature Model · 92% accuracy · Claude AI recommendations</p>
        </div>
      </div>

      {/* ── Main row: form | result ── */}
      <div className={`grid gap-5 ${result ? 'grid-cols-2' : 'grid-cols-1 max-w-2xl'}`}>

        {/* ════ FORM CARD ════ */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

          {/* Tab bar */}
          <div className="flex border-b border-gray-100">
            {tabs.map(t => (
              <button key={t.id} type="button" onClick={() => setTab(t.id)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-3.5 text-xs font-semibold transition-all border-b-2 ${
                  tab === t.id
                    ? 'border-teal-500 text-teal-600 bg-teal-50/50'
                    : 'border-transparent text-gray-400 hover:text-gray-600 hover:bg-gray-50'
                }`}>
                <span>{t.icon}</span>
                {t.label}
              </button>
            ))}
          </div>

          <form onSubmit={onSubmit} className="p-5 space-y-5">

            {/* ── Core Cognitive ── */}
            {tab === 'cognitive' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label text="CDRSB" hint="Clinical Dementia Rating (0–18)" />
                    <NumInput name="CDRSB" value={form.CDRSB} onChange={onChange}
                      placeholder="0" min={0} max={18} />
                    <HintRow items={[['CN: 0–0.5','bg-emerald-50 text-emerald-600 border-emerald-200'],['MCI: 0.5–4','bg-orange-50 text-orange-600 border-orange-200'],['Dem: 4.5+','bg-red-50 text-red-600 border-red-200']]} />
                  </div>
                  <div>
                    <Label text="Baseline CDRSB" hint="(0–18)" />
                    <NumInput name="CDRSB_bl" value={form.CDRSB_bl} onChange={onChange}
                      placeholder="0" min={0} max={18} />
                    <HintRow items={[['CN: 0–0.5','bg-emerald-50 text-emerald-600 border-emerald-200'],['MCI: 0.5–4','bg-orange-50 text-orange-600 border-orange-200'],['Dem: 4.5+','bg-red-50 text-red-600 border-red-200']]} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label text="FAQ Score" hint="Functional Activities (0–30)" />
                    <NumInput name="FAQ" value={form.FAQ} onChange={onChange}
                      placeholder="0" min={0} max={30} />
                    <HintRow items={[['CN: 0–2','bg-emerald-50 text-emerald-600 border-emerald-200'],['MCI: 3–15','bg-orange-50 text-orange-600 border-orange-200'],['Dem: 16+','bg-red-50 text-red-600 border-red-200']]} />
                  </div>
                  <div>
                    <Label text="ADAS-Cog 13" hint="(0–85)" />
                    <NumInput name="ADAS13" value={form.ADAS13} onChange={onChange}
                      placeholder="0" min={0} max={85} />
                    <HintRow items={[['CN: <12','bg-emerald-50 text-emerald-600 border-emerald-200'],['MCI: 12–20','bg-orange-50 text-orange-600 border-orange-200'],['Dem: 20+','bg-red-50 text-red-600 border-red-200']]} />
                  </div>
                </div>

                <div>
                  <Label text="Baseline MMSE" hint="Mini-Mental State Exam (0–30, higher = better)" />
                  <NumInput name="MMSE_bl" value={form.MMSE_bl} onChange={onChange}
                    placeholder="30" min={0} max={30} />
                  <HintRow items={[['CN: 27–30','bg-emerald-50 text-emerald-600 border-emerald-200'],['MCI: 21–26','bg-orange-50 text-orange-600 border-orange-200'],['Dem: ≤20','bg-red-50 text-red-600 border-red-200']]} />
                </div>
              </div>
            )}

            {/* ── Memory Tests ── */}
            {tab === 'memory' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label text="Logical Memory Delayed" hint="(0–25)" />
                    <NumInput name="LDELTOTAL_BL" value={form.LDELTOTAL_BL} onChange={onChange}
                      placeholder="12" min={0} max={25} />
                    <HintRow items={[['CN: 10–25','bg-emerald-50 text-emerald-600 border-emerald-200'],['MCI: 4–9','bg-orange-50 text-orange-600 border-orange-200'],['Dem: 0–3','bg-red-50 text-red-600 border-red-200']]} />
                  </div>
                  <div>
                    <Label text="mPACCdigit" hint="higher = better" />
                    <NumInput name="mPACCdigit" value={form.mPACCdigit} onChange={onChange}
                      placeholder="12" />
                    <HintRow items={[['CN: >11','bg-emerald-50 text-emerald-600 border-emerald-200'],['MCI: 9–11','bg-orange-50 text-orange-600 border-orange-200'],['Dem: <9','bg-red-50 text-red-600 border-red-200']]} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label text="mPACCdigit Baseline" hint="higher = better" />
                    <NumInput name="mPACCdigit_bl" value={form.mPACCdigit_bl} onChange={onChange}
                      placeholder="12" />
                  </div>
                  <div>
                    <Label text="mPACCtrailsB" hint="higher = better" />
                    <NumInput name="mPACCtrailsB" value={form.mPACCtrailsB} onChange={onChange}
                      placeholder="5" />
                    <HintRow items={[['CN: >5','bg-emerald-50 text-emerald-600 border-emerald-200'],['MCI: ~0','bg-orange-50 text-orange-600 border-orange-200'],['Dem: <0','bg-red-50 text-red-600 border-red-200']]} />
                  </div>
                </div>

                <div className="max-w-xs">
                  <Label text="mPACCtrailsB Baseline" hint="higher = better" />
                  <NumInput name="mPACCtrailsB_bl" value={form.mPACCtrailsB_bl} onChange={onChange}
                    placeholder="5" />
                </div>

                <div className="bg-blue-50 border border-blue-100 rounded-xl p-3">
                  <p className="text-xs text-blue-700">All memory fields are <strong>optional</strong> — missing values are auto-imputed from ADNI population medians.</p>
                </div>
              </div>
            )}

            {/* ── Protocol Info ── */}
            {tab === 'protocol' && (
              <div className="space-y-4">
                <div>
                  <Label text="ADNI Study Protocol" />
                  <SelectInput name="ORIGPROT" value={form.ORIGPROT} onChange={onChange}
                    options={[['ADNI1','ADNI 1'],['ADNI2','ADNI 2'],['ADNI3','ADNI 3'],['ADNIGO','ADNI GO']]} />
                </div>
                <div>
                  <Label text="Cognitive Complaint at Baseline" />
                  <SelectInput name="PTCOGBEG" value={form.PTCOGBEG} onChange={onChange}
                    options={[['1','Yes — complaint reported'],['2','No — no complaint']]} />
                </div>
                <div>
                  <Label text="Additional Diagnosis" />
                  <SelectInput name="PTADDX" value={form.PTADDX} onChange={onChange}
                    options={[['2','No additional diagnosis'],['1','Yes — additional diagnosis']]} />
                </div>
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-3">
                  <p className="text-xs text-gray-500">Protocol fields are auxiliary. Defaults are pre-filled with the most common ADNI settings and have minimal impact on prediction.</p>
                </div>
              </div>
            )}

            {error && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-xs">
                <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                {error}
              </div>
            )}

            <button type="submit" disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-teal-500 to-teal-600 text-white text-sm font-semibold
                         rounded-xl hover:from-teal-600 hover:to-teal-700 transition-all disabled:opacity-50 shadow-sm">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Analyzing…
                </span>
              ) : 'Run AI Diagnosis'}
            </button>

            {/* Quick guide */}
            <div className="flex gap-4 pt-1">
              {[
                'Core Cognitive tab first — highest-weight features',
                'Memory Tests optional — improve accuracy',
                'Missing values auto-imputed from ADNI medians',
              ].map((tip) => (
                <p key={tip} className="flex-1 text-[10px] text-gray-400 flex items-start gap-1">
                  <span className="text-teal-400 mt-0.5">·</span>{tip}
                </p>
              ))}
            </div>
          </form>
        </div>

        {/* ════ RESULT CARD ════ */}
        {result && col && (
          <div className="space-y-4">
            {/* prediction badge */}
            <div className={`bg-gradient-to-br ${col.grad} rounded-2xl p-5 text-white text-center shadow-sm`}>
              <p className="text-xs font-semibold uppercase tracking-widest opacity-75 mb-1">Prediction</p>
              <p className="text-2xl font-bold mb-1">{DIAGNOSIS_LABELS[result.prediction]}</p>
              <p className="text-sm opacity-90">Confidence: {(result.confidence * 100).toFixed(1)}%</p>
            </div>

            {/* probabilities */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
              <p className="text-sm font-semibold text-gray-800 mb-3">Probability Breakdown</p>
              <div className="space-y-3">
                {Object.entries(result.probabilities).map(([key, value]) => {
                  const c = DIAGNOSIS_COLORS[key];
                  return (
                    <div key={key}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="font-medium text-gray-700">{DIAGNOSIS_LABELS[key]}</span>
                        <span className={`font-bold ${c?.text}`}>{(value * 100).toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2">
                        <div className={`h-2 rounded-full bg-gradient-to-r ${c?.grad} transition-all duration-500`}
                          style={{ width: `${value * 100}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* interpretation */}
            <div className={`${col.bg} border ${col.border} rounded-2xl p-4`}>
              <p className={`text-sm font-semibold ${col.text} mb-1`}>Clinical Interpretation</p>
              {result.prediction === 'Dementia' && <p className="text-xs text-gray-700 leading-relaxed">High probability of Alzheimer's Disease. <strong>Immediate consultation with a neurologist is recommended.</strong> Consider comprehensive cognitive evaluation and imaging.</p>}
              {result.prediction === 'MCI'      && <p className="text-xs text-gray-700 leading-relaxed">Mild Cognitive Impairment detected. Regular monitoring every 6 months is advised. Consider lifestyle interventions and cognitive training programs.</p>}
              {result.prediction === 'CN'       && <p className="text-xs text-gray-700 leading-relaxed">Cognitive function appears within normal limits. Continue healthy lifestyle and schedule annual check-ups to track any changes.</p>}
            </div>

          </div>
        )}
      </div>

      {/* ── AI Insights — full width, shown after a prediction ── */}
      {result && <AIInsights text={aiRecs} loading={loading} />}

      {/* ── Clinical Reference ── */}
      <div className="border-t border-gray-100 pt-5">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Clinical Reference</p>
        <div className="grid grid-cols-3 gap-4">

          {/* Diagnosis Categories */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <p className="text-sm font-semibold text-gray-800 mb-3">Diagnosis Categories</p>
            <div className="space-y-2.5">
              {[
                { label: 'CN — Cognitively Normal',          desc: 'CDRSB ≤0.5 · MMSE ≥27 · FAQ ≤2 · ADAS13 <12',        dot: 'bg-emerald-400', text: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-100' },
                { label: 'MCI — Mild Cognitive Impairment',  desc: 'CDRSB 0.5–4 · MMSE 21–26 · FAQ 3–15 · ADAS13 12–20',  dot: 'bg-orange-400',  text: 'text-orange-700',  bg: 'bg-orange-50',  border: 'border-orange-100'  },
                { label: "Dementia — Alzheimer's Disease",   desc: 'CDRSB ≥4.5 · MMSE ≤20 · FAQ ≥16 · ADAS13 >20',        dot: 'bg-red-400',     text: 'text-red-700',     bg: 'bg-red-50',     border: 'border-red-100'     },
              ].map(({ label, desc, dot, text, bg, border }) => (
                <div key={label} className={`flex items-start gap-2.5 p-2.5 rounded-xl ${bg} border ${border}`}>
                  <div className={`w-2 h-2 rounded-full ${dot} mt-1 flex-shrink-0`} />
                  <div>
                    <p className={`text-xs font-semibold ${text}`}>{label}</p>
                    <p className="text-gray-500 text-[10px] mt-0.5 leading-relaxed">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Score Reference Table */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <p className="text-sm font-semibold text-gray-800 mb-3">Quick Score Reference</p>
            <div className="rounded-xl overflow-hidden border border-gray-100">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="text-left text-gray-500 font-semibold px-3 py-2">Measure</th>
                    <th className="text-center text-emerald-600 font-semibold px-2 py-2">CN</th>
                    <th className="text-center text-orange-600 font-semibold px-2 py-2">MCI</th>
                    <th className="text-center text-red-600 font-semibold px-2 py-2">Dementia</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {[
                    ['CDRSB',        '0–0.5',  '0.5–4', '4.5+'],
                    ['MMSE',         '27–30',  '21–26', '≤20'],
                    ['FAQ',          '0–2',    '3–15',  '16+'],
                    ['ADAS13',       '<12',    '12–20', '>20'],
                    ['Logical Mem.', '10–25',  '4–9',   '0–3'],
                    ['mPACCdigit',   '>11',    '9–11',  '<9'],
                  ].map(([label, cn, mci, dem]) => (
                    <tr key={label} className="hover:bg-gray-50 transition-colors">
                      <td className="text-gray-700 font-medium px-3 py-2">{label}</td>
                      <td className="text-center text-emerald-600 px-2 py-2">{cn}</td>
                      <td className="text-center text-orange-600 px-2 py-2">{mci}</td>
                      <td className="text-center text-red-600 px-2 py-2">{dem}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Model Info */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <p className="text-sm font-semibold text-gray-800 mb-3">XGBoost Top-15 Model</p>
            <div className="grid grid-cols-3 gap-2 text-center mb-4">
              {[['92%','Accuracy'],['15','Features'],['3','Classes']].map(([val, lbl]) => (
                <div key={lbl} className="bg-teal-50 border border-teal-100 rounded-xl p-2.5">
                  <p className="text-teal-600 font-bold text-base">{val}</p>
                  <p className="text-gray-500 text-[10px]">{lbl}</p>
                </div>
              ))}
            </div>
            <p className="text-xs font-semibold text-gray-600 mb-2">Top Feature Importance</p>
            <div className="space-y-2">
              {[
                ['CDRSB',        20.0],
                ['CDRSB_bl',      8.2],
                ['FAQ',           4.8],
                ['PTCOGBEG',      3.7],
                ['mPACCtrailsB',  2.7],
              ].map(([feat, pct]) => (
                <div key={feat}>
                  <div className="flex justify-between text-xs mb-0.5">
                    <span className="text-gray-600 font-medium">{feat}</span>
                    <span className="text-teal-600 font-bold">{pct}%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-1.5">
                    <div className="h-1.5 rounded-full bg-gradient-to-r from-teal-400 to-teal-600"
                      style={{ width: `${(pct / 20) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
