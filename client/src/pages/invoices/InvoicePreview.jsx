// Invoice Preview Component with PDF Export (jsPDF)
import { useState } from 'react';
import { Download, CheckCircle, Send, CreditCard } from 'lucide-react';
import { invoiceAPI } from '../../services/api';
import { Button, Badge, Input, Select, Modal } from '../../components/ui/index.jsx';
import { formatCurrency, formatDate } from '../../utils/helpers';
import toast from 'react-hot-toast';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const STATUS_BADGE = { paid: 'success', sent: 'info', draft: 'default', overdue: 'danger', cancelled: 'default' };

function PaymentModal({ invoice, onClose, onPaid }) {
  const [form, setForm] = useState({ amount: invoice.grandTotal - invoice.amountPaid, method: 'bank', note: '' });
  const [loading, setLoading] = useState(false);
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const handlePay = async () => {
    setLoading(true);
    try {
      await invoiceAPI.recordPayment(invoice._id, form);
      toast.success('Payment recorded!');
      onPaid();
    } catch {} finally { setLoading(false); }
  };

  return (
    <div className="space-y-4">
      <div className="bg-[#0f1420] rounded-xl p-4 border border-[#1e2d45]">
        <div className="flex justify-between text-sm mb-1"><span className="text-slate-400">Invoice Total</span><span className="font-semibold text-white">{formatCurrency(invoice.grandTotal)}</span></div>
        <div className="flex justify-between text-sm mb-1"><span className="text-slate-400">Already Paid</span><span className="text-emerald-400">{formatCurrency(invoice.amountPaid)}</span></div>
        <div className="flex justify-between text-sm border-t border-[#1e2d45] pt-2 mt-2"><span className="text-slate-300 font-medium">Outstanding</span><span className="text-red-400 font-bold">{formatCurrency(invoice.grandTotal - invoice.amountPaid)}</span></div>
      </div>
      <Input label="Payment Amount (₹)" type="number" value={form.amount} onChange={set('amount')} />
      <Select label="Payment Method" value={form.method} onChange={set('method')}>
        {['cash', 'bank', 'upi', 'card', 'cheque'].map(m => <option key={m} value={m}>{m.toUpperCase()}</option>)}
      </Select>
      <Input label="Note (optional)" placeholder="Transaction reference, cheque no..." value={form.note} onChange={set('note')} />
      <div className="flex gap-2">
        <Button variant="secondary" className="flex-1" onClick={onClose}>Cancel</Button>
        <Button className="flex-1" loading={loading} icon={<CheckCircle size={14} />} onClick={handlePay}>Record Payment</Button>
      </div>
    </div>
  );
}

