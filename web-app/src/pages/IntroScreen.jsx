import React, { useEffect, useRef, useState, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, Html } from '@react-three/drei';
import * as THREE from 'three';

/* ─── Keyframes ─── */
const KEYFRAMES = `
@keyframes pulseButton {
  0%   { transform: scale(1);   opacity: 0.55; }
  100% { transform: scale(1.65); opacity: 0; }
}
@keyframes pulseLogoBorder {
  0%   { transform: scale(1);   opacity: 0.7; }
  100% { transform: scale(2.4); opacity: 0; }
}
@keyframes pulseBlur {
  0%, 100% { opacity: 0.6; transform: scale(1); }
  50%       { opacity: 1;   transform: scale(1.08); }
}
@keyframes spinSlow {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}
@keyframes panelReveal {
  from { opacity: 0; transform: translateY(30px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* Shimmer on title lines — same as Vibrant Wellness */
@keyframes titleShimmer {
  0%   { background-position: 0% center; }
  100% { background-position: 200% center; }
}

.title-shimmer {
  background: linear-gradient(
    91deg,
    #dee9ff 16%, #f2f3ff 26%, #d7eeff 40%,
    #fff    46%, #f2f3ff 52%, #d7eeff 58%,
    #f2f3ff 70%, #dee9ff 80%
  );
  background-size: 200% auto;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: titleShimmer 4s linear infinite;
}

.btn-letter {
  display: inline-block;
  transition: transform 0.3s cubic-bezier(.65,.05,.36,1);
  will-change: transform;
}
.btn-inner:hover .btn-letter { transform: translateY(-20px); }
.btn-inner:hover .btn-letter:nth-child(1)  { transition-delay:   0ms; }
.btn-inner:hover .btn-letter:nth-child(2)  { transition-delay:  10ms; }
.btn-inner:hover .btn-letter:nth-child(3)  { transition-delay:  20ms; }
.btn-inner:hover .btn-letter:nth-child(4)  { transition-delay:  30ms; }
.btn-inner:hover .btn-letter:nth-child(5)  { transition-delay:  40ms; }
.btn-inner:hover .btn-letter:nth-child(6)  { transition-delay:  50ms; }
.btn-inner:hover .btn-letter:nth-child(7)  { transition-delay:  60ms; }
.btn-inner:hover .btn-letter:nth-child(8)  { transition-delay:  70ms; }
.btn-inner:hover .btn-letter:nth-child(9)  { transition-delay:  80ms; }
.btn-inner:hover .btn-letter:nth-child(10) { transition-delay:  90ms; }
.btn-inner:hover .btn-letter:nth-child(11) { transition-delay: 100ms; }
.btn-inner:hover .btn-letter:nth-child(12) { transition-delay: 110ms; }
.btn-inner:hover .btn-letter:nth-child(13) { transition-delay: 120ms; }
.btn-inner:hover .btn-letter:nth-child(14) { transition-delay: 130ms; }
.btn-inner:hover .btn-letter:nth-child(15) { transition-delay: 140ms; }
.btn-inner:hover .btn-letter:nth-child(16) { transition-delay: 150ms; }
.btn-inner:hover .btn-letter:nth-child(17) { transition-delay: 160ms; }
.btn-inner:hover .btn-letter:nth-child(18) { transition-delay: 170ms; }

.btn-inner .btn-hover-blob { opacity: 0; transition: opacity 0.25s; pointer-events: none; }
.btn-inner:hover .btn-hover-blob { opacity: 1; }
.btn-inner:hover p { color: #3b4fa6; }

/* ── Hotspot (Vibrant-style) ── */
@keyframes rotateVFX {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}
@keyframes pulseRing {
  0%   { transform: scale(0.4); opacity: 1; }
  100% { transform: scale(1.6); opacity: 0; }
}
@keyframes pulseBorder {
  0%   { transform: scale(1);   opacity: 0.8; }
  100% { transform: scale(1.9); opacity: 0; }
}

.hotspot-wrap {
  display: flex;
  align-items: center;
  gap: 0;
  cursor: pointer;
  position: relative;
  transform: translateY(-50%);
  white-space: nowrap;
}
.hotspot-circle {
  position: relative;
  width: 48px; height: 48px;
  border-radius: 50%;
  border: 1.5px solid rgba(255,255,255,0.85);
  background: rgba(255,255,255,0.12);
  backdrop-filter: blur(4px);
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
  transition: background 0.3s ease;
}
.hotspot-wrap:hover .hotspot-circle {
  background: rgba(255,255,255,0.28);
}
.hotspot-vfx {
  position: absolute; inset: -6px;
  border-radius: 50%;
  border: 1px solid rgba(255,255,255,0.35);
  animation: rotateVFX 8s linear infinite;
  border-top-color: rgba(255,255,255,0.8);
  border-right-color: rgba(255,255,255,0.5);
}
.hotspot-dot {
  width: 7px; height: 7px;
  border-radius: 50%;
  background: #fff;
  position: relative; z-index: 2;
  transition: transform 0.3s ease;
}
.hotspot-wrap:hover .hotspot-dot {
  transform: scale(0.6);
}
.hotspot-pulse {
  position: absolute; inset: 0;
  border-radius: 50%;
  border: 1.5px solid rgba(255,255,255,0.7);
  animation: pulseRing 1.8s ease-out infinite;
  pointer-events: none;
}
.hotspot-pill {
  display: flex; align-items: center; gap: 10px;
  background: linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.72) 30%);
  padding: 0 14px 0 8px;
  height: 44px;
  border-radius: 0 999px 999px 0;
  backdrop-filter: blur(6px);
  opacity: 0;
  transform: translateX(-6px);
  transition: opacity 0.25s ease, transform 0.25s ease;
  pointer-events: none;
}
.hotspot-wrap:hover .hotspot-pill {
  opacity: 1;
  transform: translateX(0);
}
.hotspot-label {
  font-size: 12px;
  font-weight: 700;
  color: #1a2a4a;
  letter-spacing: 0.03em;
  line-height: 1;
}
.hotspot-sub {
  font-size: 10px;
  font-weight: 500;
  color: rgba(26,42,74,0.55);
  margin-top: 2px;
  letter-spacing: 0.02em;
}
.hotspot-arrow {
  width: 0; overflow: hidden;
  opacity: 0;
  transition: width 0.3s ease, opacity 0.3s ease;
  color: rgba(26,42,74,0.5);
}
.hotspot-wrap:hover .hotspot-arrow {
  width: 14px;
  opacity: 1;
}
`;

