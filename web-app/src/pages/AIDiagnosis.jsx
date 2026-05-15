import React, { useState, useRef, useEffect, Suspense } from 'react';
import { createPortal } from 'react-dom';
import { gsap } from 'gsap';
import api from '../services/api';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, Html } from '@react-three/drei';
import * as THREE from 'three';

/* ══════════════════════════════════════════
   CONSTANTS
══════════════════════════════════════════ */
const DIAGNOSIS_LABELS = {
  CN: 'Cognitively Normal',
  MCI: 'Mild Cognitive Impairment',
  Dementia: "Alzheimer's Disease",
};
const DIAGNOSIS_COLORS = {
  CN:       { grad: ['#16a34a','#15803d'], light: 'rgba(22,163,74,0.08)',  border: 'rgba(22,163,74,0.15)',  text: '#15803d', dot: '#16a34a' },
  MCI:      { grad: ['#f97316','#ea580c'], light: 'rgba(249,115,22,0.08)', border: 'rgba(249,115,22,0.15)', text: '#ea580c', dot: '#f97316' },
  Dementia: { grad: ['#ef4444','#dc2626'], light: 'rgba(239,68,68,0.08)',  border: 'rgba(239,68,68,0.15)',  text: '#dc2626', dot: '#ef4444' },
};

const INIT = {
  CDRSB: '', CDRSB_bl: '', FAQ: '', ADAS13: '', MMSE_bl: '',
  LDELTOTAL_BL: '', mPACCtrailsB: '', mPACCtrailsB_bl: '',
  mPACCdigit: '', mPACCdigit_bl: '',
  ORIGPROT: 'ADNI2', PTCOGBEG: '1', PTADDX: '2',
  FSVERSION_bl: 'FreeSurfer Version 4.3',
  VISDATE_ptd: new Date().toISOString().split('T')[0],
};

const STRING_FIELDS = ['ORIGPROT','PTCOGBEG','PTADDX','FSVERSION_bl','VISDATE_ptd'];

/* ══════════════════════════════════════════
   SCANNING PHASE KEYFRAMES
══════════════════════════════════════════ */
const SCAN_CSS = `
@keyframes radarRing {
  0%   { transform: translate(-50%,-50%) scale(0.3); opacity: 0.8; }
  100% { transform: translate(-50%,-50%) scale(3.2); opacity: 0; }
}
@keyframes hotPulse {
  0%,100% { opacity: 1;   transform: scale(1); }
  50%      { opacity: 0.2; transform: scale(1.5); }
}
@keyframes hotRing {
  0%   { transform: scale(0.5); opacity: 0.9; }
  100% { transform: scale(2.8); opacity: 0; }
}
@keyframes rotateVFX2 {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}
@keyframes scanFadeIn {
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes scanFadeOut {
  from { opacity: 1; transform: translateY(0); }
  to   { opacity: 0; transform: translateY(-12px); }
}
@keyframes progressFill {
  from { width: 0%; }
  to   { width: 100%; }
}`;

/* ══════════════════════════════════════════
   BRAIN REGIONS BY DIAGNOSIS
   camera: [x,y,z] to zoom toward that region
   hotPos: overlay position on canvas
══════════════════════════════════════════ */
const BRAIN_REGIONS = {
  CN: [
    {
      id: 'hc', label: 'Hippocampus', status: 'Normal',
      color: '#22c55e',
      camera: [0.4, -0.3, 2.1],
      hotPos: { left: '58%', top: '55%' },
      title: 'Hippocampus — Memory Hub',
      body: 'The hippocampus shows no signs of atrophy or volume loss. This bilateral structure is essential for converting short-term memories into long-term storage. Normal MMSE and CDRSB scores confirm healthy episodic memory consolidation. Neuronal density appears preserved across CA1, CA3, and dentate gyrus subfields.',
      badge: 'Volume Preserved',
    },
    {
      id: 'pfc', label: 'Prefrontal Cortex', status: 'Normal',
      color: '#22c55e',
      camera: [0, 0.7, 2.0],
      hotPos: { left: '50%', top: '18%' },
      title: 'Prefrontal Cortex — Executive Control',
      body: 'The prefrontal cortex demonstrates intact grey matter density and connectivity. This region governs working memory, decision-making, and inhibitory control. Low FAQ scores confirm that daily functional tasks — managing finances, cooking, medication — remain fully unimpaired. Dopaminergic and cholinergic pathways appear normal.',
      badge: 'Fully Functional',
    },
    {
      id: 'ec', label: 'Entorhinal Cortex', status: 'Normal',
      color: '#22c55e',
      camera: [-0.5, -0.2, 2.0],
      hotPos: { left: '32%', top: '52%' },
      title: 'Entorhinal Cortex — Gateway to Memory',
      body: 'The entorhinal cortex, the primary relay between sensory cortices and the hippocampus, shows no tau pathology. This region is typically the earliest site of Alzheimer\'s-related neurodegeneration. Its normal function here strongly supports a cognitively healthy classification and reduces 5-year progression risk significantly.',
      badge: 'No Tau Pathology',
    },
  ],
  MCI: [
    {
      id: 'hc', label: 'Hippocampus', status: 'Early Atrophy',
      color: '#f97316',
      camera: [0.4, -0.3, 2.0],
      hotPos: { left: '58%', top: '55%' },
      title: 'Hippocampus — Early Volume Loss',
      body: 'Subtle but measurable volumetric reduction detected in the hippocampal CA1 subfield — a hallmark of early MCI. CDRSB score elevation aligns with emerging episodic memory difficulties. Tau neurofibrillary tangles may be beginning to accumulate. MRI-based volumetry would confirm a 5–10% bilateral reduction compared to age-matched norms.',
      badge: '~8% Volume Reduction',
    },
    {
      id: 'ec', label: 'Entorhinal Cortex', status: 'Tau Suspect',
      color: '#f97316',
      camera: [-0.5, -0.2, 1.9],
      hotPos: { left: '32%', top: '52%' },
      title: 'Entorhinal Cortex — Tau Accumulation',
      body: 'The entorhinal cortex is showing early signs of tau propagation — the spread of misfolded tau protein that precedes hippocampal involvement. This region is Braak Stage II in Alzheimer\'s progression. The patient\'s Logical Memory delayed recall scores suggest that the hippocampal-entorhinal circuit is under stress, impairing new memory encoding.',
      badge: 'Braak Stage II',
    },
    {
      id: 'pfc', label: 'Prefrontal Cortex', status: 'Mild Decline',
      color: '#fbbf24',
      camera: [0, 0.7, 2.0],
      hotPos: { left: '50%', top: '18%' },
      title: 'Prefrontal Cortex — Mild Executive Decline',
      body: 'Mild reductions in executive function are reflected in the mPACCtrailsB scores. The prefrontal cortex begins to show reduced metabolic activity, often visible on FDG-PET imaging as hypometabolism in dorsolateral prefrontal areas. Planning complex tasks, multitasking, and sustained attention may be subtly impaired at this stage.',
      badge: 'Mild Hypometabolism',
    },
    {
      id: 'par', label: 'Parietal Lobe', status: 'Affected',
      color: '#f97316',
      camera: [-0.6, 0.3, 2.0],
      hotPos: { left: '26%', top: '30%' },
      title: 'Parietal Lobe — Spatial Processing',
      body: 'The inferior parietal lobule, including the angular and supramarginal gyri, shows early signs of cortical thinning. This region integrates sensory information for spatial navigation, visuospatial processing, and number sense. Patients may begin noticing difficulty with map reading, judging distances, or following complex spatial instructions.',
      badge: 'Cortical Thinning',
    },
  ],
  Dementia: [
    {
      id: 'hc', label: 'Hippocampus', status: 'Severe Atrophy',
      color: '#ef4444',
      camera: [0.4, -0.3, 1.8],
      hotPos: { left: '58%', top: '55%' },
      title: 'Hippocampus — Significant Neurodegeneration',
      body: 'Advanced hippocampal atrophy is present bilaterally, consistent with severe Alzheimer\'s disease. Volume loss of 30–40% compared to age-matched controls is typical at this stage. The CA1 subfield is critically depleted of pyramidal neurons. New memory formation is severely compromised. This directly explains the CDRSB score elevation and impaired Logical Memory delayed recall performance.',
      badge: '~35% Volume Loss',
    },
    {
      id: 'ec', label: 'Entorhinal Cortex', status: 'Severe',
      color: '#ef4444',
      camera: [-0.5, -0.2, 1.8],
      hotPos: { left: '32%', top: '52%' },
      title: 'Entorhinal Cortex — Advanced Neurodegeneration',
      body: 'The entorhinal cortex has sustained extensive neuronal loss, consistent with Braak Stage V–VI. Dense tau neurofibrillary tangles have spread throughout this region, severing the critical relay pathway between association cortices and the hippocampus. β-amyloid plaques have additionally accumulated, causing synaptic dysfunction across broad cortical networks.',
      badge: 'Braak Stage V–VI',
    },
    {
      id: 'pfc', label: 'Prefrontal Cortex', status: 'Dysfunction',
      color: '#ef4444',
      camera: [0, 0.7, 1.8],
      hotPos: { left: '50%', top: '18%' },
      title: 'Prefrontal Cortex — Executive Dysfunction',
      body: 'Widespread prefrontal grey matter loss has resulted in significant executive dysfunction. Patients exhibit profound deficits in planning, abstract reasoning, impulse control, and working memory. FDG-PET would reveal severe hypometabolism across the entire frontal lobe. The high FAQ score directly reflects inability to manage daily financial, social, and self-care activities independently.',
      badge: 'Severe Hypometabolism',
    },
    {
      id: 'par', label: 'Parietal Lobe', status: 'Plaques Detected',
      color: '#ef4444',
      camera: [-0.6, 0.3, 1.8],
      hotPos: { left: '26%', top: '30%' },
      title: 'Parietal Lobe — Amyloid Burden',
      body: 'The parietal cortex carries a heavy β-amyloid plaque burden, particularly in the precuneus and posterior cingulate — regions that are among the earliest sites of amyloid accumulation and are central to the default mode network. Cortical thinning here produces the characteristic visuospatial and apraxic symptoms of moderate-to-severe Alzheimer\'s disease.',
      badge: 'High Amyloid Load',
    },
    {
      id: 'tmp', label: 'Temporal Lobe', status: 'Impaired',
      color: '#dc2626',
      camera: [0.5, -0.1, 1.8],
      hotPos: { left: '62%', top: '60%' },
      title: 'Temporal Lobe — Language & Semantic Memory',
      body: 'The superior and middle temporal gyri show marked cortical thinning with progressive neuronal dropout. Language comprehension, semantic memory, and auditory processing are severely compromised. Patients typically present with word-finding difficulties (anomia), impaired comprehension of spoken language, and loss of object knowledge. This pattern is characteristic of late-stage Alzheimer\'s temporal involvement.',
      badge: 'Language Impaired',
    },
  ],
};

