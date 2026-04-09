import { useState, useEffect } from 'react';
import { User, Building2, Shield, Users, Plus, Trash2, Crown, UserCheck } from 'lucide-react';
import { authAPI, businessAPI } from '../../services/api';
import api from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import { Button, Card, Input, Select, Badge } from '../../components/ui/index.jsx';
import { formatDate, getInitials } from '../../utils/helpers';
import toast from 'react-hot-toast';

const TABS = [
  { id:'profile',  label:'Profile',  icon:User    },
  { id:'business', label:'Business', icon:Building2},
  { id:'team',     label:'Team',     icon:Users   },
  { id:'password', label:'Security', icon:Shield  },
];

/* ── Profile Tab ──────────────────────────────────────────── */
function ProfileTab({ user }) {
  const [form, setForm] = useState({ name: user?.name||'' });
  const [loading, setLoading] = useState(false);
  const handleSave = async e => {
    e.preventDefault(); setLoading(true);
    try { await authAPI.updateProfile(form); toast.success('Profile updated!'); } catch {}
    setLoading(false);
  };
  return (
    <Card>
      <p style={{fontSize:14,fontWeight:600,color:'#e2e8f0',marginBottom:20}}>Personal Information</p>
      <div style={{display:'flex',alignItems:'center',gap:16,marginBottom:24}}>
        <div style={{width:52,height:52,borderRadius:'50%',background:'linear-gradient(135deg,#3b82f6,#6366f1)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,fontWeight:700,color:'#fff',flexShrink:0}}>
          {getInitials(user?.name||'U')}
        </div>
        <div>
          <p style={{fontSize:14,fontWeight:600,color:'#e2e8f0'}}>{user?.name}</p>
          <p style={{fontSize:12,color:'#475569'}}>{user?.email}</p>
          <Badge variant="info" style={{marginTop:4}}>{user?.role}</Badge>
        </div>
      </div>
      <form onSubmit={handleSave} style={{display:'flex',flexDirection:'column',gap:14,maxWidth:400}}>
        <Input label="Full Name" value={form.name} onChange={e=>setForm({name:e.target.value})}/>
        <Input label="Email Address" value={user?.email||''} disabled style={{opacity:0.5}}/>
        <Button type="submit" loading={loading} style={{width:'fit-content'}}>Save Changes</Button>
      </form>
    </Card>
  );
}

/* ── Business Tab ─────────────────────────────────────────── */
function BusinessTab() {
  const { activeBusiness } = useAuthStore();
  const [form, setForm] = useState({ name:'', type:'service', gstin:'', currency:'INR' });
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newBiz, setNewBiz] = useState({ name:'', type:'service' });
  const [showNew, setShowNew] = useState(false);

  useEffect(() => {
    if (activeBusiness) setForm({ name:activeBusiness.name||'', type:activeBusiness.type||'service', gstin:activeBusiness.gstin||'', currency:activeBusiness.currency||'INR' });
  }, [activeBusiness]);

  const handleSave = async e => {
    e.preventDefault();
    const id = activeBusiness?._id || activeBusiness;
    if (!id) return;
    setLoading(true);
    try { await businessAPI.update(id, form); toast.success('Business updated!'); } catch {}
    setLoading(false);
  };

  const handleCreate = async e => {
    e.preventDefault();
    if (!newBiz.name) return toast.error('Name required');
    setCreating(true);
    try { await businessAPI.create(newBiz); toast.success('Business created! Switch to it via the sidebar.'); setShowNew(false); setNewBiz({name:'',type:'service'}); } catch {}
    setCreating(false);
  };

  const BIZ_TYPES = ['retail','wholesale','manufacturing','service','ecommerce','restaurant','other'];

  return (
    <div style={{display:'flex',flexDirection:'column',gap:16}}>
      <Card>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:20}}>
          <p style={{fontSize:14,fontWeight:600,color:'#e2e8f0'}}>Business Settings</p>
          <Button size="sm" variant="secondary" icon={<Plus size={13}/>} onClick={()=>setShowNew(s=>!s)}>New Business</Button>
        </div>
        {showNew && (
          <form onSubmit={handleCreate} style={{display:'flex',gap:10,alignItems:'flex-end',marginBottom:20,padding:16,background:'#0a0f1a',borderRadius:12,border:'1px solid #1a2540'}}>
            <Input label="Business Name" placeholder="Acme Pvt Ltd" value={newBiz.name} onChange={e=>setNewBiz(b=>({...b,name:e.target.value}))} wrapperClass="flex-1"/>
            <Select label="Type" value={newBiz.type} onChange={e=>setNewBiz(b=>({...b,type:e.target.value}))} wrapperClass="w-36">
              {BIZ_TYPES.map(t=><option key={t} value={t}>{t}</option>)}
            </Select>
            <Button type="submit" loading={creating}>Create</Button>
          </form>
        )}
        <form onSubmit={handleSave} style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14,maxWidth:520}}>
          <Input label="Business Name" value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} wrapperClass="col-span-2"/>
          <Select label="Business Type" value={form.type} onChange={e=>setForm(f=>({...f,type:e.target.value}))}>
            {BIZ_TYPES.map(t=><option key={t} value={t}>{t.charAt(0).toUpperCase()+t.slice(1)}</option>)}
          </Select>
          <Input label="GSTIN" placeholder="22AAAAA0000A1Z5" value={form.gstin} onChange={e=>setForm(f=>({...f,gstin:e.target.value}))}/>
          <Select label="Currency" value={form.currency} onChange={e=>setForm(f=>({...f,currency:e.target.value}))}>
            <option value="INR">INR — ₹</option><option value="USD">USD — $</option><option value="EUR">EUR — €</option>
          </Select>
          <div style={{gridColumn:'span 2'}}><Button type="submit" loading={loading}>Save Settings</Button></div>
        </form>
      </Card>
    </div>
  );
}

