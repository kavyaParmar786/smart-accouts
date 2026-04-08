// Monthly Revenue vs Expenses Bar Chart
import { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement,
  Title, Tooltip, Legend, Filler,
} from 'chart.js';
import { reportAPI } from '../../services/api';
import { Card } from '../ui/index.jsx';
import { formatCurrency } from '../../utils/helpers';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, Filler);

export default function RevenueChart({ businessId }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const year = new Date().getFullYear();

  useEffect(() => {
    if (!businessId) return;
    reportAPI.monthlyTrend({ businessId, year })
      .then(r => setData(r.data.data.months))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [businessId]);

  const chartData = {
    labels: data?.map(m => m.monthName) || [],
    datasets: [
      {
        label: 'Income',
        data: data?.map(m => m.income) || [],
        backgroundColor: 'rgba(16,185,129,0.7)',
        borderColor: '#10b981',
        borderWidth: 1,
        borderRadius: 6,
        borderSkipped: false,
      },
      {
        label: 'Expenses',
        data: data?.map(m => m.expenses) || [],
        backgroundColor: 'rgba(239,68,68,0.6)',
        borderColor: '#ef4444',
        borderWidth: 1,
        borderRadius: 6,
        borderSkipped: false,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: {
        position: 'top',
        align: 'end',
        labels: { color: '#94a3b8', usePointStyle: true, pointStyle: 'circle', boxWidth: 8, font: { size: 11 } },
      },
      tooltip: {
        backgroundColor: '#131929',
        borderColor: '#1e2d45',
        borderWidth: 1,
        titleColor: '#f1f5f9',
        bodyColor: '#94a3b8',
        padding: 12,
        callbacks: {
          label: ctx => ` ${ctx.dataset.label}: ${formatCurrency(ctx.raw)}`,
        },
      },
    },
    scales: {
      x: {
        grid: { color: 'rgba(30,45,69,0.5)', drawBorder: false },
        ticks: { color: '#475569', font: { size: 11 } },
      },
      y: {
        grid: { color: 'rgba(30,45,69,0.5)', drawBorder: false },
        ticks: {
          color: '#475569', font: { size: 11 },
          callback: (v) => '₹' + (v >= 1000 ? (v / 1000).toFixed(0) + 'k' : v),
        },
        beginAtZero: true,
      },
    },
  };

  return (
    <Card>
      <div className="flex items-center justify-between mb-5">
        <div>
          <p className="text-sm font-semibold text-white">Revenue Overview</p>
          <p className="text-xs text-slate-500 mt-0.5">Income vs Expenses · {year}</p>
        </div>
      </div>
      {loading ? (
        <div className="h-56 bg-[#1a2235] rounded-xl animate-pulse" />
      ) : (
        <div className="h-56">
          <Bar data={chartData} options={options} />
        </div>
      )}
    </Card>
  );
}
