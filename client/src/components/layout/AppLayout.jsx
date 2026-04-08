import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, ArrowLeftRight, FileText, Package, BarChart3, Settings, LogOut, ChevronDown, Building2, Bell, Search, Menu, X, Sparkles, BookOpen } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { authAPI } from '../../services/api';
import { cn, getInitials } from '../../utils/helpers';
import NotificationPanel from './NotificationPanel.jsx';
import toast from 'react-hot-toast';

const NAV = [
  { to: '/dashboard',    icon: LayoutDashboard, label: 'Dashboard'           },
  { to: '/transactions', icon: ArrowLeftRight,  label: 'Transactions'        },
  { to: '/ledger',       icon: BookOpen,         label: 'Ledger'              },
  { to: '/invoices',     icon: FileText,         label: 'Invoices'            },
  { to: '/inventory',    icon: Package,          label: 'Inventory'           },
  { to: '/reports',      icon: BarChart3,        label: 'Reports & Analytics' },
  { to: '/settings',     icon: Settings,         label: 'Settings'            },
];

function SidebarContent({ onClose }) {
  const [bizOpen, setBizOpen] = useState(false);
  const { user, activeBusiness, logout, setActiveBusiness } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); toast.success('Logged out'); };

  const handleSwitchBusiness = async (id) => {
    try {
      const res = await authAPI.switchBusiness(id);
      setActiveBusiness(res.data.data.activeBusiness);
      setBizOpen(false);
      toast.success('Business switched');
      window.location.reload();
    } catch {}
  };

  const businesses = user?.businesses || [];
  const bizName = activeBusiness?.name || 'My Business';
  const activeId = activeBusiness?._id || activeBusiness;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="px-4 py-4 border-b border-[#1e2d45] flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-900/40">
            <Sparkles size={14} className="text-white" />
          </div>
          <div><p className="text-sm font-bold text-white">SmartAccounts</p><p className="text-[10px] text-blue-400">AI-Powered SaaS</p></div>
        </div>
      </div>

      <div className="px-3 py-3 border-b border-[#1e2d45] flex-shrink-0">
        <button onClick={() => setBizOpen(o => !o)} className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-[#1a2235] transition-colors">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-600 to-purple-700 flex items-center justify-center flex-shrink-0"><Building2 size={12} className="text-white" /></div>
          <div className="flex-1 text-left min-w-0"><p className="text-xs font-semibold text-slate-200 truncate">{bizName}</p><p className="text-[10px] text-slate-500">Active Business</p></div>
          <ChevronDown size={12} className={cn('text-slate-500 transition-transform flex-shrink-0', bizOpen && 'rotate-180')} />
        </button>
        {bizOpen && (
          <div className="mt-1.5 bg-[#0a0d14] border border-[#1e2d45] rounded-xl overflow-hidden">
            {businesses.map(({ business: b }) => {
              const id = b?._id || b; const name = b?.name || 'Business'; const isActive = activeId === id;
              return (
                <button key={id} onClick={() => handleSwitchBusiness(id)}
                  className={cn('w-full flex items-center gap-2 px-3 py-2 text-left text-xs transition-colors', isActive ? 'bg-blue-600/15 text-blue-400' : 'text-slate-400 hover:bg-[#1a2235]')}>
                  <div className={cn('w-1.5 h-1.5 rounded-full', isActive ? 'bg-blue-400' : 'bg-slate-600')} />
                  <span className="font-medium truncate">{name}</span>
                  {isActive && <span className="ml-auto text-[10px] bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded">Active</span>}
                </button>
              );
            })}
            <button onClick={() => { navigate('/settings'); setBizOpen(false); onClose?.(); }}
              className="w-full text-left text-xs text-blue-400 px-3 py-2 border-t border-[#1e2d45] hover:bg-[#1a2235] transition-colors">
              + Create New Business
            </button>
          </div>
        )}
      </div>

      <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
        <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest px-3 mb-2">Menu</p>
        {NAV.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to} onClick={() => onClose?.()}
            className={({ isActive }) => cn('flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group', isActive ? 'nav-active text-blue-400' : 'text-slate-400 hover:text-slate-100 hover:bg-[#1a2235]')}>
            {({ isActive }) => (
              <><Icon size={15} className={cn('flex-shrink-0', isActive ? 'text-blue-400' : 'text-slate-500 group-hover:text-slate-300')} /><span>{label}</span></>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="px-3 py-3 border-t border-[#1e2d45] flex-shrink-0">
        <div className="flex items-center gap-2.5 px-2 py-1.5 rounded-xl hover:bg-[#1a2235] transition-colors">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
            {getInitials(user?.name || 'U')}
          </div>
          <div className="flex-1 min-w-0"><p className="text-xs font-semibold text-slate-200 truncate">{user?.name}</p><p className="text-[10px] text-slate-500 capitalize">{user?.role}</p></div>
          <button onClick={handleLogout} className="p-1.5 rounded-lg text-slate-600 hover:text-red-400 hover:bg-red-400/10 transition-colors" title="Logout"><LogOut size={13} /></button>
        </div>
      </div>
    </div>
  );
}

export default function AppLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const { user } = useAuthStore();
  const navigate = useNavigate();

  return (
    <div className="app-shell">
      {/* Desktop sidebar */}
      <aside className="app-sidebar">
        <SidebarContent />
      </aside>

      {/* Mobile overlay sidebar */}
      {sidebarOpen && (
        <div className="mobile-sidebar-overlay" onClick={() => setSidebarOpen(false)}>
          <aside className="mobile-sidebar" onClick={e => e.stopPropagation()}>
            <button onClick={() => setSidebarOpen(false)} className="sidebar-close-btn"><X size={15} /></button>
            <SidebarContent onClose={() => setSidebarOpen(false)} />
          </aside>
        </div>
      )}

      {/* Main content area */}
      <div className="app-main">
        <header className="app-header">
          <button onClick={() => setSidebarOpen(true)} className="mobile-menu-btn"><Menu size={17} /></button>
          <div className="header-search">
            <div className="search-wrap">
              <Search size={13} className="search-icon" />
              <input type="text" placeholder="Search..." className="search-input" />
            </div>
          </div>
          <div className="header-actions">
            <button onClick={() => setNotifOpen(true)} className="header-icon-btn">
              <Bell size={16} />
              <span className="notif-dot" />
            </button>
            <button onClick={() => navigate('/settings')} className="header-user-btn">
              <div className="user-avatar">{getInitials(user?.name || 'U')}</div>
              <span className="user-name">{user?.name?.split(' ')[0]}</span>
            </button>
          </div>
        </header>
        <main className="app-content">{children}</main>
      </div>

      <NotificationPanel isOpen={notifOpen} onClose={() => setNotifOpen(false)} />
    </div>
  );
}
