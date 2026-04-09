import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TrendingUp, TrendingDown, DollarSign, FileText,
  Package, Zap, Plus, BarChart3,
} from 'lucide-react';
import { reportAPI } from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import {
  StatCard, Card, Badge, Button, AlertBanner, PageLoader,
} from '../../components/ui/index.jsx';
import { formatCurrency } from '../../utils/helpers';
import RevenueChart from '../../components/charts/RevenueChart.jsx';
import ExpenseDonut from '../../components/charts/ExpenseDonut.jsx';

/* Inline card-section header — no external dep needed */
function SectionHeader({ title, subtitle, action }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
      <div>
        <p style={{ fontSize: 13, fontWeight: 600, color: '#e2e8f0' }}>{title}</p>
        {subtitle && <p style={{ fontSize: 11, color: '#475569', marginTop: 2 }}>{subtitle}</p>}
      </div>
      {action && <div style={{ display: 'flex', alignItems: 'center' }}>{action}</div>}
    </div>
  );
}

const QUICK_ACTIONS = [
  { label: 'Record Income',  sub: 'Log a sale',          emoji: '💚', to: '/transactions', bg: 'rgba(16,185,129,0.1)',  color: '#34d399' },
  { label: 'Record Expense', sub: 'Add a cost',           emoji: '🔴', to: '/transactions', bg: 'rgba(239,68,68,0.1)',   color: '#f87171' },
  { label: 'Create Invoice', sub: 'Bill customers',       emoji: '🧾', to: '/invoices',     bg: 'rgba(59,130,246,0.1)',  color: '#60a5fa' },
  { label: 'Add Product',    sub: 'Update inventory',     emoji: '📦', to: '/inventory',    bg: 'rgba(139,92,246,0.1)', color: '#a78bfa' },
  { label: 'View Ledger',    sub: 'Running balance',      emoji: '📒', to: '/ledger',       bg: 'rgba(245,158,11,0.1)', color: '#fbbf24' },
  { label: 'Run Report',     sub: 'P&L and analytics',    emoji: '📊', to: '/reports',      bg: 'rgba(99,102,241,0.1)', color: '#818cf8' },
];

