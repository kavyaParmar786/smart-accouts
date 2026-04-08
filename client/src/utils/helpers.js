// Utility helpers

export const formatCurrency = (amount, currency = 'INR') => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount || 0);
};

export const formatDate = (date, opts = {}) => {
  if (!date) return '—';
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric', ...opts,
  }).format(new Date(date));
};

export const formatDateInput = (date) => {
  if (!date) return '';
  return new Date(date).toISOString().split('T')[0];
};

export const getInitials = (name = '') =>
  name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();

export const truncate = (str, n = 30) =>
  str?.length > n ? str.substring(0, n) + '...' : str;

export const pctChange = (cur, prev) => {
  if (!prev) return cur > 0 ? 100 : 0;
  return parseFloat((((cur - prev) / prev) * 100).toFixed(1));
};

export const cn = (...classes) => classes.filter(Boolean).join(' ');

export const downloadCSV = (data, filename) => {
  if (!data.length) return;
  const headers = Object.keys(data[0]);
  const csv = [
    headers.join(','),
    ...data.map(row =>
      headers.map(h => {
        const val = row[h] ?? '';
        return typeof val === 'string' && val.includes(',') ? `"${val}"` : val;
      }).join(',')
    ),
  ].join('\n');

  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = `${filename}.csv`; a.click();
  URL.revokeObjectURL(url);
};

export const STATUS_COLORS = {
  paid: 'text-emerald-400 bg-emerald-400/10',
  sent: 'text-blue-400 bg-blue-400/10',
  draft: 'text-slate-400 bg-slate-400/10',
  overdue: 'text-red-400 bg-red-400/10',
  cancelled: 'text-slate-500 bg-slate-500/10',
  income: 'text-emerald-400 bg-emerald-400/10',
  expense: 'text-red-400 bg-red-400/10',
};
