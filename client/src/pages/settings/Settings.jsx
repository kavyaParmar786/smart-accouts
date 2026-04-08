import { useState, useEffect } from 'react';
import { User, Building2, Bell, Shield, Plus } from 'lucide-react';
import { authAPI, businessAPI } from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import { Button, Card, Input, Select, Textarea } from '../../components/ui/index.jsx';
import toast from 'react-hot-toast';

const TABS = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'business', label: 'Business', icon: Building2 },
  { id: 'password', label: 'Security', icon: Shield },
];

const BIZ_TYPES = ['retail','wholesale','manufacturing','service','ecommerce','restaurant','other'];

function ProfileTab({ user }) {
  const { setAuth } = useAuthStore();
  const [form, setForm] = useState({ name: user?.name || '' });
  const [loading, setLoading] = useState(false);
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authAPI.updateProfile(form);
      toast.success('Profile updated!');
    } catch {} finally { setLoading(false); }
  };

  return (
    <Card>
      <h3 className="text-sm font-semibold text-white mb-5">Personal Information</h3>
      <form onSubmit={handleSave} className="space-y-4 max-w-sm">
        <div className="flex items-center gap-4 mb-5">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-xl font-bold text-white">
            {(user?.name || 'U').charAt(0).toUpperCase()}
          </div>
          <div><p className="text-sm font-semibold text-white">{user?.name}</p><p className="text-xs text-slate-500">{user?.email}</p><p className="text-xs text-blue-400 capitalize mt-0.5">{user?.role}</p></div>
        </div>
        <Input label="Full Name" value={form.name} onChange={set('name')} />
        <Input label="Email Address" value={user?.email} disabled className="opacity-50 cursor-not-allowed" />
        <Button type="submit" loading={loading}>Save Changes</Button>
      </form>
    </Card>
  );
}

function BusinessTab({ user }) {
  const { activeBusiness, setActiveBusiness } = useAuthStore();
  const [showNewBiz, setShowNewBiz] = useState(false);
  const [businesses, setBusinesses] = useState([]);
  const [bizForm, setBizForm] = useState({
    name: activeBusiness?.name || '', type: activeBusiness?.type || 'service',
    gstin: activeBusiness?.gstin || '', currency: activeBusiness?.currency || 'INR',
    address: { city: '', state: '' },
  });
  const [newBizForm, setNewBizForm] = useState({ name: '', type: 'service', gstin: '' });
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const set = k => e => setBizForm(f => ({ ...f, [k]: e.target.value }));

  useEffect(() => {
    businessAPI.getAll().then(r => setBusinesses(r.data.data.businesses)).catch(() => {});
  }, []);

  const handleSaveBiz = async (e) => {
    e.preventDefault();
    const id = activeBusiness?._id || activeBusiness;
    if (!id) return;
    setLoading(true);
    try {
      await businessAPI.update(id, bizForm);
      toast.success('Business updated!');
    } catch {} finally { setLoading(false); }
  };

  const handleCreateBiz = async (e) => {
    e.preventDefault();
    if (!newBizForm.name) return toast.error('Business name required');
    setCreating(true);
    try {
      await businessAPI.create(newBizForm);
      toast.success('Business created!');
      setShowNewBiz(false);
      businessAPI.getAll().then(r => setBusinesses(r.data.data.businesses));
    } catch {} finally { setCreating(false); }
  };

  return (
    <div className="space-y-5">
      <Card>
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-sm font-semibold text-white">Business Settings</h3>
          <Button size="sm" variant="secondary" icon={<Plus size={13} />} onClick={() => setShowNewBiz(!showNewBiz)}>Add Business</Button>
        </div>
        {showNewBiz && (
          <div className="mb-5 p-4 bg-[#0f1420] border border-[#1e2d45] rounded-xl">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Create New Business</p>
            <form onSubmit={handleCreateBiz} className="flex items-end gap-3">
              <Input label="Business Name" placeholder="My New Business" value={newBizForm.name} onChange={e => setNewBizForm(f => ({ ...f, name: e.target.value }))} wrapperClass="flex-1" />
              <Select label="Type" value={newBizForm.type} onChange={e => setNewBizForm(f => ({ ...f, type: e.target.value }))} wrapperClass="w-36">
                {BIZ_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </Select>
              <Button type="submit" loading={creating}>Create</Button>
            </form>
          </div>
        )}
        <form onSubmit={handleSaveBiz} className="grid grid-cols-2 gap-4 max-w-lg">
          <Input label="Business Name" value={bizForm.name} onChange={set('name')} wrapperClass="col-span-2" />
          <Select label="Business Type" value={bizForm.type} onChange={set('type')}>
            {BIZ_TYPES.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase()+t.slice(1)}</option>)}
          </Select>
          <Input label="GSTIN" placeholder="22AAAAA0000A1Z5" value={bizForm.gstin} onChange={set('gstin')} />
          <Select label="Currency" value={bizForm.currency} onChange={set('currency')}>
            <option value="INR">INR — ₹</option>
            <option value="USD">USD — $</option>
            <option value="EUR">EUR — €</option>
          </Select>
          <div className="col-span-2"><Button type="submit" loading={loading}>Save Business Settings</Button></div>
        </form>
      </Card>
    </div>
  );
}

function SecurityTab() {
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.newPassword !== form.confirmPassword) return toast.error('Passwords do not match');
    if (form.newPassword.length < 6) return toast.error('Password must be at least 6 characters');
    setLoading(true);
    try {
      await authAPI.changePassword({ currentPassword: form.currentPassword, newPassword: form.newPassword });
      toast.success('Password changed successfully!');
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch {} finally { setLoading(false); }
  };

  return (
    <Card>
      <h3 className="text-sm font-semibold text-white mb-5">Change Password</h3>
      <form onSubmit={handleSubmit} className="space-y-4 max-w-sm">
        <Input label="Current Password" type="password" placeholder="••••••••" value={form.currentPassword} onChange={set('currentPassword')} />
        <Input label="New Password" type="password" placeholder="Min. 6 characters" value={form.newPassword} onChange={set('newPassword')} />
        <Input label="Confirm New Password" type="password" placeholder="Repeat new password" value={form.confirmPassword} onChange={set('confirmPassword')} />
        <Button type="submit" loading={loading}>Update Password</Button>
      </form>
    </Card>
  );
}

export default function Settings() {
  const [tab, setTab] = useState('profile');
  const { user } = useAuthStore();

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-5">
      <div><h1 className="text-xl font-bold text-white">Settings</h1><p className="text-sm text-slate-500 mt-0.5">Manage your account and business preferences</p></div>
      <div className="flex gap-1 bg-[#0f1420] border border-[#1e2d45] rounded-xl p-1 w-fit">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setTab(id)}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${tab === id ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}>
            <Icon size={13} />{label}
          </button>
        ))}
      </div>
      {tab === 'profile' && <ProfileTab user={user} />}
      {tab === 'business' && <BusinessTab user={user} />}
      {tab === 'password' && <SecurityTab />}
    </div>
  );
}