/* ══════════════════════════════════════════
   SHARED STYLES
══════════════════════════════════════════ */
const FONT = '"Plus Jakarta Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';

const glass = {
  background: 'rgba(255,255,255,0.60)',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  border: '0.5px solid rgba(255,255,255,0.80)',
  borderRadius: 20,
};

const inputStyle = {
  width: '100%', padding: '10px 14px',
  background: 'rgba(255,255,255,0.85)',
  border: '0.5px solid rgba(26,42,58,0.10)',
  borderRadius: 12, fontSize: 13,
  fontFamily: FONT, color: '#1a2a3a', outline: 'none',
  boxSizing: 'border-box', transition: 'border-color 0.15s',
};

/* ══════════════════════════════════════════
   3-D BRAIN
══════════════════════════════════════════ */
function Brain({ vivid = false }) {
  const { scene } = useGLTF('/brain.glb');
  const ref = useRef();
  React.useEffect(() => {
    scene.traverse(child => {
      if (child.isMesh) {
        child.material = new THREE.MeshStandardMaterial({
          color: vivid ? '#a0bcd8' : '#b8cce0',
          emissive: vivid ? '#5888c8' : '#8aaac8',
          emissiveIntensity: vivid ? 0.22 : 0.06,
          roughness: vivid ? 0.40 : 0.55,
          metalness: vivid ? 0.15 : 0.05,
          transparent: true, opacity: 0.97,
        });
      }
    });
  }, [scene, vivid]);
  useFrame((_, delta) => { if (ref.current) ref.current.rotation.y += delta * 0.13; });
  return (
    <group ref={ref}>
      <primitive object={scene} scale={vivid ? 2.1 : 1.85} position={[0, -0.2, 0]} />
    </group>
  );
}

function BrainCanvas({ vivid = false, style }) {
  return (
    <Canvas camera={{ position: [0, 0.2, vivid ? 3.0 : 3.2], fov: vivid ? 56 : 52 }}
      style={style || { width: '100%', height: '100%' }}
      gl={{ antialias: true, alpha: true }}>
      <ambientLight intensity={vivid ? 3.2 : 2.2} color="#d8e8f8" />
      <directionalLight position={[4, 6, 4]}  intensity={vivid ? 2.8 : 1.6} color="#ffffff" />
      <directionalLight position={[-4, 2, 3]} intensity={vivid ? 1.8 : 0.9} color="#c0d8ff" />
      <directionalLight position={[0, -3, -2]} intensity={0.4} color="#b8c8e8" />
      <pointLight position={[0, 0, 4]} intensity={vivid ? 1.8 : 0.6} color="#e4eeff" />
      {vivid && <pointLight position={[3, 4, 2]} intensity={1.2} color="#90c8ff" />}
      {vivid && <pointLight position={[-2, -2, 3]} intensity={0.8} color="#c0a8ff" />}
      <Suspense fallback={null}>
        <Brain vivid={vivid} />
      </Suspense>
    </Canvas>
  );
}

/* ══════════════════════════════════════════
   SMALL HELPERS
══════════════════════════════════════════ */
const Label = ({ text, hint }) => (
  <div style={{ marginBottom: 6 }}>
    <span style={{ fontSize: 12, fontWeight: 600, color: 'rgba(26,42,58,0.6)', fontFamily: FONT }}>{text}</span>
    {hint && <span style={{ fontSize: 10, color: 'rgba(26,42,58,0.35)', marginLeft: 6, fontFamily: FONT }}>{hint}</span>}
  </div>
);

const HintRow = ({ items }) => (
  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginTop: 5 }}>
    {items.map(([label, color, bg]) => (
      <span key={label} style={{ padding: '2px 8px', borderRadius: 999, fontSize: 10, fontWeight: 500, background: bg, color, border: `0.5px solid ${color}33`, fontFamily: FONT }}>{label}</span>
    ))}
  </div>
);

function NumInput({ name, value, onChange, placeholder, min, max }) {
  return (
    <input type="number" step="0.1" name={name} value={value} onChange={onChange}
      min={min} max={max} placeholder={placeholder} style={inputStyle}
      onFocus={e => e.target.style.borderColor = 'rgba(37,99,235,0.4)'}
      onBlur={e => e.target.style.borderColor = 'rgba(26,42,58,0.10)'} />
  );
}

