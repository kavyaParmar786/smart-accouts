import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Sparkles, Mail, Lock, User, ArrowRight } from 'lucide-react';
import { authAPI } from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import { Button, Input, Select } from '../../components/ui/index.jsx';
import toast from 'react-hot-toast';

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

  return (
    <div className="min-h-screen bg-[#0a0d14] flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="flex items-center gap-2.5 mb-8">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center"><Sparkles size={14} className="text-white" /></div>
          <p className="text-base font-bold text-white">SmartAccounts</p>
        </div>
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-1.5">Create your account</h2>
          <p className="text-slate-500 text-sm">Start managing your finances smarter, today.</p>
        </div>
        {errors.general && <div className="mb-5 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-400">{errors.general}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Full Name" type="text" placeholder="John Doe" icon={<User size={14} />}
            value={form.name} onChange={set('name')} error={errors.name} autoComplete="name" />
          <Input label="Email Address" type="email" placeholder="you@company.com" icon={<Mail size={14} />}
            value={form.email} onChange={set('email')} error={errors.email} autoComplete="email" />
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Password</label>
            <div className="relative">
              <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input type={showPw ? 'text' : 'password'} placeholder="Min. 6 characters" value={form.password}
                onChange={set('password')} autoComplete="new-password"
                className={`w-full bg-[#0f1420] border rounded-lg text-sm text-slate-200 placeholder-slate-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all pl-10 pr-10 py-2.5 ${errors.password ? 'border-red-500/50' : 'border-[#1e2d45]'}`} />
              <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
            {errors.password && <p className="text-xs text-red-400">{errors.password}</p>}
          </div>
          <Input label="Confirm Password" type="password" placeholder="Repeat your password" icon={<Lock size={14} />}
            value={form.confirmPassword} onChange={set('confirmPassword')} error={errors.confirmPassword} autoComplete="new-password" />
          <Select label="Account Role" value={form.role} onChange={set('role')}>
            <option value="admin">Admin — Full access</option>
            <option value="staff">Staff — Limited access</option>
          </Select>
          <Button type="submit" loading={loading} className="w-full" size="lg" icon={!loading && <ArrowRight size={16} />}>
            {loading ? 'Creating account...' : 'Create Account'}
          </Button>
        </form>
        <p className="mt-6 text-sm text-slate-500 text-center">
          Already have an account?{' '}<Link to="/login" className="text-blue-400 hover:text-blue-300 font-medium">Sign in</Link>
        </p>
        <p className="mt-4 text-xs text-slate-600 text-center">By registering, you agree to our Terms of Service and Privacy Policy.</p>
      </div>
    </div>
  );
}
