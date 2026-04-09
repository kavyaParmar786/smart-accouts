/**
 * AppLayout — Main shell: sidebar + header + content
 * Fixed: overflow conflicts, height issues, mobile glitches
 */
import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, ArrowLeftRight, FileText, Package,
  BarChart3, Settings, LogOut, ChevronDown, Building2,
  Bell, Search, Menu, X, Sparkles, BookOpen,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { authAPI } from '../../services/api';
import { cn, getInitials } from '../../utils/helpers';
import NotificationPanel from './NotificationPanel.jsx';
import toast from 'react-hot-toast';

const NAV = [
  { to: '/dashboard',    icon: LayoutDashboard, label: 'Dashboard'           },
  { to: '/transactions', icon: ArrowLeftRight,  label: 'Transactions'        },
  { to: '/ledger',       icon: BookOpen,        label: 'Ledger'              },
  { to: '/invoices',     icon: FileText,        label: 'Invoices'            },
  { to: '/inventory',    icon: Package,         label: 'Inventory'           },
  { to: '/reports',      icon: BarChart3,       label: 'Reports & Analytics' },
  { to: '/settings',     icon: Settings,        label: 'Settings'            },
];

/* ─── Sidebar inner content ─────────────────────────────────────── */
function SidebarContent({ onClose }) {
  const [bizOpen, setBizOpen] = useState(false);
  const { user, activeBusiness, logout, setActiveBusiness } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
    toast.success('Logged out');
  };

  const handleSwitch = async (id) => {
    try {
      const res = await authAPI.switchBusiness(id);
      setActiveBusiness(res.data.data.activeBusiness);
      setBizOpen(false);
      toast.success('Business switched');
      window.location.reload();
    } catch {}
  };

  const businesses = user?.businesses || [];
  const bizName    = activeBusiness?.name || 'My Business';
  const activeId   = activeBusiness?._id  || activeBusiness;

  return (
    /* This div must fill its parent — sidebar controls the height */
    <div className="flex flex-col" style={{ height: '100%', overflow: 'hidden' }}>

      {/* Logo */}
      <div style={{ flexShrink: 0 }} className="px-4 py-4 border-b border-[#1a2540]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-950/60 flex-shrink-0">
            <Sparkles size={14} className="text-white" />
          </div>
          <div>
            <p className="text-[13px] font-bold text-white leading-tight">SmartAccounts</p>
            <p className="text-[10px] text-blue-400 font-medium">AI-Powered SaaS</p>
          </div>
        </div>
      </div>

      {/* Business switcher */}
      <div style={{ flexShrink: 0 }} className="px-3 py-2 border-b border-[#1a2540]">
        <button
          onClick={() => setBizOpen(o => !o)}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-[#111827] transition-colors text-left"
        >
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center flex-shrink-0">
            <Building2 size={12} className="text-white" />
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <p className="text-xs font-semibold text-slate-200 truncate">{bizName}</p>
            <p className="text-[10px] text-slate-500">Active Business</p>
          </div>
          <ChevronDown
            size={12}
            className="text-slate-500 flex-shrink-0 transition-transform duration-200"
            style={{ transform: bizOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
          />
        </button>

        {bizOpen && (
          <div className="mt-1 rounded-xl border border-[#1a2540] overflow-hidden" style={{ background: '#060a11' }}>
            {businesses.map(({ business: b }) => {
              const id   = b?._id || b;
              const name = b?.name  || 'Business';
              const yes  = activeId === id;
              return (
                <button key={id} onClick={() => handleSwitch(id)}
                  className={cn(
                    'w-full flex items-center gap-2 px-3 py-2 text-xs transition-colors text-left',
                    yes ? 'bg-blue-600/15 text-blue-400' : 'text-slate-400 hover:bg-[#111827] hover:text-slate-200'
                  )}>
                  <span className={cn('w-1.5 h-1.5 rounded-full flex-shrink-0', yes ? 'bg-blue-400' : 'bg-slate-600')} />
                  <span className="font-medium truncate flex-1">{name}</span>
                  {yes && <span className="text-[9px] bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded font-semibold">Active</span>}
                </button>
              );
            })}
            <button
              onClick={() => { navigate('/settings'); setBizOpen(false); onClose?.(); }}
              className="w-full text-left text-xs text-blue-400 hover:text-blue-300 px-3 py-2 border-t border-[#1a2540] hover:bg-[#111827] transition-colors font-medium"
            >
              + Create New Business
            </button>
          </div>
        )}
      </div>

      {/* Nav links */}
      <nav style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }} className="px-3 py-3">
        <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest px-3 mb-2">Menu</p>
        {NAV.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            onClick={() => onClose?.()}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-colors mb-0.5',
                isActive
                  ? 'nav-active'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-[#111827]'
              )
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={15} className={cn('flex-shrink-0', isActive ? 'text-blue-400' : 'text-slate-500')} />
                <span>{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User row */}
      <div style={{ flexShrink: 0 }} className="px-3 py-3 border-t border-[#1a2540]">
        <div className="flex items-center gap-2.5 px-2 py-2 rounded-xl hover:bg-[#111827] transition-colors">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0">
            {getInitials(user?.name || 'U')}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p className="text-xs font-semibold text-slate-200 truncate">{user?.name}</p>
            <p className="text-[10px] text-slate-500 capitalize">{user?.role}</p>
          </div>
          <button
            onClick={handleLogout}
            className="p-1.5 rounded-lg text-slate-600 hover:text-red-400 hover:bg-red-400/10 transition-colors flex-shrink-0"
            title="Logout"
          >
            <LogOut size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Root layout ───────────────────────────────────────────────── */
export default function AppLayout({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifOpen,  setNotifOpen]  = useState(false);
  const { user } = useAuthStore();
  const navigate = useNavigate();

  return (
    /*
      Use 100dvh (dynamic viewport height) so mobile browsers
      don't glitch when address bar shows/hides.
      Fallback to 100vh for older browsers.
    */
    <div
      style={{ display: 'flex', height: '100dvh', background: '#080c14', overflow: 'hidden' }}
    >

      {/* ── Desktop sidebar ─────────────────────────────────── */}
      <aside
        className="border-r border-[#1a2540]"
        style={{
          width: 220,
          minWidth: 220,
          flexShrink: 0,
          background: '#0d1322',
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
        }}
      >
        {/* Hide on mobile via inline media workaround — Tailwind hidden lg:flex */}
        <div className="hidden lg:flex" style={{ flexDirection: 'column', height: '100%' }}>
          <SidebarContent />
        </div>
      </aside>

      {/* ── Mobile sidebar overlay ───────────────────────────── */}
      {mobileOpen && (
        <div
          className="lg:hidden"
          style={{ position: 'fixed', inset: 0, zIndex: 60, display: 'flex' }}
        >
          {/* Backdrop */}
          <div
            style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)' }}
            onClick={() => setMobileOpen(false)}
          />
          {/* Drawer */}
          <aside
            className="animate-slide-right"
            style={{
              position: 'relative', width: 260, height: '100%',
              background: '#0d1322', borderRight: '1px solid #1a2540',
              display: 'flex', flexDirection: 'column', zIndex: 1,
            }}
          >
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-3 right-3 p-1.5 rounded-lg text-slate-400 hover:bg-[#111827] hover:text-white z-10 transition-colors"
            >
              <X size={15} />
            </button>
            <SidebarContent onClose={() => setMobileOpen(false)} />
          </aside>
        </div>
      )}

      {/* ── Main column ─────────────────────────────────────── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>

        {/* Header */}
        <header
          className="border-b border-[#1a2540]"
          style={{
            height: 56,
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '0 16px',
            background: 'rgba(13,19,34,0.92)',
            backdropFilter: 'blur(12px)',
            zIndex: 30,
          }}
        >
          {/* Mobile hamburger */}
          <button
            className="lg:hidden p-2 rounded-lg text-slate-400 hover:bg-[#111827] hover:text-white transition-colors"
            onClick={() => setMobileOpen(true)}
          >
            <Menu size={18} />
          </button>

          {/* Search */}
          <div style={{ flex: 1, maxWidth: 300 }}>
            <div style={{ position: 'relative' }}>
              <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#475569', pointerEvents: 'none' }} />
              <input
                type="text"
                placeholder="Search..."
                style={{
                  width: '100%', background: '#111827', border: '1px solid #1a2540',
                  borderRadius: 10, padding: '6px 12px 6px 32px',
                  fontSize: 13, color: '#94a3b8',
                  transition: 'border-color 0.15s',
                }}
                onFocus={e => e.target.style.borderColor = '#3b82f6'}
                onBlur={e => e.target.style.borderColor = '#1a2540'}
              />
            </div>
          </div>

          {/* Right controls */}
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6 }}>
            {/* Bell */}
            <button
              onClick={() => setNotifOpen(true)}
              className="hover:bg-[#111827] transition-colors"
              style={{ position: 'relative', padding: 8, borderRadius: 10, color: '#94a3b8' }}
            >
              <Bell size={17} />
              <span style={{
                position: 'absolute', top: 8, right: 8,
                width: 6, height: 6, borderRadius: '50%',
                background: '#ef4444', border: '1.5px solid #080c14',
              }} />
            </button>

            {/* Avatar + name */}
            <button
              onClick={() => navigate('/settings')}
              className="hover:bg-[#111827] transition-colors"
              style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px', borderRadius: 10 }}
            >
              <div style={{
                width: 26, height: 26, borderRadius: '50%', flexShrink: 0,
                background: 'linear-gradient(135deg,#3b82f6,#6366f1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 10, fontWeight: 700, color: '#fff',
              }}>
                {getInitials(user?.name || 'U')}
              </div>
              <span className="hidden sm:block" style={{ fontSize: 12, color: '#94a3b8', fontWeight: 500 }}>
                {user?.name?.split(' ')[0]}
              </span>
            </button>
          </div>
        </header>

        {/* Page content — scrolls independently */}
        <main style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
          {children}
        </main>
      </div>

      {/* Notification panel */}
      <NotificationPanel isOpen={notifOpen} onClose={() => setNotifOpen(false)} />
    </div>
  );
}
