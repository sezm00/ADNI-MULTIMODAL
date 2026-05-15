import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { authAPI } from '../services/api';

const KEYFRAMES = `
@keyframes pulseBlur {
  0%, 100% { opacity: 0.6; transform: scale(1); }
  50%       { opacity: 1;   transform: scale(1.08); }
}
@keyframes titleSlideUp {
  from { opacity: 0; transform: translateY(60px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes rowIn {
  from { opacity: 0; transform: translateX(16px); }
  to   { opacity: 1; transform: translateX(0); }
}
@keyframes cardIn {
  from { opacity: 0; transform: translateY(24px); }
  to   { opacity: 1; transform: translateY(0); }
}
`;

const IconMail = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2d3a5a" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="3"/>
    <path d="M2 7l10 7 10-7"/>
  </svg>
);
const IconLock = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2d3a5a" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <rect x="5" y="11" width="14" height="10" rx="2"/>
    <path d="M8 11V7a4 4 0 018 0v4"/>
  </svg>
);
const IconChevron = ({ color = '#2d3a5a' }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 18l6-6-6-6"/>
  </svg>
);

function FieldRow({ icon, children, delay, focused }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 16,
      background: focused ? 'rgba(255,255,255,0.98)' : 'rgba(235,238,250,0.85)',
      borderRadius: 999,
      padding: '0 22px 0 18px',
      height: 70,
      border: focused ? '1.5px solid rgba(100,120,220,0.35)' : '1px solid rgba(255,255,255,0.7)',
      transition: 'all 0.2s ease',
      boxShadow: focused ? '0 4px 20px rgba(80,100,200,0.1)' : '0 2px 8px rgba(30,40,80,0.04)',
      animation: `rowIn 0.45s cubic-bezier(.65,.05,.36,1) ${delay}ms both`,
    }}>
      <div style={{ flexShrink: 0, opacity: 0.7 }}>{icon}</div>
      {children}
    </div>
  );
}

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const role = location.state?.role || 'patient';

  const [email, setEmail]           = useState('');
  const [password, setPassword]     = useState('');
  const [error, setError]           = useState('');
  const [loading, setLoading]       = useState(false);
  const [emailFocus, setEmailFocus] = useState(false);
  const [passFocus, setPassFocus]   = useState(false);
  const [btnHov, setBtnHov]         = useState(false);

  const handleLogin = async (e) => {
    if (e?.preventDefault) e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await authAPI.login(email, password, role);
      if (res.data.success) {
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        navigate(res.data.user.role === 'patient' ? '/patient-dashboard' : '/doctor-management');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const isDoctor   = role === 'doctor';
  const titleLine1 = 'Welcome,';
  const titleLine2 = isDoctor ? 'Doctor.' : 'Back.';
  const cardTitle  = isDoctor ? 'DOCTOR SIGN IN' : 'PATIENT SIGN IN';
  const testEmail  = isDoctor ? 'doctor@test.com' : 'patient@test.com';

  return (
    <>
      <style>{KEYFRAMES}</style>

      <div style={{
        minHeight: '100vh', width: '100%',
        background: 'linear-gradient(135deg, #a8bedd 0%, #b8b8dc 40%, #ccc0e0 70%, #b8cce8 100%)',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        overflow: 'hidden', position: 'relative',
        display: 'flex',
      }}>

        {/* Blobs */}
        <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
          <div style={{ position: 'absolute', width: 700, height: 700, borderRadius: '50%', background: 'rgba(140,170,230,0.35)', top: -200, left: -150, filter: 'blur(120px)', animation: 'pulseBlur 7s ease-in-out infinite' }} />
          <div style={{ position: 'absolute', width: 550, height: 550, borderRadius: '50%', background: 'rgba(170,160,220,0.28)', top: -80, right: -100, filter: 'blur(100px)', animation: 'pulseBlur 9s ease-in-out infinite 1.5s' }} />
          <div style={{ position: 'absolute', width: 500, height: 500, borderRadius: '50%', background: 'rgba(120,160,220,0.22)', bottom: -100, left: '15%', filter: 'blur(110px)', animation: 'pulseBlur 8s ease-in-out infinite 3s' }} />
        </div>

        {/* ── LEFT: large Vibrant-style typography, CSS animations — no state delay ── */}
        <div style={{
          position: 'relative', zIndex: 1,
          width: '52%', display: 'flex', flexDirection: 'column',
          justifyContent: 'center', padding: '0 0 0 64px',
        }}>
          {/* Back */}
          <button
            onClick={() => navigate('/')}
            style={{
              position: 'absolute', top: 36, left: 64,
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '8px 18px', borderRadius: 999,
              background: 'rgba(255,255,255,0.22)', backdropFilter: 'blur(12px)',
              border: '0.5px solid rgba(255,255,255,0.4)',
              fontSize: 12, fontWeight: 500, color: 'rgba(255,255,255,0.85)',
              cursor: 'pointer', transition: 'background 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.35)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.22)'}
          >← Back</button>

          {/* Role badge */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 10,
            marginBottom: 24,
            animation: 'fadeUp 0.5s ease both',
          }}>
            <div style={{
              width: 38, height: 38, borderRadius: 11,
              background: isDoctor
                ? 'linear-gradient(135deg, rgba(165,180,252,0.8), rgba(129,140,248,0.8))'
                : 'linear-gradient(135deg, rgba(110,231,183,0.8), rgba(56,189,248,0.8))',
              backdropFilter: 'blur(8px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: '0.5px solid rgba(255,255,255,0.5)',
            }}>
              {isDoctor ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="8" r="4"/><path d="M6 20v-2a6 6 0 0112 0v2"/><path d="M12 14v4M10 16h4"/>
                </svg>
              )}
            </div>
            <span style={{
              fontSize: 11, fontWeight: 700, letterSpacing: '0.12em',
              textTransform: 'uppercase', color: 'rgba(255,255,255,0.6)',
            }}>{isDoctor ? 'Medical Professional' : 'Patient Portal'}</span>
          </div>

          {/* Title — CSS animation, no mounted state, zero lag */}
          <div style={{ lineHeight: 1, marginBottom: 20 }}>
            {/* Line 1 */}
            <div style={{ overflow: 'hidden' }}>
              {[...titleLine1].map((ch, i) => (
                <span key={i} style={{
                  display: 'inline-block',
                  fontSize: 90, fontWeight: 400, letterSpacing: '-0.025em',
                  color: 'rgba(255,255,255,0.97)',
                  textShadow: '0 4px 32px rgba(80,100,180,0.22)',
                  animation: `titleSlideUp 0.75s cubic-bezier(.65,.05,.36,1) ${i * 32}ms both`,
                }}>{ch === ' ' ? ' ' : ch}</span>
              ))}
            </div>
            {/* Line 2 — tight against line 1 */}
            <div style={{ overflow: 'hidden', marginTop: -6 }}>
              {[...titleLine2].map((ch, i) => (
                <span key={i} style={{
                  display: 'inline-block',
                  fontSize: 90, fontWeight: 400, letterSpacing: '-0.025em',
                  color: 'rgba(255,255,255,0.97)',
                  textShadow: '0 4px 32px rgba(80,100,180,0.22)',
                  animation: `titleSlideUp 0.75s cubic-bezier(.65,.05,.36,1) ${(titleLine1.length + i) * 32}ms both`,
                }}>{ch}</span>
              ))}
            </div>
          </div>

          {/* Subtitle */}
          <p style={{
            fontSize: 16, fontWeight: 400, color: 'rgba(255,255,255,0.58)',
            letterSpacing: '0.01em', lineHeight: 1.6,
            animation: 'fadeUp 0.6s ease 400ms both',
          }}>
            {isDoctor
              ? 'Access patient records, AI diagnosis\ntools and real-time brain analysis.'
              : 'View your health records, appointments\nand personalized AI health insights.'}
          </p>
        </div>

        {/* ── RIGHT: "Explore Categories" style login card — CSS animation, no state ── */}
        <div style={{
          position: 'relative', zIndex: 1,
          width: '48%', display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '40px 60px 40px 20px',
        }}>
          <div style={{
            width: '100%', maxWidth: 460,
            background: 'rgba(255,255,255,0.52)',
            backdropFilter: 'blur(28px)',
            WebkitBackdropFilter: 'blur(28px)',
            border: '1px solid rgba(255,255,255,0.72)',
            borderRadius: 32,
            padding: '36px 28px 32px',
            boxShadow: '0 12px 60px rgba(30,40,100,0.12)',
            animation: 'cardIn 0.5s ease both',
          }}>

            {/* ALL-CAPS tracked header */}
            <p style={{
              fontSize: 11, fontWeight: 800,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: '#2d3a5a',
              textAlign: 'center',
              margin: '0 0 26px',
              opacity: 0.8,
            }}>{cardTitle}</p>

            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

              {/* Email */}
              <FieldRow icon={<IconMail />} delay={60} focused={emailFocus}>
                <input
                  type="email" value={email}
                  onChange={e => setEmail(e.target.value)}
                  onFocus={() => setEmailFocus(true)}
                  onBlur={() => setEmailFocus(false)}
                  placeholder="Email address" required
                  style={{
                    flex: 1, background: 'none', border: 'none', outline: 'none',
                    fontSize: 16, fontWeight: 500, color: '#1a2a4a',
                    letterSpacing: '-0.01em',
                  }}
                />
              </FieldRow>

              {/* Password */}
              <FieldRow icon={<IconLock />} delay={120} focused={passFocus}>
                <input
                  type="password" value={password}
                  onChange={e => setPassword(e.target.value)}
                  onFocus={() => setPassFocus(true)}
                  onBlur={() => setPassFocus(false)}
                  placeholder="Password" required
                  style={{
                    flex: 1, background: 'none', border: 'none', outline: 'none',
                    fontSize: 16, fontWeight: 500, color: '#1a2a4a',
                    letterSpacing: '-0.01em',
                  }}
                />
                <button type="button" style={{
                  fontSize: 11, fontWeight: 600, color: 'rgba(45,58,90,0.4)',
                  background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                  letterSpacing: '0.04em', whiteSpace: 'nowrap',
                }}>Forgot?</button>
              </FieldRow>

              {/* Test account */}
              <div style={{
                padding: '11px 18px', borderRadius: 16,
                background: 'rgba(255,255,255,0.6)',
                border: '1px solid rgba(255,255,255,0.8)',
                animation: 'rowIn 0.45s ease 180ms both',
              }}>
                <p style={{ fontSize: 10, fontWeight: 700, color: 'rgba(45,58,90,0.45)', marginBottom: 3, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Test account</p>
                <p style={{ fontSize: 12, color: 'rgba(45,58,90,0.6)', lineHeight: 1.7, margin: 0 }}>
                  {testEmail}<br />
                  <span style={{ color: 'rgba(45,58,90,0.38)' }}>password123</span>
                </p>
              </div>

              {/* Error */}
              {error && (
                <div style={{
                  padding: '11px 18px', borderRadius: 16,
                  background: 'rgba(254,226,226,0.8)', border: '1px solid rgba(252,165,165,0.5)',
                  fontSize: 13, color: '#991b1b',
                }}>{error}</div>
              )}

              {/* Sign in — dark pill row (CTA) */}
              <button
                type="submit" disabled={loading}
                onMouseEnter={() => setBtnHov(true)}
                onMouseLeave={() => setBtnHov(false)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 16,
                  background: btnHov && !loading ? 'rgba(35,46,78,0.95)' : 'rgba(45,58,90,0.88)',
                  borderRadius: 999,
                  padding: '0 22px 0 16px',
                  height: 70,
                  border: 'none',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: btnHov && !loading
                    ? '0 8px 32px rgba(30,40,100,0.28)'
                    : '0 4px 16px rgba(30,40,100,0.15)',
                  transform: btnHov && !loading ? 'translateY(-1px)' : 'translateY(0)',
                  animation: 'rowIn 0.45s ease 240ms both',
                  width: '100%', opacity: loading ? 0.7 : 1,
                }}
              >
                <div style={{
                  width: 36, height: 36, borderRadius: '50%',
                  background: 'rgba(255,255,255,0.12)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  {isDoctor ? (
                    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
                    </svg>
                  ) : (
                    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="8" r="4"/><path d="M6 20v-2a6 6 0 0112 0v2"/>
                    </svg>
                  )}
                </div>
                <span style={{
                  flex: 1, textAlign: 'left',
                  fontSize: 16, fontWeight: 600, color: 'rgba(255,255,255,0.95)',
                  letterSpacing: '-0.01em',
                }}>
                  {loading ? 'Signing in…' : `Sign in as ${isDoctor ? 'Doctor' : 'Patient'}`}
                </span>
                <IconChevron color="rgba(255,255,255,0.5)" />
              </button>
            </form>

            <p style={{ textAlign: 'center', fontSize: 12, color: 'rgba(45,58,90,0.38)', marginTop: 20 }}>
              Don't have an account?{' '}
              <button style={{
                color: '#5b6eab', fontWeight: 700, background: 'none',
                border: 'none', cursor: 'pointer', fontSize: 12, padding: 0,
              }}>Sign up</button>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

export default Login;
