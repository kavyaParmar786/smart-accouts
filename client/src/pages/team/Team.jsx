import { useState, useEffect } from 'react';
import { Users, UserPlus, Trash2, Crown, Shield, User, ChevronDown, Mail, Check } from 'lucide-react';
import api from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import { Button, Card, Input, Select, Badge, Modal, PageHeader, SectionTitle, T } from '../../components/ui/index.jsx';
import { formatDate, getInitials } from '../../utils/helpers';
import toast from 'react-hot-toast';

const FONT = "'Sora', ui-sans-serif, system-ui, sans-serif";

const ROLE_META = {
  owner: { label: 'Owner',  color: T.purple, bg: T.purpleG, icon: Crown,  desc: 'Full control. Cannot be removed.' },
  admin: { label: 'Admin',  color: T.blue,   bg: T.blueG,   icon: Shield, desc: 'Can manage all data & invite staff.' },
  staff: { label: 'Staff',  color: T.t2,     bg: 'rgba(74,85,120,0.2)', icon: User, desc: 'Can view and add transactions.' },
};

function RoleBadge({ role }) {
  const m = ROLE_META[role] || ROLE_META.staff;
  const Icon = m.icon;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 10, fontWeight: 700, padding: '4px 10px', borderRadius: 999, background: m.bg, color: m.color, fontFamily: FONT }}>
      <Icon size={10} />{m.label}
    </span>
  );
}

