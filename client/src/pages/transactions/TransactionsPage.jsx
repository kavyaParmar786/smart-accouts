// Transactions Page - Full CRUD with filters, search, export
import { useState, useEffect, useCallback } from 'react';
import {
  Plus, Search, Filter, Download, Trash2, Edit2,
  ArrowUpCircle, ArrowDownCircle, X,
} from 'lucide-react';
import { transactionAPI, categoryAPI } from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import {
  Button, Input, Select, Modal, Card, Badge,
  Table, Pagination, Textarea, EmptyState,
} from '../../components/ui';
import { formatCurrency, formatDate, formatDateInput, downloadCSV } from '../../utils/helpers';
import toast from 'react-hot-toast';

const PAYMENT_METHODS = ['cash', 'bank', 'upi', 'card', 'other'];
const EMPTY_FORM = {
  type: 'expense', amount: '', category: '', description: '',
  date: formatDateInput(new Date()), paymentMethod: 'cash', reference: '',
};

export default function TransactionsPage() {
  const getBusinessId = useAuthStore(s => s.getBusinessId);
  const businessId = getBusinessId();

  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0, limit: 15 });
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editTx, setEditTx] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  // Filters
  const [filters, setFilters] = useState({ search: '', type: '', category: '', startDate: '', endDate: '', paymentMethod: '' });
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);

  const setField = (f) => (e) => setForm(prev => ({ ...prev, [f]: e.target.value }));
  const setFilter = (f) => (e) => { setFilters(prev => ({ ...prev, [f]: e.target.value })); setPage(1); };

  const load = useCallback(async () => {
    if (!businessId) return;
    setLoading(true);
    try {
      const params = { businessId, page, limit: 15, ...filters };
      Object.keys(params).forEach(k => !params[k] && delete params[k]);
      const res = await transactionAPI.getAll(params);
      setTransactions(res.data.data || []);
      setPagination(res.data.pagination || {});
    } catch {}
    setLoading(false);
  }, [businessId, page, filters]);

  const loadCategories = useCallback(async () => {
    if (!businessId) return;
    const res = await categoryAPI.getAll({ businessId });
    setCategories(res.data.data?.categories || []);
  }, [businessId]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { loadCategories(); }, [loadCategories]);

  const validate = () => {
    const e = {};
    if (!form.amount || isNaN(form.amount) || +form.amount <= 0) e.amount = 'Valid amount required';
    if (!form.category) e.category = 'Category is required';
    if (!form.date) e.date = 'Date is required';
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const payload = { ...form, businessId, amount: parseFloat(form.amount) };
      if (editTx) {
        await transactionAPI.update(editTx._id, payload);
        toast.success('Transaction updated');
      } else {
        await transactionAPI.create(payload);
        toast.success('Transaction added');
      }
      closeModal();
      load();
    } catch {}
    setSaving(false);
  };

  const handleDelete = async (tx) => {
    if (!confirm(`Delete this ${tx.type} of ${formatCurrency(tx.amount)}?`)) return;
    try {
      await transactionAPI.delete(tx._id);
      toast.success('Transaction deleted');
      load();
    } catch {}
  };

  const openAdd = () => { setEditTx(null); setForm(EMPTY_FORM); setErrors({}); setModalOpen(true); };
  const openEdit = (tx) => {
    setEditTx(tx);
    setForm({ type: tx.type, amount: String(tx.amount), category: tx.category, description: tx.description || '', date: formatDateInput(tx.date), paymentMethod: tx.paymentMethod || 'cash', reference: tx.reference || '' });
    setErrors({});
    setModalOpen(true);
  };
  const closeModal = () => { setModalOpen(false); setEditTx(null); setForm(EMPTY_FORM); };

  const handleExport = async () => {
    try {
      const res = await transactionAPI.getAll({ businessId, limit: 5000, ...filters });
      const rows = (res.data.data || []).map(tx => ({
        Date: formatDate(tx.date), Type: tx.type, Amount: tx.amount,
        Category: tx.category, Description: tx.description || '',
        Method: tx.paymentMethod, Reference: tx.reference || '',
      }));
      downloadCSV(rows, `transactions-${new Date().toISOString().split('T')[0]}`);
      toast.success(`Exported ${rows.length} transactions`);
    } catch {}
  };

  const filteredCategories = categories.filter(c =>
    c.type === form.type || c.type === 'both'
  );

  const activeFilters = Object.values(filters).filter(Boolean).length;

  const columns = [
    {
      key: 'date', label: 'Date', className: 'w-28',
      render: (v) => <span className="text-slate-400 text-xs">{formatDate(v)}</span>,
    },
    {
      key: 'type', label: 'Type', className: 'w-24',
      render: (v) => (
        <div className={`inline-flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-full
          ${v === 'income' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
          {v === 'income' ? <ArrowUpCircle size={10} /> : <ArrowDownCircle size={10} />}
          {v}
        </div>
      ),
    },
    { key: 'category', label: 'Category', render: (v) => <Badge variant="default">{v}</Badge> },
    {
      key: 'description', label: 'Description',
      render: (v) => <span className="text-slate-400 text-xs">{v || '—'}</span>,
    },
    {
      key: 'paymentMethod', label: 'Method', className: 'w-24',
      render: (v) => <span className="text-slate-500 text-xs capitalize">{v}</span>,
    },
    {
      key: 'amount', label: 'Amount', className: 'text-right w-32',
      render: (v, row) => (
        <span className={`font-semibold text-sm ${row.type === 'income' ? 'text-emerald-400' : 'text-red-400'}`}>
          {row.type === 'income' ? '+' : '-'}{formatCurrency(v)}
        </span>
      ),
    },
    {
      key: '_id', label: '', className: 'w-20',
      render: (_, row) => (
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={(e) => { e.stopPropagation(); openEdit(row); }} className="p-1.5 hover:bg-blue-500/10 rounded-lg text-slate-500 hover:text-blue-400 transition-colors">
            <Edit2 size={12} />
          </button>
          <button onClick={(e) => { e.stopPropagation(); handleDelete(row); }} className="p-1.5 hover:bg-red-500/10 rounded-lg text-slate-500 hover:text-red-400 transition-colors">
            <Trash2 size={12} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Transactions</h1>
          <p className="text-sm text-slate-500 mt-0.5">{pagination.total || 0} total records</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" icon={<Download size={13} />} onClick={handleExport}>Export CSV</Button>
          <Button size="sm" icon={<Plus size={13} />} onClick={openAdd}>Add Transaction</Button>
        </div>
      </div>

      {/* Filters bar */}
      <Card className="p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-48">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              placeholder="Search description..."
              value={filters.search}
              onChange={setFilter('search')}
              className="w-full bg-[#0f1420] border border-[#1e2d45] rounded-lg text-sm text-slate-200 placeholder-slate-600 pl-9 pr-4 py-2 focus:outline-none focus:border-blue-500"
            />
          </div>
          <select value={filters.type} onChange={setFilter('type')} className="bg-[#0f1420] border border-[#1e2d45] text-slate-300 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500">
            <option value="">All Types</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm border transition-colors
              ${activeFilters > 0 ? 'bg-blue-600/15 border-blue-500/30 text-blue-400' : 'bg-[#0f1420] border-[#1e2d45] text-slate-400 hover:text-slate-200'}`}
          >
            <Filter size={13} />
            Filters {activeFilters > 0 && `(${activeFilters})`}
          </button>
          {activeFilters > 0 && (
            <button onClick={() => setFilters({ search: '', type: '', category: '', startDate: '', endDate: '', paymentMethod: '' })}
              className="flex items-center gap-1 text-xs text-slate-500 hover:text-red-400 transition-colors">
              <X size={12} /> Clear
            </button>
          )}
        </div>

        {showFilters && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4 pt-4 border-t border-[#1e2d45]">
            <select value={filters.category} onChange={setFilter('category')} className="bg-[#0f1420] border border-[#1e2d45] text-slate-300 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500">
              <option value="">All Categories</option>
              {categories.map(c => <option key={c._id} value={c.name}>{c.name}</option>)}
            </select>
            <select value={filters.paymentMethod} onChange={setFilter('paymentMethod')} className="bg-[#0f1420] border border-[#1e2d45] text-slate-300 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500">
              <option value="">All Methods</option>
              {PAYMENT_METHODS.map(m => <option key={m} value={m} className="capitalize">{m}</option>)}
            </select>
            <input type="date" value={filters.startDate} onChange={setFilter('startDate')}
              className="bg-[#0f1420] border border-[#1e2d45] text-slate-300 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500" />
            <input type="date" value={filters.endDate} onChange={setFilter('endDate')}
              className="bg-[#0f1420] border border-[#1e2d45] text-slate-300 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500" />
          </div>
        )}
      </Card>

      {/* Table */}
      <Card className="p-0">
        <div className="[&_tr]:group">
          <Table columns={columns} data={transactions} loading={loading} emptyIcon="💸" emptyState="No transactions found. Add your first one!" />
        </div>
        <Pagination {...pagination} onPage={setPage} />
      </Card>

      {/* Add/Edit Modal */}
      <Modal isOpen={modalOpen} onClose={closeModal} title={editTx ? 'Edit Transaction' : 'Add Transaction'} size="md">
        <div className="space-y-4">
          {/* Type toggle */}
          <div className="flex rounded-xl overflow-hidden border border-[#1e2d45]">
            {['income', 'expense'].map(t => (
              <button
                key={t}
                onClick={() => setForm(f => ({ ...f, type: t, category: '' }))}
                className={`flex-1 py-2.5 text-sm font-medium transition-colors capitalize
                  ${form.type === t
                    ? t === 'income' ? 'bg-emerald-600/20 text-emerald-400' : 'bg-red-600/20 text-red-400'
                    : 'text-slate-500 hover:text-slate-300'}`}
              >
                {t === 'income' ? '↑' : '↓'} {t}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input label="Amount (₹)" type="number" placeholder="0.00" value={form.amount} onChange={setField('amount')} error={errors.amount} min="0" step="0.01" />
            <input type="date" value={form.date} onChange={setField('date')}
              className="bg-[#0f1420] border border-[#1e2d45] rounded-lg text-sm text-slate-200 px-4 py-2.5 focus:outline-none focus:border-blue-500 mt-6" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Select label="Category" value={form.category} onChange={setField('category')} error={errors.category}>
              <option value="">Select category</option>
              {filteredCategories.map(c => <option key={c._id} value={c.name}>{c.icon} {c.name}</option>)}
            </Select>
            <Select label="Payment Method" value={form.paymentMethod} onChange={setField('paymentMethod')}>
              {PAYMENT_METHODS.map(m => <option key={m} value={m} className="capitalize">{m.charAt(0).toUpperCase() + m.slice(1)}</option>)}
            </Select>
          </div>

          <Textarea label="Description (optional)" placeholder="What was this for?" value={form.description} onChange={setField('description')} rows={2} />
          <Input label="Reference No. (optional)" placeholder="Invoice #, Cheque #..." value={form.reference} onChange={setField('reference')} />

          <div className="flex gap-3 pt-2">
            <Button variant="secondary" className="flex-1" onClick={closeModal}>Cancel</Button>
            <Button className="flex-1" onClick={handleSubmit} loading={saving}>
              {editTx ? 'Update' : 'Add Transaction'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
