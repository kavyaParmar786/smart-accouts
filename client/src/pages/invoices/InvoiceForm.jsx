// InvoiceForm - Full invoice builder with GST, line items, totals
import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { invoiceAPI } from '../../services/api';
import { Button, Input, Select, Textarea } from '../../components/ui';
import { formatCurrency, formatDateInput } from '../../utils/helpers';
import toast from 'react-hot-toast';

const EMPTY_ITEM = { name: '', description: '', quantity: 1, rate: 0, gstRate: 18 };

const calcItem = (item) => {
  const amount = (item.quantity || 0) * (item.rate || 0);
  const gstAmount = (amount * (item.gstRate || 0)) / 100;
  return { ...item, amount, gstAmount, total: amount + gstAmount };
};

export default function InvoiceForm({ businessId, onSuccess, onCancel, editData }) {
  const [form, setForm] = useState({
    customer: { name: '', email: '', phone: '', address: '', gstin: '' },
    items: [{ ...EMPTY_ITEM }],
    dueDate: '',
    notes: '',
    discount: 0,
    ...editData,
  });
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  const setCustomer = (field) => (e) =>
    setForm(f => ({ ...f, customer: { ...f.customer, [field]: e.target.value } }));

  const setItem = (idx, field) => (e) => {
    const val = ['quantity', 'rate', 'gstRate'].includes(field) ? parseFloat(e.target.value) || 0 : e.target.value;
    setForm(f => {
      const items = [...f.items];
      items[idx] = { ...items[idx], [field]: val };
      return { ...f, items };
    });
  };

  const addItem = () => setForm(f => ({ ...f, items: [...f.items, { ...EMPTY_ITEM }] }));
  const removeItem = (idx) => setForm(f => ({ ...f, items: f.items.filter((_, i) => i !== idx) }));

  const calcTotals = () => {
    const items = form.items.map(calcItem);
    const subtotal = items.reduce((s, i) => s + i.amount, 0);
    const totalGst = items.reduce((s, i) => s + i.gstAmount, 0);
    const grandTotal = subtotal + totalGst - (parseFloat(form.discount) || 0);
    return { items, subtotal, totalGst, grandTotal };
  };

  const { items: calcItems, subtotal, totalGst, grandTotal } = calcTotals();

  const validate = () => {
    const e = {};
    if (!form.customer.name) e.customerName = 'Customer name required';
    if (!form.items.length) e.items = 'Add at least one item';
    const invalidItem = form.items.find(i => !i.name || i.quantity <= 0 || i.rate <= 0);
    if (invalidItem) e.items = 'All items need name, quantity, and rate';
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const payload = {
        businessId,
        customer: form.customer,
        items: form.items,
        dueDate: form.dueDate || undefined,
        notes: form.notes,
        discount: parseFloat(form.discount) || 0,
      };
      if (editData?._id) {
        await invoiceAPI.update(editData._id, payload);
        toast.success('Invoice updated');
      } else {
        await invoiceAPI.create(payload);
        toast.success('Invoice created!');
      }
      onSuccess?.();
    } catch {}
    setSaving(false);
  };

  return (
    <div className="space-y-6">
      {/* Customer Section */}
      <div>
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Customer Details</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input label="Customer Name *" placeholder="Raj Enterprises" value={form.customer.name} onChange={setCustomer('name')} error={errors.customerName} />
          <Input label="Email" type="email" placeholder="raj@example.com" value={form.customer.email} onChange={setCustomer('email')} />
          <Input label="Phone" placeholder="+91 98765 43210" value={form.customer.phone} onChange={setCustomer('phone')} />
          <Input label="GSTIN" placeholder="29AABCT1332L1ZG" value={form.customer.gstin} onChange={setCustomer('gstin')} />
          <Input label="Address" placeholder="123 Business Park, Mumbai" value={form.customer.address} onChange={setCustomer('address')} wrapperClass="sm:col-span-2" />
        </div>
      </div>

      {/* Invoice Details */}
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Due Date</label>
          <input type="date" value={form.dueDate ? formatDateInput(form.dueDate) : ''}
            onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))}
            className="bg-[#0f1420] border border-[#1e2d45] rounded-lg text-sm text-slate-200 px-4 py-2.5 focus:outline-none focus:border-blue-500" />
        </div>
        <Input label="Discount (₹)" type="number" value={form.discount} onChange={e => setForm(f => ({ ...f, discount: e.target.value }))} min="0" />
      </div>

      {/* Line Items */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Line Items</h3>
          <Button variant="secondary" size="sm" icon={<Plus size={12} />} onClick={addItem}>Add Item</Button>
        </div>
        {errors.items && <p className="text-xs text-red-400 mb-2">{errors.items}</p>}

        <div className="space-y-2">
          {/* Header */}
          <div className="grid grid-cols-12 gap-2 px-2">
            <span className="col-span-4 text-[10px] text-slate-600 uppercase">Item</span>
            <span className="col-span-2 text-[10px] text-slate-600 uppercase">Qty</span>
            <span className="col-span-2 text-[10px] text-slate-600 uppercase">Rate (₹)</span>
            <span className="col-span-1 text-[10px] text-slate-600 uppercase">GST%</span>
            <span className="col-span-2 text-[10px] text-slate-600 uppercase text-right">Total</span>
            <span className="col-span-1" />
          </div>

          {form.items.map((item, idx) => {
            const calc = calcItem(item);
            return (
              <div key={idx} className="grid grid-cols-12 gap-2 items-center bg-[#0f1420] border border-[#1e2d45] rounded-xl p-2">
                <div className="col-span-4">
                  <input value={item.name} onChange={setItem(idx, 'name')} placeholder="Product / Service"
                    className="w-full bg-transparent text-sm text-slate-200 placeholder-slate-600 focus:outline-none" />
                </div>
                <div className="col-span-2">
                  <input type="number" value={item.quantity} onChange={setItem(idx, 'quantity')} min="1"
                    className="w-full bg-[#131929] border border-[#1e2d45] rounded-lg text-sm text-slate-200 px-2 py-1 text-center focus:outline-none focus:border-blue-500" />
                </div>
                <div className="col-span-2">
                  <input type="number" value={item.rate} onChange={setItem(idx, 'rate')} min="0" step="0.01"
                    className="w-full bg-[#131929] border border-[#1e2d45] rounded-lg text-sm text-slate-200 px-2 py-1 text-center focus:outline-none focus:border-blue-500" />
                </div>
                <div className="col-span-1">
                  <select value={item.gstRate} onChange={setItem(idx, 'gstRate')}
                    className="w-full bg-[#131929] border border-[#1e2d45] rounded-lg text-xs text-slate-200 px-1 py-1 focus:outline-none focus:border-blue-500">
                    {[0, 5, 12, 18, 28].map(r => <option key={r} value={r}>{r}%</option>)}
                  </select>
                </div>
                <div className="col-span-2 text-right">
                  <span className="text-sm font-semibold text-white">{formatCurrency(calc.total)}</span>
                  {item.gstRate > 0 && <p className="text-[10px] text-slate-500">+GST {formatCurrency(calc.gstAmount)}</p>}
                </div>
                <div className="col-span-1 flex justify-end">
                  {form.items.length > 1 && (
                    <button onClick={() => removeItem(idx)} className="p-1 hover:bg-red-500/10 rounded-lg text-slate-600 hover:text-red-400 transition-colors">
                      <Trash2 size={12} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Totals */}
      <div className="bg-[#0f1420] border border-[#1e2d45] rounded-xl p-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-slate-400">Subtotal</span>
          <span className="text-slate-200">{formatCurrency(subtotal)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-slate-400">GST</span>
          <span className="text-slate-200">{formatCurrency(totalGst)}</span>
        </div>
        {parseFloat(form.discount) > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-emerald-400">Discount</span>
            <span className="text-emerald-400">-{formatCurrency(form.discount)}</span>
          </div>
        )}
        <div className="flex justify-between text-base font-bold pt-2 border-t border-[#1e2d45]">
          <span className="text-white">Grand Total</span>
          <span className="text-blue-400">{formatCurrency(grandTotal)}</span>
        </div>
      </div>

      <Textarea label="Notes / Terms (optional)" placeholder="Thank you for your business..." value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2} />

      <div className="flex gap-3 pt-2">
        <Button variant="secondary" className="flex-1" onClick={onCancel}>Cancel</Button>
        <Button className="flex-1" onClick={handleSubmit} loading={saving}>
          {editData?._id ? 'Update Invoice' : 'Create Invoice'}
        </Button>
      </div>
    </div>
  );
}
