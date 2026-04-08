// Complete reusable UI component library
import { cn } from '../../utils/helpers';
import { Loader2, X, ChevronDown } from 'lucide-react';

export const Button = ({ children, variant = 'primary', size = 'md', loading, icon, className, ...props }) => {
  const base = 'inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed';
  const variants = {
    primary: 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/30 active:scale-95',
    secondary: 'bg-[#1a2235] hover:bg-[#1e2d45] text-slate-200 border border-[#1e2d45] hover:border-[#2a3d5a]',
    danger: 'bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/20',
    ghost: 'hover:bg-[#1a2235] text-slate-300 hover:text-white',
    success: 'bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/20',
    outline: 'border border-[#1e2d45] text-slate-300 hover:border-blue-500/50 hover:text-white',
  };
  const sizes = { sm: 'text-xs px-3 py-1.5', md: 'text-sm px-4 py-2', lg: 'text-sm px-6 py-2.5', xl: 'text-base px-8 py-3', icon: 'p-2' };
  return (
    <button className={cn(base, variants[variant], sizes[size], className)} disabled={loading || props.disabled} {...props}>
      {loading ? <Loader2 size={14} className="animate-spin" /> : icon}
      {children}
    </button>
  );
};

export const Input = ({ label, error, icon, className, wrapperClass, ...props }) => (
  <div className={cn('flex flex-col gap-1.5', wrapperClass)}>
    {label && <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">{label}</label>}
    <div className="relative">
      {icon && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">{icon}</span>}
      <input
        className={cn(
          'w-full bg-[#0f1420] border border-[#1e2d45] rounded-lg text-sm text-slate-200 placeholder-slate-600',
          'focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all',
          icon ? 'pl-10 pr-4 py-2.5' : 'px-4 py-2.5',
          error && 'border-red-500/50', className
        )}
        {...props}
      />
    </div>
    {error && <p className="text-xs text-red-400 mt-0.5">{error}</p>}
  </div>
);

export const Select = ({ label, error, className, wrapperClass, children, ...props }) => (
  <div className={cn('flex flex-col gap-1.5', wrapperClass)}>
    {label && <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">{label}</label>}
    <div className="relative">
      <select
        className={cn(
          'w-full bg-[#0f1420] border border-[#1e2d45] rounded-lg text-sm text-slate-200',
          'focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all px-4 py-2.5 appearance-none pr-10',
          error && 'border-red-500/50', className
        )}
        {...props}
      >
        {children}
      </select>
      <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
    </div>
    {error && <p className="text-xs text-red-400 mt-0.5">{error}</p>}
  </div>
);

export const Textarea = ({ label, error, className, wrapperClass, ...props }) => (
  <div className={cn('flex flex-col gap-1.5', wrapperClass)}>
    {label && <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">{label}</label>}
    <textarea
      className={cn(
        'w-full bg-[#0f1420] border border-[#1e2d45] rounded-lg text-sm text-slate-200 placeholder-slate-600',
        'focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all px-4 py-2.5 resize-none',
        error && 'border-red-500/50', className
      )}
      rows={3} {...props}
    />
    {error && <p className="text-xs text-red-400 mt-0.5">{error}</p>}
  </div>
);

export const Card = ({ children, className, hover, ...props }) => (
  <div className={cn('bg-[#131929] border border-[#1e2d45] rounded-xl p-5', hover && 'hover:border-[#2a3d5a] transition-all', className)} {...props}>
    {children}
  </div>
);

export const Badge = ({ children, variant = 'default', className }) => {
  const variants = {
    default: 'bg-slate-700/40 text-slate-300',
    success: 'bg-emerald-500/15 text-emerald-400',
    danger: 'bg-red-500/15 text-red-400',
    warning: 'bg-amber-500/15 text-amber-400',
    info: 'bg-blue-500/15 text-blue-400',
    purple: 'bg-purple-500/15 text-purple-400',
  };
  return <span className={cn('text-xs font-medium px-2.5 py-0.5 rounded-full', variants[variant], className)}>{children}</span>;
};

export const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
  if (!isOpen) return null;
  const sizes = { sm: 'max-w-md', md: 'max-w-xl', lg: 'max-w-2xl', xl: 'max-w-4xl', full: 'max-w-6xl' };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className={cn('relative w-full bg-[#131929] border border-[#1e2d45] rounded-2xl shadow-2xl animate-fade-in-up', sizes[size])}>
        <div className="flex items-center justify-between p-5 border-b border-[#1e2d45]">
          <h2 className="text-base font-semibold text-white">{title}</h2>
          <button onClick={onClose} className="p-1.5 hover:bg-[#1a2235] rounded-lg text-slate-400 hover:text-white transition-colors"><X size={16} /></button>
        </div>
        <div className="p-5 max-h-[80vh] overflow-y-auto">{children}</div>
      </div>
    </div>
  );
};

export const Spinner = ({ size = 20, className }) => (
  <Loader2 size={size} className={cn('animate-spin text-blue-500', className)} />
);

export const PageLoader = () => (
  <div className="flex items-center justify-center h-64">
    <div className="flex flex-col items-center gap-3">
      <Spinner size={32} />
      <p className="text-sm text-slate-500">Loading...</p>
    </div>
  </div>
);

export const EmptyState = ({ icon, title, description, action }) => (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    <div className="text-5xl mb-4 opacity-30">{icon || '📭'}</div>
    <h3 className="text-base font-medium text-slate-300 mb-1">{title || 'Nothing here yet'}</h3>
    <p className="text-sm text-slate-500 mb-5 max-w-xs">{description}</p>
    {action}
  </div>
);

export const StatCard = ({ label, value, icon, change, changeLabel, color = 'blue', loading, sublabel }) => {
  const colors = {
    blue: { icon: 'bg-blue-500/15 text-blue-400', glow: 'hover:shadow-blue-900/20' },
    green: { icon: 'bg-emerald-500/15 text-emerald-400', glow: 'hover:shadow-emerald-900/20' },
    red: { icon: 'bg-red-500/15 text-red-400', glow: 'hover:shadow-red-900/20' },
    purple: { icon: 'bg-purple-500/15 text-purple-400', glow: 'hover:shadow-purple-900/20' },
    amber: { icon: 'bg-amber-500/15 text-amber-400', glow: 'hover:shadow-amber-900/20' },
  };
  const c = colors[color] || colors.blue;
  return (
    <Card className={cn('hover:shadow-lg transition-all animate-fade-in-up', c.glow)}>
      <div className="flex items-start justify-between mb-4">
        <div className={cn('p-2.5 rounded-xl', c.icon)}>{icon}</div>
        {change !== undefined && (
          <span className={cn('text-xs font-medium px-2 py-0.5 rounded-full', change >= 0 ? 'text-emerald-400 bg-emerald-400/10' : 'text-red-400 bg-red-400/10')}>
            {change >= 0 ? '↑' : '↓'} {Math.abs(change)}%
          </span>
        )}
      </div>
      {loading ? <div className="h-8 bg-[#1a2235] rounded animate-pulse mb-1.5" /> : (
        <p className="text-2xl font-bold text-white tracking-tight mb-0.5">{value}</p>
      )}
      <p className="text-xs font-medium text-slate-400">{label}</p>
      {sublabel && <p className="text-xs text-slate-600 mt-1">{sublabel}</p>}
      {changeLabel && <p className="text-xs text-slate-600 mt-0.5">{changeLabel}</p>}
    </Card>
  );
};

export const Table = ({ columns, data, loading, onRowClick, emptyState, emptyIcon }) => (
  <div className="table-scroll-wrap">
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b border-[#1e2d45]">
          {columns.map(col => (
            <th key={col.key} className={cn('px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap', col.className)}>
              {col.label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {loading ? Array.from({ length: 6 }).map((_, i) => (
          <tr key={i} className="border-b border-[#1e2d45]/50">
            {columns.map(col => (
              <td key={col.key} className="px-4 py-3.5">
                <div className="h-4 bg-[#1a2235] rounded animate-pulse" style={{ width: `${60 + Math.random() * 30}%` }} />
              </td>
            ))}
          </tr>
        )) : !data?.length ? (
          <tr><td colSpan={columns.length}><EmptyState icon={emptyIcon} description={emptyState || 'No records found'} /></td></tr>
        ) : data.map((row, i) => (
          <tr key={row._id || i}
            onClick={() => onRowClick?.(row)}
            className={cn('border-b border-[#1e2d45]/40 transition-colors', onRowClick && 'cursor-pointer hover:bg-[#1a2235]/60')}>
            {columns.map(col => (
              <td key={col.key} className={cn('px-4 py-3.5 text-slate-300', col.className)}>
                {col.render ? col.render(row[col.key], row) : row[col.key] ?? '—'}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export const Pagination = ({ page, pages, total, limit, onPage }) => {
  if (pages <= 1) return null;
  const start = (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);
  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-[#1e2d45]">
      <p className="text-xs text-slate-500">Showing {start}–{end} of {total}</p>
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="sm" onClick={() => onPage(page - 1)} disabled={page === 1}>←</Button>
        {Array.from({ length: Math.min(pages, 5) }, (_, i) => {
          let p;
          if (pages <= 5) p = i + 1;
          else if (page <= 3) p = i + 1;
          else if (page >= pages - 2) p = pages - 4 + i;
          else p = page - 2 + i;
          return (
            <Button key={p} variant={p === page ? 'primary' : 'ghost'} size="sm" onClick={() => onPage(p)}>{p}</Button>
          );
        })}
        <Button variant="ghost" size="sm" onClick={() => onPage(page + 1)} disabled={page === pages}>→</Button>
      </div>
    </div>
  );
};

export const Toggle = ({ checked, onChange, label }) => (
  <label className="flex items-center gap-2 cursor-pointer">
    <div onClick={() => onChange(!checked)} className={cn('w-10 h-5 rounded-full relative transition-colors cursor-pointer', checked ? 'bg-blue-600' : 'bg-[#1e2d45]')}>
      <div className={cn('absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all', checked ? 'left-5' : 'left-0.5')} />
    </div>
    {label && <span className="text-sm text-slate-300">{label}</span>}
  </label>
);

export const Divider = ({ label, className }) => (
  <div className={cn('flex items-center gap-3 my-4', className)}>
    <div className="flex-1 border-t border-[#1e2d45]" />
    {label && <span className="text-xs text-slate-600 whitespace-nowrap">{label}</span>}
    <div className="flex-1 border-t border-[#1e2d45]" />
  </div>
);

export const AlertBanner = ({ type = 'info', icon, title, message, onDismiss }) => {
  const types = {
    info: 'border-blue-500/20 bg-blue-500/5 text-blue-400',
    success: 'border-emerald-500/20 bg-emerald-500/5 text-emerald-400',
    warning: 'border-amber-500/20 bg-amber-500/5 text-amber-400',
    danger: 'border-red-500/20 bg-red-500/5 text-red-400',
  };
  return (
    <div className={cn('flex items-start gap-3 p-4 rounded-xl border', types[type])}>
      {icon && <span className="text-lg flex-shrink-0">{icon}</span>}
      <div className="flex-1 min-w-0">
        {title && <p className="text-sm font-medium mb-0.5">{title}</p>}
        <p className="text-xs opacity-80">{message}</p>
      </div>
      {onDismiss && <button onClick={onDismiss} className="p-1 hover:opacity-70"><X size={14} /></button>}
    </div>
  );
};
