// Invoice Detail Page - View + PDF Download
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, Send, CheckCircle, X } from 'lucide-react';
import { invoiceAPI } from '../../services/api';
import { Button, Badge, Card, PageLoader } from '../../components/ui';
import { formatCurrency, formatDate } from '../../utils/helpers';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import toast from 'react-hot-toast';

const STATUS_MAP = {
  draft: { label: 'Draft', variant: 'default' },
  sent: { label: 'Sent', variant: 'info' },
  paid: { label: 'Paid', variant: 'success' },
  overdue: { label: 'Overdue', variant: 'danger' },
  cancelled: { label: 'Cancelled', variant: 'default' },
};

export default function InvoiceDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    invoiceAPI.get(id).then(r => { setInvoice(r.data.data.invoice); setLoading(false); }).catch(() => setLoading(false));
  }, [id]);

  const downloadPDF = () => {
    if (!invoice) return;
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const biz = invoice.business || {};
    const W = doc.internal.pageSize.getWidth();

    // Header background
    doc.setFillColor(15, 20, 32);
    doc.rect(0, 0, W, 45, 'F');

    // Company name
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text(biz.name || 'Company Name', 14, 18);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(148, 163, 184);
    if (biz.gstin) doc.text(`GSTIN: ${biz.gstin}`, 14, 26);
    if (biz.address?.city) doc.text(`${biz.address.city}, ${biz.address.state || ''}`, 14, 32);

    // Invoice label
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(59, 130, 246);
    doc.text('INVOICE', W - 14, 20, { align: 'right' });

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(148, 163, 184);
    doc.text(invoice.invoiceNumber, W - 14, 28, { align: 'right' });
    doc.text(`Date: ${formatDate(invoice.issueDate)}`, W - 14, 34, { align: 'right' });
    if (invoice.dueDate) doc.text(`Due: ${formatDate(invoice.dueDate)}`, W - 14, 40, { align: 'right' });

    // Bill To
    doc.setFillColor(19, 25, 41);
    doc.rect(0, 50, W, 30, 'F');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.setFont('helvetica', 'bold');
    doc.text('BILL TO', 14, 59);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(241, 245, 249);
    doc.setFontSize(11);
    doc.text(invoice.customer?.name || '', 14, 67);
    doc.setFontSize(9);
    doc.setTextColor(148, 163, 184);
    if (invoice.customer?.phone) doc.text(invoice.customer.phone, 14, 73);
    if (invoice.customer?.gstin) doc.text(`GSTIN: ${invoice.customer.gstin}`, 14, 79);

    // Items table
    const tableRows = invoice.items?.map(item => [
      item.name + (item.description ? `\n${item.description}` : ''),
      item.quantity,
      `₹${item.rate?.toLocaleString('en-IN')}`,
      `${item.gstRate}%`,
      `₹${(item.amount || 0).toLocaleString('en-IN')}`,
      `₹${(item.total || 0).toLocaleString('en-IN')}`,
    ]) || [];

    doc.autoTable({
      startY: 88,
      head: [['Item / Description', 'Qty', 'Rate', 'GST', 'Amount', 'Total']],
      body: tableRows,
      theme: 'grid',
      headStyles: {
        fillColor: [15, 20, 32],
        textColor: [148, 163, 184],
        fontSize: 8,
        fontStyle: 'bold',
        cellPadding: 4,
      },
      bodyStyles: {
        fillColor: [19, 25, 41],
        textColor: [241, 245, 249],
        fontSize: 9,
        cellPadding: 4,
        lineColor: [30, 45, 69],
        lineWidth: 0.3,
      },
      alternateRowStyles: { fillColor: [15, 20, 32] },
      columnStyles: {
        0: { cellWidth: 70 },
        1: { halign: 'center' },
        2: { halign: 'right' },
        3: { halign: 'center' },
        4: { halign: 'right' },
        5: { halign: 'right' },
      },
    });

    const finalY = doc.lastAutoTable.finalY + 8;

    // Totals box
    doc.setFillColor(15, 20, 32);
    doc.rect(W - 80, finalY, 66, 45, 'F');

    const totalsData = [
      ['Subtotal:', `₹${(invoice.subtotal||0).toLocaleString('en-IN')}`],
      ['GST:', `₹${(invoice.totalGst||0).toLocaleString('en-IN')}`],
    ];
    if (invoice.discount > 0) totalsData.push(['Discount:', `-₹${invoice.discount.toLocaleString('en-IN')}`]);

    let ty = finalY + 8;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    totalsData.forEach(([label, val]) => {
      doc.setTextColor(148, 163, 184);
      doc.text(label, W - 76, ty);
      doc.setTextColor(241, 245, 249);
      doc.text(val, W - 14, ty, { align: 'right' });
      ty += 7;
    });

    // Grand Total
    ty += 2;
    doc.setDrawColor(59, 130, 246);
    doc.line(W - 80, ty - 2, W - 14, ty - 2);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(59, 130, 246);
    doc.text('TOTAL:', W - 76, ty + 6);
    doc.text(`₹${(invoice.grandTotal||0).toLocaleString('en-IN')}`, W - 14, ty + 6, { align: 'right' });

    // Notes
    if (invoice.notes) {
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 116, 139);
      doc.text('Notes:', 14, finalY + 8);
      doc.setTextColor(148, 163, 184);
      doc.text(invoice.notes, 14, finalY + 15, { maxWidth: 100 });
    }

    // Status stamp
    if (invoice.status === 'paid') {
      doc.setTextColor(16, 185, 129);
      doc.setFontSize(40);
      doc.setFont('helvetica', 'bold');
      doc.setGState(new doc.GState({ opacity: 0.15 }));
      doc.text('PAID', W / 2, 150, { align: 'center', angle: 30 });
      doc.setGState(new doc.GState({ opacity: 1 }));
    }

    // Footer
    doc.setFillColor(15, 20, 32);
    doc.rect(0, 280, W, 17, 'F');
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    doc.text('Generated by SmartAccounts — smartaccounts.in', W / 2, 290, { align: 'center' });

    doc.save(`${invoice.invoiceNumber}.pdf`);
    toast.success('PDF downloaded!');
  };

  if (loading) return <PageLoader />;
  if (!invoice) return <div className="p-6 text-slate-400">Invoice not found</div>;

  const status = STATUS_MAP[invoice.status] || {};

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}><ArrowLeft size={16} /></Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-white font-mono">{invoice.invoiceNumber}</h1>
              <Badge variant={status.variant}>{status.label}</Badge>
            </div>
            <p className="text-xs text-slate-500">Created {formatDate(invoice.issueDate)}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" icon={<Download size={13} />} onClick={downloadPDF}>Download PDF</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Invoice details */}
        <Card className="md:col-span-2 space-y-5">
          {/* Business + Customer */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-[10px] text-slate-500 uppercase mb-1">From</p>
              <p className="text-sm font-semibold text-white">{invoice.business?.name}</p>
              {invoice.business?.gstin && <p className="text-xs text-slate-500">GSTIN: {invoice.business.gstin}</p>}
            </div>
            <div>
              <p className="text-[10px] text-slate-500 uppercase mb-1">Bill To</p>
              <p className="text-sm font-semibold text-white">{invoice.customer?.name}</p>
              {invoice.customer?.email && <p className="text-xs text-slate-500">{invoice.customer.email}</p>}
              {invoice.customer?.phone && <p className="text-xs text-slate-500">{invoice.customer.phone}</p>}
              {invoice.customer?.gstin && <p className="text-xs text-slate-500">GSTIN: {invoice.customer.gstin}</p>}
            </div>
          </div>

          {/* Items */}
          <div>
            <p className="text-[10px] text-slate-500 uppercase mb-2">Line Items</p>
            <div className="border border-[#1e2d45] rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[#0f1420]">
                    {['Item', 'Qty', 'Rate', 'GST', 'Total'].map(h => (
                      <th key={h} className="px-4 py-2.5 text-left text-[10px] font-semibold text-slate-500 uppercase">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {invoice.items?.map((item, i) => (
                    <tr key={i} className="border-t border-[#1e2d45]">
                      <td className="px-4 py-3">
                        <p className="text-slate-200 font-medium">{item.name}</p>
                        {item.description && <p className="text-xs text-slate-500">{item.description}</p>}
                      </td>
                      <td className="px-4 py-3 text-slate-400">{item.quantity}</td>
                      <td className="px-4 py-3 text-slate-400">{formatCurrency(item.rate)}</td>
                      <td className="px-4 py-3 text-slate-400">{item.gstRate}%</td>
                      <td className="px-4 py-3 font-semibold text-white">{formatCurrency(item.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {invoice.notes && (
            <div className="p-3 bg-[#0f1420] rounded-xl border border-[#1e2d45]">
              <p className="text-[10px] text-slate-500 uppercase mb-1">Notes</p>
              <p className="text-sm text-slate-300">{invoice.notes}</p>
            </div>
          )}
        </Card>

        {/* Totals sidebar */}
        <div className="space-y-4">
          <Card className="space-y-3">
            <p className="text-xs font-semibold text-slate-400 uppercase">Summary</p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-slate-400">Subtotal</span><span className="text-slate-200">{formatCurrency(invoice.subtotal)}</span></div>
              <div className="flex justify-between"><span className="text-slate-400">GST</span><span className="text-slate-200">{formatCurrency(invoice.totalGst)}</span></div>
              {invoice.discount > 0 && <div className="flex justify-between"><span className="text-emerald-400">Discount</span><span className="text-emerald-400">-{formatCurrency(invoice.discount)}</span></div>}
              <div className="flex justify-between font-bold text-base pt-2 border-t border-[#1e2d45]">
                <span className="text-white">Total</span>
                <span className="text-blue-400">{formatCurrency(invoice.grandTotal)}</span>
              </div>
              {invoice.amountPaid > 0 && (
                <div className="flex justify-between text-emerald-400 text-xs">
                  <span>Paid</span><span>{formatCurrency(invoice.amountPaid)}</span>
                </div>
              )}
            </div>
          </Card>

          <Card className="space-y-2">
            <p className="text-xs font-semibold text-slate-400 uppercase">Dates</p>
            <div className="text-xs space-y-1.5">
              <div className="flex justify-between"><span className="text-slate-500">Issued</span><span className="text-slate-300">{formatDate(invoice.issueDate)}</span></div>
              {invoice.dueDate && <div className="flex justify-between"><span className="text-slate-500">Due</span><span className="text-slate-300">{formatDate(invoice.dueDate)}</span></div>}
              {invoice.paidDate && <div className="flex justify-between"><span className="text-slate-500">Paid</span><span className="text-emerald-400">{formatDate(invoice.paidDate)}</span></div>}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
