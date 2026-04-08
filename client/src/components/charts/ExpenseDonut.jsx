// Expense Breakdown Donut Chart
import { useEffect, useState } from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { reportAPI } from '../../services/api';
import { Card } from '../ui/index.jsx';
import { formatCurrency } from '../../utils/helpers';

ChartJS.register(ArcElement, Tooltip, Legend);

const COLORS = [
  '#3b82f6','#10b981','#f59e0b','#ef4444','#8b5cf6',
  '#06b6d4','#ec4899','#84cc16','#f97316','#6366f1',
];

export default function ExpenseDonut({ businessId }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!businessId) return;
    reportAPI.categoryBreakdown({ businessId, type: 'expense' })
      .then(r => setData(r.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [businessId]);

  const top = data?.breakdown?.slice(0, 8) || [];

  const chartData = {
    labels: top.map(d => d.category),
    datasets: [{
      data: top.map(d => d.amount),
      backgroundColor: COLORS.map(c => c + 'cc'),
      borderColor: COLORS,
      borderWidth: 1.5,
      hoverOffset: 6,
    }],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '68%',
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#131929',
        borderColor: '#1e2d45',
        borderWidth: 1,
        titleColor: '#f1f5f9',
        bodyColor: '#94a3b8',
        padding: 10,
        callbacks: {
          label: ctx => ` ${formatCurrency(ctx.raw)} (${data?.breakdown[ctx.dataIndex]?.percentage}%)`,
        },
      },
    },
  };

  return (
    <Card className="h-full">
      <div className="mb-4">
        <p className="text-sm font-semibold text-white">Expense Breakdown</p>
        <p className="text-xs text-slate-500 mt-0.5">By category · This year</p>
      </div>
      {loading ? (
        <div className="h-36 bg-[#1a2235] rounded-xl animate-pulse" />
      ) : top.length === 0 ? (
        <div className="h-36 flex items-center justify-center text-slate-500 text-sm">No expense data</div>
      ) : (
        <>
          <div className="h-36 flex items-center justify-center">
            <Doughnut data={chartData} options={options} />
          </div>
          <div className="mt-4 space-y-1.5 max-h-36 overflow-y-auto">
            {top.map((d, i) => (
              <div key={d.category} className="flex items-center justify-between text-xs py-0.5">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[i] }} />
                  <span className="text-slate-400 truncate max-w-[100px]">{d.category}</span>
                </div>
                <div className="flex items-center gap-2 text-right">
                  <span className="text-slate-300 font-medium">{formatCurrency(d.amount)}</span>
                  <span className="text-slate-600 w-8">{d.percentage}%</span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </Card>
  );
}
