// Dashboard Page - Main overview with stats, charts, AI insights
import { useState, useEffect, useCallback } from 'react';
import {
  TrendingUp, TrendingDown, DollarSign, FileText,
  Package, Lightbulb, RefreshCw, Calendar,
} from 'lucide-react';
import { reportAPI, transactionAPI } from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import { StatCard, Card, Badge, Button, PageLoader, EmptyState } from '../../components/ui';
import { MonthlyChart, ProfitBarChart, CategoryDoughnut } from '../../components/charts';
import { formatCurrency, formatDate } from '../../utils/helpers';

// Insight type → badge variant map
const INSIGHT_VARIANTS = { positive: 'success', warning: 'warning', alert: 'danger', info: 'info' };

export default function DashboardPage() {
  const getBusinessId = useAuthStore(s => s.getBusinessId);
  const businessId = getBusinessId();

  const [stats, setStats] = useState(null);
  const [monthlyData, setMonthlyData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [recentTx, setRecentTx] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chartsLoading, setChartsLoading] = useState(true);
  const [year, setYear] = useState(new Date().getFullYear());

  const loadDashboard = useCallback(async () => {
    if (!businessId) return;
    setLoading(true);
    try {
      const [dashRes, txRes] = await Promise.all([
        reportAPI.dashboard({ businessId }),
        transactionAPI.getAll({ businessId, limit: 8 }),
      ]);
      setStats(dashRes.data.data);
      setRecentTx(txRes.data.data || []);
    } catch {}
    setLoading(false);
  }, [businessId]);

  const loadCharts = useCallback(async () => {
    if (!businessId) return;
    setChartsLoading(true);
    try {
      const [trendRes, catRes] = await Promise.all([
        reportAPI.monthlyTrend({ businessId, year }),
        reportAPI.categoryBreakdown({ businessId, type: 'expense', year }),
      ]);
      setMonthlyData(trendRes.data.data.months || []);
      setCategoryData(catRes.data.data.breakdown || []);
    } catch {}
    setChartsLoading(false);
  }, [businessId, year]);

  useEffect(() => { loadDashboard(); }, [loadDashboard]);
  useEffect(() => { loadCharts(); }, [loadCharts]);

  if (!businessId) {
    return <EmptyState icon="🏢" title="No business found" description="Create a business to get started" />;
  }

  const cur = stats?.currentMonth;
  const changes = stats?.changes || {};
  const invoices = stats?.invoices || {};
  const insights = stats?.insights || [];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Dashboard</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {cur?.month || new Date().toLocaleString('default', { month: 'long' })} {year} overview
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={year}
            onChange={e => setYear(Number(e.target.value))}
            className="bg-[#131929] border border-[#1e2d45] text-slate-300 text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:border-blue-500"
          >
            {[2022, 2023, 2024, 2025].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          <Button variant="secondary" size="sm" icon={<RefreshCw size={13} />} onClick={() => { loadDashboard(); loadCharts(); }}>
            Refresh
          </Button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 stagger">
        <StatCard
          label="Total Income"
          value={formatCurrency(cur?.income)}
          icon={<TrendingUp size={18} />}
          color="green"
          change={changes.income}
          changeLabel="vs last month"
          loading={loading}
        />
        <StatCard
          label="Total Expenses"
          value={formatCurrency(cur?.expenses)}
          icon={<TrendingDown size={18} />}
          color="red"
          change={changes.expenses}
          changeLabel="vs last month"
          loading={loading}
        />
        <StatCard
          label="Net Profit"
          value={formatCurrency(cur?.profit)}
          icon={<DollarSign size={18} />}
          color={cur?.profit >= 0 ? 'blue' : 'red'}
          change={changes.profit}
          changeLabel="vs last month"
          loading={loading}
        />
        <StatCard
          label="Outstanding Invoices"
          value={formatCurrency(invoices.totalOutstanding)}
          icon={<FileText size={18} />}
          color="amber"
          sublabel={invoices.overdueCount > 0 ? `${invoices.overdueCount} overdue` : 'All up to date'}
          loading={loading}
        />
      </div>

      {/* AI Insights */}
      {insights.length > 0 && (
        <Card className="border-blue-500/20 bg-gradient-to-r from-blue-500/5 to-transparent">
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb size={15} className="text-blue-400" />
            <h3 className="text-sm font-semibold text-blue-300">AI Insights</h3>
            <Badge variant="info" className="text-[10px]">Smart Analysis</Badge>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {insights.map((ins, i) => (
              <div key={i} className={`flex items-start gap-2.5 p-3 rounded-xl border text-sm
                ${ins.type === 'positive' ? 'bg-emerald-500/5 border-emerald-500/15 text-emerald-300' : ''}
                ${ins.type === 'warning' ? 'bg-amber-500/5 border-amber-500/15 text-amber-300' : ''}
                ${ins.type === 'alert' ? 'bg-red-500/5 border-red-500/15 text-red-300' : ''}
                ${ins.type === 'info' ? 'bg-blue-500/5 border-blue-500/15 text-blue-300' : ''}
              `}>
                <span className="text-base flex-shrink-0">{ins.icon}</span>
                <span className="text-xs leading-relaxed">{ins.message}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Charts Row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <Card className="xl:col-span-2">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-sm font-semibold text-white">Revenue Overview</h3>
            <Badge variant="default">{year}</Badge>
          </div>
          <div className="h-64">
            <MonthlyChart data={monthlyData} loading={chartsLoading} />
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-sm font-semibold text-white">Expense Breakdown</h3>
          </div>
          <div className="h-64">
            <CategoryDoughnut data={categoryData} loading={chartsLoading} />
          </div>
        </Card>
      </div>

      {/* Profit Bar + Recent Transactions */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <Card>
          <h3 className="text-sm font-semibold text-white mb-5">Monthly Profit / Loss</h3>
          <div className="h-48">
            <ProfitBarChart data={monthlyData} loading={chartsLoading} />
          </div>
        </Card>

        <Card className="p-0">
          <div className="flex items-center justify-between px-5 pt-5 pb-3">
            <h3 className="text-sm font-semibold text-white">Recent Transactions</h3>
            <Button variant="ghost" size="sm" onClick={() => window.location.href = '/transactions'}>
              View all →
            </Button>
          </div>
          <div className="divide-y divide-[#1e2d45]">
            {loading ? Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 px-5 py-3">
                <div className="w-8 h-8 rounded-lg bg-[#1a2235] animate-pulse flex-shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3 bg-[#1a2235] rounded animate-pulse w-2/3" />
                  <div className="h-2.5 bg-[#1a2235] rounded animate-pulse w-1/3" />
                </div>
                <div className="h-4 bg-[#1a2235] rounded animate-pulse w-16" />
              </div>
            )) : recentTx.length === 0 ? (
              <div className="px-5 py-10 text-center text-sm text-slate-500">No transactions yet</div>
            ) : recentTx.map(tx => (
              <div key={tx._id} className="flex items-center gap-3 px-5 py-3 hover:bg-[#1a2235]/50 transition-colors">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-xs
                  ${tx.type === 'income' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400'}`}>
                  {tx.type === 'income' ? '↑' : '↓'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-slate-200 truncate">{tx.description || tx.category}</p>
                  <p className="text-[10px] text-slate-500">{tx.category} · {formatDate(tx.date)}</p>
                </div>
                <span className={`text-xs font-semibold ${tx.type === 'income' ? 'text-emerald-400' : 'text-red-400'}`}>
                  {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