function MemberRow({ member, isMe, onRoleChange, onRemove }) {
  const [open, setOpen] = useState(false);
  const m = ROLE_META[member.bizRole] || ROLE_META.staff;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 20px', borderBottom: `1px solid rgba(28,37,64,0.5)`, transition: 'background 0.1s' }}
      onMouseEnter={e => e.currentTarget.style.background = T.hover}
      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
      {/* Avatar */}
      <div style={{ width: 38, height: 38, borderRadius: '50%', background: `linear-gradient(135deg, ${m.color}60, ${m.color}30)`, border: `1.5px solid ${m.color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, color: m.color, flexShrink: 0, fontFamily: FONT }}>
        {getInitials(member.name)}
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: T.t1, fontFamily: FONT }}>{member.name}</p>
          {isMe && <span style={{ fontSize: 10, color: T.t3, background: T.elev, padding: '2px 7px', borderRadius: 999, fontFamily: FONT }}>you</span>}
        </div>
        <p style={{ fontSize: 11, color: T.t3 }}>{member.email} · Last login: {member.lastLogin ? formatDate(member.lastLogin) : 'Never'}</p>
      </div>

      {/* Role badge + changer */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
        <RoleBadge role={member.bizRole} />

        {!member.isOwner && !isMe && (
          <div style={{ position: 'relative' }}>
            <button onClick={() => setOpen(o => !o)}
              style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 10px', background: T.elev, border: `1px solid ${T.border}`, borderRadius: 8, color: T.t2, cursor: 'pointer', fontSize: 11, fontFamily: FONT, fontWeight: 600 }}>
              Change <ChevronDown size={11} />
            </button>
            {open && (
              <div className="anim-up" style={{ position: 'absolute', right: 0, top: 36, background: T.elev, border: `1px solid ${T.border}`, borderRadius: 10, zIndex: 20, minWidth: 160, boxShadow: '0 8px 32px rgba(0,0,0,0.4)', overflow: 'hidden' }}>
                {['admin', 'staff'].map(role => {
                  const rm = ROLE_META[role];
                  return (
                    <button key={role} onClick={() => { onRoleChange(member._id, role); setOpen(false); }}
                      style={{ width: '100%', padding: '10px 14px', background: member.bizRole === role ? T.hover : 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, textAlign: 'left', transition: 'background 0.1s' }}
                      onMouseEnter={e => e.currentTarget.style.background = T.active}
                      onMouseLeave={e => e.currentTarget.style.background = member.bizRole === role ? T.hover : 'transparent'}
                    >
                      <rm.icon size={12} color={rm.color} />
                      <div>
                        <p style={{ fontSize: 11, fontWeight: 700, color: rm.color, fontFamily: FONT }}>{rm.label}</p>
                        <p style={{ fontSize: 10, color: T.t3 }}>{rm.desc}</p>
                      </div>
                      {member.bizRole === role && <Check size={11} color={T.green} style={{ marginLeft: 'auto' }} />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {!member.isOwner && !isMe && (
          <button onClick={() => onRemove(member._id, member.name)}
            style={{ padding: 7, border: 'none', background: 'transparent', color: T.t3, cursor: 'pointer', borderRadius: 8, display: 'flex', transition: 'all 0.15s' }}
            onMouseEnter={e => { e.currentTarget.style.background = T.redG; e.currentTarget.style.color = T.red; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = T.t3; }}
            title="Remove from business">
            <Trash2 size={14} />
          </button>
        )}
      </div>
    </div>
  );
}

function InviteModal({ businessId, onClose, onSuccess }) {
  const [form, setForm] = useState({ email: '', name: '', role: 'staff' });
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState('form'); // form | success
  const [result, setResult] = useState(null);
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleInvite = async (e) => {
    e.preventDefault();
    if (!form.email) return toast.error('Email is required');
    setLoading(true);
    try {
      const res = await api.post('/team/invite', { ...form, businessId });
      const d = res.data.data;
      setResult(d);
      setStep('success');
      onSuccess();
    } catch {} finally { setLoading(false); }
  };

  if (step === 'success' && result) {
    return (
      <div style={{ textAlign: 'center', padding: '10px 0' }}>
        <div style={{ width: 60, height: 60, borderRadius: '50%', background: T.greenG, border: `1px solid ${T.green}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px', fontSize: 26 }}>
          {result.isNewUser ? '✨' : '✅'}
        </div>
        <p style={{ fontSize: 16, fontWeight: 700, color: T.t1, fontFamily: FONT, marginBottom: 8 }}>{result.isNewUser ? 'Account Created!' : 'Member Added!'}</p>
        <p style={{ fontSize: 13, color: T.t2, marginBottom: 20, lineHeight: 1.6 }}>{result.message}</p>
        {result.isNewUser && result.tempPassword && (
          <div style={{ background: T.elev, border: `1px solid ${T.border}`, borderRadius: 12, padding: 16, marginBottom: 20, textAlign: 'left' }}>
            <p style={{ fontSize: 11, color: T.t3, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Temporary Password (share with member)</p>
            <p className="mono" style={{ fontSize: 16, color: T.amber, fontWeight: 700, background: T.amberG, padding: '8px 14px', borderRadius: 8, border: `1px solid ${T.amberG}` }}>
              {result.tempPassword}
            </p>
            <p style={{ fontSize: 11, color: T.t3, marginTop: 8 }}>⚠️ Tell the member to change this password on first login.</p>
          </div>
        )}
        <Button onClick={onClose} style={{ width: '100%' }}>Done</Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleInvite} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Role cards */}
      <div>
        <p style={{ fontSize: 10, fontWeight: 700, color: T.t3, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10, fontFamily: FONT }}>Select Role</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {['admin', 'staff'].map(role => {
            const m = ROLE_META[role]; const Icon = m.icon; const sel = form.role === role;
            return (
              <button key={role} type="button" onClick={() => setForm(f => ({ ...f, role }))}
                style={{ padding: 14, borderRadius: 12, border: `2px solid ${sel ? m.color : T.border}`, background: sel ? m.bg : 'transparent', cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s' }}>
                <Icon size={16} color={m.color} style={{ marginBottom: 8 }} />
                <p style={{ fontSize: 12, fontWeight: 700, color: m.color, fontFamily: FONT }}>{m.label}</p>
                <p style={{ fontSize: 11, color: T.t3, marginTop: 3, lineHeight: 1.4 }}>{m.desc}</p>
              </button>
            );
          })}
        </div>
      </div>

      <Input label="Email Address *" type="email" placeholder="colleague@company.com" value={form.email} onChange={set('email')} icon={<Mail size={13} />} />
      <Input label="Full Name (required for new users)" placeholder="Jane Doe" value={form.name} onChange={set('name')} icon={<User size={13} />}
        hint="Only needed if this person doesn't have a SmartAccounts account yet" />

      <div style={{ background: T.elev, borderRadius: 12, padding: 14, border: `1px solid ${T.border}` }}>
        <p style={{ fontSize: 12, fontWeight: 600, color: T.t2, lineHeight: 1.6 }}>
          If the email <strong style={{ color: T.t1 }}>already has an account</strong>, they'll be added instantly.
          Otherwise, a new account will be created with a temporary password you can share.
        </p>
      </div>

      <div style={{ display: 'flex', gap: 8 }}>
        <Button variant="secondary" style={{ flex: 1 }} onClick={onClose} type="button">Cancel</Button>
        <Button type="submit" style={{ flex: 2 }} loading={loading} icon={<UserPlus size={14} />}>
          Invite Member
        </Button>
      </div>
    </form>
  );
}

export default function TeamManagement() {
  const { getBusinessId, user: me, activeBusiness } = useAuthStore();
  const businessId = getBusinessId();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showInvite, setShowInvite] = useState(false);

  const fetchMembers = async () => {
    if (!businessId) return;
    try {
      const res = await api.get('/team', { params: { businessId } });
      setMembers(res.data.data.members);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { fetchMembers(); }, [businessId]);

  const handleRoleChange = async (userId, role) => {
    try {
      await api.put(`/team/${userId}/role`, { businessId, role });
      toast.success('Role updated');
      fetchMembers();
    } catch {}
  };

  const handleRemove = async (userId, name) => {
    if (!confirm(`Remove ${name} from ${activeBusiness?.name || 'this business'}?`)) return;
    try {
      await api.delete(`/team/${userId}`, { params: { businessId } });
      toast.success('Member removed');
      fetchMembers();
    } catch {}
  };

  const myRole = members.find(m => m._id === me?._id)?.bizRole;
  const canInvite = ['owner', 'admin'].includes(myRole);

  return (
    <div className="page">
      <PageHeader
        title="Team Management"
        subtitle={`Manage who has access to ${activeBusiness?.name || 'your business'}`}
        icon={<Users size={20} />}
        actions={canInvite && (
          <Button icon={<UserPlus size={14} />} onClick={() => setShowInvite(true)}>
            Invite Member
          </Button>
        )}
      />

      {/* Role reference */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 24 }} className="stagger">
        {Object.entries(ROLE_META).map(([key, m]) => {
          const Icon = m.icon;
          return (
            <Card key={key} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: m.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: m.color, flexShrink: 0 }}>
                <Icon size={16} />
              </div>
              <div>
                <p style={{ fontSize: 13, fontWeight: 700, color: m.color, fontFamily: FONT }}>{m.label}</p>
                <p style={{ fontSize: 11, color: T.t3, marginTop: 4, lineHeight: 1.5 }}>{m.desc}</p>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Members list */}
      <Card pad={0} style={{ overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: `1px solid ${T.border}` }}>
          <div>
            <p style={{ fontSize: 14, fontWeight: 700, color: T.t1, fontFamily: FONT }}>Members</p>
            <p style={{ fontSize: 11, color: T.t3, marginTop: 3 }}>{members.length} {members.length === 1 ? 'person has' : 'people have'} access to this business</p>
          </div>
          {canInvite && (
            <Button size="sm" variant="secondary" icon={<UserPlus size={13} />} onClick={() => setShowInvite(true)}>
              Invite
            </Button>
          )}
        </div>

        {loading ? (
          <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 66, borderRadius: 12 }} />)}
          </div>
        ) : members.length === 0 ? (
          <div style={{ padding: '48px 24px', textAlign: 'center' }}>
            <p style={{ fontSize: 40, marginBottom: 12, opacity: 0.4 }}>👥</p>
            <p style={{ fontSize: 14, fontWeight: 600, color: T.t1, fontFamily: FONT }}>No team members yet</p>
            <p style={{ fontSize: 12, color: T.t3, marginTop: 6, marginBottom: 20 }}>Invite colleagues to collaborate on this business</p>
            {canInvite && <Button icon={<UserPlus size={14} />} onClick={() => setShowInvite(true)}>Invite First Member</Button>}
          </div>
        ) : (
          members.map(member => (
            <MemberRow
              key={member._id}
              member={member}
              isMe={member._id === me?._id}
              onRoleChange={handleRoleChange}
              onRemove={handleRemove}
            />
          ))
        )}
      </Card>

      {/* Permissions table */}
      <Card style={{ marginTop: 20 }}>
        <SectionTitle title="Permission Matrix" subtitle="What each role can do" icon="🔐" />
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${T.border}` }}>
                <th style={{ padding: '8px 14px', textAlign: 'left', fontSize: 10, fontWeight: 700, color: T.t3, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Permission</th>
                {['Owner', 'Admin', 'Staff'].map(r => (
                  <th key={r} style={{ padding: '8px 14px', textAlign: 'center', fontSize: 10, fontWeight: 700, color: T.t3, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{r}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                ['View dashboard & reports',    true,  true,  true  ],
                ['Add transactions',            true,  true,  true  ],
                ['Create & edit invoices',      true,  true,  false ],
                ['Manage inventory',            true,  true,  false ],
                ['Run exports',                 true,  true,  false ],
                ['Invite team members',         true,  true,  false ],
                ['Change member roles',         true,  false, false ],
                ['Edit business settings',      true,  false, false ],
                ['Remove members',              true,  false, false ],
                ['Delete business',             true,  false, false ],
              ].map(([perm, owner, admin, staff], i) => (
                <tr key={i} style={{ borderBottom: `1px solid rgba(28,37,64,0.4)` }}
                  onMouseEnter={e => e.currentTarget.style.background = T.hover}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <td style={{ padding: '10px 14px', color: T.t2, fontWeight: 500 }}>{perm}</td>
                  {[owner, admin, staff].map((has, j) => (
                    <td key={j} style={{ padding: '10px 14px', textAlign: 'center' }}>
                      {has
                        ? <Check size={15} color={T.green} style={{ margin: '0 auto' }} />
                        : <span style={{ color: T.t4, fontSize: 16 }}>–</span>
                      }
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal isOpen={showInvite} onClose={() => setShowInvite(false)} title="Invite Team Member" subtitle="Add someone to collaborate on this business" size="md">
        <InviteModal businessId={businessId} onClose={() => setShowInvite(false)} onSuccess={fetchMembers} />
      </Modal>
    </div>
  );
}