/* ─── Hotspot (Vibrant-style pill anchored to 3D position) ─── */
function Hotspot({ position, label, sub }) {
  return (
    <Html position={position} center zIndexRange={[10, 0]}>
      <div className="hotspot-wrap">
        <div className="hotspot-circle">
          <div className="hotspot-vfx" />
          <div className="hotspot-dot" />
          <div className="hotspot-pulse" />
        </div>
        <div className="hotspot-pill">
          <div>
            <div className="hotspot-label">{label}</div>
            <div className="hotspot-sub">{sub}</div>
          </div>
          <div className="hotspot-arrow">›</div>
        </div>
      </div>
    </Html>
  );
}

/* ─── Brain 3D ─── */
function Brain({ phase }) {
  const { scene } = useGLTF('/brain.glb');
  const brainRef = useRef();

  useEffect(() => {
    scene.traverse((child) => {
      if (child.isMesh) {
        child.material = new THREE.MeshStandardMaterial({
          color:            '#b8cce0',   // soft periwinkle-clay, like the Vibrant model
          emissive:         '#8aaac8',
          emissiveIntensity: 0.08,
          roughness:        0.55,        // slightly matte → clay feel
          metalness:        0.05,
          transparent:      true,
          opacity:          0.97,
        });
        child.castShadow    = true;
        child.receiveShadow = true;
      }
    });
  }, [phase, scene]);

  useFrame((_state, delta) => {
    if (brainRef.current) brainRef.current.rotation.y += delta * 0.18;
  });

  return (
    <group ref={brainRef} position={[0.7, -0.1, 0]}>
      <primitive object={scene} scale={1.35} />
      <Hotspot position={[ 0.05,  0.62,  0.35]} label="Prefrontal Cortex" sub="Decision & Memory" />
      <Hotspot position={[ 0.55, -0.05,  0.38]} label="Temporal Lobe"     sub="Language & Hearing" />
      <Hotspot position={[-0.42,  0.28,  0.18]} label="Parietal Lobe"     sub="Spatial Awareness" />
    </group>
  );
}