/* ── Team Tab ─────────────────────────────────────────────── */
function TeamTab() {
  const { getBusinessId, user: me } = useAuthStore();
  const businessId = getBusinessId();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [invite, setInvite] = useState({ email:'', name:'', role:'staff' });
  const [inviting, setInviting] = useState(false);
  const [showInvite, setShowInvite] = useState(false);

  const fetchMembers = async () => {
    if (!businessId) return;
    try {
      const res = await api.get('/team', { params:{ businessId } });
      setMembers(res.data.data.members);
    } catch {}
    setLoading(false);
  };

  useEffect(()=>{ fetchMembers(); },[businessId]);

  const handleInvite = async e => {
    e.preventDefault();
    if (!invite.email) return toast.error('Email required');
    setInviting(true);
    try {
      const res = await api.post('/team/invite', { ...invite, businessId });
      const d = res.data.data;
      toast.success(d.message);
      if (d.isNewUser && d.tempPassword) {
        toast(`Temp password: ${d.tempPassword}`, { duration:8000, icon:'🔑' });
      }
      setShowInvite(false);
      setInvite({ email:'', name:'', role:'staff' });
      fetchMembers();
    } catch {}
    setInviting(false);
  };

  const handleRemove = async (userId) => {
    if (!confirm('Remove this member from the business?')) return;
    try {
      await api.delete(`/team/${userId}`, { params:{ businessId } });
      toast.success('Member removed');
      fetchMembers();
    } catch {}
  };

  const handleRoleChange = async (userId, role) => {
    try {
      await api.put(`/team/${userId}/role`, { businessId, role });
      toast.success('Role updated');
      fetchMembers();
    } catch {}
  };

  const ROLE_BADGE = { owner:'purple', admin:'info', staff:'default' };
  const ROLE_ICON  = { owner:<Crown size={12}/>, admin:<UserCheck size={12}/>, staff:<User size={12}/> };

  return (
    <div style={{display:'flex',flexDirection:'column',gap:16}}>
      {/* Explainer */}
      <div style={{padding:16,borderRadius:12,background:'rgba(59,130,246,0.07)',border:'1px solid rgba(59,130,246,0.2)'}}>
        <p style={{fontSize:13,fontWeight:600,color:'#60a5fa',marginBottom:4}}>How Multi-User Works</p>
        <p style={{fontSize:12,color:'#94a3b8',lineHeight:1.6}}>
          Invite team members by email. If they already have a SmartAccounts account, they'll be added instantly. If not, a staff account is created with a temporary password you can share with them.
          All members see the same business data. <strong style={{color:'#e2e8f0'}}>Owners</strong> have full control.
          <strong style={{color:'#e2e8f0'}}> Admins</strong> can manage transactions and invoices.
          <strong style={{color:'#e2e8f0'}}> Staff</strong> have read + limited write access.
        </p>
      </div>

      <Card style={{padding:0,overflow:'hidden'}}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'16px 20px',borderBottom:'1px solid #1a2540'}}>
          <p style={{fontSize:14,fontWeight:600,color:'#e2e8f0'}}>Team Members <span style={{fontSize:12,color:'#475569',fontWeight:400}}>({members.length})</span></p>
          <Button size="sm" icon={<Plus size={13}/>} onClick={()=>setShowInvite(s=>!s)}>Invite Member</Button>
        </div>

        {showInvite && (
          <form onSubmit={handleInvite} style={{padding:16,background:'#0a0f1a',borderBottom:'1px solid #1a2540'}}>
            <p style={{fontSize:12,fontWeight:600,color:'#94a3b8',marginBottom:12,textTransform:'uppercase',letterSpacing:'0.06em'}}>Invite New Member</p>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr auto auto',gap:10,alignItems:'flex-end'}}>
              <Input label="Email *" type="email" placeholder="colleague@company.com" value={invite.email} onChange={e=>setInvite(i=>({...i,email:e.target.value}))}/>
              <Input label="Name (if new user)" placeholder="Jane Doe" value={invite.name} onChange={e=>setInvite(i=>({...i,name:e.target.value}))}/>
              <Select label="Role" value={invite.role} onChange={e=>setInvite(i=>({...i,role:e.target.value}))}>
                <option value="admin">Admin</option>
                <option value="staff">Staff</option>
              </Select>
              <Button type="submit" loading={inviting} style={{marginBottom:0}}>Invite</Button>
            </div>
          </form>
        )}

        {/* Members list */}
        {loading ? (
          <div style={{padding:20,display:'flex',flexDirection:'column',gap:10}}>
            {[1,2,3].map(i=><div key={i} style={{height:56}} className="skeleton"/>)}
          </div>
        ) : members.length === 0 ? (
          <div style={{padding:40,textAlign:'center'}}>
            <p style={{fontSize:32,marginBottom:8,opacity:0.3}}>👥</p>
            <p style={{fontSize:13,color:'#475569'}}>No team members yet. Invite someone to collaborate.</p>
          </div>
        ) : (
          <div>
            {members.map((m, i) => (
              <div key={m._id} style={{display:'flex',alignItems:'center',gap:12,padding:'12px 20px',borderBottom:i<members.length-1?'1px solid rgba(26,37,64,0.5)':undefined}}>
                {/* Avatar */}
                <div style={{width:36,height:36,borderRadius:'50%',background:'linear-gradient(135deg,#3b82f6,#6366f1)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,fontWeight:700,color:'#fff',flexShrink:0}}>
                  {getInitials(m.name)}
                </div>
                {/* Info */}
                <div style={{flex:1,minWidth:0}}>
                  <div style={{display:'flex',alignItems:'center',gap:8}}>
                    <p style={{fontSize:13,fontWeight:600,color:'#e2e8f0',truncate:true}}>{m.name}</p>
                    {m._id===me?._id&&<span style={{fontSize:10,color:'#475569'}}>(you)</span>}
                  </div>
                  <p style={{fontSize:11,color:'#475569'}}>{m.email} · Last login: {m.lastLogin?formatDate(m.lastLogin):'Never'}</p>
                </div>
                {/* Role badge + changer */}
                <div style={{display:'flex',alignItems:'center',gap:8,flexShrink:0}}>
                  <Badge variant={ROLE_BADGE[m.bizRole]}>
                    <span style={{display:'flex',alignItems:'center',gap:4}}>{ROLE_ICON[m.bizRole]}{m.bizRole}</span>
                  </Badge>
                  {!m.isOwner && m._id !== me?._id && (
                    <>
                      <select
                        value={m.bizRole}
                        onChange={e=>handleRoleChange(m._id, e.target.value)}
                        style={{fontSize:11,background:'#0a0f1a',border:'1px solid #1a2540',borderRadius:8,color:'#94a3b8',padding:'4px 8px',cursor:'pointer'}}
                      >
                        <option value="admin">Admin</option>
                        <option value="staff">Staff</option>
                      </select>
                      <button onClick={()=>handleRemove(m._id)}
                        style={{padding:6,borderRadius:8,background:'transparent',border:'none',color:'#475569',cursor:'pointer',display:'flex'}}
                        onMouseEnter={e=>e.currentTarget.style.color='#f87171'}
                        onMouseLeave={e=>e.currentTarget.style.color='#475569'}>
                        <Trash2 size={13}/>
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

/* ── Security Tab ─────────────────────────────────────────── */
function SecurityTab() {
  const [form, setForm] = useState({ currentPassword:'', newPassword:'', confirmPassword:'' });
  const [loading, setLoading] = useState(false);
  const handleSubmit = async e => {
    e.preventDefault();
    if (form.newPassword !== form.confirmPassword) return toast.error('Passwords do not match');
    if (form.newPassword.length < 6) return toast.error('Password must be at least 6 characters');
    setLoading(true);
    try { await authAPI.changePassword({ currentPassword:form.currentPassword, newPassword:form.newPassword }); toast.success('Password changed!'); setForm({currentPassword:'',newPassword:'',confirmPassword:''}); } catch {}
    setLoading(false);
  };
  return (
    <Card>
      <p style={{fontSize:14,fontWeight:600,color:'#e2e8f0',marginBottom:20}}>Change Password</p>
      <form onSubmit={handleSubmit} style={{display:'flex',flexDirection:'column',gap:14,maxWidth:380}}>
        <Input label="Current Password" type="password" placeholder="••••••••" value={form.currentPassword} onChange={e=>setForm(f=>({...f,currentPassword:e.target.value}))}/>
        <Input label="New Password" type="password" placeholder="Min. 6 characters" value={form.newPassword} onChange={e=>setForm(f=>({...f,newPassword:e.target.value}))}/>
        <Input label="Confirm New Password" type="password" placeholder="Repeat new password" value={form.confirmPassword} onChange={e=>setForm(f=>({...f,confirmPassword:e.target.value}))}/>
        <Button type="submit" loading={loading} style={{width:'fit-content'}}>Update Password</Button>
      </form>
    </Card>
  );
}

/* ── Main Settings Page ───────────────────────────────────── */
export default function Settings() {
  const [tab, setTab] = useState('profile');
  const { user } = useAuthStore();

  return (
    <div style={{padding:24,maxWidth:860,margin:'0 auto'}}>
      <div style={{marginBottom:20}}>
        <h1 style={{fontSize:20,fontWeight:700,color:'#e2e8f0'}}>Settings</h1>
        <p style={{fontSize:13,color:'#475569',marginTop:4}}>Manage your account, business, and team</p>
      </div>

      {/* Tabs */}
      <div style={{display:'flex',gap:4,background:'#111827',border:'1px solid #1a2540',borderRadius:12,padding:4,width:'fit-content',marginBottom:20}}>
        {TABS.map(({ id, label, icon:Icon }) => (
          <button key={id} onClick={() => setTab(id)}
            style={{display:'flex',alignItems:'center',gap:6,padding:'7px 14px',borderRadius:9,fontSize:12,fontWeight:500,border:'none',cursor:'pointer',transition:'all 0.15s',background:tab===id?'#2563eb':'transparent',color:tab===id?'#fff':'#94a3b8'}}>
            <Icon size={13}/>{label}
          </button>
        ))}
      </div>

      {tab==='profile'  && <ProfileTab  user={user}/>}
      {tab==='business' && <BusinessTab/>}
      {tab==='team'     && <TeamTab/>}
      {tab==='password' && <SecurityTab/>}
    </div>
  );
}