function SelectInput({ name, value, onChange, options }) {
  return (
    <div style={{ position: 'relative' }}>
      <select name={name} value={value} onChange={onChange}
        style={{ ...inputStyle, appearance: 'none', cursor: 'pointer' }}
        onFocus={e => e.target.style.borderColor = 'rgba(37,99,235,0.4)'}
        onBlur={e => e.target.style.borderColor = 'rgba(26,42,58,0.10)'}>
        {options.map(([v, t]) => <option key={v} value={v}>{t}</option>)}
      </select>
      <svg style={{ pointerEvents: 'none', position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', width: 13, height: 13, color: 'rgba(26,42,58,0.35)' }}
        fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
      </svg>
    </div>
  );
}

/* ══════════════════════════════════════════
   CLINICAL REFERENCE GUIDE
══════════════════════════════════════════ */
function ClinicalGuide() {
  return (
    <div style={{ marginTop: 32 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <div style={{ flex: 1, height: '0.5px', background: 'rgba(26,42,58,0.08)' }} />
        <p style={{ fontSize: 11, fontWeight: 700, color: 'rgba(26,42,58,0.35)', textTransform: 'uppercase', letterSpacing: '0.12em', whiteSpace: 'nowrap', fontFamily: FONT }}>Clinical Reference Guide</p>
        <div style={{ flex: 1, height: '0.5px', background: 'rgba(26,42,58,0.08)' }} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
        {/* Diagnosis Categories */}
        <div style={{ ...glass, padding: 22 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <div style={{ width: 28, height: 28, borderRadius: 10, background: 'rgba(37,99,235,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg style={{ width: 15, height: 15, color: '#2563eb' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            </div>
            <p style={{ fontSize: 13, fontWeight: 700, color: '#1a2a3a', fontFamily: FONT }}>Diagnosis Categories</p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { label: 'CN — Cognitively Normal',         desc: 'CDRSB ≤0.5 · MMSE ≥27 · FAQ ≤2 · ADAS13 <12',        color: '#16a34a', bg: 'rgba(22,163,74,0.07)'  },
              { label: 'MCI — Mild Cognitive Impairment', desc: 'CDRSB 0.5–4 · MMSE 21–26 · FAQ 3–15 · ADAS13 12–20',  color: '#f97316', bg: 'rgba(249,115,22,0.07)' },
              { label: "Dementia — Alzheimer's Disease",  desc: 'CDRSB ≥4.5 · MMSE ≤20 · FAQ ≥16 · ADAS13 >20',        color: '#ef4444', bg: 'rgba(239,68,68,0.07)'  },
            ].map(({ label, desc, color, bg }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 12px', borderRadius: 14, background: bg, border: `0.5px solid ${color}33` }}>
                <div style={{ width: 7, height: 7, borderRadius: '50%', background: color, marginTop: 4, flexShrink: 0 }} />
                <div>
                  <p style={{ fontSize: 12, fontWeight: 700, color, fontFamily: FONT }}>{label}</p>
                  <p style={{ fontSize: 10, color: 'rgba(26,42,58,0.45)', marginTop: 2, lineHeight: 1.6, fontFamily: FONT }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Score Reference Table */}
        <div style={{ ...glass, padding: 22 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <div style={{ width: 28, height: 28, borderRadius: 10, background: 'rgba(37,99,235,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg style={{ width: 15, height: 15, color: '#2563eb' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M3 14h18M10 3v18"/></svg>
            </div>
            <p style={{ fontSize: 13, fontWeight: 700, color: '#1a2a3a', fontFamily: FONT }}>Quick Score Reference</p>
          </div>
          <div style={{ borderRadius: 14, overflow: 'hidden', border: '0.5px solid rgba(26,42,58,0.07)' }}>
            <table style={{ width: '100%', fontSize: 12, borderCollapse: 'collapse', fontFamily: FONT }}>
              <thead>
                <tr style={{ background: 'rgba(26,42,58,0.04)' }}>
                  <th style={{ textAlign: 'left', color: 'rgba(26,42,58,0.5)', fontWeight: 600, padding: '8px 12px' }}>Measure</th>
                  <th style={{ textAlign: 'center', color: '#16a34a', fontWeight: 700, padding: '8px' }}>CN</th>
                  <th style={{ textAlign: 'center', color: '#f97316', fontWeight: 700, padding: '8px' }}>MCI</th>
                  <th style={{ textAlign: 'center', color: '#ef4444', fontWeight: 700, padding: '8px' }}>Dem</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['CDRSB',       '0–0.5', '0.5–4', '4.5+'],
                  ['MMSE',        '27–30', '21–26', '≤20'],
                  ['FAQ',         '0–2',   '3–15',  '16+'],
                  ['ADAS13',      '<12',   '12–20', '>20'],
                  ['Logical Mem.','10–25', '4–9',   '0–3'],
                  ['mPACCdigit',  '>11',   '9–11',  '<9'],
                ].map(([label, cn, mci, dem], i) => (
                  <tr key={label} style={{ borderTop: '0.5px solid rgba(26,42,58,0.05)', background: i % 2 ? 'rgba(26,42,58,0.015)' : 'transparent' }}>
                    <td style={{ color: '#1a2a3a', fontWeight: 500, padding: '7px 12px' }}>{label}</td>
                    <td style={{ textAlign: 'center', color: '#16a34a', padding: '7px 8px' }}>{cn}</td>
                    <td style={{ textAlign: 'center', color: '#f97316', padding: '7px 8px' }}>{mci}</td>
                    <td style={{ textAlign: 'center', color: '#ef4444', padding: '7px 8px' }}>{dem}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* XGBoost Model Info */}
        <div style={{ ...glass, padding: 22 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <div style={{ width: 28, height: 28, borderRadius: 10, background: 'rgba(37,99,235,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg style={{ width: 15, height: 15, color: '#2563eb' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/></svg>
            </div>
            <p style={{ fontSize: 13, fontWeight: 700, color: '#1a2a3a', fontFamily: FONT }}>XGBoost Top-15 Model</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, marginBottom: 16 }}>
            {[['92%','Accuracy'],['15','Features'],['3','Classes']].map(([val, lbl]) => (
              <div key={lbl} style={{ background: 'rgba(37,99,235,0.07)', border: '0.5px solid rgba(37,99,235,0.12)', borderRadius: 14, padding: '10px 8px', textAlign: 'center' }}>
                <p style={{ color: '#2563eb', fontWeight: 700, fontSize: 16, fontFamily: FONT }}>{val}</p>
                <p style={{ color: 'rgba(26,42,58,0.45)', fontSize: 10, marginTop: 2, fontFamily: FONT }}>{lbl}</p>
              </div>
            ))}
          </div>
          <p style={{ fontSize: 11, fontWeight: 700, color: 'rgba(26,42,58,0.45)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10, fontFamily: FONT }}>Top Feature Importance</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
            {[['CDRSB',20.0],['CDRSB_bl',8.2],['FAQ',4.8],['PTCOGBEG',3.7],['mPACCtrailsB',2.7]].map(([feat, pct]) => (
              <div key={feat}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                  <span style={{ fontSize: 11, color: '#1a2a3a', fontWeight: 500, fontFamily: FONT }}>{feat}</span>
                  <span style={{ fontSize: 11, color: '#2563eb', fontWeight: 700, fontFamily: FONT }}>{pct}%</span>
                </div>
                <div style={{ width: '100%', height: 5, background: 'rgba(26,42,58,0.07)', borderRadius: 999, overflow: 'hidden' }}>
                  <div style={{ height: '100%', borderRadius: 999, background: 'linear-gradient(90deg,#93c5fd,#2563eb)', width: `${(pct/20)*100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   INPUT PHASE — padded glass form
══════════════════════════════════════════ */
function InputPhase({ form, setForm, onSubmit, loading, error, onBack }) {
  const [inputTab, setInputTab] = useState('cognitive');
  const onChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  return (
    /* outer wrapper — glass container + padding */
    <div style={{
      background: 'rgba(200,205,235,0.55)',
      backdropFilter: 'blur(28px)',
      WebkitBackdropFilter: 'blur(28px)',
      borderRadius: 28,
      border: '1px solid rgba(255,255,255,0.45)',
      boxShadow: '0 16px 56px rgba(80,80,140,0.18)',
      padding: 32,
      position: 'relative', zIndex: 1,
      margin: '28px 32px 48px',
    }}>
      {/* Header */}
      <div style={{ marginBottom: 28, display: 'flex', alignItems: 'center', gap: 12 }}>
        {onBack && (
          <button onClick={onBack} style={{
            width: 38, height: 38, borderRadius: 12,
            background: 'rgba(255,255,255,0.65)', backdropFilter: 'blur(12px)',
            border: '0.5px solid rgba(255,255,255,0.80)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: '#1a2a3a', flexShrink: 0,
            transition: 'background 0.15s',
          }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.9)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.65)'}
          >
            <svg style={{ width: 18, height: 18 }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
        )}
        <div style={{ width: 38, height: 38, borderRadius: 12, background: 'linear-gradient(135deg,#7c3aed,#2563eb)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg style={{ width: 20, height: 20, color: '#fff' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/></svg>
        </div>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 300, color: '#1a2a3a', fontFamily: FONT, letterSpacing: '-0.02em', lineHeight: 1 }}>AI Alzheimer Diagnosis</h1>
          <p style={{ fontSize: 12, color: 'rgba(26,42,58,0.4)', fontFamily: FONT, marginTop: 3 }}>Top-15 Feature XGBoost Model · 92% accuracy</p>
        </div>
      </div>

      {/* Form only — no brain on input phase */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 24, alignItems: 'start' }}>

        {/* Form card */}
        <div style={{ ...glass, overflow: 'hidden' }}>
          <div style={{ display: 'flex', borderBottom: '0.5px solid rgba(26,42,58,0.07)' }}>
            {[{ id: 'cognitive', label: 'Core Cognitive' },{ id: 'memory', label: 'Memory Tests' },{ id: 'protocol', label: 'Protocol Info' }].map(t => (
              <button key={t.id} onClick={() => setInputTab(t.id)} style={{
                flex: 1, padding: '14px 0', fontSize: 12, fontWeight: 600, cursor: 'pointer',
                fontFamily: FONT, border: 'none',
                borderBottom: inputTab === t.id ? '2px solid #2563eb' : '2px solid transparent',
                background: inputTab === t.id ? 'rgba(37,99,235,0.04)' : 'transparent',
                color: inputTab === t.id ? '#2563eb' : 'rgba(26,42,58,0.4)',
                transition: 'all 0.15s',
              }}>{t.label}</button>
            ))}
          </div>

          <form onSubmit={onSubmit} style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 18 }}>
            {inputTab === 'cognitive' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <div><Label text="CDRSB" hint="(0–18)" /><NumInput name="CDRSB" value={form.CDRSB} onChange={onChange} placeholder="0" min={0} max={18} /><HintRow items={[['CN: 0–0.5','#16a34a','rgba(22,163,74,0.08)'],['MCI: 0.5–4','#f97316','rgba(249,115,22,0.08)'],['Dem: 4.5+','#ef4444','rgba(239,68,68,0.08)']]} /></div>
                  <div><Label text="Baseline CDRSB" hint="(0–18)" /><NumInput name="CDRSB_bl" value={form.CDRSB_bl} onChange={onChange} placeholder="0" min={0} max={18} /><HintRow items={[['CN: 0–0.5','#16a34a','rgba(22,163,74,0.08)'],['MCI: 0.5–4','#f97316','rgba(249,115,22,0.08)'],['Dem: 4.5+','#ef4444','rgba(239,68,68,0.08)']]} /></div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <div><Label text="FAQ Score" hint="(0–30)" /><NumInput name="FAQ" value={form.FAQ} onChange={onChange} placeholder="0" min={0} max={30} /><HintRow items={[['CN: 0–2','#16a34a','rgba(22,163,74,0.08)'],['MCI: 3–15','#f97316','rgba(249,115,22,0.08)'],['Dem: 16+','#ef4444','rgba(239,68,68,0.08)']]} /></div>
                  <div><Label text="ADAS-Cog 13" hint="(0–85)" /><NumInput name="ADAS13" value={form.ADAS13} onChange={onChange} placeholder="0" min={0} max={85} /><HintRow items={[['CN: <12','#16a34a','rgba(22,163,74,0.08)'],['MCI: 12–20','#f97316','rgba(249,115,22,0.08)'],['Dem: 20+','#ef4444','rgba(239,68,68,0.08)']]} /></div>
                </div>
                <div><Label text="Baseline MMSE" hint="(0–30, higher = better)" /><NumInput name="MMSE_bl" value={form.MMSE_bl} onChange={onChange} placeholder="30" min={0} max={30} /><HintRow items={[['CN: 27–30','#16a34a','rgba(22,163,74,0.08)'],['MCI: 21–26','#f97316','rgba(249,115,22,0.08)'],['Dem: ≤20','#ef4444','rgba(239,68,68,0.08)']]} /></div>
              </div>
            )}
            {inputTab === 'memory' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <div><Label text="Logical Memory Delayed" hint="(0–25)" /><NumInput name="LDELTOTAL_BL" value={form.LDELTOTAL_BL} onChange={onChange} placeholder="12" min={0} max={25} /><HintRow items={[['CN: 10–25','#16a34a','rgba(22,163,74,0.08)'],['MCI: 4–9','#f97316','rgba(249,115,22,0.08)'],['Dem: 0–3','#ef4444','rgba(239,68,68,0.08)']]} /></div>
                  <div><Label text="mPACCdigit" hint="higher = better" /><NumInput name="mPACCdigit" value={form.mPACCdigit} onChange={onChange} placeholder="12" /><HintRow items={[['CN: >11','#16a34a','rgba(22,163,74,0.08)'],['MCI: 9–11','#f97316','rgba(249,115,22,0.08)'],['Dem: <9','#ef4444','rgba(239,68,68,0.08)']]} /></div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <div><Label text="mPACCdigit Baseline" hint="higher = better" /><NumInput name="mPACCdigit_bl" value={form.mPACCdigit_bl} onChange={onChange} placeholder="12" /></div>
                  <div><Label text="mPACCtrailsB" hint="higher = better" /><NumInput name="mPACCtrailsB" value={form.mPACCtrailsB} onChange={onChange} placeholder="5" /></div>
                </div>
                <div style={{ maxWidth: 260 }}><Label text="mPACCtrailsB Baseline" /><NumInput name="mPACCtrailsB_bl" value={form.mPACCtrailsB_bl} onChange={onChange} placeholder="5" /></div>
                <div style={{ background: 'rgba(37,99,235,0.06)', border: '0.5px solid rgba(37,99,235,0.15)', borderRadius: 14, padding: 12 }}>
                  <p style={{ fontSize: 12, color: '#1d4ed8', fontFamily: FONT }}>Memory fields are <strong>optional</strong> — auto-imputed from ADNI population medians.</p>
                </div>
              </div>
            )}
            {inputTab === 'protocol' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div><Label text="ADNI Study Protocol" /><SelectInput name="ORIGPROT" value={form.ORIGPROT} onChange={onChange} options={[['ADNI1','ADNI 1'],['ADNI2','ADNI 2'],['ADNI3','ADNI 3'],['ADNIGO','ADNI GO']]} /></div>
                <div><Label text="Cognitive Complaint at Baseline" /><SelectInput name="PTCOGBEG" value={form.PTCOGBEG} onChange={onChange} options={[['1','Yes — complaint reported'],['2','No — no complaint']]} /></div>
                <div><Label text="Additional Diagnosis" /><SelectInput name="PTADDX" value={form.PTADDX} onChange={onChange} options={[['2','No additional diagnosis'],['1','Yes — additional diagnosis']]} /></div>
              </div>
            )}

            {error && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(239,68,68,0.08)', border: '0.5px solid rgba(239,68,68,0.2)', color: '#dc2626', padding: '10px 14px', borderRadius: 14, fontSize: 12, fontFamily: FONT }}>
                <svg style={{ width: 16, height: 16, flexShrink: 0 }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                {error}
              </div>
            )}

            <button type="submit" disabled={loading} style={{
              width: '100%', padding: '13px 0',
              background: loading ? 'rgba(37,99,235,0.5)' : 'linear-gradient(135deg,#3b82f6,#2563eb)',
              color: '#fff', fontSize: 14, fontWeight: 600, fontFamily: FONT,
              borderRadius: 14, border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: loading ? 'none' : '0 4px 16px rgba(37,99,235,0.28)',
            }}>
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  <svg style={{ animation: 'spin 1s linear infinite', height: 16, width: 16 }} fill="none" viewBox="0 0 24 24">
                    <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Analyzing…
                </span>
              ) : 'Run AI Diagnosis'}
            </button>

            <div style={{ display: 'flex', gap: 12 }}>
              {['Core Cognitive tab first','Memory Tests optional','Missing values auto-imputed'].map(tip => (
                <p key={tip} style={{ flex: 1, fontSize: 10, color: 'rgba(26,42,58,0.38)', display: 'flex', alignItems: 'flex-start', gap: 4, lineHeight: 1.5, fontFamily: FONT }}>
                  <span style={{ color: '#2563eb', flexShrink: 0, marginTop: 1 }}>·</span>{tip}
                </p>
              ))}
            </div>
          </form>
        </div>

      </div>

      {/* Clinical guide below */}
      <ClinicalGuide />
    </div>
  );
}

/* ══════════════════════════════════════════
   SCANNING PHASE — cinematic brain analysis
══════════════════════════════════════════ */
function ScanningBrain({ diagnosis, targetCamera, onCameraReady }) {
  const { scene } = useGLTF('/brain.glb');
  const groupRef = useRef();
  const col = DIAGNOSIS_COLORS[diagnosis];

  useEffect(() => {
    scene.traverse(child => {
      if (child.isMesh) {
        child.material = new THREE.MeshStandardMaterial({
          color: '#a8c0d8',
          emissive: col.grad[0],
          emissiveIntensity: 0.20,
          roughness: 0.38,
          metalness: 0.12,
          transparent: true,
          opacity: 0.96,
        });
      }
    });
  }, [scene, diagnosis]);

  // Always spin slowly
  useFrame((state, delta) => {
    if (groupRef.current) groupRef.current.rotation.y += delta * 0.09;

    // Smoothly lerp camera toward target
    if (targetCamera) {
      const [tx, ty, tz] = targetCamera;
      state.camera.position.x = THREE.MathUtils.lerp(state.camera.position.x, tx, delta * 0.6);
      state.camera.position.y = THREE.MathUtils.lerp(state.camera.position.y, ty, delta * 0.6);
      state.camera.position.z = THREE.MathUtils.lerp(state.camera.position.z, tz, delta * 0.6);
      state.camera.lookAt(0, -0.05, 0);
    }
  });

  return (
    <group ref={groupRef}>
      <primitive object={scene} scale={2.6} position={[0, -0.28, 0]} />
    </group>
  );
}

function ScanningPhaseOverlay({ result, region, regions, activeIdx, panelKey, progressKey, onSkip, DWELL }) {
  const col = DIAGNOSIS_COLORS[result.prediction];

  return createPortal(
    <div style={{
      position: 'fixed', inset: 0, zIndex: 300,
      display: 'flex', alignItems: 'stretch',
      fontFamily: FONT, overflow: 'hidden',
      background: 'linear-gradient(135deg, #c5d5e8 0%, #d4c5e2 35%, #e8c5d0 70%, #c5d8e8 100%)',
    }}>
      {/* Left panel background */}
      <div style={{
        position: 'absolute', top: 0, left: 0, bottom: 0, width: '38%',
        background: 'linear-gradient(160deg, #c8d6e8 0%, #d8c8e4 50%, #e4c8d4 100%)',
        zIndex: 0,
      }}>
        {/* Atmospheric blob */}
        <div style={{ position: 'absolute', width: 500, height: 500, borderRadius: '50%', background: `${region.color}22`, top: '30%', left: '-20%', filter: 'blur(120px)', transition: 'background 1.2s ease' }} />
      </div>

      {/* ── LEFT DETAIL PANEL ── */}
      <div style={{
        position: 'relative', zIndex: 10,
        width: '38%', flexShrink: 0,
        display: 'flex', flexDirection: 'column', justifyContent: 'center',
        padding: '64px 40px 64px 52px',
      }}>
        {/* Region counter */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          padding: '5px 14px', borderRadius: 999,
          background: 'rgba(255,255,255,0.35)', backdropFilter: 'blur(12px)',
          border: '0.5px solid rgba(255,255,255,0.65)',
          marginBottom: 28, width: 'fit-content',
          animation: 'scanFadeIn 0.5s ease forwards',
        }}>
          <div style={{ width: 7, height: 7, borderRadius: '50%', background: region.color, animation: 'hotPulse 1.3s ease-in-out infinite' }} />
          <span style={{ fontSize: 11, fontWeight: 700, color: '#1a2a3a', letterSpacing: '0.10em', textTransform: 'uppercase' }}>
            Region {activeIdx + 1} of {regions.length}
          </span>
        </div>

        {/* Animated panel content — key forces remount per region */}
        <div key={panelKey} style={{ animation: 'scanFadeIn 0.55s ease forwards' }}>
          {/* Status badge */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '6px 16px', borderRadius: 999, marginBottom: 20,
            background: `${region.color}1a`, border: `1px solid ${region.color}55`,
          }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: region.color }} />
            <span style={{ fontSize: 12, fontWeight: 700, color: region.color, letterSpacing: '0.04em' }}>{region.status}</span>
          </div>

          {/* Title */}
          <h2 style={{ fontSize: 26, fontWeight: 700, color: '#1a2a3a', lineHeight: 1.25, marginBottom: 16, letterSpacing: '-0.02em' }}>{region.title}</h2>

          {/* Badge pill */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '7px 18px', borderRadius: 12, marginBottom: 22,
            background: 'rgba(255,255,255,0.65)', backdropFilter: 'blur(12px)',
            border: '0.5px solid rgba(255,255,255,0.85)',
            boxShadow: `0 4px 20px ${region.color}20`,
          }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: region.color }}>{region.badge}</span>
          </div>

          {/* Body text */}
          <p style={{ fontSize: 14, lineHeight: 1.85, color: 'rgba(26,42,58,0.72)', fontWeight: 400, maxWidth: 420 }}>{region.body}</p>
        </div>

        {/* Progress bar */}
        <div style={{ marginTop: 32 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 7 }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: 'rgba(26,42,58,0.4)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Analyzing region</span>
            <span style={{ fontSize: 11, fontWeight: 600, color: region.color }}>{region.label}</span>
          </div>
          <div style={{ height: 3, background: 'rgba(26,42,58,0.1)', borderRadius: 999, overflow: 'hidden' }}>
            <div key={progressKey} style={{
              height: '100%', borderRadius: 999,
              background: `linear-gradient(90deg, ${region.color}88, ${region.color})`,
              animation: `progressFill ${DWELL}ms linear forwards`,
            }} />
          </div>
        </div>

        {/* Skip + dot trail */}
        <div style={{ marginTop: 24, display: 'flex', alignItems: 'center', gap: 16 }}>
          <button onClick={onSkip} style={{
            padding: '8px 22px', borderRadius: 999,
            background: 'rgba(255,255,255,0.40)', backdropFilter: 'blur(12px)',
            border: '0.5px solid rgba(255,255,255,0.75)',
            fontSize: 12, fontWeight: 600, color: '#1a2a3a', cursor: 'pointer',
          }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.65)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.40)'}
          >Skip to Results →</button>
          <div style={{ display: 'flex', gap: 6 }}>
            {regions.map((_, i) => (
              <div key={i} style={{
                width: i === activeIdx ? 18 : 6, height: 6, borderRadius: 999,
                background: i <= activeIdx ? region.color : 'rgba(26,42,58,0.18)',
                transition: 'all 0.35s ease',
              }} />
            ))}
          </div>
        </div>
      </div>

      {/* ── RIGHT: Canvas + hotspot overlay ── */}
      <div style={{ flex: 1, position: 'relative' }}>
        {/* Three.js brain */}
        <Canvas
          camera={{ position: [0, 0.1, 3.8], fov: 52 }}
          style={{ width: '100%', height: '100%' }}
          gl={{ antialias: true, alpha: true }}>
          <ambientLight intensity={3.2} color="#d8e8f8" />
          <directionalLight position={[4, 6, 4]}  intensity={2.8} color="#ffffff" />
          <directionalLight position={[-4, 2, 3]} intensity={1.8} color="#c0d8ff" />
          <pointLight position={[0, 0, 4]} intensity={2.0} color="#e4eeff" />
          <pointLight position={[0, 3, 2]} intensity={1.4} color={region.color} />
          <Suspense fallback={null}>
            <PersistentBrainScene
              diagnosis={result.prediction}
              mode="scanning"
              targetCamera={region.camera.map((v, i) => i === 2 ? v + 1.4 : v)}
              accentColor={region.color}
            />
          </Suspense>
        </Canvas>

        {/* Hotspot overlay on the active region */}
        <div key={`hs-${panelKey}`} style={{
          position: 'absolute',
          left: region.hotPos.left,
          top: region.hotPos.top,
          zIndex: 10,
          animation: 'scanFadeIn 0.5s ease 0.3s both',
          pointerEvents: 'none',
        }}>
          <div style={{ position: 'relative', width: 0, height: 0 }}>
            {[0, 0.7, 1.4].map((delay, i) => (
              <div key={i} style={{
                position: 'absolute', top: '50%', left: '50%',
                width: 36, height: 36, borderRadius: '50%',
                border: `1.5px solid ${region.color}`,
                animation: `hotRing 2s ease-out ${delay}s infinite`,
              }} />
            ))}
            <div style={{
              position: 'absolute', top: '50%', left: '50%',
              width: 52, height: 52, borderRadius: '50%',
              marginLeft: -26, marginTop: -26,
              border: `1.5px solid ${region.color}44`,
              borderTopColor: region.color,
              animation: 'rotateVFX2 3s linear infinite',
            }} />
            <div style={{
              position: 'absolute', top: '50%', left: '50%',
              width: 36, height: 36, borderRadius: '50%',
              marginLeft: -18, marginTop: -18,
              border: `2px solid ${region.color}cc`,
              background: `${region.color}33`,
              backdropFilter: 'blur(4px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <div style={{ width: 9, height: 9, borderRadius: '50%', background: region.color, animation: 'hotPulse 1.4s ease-in-out infinite' }} />
            </div>
          </div>
        </div>
      </div>

      {/* Top status bar */}
      <div style={{
        position: 'absolute', top: 28, left: '50%', transform: 'translateX(-50%)',
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '8px 22px', borderRadius: 999,
        background: 'rgba(255,255,255,0.28)', backdropFilter: 'blur(16px)',
        border: '0.5px solid rgba(255,255,255,0.6)',
        animation: 'scanFadeIn 0.6s ease forwards',
        zIndex: 20,
      }}>
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: col.grad[0], animation: 'hotPulse 1.2s ease-in-out infinite' }} />
        <span style={{ fontSize: 12, fontWeight: 700, color: '#1a2a3a', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          {DIAGNOSIS_LABELS[result.prediction]} · Neural Scan
        </span>
        <span style={{ fontSize: 11, fontWeight: 500, color: 'rgba(26,42,58,0.45)' }}>
          {(result.confidence * 100).toFixed(0)}% confidence
        </span>
      </div>
    </div>,
    document.body
  );
}


/* ══════════════════════════════════════════
   RESULTS PHASE — Vibrant-style full-screen split
   Left: white scrollable card  |  Right: bare background + brain
══════════════════════════════════════════ */
function ResultsPhase({ result, aiRecs, onReset, onBack }) {
  const col = DIAGNOSIS_COLORS[result.prediction];
  const [tab, setTab] = useState('results');
  const navRef      = useRef(null);
  const leftRef     = useRef(null);
  const sectionsRef = useRef([]);

  useEffect(() => {
    // Set initial hidden states so nothing flashes in
    gsap.set(navRef.current,  { opacity: 0, y: -20 });
    gsap.set(leftRef.current, { opacity: 0, x: -60 });

    // Brain is already warm — animate UI in immediately
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    tl.to(navRef.current,  { opacity: 1, y: 0, duration: 0.40 }, 0)
      .to(leftRef.current, { opacity: 1, x: 0, duration: 0.55 }, 0.06);

    // Stagger inner content sections
    const els = sectionsRef.current.filter(Boolean);
    if (els.length) {
      tl.fromTo(
        els,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.40, stagger: 0.07 },
        0.20
      );
    }
  }, []);

  /* Parse AI recs */
  const parsedRecs = React.useMemo(() => {
    if (!aiRecs) return null;
    const META = {
      '1': { title: 'The Clinical Insight',           color: '#2563eb' },
      '2': { title: 'Why This Prediction',             color: '#2563eb' },
      '3': { title: 'What the Patient Can Do',         color: '#2563eb' },
    };
    const raw = aiRecs.split(/##SECTION(\d)##/).filter(s => s.trim());
    const secs = [];
    for (let i = 0; i < raw.length - 1; i += 2) secs.push({ num: raw[i].trim(), body: raw[i+1].trim() });
    return (secs.length === 3 ? secs : []).map(s => ({ ...s, ...META[s.num] }));
  }, [aiRecs]);

  return createPortal(
    <div style={{
      position: 'fixed', inset: 0, zIndex: 300,
      display: 'flex', flexDirection: 'column',
      fontFamily: FONT,
      background: 'linear-gradient(135deg, #c5d5e8 0%, #d4c5e2 35%, #e8c5d0 70%, #c5d8e8 100%)',
    }}>
      {/* Atmospheric blobs */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', width: 700, height: 700, borderRadius: '50%', background: 'rgba(160,140,220,0.28)', top: -200, right: -100, filter: 'blur(120px)' }} />
        <div style={{ position: 'absolute', width: 500, height: 500, borderRadius: '50%', background: 'rgba(120,180,240,0.22)', bottom: -100, right: 100, filter: 'blur(100px)' }} />
        <div style={{ position: 'absolute', width: 300, height: 300, borderRadius: '50%', background: 'rgba(200,160,230,0.20)', top: '40%', right: '35%', filter: 'blur(80px)' }} />
      </div>

      {/* ── TOP NAV BAR — full width, above both panels ── */}
      <div ref={navRef} style={{
        position: 'relative', zIndex: 10,
        display: 'flex', alignItems: 'center',
        padding: '0 28px',
        height: 64, flexShrink: 0,
      }}>
        {/* Back button — left */}
        <button onClick={onBack} style={{
          width: 36, height: 36, borderRadius: 999,
          background: 'rgba(255,255,255,0.30)', backdropFilter: 'blur(12px)',
          border: '0.5px solid rgba(255,255,255,0.55)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', color: '#1a2a3a', flexShrink: 0,
          transition: 'background 0.15s',
        }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.50)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.30)'}
        >
          <svg style={{ width: 16, height: 16 }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>

        {/* Tabs — centered absolutely */}
        <div style={{
          position: 'absolute', left: '50%', transform: 'translateX(-50%)',
          display: 'flex', gap: 2,
          background: 'rgba(255,255,255,0.28)', backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: '0.5px solid rgba(255,255,255,0.55)',
          borderRadius: 999, padding: 3,
        }}>
          {[{ id: 'results', label: 'Test Results' },{ id: 'overview', label: 'Test Overview' }].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              padding: '7px 20px', borderRadius: 999, fontSize: 13, fontWeight: 600,
              fontFamily: FONT, cursor: 'pointer', border: 'none', transition: 'all 0.18s',
              background: tab === t.id ? '#1a2a3a' : 'transparent',
              color: tab === t.id ? '#fff' : 'rgba(26,42,58,0.55)',
            }}>{t.label}</button>
          ))}
        </div>

        {/* Badge — right */}
        <div style={{ marginLeft: 'auto' }}>
          <span style={{
            padding: '6px 16px', borderRadius: 999, fontSize: 12, fontWeight: 700,
            background: col.light,
            backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
            border: `1px solid ${col.border}`,
            color: col.text, fontFamily: FONT,
          }}>
            {result.prediction} · {(result.confidence * 100).toFixed(0)}%
          </span>
        </div>
      </div>

      {/* ── BODY ROW: left panel + right brain ── */}
      <div style={{ flex: 1, display: 'flex', minHeight: 0, position: 'relative' }}>

      {/* ── LEFT PANEL: glass card, rounded top-right, flush left/bottom ── */}
      <div
        ref={leftRef}
        style={{
          width: '60%', minWidth: 520, maxWidth: 920,
          background: 'rgba(255,255,255,0.62)',
          backdropFilter: 'blur(28px)',
          WebkitBackdropFilter: 'blur(28px)',
          border: '0.5px solid rgba(255,255,255,0.75)',
          height: '100%',
          overflowY: 'auto',
          padding: '36px 44px 60px',
          position: 'relative', zIndex: 1,
          display: 'flex', flexDirection: 'column', gap: 0,
          borderRadius: '0 28px 0 0',
          boxShadow: '4px 0 40px rgba(80,80,140,0.08)',
        }}
      >

        {/* TEST RESULTS tab */}
        {tab === 'results' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>

            {/* Large heading — Vibrant typography */}
            <div ref={el => sectionsRef.current[0] = el} style={{ marginBottom: 28 }}>
              <h1 style={{
                fontSize: 38, fontWeight: 700, color: '#1a2a3a',
                fontFamily: FONT, letterSpacing: '-0.025em', lineHeight: 1.15,
                marginBottom: 12, whiteSpace: 'pre-line',
              }}>
                {result.prediction === 'CN'       && 'The Cognitively\nNormal Pattern'}
                {result.prediction === 'MCI'      && 'The Mild Cognitive\nImpairment Pattern'}
                {result.prediction === 'Dementia' && "The Alzheimer's\nDisease Pattern"}
              </h1>
              <div style={{ width: 48, height: 3, borderRadius: 2, background: `linear-gradient(90deg, ${col.grad[0]}, ${col.grad[1]})` }} />
            </div>

            {/* Section: Diagnosis Result */}
            <div ref={el => sectionsRef.current[1] = el} style={{ marginBottom: 28 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#2563eb', flexShrink: 0 }} />
                <h2 style={{ fontSize: 16, fontWeight: 700, color: '#1a2a3a', fontFamily: FONT }}>Diagnosis Result</h2>
              </div>
              <div style={{ padding: '18px 22px', borderRadius: 16, background: `linear-gradient(135deg, ${col.grad[0]}, ${col.grad[1]})` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'rgba(255,255,255,0.7)', marginBottom: 4, fontFamily: FONT }}>Prediction</p>
                    <p style={{ fontSize: 22, fontWeight: 700, color: '#fff', fontFamily: FONT }}>{DIAGNOSIS_LABELS[result.prediction]}</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'rgba(255,255,255,0.7)', marginBottom: 4, fontFamily: FONT }}>Confidence</p>
                    <p style={{ fontSize: 32, fontWeight: 700, color: '#fff', fontFamily: FONT, lineHeight: 1 }}>{(result.confidence * 100).toFixed(1)}%</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Section: Probability Breakdown */}
            <div ref={el => sectionsRef.current[2] = el} style={{ marginBottom: 28 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#7c3aed', flexShrink: 0 }} />
                <h2 style={{ fontSize: 16, fontWeight: 700, color: '#1a2a3a', fontFamily: FONT }}>Probability Breakdown</h2>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {Object.entries(result.probabilities).map(([key, val]) => {
                  const c = DIAGNOSIS_COLORS[key];
                  const pct = (val * 100).toFixed(1);
                  return (
                    <div key={key}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 7 }}>
                        <span style={{ fontSize: 14, fontWeight: 500, color: '#1a2a3a', fontFamily: FONT }}>{DIAGNOSIS_LABELS[key]}</span>
                        <span style={{ fontSize: 14, fontWeight: 700, color: c.text, fontFamily: FONT }}>{pct}%</span>
                      </div>
                      <div style={{ width: '100%', height: 9, background: 'rgba(26,42,58,0.07)', borderRadius: 999, overflow: 'hidden' }}>
                        <div style={{ height: '100%', borderRadius: 999, background: `linear-gradient(90deg, ${c.grad[0]}, ${c.grad[1]})`, width: `${pct}%`, transition: 'width 1s cubic-bezier(.65,.05,.36,1) 0.4s' }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Section: Clinical Interpretation */}
            <div ref={el => sectionsRef.current[3] = el} style={{ marginBottom: 28 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: col.dot, flexShrink: 0 }} />
                <h2 style={{ fontSize: 16, fontWeight: 700, color: '#1a2a3a', fontFamily: FONT }}>Clinical Interpretation</h2>
              </div>
              <div style={{ padding: '16px 20px', borderRadius: 16, background: col.light, border: `0.5px solid ${col.border}` }}>
                <p style={{ fontSize: 14, color: '#1a2a3a', lineHeight: 1.8, fontFamily: FONT }}>
                  {result.prediction === 'Dementia' && 'High probability of Alzheimer\'s Disease. Immediate consultation with a neurologist is strongly recommended. Consider comprehensive cognitive evaluation, neuroimaging, and review of current medications.'}
                  {result.prediction === 'MCI'      && 'Mild Cognitive Impairment detected. Regular monitoring every 6 months is advised. Consider lifestyle interventions, cognitive training programs, and vascular risk factor management.'}
                  {result.prediction === 'CN'       && 'Cognitive function appears within normal limits. Continue a healthy lifestyle with regular physical activity and mental stimulation. Schedule annual check-ups to monitor for any future changes.'}
                </p>
              </div>
            </div>

            {/* Section: AI Insights — Vibrant large-card style */}
            {parsedRecs && parsedRecs.length > 0 && (
              <div ref={el => sectionsRef.current[4] = el} style={{ marginBottom: 28 }}>
                {/* Divider */}
                <div style={{ height: '0.5px', background: 'rgba(26,42,58,0.08)', marginBottom: 32 }} />

                {parsedRecs.map(({ num, title, color, body }) => (
                  <div key={num} style={{ marginBottom: 40 }}>
                    {/* Section heading — Vibrant style with ·:· icon */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                      <span style={{ fontSize: 16, color: '#60a5fa', letterSpacing: 2, fontWeight: 700 }}>·:·</span>
                      <h2 style={{ fontSize: 22, fontWeight: 700, color: '#1a2a3a', fontFamily: FONT, letterSpacing: '-0.02em' }}>{title}</h2>
                    </div>

                    {/* Body — large readable paragraphs */}
                    <div style={{ paddingLeft: 4 }}>
                      {body.split(/\n+/).map((para, i) => (
                        para.trim() ? (
                          <p key={i} style={{
                            fontSize: 15, color: '#2a3a4a', lineHeight: 1.85,
                            fontFamily: FONT, fontWeight: 400,
                            marginBottom: 16,
                          }}>{para.trim()}</p>
                        ) : null
                      ))}
                    </div>

                    {/* Divider between sections */}
                    {num !== '3' && (
                      <div style={{ height: '0.5px', background: 'rgba(26,42,58,0.07)', marginTop: 8 }} />
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Run another */}
            <div ref={el => sectionsRef.current[5] = el}>
              <button onClick={onReset} style={{
                display: 'flex', alignItems: 'center', gap: 8, padding: '11px 20px',
                background: 'rgba(26,42,58,0.06)', border: '0.5px solid rgba(26,42,58,0.10)', borderRadius: 14,
                fontSize: 13, fontWeight: 600, color: '#1a2a3a', cursor: 'pointer',
                fontFamily: FONT, width: 'fit-content', transition: 'background 0.15s',
              }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(26,42,58,0.10)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(26,42,58,0.06)'}
              >
                <svg style={{ width: 15, height: 15 }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Run Another Diagnosis
              </button>
            </div>
          </div>
        )}

        {/* TEST OVERVIEW tab */}
        {tab === 'overview' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div>
              <h1 style={{ fontSize: 32, fontWeight: 700, color: '#1a2a3a', fontFamily: FONT, letterSpacing: '-0.025em', marginBottom: 8 }}>Test Overview</h1>
              <div style={{ width: 40, height: 3, borderRadius: 2, background: 'linear-gradient(90deg,#2563eb,#7c3aed)', marginBottom: 24 }} />
            </div>

            {/* Model stats */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#2563eb', flexShrink: 0 }} />
                <h2 style={{ fontSize: 16, fontWeight: 700, color: '#1a2a3a', fontFamily: FONT }}>Model Performance</h2>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
                {[['92%','Accuracy'],['15','Features Used'],['3','Diagnosis Classes']].map(([val, lbl]) => (
                  <div key={lbl} style={{ padding: '16px 12px', textAlign: 'center', background: 'rgba(37,99,235,0.06)', border: '0.5px solid rgba(37,99,235,0.12)', borderRadius: 16 }}>
                    <p style={{ fontSize: 24, fontWeight: 700, color: '#2563eb', fontFamily: FONT }}>{val}</p>
                    <p style={{ fontSize: 11, color: 'rgba(26,42,58,0.45)', marginTop: 4, fontFamily: FONT }}>{lbl}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Feature importance */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#7c3aed', flexShrink: 0 }} />
                <h2 style={{ fontSize: 16, fontWeight: 700, color: '#1a2a3a', fontFamily: FONT }}>Top Feature Importance</h2>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[['CDRSB','CDR Sum of Boxes',20.0],['CDRSB_bl','Baseline CDRSB',8.2],['FAQ','Functional Activities',4.8],['PTCOGBEG','Cognitive Complaint',3.7],['mPACCtrailsB','Trails B Score',2.7]].map(([feat, name, pct]) => (
                  <div key={feat}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                      <div>
                        <span style={{ fontSize: 13, fontWeight: 600, color: '#1a2a3a', fontFamily: FONT }}>{feat}</span>
                        <span style={{ fontSize: 11, color: 'rgba(26,42,58,0.4)', marginLeft: 8, fontFamily: FONT }}>{name}</span>
                      </div>
                      <span style={{ fontSize: 13, fontWeight: 700, color: '#2563eb', fontFamily: FONT }}>{pct}%</span>
                    </div>
                    <div style={{ width: '100%', height: 7, background: 'rgba(26,42,58,0.07)', borderRadius: 999, overflow: 'hidden' }}>
                      <div style={{ height: '100%', borderRadius: 999, background: 'linear-gradient(90deg,#93c5fd,#2563eb)', width: `${(pct/20)*100}%`, transition: 'width 0.7s ease' }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Thresholds */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: col.dot, flexShrink: 0 }} />
                <h2 style={{ fontSize: 16, fontWeight: 700, color: '#1a2a3a', fontFamily: FONT }}>Diagnosis Thresholds</h2>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  { label: 'CN — Normal',   desc: 'CDRSB ≤0.5 · MMSE ≥27 · FAQ ≤2 · ADAS13 <12',       color: '#16a34a', bg: 'rgba(22,163,74,0.06)'  },
                  { label: 'MCI',           desc: 'CDRSB 0.5–4 · MMSE 21–26 · FAQ 3–15 · ADAS13 12–20', color: '#f97316', bg: 'rgba(249,115,22,0.06)' },
                  { label: 'Dementia',      desc: 'CDRSB ≥4.5 · MMSE ≤20 · FAQ ≥16 · ADAS13 >20',       color: '#ef4444', bg: 'rgba(239,68,68,0.06)'  },
                ].map(({ label, desc, color, bg }) => (
                  <div key={label} style={{ display: 'flex', gap: 12, padding: '12px 16px', borderRadius: 14, background: bg, border: `0.5px solid ${color}22` }}>
                    <div style={{ width: 7, height: 7, borderRadius: '50%', background: color, marginTop: 5, flexShrink: 0 }} />
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 700, color, fontFamily: FONT }}>{label}</p>
                      <p style={{ fontSize: 11, color: 'rgba(26,42,58,0.45)', marginTop: 3, lineHeight: 1.6, fontFamily: FONT }}>{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button onClick={onReset} style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '11px 20px',
              background: 'rgba(26,42,58,0.06)', border: '0.5px solid rgba(26,42,58,0.10)', borderRadius: 14,
              fontSize: 13, fontWeight: 600, color: '#1a2a3a', cursor: 'pointer',
              fontFamily: FONT, width: 'fit-content',
            }}>
              <svg style={{ width: 15, height: 15 }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Run Another Diagnosis
            </button>
          </div>
        )}
      </div>

      {/* ── RIGHT PANEL: brain canvas ── */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        <BrainCanvas vivid style={{ width: '100%', height: '100%' }} />
        <div style={{
          position: 'absolute', bottom: 28, left: '50%', transform: 'translateX(-50%)',
          padding: '6px 16px', borderRadius: 999,
          background: 'rgba(255,255,255,0.28)', backdropFilter: 'blur(12px)',
          border: '0.5px solid rgba(255,255,255,0.5)',
          fontSize: 11, fontWeight: 600, color: 'rgba(26,42,58,0.60)',
          whiteSpace: 'nowrap', fontFamily: FONT, zIndex: 1,
        }}>
          3D Neural Visualization
        </div>
      </div>

      </div>{/* end body row */}
    </div>,
    document.body
  );
}

/* ══════════════════════════════════════════
   PERSISTENT BRAIN SCENE
   Single scene rendered inside the shared Canvas.
   Mode controls what the camera / material does.
   mode: 'idle' | 'scanning' | 'results'
══════════════════════════════════════════ */
function PersistentBrainScene({ diagnosis, mode, targetCamera, accentColor }) {
  const { scene } = useGLTF('/brain.glb');
  const groupRef  = useRef();
  const col       = diagnosis ? DIAGNOSIS_COLORS[diagnosis] : null;
  const emissive  = col ? col.grad[0] : '#5888c8';

  useEffect(() => {
    scene.traverse(child => {
      if (child.isMesh) {
        child.material = new THREE.MeshStandardMaterial({
          color: '#a8c0d8',
          emissive,
          emissiveIntensity: mode === 'idle' ? 0.06 : 0.20,
          roughness: 0.38,
          metalness: 0.12,
          transparent: true,
          opacity: 0.96,
        });
      }
    });
  }, [scene, emissive, mode]);

  useFrame((state, delta) => {
    // Always spin
    if (groupRef.current) groupRef.current.rotation.y += delta * 0.09;

    // Lerp camera toward target when scanning; reset to default otherwise
    const [tx, ty, tz] = targetCamera || [0, 0.1, 3.8];
    state.camera.position.x = THREE.MathUtils.lerp(state.camera.position.x, tx, delta * 0.55);
    state.camera.position.y = THREE.MathUtils.lerp(state.camera.position.y, ty, delta * 0.55);
    state.camera.position.z = THREE.MathUtils.lerp(state.camera.position.z, tz, delta * 0.55);
    state.camera.lookAt(0, -0.05, 0);
  });

  return (
    <group ref={groupRef}>
      <primitive object={scene} scale={2.2} position={[0, -0.28, 0]} />
    </group>
  );
}

/* ══════════════════════════════════════════
   MAIN COMPONENT
   One single Canvas lives here permanently —
   no WebGL cold-starts on phase switch.
══════════════════════════════════════════ */
export default function AIDiagnosis({ onBack, onPhaseChange }) {
  const [form, setForm]       = useState(INIT);
  const [phase, setPhase]     = useState('input');
  const [result, setResult]   = useState(null);
  const [aiRecs, setAiRecs]   = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  // Scanning region state lifted here so it can drive the shared Canvas
  const [scanIdx, setScanIdx]         = useState(0);
  const [scanPanelKey, setScanPanelKey] = useState(0);
  const [scanProgressKey, setScanProgressKey] = useState(0);
  const [scanStarted, setScanStarted] = useState(false);

  const inputWrapRef  = useRef(null);
  const brainPortalRef = useRef(null);
  const DWELL = 7000;

  const setPhaseWithCallback = (p) => {
    setPhase(p);
    onPhaseChange?.(p);
  };

  // When phase becomes 'scanning', kick off region cycling
  useEffect(() => {
    if (phase !== 'scanning' || !result || scanStarted) return;
    setScanStarted(true);
    const regions = BRAIN_REGIONS[result.prediction] || [];
    if (!regions.length) { setPhaseWithCallback('results'); return; }

    const timers = [];
    regions.forEach((_, i) => {
      timers.push(setTimeout(() => {
        setScanIdx(i);
        setScanPanelKey(k => k + 1);
        setScanProgressKey(k => k + 1);
      }, i * DWELL));
    });
    timers.push(setTimeout(() => {
      doScanComplete();
    }, regions.length * DWELL + 1600));

    return () => timers.forEach(clearTimeout);
  }, [phase, result]);

  const doScanComplete = () => {
    setScanStarted(false);
    setScanIdx(0);
    setScanPanelKey(0);
    setScanProgressKey(0);
    setPhaseWithCallback('results');
  };

  const onSubmit = async e => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const payload = {};
      Object.entries(form).forEach(([k, v]) => {
        if (v === '') return;
        payload[k] = STRING_FIELDS.includes(k) ? v : parseFloat(v);
        if (!STRING_FIELDS.includes(k) && isNaN(payload[k])) delete payload[k];
      });
      const res = await api.post('/predict', payload);
      if (res.data.success) {
        setLoading(false);
        if (inputWrapRef.current) {
          gsap.to(inputWrapRef.current, {
            opacity: 0, x: -60, duration: 0.35, ease: 'power2.in',
            onComplete: () => {
              setResult(res.data.prediction);
              setAiRecs(res.data.aiRecommendations || null);
              setPhaseWithCallback('scanning');
            },
          });
        } else {
          setResult(res.data.prediction);
          setAiRecs(res.data.aiRecommendations || null);
          setPhaseWithCallback('scanning');
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Prediction failed. Check your inputs and try again.');
      if (inputWrapRef.current) {
        gsap.to(inputWrapRef.current, { opacity: 1, x: 0, duration: 0.4, ease: 'power2.out' });
      }
      setLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null); setAiRecs(null); setForm(INIT); setError('');
    setScanStarted(false); setScanIdx(0);
    setPhaseWithCallback('input');
  };

  const handleBack = () => {
    setPhaseWithCallback('input');
    onBack?.();
  };

  // Derive current scanning region
  const scanRegions = result ? (BRAIN_REGIONS[result.prediction] || []) : [];
  const scanRegion  = scanRegions[scanIdx] || scanRegions[0];

  // Camera target: scanning → zoom toward region; idle/results → pull back
  const cameraTarget = (phase === 'scanning' && scanRegion)
    ? scanRegion.camera.map((v, i) => i === 2 ? v + 1.4 : v)  // pull back from raw values
    : [0, 0.1, 3.8];

  const accentColor = result ? DIAGNOSIS_COLORS[result.prediction].grad[0] : '#5888c8';

  return (
    <>
      <style>{SCAN_CSS}</style>

      {/* INPUT PHASE */}
      {phase === 'input' && (
        <div ref={inputWrapRef}>
          <InputPhase
            form={form} setForm={setForm}
            onSubmit={onSubmit} loading={loading}
            error={error} onBack={onBack}
          />
        </div>
      )}

      {/* SCANNING OVERLAY — own Canvas, portaled fullscreen */}
      {phase === 'scanning' && result && scanRegion && (
        <ScanningPhaseOverlay
          result={result}
          region={scanRegion}
          regions={scanRegions}
          activeIdx={scanIdx}
          panelKey={scanPanelKey}
          progressKey={scanProgressKey}
          onSkip={doScanComplete}
          DWELL={DWELL}
        />
      )}

      {/* RESULTS PHASE */}
      {phase === 'results' && result && (
        <ResultsPhase
          result={result} aiRecs={aiRecs}
          onReset={handleReset} onBack={handleBack}
        />
      )}
    </>
  );
}
