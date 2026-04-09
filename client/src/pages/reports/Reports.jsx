import { useState, useEffect } from 'react';
import { Download, TrendingUp, TrendingDown, DollarSign, BarChart3 } from 'lucide-react';
import { reportAPI } from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import { Button, Card, StatCard, AlertBanner, Select, Input, PageLoader } from '../../components/ui/index.jsx';
import { formatCurrency, formatDate, downloadCSV } from '../../utils/helpers';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import toast from 'react-hot-toast';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend, Filler);

const CHART_DEFAULTS = {
  responsive: true, maintainAspectRatio: false,
  plugins: {
    legend: { labels: { color: '#94a3b8', usePointStyle: true, pointStyle: 'circle', boxWidth: 8, font: { size: 11 } } },
    tooltip: { backgroundColor: '#131929', borderColor: '#1e2d45', borderWidth: 1, titleColor: '#f1f5f9', bodyColor: '#94a3b8', padding: 12 },
  },
  scales: {
    x: { grid: { color: 'rgba(30,45,69,0.5)' }, ticks: { color: '#475569', font: { size: 11 } } },
    y: { grid: { color: 'rgba(30,45,69,0.5)' }, ticks: { color: '#475569', font: { size: 11 }, callback: v => '₹' + (v >= 1000 ? (v/1000).toFixed(0)+'k' : v) }, beginAtZero: true },
  },
};

const COLORS = ['#3b82f6','#10b981','#f59e0b','#ef4444','#8b5cf6','#06b6d4','#ec4899','#84cc16'];

