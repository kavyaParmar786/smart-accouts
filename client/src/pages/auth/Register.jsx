import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Sparkles, Mail, Lock, User, ArrowRight } from 'lucide-react';
import { authAPI } from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';

const inputStyle = (hasError) => ({
  width: '100%', background: '#0f1420',
  border: `1px solid ${hasError ? 'rgba(239,68,68,0.5)' : '#1e2d45'}`,
  borderRadius: 12, fontSize: 14, color: '#e2e8f0',
  paddingLeft: 40, paddingRight: 16, paddingTop: 12, paddingBottom: 12,
  outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s',
});

const labelStyle = {
  fontSize: 11, fontWeight: 600, color: '#64748b',
  textTransform: 'uppercase', letterSpacing: '0.08em',
};

export default function Register() {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '', role: 'admin' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.name || form.name.length < 2) e.name = 'Name must be at least 2 characters';
    if (!form.email) e.email = 'Email is required';
    if (!form.password || form.password.length < 6) e.password = 'Password must be at least 6 characters';
    if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match';
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const { confirmPassword, ...payload } = form;
      const res = await authAPI.register(payload);
      const { user, token } = res.data.data;
      setAuth(user, token);
      toast.success('Account created! Welcome to SmartAccounts.');
      navigate('/dashboard');
    } catch (err) {
      setErrors({ general: err.response?.data?.message || 'Registration failed' });
    } finally { setLoading(false); }
  };

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));
  const focusBlue = (e) => { e.target.style.borderColor = '#3b82f6'; };
  const blurGray  = (e) => { e.target.style.borderColor = errors[e.target.name] ? 'rgba(239,68,68,0.5)' : '#1e2d45'; };

  return (
    <div style={{ minHeight: '100vh', background: '#070a12', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 420 }}>

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 32 }}>
          <div style={{ width: 34, height: 34, borderRadius: 10, background: 'linear-gradient(135deg,#3b82f6,#4f46e5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Sparkles size={15} color="white" />
          </div>
          <p style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>SmartAccounts</p>
        </div>

        {/* Heading */}
        <div style={{ marginBottom: 28 }}>
          <h2 style={{ fontSize: 26, fontWeight: 700, color: '#fff', marginBottom: 6 }}>Create your account</h2>
          <p style={{ fontSize: 14, color: '#64748b' }}>Start managing your finances smarter, today.</p>
        </div>

        {/* General error */}
        {errors.general && (
          <div style={{ marginBottom: 20, padding: '14px 16px', borderRadius: 12, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', fontSize: 13, color: '#f87171' }}>
            {errors.general}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Name */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={labelStyle}>Full Name</label>
            <div style={{ position: 'relative' }}>
              <User size={14} color="#475569" style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
              <input name="name" type="text" placeholder="John Doe" value={form.name} onChange={set('name')} autoComplete="name"
                style={inputStyle(errors.name)} onFocus={focusBlue} onBlur={blurGray} />
            </div>
            {errors.name && <p style={{ fontSize: 12, color: '#f87171' }}>{errors.name}</p>}
          </div>

          {/* Email */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={labelStyle}>Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={14} color="#475569" style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
              <input name="email" type="email" placeholder="you@company.com" value={form.email} onChange={set('email')} autoComplete="email"
                style={inputStyle(errors.email)} onFocus={focusBlue} onBlur={blurGray} />
            </div>
            {errors.email && <p style={{ fontSize: 12, color: '#f87171' }}>{errors.email}</p>}
          </div>

          {/* Password */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={labelStyle}>Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={14} color="#475569" style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
              <input name="password" type={showPw ? 'text' : 'password'} placeholder="Min. 6 characters" value={form.password}
                onChange={set('password')} autoComplete="new-password"
                style={{ ...inputStyle(errors.password), paddingRight: 44 }} onFocus={focusBlue} onBlur={blurGray} />
              <button type="button" onClick={() => setShowPw(p => !p)}
                style={{ position: 'absolute', right: 13, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#475569', padding: 0 }}>
                {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
            {errors.password && <p style={{ fontSize: 12, color: '#f87171' }}>{errors.password}</p>}
          </div>

          {/* Confirm Password */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={labelStyle}>Confirm Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={14} color="#475569" style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
              <input name="confirmPassword" type="password" placeholder="Repeat your password" value={form.confirmPassword}
                onChange={set('confirmPassword')} autoComplete="new-password"
                style={inputStyle(errors.confirmPassword)} onFocus={focusBlue} onBlur={blurGray} />
            </div>
            {errors.confirmPassword && <p style={{ fontSize: 12, color: '#f87171' }}>{errors.confirmPassword}</p>}
          </div>

          {/* Role */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={labelStyle}>Account Role</label>
            <select value={form.role} onChange={set('role')}
              style={{ width: '100%', background: '#0f1420', border: '1px solid #1e2d45', borderRadius: 12, fontSize: 14, color: '#e2e8f0', padding: '12px 16px', outline: 'none', boxSizing: 'border-box', appearance: 'none' }}>
              <option value="admin">Admin — Full access</option>
              <option value="staff">Staff — Limited access</option>
            </select>
          </div>

          {/* Submit */}
          <button type="submit" disabled={loading}
            style={{ width: '100%', background: loading ? '#1d4ed8' : '#2563eb', color: '#fff', border: 'none', borderRadius: 12, padding: '13px 24px', fontSize: 14, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 4 }}
            onMouseEnter={e => { if (!loading) e.currentTarget.style.background = '#1d4ed8'; }}
            onMouseLeave={e => { if (!loading) e.currentTarget.style.background = '#2563eb'; }}>
            {loading ? 'Creating account...' : <><span>Create Account</span><ArrowRight size={16} /></>}
          </button>
        </form>

        {/* Links */}
        <p style={{ marginTop: 24, textAlign: 'center', fontSize: 14, color: '#64748b' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: '#60a5fa', fontWeight: 500, textDecoration: 'none' }}>Sign in</Link>
        </p>
        <p style={{ marginTop: 12, textAlign: 'center', fontSize: 12, color: '#334155' }}>
          By registering, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
}
