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

  const handleLogout = () => {
    logout();
    navigate('/login');
    toast.success('Logged out');
  };

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
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-4 py-4 border-b border-[#1e2d45] flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-900/40 flex-shrink-0">
            <Sparkles size={14} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-white leading-none">SmartAccounts</p>
            <p className="text-[10px] text-blue-400 mt-0.5">AI-Powered SaaS</p>
          </div>
        </div>
      </div>

      {/* Business switcher */}
      <div className="px-3 py-2.5 border-b border-[#1e2d45] flex-shrink-0">
        <button
          onClick={() => setBizOpen(o => !o)}
          className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-[#1a2235] transition-colors text-left"
        >
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-600 to-purple-700 flex items-center justify-center flex-shrink-0">
            <Building2 size={12} className="text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-slate-200 truncate">{bizName}</p>
            <p className="text-[10px] text-slate-500">Active Business</p>
          </div>
          <ChevronDown size={12} className={cn('text-slate-500 transition-transform flex-shrink-0', bizOpen && 'rotate-180')} />
        </button>

        {bizOpen && (
          <div className="mt-1.5 bg-[#0a0d14] border border-[#1e2d45] rounded-xl overflow-hidden animate-fade-in-up">
            {businesses.map(({ business: b }) => {
              const id = b?._id || b;
              const name = b?.name || 'Business';
              const isActive = activeId === id;
              return (
                <button
                  key={id}
                  onClick={() => handleSwitchBusiness(id)}
                  className={cn(
                    'w-full flex items-center gap-2 px-3 py-2.5 text-left text-xs transition-colors',
                    isActive ? 'bg-blue-600/15 text-blue-400' : 'text-slate-400 hover:bg-[#1a2235] hover:text-slate-200'
                  )}
                >
                  <div className={cn('w-1.5 h-1.5 rounded-full flex-shrink-0', isActive ? 'bg-blue-400' : 'bg-slate-600')} />
                  <span className="font-medium truncate flex-1">{name}</span>
                  {isActive && <span className="text-[10px] bg-blue-500/15 text-blue-400 px-1.5 py-0.5 rounded-md">Active</span>}
                </button>
              );
            })}
            <button
              onClick={() => { navigate('/settings'); setBizOpen(false); onClose?.(); }}
              className="w-full text-left text-xs text-blue-400 px-3 py-2.5 border-t border-[#1e2d45] hover:bg-[#1a2235] transition-colors"
            >
              + Create New Business
            </button>
          </div>
        )}
      </div>

      {/* Nav links */}
      <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
        <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest px-3 mb-2">Menu</p>
        {NAV.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            onClick={() => onClose?.()}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors group',
                isActive
                  ? 'nav-active'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-[#1a2235]'
              )
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={15} className={cn('flex-shrink-0 transition-colors', isActive ? 'text-blue-400' : 'text-slate-500 group-hover:text-slate-300')} />
                <span className="truncate">{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User footer */}
      <div className="px-3 py-3 border-t border-[#1e2d45] flex-shrink-0">
        <div className="flex items-center gap-2.5 px-2 py-2 rounded-xl hover:bg-[#1a2235] transition-colors group">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
            {getInitials(user?.name || 'U')}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-slate-200 truncate">{user?.name}</p>
            <p className="text-[10px] text-slate-500 capitalize">{user?.role}</p>
          </div>
          <button
            onClick={handleLogout}
            className="p-1.5 rounded-lg text-slate-600 hover:text-red-400 hover:bg-red-400/10 transition-colors opacity-0 group-hover:opacity-100"
            title="Logout"
          >
            <LogOut size={13} />
          </button>
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
    <div className="flex h-screen bg-[#070a12] overflow-hidden">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-56 bg-[#0f1420] border-r border-[#1e2d45] flex-shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex animate-fade-in">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <aside className="relative w-64 bg-[#0f1420] border-r border-[#1e2d45] flex flex-col h-full shadow-2xl animate-fade-in-up">
            <button
              onClick={() => setSidebarOpen(false)}
              className="absolute top-3 right-3 p-1.5 hover:bg-[#1a2235] rounded-lg text-slate-400 z-10"
            >
              <X size={15} />
            </button>
            <SidebarContent onClose={() => setSidebarOpen(false)} />
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <header className="h-14 bg-[#0f1420]/95 backdrop-blur-md border-b border-[#1e2d45] flex items-center gap-3 px-4 flex-shrink-0 z-30">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 hover:bg-[#1a2235] rounded-lg text-slate-400 transition-colors"
          >
            <Menu size={17} />
          </button>

          {/* Search */}
          <div className="flex-1 max-w-xs">
            <div className="relative">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600 pointer-events-none" />
              <input
                type="text"
                placeholder="Search…"
                className="w-full bg-[#131929] border border-[#1e2d45] rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-400 placeholder-slate-600 focus:outline-none focus:border-blue-500/50 focus:bg-[#1a2235] transition-all"
              />
            </div>
          </div>

          <div className="flex items-center gap-1 ml-auto">
            {/* Notifications */}
            <button
              onClick={() => setNotifOpen(true)}
              className="relative p-2 hover:bg-[#1a2235] rounded-lg text-slate-400 hover:text-slate-200 transition-colors"
            >
              <Bell size={16} />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full notif-dot" />
            </button>

            {/* User avatar */}
            <button
              onClick={() => navigate('/settings')}
              className="flex items-center gap-2 px-2.5 py-1.5 hover:bg-[#1a2235] rounded-xl transition-colors"
            >
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0">
                {getInitials(user?.name || 'U')}
              </div>
              <span className="text-xs text-slate-400 hidden sm:block font-medium">{user?.name?.split(' ')[0]}</span>
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto page-enter">{children}</main>
      </div>

      <NotificationPanel isOpen={notifOpen} onClose={() => setNotifOpen(false)} />
    </div>
  );
}
