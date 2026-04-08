import { useState, useEffect, useCallback } from 'react';
import { Plus, Filter, Download, Trash2, Edit2, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';
import { transactionAPI, categoryAPI } from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import { Button, Card, Badge, Table, Pagination, Modal, Input, Select, EmptyState } from '../../components/ui/index.jsx';
import { formatCurrency, formatDate, downloadCSV, STATUS_COLORS } from '../../utils/helpers';
import toast from 'react-hot-toast';

const PAYMENT_METHODS = ['cash', 'bank', 'upi', 'card', 'other'];

function TransactionForm({ onSave, onClose, businessId, editData }) {
  const [form, setForm] = useState({
    type: editData?.type || 'income',
    amount: editData?.amount || '',
    category: editData?.category || '',
    description: editData?.description || '',
    date: editData?.date ? editData.date.split('T')[0] : new Date().toISOString().split('T')[0],
    paymentMethod: editData?.paymentMethod || 'cash',
    reference: editData?.reference || '',
    businessId,
  });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    categoryAPI.getAll({ businessId, type: form.type })
      .then(r => setCategories(r.data.data.categories))
      .catch(() => {});
  }, [businessId, form.type]);

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.amount || !form.category) return toast.error('Amount and category are required');
    setLoading(true);
    try {
      if (editData?._id) await transactionAPI.update(editData._id, form);
      else await transactionAPI.create(form);
      toast.success(editData ? 'Transaction updated!' : 'Transaction recorded!');
      onSave();
    } catch {} finally { setLoading(false); }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex gap-2">
        {['income', 'expense'].map(t => (
          <button key={t} type="button"
            onClick={() => setForm(f => ({ ...f, type: t, category: '' }))}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium border transition-all ${
              form.type === t
                ? t === 'income' ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400'
                                 : 'bg-red-500/15 border-red-500/40 text-red-400'
                : 'bg-transparent border-[#1e2d45] text-slate-500 hover:border-[#2a3d5a]'}`}>
            {t === 'income' ? <ArrowUpCircle size={15} /> : <ArrowDownCircle size={15} />}
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Input label="Amount (₹)" type="number" step="0.01" placeholder="0.00" value={form.amount} onChange={set('amount')} required />
        <Input label="Date" type="date" value={form.date} onChange={set('date')} required />
      </div>
      <Select label="Category" value={form.category} onChange={set('category')}>
        <option value="">Select category...</option>
        {categories.map(c => <option key={c._id} value={c.name}>{c.icon} {c.name}</option>)}
      </Select>
      <Select label="Payment Method" value={form.paymentMethod} onChange={set('paymentMethod')}>
        {PAYMENT_METHODS.map(m => <option key={m} value={m}>{m.charAt(0).toUpperCase() + m.slice(1)}</option>)}
      </Select>
      <Input label="Description (optional)" placeholder="e.g. Office rent for March" value={form.description} onChange={set('description')} />
      <Input label="Reference (optional)" placeholder="e.g. INV-001, CHQ-123" value={form.reference} onChange={set('reference')} />
      <div className="flex gap-2 pt-1">
        <Button variant="secondary" className="flex-1" onClick={onClose}>Cancel</Button>
        <Button type="submit" className="flex-1" loading={loading}>{editData ? 'Update' : 'Save Transaction'}</Button>
      </div>
    </form>
  );
}

export default function Transactions() {
  const { getBusinessId } = useAuthStore();
  const businessId = getBusinessId();
  const [transactions, setTransactions] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0, limit: 20 });
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ type: '', category: '', startDate: '', endDate: '', paymentMethod: '', search: '' });
  const [showModal, setShowModal] = useState(false);
  const [editData, setEditData] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [deleting, setDeleting] = useState(null);

  const fetchTransactions = useCallback(async (page = 1) => {
    if (!businessId) return;
    setLoading(true);
    try {
      const params = { businessId, page, limit: 20, ...Object.fromEntries(Object.entries(filters).filter(([,v]) => v)) };
      const res = await transactionAPI.getAll(params);
      setTransactions(res.data.data);
      setPagination(res.data.pagination);
    } catch {} finally { setLoading(false); }
  }, [businessId, filters]);

  useEffect(() => { fetchTransactions(1); }, [fetchTransactions]);

  const handleDelete = async (id) => {
    if (!confirm('Delete this transaction?')) return;
    setDeleting(id);
    try {
      await transactionAPI.delete(id);
      toast.success('Transaction deleted');
      fetchTransactions(pagination.page);
    } catch {} finally { setDeleting(null); }
  };

  const handleExport = async () => {
    const rows = transactions.map(t => ({
      Date: formatDate(t.date), Type: t.type, Category: t.category,
      Amount: t.amount, Description: t.description, Method: t.paymentMethod, Reference: t.reference || '',
    }));
    downloadCSV(rows, 'transactions');
    toast.success('Exported as CSV');
  };

  const columns = [
    { key: 'date', label: 'Date', render: v => <span className="text-slate-400 text-xs">{formatDate(v)}</span> },
    { key: 'type', label: 'Type', render: v => (
      <Badge variant={v === 'income' ? 'success' : 'danger'}>{v === 'income' ? '↑ Income' : '↓ Expense'}</Badge>
    )},
    { key: 'category', label: 'Category', render: v => <span className="text-slate-300 text-xs font-medium">{v}</span> },
    { key: 'description', label: 'Description', render: v => <span className="text-slate-400 text-xs truncate max-w-[180px] block">{v || '—'}</span> },
    { key: 'paymentMethod', label: 'Method', render: v => <span className="text-xs text-slate-500 capitalize">{v}</span> },
    { key: 'amount', label: 'Amount', className: 'text-right', render: (v, row) => (
      <span className={`font-semibold text-sm ${row.type === 'income' ? 'text-emerald-400' : 'text-red-400'}`}>
        {row.type === 'income' ? '+' : '-'}{formatCurrency(v)}
      </span>
    )},
    { key: '_id', label: '', className: 'text-right', render: (_, row) => (
      <div className="flex items-center justify-end gap-1">
        <Button variant="ghost" size="icon" icon={<Edit2 size={13} />} onClick={(e) => { e.stopPropagation(); setEditData(row); setShowModal(true); }} />
        <Button variant="ghost" size="icon" loading={deleting === row._id} icon={<Trash2 size={13} className="text-red-400" />} onClick={(e) => { e.stopPropagation(); handleDelete(row._id); }} />
      </div>
    )},
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Transactions</h1>
          <p className="text-sm text-slate-500 mt-0.5">{pagination.total} total records</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" icon={<Download size={14} />} onClick={handleExport}>Export CSV</Button>
          <Button variant="secondary" size="sm" icon={<Filter size={14} />} onClick={() => setShowFilters(!showFilters)}>Filters</Button>
          <Button size="sm" icon={<Plus size={14} />} onClick={() => { setEditData(null); setShowModal(true); }}>Add Transaction</Button>
        </div>
      </div>

      {showFilters && (
        <Card className="animate-fade-in-up">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            <Select label="Type" value={filters.type} onChange={e => setFilters(f => ({ ...f, type: e.target.value }))}>
              <option value="">All Types</option>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </Select>
            <Select label="Method" value={filters.paymentMethod} onChange={e => setFilters(f => ({ ...f, paymentMethod: e.target.value }))}>
              <option value="">All Methods</option>
              {PAYMENT_METHODS.map(m => <option key={m} value={m}>{m}</option>)}
            </Select>
            <Input label="Start Date" type="date" value={filters.startDate} onChange={e => setFilters(f => ({ ...f, startDate: e.target.value }))} />
            <Input label="End Date" type="date" value={filters.endDate} onChange={e => setFilters(f => ({ ...f, endDate: e.target.value }))} />
            <Input label="Search" placeholder="Description..." value={filters.search} onChange={e => setFilters(f => ({ ...f, search: e.target.value }))} />
            <div className="flex items-end">
              <Button variant="secondary" size="md" className="w-full" onClick={() => setFilters({ type: '', category: '', startDate: '', endDate: '', paymentMethod: '', search: '' })}>Reset</Button>
            </div>
          </div>
        </Card>
      )}

      <Card className="p-0 overflow-hidden">
        <Table columns={columns} data={transactions} loading={loading}
          emptyState="No transactions found. Add your first transaction to get started."
          emptyIcon="💳" />
        <Pagination page={pagination.page} pages={pagination.pages} total={pagination.total}
          limit={pagination.limit} onPage={fetchTransactions} />
      </Card>

      <Modal isOpen={showModal} onClose={() => { setShowModal(false); setEditData(null); }}
        title={editData ? 'Edit Transaction' : 'New Transaction'} size="md">
        <TransactionForm businessId={businessId} editData={editData}
          onSave={() => { setShowModal(false); setEditData(null); fetchTransactions(pagination.page); }}
          onClose={() => { setShowModal(false); setEditData(null); }} />
      </Modal>
    </div>
  );
}
