// Ledger Page - Running balance view of all transactions
import { useState, useEffect, useCallback } from 'react';
import { Download, Filter, BookOpen } from 'lucide-react';
import { transactionAPI } from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import { Card, Badge, Table, Pagination, Select, Input, Button, StatCard } from '../../components/ui/index.jsx';
import { formatCurrency, formatDate, downloadCSV } from '../../utils/helpers';
import toast from 'react-hot-toast';

export default function Ledger() {
  const { getBusinessId } = useAuthStore();
  const businessId = getBusinessId();
  const [transactions, setTransactions] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0, limit: 50 });
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    type: '', startDate: '', endDate: '',
    year: String(new Date().getFullYear()),
  });
  const [totals, setTotals] = useState({ income: 0, expenses: 0 });

  const fetchData = useCallback(async (page = 1) => {
    if (!businessId) return;
    setLoading(true);
    try {
      const params = {
        businessId, page, limit: 50,
        ...Object.fromEntries(Object.entries(filters).filter(([k, v]) => v && k !== 'year')),
      };
      if (!params.startDate && !params.endDate) {
        params.startDate = `${filters.year}-01-01`;
        params.endDate   = `${filters.year}-12-31`;
      }
      const res = await transactionAPI.getAll(params);
      const txns = res.data.data;
      setTransactions(txns);
      setPagination(res.data.pagination);

      // compute totals from current page (full totals need summary endpoint)
      const inc = txns.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
      const exp = txns.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
      setTotals({ income: inc, expenses: exp });
    } catch {} finally { setLoading(false); }
  }, [businessId, filters]);

  useEffect(() => { fetchData(1); }, [fetchData]);

  // Build running balance rows (newest first → reverse for balance calc)
  const withBalance = (() => {
    const sorted = [...transactions].sort((a, b) => new Date(a.date) - new Date(b.date));
    let running = 0;
    const mapped = sorted.map(t => {
      running += t.type === 'income' ? t.amount : -t.amount;
      return { ...t, runningBalance: running };
    });
    return mapped.reverse(); // show newest first
  })();

  const handleExport = () => {
    const rows = withBalance.map(t => ({
      Date: formatDate(t.date),
      Description: t.description || t.category,
      Category: t.category,
      Type: t.type,
      Debit: t.type === 'expense' ? t.amount : '',
      Credit: t.type === 'income' ? t.amount : '',
      Balance: t.runningBalance,
      Method: t.paymentMethod,
      Reference: t.reference || '',
    }));
    downloadCSV(rows, `ledger-${filters.year}`);
    toast.success('Ledger exported');
  };

  const years = Array.from({ length: 5 }, (_, i) => String(new Date().getFullYear() - i));

  const columns = [
    {
      key: 'date', label: 'Date',
      render: v => <span className="text-xs text-slate-400 font-mono whitespace-nowrap">{formatDate(v)}</span>,
    },
    {
      key: 'description', label: 'Description',
      render: (v, row) => (
        <div>
          <p className="text-sm text-slate-200">{v || row.category}</p>
          <p className="text-xs text-slate-500">{row.category} · {row.paymentMethod}</p>
        </div>
      ),
    },
    { key: 'reference', label: 'Ref', render: v => <span className="text-xs font-mono text-slate-500">{v || '—'}</span> },
    {
      key: 'amount', label: 'Debit (Out)',
      className: 'text-right',
      render: (v, row) => row.type === 'expense'
        ? <span className="text-sm font-semibold text-red-400">−{formatCurrency(v)}</span>
        : <span className="text-slate-700">—</span>,
    },
    {
      key: 'amount', label: 'Credit (In)',
      className: 'text-right',
      render: (v, row) => row.type === 'income'
        ? <span className="text-sm font-semibold text-emerald-400">+{formatCurrency(v)}</span>
        : <span className="text-slate-700">—</span>,
    },
    {
      key: 'runningBalance', label: 'Balance',
      className: 'text-right',
      render: v => (
        <span className={`text-sm font-bold font-mono ${v >= 0 ? 'text-blue-400' : 'text-red-400'}`}>
          {formatCurrency(Math.abs(v))}
          {v < 0 && <span className="text-xs ml-1 text-red-500">(Dr)</span>}
        </span>
      ),
    },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-indigo-500/15">
            <BookOpen size={18} className="text-indigo-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">General Ledger</h1>
            <p className="text-sm text-slate-500 mt-0.5">Running balance of all transactions</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" icon={<Download size={14} />} onClick={handleExport}>
            Export Ledger
          </Button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4 stagger">
        <StatCard label="Total Credits (Income)" color="green"
          value={formatCurrency(totals.income)} icon={<BookOpen size={18} />} loading={loading} />
        <StatCard label="Total Debits (Expenses)" color="red"
          value={formatCurrency(totals.expenses)} icon={<BookOpen size={18} />} loading={loading} />
        <StatCard label="Net Balance" color={totals.income - totals.expenses >= 0 ? 'blue' : 'red'}
          value={formatCurrency(Math.abs(totals.income - totals.expenses))}
          sublabel={totals.income - totals.expenses < 0 ? 'Net Debit' : 'Net Credit'}
          icon={<BookOpen size={18} />} loading={loading} />
      </div>

      {/* Filters */}
      <Card>
        <div className="flex flex-wrap items-end gap-3">
          <Select label="Year" value={filters.year} onChange={e => setFilters(f => ({ ...f, year: e.target.value }))} wrapperClass="w-28">
            {years.map(y => <option key={y} value={y}>{y}</option>)}
          </Select>
          <Select label="Type" value={filters.type} onChange={e => setFilters(f => ({ ...f, type: e.target.value }))} wrapperClass="w-32">
            <option value="">All</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </Select>
          <Input label="From Date" type="date" value={filters.startDate}
            onChange={e => setFilters(f => ({ ...f, startDate: e.target.value }))} />
          <Input label="To Date" type="date" value={filters.endDate}
            onChange={e => setFilters(f => ({ ...f, endDate: e.target.value }))} />
          <Button variant="secondary" size="md"
            onClick={() => setFilters({ type: '', startDate: '', endDate: '', year: String(new Date().getFullYear()) })}>
            Reset
          </Button>
        </div>
      </Card>

      {/* Ledger table */}
      <Card className="p-0 overflow-hidden">
        {/* Column headers with accounting style */}
        <div className="px-4 py-2.5 border-b border-[#1e2d45] bg-[#0f1420] flex items-center justify-between">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Showing {pagination.total} entries
          </p>
          <p className="text-xs text-slate-600">All amounts in ₹ INR</p>
        </div>
        <Table
          columns={columns}
          data={withBalance}
          loading={loading}
          emptyState="No transactions found for this period."
          emptyIcon="📒"
        />
        <Pagination
          page={pagination.page}
          pages={pagination.pages}
          total={pagination.total}
          limit={pagination.limit}
          onPage={fetchData}
        />
      </Card>
    </div>
  );
}