function BrainScene({ phase }) {
  return (
    <Canvas
      camera={{ position: [-0.4, 0.2, 3.2], fov: 52 }}
      style={{ width: '100%', height: '100%' }}
      gl={{ antialias: true, alpha: true }}
    >
      {/* Soft ambient fill — same soft-clay look as Vibrant Wellness */}
      <ambientLight intensity={2.2} color="#d8e8f8" />
      {/* Key light — top-right warm-white */}
      <directionalLight position={[4, 6, 4]}  intensity={1.6} color="#ffffff" />
      {/* Fill light — left-side cool blue-lavender */}
      <directionalLight position={[-4, 2, 3]} intensity={0.9} color="#c8d8f8" />
      {/* Rim light — bottom back for depth */}
      <directionalLight position={[0, -3, -2]} intensity={0.4} color="#b8c8e8" />
      {/* Soft env-style point from front */}
      <pointLight position={[0, 0, 4]} intensity={0.6} color="#e4eeff" />
      <Suspense fallback={null}>
        <Brain phase={phase} />
      </Suspense>
    </Canvas>
  );
}

/* ─── Preloader ─── */
function Preloader({ visible }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'linear-gradient(135deg, #9db8d8 0%, #aab4d8 25%, #b8b0d4 50%, #c4b8dc 70%, #b0c4e0 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      opacity: visible ? 1 : 0,
      pointerEvents: visible ? 'all' : 'none',
      transition: 'opacity 0.7s ease 0.6s',
    }}>
      <div style={{ position: 'relative', width: 100, height: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ position: 'absolute', inset: -16, borderRadius: '50%', background: 'rgba(147,197,253,0.35)', filter: 'blur(18px)', animation: 'pulseBlur 2s ease-in-out infinite' }} />
        <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.7)', animation: 'pulseLogoBorder 2.5s linear infinite' }} />
        <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.45)', animation: 'pulseLogoBorder 2.5s linear infinite 0.85s', opacity: 0 }} />
        <div style={{ position: 'absolute', inset: 6, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.2)', borderTopColor: 'rgba(255,255,255,0.9)', animation: 'spinSlow 0.9s linear infinite' }} />
        <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(255,255,255,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, zIndex: 2 }}>🧠</div>
      </div>
    </div>
  );
}

/* ─── Atmospheric background blobs (shared) ─── */
function Blobs() {
  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
      {/* top-left: strong periwinkle-blue — primary Vibrant color */}
      <div style={{ position: 'absolute', width: 860, height: 860, borderRadius: '50%', background: 'rgba(120,155,220,0.42)', top: -280, left: -180, filter: 'blur(140px)', animation: 'pulseBlur 7s ease-in-out infinite' }} />
      {/* top-right: lilac / soft purple */}
      <div style={{ position: 'absolute', width: 680, height: 680, borderRadius: '50%', background: 'rgba(180,155,230,0.35)', top: -100, right: -120, filter: 'blur(120px)', animation: 'pulseBlur 9s ease-in-out infinite 1.5s' }} />
      {/* center-right: warm rose-lilac accent — same as Vibrant's pink tint */}
      <div style={{ position: 'absolute', width: 480, height: 480, borderRadius: '50%', background: 'rgba(215,175,235,0.28)', top: '28%', right: '18%', filter: 'blur(100px)', animation: 'pulseBlur 11s ease-in-out infinite 2s' }} />
      {/* bottom-center: cool blue anchor */}
      <div style={{ position: 'absolute', width: 600, height: 600, borderRadius: '50%', background: 'rgba(100,150,220,0.30)', bottom: -140, left: '12%', filter: 'blur(130px)', animation: 'pulseBlur 8s ease-in-out infinite 3s' }} />
    </div>
  );
}

