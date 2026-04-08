// Login Page - Premium dark SaaS design
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Sparkles, TrendingUp, Shield, Zap } from 'lucide-react';
import { authAPI } from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import { Button, Input } from '../../components/ui';
import toast from 'react-hot-toast';

const FEATURES = [
  { icon: TrendingUp, text: 'Real-time P&L tracking' },
  { icon: Shield, text: 'GST-ready invoicing' },
  { icon: Zap, text: 'AI-powered insights' },
];

export default function LoginPage() {
  const navigate = useNavigate();
  const setAuth = useAuthStore(s => s.setAuth);
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.email) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Invalid email';
    if (!form.password) e.password = 'Password is required';
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await authAPI.login(form);
      const { user, token } = res.data.data;
      setAuth(user, token);
      toast.success(`Welcome back, ${user.name}!`);
      navigate('/dashboard');
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed';
      setErrors({ general: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0d14] flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex flex-col justify-between w-[45%] bg-[#0f1420] border-r border-[#1e2d45] p-12 relative overflow-hidden">
        {/* Background grid */}
        <div className="absolute inset-0 opacity-5"
          style={{ backgroundImage: 'linear-gradient(#1e2d45 1px, transparent 1px), linear-gradient(90deg, #1e2d45 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        {/* Glow orbs */}
        <div className="absolute top-32 left-20 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-32 right-10 w-48 h-48 bg-purple-600/10 rounded-full blur-3xl" />

        <div className="relative">
          <div className="flex items-center gap-3 mb-16">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-lg shadow-blue-900/50">
              <Sparkles size={18} className="text-white" />
            </div>
            <span className="text-lg font-bold text-white">SmartAccounts</span>
          </div>

          <h1 className="text-4xl font-bold text-white mb-4 leading-tight">
            Modern accounting<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600">
              built for India
            </span>
          </h1>
          <p className="text-slate-400 text-base leading-relaxed mb-12">
            Manage your business finances with AI-powered insights, GST invoicing, and real-time analytics.
          </p>

          <div className="space-y-4">
            {FEATURES.map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center flex-shrink-0">
                  <Icon size={14} className="text-blue-400" />
                </div>
                <span className="text-sm text-slate-300">{text}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="relative text-xs text-slate-600">© 2024 SmartAccounts. All rights reserved.</p>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm animate-fade-in-up">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
              <Sparkles size={15} className="text-white" />
            </div>
            <span className="font-bold text-white">SmartAccounts</span>
          </div>

          <h2 className="text-2xl font-bold text-white mb-1">Welcome back</h2>
          <p className="text-sm text-slate-400 mb-8">Sign in to your account to continue</p>

          {errors.general && (
            <div className="mb-5 p-3.5 bg-red-500/10 border border-red-500/20 rounded-xl">
              <p className="text-sm text-red-400">{errors.general}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email Address"
              type="email"
              placeholder="you@company.com"
              icon={<Mail size={14} />}
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              error={errors.email}
              autoComplete="email"
            />

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Password</label>
              <div className="relative">
                <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type={showPass ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  autoComplete="current-password"
                  className="w-full bg-[#0f1420] border border-[#1e2d45] rounded-lg text-sm text-slate-200 placeholder-slate-600 pl-10 pr-10 py-2.5 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all"
                />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                  {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-400">{errors.password}</p>}
            </div>

            <Button type="submit" loading={loading} className="w-full" size="lg">
              Sign In
            </Button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
              Create one free
            </Link>
          </p>

          {/* Demo credentials */}
          <div className="mt-8 p-4 bg-[#131929] border border-[#1e2d45] rounded-xl">
            <p className="text-xs font-medium text-slate-400 mb-2">🧪 Demo Credentials</p>
            <p className="text-xs text-slate-500">Email: <span className="text-slate-300">demo@smartaccounts.in</span></p>
            <p className="text-xs text-slate-500">Password: <span className="text-slate-300">demo123</span></p>
          </div>
        </div>
      </div>
    </div>
  );
}
