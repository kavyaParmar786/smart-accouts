import { useState, useEffect, useCallback } from 'react';
import { Plus, Eye, Trash2, Download, Send, CheckCircle } from 'lucide-react';
import { invoiceAPI } from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import { Button, Card, Badge, Table, Pagination, Modal, Input, Select, Textarea, StatCard } from '../../components/ui/index.jsx';
import { formatCurrency, formatDate, formatDateInput } from '../../utils/helpers';
import InvoiceBuilder from './InvoiceBuilder.jsx';
import InvoicePreview from './InvoicePreview.jsx';
import toast from 'react-hot-toast';

const STATUS_BADGE = { paid: 'success', sent: 'info', draft: 'default', overdue: 'danger', cancelled: 'default' };

export default function Invoices() {
  const { getBusinessId } = useAuthStore();
  const businessId = getBusinessId();
  const [invoices, setInvoices] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0, limit: 20 });
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ status: '' });
  const [showBuilder, setShowBuilder] = useState(false);
  const [editInvoice, setEditInvoice] = useState(null);
  const [previewInvoice, setPreviewInvoice] = useState(null);

  const fetchAll = useCallback(async (page = 1) => {
    if (!businessId) return;
    setLoading(true);
    try {
      const [invRes, statsRes] = await Promise.all([
        invoiceAPI.getAll({ businessId, page, limit: 20, ...Object.fromEntries(Object.entries(filters).filter(([,v]) => v)) }),
        invoiceAPI.stats({ businessId }),
      ]);
      setInvoices(invRes.data.data);
      setPagination(invRes.data.pagination);
      setStats(statsRes.data.data);
    } catch {} finally { setLoading(false); }
  }, [businessId, filters]);

  useEffect(() => { fetchAll(1); }, [fetchAll]);

  const handleDelete = async (id) => {
    if (!confirm('Delete this invoice?')) return;
    try { await invoiceAPI.delete(id); toast.success('Invoice deleted'); fetchAll(); } catch {}
  };

  const handleMarkSent = async (id) => {
    try { await invoiceAPI.update(id, { status: 'sent' }); toast.success('Marked as sent'); fetchAll(); } catch {}
  };

  const columns = [
    { key: 'invoiceNumber', label: '#', render: v => <span className="font-mono text-xs font-semibold text-blue-400">{v}</span> },
    { key: 'customer', label: 'Customer', render: v => <span className="text-sm text-slate-200">{v?.name}</span> },
    { key: 'issueDate', label: 'Date', render: v => <span className="text-xs text-slate-400">{formatDate(v)}</span> },
    { key: 'dueDate', label: 'Due', render: v => <span className={`text-xs ${v && new Date(v) < new Date() ? 'text-red-400' : 'text-slate-400'}`}>{v ? formatDate(v) : '—'}</span> },
    { key: 'grandTotal', label: 'Amount', render: v => <span className="font-semibold text-white">{formatCurrency(v)}</span> },
    { key: 'amountPaid', label: 'Paid', render: (v, row) => <span className={`text-xs ${v >= row.grandTotal ? 'text-emerald-400' : 'text-slate-400'}`}>{formatCurrency(v)}</span> },
    { key: 'status', label: 'Status', render: v => <Badge variant={STATUS_BADGE[v]}>{v}</Badge> },
    { key: '_id', label: '', render: (id, row) => (
      <div className="flex items-center gap-1 justify-end">
        <Button variant="ghost" size="icon" icon={<Eye size={13} />} onClick={e => { e.stopPropagation(); setPreviewInvoice(row); }} />
        {row.status === 'draft' && <Button variant="ghost" size="icon" icon={<Send size={13} className="text-blue-400" />} onClick={e => { e.stopPropagation(); handleMarkSent(id); }} />}
        {row.status !== 'paid' && <Button variant="ghost" size="icon" icon={<Trash2 size={13} className="text-red-400" />} onClick={e => { e.stopPropagation(); handleDelete(id); }} />}
      </div>
    )},
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <div><h1 className="text-xl font-bold text-white">Invoices</h1><p className="text-sm text-slate-500 mt-0.5">{pagination.total} total invoices</p></div>
        <Button size="sm" icon={<Plus size={14} />} onClick={() => { setEditInvoice(null); setShowBuilder(true); }}>Create Invoice</Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 stagger">
        <StatCard label="Total Paid" color="green" value={formatCurrency(stats?.amounts?.paid)} icon={<CheckCircle size={18} />} loading={loading} />
        <StatCard label="Outstanding" color="blue" value={formatCurrency((stats?.amounts?.sent || 0) + (stats?.amounts?.overdue || 0))} icon={<Send size={18} />} loading={loading} />
        <StatCard label="Overdue" color="red" value={stats?.counts?.overdue || 0} sublabel="invoices" icon={<Eye size={18} />} loading={loading} />
        <StatCard label="Draft" color="amber" value={stats?.counts?.draft || 0} sublabel="invoices" icon={<Plus size={18} />} loading={loading} />
      </div>

      <div className="flex items-center gap-2">
        {['', 'draft', 'sent', 'paid', 'overdue'].map(s => (
          <button key={s} onClick={() => setFilters({ status: s })}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filters.status === s ? 'bg-blue-600 text-white' : 'bg-[#131929] border border-[#1e2d45] text-slate-400 hover:text-slate-200'}`}>
            {s === '' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      <Card className="p-0 overflow-hidden">
        <Table columns={columns} data={invoices} loading={loading}
          emptyState="No invoices found. Create your first invoice!" emptyIcon="🧾"
          onRowClick={row => setPreviewInvoice(row)} />
        <Pagination page={pagination.page} pages={pagination.pages} total={pagination.total} limit={pagination.limit} onPage={fetchAll} />
      </Card>

      <Modal isOpen={showBuilder} onClose={() => setShowBuilder(false)} title={editInvoice ? 'Edit Invoice' : 'Create Invoice'} size="xl">
        <InvoiceBuilder businessId={businessId} editData={editInvoice}
          onSave={() => { setShowBuilder(false); fetchAll(); }} onClose={() => setShowBuilder(false)} />
      </Modal>

      <Modal isOpen={!!previewInvoice} onClose={() => setPreviewInvoice(null)} title={`Invoice ${previewInvoice?.invoiceNumber}`} size="xl">
        {previewInvoice && <InvoicePreview invoice={previewInvoice} onClose={() => setPreviewInvoice(null)} onRefresh={fetchAll} />}
      </Modal>
    </div>
  );
}
