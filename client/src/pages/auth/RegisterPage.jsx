// Register Page
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Eye, EyeOff, Sparkles } from 'lucide-react';
import { authAPI } from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import { Button, Input } from '../../components/ui';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const navigate = useNavigate();
  const setAuth = useAuthStore(s => s.setAuth);
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }));

  const validate = () => {
    const e = {};
    if (!form.name || form.name.length < 2) e.name = 'Name must be at least 2 characters';
    if (!form.email || !/\S+@\S+\.\S+/.test(form.email)) e.email = 'Valid email required';
    if (!form.password || form.password.length < 6) e.password = 'Password must be at least 6 characters';
    if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match';
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const { name, email, password } = form;
      const res = await authAPI.register({ name, email, password });
      const { user, token } = res.data.data;
      setAuth(user, token);
      toast.success(`Welcome to SmartAccounts, ${user.name}!`);
      navigate('/dashboard');
    } catch (err) {
      setErrors({ general: err.response?.data?.message || 'Registration failed' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0d14] flex items-center justify-center p-6">
      {/* Background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-blue-600/5 rounded-full blur-3xl" />

      <div className="w-full max-w-sm relative animate-fade-in-up">
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-lg shadow-blue-900/50">
            <Sparkles size={16} className="text-white" />
          </div>
          <span className="text-lg font-bold text-white">SmartAccounts</span>
        </div>

        <div className="bg-[#131929] border border-[#1e2d45] rounded-2xl p-7 shadow-2xl">
          <h2 className="text-xl font-bold text-white mb-1">Create your account</h2>
          <p className="text-sm text-slate-500 mb-6">Free forever. No credit card required.</p>

          {errors.general && (
            <div className="mb-5 p-3.5 bg-red-500/10 border border-red-500/20 rounded-xl">
              <p className="text-sm text-red-400">{errors.general}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input label="Full Name" type="text" placeholder="Kavya Shah" icon={<User size={14} />}
              value={form.name} onChange={set('name')} error={errors.name} autoComplete="name" />

            <Input label="Email Address" type="email" placeholder="you@company.com" icon={<Mail size={14} />}
              value={form.email} onChange={set('email')} error={errors.email} autoComplete="email" />

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Password</label>
              <div className="relative">
                <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type={showPass ? 'text' : 'password'}
                  placeholder="Min 6 characters"
                  value={form.password}
                  onChange={set('password')}
                  className="w-full bg-[#0f1420] border border-[#1e2d45] rounded-lg text-sm text-slate-200 placeholder-slate-600 pl-10 pr-10 py-2.5 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all"
                />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                  {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-400">{errors.password}</p>}
            </div>

            <Input label="Confirm Password" type="password" placeholder="Repeat password" icon={<Lock size={14} />}
              value={form.confirmPassword} onChange={set('confirmPassword')} error={errors.confirmPassword} />

            <Button type="submit" loading={loading} className="w-full mt-2" size="lg">
              Create Account
            </Button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-5">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-400 hover:text-blue-300 font-medium">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
