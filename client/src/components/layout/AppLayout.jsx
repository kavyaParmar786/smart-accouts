import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, ArrowLeftRight, FileText, Package, BarChart3, Settings, LogOut, ChevronDown, Building2, Bell, Search, Menu, X, Sparkles, BookOpen, Users, HelpCircle, Scale } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { authAPI } from '../../services/api';
import { getInitials } from '../../utils/helpers';
import { T } from '../ui/index.jsx';
import NotificationPanel from './NotificationPanel.jsx';
import toast from 'react-hot-toast';

const NAV = [
  { to: '/dashboard',     icon: LayoutDashboard, label: 'Dashboard'    },
  { to: '/transactions',  icon: ArrowLeftRight,  label: 'Transactions' },
  { to: '/ledger',        icon: BookOpen,        label: 'Ledger'       },
  { to: '/invoices',      icon: FileText,        label: 'Invoices'     },
  { to: '/inventory',     icon: Package,         label: 'Inventory'    },
  { to: '/reports',       icon: BarChart3,       label: 'Reports'      },
  { to: '/balance-sheet', icon: Scale,           label: 'Balance Sheet'},
];
const NAV2 = [
  { to: '/team',     icon: Users,      label: 'Team'      },
  { to: '/guide',    icon: HelpCircle, label: 'User Guide'},
  { to: '/settings', icon: Settings,   label: 'Settings'  },
];

const FONT = "'Sora', ui-sans-serif, system-ui, sans-serif";