export default function InvoicePreview({ invoice, onClose, onRefresh }) {
  const [showPayModal, setShowPayModal] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    const pageW = doc.internal.pageSize.getWidth();

    // Header
    doc.setFillColor(11, 17, 32);
    doc.rect(0, 0, pageW, 45, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont(undefined, 'bold');
    doc.text('INVOICE', 15, 22);
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(180, 190, 210);
    doc.text(invoice.invoiceNumber, 15, 32);
    doc.text(`Date: ${formatDate(invoice.issueDate)}`, pageW - 15, 22, { align: 'right' });
    if (invoice.dueDate) doc.text(`Due: ${formatDate(invoice.dueDate)}`, pageW - 15, 32, { align: 'right' });

    // Status badge
    const statusColors = { paid: [16, 185, 129], sent: [59, 130, 246], draft: [100, 116, 139], overdue: [239, 68, 68] };
    const [r, g, b] = statusColors[invoice.status] || [100, 116, 139];
    doc.setFillColor(r, g, b);
    doc.roundedRect(pageW - 45, 36, 30, 7, 2, 2, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.text(invoice.status.toUpperCase(), pageW - 30, 41, { align: 'center' });

    // Bill To
    doc.setTextColor(30, 30, 30);
    doc.setFontSize(9);
    doc.setFont(undefined, 'bold');
    doc.text('BILL TO', 15, 58);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(60, 60, 60);
    doc.text(invoice.customer.name, 15, 66);
    if (invoice.customer.email) doc.text(invoice.customer.email, 15, 72);
    if (invoice.customer.phone) doc.text(invoice.customer.phone, 15, 78);
    if (invoice.customer.gstin) doc.text('GSTIN: ' + invoice.customer.gstin, 15, 84);
    if (invoice.customer.address) {
      const lines = doc.splitTextToSize(invoice.customer.address, 80);
      doc.text(lines, 15, 90);
    }

    // Items table
    autoTable(doc, {
      startY: 105,
      head: [['Item', 'Description', 'Qty', 'Rate', 'GST %', 'Amount']],
      body: invoice.items.map(item => [
        item.name, item.description || '', item.quantity,
        `₹${item.rate.toFixed(2)}`, `${item.gstRate}%`, `₹${item.total.toFixed(2)}`,
      ]),
      styles: { fontSize: 9, cellPadding: 4, textColor: [30, 30, 30] },
      headStyles: { fillColor: [11, 17, 32], textColor: [255, 255, 255], fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [245, 247, 250] },
      columnStyles: { 0: { cellWidth: 40 }, 5: { halign: 'right' } },
      margin: { left: 15, right: 15 },
    });

    const finalY = doc.lastAutoTable.finalY + 10;

    // Totals
    const totals = [
      ['Subtotal', `₹${invoice.subtotal.toFixed(2)}`],
      ['GST', `₹${invoice.totalGst.toFixed(2)}`],
    ];
    if (invoice.discount) totals.push(['Discount', `-₹${invoice.discount.toFixed(2)}`]);
    totals.push(['GRAND TOTAL', `₹${invoice.grandTotal.toFixed(2)}`]);

    autoTable(doc, {
      startY: finalY,
      body: totals,
      styles: { fontSize: 9, cellPadding: 3, textColor: [30, 30, 30] },
      columnStyles: { 0: { cellWidth: 140, fontStyle: 'normal', textColor: [100, 116, 139] }, 1: { halign: 'right', fontStyle: 'normal' } },
      bodyStyles: { lineColor: [230, 234, 240] },
      didParseCell: (data) => {
        if (data.row.index === totals.length - 1) {
          data.cell.styles.fontStyle = 'bold';
          data.cell.styles.fontSize = 11;
          data.cell.styles.textColor = [11, 17, 32];
          data.cell.styles.fillColor = [237, 242, 255];
        }
      },
      margin: { left: pageW - 100, right: 15 },
      tableWidth: 85,
    });

    // Notes
    if (invoice.notes) {
      doc.setFontSize(9);
      doc.setFont(undefined, 'bold');
      doc.setTextColor(100, 116, 139);
      doc.text('NOTES', 15, doc.lastAutoTable.finalY + 12);
      doc.setFont(undefined, 'normal');
      doc.setTextColor(60, 60, 60);
      const noteLines = doc.splitTextToSize(invoice.notes, pageW - 30);
      doc.text(noteLines, 15, doc.lastAutoTable.finalY + 20);
    }

    // Footer
    doc.setFillColor(245, 247, 250);
    doc.rect(0, doc.internal.pageSize.getHeight() - 15, pageW, 15, 'F');
    doc.setFontSize(8);
    doc.setTextColor(150, 160, 175);
    doc.text('Generated by SmartAccounts · smartaccounts.io', pageW / 2, doc.internal.pageSize.getHeight() - 5, { align: 'center' });

    doc.save(`${invoice.invoiceNumber}.pdf`);
    toast.success('PDF downloaded!');
  };

  const handleMarkSent = async () => {
    setUpdatingStatus(true);
    try { await invoiceAPI.update(invoice._id, { status: 'sent' }); toast.success('Marked as sent'); onRefresh(); onClose(); } catch {}
    setUpdatingStatus(false);
  };

  const remaining = invoice.grandTotal - invoice.amountPaid;

  return (
    <div className="space-y-5">
      {/* Invoice header */}
      <div className="flex items-start justify-between bg-gradient-to-r from-[#0f1420] to-[#131929] rounded-xl p-5 border border-[#1e2d45]">
        <div>
          <p className="text-xs text-slate-500 mb-1">Invoice Number</p>
          <p className="text-xl font-bold font-mono text-white">{invoice.invoiceNumber}</p>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant={STATUS_BADGE[invoice.status]}>{invoice.status}</Badge>
            {invoice.dueDate && new Date(invoice.dueDate) < new Date() && invoice.status !== 'paid' && (
              <Badge variant="danger">Overdue</Badge>
            )}
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-500 mb-1">Grand Total</p>
          <p className="text-2xl font-bold text-white">{formatCurrency(invoice.grandTotal)}</p>
          {invoice.amountPaid > 0 && (
            <p className="text-xs text-emerald-400 mt-1">Paid: {formatCurrency(invoice.amountPaid)}</p>
          )}
        </div>
      </div>

      {/* Customer + Dates */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-[#0f1420] border border-[#1e2d45] rounded-xl p-4">
          <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Bill To</p>
          <p className="text-sm font-semibold text-white">{invoice.customer.name}</p>
          {invoice.customer.email && <p className="text-xs text-slate-400 mt-0.5">{invoice.customer.email}</p>}
          {invoice.customer.phone && <p className="text-xs text-slate-400">{invoice.customer.phone}</p>}
          {invoice.customer.gstin && <p className="text-xs text-slate-500 mt-1">GST: {invoice.customer.gstin}</p>}
        </div>
        <div className="bg-[#0f1420] border border-[#1e2d45] rounded-xl p-4">
          <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Details</p>
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs"><span className="text-slate-500">Issue Date</span><span className="text-slate-300">{formatDate(invoice.issueDate)}</span></div>
            {invoice.dueDate && <div className="flex justify-between text-xs"><span className="text-slate-500">Due Date</span><span className={new Date(invoice.dueDate) < new Date() ? 'text-red-400' : 'text-slate-300'}>{formatDate(invoice.dueDate)}</span></div>}
            {invoice.paidDate && <div className="flex justify-between text-xs"><span className="text-slate-500">Paid On</span><span className="text-emerald-400">{formatDate(invoice.paidDate)}</span></div>}
          </div>
        </div>
      </div>

      {/* Items */}
      <div className="bg-[#0f1420] border border-[#1e2d45] rounded-xl overflow-hidden">
        <table className="w-full text-xs">
          <thead className="bg-[#131929]">
            <tr>
              {['Item', 'Qty', 'Rate', 'GST', 'Total'].map(h => (
                <th key={h} className={`px-3 py-2.5 text-slate-500 font-semibold uppercase tracking-wider text-left ${h === 'Total' ? 'text-right' : ''}`}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {invoice.items.map((item, i) => (
              <tr key={i} className="border-t border-[#1e2d45]/50">
                <td className="px-3 py-2.5"><p className="font-medium text-slate-200">{item.name}</p>{item.description && <p className="text-slate-500">{item.description}</p>}</td>
                <td className="px-3 py-2.5 text-slate-400">{item.quantity}</td>
                <td className="px-3 py-2.5 text-slate-400">{formatCurrency(item.rate)}</td>
                <td className="px-3 py-2.5 text-slate-400">{item.gstRate}%</td>
                <td className="px-3 py-2.5 text-right font-semibold text-white">{formatCurrency(item.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="border-t border-[#1e2d45] p-4 flex justify-end">
          <div className="space-y-1.5 min-w-[200px]">
            <div className="flex justify-between text-xs"><span className="text-slate-400">Subtotal</span><span className="text-slate-300">{formatCurrency(invoice.subtotal)}</span></div>
            <div className="flex justify-between text-xs"><span className="text-slate-400">GST</span><span className="text-slate-300">{formatCurrency(invoice.totalGst)}</span></div>
            {invoice.discount > 0 && <div className="flex justify-between text-xs"><span className="text-slate-400">Discount</span><span className="text-red-400">-{formatCurrency(invoice.discount)}</span></div>}
            <div className="flex justify-between text-sm font-bold border-t border-[#1e2d45] pt-2 mt-2">
              <span className="text-white">Total</span><span className="text-blue-400">{formatCurrency(invoice.grandTotal)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 flex-wrap">
        <Button variant="secondary" size="sm" icon={<Download size={13} />} onClick={handleDownloadPDF}>Download PDF</Button>
        {invoice.status === 'draft' && <Button variant="secondary" size="sm" icon={<Send size={13} />} loading={updatingStatus} onClick={handleMarkSent}>Mark as Sent</Button>}
        {invoice.status !== 'paid' && invoice.status !== 'cancelled' && remaining > 0 && (
          <Button size="sm" icon={<CreditCard size={13} />} onClick={() => setShowPayModal(true)}>Record Payment</Button>
        )}
      </div>

      <Modal isOpen={showPayModal} onClose={() => setShowPayModal(false)} title="Record Payment" size="sm">
        <PaymentModal invoice={invoice} onClose={() => setShowPayModal(false)}
          onPaid={() => { setShowPayModal(false); onRefresh(); onClose(); }} />
      </Modal>
    </div>
  );
}
