import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TrendingUp, TrendingDown, DollarSign, FileText,
  Package, Zap, Plus, ArrowUpRight, BarChart3,
} from 'lucide-react';
import { reportAPI } from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import {
  StatCard, Card, Badge, Button, AlertBanner, PageLoader, SectionHeader,
} from '../../components/ui/index.jsx';
import { formatCurrency, formatDate } from '../../utils/helpers';
import RevenueChart from '../../components/charts/RevenueChart.jsx';
import ExpenseDonut from '../../components/charts/ExpenseDonut.jsx';

export default function Dashboard() {
  const { getBusinessId, activeBusiness } = useAuthStore();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const businessId = getBusinessId();

  useEffect(() => {
    if (!businessId) { setLoading(false); return; }
    setLoading(true);
    reportAPI.dashboard({ businessId })
      .then(r => setStats(r.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [businessId]);

  if (!businessId) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <p className="text-4xl mb-3">🏢</p>
          <p className="text-slate-300 font-medium mb-1">No business selected</p>
          <p className="text-slate-600 text-sm mb-4">Create or switch to a business to get started</p>
          <Button onClick={() => navigate('/settings')}>Go to Settings</Button>
        </div>
      </div>
    );
  }

  const cur     = stats?.currentMonth;
  const changes = stats?.changes;

  const QUICK_ACTIONS = [
    { label: 'Record Income',  sub: 'Log a sale or receipt',   icon: '💚', to: '/transactions', color: 'text-emerald-400 bg-emerald-500/10' },
    { label: 'Record Expense', sub: 'Add a business cost',      icon: '🔴', to: '/transactions', color: 'text-red-400    bg-red-500/10'     },
    { label: 'Create Invoice', sub: 'Bill your customers',      icon: '🧾', to: '/invoices',     color: 'text-blue-400  bg-blue-500/10'     },
    { label: 'Add Product',    sub: 'Update your inventory',    icon: '📦', to: '/inventory',    color: 'text-purple-400 bg-purple-500/10'  },
    { label: 'View Ledger',    sub: 'Running balance view',     icon: '📒', to: '/ledger',       color: 'text-amber-400  bg-amber-500/10'   },
    { label: 'Run Report',     sub: 'P&L and analytics',        icon: '📊', to: '/reports',      color: 'text-indigo-400 bg-indigo-500/10'  },
  ];

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto">

      {/* ── Page header ─────────────────────────────────── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-white">Dashboard</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {activeBusiness?.name || 'Business'} &middot; {cur?.month || new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" icon={<FileText size={13} />} onClick={() => navigate('/invoices')}>
            New Invoice
          </Button>
          <Button size="sm" icon={<Plus size={13} />} onClick={() => navigate('/transactions')}>
            Add Transaction
          </Button>
        </div>
      </div>

      {/* ── AI Insights ─────────────────────────────────── */}
      {stats?.insights?.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {stats.insights.map((ins, i) => (
            <AlertBanner key={i} type={ins.type} icon={ins.icon} message={ins.message} />
          ))}
        </div>
      )}

      {/* ── Stat cards ──────────────────────────────────── */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 stagger">
        <StatCard
          label="Total Income"    color="green"
          value={loading ? '—' : formatCurrency(cur?.income)}
          change={changes?.income}   changeLabel="vs last month"
          icon={<TrendingUp  size={17} />} loading={loading}
        />
        <StatCard
          label="Total Expenses"  color="red"
          value={loading ? '—' : formatCurrency(cur?.expenses)}
          change={changes?.expenses} changeLabel="vs last month"
          icon={<TrendingDown size={17} />} loading={loading}
        />
        <StatCard
          label="Net Profit"      color="blue"
          value={loading ? '—' : formatCurrency(cur?.profit)}
          change={changes?.profit}   changeLabel="vs last month"
          icon={<DollarSign  size={17} />} loading={loading}
        />
        <StatCard
          label="Outstanding"     color="amber"
          value={loading ? '—' : formatCurrency(stats?.invoices?.totalOutstanding)}
          sublabel={stats?.invoices?.overdueCount ? `${stats.invoices.overdueCount} overdue` : 'None overdue'}
          icon={<FileText    size={17} />} loading={loading}
        />
      </div>

      {/* ── Charts ──────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2">
          <RevenueChart businessId={businessId} />
        </div>
        <ExpenseDonut businessId={businessId} />
      </div>

      {/* ── Bottom grid ─────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Quick actions */}
        <Card>
          <SectionHeader title="Quick Actions" subtitle="Jump to common tasks" className="mb-4"
            action={<Zap size={14} className="text-amber-400" />} />
          <div className="grid grid-cols-2 gap-2">
            {QUICK_ACTIONS.map(({ label, sub, icon, to, color }) => (
              <button key={label} onClick={() => navigate(to)}
                className="flex items-center gap-2.5 p-3 rounded-xl hover:bg-[#0f1826] border border-transparent hover:border-[#1a2540] transition-all text-left group">
                <div className={`w-8 h-8 rounded-lg ${color} flex items-center justify-center text-base flex-shrink-0`}>
                  {icon}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-slate-200 truncate">{label}</p>
                  <p className="text-[10px] text-slate-600 truncate">{sub}</p>
                </div>
              </button>
            ))}
          </div>
        </Card>

        {/* Invoice summary */}
        <Card>
          <SectionHeader title="Invoice Summary" className="mb-4" action={<FileText size={14} className="text-blue-400" />} />
          {loading
            ? <div className="space-y-2.5">{[...Array(4)].map((_,i) => <div key={i} className="skeleton h-9 rounded-xl" />)}</div>
            : (
              <div className="space-y-1">
                {[
                  { label: 'Paid',        count: stats?.invoices?.counts?.paid    || 0, amount: stats?.invoices?.amounts?.paid    || 0, color: 'emerald' },
                  { label: 'Outstanding', count: stats?.invoices?.counts?.sent    || 0, amount: stats?.invoices?.totalOutstanding || 0, color: 'blue'    },
                  { label: 'Overdue',     count: stats?.invoices?.overdueCount    || 0, amount: stats?.invoices?.amounts?.overdue || 0, color: 'red'      },
                  { label: 'Draft',       count: stats?.invoices?.counts?.draft   || 0, amount: stats?.invoices?.amounts?.draft   || 0, color: 'slate'    },
                ].map(({ label, count, amount, color }) => {
                  const c = { emerald:'text-emerald-400', blue:'text-blue-400', red:'text-red-400', slate:'text-slate-500' };
                  const d = { emerald:'bg-emerald-400', blue:'bg-blue-400', red:'bg-red-400', slate:'bg-slate-600' };
                  return (
                    <div key={label} className="flex items-center gap-2.5 py-2.5 border-b border-[#1a2540]/50 last:border-0">
                      <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${d[color]}`} />
                      <span className="text-xs text-slate-400 flex-1">{label}</span>
                      <span className="text-xs text-slate-600">×{count}</span>
                      <span className={`text-xs font-semibold tabular ${c[color]}`}>{formatCurrency(amount)}</span>
                    </div>
                  );
                })}
              </div>
            )
          }
          <Button variant="ghost" size="sm" className="w-full mt-3 text-slate-500" onClick={() => navigate('/invoices')}>
            View All Invoices →
          </Button>
        </Card>

        {/* Low stock */}
        <Card>
          <SectionHeader title="Inventory Alerts" className="mb-4"
            action={
              stats?.lowStockCount > 0
                ? <Badge variant="danger">{stats.lowStockCount} low</Badge>
                : <Badge variant="success">Healthy</Badge>
            } />
          {loading
            ? <div className="space-y-2">{[...Array(3)].map((_,i) => <div key={i} className="skeleton h-10 rounded-xl" />)}</div>
            : stats?.lowStockCount === 0
              ? (
                <div className="text-center py-6">
                  <p className="text-3xl mb-2 select-none">✅</p>
                  <p className="text-xs text-slate-500">All stock levels healthy</p>
                </div>
              )
              : (
                <div className="space-y-1">
                  <p className="text-xs text-slate-600 mb-3">{stats.lowStockCount} item(s) need restocking</p>
                  <Button size="sm" variant="warning" className="w-full" onClick={() => navigate('/inventory?filter=lowStock')}>
                    View Low Stock Items
                  </Button>
                </div>
              )
          }
        </Card>

      </div>
    </div>
  );
}
