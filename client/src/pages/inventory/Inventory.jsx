import { useState, useEffect, useCallback } from 'react';
import { Plus, Edit2, Trash2, Package, AlertTriangle, TrendingDown, ArrowUpDown } from 'lucide-react';
import { inventoryAPI } from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import { Button, Card, Badge, Table, Pagination, Modal, Input, Select, Textarea, StatCard, EmptyState } from '../../components/ui/index.jsx';
import { formatCurrency } from '../../utils/helpers';
import toast from 'react-hot-toast';

const UNITS = ['pcs', 'kg', 'g', 'litre', 'ml', 'box', 'set', 'pair', 'dozen', 'meter'];
const GST_RATES = [0, 5, 12, 18, 28];

function ProductForm({ businessId, editData, onSave, onClose }) {
  const [form, setForm] = useState({
    name: editData?.name || '', sku: editData?.sku || '', category: editData?.category || '',
    description: editData?.description || '', price: editData?.price || '', costPrice: editData?.costPrice || '',
    quantity: editData?.quantity || 0, lowStockThreshold: editData?.lowStockThreshold || 10,
    unit: editData?.unit || 'pcs', gstRate: editData?.gstRate || 18, businessId,
  });
  const [loading, setLoading] = useState(false);
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name) return toast.error('Product name is required');
    setLoading(true);
    try {
      if (editData?._id) await inventoryAPI.update(editData._id, form);
      else await inventoryAPI.create(form);
      toast.success(editData ? 'Product updated!' : 'Product added!');
      onSave();
    } catch {} finally { setLoading(false); }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <Input label="Product Name *" placeholder="Blue T-Shirt XL" value={form.name} onChange={set('name')} wrapperClass="col-span-2" />
        <Input label="SKU / Code" placeholder="SKU-001" value={form.sku} onChange={set('sku')} />
        <Input label="Category" placeholder="Clothing, Electronics..." value={form.category} onChange={set('category')} />
        <Input label="Selling Price (₹)" type="number" step="0.01" placeholder="0.00" value={form.price} onChange={set('price')} />
        <Input label="Cost Price (₹)" type="number" step="0.01" placeholder="0.00" value={form.costPrice} onChange={set('costPrice')} />
        <Input label="Stock Quantity" type="number" min="0" value={form.quantity} onChange={set('quantity')} />
        <Input label="Low Stock Alert At" type="number" min="0" value={form.lowStockThreshold} onChange={set('lowStockThreshold')} />
        <Select label="Unit" value={form.unit} onChange={set('unit')}>
          {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
        </Select>
        <Select label="GST Rate" value={form.gstRate} onChange={set('gstRate')}>
          {GST_RATES.map(r => <option key={r} value={r}>{r}%</option>)}
        </Select>
        <Textarea label="Description" placeholder="Product details..." value={form.description} onChange={set('description')} wrapperClass="col-span-2" />
      </div>
      <div className="flex gap-2 pt-1">
        <Button variant="secondary" className="flex-1" onClick={onClose}>Cancel</Button>
        <Button type="submit" className="flex-1" loading={loading}>{editData ? 'Update Product' : 'Add Product'}</Button>
      </div>
    </form>
  );
}

function StockAdjustModal({ product, onClose, onSave }) {
  const [form, setForm] = useState({ type: 'in', quantity: 1, reason: '', reference: '' });
  const [loading, setLoading] = useState(false);
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await inventoryAPI.adjustStock(product._id, { ...form, quantity: parseFloat(form.quantity) });
      toast.success('Stock adjusted!');
      onSave();
    } catch {} finally { setLoading(false); }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="bg-[#0f1420] border border-[#1e2d45] rounded-xl p-4">
        <p className="text-sm font-semibold text-white">{product.name}</p>
        <p className="text-xs text-slate-400 mt-1">Current stock: <span className="font-semibold text-blue-400">{product.quantity} {product.unit}</span></p>
      </div>
      <div className="flex gap-2">
        {['in', 'out', 'adjustment'].map(t => (
          <button key={t} type="button" onClick={() => setForm(f => ({ ...f, type: t }))}
            className={`flex-1 py-2 rounded-lg text-xs font-medium border transition-all ${form.type === t ? 'bg-blue-600/15 border-blue-500/40 text-blue-400' : 'bg-transparent border-[#1e2d45] text-slate-500'}`}>
            {t === 'in' ? '+ Stock In' : t === 'out' ? '- Stock Out' : '≈ Adjustment'}
          </button>
        ))}
      </div>
      <Input label="Quantity" type="number" min="0.01" step="0.01" value={form.quantity} onChange={set('quantity')} />
      <Input label="Reason" placeholder="Purchase, Sale, Damage..." value={form.reason} onChange={set('reason')} />
      <Input label="Reference" placeholder="PO-001, Order#123..." value={form.reference} onChange={set('reference')} />
      <div className="flex gap-2">
        <Button variant="secondary" className="flex-1" onClick={onClose}>Cancel</Button>
        <Button type="submit" className="flex-1" loading={loading}>Adjust Stock</Button>
      </div>
    </form>
  );
}

