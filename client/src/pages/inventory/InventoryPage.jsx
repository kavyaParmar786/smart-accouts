// Inventory Page - Full product/stock management
import { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Edit2, Trash2, AlertTriangle, Package, TrendingUp, TrendingDown, BarChart2 } from 'lucide-react';
import { inventoryAPI } from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import { Button, Input, Select, Modal, Card, Badge, Table, Pagination, StatCard, Textarea, EmptyState } from '../../components/ui';
import { formatCurrency } from '../../utils/helpers';
import toast from 'react-hot-toast';

const UNITS = ['pcs', 'kg', 'g', 'ltr', 'ml', 'box', 'pack', 'set', 'pair', 'meter'];
const EMPTY_FORM = { name: '', sku: '', category: '', description: '', price: '', costPrice: '', quantity: '', lowStockThreshold: 10, unit: 'pcs', gstRate: 18 };

export default function InventoryPage() {
  const getBusinessId = useAuthStore(s => s.getBusinessId);
  const businessId = getBusinessId();

  const [products, setProducts] = useState([]);
  const [stats, setStats] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0, limit: 20 });
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [lowStockOnly, setLowStockOnly] = useState(false);

  const [productModal, setProductModal] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  const [stockModal, setStockModal] = useState(null); // product
  const [stockForm, setStockForm] = useState({ type: 'in', quantity: '', reason: '' });

  const setField = (f) => (e) => setForm(prev => ({ ...prev, [f]: e.target.value }));

  const load = useCallback(async () => {
    if (!businessId) return;
    setLoading(true);
    try {
      const params = { businessId, page, limit: 20 };
      if (search) params.search = search;
      if (lowStockOnly) params.lowStock = true;
      const [prodRes, statsRes] = await Promise.all([
        inventoryAPI.getAll(params),
        inventoryAPI.stats({ businessId }),
      ]);
      setProducts(prodRes.data.data || []);
      setPagination(prodRes.data.pagination || {});
      setStats(statsRes.data.data);
    } catch {}
    setLoading(false);
  }, [businessId, page, search, lowStockOnly]);

  useEffect(() => { load(); }, [load]);

  const validate = () => {
    const e = {};
    if (!form.name) e.name = 'Product name required';
    if (form.price === '' || isNaN(form.price)) e.price = 'Valid price required';
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const payload = {
        ...form,
        businessId,
        price: parseFloat(form.price) || 0,
        costPrice: parseFloat(form.costPrice) || 0,
        quantity: parseInt(form.quantity) || 0,
        lowStockThreshold: parseInt(form.lowStockThreshold) || 10,
        gstRate: parseFloat(form.gstRate) || 18,
      };
      if (editProduct) {
        await inventoryAPI.update(editProduct._id, payload);
        toast.success('Product updated');
      } else {
        await inventoryAPI.create(payload);
        toast.success('Product added');
      }
      setProductModal(false);
      setEditProduct(null);
      setForm(EMPTY_FORM);
      load();
    } catch {}
    setSaving(false);
  };

  const handleDelete = async (p) => {
    if (!confirm(`Delete "${p.name}"?`)) return;
    try { await inventoryAPI.delete(p._id); toast.success('Product removed'); load(); } catch {}
  };

  const handleStockAdjust = async () => {
    if (!stockForm.quantity || +stockForm.quantity <= 0) return toast.error('Enter valid quantity');
    try {
      await inventoryAPI.adjustStock(stockModal._id, {
        type: stockForm.type,
        quantity: parseInt(stockForm.quantity),
        reason: stockForm.reason,
      });
      toast.success('Stock updated');
      setStockModal(null);
      setStockForm({ type: 'in', quantity: '', reason: '' });
      load();
    } catch {}
  };

  const openEdit = (p) => {
    setEditProduct(p);
    setForm({ name: p.name, sku: p.sku || '', category: p.category || '', description: p.description || '', price: String(p.price), costPrice: String(p.costPrice), quantity: String(p.quantity), lowStockThreshold: p.lowStockThreshold, unit: p.unit, gstRate: p.gstRate });
    setErrors({});
    setProductModal(true);
  };

  const columns = [
    {
      key: 'name', label: 'Product',
      render: (v, row) => (
        <div>
          <p className="font-medium text-slate-200">{v}</p>
          {row.sku && <p className="text-[10px] text-slate-500 font-mono">SKU: {row.sku}</p>}
        </div>
      ),
    },
    { key: 'category', label: 'Category', render: (v) => v ? <Badge variant="default">{v}</Badge> : '—' },
    {
      key: 'quantity', label: 'Stock', className: 'w-32',
      render: (v, row) => (
        <div className="flex items-center gap-2">
          <span className={`font-semibold text-sm ${v <= row.lowStockThreshold ? 'text-red-400' : 'text-white'}`}>{v}</span>
          <span className="text-xs text-slate-500">{row.unit}</span>
          {v <= row.lowStockThreshold && <AlertTriangle size={12} className="text-amber-400" />}
        </div>
      ),
    },
    {
      key: 'price', label: 'Sell Price', className: 'w-28',
      render: (v) => <span className="font-medium text-slate-200">{formatCurrency(v)}</span>,
    },
    {
      key: 'costPrice', label: 'Cost Price', className: 'w-28',
      render: (v) => <span className="text-slate-400">{formatCurrency(v)}</span>,
    },
    {
      key: 'profitMargin', label: 'Margin', className: 'w-20',
      render: (_, row) => {
        const margin = row.price > 0 ? (((row.price - row.costPrice) / row.price) * 100).toFixed(0) : 0;
        return <span className={`text-xs font-medium ${margin >= 20 ? 'text-emerald-400' : 'text-amber-400'}`}>{margin}%</span>;
      },
    },
    {
      key: '_id', label: '', className: 'w-24',
      render: (_, row) => (
        <div className="flex items-center gap-1">
          <button onClick={() => setStockModal(row)} className="p-1.5 hover:bg-blue-500/10 rounded-lg text-slate-500 hover:text-blue-400 transition-colors" title="Adjust Stock">
            <Package size={12} />
          </button>
          <button onClick={() => openEdit(row)} className="p-1.5 hover:bg-blue-500/10 rounded-lg text-slate-500 hover:text-blue-400 transition-colors" title="Edit">
            <Edit2 size={12} />
          </button>
          <button onClick={() => handleDelete(row)} className="p-1.5 hover:bg-red-500/10 rounded-lg text-slate-500 hover:text-red-400 transition-colors" title="Delete">
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
          <h1 className="text-xl font-bold text-white">Inventory</h1>
          <p className="text-sm text-slate-500 mt-0.5">Product and stock management</p>
        </div>
        <Button icon={<Plus size={13} />} onClick={() => { setEditProduct(null); setForm(EMPTY_FORM); setErrors({}); setProductModal(true); }}>
          Add Product
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Products" value={stats?.totalProducts || 0} icon={<Package size={16} />} color="blue" />
        <StatCard label="Stock Value (Cost)" value={formatCurrency(stats?.totalValue)} icon={<BarChart2 size={16} />} color="purple" />
        <StatCard label="Retail Value" value={formatCurrency(stats?.totalRetailValue)} icon={<TrendingUp size={16} />} color="green" />
        <StatCard label="Low Stock" value={stats?.lowStockCount || 0} icon={<AlertTriangle size={16} />} color={stats?.lowStockCount > 0 ? 'red' : 'green'} sublabel={stats?.lowStockCount > 0 ? 'Reorder needed' : 'All good'} />
      </div>

      {/* Low stock alert */}
      {stats?.lowStockItems?.length > 0 && (
        <Card className="border-amber-500/20 bg-amber-500/5">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle size={14} className="text-amber-400" />
            <h3 className="text-sm font-semibold text-amber-300">Low Stock Alert</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {stats.lowStockItems.map(item => (
              <div key={item._id} className="flex items-center gap-2 px-3 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                <span className="text-xs text-amber-300 font-medium">{item.name}</span>
                <span className="text-[10px] text-amber-500">{item.quantity}/{item.lowStockThreshold} {item.unit}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-48">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input placeholder="Search products..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
              className="w-full bg-[#0f1420] border border-[#1e2d45] rounded-lg text-sm text-slate-200 placeholder-slate-600 pl-9 pr-4 py-2 focus:outline-none focus:border-blue-500" />
          </div>
          <button onClick={() => { setLowStockOnly(!lowStockOnly); setPage(1); }}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm border transition-colors
              ${lowStockOnly ? 'bg-amber-500/15 border-amber-500/30 text-amber-400' : 'bg-[#0f1420] border-[#1e2d45] text-slate-400 hover:text-slate-200'}`}>
            <AlertTriangle size={13} /> Low Stock Only
          </button>
        </div>
      </Card>

      {/* Table */}
      <Card className="p-0">
        <Table columns={columns} data={products} loading={loading} emptyIcon="📦" emptyState="No products yet. Add your inventory!" />
        <Pagination {...pagination} onPage={setPage} />
      </Card>

      {/* Add/Edit Product Modal */}
      <Modal isOpen={productModal} onClose={() => setProductModal(false)} title={editProduct ? 'Edit Product' : 'Add Product'} size="lg">
        <div className="grid grid-cols-2 gap-4">
          <Input label="Product Name *" placeholder="iPhone Case" value={form.name} onChange={setField('name')} error={errors.name} wrapperClass="col-span-2" />
          <Input label="SKU" placeholder="SKU-001" value={form.sku} onChange={setField('sku')} />
          <Input label="Category" placeholder="Electronics" value={form.category} onChange={setField('category')} />
          <Input label="Selling Price (₹) *" type="number" value={form.price} onChange={setField('price')} error={errors.price} min="0" step="0.01" />
          <Input label="Cost Price (₹)" type="number" value={form.costPrice} onChange={setField('costPrice')} min="0" step="0.01" />
          <Input label="Current Quantity" type="number" value={form.quantity} onChange={setField('quantity')} min="0" />
          <Input label="Low Stock Threshold" type="number" value={form.lowStockThreshold} onChange={setField('lowStockThreshold')} min="0" />
          <Select label="Unit" value={form.unit} onChange={setField('unit')}>
            {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
          </Select>
          <Select label="GST Rate" value={form.gstRate} onChange={setField('gstRate')}>
            {[0, 5, 12, 18, 28].map(r => <option key={r} value={r}>{r}%</option>)}
          </Select>
          <Textarea label="Description" value={form.description} onChange={setField('description')} wrapperClass="col-span-2" rows={2} />
        </div>
        <div className="flex gap-3 mt-5">
          <Button variant="secondary" className="flex-1" onClick={() => setProductModal(false)}>Cancel</Button>
          <Button className="flex-1" onClick={handleSubmit} loading={saving}>{editProduct ? 'Update' : 'Add Product'}</Button>
        </div>
      </Modal>

      {/* Stock Adjustment Modal */}
      <Modal isOpen={!!stockModal} onClose={() => setStockModal(null)} title="Adjust Stock" size="sm">
        {stockModal && (
          <div className="space-y-4">
            <div className="p-3 bg-[#0f1420] rounded-xl border border-[#1e2d45]">
              <p className="text-sm font-medium text-white">{stockModal.name}</p>
              <p className="text-xs text-slate-500 mt-0.5">Current stock: <span className="text-blue-400 font-semibold">{stockModal.quantity} {stockModal.unit}</span></p>
            </div>
            <div className="flex rounded-xl overflow-hidden border border-[#1e2d45]">
              {[['in', '↑ Stock In', 'text-emerald-400 bg-emerald-600/15'], ['out', '↓ Stock Out', 'text-red-400 bg-red-600/15'], ['adjustment', '⟳ Adjust', 'text-blue-400 bg-blue-600/15']].map(([t, l, cls]) => (
                <button key={t} onClick={() => setStockForm(f => ({ ...f, type: t }))}
                  className={`flex-1 py-2 text-xs font-medium transition-colors ${stockForm.type === t ? cls : 'text-slate-500 hover:text-slate-300'}`}>{l}</button>
              ))}
            </div>
            <Input label="Quantity" type="number" value={stockForm.quantity} onChange={e => setStockForm(f => ({ ...f, quantity: e.target.value }))} min="1" />
            <Textarea label="Reason (optional)" value={stockForm.reason} onChange={e => setStockForm(f => ({ ...f, reason: e.target.value }))} rows={2} placeholder="Purchase, sale, damage..." />
            <div className="flex gap-3">
              <Button variant="secondary" className="flex-1" onClick={() => setStockModal(null)}>Cancel</Button>
              <Button className="flex-1" onClick={handleStockAdjust}>Update Stock</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