/* ═══════════════════════════════════════════
   ROLE PANEL — full-height half-screen panel
═══════════════════════════════════════════ */
function RolePanel({ role, title, subtitle, features, gradient, delay, onClick }) {
  const [hov, setHov] = useState(false);
  const letters = title.split('');

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        flex: 1,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        padding: '0 36px 56px',
        cursor: 'pointer',
        position: 'relative',
        overflow: 'hidden',
        transition: 'background 0.4s ease',
        background: hov ? 'rgba(255,255,255,0.07)' : 'transparent',
        animation: `panelReveal 0.7s cubic-bezier(.65,.05,.36,1) ${delay}ms both`,
      }}
    >
      {/* Hover glow */}
      {hov && (
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: role === 'doctor'
            ? 'radial-gradient(ellipse at 30% 80%, rgba(165,180,252,0.18) 0%, transparent 60%)'
            : 'radial-gradient(ellipse at 70% 80%, rgba(110,231,183,0.18) 0%, transparent 60%)',
        }} />
      )}

      {/* Feature list — same dot style as hero */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 11, marginBottom: 36 }}>
        {features.map((feat, i) => (
          <p key={i} style={{
            display: 'flex', alignItems: 'center', gap: 12,
            fontSize: 15, fontWeight: 400, color: 'rgba(255,255,255,0.7)',
            margin: 0, letterSpacing: '0.01em',
            transform: hov ? 'translateX(6px)' : 'translateX(0)',
            transition: `transform 0.35s ease ${i * 40}ms`,
          }}>
            <span style={{ display: 'flex', gap: 2.5, flexShrink: 0 }}>
              {[0,1,2].map(d => (
                <span key={d} style={{ width: 3.5, height: 3.5, borderRadius: '50%', background: 'rgba(255,255,255,0.5)', display: 'block' }} />
              ))}
            </span>
            {feat}
          </p>
        ))}
      </div>

      {/* Large title — same weight/size as hero "AI-Powered Diagnosis" */}
      <div style={{ overflow: 'hidden', marginBottom: 8 }}>
        {letters.map((ch, i) => (
          <span key={i} style={{
            display: 'inline-block',
            fontFamily: '"Plus Jakarta Sans", sans-serif',
            fontSize: 82,
            fontWeight: 300,
            letterSpacing: '-0.025em',
            color: 'rgba(255,255,255,0.95)',
            textShadow: '0 2px 32px rgba(100,120,180,0.2)',
            transform: hov ? 'translateY(-4px)' : 'translateY(0)',
            transition: `transform 0.5s cubic-bezier(.65,.05,.36,1) ${i * 20}ms`,
          }}>{ch}</span>
        ))}
      </div>

      <p style={{
        fontSize: 15, fontWeight: 400, color: 'rgba(255,255,255,0.55)',
        margin: '0 0 32px', letterSpacing: '0.01em',
      }}>{subtitle}</p>

      {/* Wide pill button — exact same anatomy as "Start Experience" */}
      <div style={{
        position: 'relative',
        display: 'inline-flex', alignItems: 'center',
        padding: '8px',
        background: hov ? 'rgba(255,255,255,0.52)' : 'rgba(255,255,255,0.38)',
        borderRadius: 999,
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        transition: 'background 0.3s',
        width: '100%',
      }}>
        {/* Pulse ring */}
        {hov && (
          <div style={{
            position: 'absolute', inset: 0, borderRadius: 999,
            border: '1px solid rgba(255,255,255,0.7)',
            animation: 'pulseButton 1.5s linear infinite',
            pointerEvents: 'none',
          }} />
        )}

        {/* Inner white pill */}
        <div className="btn-inner" style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          width: '100%', height: 58, borderRadius: 999,
          background: '#fff',
          position: 'relative', overflow: 'hidden',
          cursor: 'pointer', isolation: 'isolate',
        }}>
          {/* Hover gradient blob */}
          <div className="btn-hover-blob" style={{
            position: 'absolute', width: '100%', height: '200%',
            borderRadius: '50%',
            background: role === 'doctor'
              ? 'linear-gradient(135deg,#e8efff,#c1c8ff,#e6dfff,#d5e8ff)'
              : 'linear-gradient(135deg,#e8fff4,#c1f0e8,#d5fff0,#e8fffa)',
            filter: 'blur(18px)', mixBlendMode: 'multiply',
            left: 0, top: '50%', transform: 'translateY(-50%)',
          }} />
          <p style={{
            fontSize: 16, fontWeight: 600,
            color: '#1a2a3a',
            position: 'relative', zIndex: 1,
            display: 'flex', overflow: 'hidden',
            lineHeight: '20px', height: 20, margin: 0,
          }}>
            {`Enter as ${title}`.split('').map((ch, i) => (
              <span key={i} className="btn-letter" style={{
                width: ch === ' ' ? '0.4em' : 'auto',
                transitionDelay: `${i * 10}ms`,
              }}>{ch}</span>
            ))}
          </p>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   INTRO SCREEN