export default function Inventory() {
  const { getBusinessId } = useAuthStore();
  const businessId = getBusinessId();
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0, limit: 20 });
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ search: '', lowStock: '' });
  const [showModal, setShowModal] = useState(false);
  const [showStockModal, setShowStockModal] = useState(false);
  const [editData, setEditData] = useState(null);
  const [stockProduct, setStockProduct] = useState(null);

  const fetchAll = useCallback(async (page = 1) => {
    if (!businessId) return;
    setLoading(true);
    try {
      const params = { businessId, page, limit: 20, ...Object.fromEntries(Object.entries(filters).filter(([,v]) => v)) };
      const [prodRes, statsRes] = await Promise.all([
        inventoryAPI.getAll(params),
        inventoryAPI.stats({ businessId }),
      ]);
      setProducts(prodRes.data.data);
      setPagination(prodRes.data.pagination);
      setStats(statsRes.data.data);
    } catch {} finally { setLoading(false); }
  }, [businessId, filters]);

  useEffect(() => { fetchAll(1); }, [fetchAll]);

  const handleDelete = async (id) => {
    if (!confirm('Delete this product?')) return;
    try { await inventoryAPI.delete(id); toast.success('Product deleted'); fetchAll(); } catch {}
  };

  const columns = [
    { key: 'name', label: 'Product', render: (v, row) => (
      <div>
        <p className="text-sm font-medium text-slate-200">{v}</p>
        <p className="text-xs text-slate-500">{row.sku || row.category || '—'}</p>
      </div>
    )},
    { key: 'quantity', label: 'Stock', render: (v, row) => (
      <div className="flex items-center gap-2">
        <span className={`text-sm font-semibold ${v <= row.lowStockThreshold ? 'text-red-400' : 'text-white'}`}>{v} {row.unit}</span>
        {v <= row.lowStockThreshold && <AlertTriangle size={12} className="text-amber-400" />}
      </div>
    )},
    { key: 'price', label: 'Sell Price', render: v => <span className="text-sm text-slate-300">{formatCurrency(v)}</span> },
    { key: 'costPrice', label: 'Cost', render: v => <span className="text-xs text-slate-400">{formatCurrency(v)}</span> },
    { key: 'gstRate', label: 'GST', render: v => <Badge variant="info">{v}%</Badge> },
    { key: 'isLowStock', label: 'Status', render: (_, row) => (
      <Badge variant={row.quantity === 0 ? 'danger' : row.quantity <= row.lowStockThreshold ? 'warning' : 'success'}>
        {row.quantity === 0 ? 'Out of Stock' : row.quantity <= row.lowStockThreshold ? 'Low Stock' : 'In Stock'}
      </Badge>
    )},
    { key: '_id', label: '', render: (id, row) => (
      <div className="flex items-center gap-1 justify-end">
        <Button variant="ghost" size="icon" icon={<ArrowUpDown size={13} className="text-blue-400" />}
          onClick={e => { e.stopPropagation(); setStockProduct(row); setShowStockModal(true); }} />
        <Button variant="ghost" size="icon" icon={<Edit2 size={13} />}
          onClick={e => { e.stopPropagation(); setEditData(row); setShowModal(true); }} />
        <Button variant="ghost" size="icon" icon={<Trash2 size={13} className="text-red-400" />}
          onClick={e => { e.stopPropagation(); handleDelete(id); }} />
      </div>
    )},
  ];

  const inventoryStats = stats?.stats;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <div><h1 className="text-xl font-bold text-white">Inventory</h1><p className="text-sm text-slate-500 mt-0.5">{pagination.total} products</p></div>
        <Button size="sm" icon={<Plus size={14} />} onClick={() => { setEditData(null); setShowModal(true); }}>Add Product</Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 stagger">
        <StatCard label="Total Products" color="blue" value={inventoryStats?.totalProducts || 0} icon={<Package size={18} />} loading={loading} />
        <StatCard label="Inventory Value" color="green" value={formatCurrency(inventoryStats?.totalValue)} icon={<Package size={18} />} loading={loading} />
        <StatCard label="Retail Value" color="purple" value={formatCurrency(inventoryStats?.totalRetailValue)} icon={<TrendingDown size={18} />} loading={loading} />
        <StatCard label="Low Stock Items" color="red" value={inventoryStats?.lowStockCount || 0}
          sublabel={inventoryStats?.outOfStockCount > 0 ? `${inventoryStats.outOfStockCount} out of stock` : ''}
          icon={<AlertTriangle size={18} />} loading={loading} />
      </div>

      <div className="flex items-center gap-3">
        <Input placeholder="Search products..." value={filters.search} onChange={e => setFilters(f => ({ ...f, search: e.target.value }))} wrapperClass="max-w-xs" />
        <button onClick={() => setFilters(f => ({ ...f, lowStock: f.lowStock ? '' : 'true' }))}
          className={`px-3 py-2 rounded-lg text-xs font-medium border transition-colors flex items-center gap-1.5 ${filters.lowStock ? 'bg-amber-500/15 border-amber-500/30 text-amber-400' : 'bg-[#131929] border-[#1e2d45] text-slate-400'}`}>
          <AlertTriangle size={12} /> Low Stock Only
        </button>
      </div>

      <Card className="p-0 overflow-hidden">
        <Table columns={columns} data={products} loading={loading}
          emptyState="No products yet. Add your first product to start tracking inventory." emptyIcon="📦" />
        <Pagination page={pagination.page} pages={pagination.pages} total={pagination.total} limit={pagination.limit} onPage={fetchAll} />
      </Card>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editData ? 'Edit Product' : 'Add Product'} size="md">
        <ProductForm businessId={businessId} editData={editData}
          onSave={() => { setShowModal(false); fetchAll(); }} onClose={() => setShowModal(false)} />
      </Modal>

      <Modal isOpen={showStockModal} onClose={() => setShowStockModal(false)} title="Adjust Stock" size="sm">
        {stockProduct && <StockAdjustModal product={stockProduct}
          onClose={() => setShowStockModal(false)} onSave={() => { setShowStockModal(false); fetchAll(); }} />}
      </Modal>
    </div>
  );
}
