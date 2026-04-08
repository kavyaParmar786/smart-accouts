// Invoice Builder - Full form with dynamic line items and GST
import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { invoiceAPI } from '../../services/api';
import { Button, Input, Select, Textarea } from '../../components/ui/index.jsx';
import { formatCurrency } from '../../utils/helpers';
import toast from 'react-hot-toast';

const EMPTY_ITEM = { name: '', description: '', quantity: 1, rate: 0, gstRate: 18 };

export default function InvoiceBuilder({ businessId, editData, onSave, onClose }) {
  const [form, setForm] = useState({
    customer: editData?.customer || { name: '', email: '', phone: '', address: '', gstin: '' },
    items: editData?.items?.length ? editData.items : [{ ...EMPTY_ITEM }],
    dueDate: editData?.dueDate ? editData.dueDate.split('T')[0] : '',
    notes: editData?.notes || '',
    discount: editData?.discount || 0,
    businessId,
  });
  const [loading, setLoading] = useState(false);

  const setCustomer = k => e => setForm(f => ({ ...f, customer: { ...f.customer, [k]: e.target.value } }));
  const setItem = (idx, k) => e => {
    const items = [...form.items];
    items[idx] = { ...items[idx], [k]: k === 'name' || k === 'description' ? e.target.value : parseFloat(e.target.value) || 0 };
    setForm(f => ({ ...f, items }));
  };
  const addItem = () => setForm(f => ({ ...f, items: [...f.items, { ...EMPTY_ITEM }] }));
  const removeItem = idx => setForm(f => ({ ...f, items: f.items.filter((_, i) => i !== idx) }));

  // Calculate totals
  const calcItem = (item) => {
    const amount = item.quantity * item.rate;
    const gstAmount = (amount * (item.gstRate || 0)) / 100;
    return { amount, gstAmount, total: amount + gstAmount };
  };

  const subtotal = form.items.reduce((s, item) => s + calcItem(item).amount, 0);
  const totalGst = form.items.reduce((s, item) => s + calcItem(item).gstAmount, 0);
  const grandTotal = subtotal + totalGst - (parseFloat(form.discount) || 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.customer.name) return toast.error('Customer name is required');
    if (!form.items.length || !form.items[0].name) return toast.error('Add at least one item');
    setLoading(true);
    try {
      if (editData?._id) await invoiceAPI.update(editData._id, form);
      else await invoiceAPI.create(form);
      toast.success(editData ? 'Invoice updated!' : 'Invoice created!');
      onSave();
    } catch {} finally { setLoading(false); }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Customer Details */}
      <div>
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Bill To</h3>
        <div className="grid grid-cols-2 gap-3">
          <Input label="Customer Name *" placeholder="Acme Corp" value={form.customer.name} onChange={setCustomer('name')} />
          <Input label="Email" type="email" placeholder="billing@acme.com" value={form.customer.email} onChange={setCustomer('email')} />
          <Input label="Phone" placeholder="+91 98765 43210" value={form.customer.phone} onChange={setCustomer('phone')} />
          <Input label="GSTIN" placeholder="22AAAAA0000A1Z5" value={form.customer.gstin} onChange={setCustomer('gstin')} />
          <Input label="Due Date" type="date" value={form.dueDate} onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))} wrapperClass="col-span-2" />
          <Textarea label="Billing Address" placeholder="123 Main Street, Mumbai, Maharashtra - 400001" value={form.customer.address} onChange={setCustomer('address')} wrapperClass="col-span-2" />
        </div>
      </div>

      {/* Line Items */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Items & Services</h3>
          <Button type="button" variant="secondary" size="sm" icon={<Plus size={12} />} onClick={addItem}>Add Item</Button>
        </div>

        <div className="space-y-2">
          {/* Header */}
          <div className="grid grid-cols-12 gap-2 px-2 text-[10px] font-semibold text-slate-600 uppercase tracking-wider">
            <span className="col-span-4">Item / Service</span>
            <span className="col-span-2 text-center">Qty</span>
            <span className="col-span-2 text-center">Rate (₹)</span>
            <span className="col-span-2 text-center">GST %</span>
            <span className="col-span-1 text-right">Total</span>
            <span className="col-span-1" />
          </div>

          {form.items.map((item, idx) => {
            const { total } = calcItem(item);
            return (
              <div key={idx} className="grid grid-cols-12 gap-2 items-center bg-[#0f1420] border border-[#1e2d45] rounded-xl p-2">
                <div className="col-span-4">
                  <input placeholder="Item name" value={item.name} onChange={setItem(idx, 'name')}
                    className="w-full bg-transparent text-sm text-slate-200 placeholder-slate-600 focus:outline-none py-1" />
                  <input placeholder="Description (optional)" value={item.description || ''} onChange={setItem(idx, 'description')}
                    className="w-full bg-transparent text-xs text-slate-500 placeholder-slate-700 focus:outline-none" />
                </div>
                <input type="number" min="0" step="1" value={item.quantity} onChange={setItem(idx, 'quantity')}
                  className="col-span-2 bg-[#131929] border border-[#1e2d45] rounded-lg text-sm text-center text-slate-200 py-1.5 focus:outline-none focus:border-blue-500" />
                <input type="number" min="0" step="0.01" value={item.rate} onChange={setItem(idx, 'rate')}
                  className="col-span-2 bg-[#131929] border border-[#1e2d45] rounded-lg text-sm text-center text-slate-200 py-1.5 focus:outline-none focus:border-blue-500" />
                <select value={item.gstRate} onChange={setItem(idx, 'gstRate')}
                  className="col-span-2 bg-[#131929] border border-[#1e2d45] rounded-lg text-sm text-center text-slate-200 py-1.5 focus:outline-none focus:border-blue-500">
                  {[0, 5, 12, 18, 28].map(r => <option key={r} value={r}>{r}%</option>)}
                </select>
                <span className="col-span-1 text-right text-xs font-semibold text-blue-400">{formatCurrency(total)}</span>
                <button type="button" onClick={() => removeItem(idx)} disabled={form.items.length === 1}
                  className="col-span-1 flex justify-center text-slate-600 hover:text-red-400 disabled:opacity-20 transition-colors">
                  <Trash2 size={13} />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Totals + Notes */}
      <div className="grid grid-cols-2 gap-6">
        <Textarea label="Notes / Terms" placeholder="Thank you for your business!" value={form.notes}
          onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
        <div className="bg-[#0f1420] border border-[#1e2d45] rounded-xl p-4 space-y-2.5">
          <div className="flex justify-between text-sm"><span className="text-slate-400">Subtotal</span><span className="text-slate-200">{formatCurrency(subtotal)}</span></div>
          <div className="flex justify-between text-sm"><span className="text-slate-400">GST</span><span className="text-slate-200">{formatCurrency(totalGst)}</span></div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-slate-400">Discount</span>
            <input type="number" min="0" value={form.discount} onChange={e => setForm(f => ({ ...f, discount: parseFloat(e.target.value) || 0 }))}
              className="w-24 bg-[#131929] border border-[#1e2d45] rounded-lg text-sm text-right text-slate-200 py-1 px-2 focus:outline-none focus:border-blue-500" />
          </div>
          <div className="border-t border-[#1e2d45] pt-2.5 flex justify-between">
            <span className="text-sm font-semibold text-white">Grand Total</span>
            <span className="text-lg font-bold text-blue-400">{formatCurrency(grandTotal)}</span>
          </div>
        </div>
      </div>

      <div className="flex gap-2 pt-1">
        <Button type="button" variant="secondary" className="flex-1" onClick={onClose}>Cancel</Button>
        <Button type="submit" className="flex-1" loading={loading}>{editData ? 'Update Invoice' : 'Create Invoice'}</Button>
      </div>
    </form>
  );
}
