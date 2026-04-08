// Invoices Page - List + Create + Status management
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Download, Eye, Trash2, CreditCard, FileText } from 'lucide-react';
import { invoiceAPI } from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import {
  Button, Card, Badge, Table, Pagination, StatCard,
  Modal, Input, Select, Textarea, EmptyState,
} from '../../components/ui';
import { formatCurrency, formatDate, formatDateInput } from '../../utils/helpers';
import InvoiceForm from './InvoiceForm';
import toast from 'react-hot-toast';

const STATUS_MAP = {
  draft:     { label: 'Draft',     variant: 'default' },
  sent:      { label: 'Sent',      variant: 'info' },
  paid:      { label: 'Paid',      variant: 'success' },
  overdue:   { label: 'Overdue',   variant: 'danger' },
  cancelled: { label: 'Cancelled', variant: 'default' },
};

export default function InvoicesPage() {
  const getBusinessId = useAuthStore(s => s.getBusinessId);
  const businessId = getBusinessId();
  const navigate = useNavigate();

  const [invoices, setInvoices] = useState([]);
  const [stats, setStats] = useState({});
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0, limit: 15 });
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [createModal, setCreateModal] = useState(false);
  const [paymentModal, setPaymentModal] = useState(null); // invoice object
  const [paymentForm, setPaymentForm] = useState({ amount: '', method: 'bank', note: '' });
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    if (!businessId) return;
    setLoading(true);
    try {
      const params = { businessId, page, limit: 15 };
      if (statusFilter) params.status = statusFilter;
      if (search) params.search = search;
      const [listRes, statsRes] = await Promise.all([
        invoiceAPI.getAll(params),
        invoiceAPI.stats({ businessId }),
      ]);
      setInvoices(listRes.data.data || []);
      setPagination(listRes.data.pagination || {});
      setStats(statsRes.data.data || {});
    } catch {}
    setLoading(false);
  }, [businessId, page, statusFilter, search]);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (inv) => {
    if (!confirm(`Delete invoice ${inv.invoiceNumber}?`)) return;
    try {
      await invoiceAPI.delete(inv._id);
      toast.success('Invoice deleted');
      load();
    } catch {}
  };

  const handleUpdateStatus = async (inv, status) => {
    try {
      await invoiceAPI.update(inv._id, { status });
      toast.success(`Marked as ${status}`);
      load();
    } catch {}
  };

  const handlePayment = async () => {
    if (!paymentForm.amount || +paymentForm.amount <= 0) return toast.error('Enter valid amount');
    setSaving(true);
    try {
      await invoiceAPI.recordPayment(paymentModal._id, {
        amount: parseFloat(paymentForm.amount),
        method: paymentForm.method,
        note: paymentForm.note,
      });
      toast.success('Payment recorded');
      setPaymentModal(null);
      setPaymentForm({ amount: '', method: 'bank', note: '' });
      load();
    } catch {}
    setSaving(false);
  };

  const columns = [
    {
      key: 'invoiceNumber', label: 'Invoice #',
      render: (v) => <span className="text-blue-400 font-mono text-xs font-semibold">{v}</span>,
    },
    { key: 'customer', label: 'Customer', render: (v) => <span className="font-medium text-slate-200 text-sm">{v?.name}</span> },
    {
      key: 'issueDate', label: 'Date', className: 'w-28',
      render: (v) => <span className="text-slate-400 text-xs">{formatDate(v)}</span>,
    },
    {
      key: 'dueDate', label: 'Due', className: 'w-28',
      render: (v) => <span className="text-slate-400 text-xs">{v ? formatDate(v) : '—'}</span>,
    },
    {
      key: 'status', label: 'Status', className: 'w-28',
      render: (v) => <Badge variant={STATUS_MAP[v]?.variant}>{STATUS_MAP[v]?.label || v}</Badge>,
    },
    {
      key: 'grandTotal', label: 'Amount', className: 'text-right w-32',
      render: (v) => <span className="font-semibold text-white">{formatCurrency(v)}</span>,
    },
    {
      key: '_id', label: '', className: 'w-32',
      render: (_, row) => (
        <div className="flex items-center gap-1">
          <button onClick={() => navigate(`/invoices/${row._id}`)}
            className="p-1.5 hover:bg-blue-500/10 rounded-lg text-slate-500 hover:text-blue-400 transition-colors" title="View">
            <Eye size={12} />
          </button>
          {['sent', 'overdue'].includes(row.status) && (
            <button onClick={() => { setPaymentModal(row); setPaymentForm(f => ({ ...f, amount: String(row.grandTotal - row.amountPaid) })); }}
              className="p-1.5 hover:bg-emerald-500/10 rounded-lg text-slate-500 hover:text-emerald-400 transition-colors" title="Record Payment">
              <CreditCard size={12} />
            </button>
          )}
          {row.status === 'draft' && (
            <button onClick={() => handleUpdateStatus(row, 'sent')}
              className="px-2 py-1 text-[10px] bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 rounded transition-colors">
              Send
            </button>
          )}
          {!['paid', 'cancelled'].includes(row.status) && (
            <button onClick={() => handleDelete(row)}
              className="p-1.5 hover:bg-red-500/10 rounded-lg text-slate-500 hover:text-red-400 transition-colors" title="Delete">
              <Trash2 size={12} />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Invoices</h1>
          <p className="text-sm text-slate-500 mt-0.5">GST-ready invoicing system</p>
        </div>
        <Button icon={<Plus size={13} />} onClick={() => setCreateModal(true)}>Create Invoice</Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Paid', value: formatCurrency(stats.amounts?.paid), color: 'green', icon: <FileText size={16}/> },
          { label: 'Outstanding', value: formatCurrency((stats.amounts?.sent||0)+(stats.amounts?.overdue||0)), color: 'amber', icon: <FileText size={16}/> },
          { label: 'Overdue', value: `${stats.counts?.overdue||0} invoices`, color: 'red', icon: <FileText size={16}/> },
          { label: 'Drafts', value: `${stats.counts?.draft||0} invoices`, color: 'blue', icon: <FileText size={16}/> },
        ].map(s => <StatCard key={s.label} {...s} />)}
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-48">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input placeholder="Search invoice or customer..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
              className="w-full bg-[#0f1420] border border-[#1e2d45] rounded-lg text-sm text-slate-200 placeholder-slate-600 pl-9 pr-4 py-2 focus:outline-none focus:border-blue-500" />
          </div>
          <div className="flex gap-2">
            {['', 'draft', 'sent', 'paid', 'overdue'].map(s => (
              <button key={s} onClick={() => { setStatusFilter(s); setPage(1); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors
                  ${statusFilter === s ? 'bg-blue-600 text-white' : 'bg-[#0f1420] border border-[#1e2d45] text-slate-400 hover:text-slate-200'}`}>
                {s ? s.charAt(0).toUpperCase() + s.slice(1) : 'All'}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Table */}
      <Card className="p-0">
        <Table columns={columns} data={invoices} loading={loading} emptyIcon="📄" emptyState="No invoices yet. Create your first!" />
        <Pagination {...pagination} onPage={setPage} />
      </Card>

      {/* Create Invoice Modal */}
      <Modal isOpen={createModal} onClose={() => setCreateModal(false)} title="Create New Invoice" size="xl">
        <InvoiceForm businessId={businessId} onSuccess={() => { setCreateModal(false); load(); }} onCancel={() => setCreateModal(false)} />
      </Modal>

      {/* Record Payment Modal */}
      <Modal isOpen={!!paymentModal} onClose={() => setPaymentModal(null)} title="Record Payment" size="sm">
        {paymentModal && (
          <div className="space-y-4">
            <div className="p-3 bg-[#0f1420] rounded-xl border border-[#1e2d45]">
              <p className="text-xs text-slate-500">Invoice: <span className="text-blue-400 font-mono">{paymentModal.invoiceNumber}</span></p>
              <p className="text-xs text-slate-500 mt-0.5">Customer: <span className="text-slate-300">{paymentModal.customer?.name}</span></p>
              <p className="text-xs text-slate-500 mt-0.5">Outstanding: <span className="text-amber-400 font-semibold">{formatCurrency(paymentModal.grandTotal - paymentModal.amountPaid)}</span></p>
            </div>
            <Input label="Payment Amount (₹)" type="number" value={paymentForm.amount} onChange={e => setPaymentForm(f => ({ ...f, amount: e.target.value }))} />
            <Select label="Payment Method" value={paymentForm.method} onChange={e => setPaymentForm(f => ({ ...f, method: e.target.value }))}>
              {['cash', 'bank', 'upi', 'card', 'other'].map(m => <option key={m} value={m} className="capitalize">{m}</option>)}
            </Select>
            <Textarea label="Note (optional)" value={paymentForm.note} onChange={e => setPaymentForm(f => ({ ...f, note: e.target.value }))} rows={2} />
            <div className="flex gap-3">
              <Button variant="secondary" className="flex-1" onClick={() => setPaymentModal(null)}>Cancel</Button>
              <Button className="flex-1" onClick={handlePayment} loading={saving}>Record Payment</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
