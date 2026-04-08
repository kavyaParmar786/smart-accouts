import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, TrendingDown, DollarSign, FileText, Package, Zap, Plus, ArrowUpRight } from 'lucide-react';
import { reportAPI } from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import { StatCard, Card, Badge, Button, AlertBanner, PageLoader } from '../../components/ui/index.jsx';
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
    if (!businessId) return;
    const load = async () => {
      setLoading(true);
      try {
        const res = await reportAPI.dashboard({ businessId });
        setStats(res.data.data);
      } catch {}
      setLoading(false);
    };
    load();
  }, [businessId]);

  const cur = stats?.currentMonth;
  const changes = stats?.changes;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Dashboard</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {activeBusiness?.name || 'Your Business'} · {cur?.month || new Date().toLocaleString('default', { month: 'long' })} Overview
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" icon={<FileText size={14} />} onClick={() => navigate('/invoices')}>New Invoice</Button>
          <Button size="sm" icon={<Plus size={14} />} onClick={() => navigate('/transactions')}>Add Transaction</Button>
        </div>
      </div>

      {/* AI Insights */}
      {stats?.insights?.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {stats.insights.map((ins, i) => (
            <AlertBanner key={i}
              type={ins.type === 'positive' ? 'success' : ins.type === 'alert' ? 'danger' : ins.type === 'warning' ? 'warning' : 'info'}
              icon={ins.icon} message={ins.message} />
          ))}
        </div>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 stagger">
        <StatCard label="Total Income" color="green"
          value={loading ? '...' : formatCurrency(cur?.income)}
          change={changes?.income}
          changeLabel="vs last month"
          icon={<TrendingUp size={18} />} loading={loading} />
        <StatCard label="Total Expenses" color="red"
          value={loading ? '...' : formatCurrency(cur?.expenses)}
          change={changes?.expenses}
          changeLabel="vs last month"
          icon={<TrendingDown size={18} />} loading={loading} />
        <StatCard label="Net Profit" color="blue"
          value={loading ? '...' : formatCurrency(cur?.profit)}
          change={changes?.profit}
          changeLabel="vs last month"
          icon={<DollarSign size={18} />} loading={loading} />
        <StatCard label="Outstanding" color="amber"
          value={loading ? '...' : formatCurrency(stats?.invoices?.totalOutstanding)}
          sublabel={stats?.invoices?.overdueCount ? `${stats.invoices.overdueCount} overdue` : 'No overdue'}
          icon={<FileText size={18} />} loading={loading} />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2">
          <RevenueChart businessId={businessId} />
        </div>
        <div>
          <ExpenseDonut businessId={businessId} />
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Quick actions */}
        <Card>
          <p className="text-sm font-semibold text-white mb-4 flex items-center gap-2"><Zap size={15} className="text-amber-400" /> Quick Actions</p>
          <div className="space-y-2">
            {[
              { label: 'Record Income', sub: 'Log a new sale or receipt', to: '/transactions', state: { type: 'income' }, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
              { label: 'Record Expense', sub: 'Add a business expense', to: '/transactions', state: { type: 'expense' }, color: 'text-red-400', bg: 'bg-red-500/10' },
              { label: 'Create Invoice', sub: 'Bill your customers', to: '/invoices', color: 'text-blue-400', bg: 'bg-blue-500/10' },
              { label: 'Add Product', sub: 'Update your inventory', to: '/inventory', color: 'text-purple-400', bg: 'bg-purple-500/10' },
            ].map(({ label, sub, to, state, color, bg }) => (
              <button key={label} onClick={() => navigate(to, { state })}
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-[#1a2235] transition-colors text-left group">
                <div className={`w-8 h-8 rounded-lg ${bg} ${color} flex items-center justify-center flex-shrink-0`}>
                  <ArrowUpRight size={14} />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-200">{label}</p>
                  <p className="text-xs text-slate-500">{sub}</p>
                </div>
              </button>
            ))}
          </div>
        </Card>

        {/* Invoice summary */}
        <Card>
          <p className="text-sm font-semibold text-white mb-4 flex items-center gap-2"><FileText size={15} className="text-blue-400" /> Invoice Summary</p>
          {loading ? (
            <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="h-10 bg-[#1a2235] rounded animate-pulse" />)}</div>
          ) : (
            <div className="space-y-2.5">
              {[
                { label: 'Paid', count: stats?.invoices?.counts?.paid || 0, amount: stats?.invoices?.amounts?.paid || 0, color: 'text-emerald-400' },
                { label: 'Outstanding', count: (stats?.invoices?.counts?.sent || 0), amount: stats?.invoices?.totalOutstanding || 0, color: 'text-blue-400' },
                { label: 'Overdue', count: stats?.invoices?.overdueCount || 0, amount: stats?.invoices?.amounts?.overdue || 0, color: 'text-red-400' },
                { label: 'Draft', count: stats?.invoices?.counts?.draft || 0, amount: stats?.invoices?.amounts?.draft || 0, color: 'text-slate-400' },
              ].map(({ label, count, amount, color }) => (
                <div key={label} className="flex items-center justify-between py-2 border-b border-[#1e2d45]/50 last:border-0">
                  <div className="flex items-center gap-2">
                    <div className={`w-1.5 h-1.5 rounded-full bg-current ${color}`} />
                    <span className="text-sm text-slate-300">{label}</span>
                    <span className="text-xs text-slate-600">({count})</span>
                  </div>
                  <span className={`text-sm font-medium ${color}`}>{formatCurrency(amount)}</span>
                </div>
              ))}
            </div>
          )}
          <Button variant="ghost" size="sm" className="w-full mt-3" onClick={() => navigate('/invoices')}>View All Invoices →</Button>
        </Card>

        {/* Low stock alerts */}
        <Card>
          <p className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <Package size={15} className="text-purple-400" /> Low Stock Alerts
            {stats?.lowStockCount > 0 && <Badge variant="danger" className="ml-auto">{stats.lowStockCount}</Badge>}
          </p>
          {loading ? (
            <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-10 bg-[#1a2235] rounded animate-pulse" />)}</div>
          ) : stats?.lowStockCount === 0 ? (
            <div className="text-center py-6">
              <p className="text-3xl mb-2">✅</p>
              <p className="text-sm text-slate-400">All stock levels are healthy</p>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-xs text-slate-500">{stats.lowStockCount} item(s) need restocking</p>
              <Button variant="warning" size="sm" className="w-full mt-2" onClick={() => navigate('/inventory?filter=lowStock')}>
                View Low Stock Items
              </Button>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
