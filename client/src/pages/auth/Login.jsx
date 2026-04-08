import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Sparkles, Mail, Lock, ArrowRight, TrendingUp, Receipt, Brain } from 'lucide-react';
import { authAPI } from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import { Button } from '../../components/ui/index.jsx';
import toast from 'react-hot-toast';

const FEATURES = [
  { icon: TrendingUp, title: 'Real-time Dashboard', desc: 'Live P&L, cash flow, and business health at a glance.' },
  { icon: Receipt,    title: 'GST-ready Invoicing', desc: 'Professional invoices with automatic tax calculation.'  },
  { icon: Brain,      title: 'AI Insights',          desc: 'Instant analysis of spending patterns and trends.'     },
];

export default function Login() {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await authAPI.login(form);
      const { user, token } = res.data.data;
      setAuth(user, token);
      toast.success('Welcome back, ' + user.name.split(' ')[0] + '!');
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#070a12', display: 'flex' }}>

      {/* Left panel */}
      <div style={{
        width: '52%', flexShrink: 0, display: 'flex', flexDirection: 'column',
        justifyContent: 'space-between', padding: '48px', overflow: 'hidden',
        position: 'relative', background: '#080c18',
      }} className="hidden lg:flex">

        {/* Grid */}
        <div style={{
          position: 'absolute', inset: 0, opacity: 0.025,
          backgroundImage: 'linear-gradient(#3b82f6 1px, transparent 1px), linear-gradient(90deg, #3b82f6 1px, transparent 1px)',
          backgroundSize: '48px 48px', pointerEvents: 'none',
        }} />
        <div style={{ position: 'absolute', top: '30%', left: '-80px', width: 320, height: 320, background: 'rgba(59,130,246,0.12)', borderRadius: '50%', filter: 'blur(80px)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '20%', right: 32, width: 240, height: 240, background: 'rgba(99,102,241,0.08)', borderRadius: '50%', filter: 'blur(60px)', pointerEvents: 'none' }} />

        {/* Logo */}
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: 'linear-gradient(135deg,#3b82f6,#4f46e5)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Sparkles size={18} color="white" />
          </div>
          <div>
            <p style={{ fontSize: 14, fontWeight: 700, color: '#fff', lineHeight: 1 }}>SmartAccounts</p>
            <p style={{ fontSize: 11, color: '#60a5fa', marginTop: 3 }}>AI-Powered Accounting</p>
          </div>
        </div>

        {/* Headline */}
        <div style={{ position: 'relative' }}>
          <h1 style={{ fontSize: 48, fontWeight: 800, color: '#fff', lineHeight: 1.1, letterSpacing: '-0.02em', marginBottom: 20 }}>
            The smarter way<br />to run your books.
          </h1>
          <p style={{ color: '#94a3b8', fontSize: 15, lineHeight: 1.7, maxWidth: 360 }}>
            Full-stack accounting for modern businesses. Invoices, inventory, reports — powered by AI insights.
          </p>
        </div>

        {/* Feature cards */}
        <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {FEATURES.map(({ icon: Icon, title, desc }) => (
            <div key={title} style={{ display: 'flex', alignItems: 'flex-start', gap: 14, padding: '16px', borderRadius: 14, background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <div style={{ width: 34, height: 34, borderRadius: 10, background: 'rgba(59,130,246,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon size={15} color="#60a5fa" />
              </div>
              <div>
                <p style={{ fontSize: 13, fontWeight: 600, color: '#e2e8f0' }}>{title}</p>
                <p style={{ fontSize: 12, color: '#64748b', marginTop: 3, lineHeight: 1.5 }}>{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, background: '#070a12' }}>
        <div style={{ width: '100%', maxWidth: 400 }}>

          {/* Mobile logo */}
          <div className="lg:hidden" style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 32 }}>
            <div style={{ width: 32, height: 32, borderRadius: 10, background: 'linear-gradient(135deg,#3b82f6,#4f46e5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Sparkles size={14} color="white" />
            </div>
            <p style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>SmartAccounts</p>
          </div>

          {/* Heading */}
          <div style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: 26, fontWeight: 700, color: '#fff', marginBottom: 6 }}>Welcome back</h2>
            <p style={{ fontSize: 14, color: '#64748b' }}>Sign in to your account to continue</p>
          </div>

          {/* Error */}
          {error && (
            <div style={{ marginBottom: 20, padding: '14px 16px', borderRadius: 12, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', fontSize: 13, color: '#f87171' }}>
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Email */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 11, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={14} color="#475569" style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                <input
                  type="email"
                  placeholder="you@company.com"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  autoComplete="email"
                  required
                  style={{
                    width: '100%', background: '#0f1420', border: '1px solid #1e2d45', borderRadius: 12,
                    fontSize: 14, color: '#e2e8f0', paddingLeft: 40, paddingRight: 16, paddingTop: 12, paddingBottom: 12,
                    outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s',
                  }}
                  onFocus={e => e.target.style.borderColor = '#3b82f6'}
                  onBlur={e => e.target.style.borderColor = '#1e2d45'}
                />
              </div>
            </div>

            {/* Password */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 11, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={14} color="#475569" style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                <input
                  type={showPw ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  autoComplete="current-password"
                  required
                  style={{
                    width: '100%', background: '#0f1420', border: '1px solid #1e2d45', borderRadius: 12,
                    fontSize: 14, color: '#e2e8f0', paddingLeft: 40, paddingRight: 44, paddingTop: 12, paddingBottom: 12,
                    outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s',
                  }}
                  onFocus={e => e.target.style.borderColor = '#3b82f6'}
                  onBlur={e => e.target.style.borderColor = '#1e2d45'}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(p => !p)}
                  style={{ position: 'absolute', right: 13, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#475569', padding: 0 }}
                >
                  {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%', background: loading ? '#1d4ed8' : '#2563eb', color: '#fff',
                border: 'none', borderRadius: 12, padding: '13px 24px', fontSize: 14, fontWeight: 600,
                cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center',
                justifyContent: 'center', gap: 8, transition: 'background 0.2s', marginTop: 4,
              }}
              onMouseEnter={e => { if (!loading) e.currentTarget.style.background = '#1d4ed8'; }}
              onMouseLeave={e => { if (!loading) e.currentTarget.style.background = '#2563eb'; }}
            >
              {loading ? (
                <span>Signing in...</span>
              ) : (
                <><span>Sign In</span><ArrowRight size={16} /></>
              )}
            </button>
          </form>

          {/* Links */}
          <p style={{ marginTop: 24, textAlign: 'center', fontSize: 14, color: '#64748b' }}>
            Don&apos;t have an account?{' '}
            <Link to="/register" style={{ color: '#60a5fa', fontWeight: 500, textDecoration: 'none' }}>
              Create one free
            </Link>
          </p>

          {/* Demo box */}
          <div style={{ marginTop: 20, padding: '14px 16px', borderRadius: 12, background: '#0f1420', border: '1px solid #1e2d45', textAlign: 'center' }}>
            <p style={{ fontSize: 12, color: '#64748b' }}>
              <span style={{ color: '#94a3b8', fontWeight: 500 }}>Demo:</span>{' '}
              demo@smartaccounts.io / demo123
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
