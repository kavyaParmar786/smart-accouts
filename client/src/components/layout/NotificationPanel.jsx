// NotificationPanel - slide-out panel showing alerts
import { useState, useEffect } from 'react';
import { X, Bell, AlertTriangle, FileText, Package, TrendingDown, CheckCircle } from 'lucide-react';
import { invoiceAPI, inventoryAPI } from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import { formatCurrency, formatDate } from '../../utils/helpers';

const TYPE_ICON = {
  overdue:  { icon: FileText,       color: 'text-red-400',   bg: 'bg-red-400/10'   },
  lowstock: { icon: Package,        color: 'text-amber-400', bg: 'bg-amber-400/10' },
  sent:     { icon: FileText,       color: 'text-blue-400',  bg: 'bg-blue-400/10'  },
  info:     { icon: TrendingDown,   color: 'text-slate-400', bg: 'bg-slate-400/10' },
};

export default function NotificationPanel({ isOpen, onClose }) {
  const { getBusinessId } = useAuthStore();
  const businessId = getBusinessId();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isOpen || !businessId) return;
    const load = async () => {
      setLoading(true);
      const notifs = [];
      try {
        const [invRes, stockRes] = await Promise.all([
          invoiceAPI.getAll({ businessId, status: 'overdue', limit: 5 }),
          inventoryAPI.getAll({ businessId, lowStock: 'true', limit: 5 }),
        ]);

        invRes.data.data.forEach(inv => {
          notifs.push({
            id: `inv-${inv._id}`,
            type: 'overdue',
            title: `Overdue Invoice ${inv.invoiceNumber}`,
            body: `${inv.customer?.name} · ${formatCurrency(inv.grandTotal)} due ${formatDate(inv.dueDate)}`,
            time: inv.dueDate,
          });
        });

        stockRes.data.data.forEach(p => {
          notifs.push({
            id: `stock-${p._id}`,
            type: 'lowstock',
            title: `Low Stock: ${p.name}`,
            body: `Only ${p.quantity} ${p.unit} remaining (threshold: ${p.lowStockThreshold})`,
            time: p.updatedAt,
          });
        });

        // also get sent invoices due in next 7 days
        const soon = await invoiceAPI.getAll({ businessId, status: 'sent', limit: 5 });
        const next7 = new Date(Date.now() + 7 * 86400000);
        soon.data.data
          .filter(inv => inv.dueDate && new Date(inv.dueDate) <= next7)
          .forEach(inv => {
            notifs.push({
              id: `due-${inv._id}`,
              type: 'sent',
              title: `Invoice Due Soon: ${inv.invoiceNumber}`,
              body: `${inv.customer?.name} · ${formatCurrency(inv.grandTotal)} due ${formatDate(inv.dueDate)}`,
              time: inv.dueDate,
            });
          });

        if (!notifs.length) {
          notifs.push({
            id: 'all-clear',
            type: 'info',
            title: 'All clear!',
            body: 'No alerts right now. Your business is running smoothly.',
            time: new Date(),
          });
        }

        setNotifications(notifs);
      } catch {}
      setLoading(false);
    };
    load();
  }, [isOpen, businessId]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm bg-[#0f1420] border-l border-[#1e2d45] h-full flex flex-col shadow-2xl animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#1e2d45]">
          <div className="flex items-center gap-2.5">
            <Bell size={16} className="text-blue-400" />
            <h2 className="text-sm font-semibold text-white">Notifications</h2>
            {notifications.length > 0 && notifications[0].id !== 'all-clear' && (
              <span className="text-xs bg-red-500 text-white px-1.5 py-0.5 rounded-full font-bold">
                {notifications.filter(n => n.id !== 'all-clear').length}
              </span>
            )}
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-[#1a2235] rounded-lg text-slate-400 hover:text-white transition-colors">
            <X size={15} />
          </button>
        </div>

        {/* Notifications list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-16 bg-[#1a2235] rounded-xl animate-pulse" />
            ))
          ) : (
            notifications.map(n => {
              const { icon: Icon, color, bg } = TYPE_ICON[n.type] || TYPE_ICON.info;
              return (
                <div key={n.id} className="flex items-start gap-3 p-3.5 rounded-xl bg-[#131929] border border-[#1e2d45] hover:border-[#2a3d5a] transition-colors">
                  <div className={`p-2 rounded-lg flex-shrink-0 ${bg}`}>
                    <Icon size={14} className={color} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-200 leading-tight">{n.title}</p>
                    <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{n.body}</p>
                    <p className="text-[10px] text-slate-700 mt-1.5">{formatDate(n.time)}</p>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-[#1e2d45]">
          <p className="text-xs text-slate-600 text-center">Notifications refresh when you open this panel</p>
        </div>
      </div>
    </div>
  );
}
