// Reports & Analytics Page - P&L, monthly trends, category breakdown, export
import { useState, useEffect, useCallback } from 'react';
import { BarChart3, TrendingUp, TrendingDown, Download, FileText, RefreshCw } from 'lucide-react';
import { reportAPI, transactionAPI } from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import { Button, Card, Badge, StatCard } from '../../components/ui';
import { MonthlyChart, ProfitBarChart, CategoryDoughnut, CategoryBarChart } from '../../components/charts';
import { formatCurrency, downloadCSV, formatDate } from '../../utils/helpers';
import toast from 'react-hot-toast';

const TABS = ['Overview', 'Profit & Loss', 'Category Analysis', 'Export'];

export default function ReportsPage() {
  const getBusinessId = useAuthStore(s => s.getBusinessId);
  const businessId = getBusinessId();

  const [tab, setTab] = useState('Overview');
  const [year, setYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(false);

  const [monthlyData, setMonthlyData] = useState([]);
  const [plData, setPlData] = useState(null);
  const [expenseBreakdown, setExpenseBreakdown] = useState([]);
  const [incomeBreakdown, setIncomeBreakdown] = useState([]);

  const load = useCallback(async () => {
    if (!businessId) return;
    setLoading(true);
    try {
      const [trendRes, plRes, expRes, incRes] = await Promise.all([
        reportAPI.monthlyTrend({ businessId, year }),
        reportAPI.pl({ businessId, year }),
        reportAPI.categoryBreakdown({ businessId, type: 'expense', year }),
        reportAPI.categoryBreakdown({ businessId, type: 'income', year }),
      ]);
      setMonthlyData(trendRes.data.data.months || []);
      setPlData(plRes.data.data);
      setExpenseBreakdown(expRes.data.data.breakdown || []);
      setIncomeBreakdown(incRes.data.data.breakdown || []);
    } catch {}
    setLoading(false);
  }, [businessId, year]);

  useEffect(() => { load(); }, [load]);

  const handleExport = async (type) => {
    try {
      const res = await reportAPI.export({ businessId, year, ...(type !== 'all' && { type }) });
      const txs = res.data.data.transactions || [];
      const rows = txs.map(tx => ({
        Date: formatDate(tx.date), Type: tx.type, Amount: tx.amount,
        Category: tx.category, Description: tx.description || '',
        Method: tx.paymentMethod || '', Reference: tx.reference || '',
      }));
      downloadCSV(rows, `smartaccounts-${type}-${year}`);
      toast.success(`Exported ${rows.length} records`);
    } catch {}
  };

  const totalIncome = monthlyData.reduce((s, m) => s + m.income, 0);
  const totalExpenses = monthlyData.reduce((s, m) => s + m.expenses, 0);
  const netProfit = totalIncome - totalExpenses;
  const profitMargin = totalIncome > 0 ? ((netProfit / totalIncome) * 100).toFixed(1) : 0;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Reports & Analytics</h1>
          <p className="text-sm text-slate-500 mt-0.5">Financial insights for {year}</p>
        </div>
        <div className="flex items-center gap-2">
          <select value={year} onChange={e => setYear(Number(e.target.value))}
            className="bg-[#131929] border border-[#1e2d45] text-slate-300 text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:border-blue-500">
            {[2022, 2023, 2024, 2025].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          <Button variant="secondary" size="sm" icon={<RefreshCw size={13} />} onClick={load}>Refresh</Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-[#0f1420] border border-[#1e2d45] rounded-xl p-1 w-fit">
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors
              ${tab === t ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}>
            {t}
          </button>
        ))}
      </div>

      {/* ── OVERVIEW TAB ────────────────────────────────────────────────────── */}
      {tab === 'Overview' && (
        <div className="space-y-5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard label="Total Income" value={formatCurrency(totalIncome)} icon={<TrendingUp size={16}/>} color="green" loading={loading} />
            <StatCard label="Total Expenses" value={formatCurrency(totalExpenses)} icon={<TrendingDown size={16}/>} color="red" loading={loading} />
            <StatCard label="Net Profit" value={formatCurrency(netProfit)} icon={<BarChart3 size={16}/>} color={netProfit >= 0 ? 'blue' : 'red'} loading={loading} />
            <StatCard label="Profit Margin" value={`${profitMargin}%`} icon={<BarChart3 size={16}/>} color="purple" loading={loading} />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            <Card>
              <h3 className="text-sm font-semibold text-white mb-4">Monthly Revenue vs Expenses</h3>
              <div className="h-64"><MonthlyChart data={monthlyData} loading={loading} /></div>
            </Card>
            <Card>
              <h3 className="text-sm font-semibold text-white mb-4">Monthly Profit / Loss</h3>
              <div className="h-64"><ProfitBarChart data={monthlyData} loading={loading} /></div>
            </Card>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            <Card>
              <h3 className="text-sm font-semibold text-white mb-4">Expense Breakdown</h3>
              <div className="h-56"><CategoryDoughnut data={expenseBreakdown} loading={loading} /></div>
            </Card>
            <Card>
              <h3 className="text-sm font-semibold text-white mb-4">Income Breakdown</h3>
              <div className="h-56"><CategoryDoughnut data={incomeBreakdown} loading={loading} /></div>
            </Card>
          </div>
        </div>
      )}

      {/* ── PROFIT & LOSS TAB ────────────────────────────────────────────────── */}
      {tab === 'Profit & Loss' && (
        <div className="space-y-4">
          {plData ? (
            <>
              {/* Summary */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard label="Gross Income" value={formatCurrency(plData.income?.total)} icon={<TrendingUp size={16}/>} color="green" />
                <StatCard label="Total Expenses" value={formatCurrency(plData.expenses?.total)} icon={<TrendingDown size={16}/>} color="red" />
                <StatCard label="Net Profit" value={formatCurrency(plData.netProfit)} icon={<BarChart3 size={16}/>} color={plData.netProfit >= 0 ? 'blue' : 'red'} />
                <StatCard label="Margin" value={`${plData.profitMargin}%`} icon={<BarChart3 size={16}/>} color="purple" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Income breakdown */}
                <Card className="p-0">
                  <div className="px-5 py-4 border-b border-[#1e2d45] flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-white">Income Sources</h3>
                    <Badge variant="success">{formatCurrency(plData.income?.total)}</Badge>
                  </div>
                  <div className="divide-y divide-[#1e2d45]/50">
                    {(plData.income?.breakdown || []).map((item, i) => (
                      <div key={i} className="flex items-center justify-between px-5 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                          <span className="text-sm text-slate-300">{item.category}</span>
                          <span className="text-xs text-slate-500">({item.count} tx)</span>
                        </div>
                        <span className="text-sm font-semibold text-emerald-400">{formatCurrency(item.amount)}</span>
                      </div>
                    ))}
                    {!plData.income?.breakdown?.length && (
                      <div className="px-5 py-8 text-center text-sm text-slate-500">No income recorded</div>
                    )}
                  </div>
                </Card>

                {/* Expense breakdown */}
                <Card className="p-0">
                  <div className="px-5 py-4 border-b border-[#1e2d45] flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-white">Expense Categories</h3>
                    <Badge variant="danger">{formatCurrency(plData.expenses?.total)}</Badge>
                  </div>
                  <div className="divide-y divide-[#1e2d45]/50">
                    {(plData.expenses?.breakdown || []).map((item, i) => (
                      <div key={i} className="flex items-center justify-between px-5 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-red-400" />
                          <span className="text-sm text-slate-300">{item.category}</span>
                          <span className="text-xs text-slate-500">({item.count} tx)</span>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-semibold text-red-400">{formatCurrency(item.amount)}</span>
                          <p className="text-[10px] text-slate-500">
                            {plData.expenses?.total > 0 ? ((item.amount / plData.expenses.total) * 100).toFixed(1) : 0}%
                          </p>
                        </div>
                      </div>
                    ))}
                    {!plData.expenses?.breakdown?.length && (
                      <div className="px-5 py-8 text-center text-sm text-slate-500">No expenses recorded</div>
                    )}
                  </div>
                </Card>
              </div>

              {/* P&L Statement */}
              <Card>
                <h3 className="text-sm font-semibold text-white mb-4">P&L Statement — {year}</h3>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between py-2 border-b border-[#1e2d45] font-semibold">
                    <span className="text-slate-300">Gross Income</span>
                    <span className="text-emerald-400">{formatCurrency(plData.income?.total)}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-[#1e2d45] font-semibold">
                    <span className="text-slate-300">Total Expenses</span>
                    <span className="text-red-400">({formatCurrency(plData.expenses?.total)})</span>
                  </div>
                  <div className={`flex justify-between py-3 font-bold text-base ${plData.netProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    <span>Net {plData.netProfit >= 0 ? 'Profit' : 'Loss'}</span>
                    <span>{formatCurrency(Math.abs(plData.netProfit))}</span>
                  </div>
                  <div className="flex justify-between py-2 text-slate-400">
                    <span>Profit Margin</span>
                    <span>{plData.profitMargin}%</span>
                  </div>
                </div>
              </Card>
            </>
          ) : (
            <div className="py-16 text-center text-slate-500">Loading P&L data...</div>
          )}
        </div>
      )}

      {/* ── CATEGORY ANALYSIS TAB ─────────────────────────────────────────────── */}
      {tab === 'Category Analysis' && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          <Card>
            <h3 className="text-sm font-semibold text-white mb-4">Top Expense Categories</h3>
            <div className="h-72"><CategoryBarChart data={expenseBreakdown} type="expense" loading={loading} /></div>
          </Card>
          <Card>
            <h3 className="text-sm font-semibold text-white mb-4">Top Income Sources</h3>
            <div className="h-72"><CategoryBarChart data={incomeBreakdown} type="income" loading={loading} /></div>
          </Card>
          <Card>
            <h3 className="text-sm font-semibold text-white mb-4">Expense Distribution</h3>
            <div className="h-64"><CategoryDoughnut data={expenseBreakdown} loading={loading} /></div>
          </Card>
          <Card>
            <h3 className="text-sm font-semibold text-white mb-4">Income Distribution</h3>
            <div className="h-64"><CategoryDoughnut data={incomeBreakdown} loading={loading} /></div>
          </Card>
        </div>
      )}

      {/* ── EXPORT TAB ──────────────────────────────────────────────────────────── */}
      {tab === 'Export' && (
        <div className="space-y-4">
          <Card>
            <h3 className="text-sm font-semibold text-white mb-1">Export Data</h3>
            <p className="text-xs text-slate-500 mb-5">Download your financial data as CSV files for {year}</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { label: 'All Transactions', type: 'all', desc: 'Every income and expense entry', icon: '📊', color: 'blue' },
                { label: 'Income Only', type: 'income', desc: 'All income transactions', icon: '📈', color: 'green' },
                { label: 'Expenses Only', type: 'expense', desc: 'All expense transactions', icon: '📉', color: 'red' },
              ].map(({ label, type, desc, icon, color }) => (
                <div key={type} className={`p-4 bg-[#0f1420] border border-[#1e2d45] rounded-xl hover:border-${color}-500/30 transition-colors`}>
                  <span className="text-2xl mb-2 block">{icon}</span>
                  <h4 className="text-sm font-semibold text-white mb-0.5">{label}</h4>
                  <p className="text-xs text-slate-500 mb-4">{desc}</p>
                  <Button variant="secondary" size="sm" icon={<Download size={12} />} className="w-full" onClick={() => handleExport(type)}>
                    Download CSV
                  </Button>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <h3 className="text-sm font-semibold text-white mb-4">Monthly Summary {year}</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#1e2d45]">
                    {['Month', 'Income', 'Expenses', 'Net Profit', 'Margin'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {monthlyData.map((m, i) => {
                    const margin = m.income > 0 ? ((m.profit / m.income) * 100).toFixed(1) : 0;
                    return (
                      <tr key={i} className="border-b border-[#1e2d45]/50 hover:bg-[#1a2235]/40">
                        <td className="px-4 py-3 font-medium text-slate-200">{m.monthName}</td>
                        <td className="px-4 py-3 text-emerald-400">{formatCurrency(m.income)}</td>
                        <td className="px-4 py-3 text-red-400">{formatCurrency(m.expenses)}</td>
                        <td className={`px-4 py-3 font-semibold ${m.profit >= 0 ? 'text-blue-400' : 'text-red-400'}`}>{formatCurrency(m.profit)}</td>
                        <td className="px-4 py-3">
                          <span className={`text-xs font-medium ${parseFloat(margin) >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>{margin}%</span>
                        </td>
                      </tr>
                    );
                  })}
                  {/* Totals row */}
                  <tr className="border-t-2 border-[#2a3d5a] bg-[#1a2235]/50 font-bold">
                    <td className="px-4 py-3 text-white">Total</td>
                    <td className="px-4 py-3 text-emerald-400">{formatCurrency(totalIncome)}</td>
                    <td className="px-4 py-3 text-red-400">{formatCurrency(totalExpenses)}</td>
                    <td className={`px-4 py-3 ${netProfit >= 0 ? 'text-blue-400' : 'text-red-400'}`}>{formatCurrency(netProfit)}</td>
                    <td className="px-4 py-3 text-slate-300">{profitMargin}%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