function SidebarContent({ onClose }) {
  const [bizOpen, setBizOpen] = useState(false);
  const { user, activeBusiness, logout, setActiveBusiness } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); toast.success('Logged out'); };

  const handleSwitch = async (id) => {
    try {
      const res = await authAPI.switchBusiness(id);
      setActiveBusiness(res.data.data.activeBusiness);
      setBizOpen(false); toast.success('Business switched');
      window.location.reload();
    } catch {}
  };

  const businesses = user?.businesses || [];
  const bizName = activeBusiness?.name || 'My Business';
  const activeId = activeBusiness?._id || activeBusiness;

  const NavItem = ({ to, icon: Icon, label }) => (
    <NavLink to={to} onClick={() => onClose?.()}
      className={({ isActive }) => isActive ? 'nav-active' : ''}
      style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderRadius: 10, textDecoration: 'none', marginBottom: 1, transition: 'all 0.15s', color: T.t3 }}
      onMouseEnter={e => { if (!e.currentTarget.classList.contains('nav-active')) e.currentTarget.style.background = T.hover; }}
      onMouseLeave={e => { if (!e.currentTarget.classList.contains('nav-active')) e.currentTarget.style.background = 'transparent'; }}
    >
      {({ isActive }) => (
        <>
          <Icon size={14} className="nav-icon" style={{ color: isActive ? T.blue : T.t3, flexShrink: 0 }} />
          <span className="nav-label" style={{ fontSize: 12, fontWeight: 600, color: isActive ? T.t1 : T.t3, fontFamily: FONT }}>{label}</span>
        </>
      )}
    </NavLink>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Logo */}
      <div style={{ padding: '18px 16px 14px', borderBottom: `1px solid ${T.border}`, flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 10, background: 'linear-gradient(135deg, #3b7eff 0%, #9b6dff 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 20px rgba(59,126,255,0.4)', flexShrink: 0 }}>
            <Sparkles size={14} color="#fff" />
          </div>
          <div>
            <p style={{ fontSize: 13, fontWeight: 800, color: T.t1, fontFamily: FONT, letterSpacing: '-0.03em', lineHeight: 1 }}>SmartAccounts</p>
            <p style={{ fontSize: 9, color: T.blue, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginTop: 2 }}>AI-Powered SaaS</p>
          </div>
        </div>
      </div>

      {/* Business switcher */}
      <div style={{ padding: '10px 10px 6px', borderBottom: `1px solid ${T.border}`, flexShrink: 0 }}>
        <button onClick={() => setBizOpen(o => !o)}
          style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 9, padding: '9px 10px', borderRadius: 10, background: 'transparent', border: 'none', cursor: 'pointer', transition: 'background 0.15s', textAlign: 'left' }}
          onMouseEnter={e => e.currentTarget.style.background = T.hover}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
          <div style={{ width: 28, height: 28, borderRadius: 8, background: 'linear-gradient(135deg,#9b6dff,#6d28d9)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Building2 size={13} color="#fff" />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: T.t1, fontFamily: FONT, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{bizName}</p>
            <p style={{ fontSize: 10, color: T.t3 }}>Active business</p>
          </div>
          <ChevronDown size={12} color={T.t3} style={{ flexShrink: 0, transition: 'transform 0.2s', transform: bizOpen ? 'rotate(180deg)' : 'rotate(0)' }} />
        </button>

        {bizOpen && (
          <div className="anim-up" style={{ marginTop: 4, background: T.surface, border: `1px solid ${T.border}`, borderRadius: 10, overflow: 'hidden' }}>
            {businesses.map(({ business: b }) => {
              const id = b?._id || b; const name = b?.name || 'Business'; const yes = activeId === id;
              return (
                <button key={id} onClick={() => handleSwitch(id)}
                  style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: '9px 12px', background: yes ? T.blueG : 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left', transition: 'background 0.1s' }}
                  onMouseEnter={e => { if (!yes) e.currentTarget.style.background = T.hover; }}
                  onMouseLeave={e => { if (!yes) e.currentTarget.style.background = 'transparent'; }}
                >
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: yes ? T.blue : T.t4, flexShrink: 0 }} />
                  <span style={{ fontSize: 12, fontWeight: 600, color: yes ? T.blue : T.t2, fontFamily: FONT, flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{name}</span>
                  {yes && <span style={{ fontSize: 9, color: T.blue, background: T.blueG, padding: '2px 6px', borderRadius: 999, fontWeight: 700 }}>Active</span>}
                </button>
              );
            })}
            <button onClick={() => { navigate('/settings'); setBizOpen(false); onClose?.(); }}
              style={{ width: '100%', padding: '9px 12px', background: 'transparent', border: 'none', borderTop: `1px solid ${T.border}`, cursor: 'pointer', textAlign: 'left', fontSize: 12, color: T.blue, fontWeight: 600, fontFamily: FONT }}
              onMouseEnter={e => e.currentTarget.style.background = T.hover}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              + Create New Business
            </button>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '10px', overflowY: 'auto' }}>
        <p style={{ fontSize: 9, fontWeight: 800, color: T.t4, textTransform: 'uppercase', letterSpacing: '0.12em', padding: '4px 12px 8px', fontFamily: FONT }}>Main</p>
        {NAV.map(item => <NavItem key={item.to} {...item} />)}
        <div style={{ height: 1, background: T.border, margin: '10px 4px' }} />
        <p style={{ fontSize: 9, fontWeight: 800, color: T.t4, textTransform: 'uppercase', letterSpacing: '0.12em', padding: '4px 12px 8px', fontFamily: FONT }}>Manage</p>
        {NAV2.map(item => <NavItem key={item.to} {...item} />)}
      </nav>

      {/* User */}
      <div style={{ padding: '10px', borderTop: `1px solid ${T.border}`, flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '9px 10px', borderRadius: 10, cursor: 'pointer', transition: 'background 0.15s' }}
          onMouseEnter={e => e.currentTarget.style.background = T.hover}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
          <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg,#3b7eff,#9b6dff)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 800, color: '#fff', flexShrink: 0 }}>
            {getInitials(user?.name || 'U')}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: T.t1, fontFamily: FONT, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.name}</p>
            <p style={{ fontSize: 10, color: T.t3, textTransform: 'capitalize' }}>{user?.role}</p>
          </div>
          <button onClick={handleLogout} style={{ padding: 6, border: 'none', background: 'transparent', color: T.t3, cursor: 'pointer', borderRadius: 7, display: 'flex', transition: 'all 0.15s', flexShrink: 0 }}
            onMouseEnter={e => { e.currentTarget.style.background = T.redG; e.currentTarget.style.color = T.red; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = T.t3; }}
            title="Logout">
            <LogOut size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AppLayout({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifOpen,  setNotifOpen]  = useState(false);
  const { user } = useAuthStore();
  const navigate = useNavigate();

  return (
    <div style={{ display: 'flex', height: '100dvh', background: T.base, overflow: 'hidden' }}>
      {/* Desktop sidebar */}
      <aside style={{ width: 210, minWidth: 210, flexShrink: 0, background: T.surface, borderRight: `1px solid ${T.border}`, height: '100%', display: 'flex', flexDirection: 'column' }}
        className="hidden lg:flex">
        <SidebarContent />
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="lg:hidden" style={{ position: 'fixed', inset: 0, zIndex: 60, display: 'flex' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)' }} onClick={() => setMobileOpen(false)} />
          <aside className="anim-slide-r" style={{ position: 'relative', width: 240, height: '100%', background: T.surface, borderRight: `1px solid ${T.border}`, display: 'flex', flexDirection: 'column', zIndex: 1 }}>
            <button onClick={() => setMobileOpen(false)} style={{ position: 'absolute', top: 12, right: 12, padding: 6, border: 'none', background: T.hover, borderRadius: 8, color: T.t2, cursor: 'pointer', display: 'flex', zIndex: 2 }}>
              <X size={14} />
            </button>
            <SidebarContent onClose={() => setMobileOpen(false)} />
          </aside>
        </div>
      )}

      {/* Main */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>
        {/* Header */}
        <header style={{ height: 52, flexShrink: 0, display: 'flex', alignItems: 'center', gap: 10, padding: '0 20px', background: 'rgba(11,14,26,0.9)', borderBottom: `1px solid ${T.border}`, backdropFilter: 'blur(16px)', zIndex: 30 }}>
          <button className="lg:hidden" onClick={() => setMobileOpen(true)} style={{ padding: 7, border: 'none', background: 'transparent', color: T.t2, cursor: 'pointer', borderRadius: 8, display: 'flex' }}>
            <Menu size={17} />
          </button>

          {/* Search */}
          <div style={{ flex: 1, maxWidth: 280, position: 'relative' }}>
            <Search size={12} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: T.t3, pointerEvents: 'none' }} />
            <input placeholder="Search transactions, invoices..." style={{ width: '100%', background: T.card, border: `1px solid ${T.border}`, borderRadius: 9, padding: '6px 12px 6px 30px', fontSize: 12, color: T.t2, fontFamily: FONT, transition: 'all 0.15s' }}
              onFocus={e => { e.target.style.borderColor = T.blue; e.target.style.background = T.surface; }}
              onBlur={e  => { e.target.style.borderColor = T.border; e.target.style.background = T.card; }} />
          </div>

          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 4 }}>
            {/* Notification bell */}
            <button onClick={() => setNotifOpen(true)} style={{ position: 'relative', padding: 8, border: 'none', background: 'transparent', color: T.t2, cursor: 'pointer', borderRadius: 9, display: 'flex', transition: 'all 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.background = T.hover}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <Bell size={16} />
              <span style={{ position: 'absolute', top: 7, right: 7, width: 7, height: 7, borderRadius: '50%', background: T.red, border: `1.5px solid ${T.surface}` }} />
            </button>

            {/* Avatar */}
            <button onClick={() => navigate('/settings')} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 10px', border: 'none', background: 'transparent', cursor: 'pointer', borderRadius: 9, transition: 'background 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.background = T.hover}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'linear-gradient(135deg,#3b7eff,#9b6dff)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 800, color: '#fff', flexShrink: 0 }}>
                {getInitials(user?.name || 'U')}
              </div>
              <span className="hidden sm:block" style={{ fontSize: 12, fontWeight: 600, color: T.t2, fontFamily: FONT }}>{user?.name?.split(' ')[0]}</span>
            </button>
          </div>
        </header>

        <main style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
          {children}
        </main>
      </div>

      <NotificationPanel isOpen={notifOpen} onClose={() => setNotifOpen(false)} />
    </div>
  );
}
