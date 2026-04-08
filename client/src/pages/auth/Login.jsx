import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Sparkles, Mail, Lock, ArrowRight } from 'lucide-react';
import { authAPI } from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import { Button, Input } from '../../components/ui/index.jsx';
import toast from 'react-hot-toast';

export default function Login() {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    setLoading(true);
    try {
      const res = await authAPI.login(form);
      const { user, token } = res.data.data;
      setAuth(user, token);
      toast.success('Welcome back, ' + user.name.split(' ')[0] + '!');
      navigate('/dashboard');
    } catch (err) {
      setErrors({ general: err.response?.data?.message || 'Login failed' });
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-[#0a0d14] flex">
      <div className="hidden lg:flex w-[45%] relative flex-col justify-between p-12 overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(#3b82f6 1px, transparent 1px), linear-gradient(90deg, #3b82f6 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        <div className="absolute top-1/4 -left-20 w-72 h-72 bg-blue-600/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-0 w-56 h-56 bg-indigo-600/15 rounded-full blur-3xl" />
        <div className="relative">
          <div className="flex items-center gap-3 mb-16">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-xl shadow-blue-900/50">
              <Sparkles size={18} className="text-white" />
            </div>
            <div>
              <p className="text-base font-bold text-white">SmartAccounts</p>
              <p className="text-xs text-blue-400">AI-Powered Accounting</p>
            </div>
          </div>
          <h1 className="text-4xl font-bold text-white leading-tight mb-4">The smarter way<br />to run your books.</h1>
          <p className="text-slate-400 text-base leading-relaxed">Full-stack accounting for modern businesses. Invoices, inventory, reports — powered by AI insights.</p>
        </div>
        <div className="relative space-y-3">
          {[
            { icon: '📊', title: 'Real-time Dashboard', desc: 'Live P&L, cash flow, and business health at a glance.' },
            { icon: '🧾', title: 'GST-ready Invoicing', desc: 'Professional invoices with automatic tax calculation.' },
            { icon: '🤖', title: 'AI Insights', desc: 'Instant analysis of spending patterns and trends.' },
          ].map(({ icon, title, desc }) => (
            <div key={title} className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
              <span className="text-lg flex-shrink-0 mt-0.5">{icon}</span>
              <div><p className="text-sm font-semibold text-slate-200">{title}</p><p className="text-xs text-slate-500 mt-0.5">{desc}</p></div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-2.5 mb-8">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center"><Sparkles size={14} className="text-white" /></div>
            <p className="text-base font-bold text-white">SmartAccounts</p>
          </div>
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-1.5">Welcome back</h2>
            <p className="text-slate-500 text-sm">Sign in to your account to continue</p>
          </div>
          {errors.general && <div className="mb-5 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-400">{errors.general}</div>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input label="Email Address" type="email" placeholder="you@company.com" icon={<Mail size={14} />}
              value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} error={errors.email} autoComplete="email" />
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Password</label>
              <div className="relative">
                <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input type={showPw ? 'text' : 'password'} placeholder="••••••••" value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })} autoComplete="current-password"
                  className={`w-full bg-[#0f1420] border rounded-lg text-sm text-slate-200 placeholder-slate-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all pl-10 pr-10 py-2.5 ${errors.password ? 'border-red-500/50' : 'border-[#1e2d45]'}`} />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
                  {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-400">{errors.password}</p>}
            </div>
            <Button type="submit" loading={loading} className="w-full" size="lg" icon={!loading && <ArrowRight size={16} />}>
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>
          <div className="mt-6 text-center">
            <p className="text-sm text-slate-500">Don&apos;t have an account?{' '}<Link to="/register" className="text-blue-400 hover:text-blue-300 font-medium">Create one free</Link></p>
          </div>
          <div className="mt-6 p-3.5 rounded-xl bg-[#131929] border border-[#1e2d45]">
            <p className="text-xs text-slate-500 text-center"><span className="text-slate-400 font-medium">Demo:</span> demo@smartaccounts.io / demo123</p>
          </div>
        </div>
      </div>
    </div>
  );
}