═══════════════════════════════════════════ */
export default function IntroScreen() {
  const navigate = useNavigate();
  const [preloaderVisible, setPreloaderVisible] = useState(true);
  const [phase, setPhase]   = useState('hero');
  const [titleIn, setTitleIn] = useState(false);
  const [featIn, setFeatIn]   = useState(false);
  const [btnIn, setBtnIn]     = useState(false);
  const [roleIn, setRoleIn]   = useState(false);

  const startLetters = 'Start Experience'.split('');

  useEffect(() => {
    const t0 = setTimeout(() => setPreloaderVisible(false), 1000);
    const t1 = setTimeout(() => setTitleIn(true),  1500);
    const t2 = setTimeout(() => setFeatIn(true),   1600);
    const t3 = setTimeout(() => setBtnIn(true),    2100);
    return () => { clearTimeout(t0); clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  const handleStart = () => {
    setPhase('role');
    setTimeout(() => setRoleIn(true), 60);
  };

  const features = [
    'Predictive AI',
    'MRI Analysis',
    'Early Detection',
    'Patient Support',
  ];

  /* Two-line title matching chosen text */
  const line1 = 'AI-Powered';
  const line2 = 'Alzheimer Diagnosis';

  /*
   * Background: a smooth periwinkle-blue → soft lilac gradient
   * exactly like the Vibrant Wellness hero (bluish-purple, not grey).
   */
  const wrapperStyle = {
    minHeight: '100vh', width: '100%', overflow: 'hidden',
    background: 'linear-gradient(135deg, #9db8d8 0%, #aab4d8 25%, #b8b0d4 50%, #c4b8dc 70%, #b0c4e0 100%)',
    fontFamily: '"Plus Jakarta Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    position: 'relative',
  };

  return (
    <>
      <style>{KEYFRAMES}</style>
      <Preloader visible={preloaderVisible} />

      <div style={wrapperStyle}>
        <Blobs />

        {/* ══════════ HERO PHASE ══════════ */}
        {phase === 'hero' && (
          <div style={{
            position: 'relative', zIndex: 1,
            width: '100%', height: '100vh',
            display: 'flex', flexDirection: 'column',
          }}>
            {/* Brain — fills entire screen, shifted right so text doesn't overlap */}
            <div style={{ position: 'absolute', inset: 0 }}>
              <BrainScene phase="hero" />
            </div>
            {/* Soft left-edge fade — brain dissolves behind text instead of hard cut */}
            <div style={{
              position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 2,
              background: 'linear-gradient(to right, rgba(160,175,218,0.72) 0%, rgba(160,175,218,0.3) 28%, transparent 48%)',
            }} />

            {/* Center-left: logo + big title (vertically centered) */}
            <div style={{
              position: 'absolute',
              left: 64, top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 10,
              maxWidth: '46vw',
            }}>
              {/* Logo chip — matches Vibrant's top-left brand tag */}
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 28,
                padding: '6px 14px 6px 8px',
                borderRadius: 999,
                background: 'rgba(255,255,255,0.18)',
                backdropFilter: 'blur(12px)',
                border: '0.5px solid rgba(255,255,255,0.35)',
                opacity: titleIn ? 1 : 0,
                transition: 'opacity 0.7s ease 1400ms',
              }}>
                <div style={{
                  width: 24, height: 24, borderRadius: 7,
                  background: 'rgba(255,255,255,0.75)', backdropFilter: 'blur(8px)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13,
                }}>🧠</div>
                <span style={{ fontFamily: '"Plus Jakarta Sans", sans-serif', fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.92)', letterSpacing: '0.02em' }}>ALZ ForeSight</span>
                <span style={{
                  fontSize: 8.5, padding: '2px 8px', borderRadius: 999,
                  background: 'rgba(255,255,255,0.25)', color: 'rgba(255,255,255,0.8)', fontWeight: 700,
                  letterSpacing: '0.08em', textTransform: 'uppercase',
                }}>BETA</span>
              </div>

              {/* Big title — line 1 — Vibrant spec: 8rem / weight 300 / tracking -3% / line-height 1 */}
              <div style={{ overflow: 'hidden', lineHeight: 1.2, paddingBottom: '0.25em' }}>
                {[...line1].map((ch, i) => (
                  <span
                    key={i}
                    className={titleIn ? 'title-shimmer' : ''}
                    style={{
                      display: 'inline-block',
                      fontFamily: '"Plus Jakarta Sans", sans-serif',
                      fontSize: '5.5rem',
                      fontWeight: 300,
                      letterSpacing: '-0.03em',
                      lineHeight: 1.2,
                      color: 'rgba(255,255,255,0.97)',
                      transform: titleIn ? 'translateY(0)' : 'translateY(110px)',
                      opacity: titleIn ? 1 : 0,
                      transition: `transform 0.9s cubic-bezier(.65,.05,.36,1) ${1500 + i * 42}ms, opacity 0.8s ease ${1500 + i * 42}ms`,
                      willChange: 'transform',
                    }}
                  >{ch === ' ' ? ' ' : ch}</span>
                ))}
              </div>

              {/* Big title — line 2 */}
              <div style={{ overflow: 'hidden', lineHeight: 1.2, marginTop: 2, paddingBottom: '0.25em' }}>
                {[...line2].map((ch, i) => (
                  <span
                    key={i}
                    className={titleIn ? 'title-shimmer' : ''}
                    style={{
                      display: 'inline-block',
                      fontFamily: '"Plus Jakarta Sans", sans-serif',
                      fontSize: '5.5rem',
                      fontWeight: 300,
                      letterSpacing: '-0.03em',
                      lineHeight: 1.2,
                      color: 'rgba(255,255,255,0.97)',
                      transform: titleIn ? 'translateY(0)' : 'translateY(110px)',
                      opacity: titleIn ? 1 : 0,
                      transition: `transform 0.9s cubic-bezier(.65,.05,.36,1) ${1900 + i * 42}ms, opacity 0.8s ease ${1900 + i * 42}ms`,
                      willChange: 'transform',
                    }}
                  >{ch === ' ' ? ' ' : ch}</span>
                ))}
              </div>
            </div>

            {/* Center-right: feature list (vertically centered) — exact Vibrant anatomy */}
            <div style={{
              position: 'absolute',
              right: 72, top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 10,
              display: 'flex', flexDirection: 'column', gap: 14, alignItems: 'flex-end',
            }}>
              {features.map((feat, i) => (
                <div key={i} style={{ overflow: 'hidden' }}>
                  <p style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    fontFamily: '"Plus Jakarta Sans", sans-serif',
                    fontSize: 16, fontWeight: 400, color: 'rgba(255,255,255,0.90)',
                    letterSpacing: '0.015em', margin: 0,
                    transform: featIn ? 'translateY(0)' : 'translateY(90px)',
                    opacity: featIn ? 1 : 0,
                    transition: `transform 0.9s cubic-bezier(.65,.05,.36,1) ${1600 + i * 110}ms, opacity 0.9s ease ${1600 + i * 110}ms`,
                  }}>
                    {/* Vibrant-style two-dot cluster icon */}
                    <span style={{ display: 'flex', gap: 3, flexShrink: 0, alignItems: 'center' }}>
                      <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'rgba(255,255,255,0.55)', display: 'block' }} />
                      <span style={{ width: 3.5, height: 3.5, borderRadius: '50%', background: 'rgba(255,255,255,0.35)', display: 'block' }} />
                    </span>
                    {feat}
                  </p>
                </div>
              ))}
            </div>

            {/* Bottom-center: Start Experience */}
            <div style={{
              position: 'absolute', bottom: 40, left: '50%', transform: 'translateX(-50%)',
              zIndex: 10,
              opacity: btnIn ? 1 : 0,
              transition: 'opacity 0.5s ease 2100ms',
            }}>
              <div
                onClick={handleStart}
                style={{
                  position: 'relative', cursor: 'pointer',
                  display: 'inline-flex', alignItems: 'center',
                  padding: '8px',
                  background: 'rgba(255,255,255,0.41)',
                  borderRadius: 999,
                  backdropFilter: 'blur(8px)',
                  WebkitBackdropFilter: 'blur(8px)',
                  transition: 'background 0.3s',
                }}
                onMouseEnter={e => e.currentTarget.style.background='rgba(255,255,255,0.52)'}
                onMouseLeave={e => e.currentTarget.style.background='rgba(255,255,255,0.41)'}
              >
                <div style={{
                  position: 'absolute', inset: 0, borderRadius: 999,
                  border: '1px solid rgba(255,255,255,0.7)',
                  animation: 'pulseButton 1.5s linear infinite',
                  pointerEvents: 'none',
                }} />
                <div className="btn-inner" style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  padding: '0 52px', height: 58, borderRadius: 999,
                  background: '#fff', position: 'relative', overflow: 'hidden',
                  minWidth: 240, cursor: 'pointer', isolation: 'isolate',
                }}>
                  <div className="btn-hover-blob" style={{
                    position: 'absolute', width: '100%', height: '200%', borderRadius: '50%',
                    background: 'linear-gradient(135deg,#e8efff,#c1e8ff,#e6dfff,#d5e8ff)',
                    filter: 'blur(18px)', mixBlendMode: 'multiply',
                    left: 0, top: '50%', transform: 'translateY(-50%)',
                  }} />
                  <p style={{
                    fontSize: 16, fontWeight: 600, color: '#1a2a3a',
                    position: 'relative', zIndex: 1, display: 'flex',
                    overflow: 'hidden', lineHeight: '20px', height: 20, margin: 0, whiteSpace: 'nowrap',
                    transition: 'color 0.3s',
                  }}>
                    {startLetters.map((ch, i) => (
                      <span key={i} className="btn-letter" style={{ width: ch === ' ' ? '0.4em' : 'auto', transitionDelay: `${i * 10}ms` }}>{ch}</span>
                    ))}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ══════════ ROLE PHASE — split screen ══════════ */}
        {phase === 'role' && (
          <div style={{
            position: 'relative', zIndex: 1,
            width: '100%', height: '100vh',
            display: 'flex', flexDirection: 'column',
          }}>

            {/* Top bar */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '32px 48px 0',
              position: 'relative', zIndex: 20,
              opacity: roleIn ? 1 : 0,
              transition: 'opacity 0.4s ease',
            }}>
              {/* Back */}
              <button
                onClick={() => { setPhase('hero'); setRoleIn(false); }}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  padding: '8px 18px', borderRadius: 999,
                  background: 'rgba(255,255,255,0.22)', backdropFilter: 'blur(12px)',
                  border: '0.5px solid rgba(255,255,255,0.4)',
                  color: 'rgba(255,255,255,0.85)', fontSize: 12, fontWeight: 500,
                  cursor: 'pointer', transition: 'background 0.15s',
                }}
                onMouseEnter={e => e.currentTarget.style.background='rgba(255,255,255,0.35)'}
                onMouseLeave={e => e.currentTarget.style.background='rgba(255,255,255,0.22)'}
              >← Back</button>

              {/* Sign In label — centered */}
              <div style={{ textAlign: 'center' }}>
                <p style={{
                  fontSize: 11, fontWeight: 700, letterSpacing: '0.14em',
                  textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)',
                  margin: 0,
                }}>Sign In</p>
                <p style={{
                  fontSize: 22, fontWeight: 300, color: 'rgba(255,255,255,0.9)',
                  letterSpacing: '-0.01em', margin: '4px 0 0',
                }}>Choose your role</p>
              </div>

              {/* Logo right */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{
                  width: 26, height: 26, borderRadius: 8,
                  background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(8px)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14,
                }}>🧠</div>
                <span style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.85)' }}>ALZ ForeSight</span>
              </div>
            </div>

            {/* Divider line */}
            <div style={{
              width: '100%', height: '0.5px',
              background: 'rgba(255,255,255,0.15)',
              marginTop: 28,
              opacity: roleIn ? 1 : 0,
              transition: 'opacity 0.4s ease 100ms',
            }} />

            {/* Two panels */}
            <div style={{
              flex: 1, display: 'flex',
              opacity: roleIn ? 1 : 0,
              transition: 'opacity 0.3s ease',
            }}>
              {/* Doctor — LEFT */}
              <RolePanel
                role="doctor"
                title="Doctor"
                subtitle="Medical professional access"
                features={['Patient Management', 'AI Diagnosis Tools', 'MRI Analysis', 'Clinical Reports']}
                gradient="linear-gradient(135deg,#a5b4fc,#818cf8)"
                delay={120}
                onClick={() => navigate('/login', { state: { role: 'doctor' } })}
              />

              {/* Vertical divider */}
              <div style={{
                width: '0.5px',
                background: 'rgba(255,255,255,0.18)',
                margin: '0',
                flexShrink: 0,
              }} />

              {/* Patient — RIGHT */}
              <RolePanel
                role="patient"
                title="Patient"
                subtitle="Personal health portal"
                features={['My Health Records', 'Appointments', 'AI Health Insights', 'Progress Tracking']}
                gradient="linear-gradient(135deg,#6ee7b7,#38bdf8)"
                delay={200}
                onClick={() => navigate('/login', { state: { role: 'patient' } })}
              />
            </div>
          </div>
        )}
      </div>
    </>
  );
}