export default function Reports() {
  const { getBusinessId } = useAuthStore();
  const businessId = getBusinessId();
  const [tab, setTab] = useState('pl');
  const [year, setYear] = useState(String(new Date().getFullYear()));
  const [dateRange, setDateRange] = useState({ startDate: '', endDate: '' });

  const [plData, setPlData] = useState(null);
  const [trendData, setTrendData] = useState(null);
  const [expBreakdown, setExpBreakdown] = useState(null);
  const [incBreakdown, setIncBreakdown] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!businessId) return;
    setLoading(true);
    const params = { businessId, year, ...Object.fromEntries(Object.entries(dateRange).filter(([,v]) => v)) };
    Promise.all([
      reportAPI.pl(params).then(r => setPlData(r.data.data)),
      reportAPI.monthlyTrend({ businessId, year }).then(r => setTrendData(r.data.data.months)),
      reportAPI.categoryBreakdown({ ...params, type: 'expense' }).then(r => setExpBreakdown(r.data.data)),
      reportAPI.categoryBreakdown({ ...params, type: 'income' }).then(r => setIncBreakdown(r.data.data)),
    ]).catch(() => {}).finally(() => setLoading(false));
  }, [businessId, year, dateRange.startDate, dateRange.endDate]);

  const handleExport = async () => {
    try {
      const res = await reportAPI.export({ businessId, year });
      const rows = res.data.data.transactions.map(t => ({
        Date: formatDate(t.date), Type: t.type, Category: t.category,
        Amount: t.amount, Description: t.description || '', Method: t.paymentMethod,
      }));
      downloadCSV(rows, `transactions-${year}`);
      toast.success(`Exported ${rows.length} records`);
    } catch {}
  };

  const trendChartData = {
    labels: trendData?.map(m => m.monthName) || [],
    datasets: [
      { label: 'Income', data: trendData?.map(m => m.income) || [], borderColor: '#10b981', backgroundColor: 'rgba(16,185,129,0.1)', fill: true, tension: 0.4, pointBackgroundColor: '#10b981', pointRadius: 4 },
      { label: 'Expenses', data: trendData?.map(m => m.expenses) || [], borderColor: '#ef4444', backgroundColor: 'rgba(239,68,68,0.1)', fill: true, tension: 0.4, pointBackgroundColor: '#ef4444', pointRadius: 4 },
      { label: 'Profit', data: trendData?.map(m => m.profit) || [], borderColor: '#3b82f6', backgroundColor: 'rgba(59,130,246,0.05)', fill: true, tension: 0.4, pointBackgroundColor: '#3b82f6', pointRadius: 4, borderDash: [5,3] },
    ],
  };

  const donutData = (breakdown) => ({
    labels: breakdown?.slice(0,8).map(d => d.category) || [],
    datasets: [{ data: breakdown?.slice(0,8).map(d => d.amount) || [], backgroundColor: COLORS.map(c => c+'bb'), borderColor: COLORS, borderWidth: 1.5, hoverOffset: 4 }],
  });

  const donutOpts = { responsive: true, maintainAspectRatio: false, cutout: '65%',
    plugins: { legend: { display: false }, tooltip: { backgroundColor: '#131929', borderColor: '#1e2d45', borderWidth: 1, titleColor: '#f1f5f9', bodyColor: '#94a3b8', padding: 10 } } };

  const years = Array.from({ length: 5 }, (_, i) => String(new Date().getFullYear() - i));

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div><h1 className="text-xl font-bold text-white">Reports & Analytics</h1><p className="text-sm text-slate-500 mt-0.5">Financial insights for smarter decisions</p></div>
        <div className="flex items-center gap-2">
          <Select value={year} onChange={e => setYear(e.target.value)} wrapperClass="w-28">
            {years.map(y => <option key={y} value={y}>{y}</option>)}
          </Select>
          <Input type="date" value={dateRange.startDate} onChange={e => setDateRange(d => ({ ...d, startDate: e.target.value }))} placeholder="From" />
          <Input type="date" value={dateRange.endDate} onChange={e => setDateRange(d => ({ ...d, endDate: e.target.value }))} placeholder="To" />
          <Button variant="secondary" size="sm" icon={<Download size={14} />} onClick={handleExport}>Export</Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-[#0f1420] border border-[#1e2d45] rounded-xl p-1 w-fit">
        {[{ id: 'pl', label: 'P & L' }, { id: 'trends', label: 'Monthly Trends' }, { id: 'breakdown', label: 'Breakdown' }].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${tab === t.id ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {loading ? <PageLoader /> : (
        <>
          {/* P&L Tab */}
          {tab === 'pl' && plData && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 stagger">
                <StatCard label="Total Income" color="green" value={formatCurrency(plData.income.total)} icon={<TrendingUp size={18} />} />
                <StatCard label="Total Expenses" color="red" value={formatCurrency(plData.expenses.total)} icon={<TrendingDown size={18} />} />
                <StatCard label="Net Profit" color={plData.netProfit >= 0 ? 'blue' : 'red'} value={formatCurrency(plData.netProfit)}
                  sublabel={`${plData.profitMargin}% margin`} icon={<DollarSign size={18} />} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Income breakdown */}
                <Card>
                  <p className="text-sm font-semibold text-white mb-4 flex items-center gap-2"><TrendingUp size={14} className="text-emerald-400" />Income Sources</p>
                  <div className="space-y-2.5">
                    {plData.income.breakdown.map((item, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <div className="flex items-center gap-2 flex-1">
                          <span className="text-xs text-slate-400 w-28 truncate">{item.category}</span>
                          <div className="flex-1 bg-[#1a2235] rounded-full h-1.5 max-w-32">
                            <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${(item.amount/plData.income.total*100).toFixed(0)}%` }} />
                          </div>
                        </div>
                        <span className="text-xs font-semibold text-emerald-400 ml-3">{formatCurrency(item.amount)}</span>
                      </div>
                    ))}
                    {!plData.income.breakdown.length && <p className="text-sm text-slate-500 text-center py-4">No income recorded</p>}
                  </div>
                </Card>

                {/* Expense breakdown */}
                <Card>
                  <p className="text-sm font-semibold text-white mb-4 flex items-center gap-2"><TrendingDown size={14} className="text-red-400" />Expense Categories</p>
                  <div className="space-y-2.5">
                    {plData.expenses.breakdown.map((item, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <div className="flex items-center gap-2 flex-1">
                          <span className="text-xs text-slate-400 w-28 truncate">{item.category}</span>
                          <div className="flex-1 bg-[#1a2235] rounded-full h-1.5 max-w-32">
                            <div className="bg-red-500 h-1.5 rounded-full" style={{ width: `${(item.amount/plData.expenses.total*100).toFixed(0)}%` }} />
                          </div>
                        </div>
                        <span className="text-xs font-semibold text-red-400 ml-3">{formatCurrency(item.amount)}</span>
                      </div>
                    ))}
                    {!plData.expenses.breakdown.length && <p className="text-sm text-slate-500 text-center py-4">No expenses recorded</p>}
                  </div>
                </Card>
              </div>
            </div>
          )}

          {/* Monthly Trends Tab */}
          {tab === 'trends' && (
            <div className="space-y-5">
              <Card>
                <p className="text-sm font-semibold text-white mb-5">Monthly Trends · {year}</p>
                <div className="h-72"><Line data={trendChartData} options={{ ...CHART_DEFAULTS, interaction: { mode: 'index', intersect: false } }} /></div>
              </Card>
              <Card>
                <p className="text-sm font-semibold text-white mb-4">Month-by-Month Summary</p>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead><tr className="border-b border-[#1e2d45]">
                      {['Month','Income','Expenses','Profit','Margin'].map(h => <th key={h} className="px-4 py-2.5 text-left text-slate-500 font-semibold">{h}</th>)}
                    </tr></thead>
                    <tbody>
                      {trendData?.map(m => {
                        const margin = m.income > 0 ? ((m.profit/m.income)*100).toFixed(1) : '0';
                        return (
                          <tr key={m.month} className="border-b border-[#1e2d45]/40 hover:bg-[#1a2235]/40">
                            <td className="px-4 py-2.5 text-slate-300 font-medium">{m.monthName}</td>
                            <td className="px-4 py-2.5 text-emerald-400">{formatCurrency(m.income)}</td>
                            <td className="px-4 py-2.5 text-red-400">{formatCurrency(m.expenses)}</td>
                            <td className={`px-4 py-2.5 font-semibold ${m.profit >= 0 ? 'text-blue-400' : 'text-red-400'}`}>{formatCurrency(m.profit)}</td>
                            <td className="px-4 py-2.5 text-slate-400">{margin}%</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          )}

          {/* Category Breakdown Tab */}
          {tab === 'breakdown' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {[{ data: expBreakdown, label: 'Expense Breakdown', color: '#ef4444' }, { data: incBreakdown, label: 'Income Breakdown', color: '#10b981' }].map(({ data, label, color }) => (
                <Card key={label}>
                  <p className="text-sm font-semibold text-white mb-4">{label}</p>
                  {data?.breakdown?.length ? (
                    <>
                      <div className="h-44 flex items-center justify-center mb-4">
                        <Doughnut data={donutData(data.breakdown)} options={donutOpts} />
                      </div>
                      <div className="space-y-2">
                        {data.breakdown.slice(0,6).map((d, i) => (
                          <div key={d.category} className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i] }} /><span className="text-slate-400 truncate max-w-[120px]">{d.category}</span></div>
                            <div className="flex items-center gap-2"><span className="text-slate-300">{formatCurrency(d.amount)}</span><span className="text-slate-600 w-8 text-right">{d.percentage}%</span></div>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <p className="text-sm text-slate-500 text-center py-8">No data available</p>
                  )}
                </Card>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