const INV_ROWS = [
  { label: 'Paid',        key: 'paid',    amt: r => r?.amounts?.paid    || 0,                color: '#34d399', dot: '#10b981' },
  { label: 'Outstanding', key: 'sent',    amt: r => r?.totalOutstanding || 0,                color: '#60a5fa', dot: '#3b82f6' },
  { label: 'Overdue',     key: 'overdue', amt: r => r?.amounts?.overdue || 0,                color: '#f87171', dot: '#ef4444' },
  { label: 'Draft',       key: 'draft',   amt: r => r?.amounts?.draft   || 0,                color: '#475569', dot: '#334155' },
];

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
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', padding: 24 }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: 40, marginBottom: 12 }}>🏢</p>
          <p style={{ fontSize: 15, fontWeight: 600, color: '#e2e8f0', marginBottom: 6 }}>No business selected</p>
          <p style={{ fontSize: 13, color: '#475569', marginBottom: 20 }}>Create or switch to a business to get started</p>
          <Button onClick={() => navigate('/settings')}>Go to Settings</Button>
        </div>
      </div>
    );
  }

  const cur     = stats?.currentMonth;
  const changes = stats?.changes;
  const inv     = stats?.invoices;

  return (
    <div style={{ padding: '24px', maxWidth: 1400, margin: '0 auto' }}>

      {/* ── Header ───────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: '#e2e8f0', margin: 0 }}>Dashboard</h1>
          <p style={{ fontSize: 13, color: '#475569', marginTop: 4 }}>
            {activeBusiness?.name || 'Business'} &middot; {cur?.month || new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Button variant="secondary" size="sm" icon={<FileText size={13} />} onClick={() => navigate('/invoices')}>New Invoice</Button>
          <Button size="sm" icon={<Plus size={13} />} onClick={() => navigate('/transactions')}>Add Transaction</Button>
        </div>
      </div>

      {/* ── AI Insights ──────────────────────────────────── */}
      {stats?.insights?.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 10, marginBottom: 24 }}>
          {stats.insights.map((ins, i) => (
            <AlertBanner key={i} type={ins.type} icon={ins.icon} message={ins.message} />
          ))}
        </div>
      )}

      {/* ── Stat cards ───────────────────────────────────── */}
      <div className="stagger" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
        <StatCard label="Total Income"    color="green"  value={loading ? '—' : formatCurrency(cur?.income)}   change={changes?.income}   changeLabel="vs last month" icon={<TrendingUp  size={17} />} loading={loading} />
        <StatCard label="Total Expenses"  color="red"    value={loading ? '—' : formatCurrency(cur?.expenses)} change={changes?.expenses} changeLabel="vs last month" icon={<TrendingDown size={17} />} loading={loading} />
        <StatCard label="Net Profit"      color="blue"   value={loading ? '—' : formatCurrency(cur?.profit)}   change={changes?.profit}   changeLabel="vs last month" icon={<DollarSign  size={17} />} loading={loading} />
        <StatCard label="Outstanding"     color="amber"  value={loading ? '—' : formatCurrency(inv?.totalOutstanding)}
          sublabel={inv?.overdueCount ? `${inv.overdueCount} overdue` : 'None overdue'}
          icon={<FileText size={17} />} loading={loading} />
      </div>

      {/* ── Charts ───────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20, marginBottom: 24 }}>
        <div style={{ minWidth: 0 }}><RevenueChart businessId={businessId} /></div>
        <div style={{ minWidth: 0 }}><ExpenseDonut businessId={businessId} /></div>
      </div>

      {/* ── Bottom grid ──────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>

        {/* Quick actions */}
        <Card>
          <SectionHeader title="Quick Actions" subtitle="Jump to common tasks" action={<Zap size={14} style={{ color: '#fbbf24' }} />} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {QUICK_ACTIONS.map(({ label, sub, emoji, to, bg, color }) => (
              <button
                key={label}
                onClick={() => navigate(to)}
                style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 12, background: 'transparent', border: '1px solid transparent', cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s', width: '100%' }}
                onMouseEnter={e => { e.currentTarget.style.background = '#0f1826'; e.currentTarget.style.borderColor = '#1a2540'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'transparent'; }}
              >
                <div style={{ width: 32, height: 32, borderRadius: 10, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, flexShrink: 0 }}>
                  {emoji}
                </div>
                <div style={{ minWidth: 0 }}>
                  <p style={{ fontSize: 11, fontWeight: 600, color: '#e2e8f0', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{label}</p>
                  <p style={{ fontSize: 10, color: '#475569', margin: 0, marginTop: 1 }}>{sub}</p>
                </div>
              </button>
            ))}
          </div>
        </Card>

        {/* Invoice summary */}
        <Card>
          <SectionHeader title="Invoice Summary" action={<FileText size={14} style={{ color: '#60a5fa' }} />} />
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[1,2,3,4].map(i => <div key={i} className="skeleton" style={{ height: 36, borderRadius: 10 }} />)}
            </div>
          ) : (
            <div>
              {INV_ROWS.map(({ label, key, amt, color, dot }) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderBottom: '1px solid rgba(26,37,64,0.5)' }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: dot, flexShrink: 0 }} />
                  <span style={{ fontSize: 12, color: '#94a3b8', flex: 1 }}>{label}</span>
                  <span style={{ fontSize: 10, color: '#334155' }}>×{inv?.counts?.[key] || 0}</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color, fontVariantNumeric: 'tabular-nums' }}>{formatCurrency(amt(inv))}</span>
                </div>
              ))}
            </div>
          )}
          <Button
            variant="ghost" size="sm"
            onClick={() => navigate('/invoices')}
            style={{ width: '100%', marginTop: 12, color: '#475569' }}
          >
            View All Invoices →
          </Button>
        </Card>

        {/* Low stock */}
        <Card>
          <SectionHeader
            title="Inventory Alerts"
            action={
              loading ? null :
              stats?.lowStockCount > 0
                ? <Badge variant="danger">{stats.lowStockCount} low</Badge>
                : <Badge variant="success">Healthy</Badge>
            }
          />
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 40, borderRadius: 10 }} />)}
            </div>
          ) : stats?.lowStockCount === 0 ? (
            <div style={{ textAlign: 'center', padding: '24px 0' }}>
              <p style={{ fontSize: 32, marginBottom: 8 }}>✅</p>
              <p style={{ fontSize: 12, color: '#475569' }}>All stock levels are healthy</p>
            </div>
          ) : (
            <div>
              <p style={{ fontSize: 12, color: '#475569', marginBottom: 16 }}>
                {stats.lowStockCount} item(s) need restocking soon
              </p>
              <Button
                size="sm" variant="warning"
                onClick={() => navigate('/inventory')}
                style={{ width: '100%' }}
              >
                <Package size={13} /> View Low Stock Items
              </Button>
            </div>
          )}
        </Card>

      </div>
    </div>
  );
}
