// Settings Page - Profile, Business, Categories management
import { useState, useEffect } from 'react';
import { User, Building2, Tag, Lock, Plus, Trash2, Edit2 } from 'lucide-react';
import { authAPI, businessAPI, categoryAPI } from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import { Button, Input, Select, Textarea, Card, Modal, Badge } from '../../components/ui';
import { getInitials } from '../../utils/helpers';
import toast from 'react-hot-toast';

const TABS = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'business', label: 'Business', icon: Building2 },
  { id: 'categories', label: 'Categories', icon: Tag },
  { id: 'security', label: 'Security', icon: Lock },
];

const BIZ_TYPES = ['retail', 'wholesale', 'manufacturing', 'service', 'ecommerce', 'restaurant', 'other'];
const CAT_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#84cc16', '#f97316'];
const CAT_ICONS = ['💰', '🔧', '📈', '🏢', '👥', '💡', '📢', '✈️', '🍽️', '💻', '📋', '🛒', '📦', '🎯', '🔑'];

export default function SettingsPage() {
  const { user, activeBusiness, setActiveBusiness } = useAuthStore();
  const getBusinessId = useAuthStore(s => s.getBusinessId);
  const businessId = getBusinessId();

  const [tab, setTab] = useState('profile');

  // Profile state
  const [profile, setProfile] = useState({ name: user?.name || '', email: user?.email || '' });
  const [savingProfile, setSavingProfile] = useState(false);

  // Business state
  const [biz, setBiz] = useState(null);
  const [savingBiz, setSavingBiz] = useState(false);

  // Category state
  const [categories, setCategories] = useState([]);
  const [catModal, setCatModal] = useState(false);
  const [editCat, setEditCat] = useState(null);
  const [catForm, setCatForm] = useState({ name: '', type: 'expense', color: '#3b82f6', icon: '📦' });

  // Password state
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [savingPw, setSavingPw] = useState(false);

  // New business state
  const [bizModal, setBizModal] = useState(false);
  const [newBiz, setNewBiz] = useState({ name: '', type: 'service', gstin: '', currency: 'INR' });

  useEffect(() => {
    if (businessId) {
      businessAPI.getAll().then(r => {
        const businesses = r.data.data?.businesses || [];
        const current = businesses.find(b => (b._id === businessId || b._id === businessId));
        if (current) setBiz(current);
      });
      loadCategories();
    }
  }, [businessId]);

  const loadCategories = async () => {
    const res = await categoryAPI.getAll({ businessId });
    setCategories(res.data.data?.categories || []);
  };

  const handleSaveProfile = async () => {
    setSavingProfile(true);
    try {
      await authAPI.updateProfile({ name: profile.name });
      toast.success('Profile updated');
    } catch {}
    setSavingProfile(false);
  };

  const handleSaveBusiness = async () => {
    if (!biz) return;
    setSavingBiz(true);
    try {
      await businessAPI.update(businessId, biz);
      toast.success('Business settings saved');
    } catch {}
    setSavingBiz(false);
  };

  const handleCreateBusiness = async () => {
    try {
      await businessAPI.create(newBiz);
      toast.success('Business created! Switch to it from the sidebar.');
      setBizModal(false);
      setNewBiz({ name: '', type: 'service', gstin: '', currency: 'INR' });
    } catch {}
  };

  const handleSaveCat = async () => {
    if (!catForm.name) return toast.error('Name required');
    try {
      if (editCat) {
        await categoryAPI.update(editCat._id, catForm);
        toast.success('Category updated');
      } else {
        await categoryAPI.create({ ...catForm, businessId });
        toast.success('Category added');
      }
      setCatModal(false);
      setEditCat(null);
      setCatForm({ name: '', type: 'expense', color: '#3b82f6', icon: '📦' });
      loadCategories();
    } catch {}
  };

  const handleDeleteCat = async (cat) => {
    if (cat.isDefault) return toast.error("Can't delete default categories");
    if (!confirm(`Delete "${cat.name}"?`)) return;
    try {
      await categoryAPI.delete(cat._id);
      toast.success('Category deleted');
      loadCategories();
    } catch {}
  };

  const handleChangePassword = async () => {
    if (pwForm.newPassword !== pwForm.confirmPassword) return toast.error('Passwords do not match');
    if (pwForm.newPassword.length < 6) return toast.error('Min 6 characters');
    setSavingPw(true);
    try {
      await authAPI.changePassword({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword });
      toast.success('Password changed successfully');
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch {}
    setSavingPw(false);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-5">
      <h1 className="text-xl font-bold text-white">Settings</h1>

      <div className="flex gap-5">
        {/* Sidebar tabs */}
        <div className="w-44 flex-shrink-0">
          <div className="space-y-0.5">
            {TABS.map(({ id, label, icon: Icon }) => (
              <button key={id} onClick={() => setTab(id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all
                  ${tab === id ? 'bg-blue-600/15 text-blue-400 border border-blue-500/20' : 'text-slate-400 hover:text-slate-200 hover:bg-[#1a2235]'}`}>
                <Icon size={14} />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 space-y-4">
          {/* ── PROFILE ── */}
          {tab === 'profile' && (
            <Card className="space-y-5">
              <h2 className="text-base font-semibold text-white">Profile Settings</h2>
              <div className="flex items-center gap-4 pb-4 border-b border-[#1e2d45]">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-xl font-bold text-white">
                  {getInitials(user?.name)}
                </div>
                <div>
                  <p className="font-semibold text-white">{user?.name}</p>
                  <p className="text-sm text-slate-400">{user?.email}</p>
                  <Badge variant="info" className="mt-1">{user?.role}</Badge>
                </div>
              </div>
              <div className="space-y-4">
                <Input label="Full Name" value={profile.name} onChange={e => setProfile(p => ({ ...p, name: e.target.value }))} />
                <Input label="Email" value={profile.email} disabled className="opacity-50 cursor-not-allowed" />
                <Button onClick={handleSaveProfile} loading={savingProfile}>Save Profile</Button>
              </div>
            </Card>
          )}

          {/* ── BUSINESS ── */}
          {tab === 'business' && (
            <div className="space-y-4">
              <Card className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-semibold text-white">Business Settings</h2>
                  <Button variant="secondary" size="sm" icon={<Plus size={12} />} onClick={() => setBizModal(true)}>New Business</Button>
                </div>
                {biz && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <Input label="Business Name" value={biz.name || ''} onChange={e => setBiz(b => ({ ...b, name: e.target.value }))} wrapperClass="col-span-2" />
                      <Select label="Business Type" value={biz.type || 'service'} onChange={e => setBiz(b => ({ ...b, type: e.target.value }))}>
                        {BIZ_TYPES.map(t => <option key={t} value={t} className="capitalize">{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                      </Select>
                      <Input label="GSTIN" placeholder="29AABCT1332L1ZG" value={biz.gstin || ''} onChange={e => setBiz(b => ({ ...b, gstin: e.target.value }))} />
                      <Input label="Phone" value={biz.contact?.phone || ''} onChange={e => setBiz(b => ({ ...b, contact: { ...b.contact, phone: e.target.value } }))} />
                      <Input label="Email" value={biz.contact?.email || ''} onChange={e => setBiz(b => ({ ...b, contact: { ...b.contact, email: e.target.value } }))} />
                      <Input label="City" value={biz.address?.city || ''} onChange={e => setBiz(b => ({ ...b, address: { ...b.address, city: e.target.value } }))} />
                      <Input label="State" value={biz.address?.state || ''} onChange={e => setBiz(b => ({ ...b, address: { ...b.address, state: e.target.value } }))} />
                      <Input label="Invoice Prefix" value={biz.invoicePrefix || 'INV'} onChange={e => setBiz(b => ({ ...b, invoicePrefix: e.target.value }))} placeholder="INV" />
                      <Select label="Currency" value={biz.currency || 'INR'} onChange={e => setBiz(b => ({ ...b, currency: e.target.value }))}>
                        {['INR', 'USD', 'EUR', 'GBP', 'AED'].map(c => <option key={c} value={c}>{c}</option>)}
                      </Select>
                    </div>
                    <Button onClick={handleSaveBusiness} loading={savingBiz}>Save Business Settings</Button>
                  </div>
                )}
              </Card>
            </div>
          )}

          {/* ── CATEGORIES ── */}
          {tab === 'categories' && (
            <Card className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-semibold text-white">Transaction Categories</h2>
                <Button size="sm" icon={<Plus size={12} />} onClick={() => { setEditCat(null); setCatForm({ name: '', type: 'expense', color: '#3b82f6', icon: '📦' }); setCatModal(true); }}>
                  Add Category
                </Button>
              </div>

              {['income', 'expense'].map(type => (
                <div key={type}>
                  <p className={`text-xs font-semibold uppercase tracking-wider mb-2 ${type === 'income' ? 'text-emerald-400' : 'text-red-400'}`}>
                    {type === 'income' ? '↑ Income' : '↓ Expense'} Categories
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {categories.filter(c => c.type === type || c.type === 'both').map(cat => (
                      <div key={cat._id} className="flex items-center justify-between px-3 py-2 bg-[#0f1420] border border-[#1e2d45] rounded-xl">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-lg flex items-center justify-center text-xs" style={{ backgroundColor: cat.color + '20' }}>
                            {cat.icon}
                          </div>
                          <span className="text-sm text-slate-200">{cat.name}</span>
                          {cat.isDefault && <span className="text-[10px] text-slate-500">default</span>}
                        </div>
                        {!cat.isDefault && (
                          <div className="flex gap-1">
                            <button onClick={() => { setEditCat(cat); setCatForm({ name: cat.name, type: cat.type, color: cat.color, icon: cat.icon }); setCatModal(true); }}
                              className="p-1 hover:bg-blue-500/10 rounded text-slate-500 hover:text-blue-400"><Edit2 size={11} /></button>
                            <button onClick={() => handleDeleteCat(cat)} className="p-1 hover:bg-red-500/10 rounded text-slate-500 hover:text-red-400"><Trash2 size={11} /></button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </Card>
          )}

          {/* ── SECURITY ── */}
          {tab === 'security' && (
            <Card className="space-y-4">
              <h2 className="text-base font-semibold text-white">Change Password</h2>
              <Input label="Current Password" type="password" value={pwForm.currentPassword} onChange={e => setPwForm(p => ({ ...p, currentPassword: e.target.value }))} />
              <Input label="New Password" type="password" value={pwForm.newPassword} onChange={e => setPwForm(p => ({ ...p, newPassword: e.target.value }))} />
              <Input label="Confirm New Password" type="password" value={pwForm.confirmPassword} onChange={e => setPwForm(p => ({ ...p, confirmPassword: e.target.value }))} />
              <Button onClick={handleChangePassword} loading={savingPw}>Update Password</Button>
            </Card>
          )}
        </div>
      </div>

      {/* Category Modal */}
      <Modal isOpen={catModal} onClose={() => setCatModal(false)} title={editCat ? 'Edit Category' : 'New Category'} size="sm">
        <div className="space-y-4">
          <Input label="Category Name" placeholder="e.g. Office Supplies" value={catForm.name} onChange={e => setCatForm(f => ({ ...f, name: e.target.value }))} />
          <Select label="Type" value={catForm.type} onChange={e => setCatForm(f => ({ ...f, type: e.target.value }))}>
            <option value="expense">Expense</option>
            <option value="income">Income</option>
            <option value="both">Both</option>
          </Select>
          <div>
            <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Icon</label>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {CAT_ICONS.map(icon => (
                <button key={icon} onClick={() => setCatForm(f => ({ ...f, icon }))}
                  className={`w-8 h-8 rounded-lg text-base flex items-center justify-center transition-colors
                    ${catForm.icon === icon ? 'bg-blue-600/20 border border-blue-500/30' : 'hover:bg-[#1a2235]'}`}>
                  {icon}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Color</label>
            <div className="flex flex-wrap gap-2 mt-2">
              {CAT_COLORS.map(color => (
                <button key={color} onClick={() => setCatForm(f => ({ ...f, color }))}
                  className={`w-7 h-7 rounded-full transition-all ${catForm.color === color ? 'ring-2 ring-white ring-offset-2 ring-offset-[#131929] scale-110' : ''}`}
                  style={{ backgroundColor: color }} />
              ))}
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <Button variant="secondary" className="flex-1" onClick={() => setCatModal(false)}>Cancel</Button>
            <Button className="flex-1" onClick={handleSaveCat}>{editCat ? 'Update' : 'Create'}</Button>
          </div>
        </div>
      </Modal>

      {/* New Business Modal */}
      <Modal isOpen={bizModal} onClose={() => setBizModal(false)} title="Create New Business" size="sm">
        <div className="space-y-4">
          <Input label="Business Name" placeholder="My New Company" value={newBiz.name} onChange={e => setNewBiz(b => ({ ...b, name: e.target.value }))} />
          <Select label="Business Type" value={newBiz.type} onChange={e => setNewBiz(b => ({ ...b, type: e.target.value }))}>
            {BIZ_TYPES.map(t => <option key={t} value={t} className="capitalize">{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
          </Select>
          <Input label="GSTIN (optional)" placeholder="29AABCT1332L1ZG" value={newBiz.gstin} onChange={e => setNewBiz(b => ({ ...b, gstin: e.target.value }))} />
          <div className="flex gap-3">
            <Button variant="secondary" className="flex-1" onClick={() => setBizModal(false)}>Cancel</Button>
            <Button className="flex-1" onClick={handleCreateBusiness}>Create Business</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
