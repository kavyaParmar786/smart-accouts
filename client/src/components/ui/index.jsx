/**
 * SmartAccounts UI Kit v4
 * Design: Refined Dark Luxury — Bloomberg meets Linear
 * All styles inline to survive Tailwind v4 production purge
 */
import { Loader2, X, ChevronDown, Check } from 'lucide-react';

/* ── Design tokens (mirror CSS vars for JS use) ───────────── */
export const T = {
  base:    '#06080f', surface: '#0b0e1a', card: '#0f1422',
  elev:    '#141928', hover:   '#1a2035', active: '#1f2640',
  border:  '#1c2540', border2: '#243058',
  blue:    '#3b7eff', blueG:   'rgba(59,126,255,0.12)',
  green:   '#00d97e', greenG:  'rgba(0,217,126,0.1)',
  red:     '#ff4f6d', redG:    'rgba(255,79,109,0.1)',
  amber:   '#ffb547', amberG:  'rgba(255,181,71,0.1)',
  purple:  '#9b6dff', purpleG: 'rgba(155,109,255,0.1)',
  cyan:    '#22d3ee',
  t1: '#f0f4ff', t2: '#8892b0', t3: '#4a5578', t4: '#2e3a52',
};

const FONT = "'Sora', ui-sans-serif, system-ui, sans-serif";
const MONO = "'JetBrains Mono', monospace";

/* ── Button ────────────────────────────────────────────────── */
const BTN_V = {
  primary:   { bg: T.blue,    fg: '#fff',  border: 'none',               shadow: `0 0 20px ${T.blueG}, 0 4px 12px rgba(59,126,255,0.3)` },
  secondary: { bg: T.elev,    fg: T.t1,    border: `1px solid ${T.border}`, shadow: 'none' },
  danger:    { bg: T.redG,    fg: T.red,   border: `1px solid rgba(255,79,109,0.25)`, shadow: 'none' },
  ghost:     { bg: 'transparent', fg: T.t2, border: 'none',              shadow: 'none' },
  success:   { bg: T.greenG,  fg: T.green, border: `1px solid rgba(0,217,126,0.25)`, shadow: 'none' },
  outline:   { bg: 'transparent', fg: T.t2, border: `1px solid ${T.border}`, shadow: 'none' },
  warning:   { bg: T.amberG,  fg: T.amber, border: `1px solid rgba(255,181,71,0.25)`, shadow: 'none' },
  purple:    { bg: T.purpleG, fg: T.purple,border: `1px solid rgba(155,109,255,0.25)`, shadow: 'none' },
};
const BTN_S = {
  xs:   { fs: 10, px: 8,  py: 4,  h: 24, r: 6  },
  sm:   { fs: 11, px: 11, py: 5,  h: 28, r: 8  },
  md:   { fs: 12, px: 14, py: 7,  h: 34, r: 10 },
  lg:   { fs: 13, px: 20, py: 9,  h: 40, r: 10 },
  xl:   { fs: 14, px: 28, py: 12, h: 48, r: 12 },
  icon: { fs: 13, px: 7,  py: 7,  h: 32, r: 9, w: 32 },
};

export const Button = ({
  children, variant = 'primary', size = 'md',
  loading, icon, style, disabled, onClick, type = 'button', ...props
}) => {
  const v = BTN_V[variant] || BTN_V.primary;
  const s = BTN_S[size]    || BTN_S.md;
  const dis = disabled || loading;
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={dis}
      style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        gap: 6, fontFamily: FONT, fontWeight: 600, fontSize: s.fs,
        height: s.h, paddingLeft: s.px, paddingRight: s.px,
        borderRadius: s.r, width: size === 'icon' ? s.w : undefined,
        background: v.bg, color: v.fg, border: v.border || 'none',
        boxShadow: dis ? 'none' : v.shadow,
        cursor: dis ? 'not-allowed' : 'pointer',
        opacity: dis ? 0.45 : 1,
        transition: 'all 0.15s cubic-bezier(.22,1,.36,1)',
        whiteSpace: 'nowrap', userSelect: 'none',
        letterSpacing: '-0.01em',
        ...style,
      }}
      onMouseEnter={e => { if (!dis) { e.currentTarget.style.filter = 'brightness(1.1)'; e.currentTarget.style.transform = 'translateY(-1px)'; } }}
      onMouseLeave={e => { e.currentTarget.style.filter = ''; e.currentTarget.style.transform = ''; }}
      onMouseDown={e  => { if (!dis) e.currentTarget.style.transform = 'translateY(0)'; }}
      {...props}
    >
      {loading ? <Loader2 size={s.fs + 1} style={{ animation: 'spin 0.7s linear infinite' }} /> : icon}
      {children}
    </button>
  );
};

/* ── Input ─────────────────────────────────────────────────── */
export const Input = ({ label, error, icon, wrapperClass, wrapperStyle, style, hint, ...props }) => (
  <div className={wrapperClass} style={{ display: 'flex', flexDirection: 'column', gap: 5, ...wrapperStyle }}>
    {label && <label style={{ fontSize: 10, fontWeight: 700, color: T.t3, textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: FONT }}>{label}</label>}
    <div style={{ position: 'relative' }}>
      {icon && <span style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: T.t3, pointerEvents: 'none', display: 'flex', alignItems: 'center' }}>{icon}</span>}
      <input
        style={{
          width: '100%', background: T.surface, color: T.t1, fontFamily: FONT, fontSize: 13,
          border: `1px solid ${error ? T.red : T.border}`, borderRadius: 10,
          padding: icon ? '9px 12px 9px 36px' : '9px 12px',
          transition: 'border-color 0.15s, box-shadow 0.15s',
          ...style,
        }}
        onFocus={e => { e.target.style.borderColor = T.blue; e.target.style.boxShadow = `0 0 0 3px ${T.blueG}`; }}
        onBlur={e  => { e.target.style.borderColor = error ? T.red : T.border; e.target.style.boxShadow = 'none'; }}
        {...props}
      />
    </div>
    {hint  && !error && <p style={{ fontSize: 11, color: T.t3 }}>{hint}</p>}
    {error && <p style={{ fontSize: 11, color: T.red }}>{error}</p>}
  </div>
);

/* ── Select ────────────────────────────────────────────────── */
export const Select = ({ label, error, wrapperClass, wrapperStyle, children, style, ...props }) => (
  <div className={wrapperClass} style={{ display: 'flex', flexDirection: 'column', gap: 5, ...wrapperStyle }}>
    {label && <label style={{ fontSize: 10, fontWeight: 700, color: T.t3, textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: FONT }}>{label}</label>}
    <div style={{ position: 'relative' }}>
      <select
        style={{
          width: '100%', background: T.surface, color: T.t1, fontFamily: FONT, fontSize: 13,
          border: `1px solid ${error ? T.red : T.border}`, borderRadius: 10,
          padding: '9px 34px 9px 12px', appearance: 'none', cursor: 'pointer',
          transition: 'border-color 0.15s',
          ...style,
        }}
        onFocus={e => e.target.style.borderColor = T.blue}
        onBlur={e  => e.target.style.borderColor = error ? T.red : T.border}
        {...props}
      >
        {children}
      </select>
      <ChevronDown size={13} style={{ position: 'absolute', right: 11, top: '50%', transform: 'translateY(-50%)', color: T.t3, pointerEvents: 'none' }} />
    </div>
    {error && <p style={{ fontSize: 11, color: T.red }}>{error}</p>}
  </div>
);

/* ── Textarea ──────────────────────────────────────────────── */
export const Textarea = ({ label, error, wrapperClass, wrapperStyle, style, ...props }) => (
  <div className={wrapperClass} style={{ display: 'flex', flexDirection: 'column', gap: 5, ...wrapperStyle }}>
    {label && <label style={{ fontSize: 10, fontWeight: 700, color: T.t3, textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: FONT }}>{label}</label>}
    <textarea
      style={{
        width: '100%', background: T.surface, color: T.t1, fontFamily: FONT, fontSize: 13,
        border: `1px solid ${error ? T.red : T.border}`, borderRadius: 10,
        padding: '9px 12px', resize: 'vertical', minHeight: 80,
        transition: 'border-color 0.15s, box-shadow 0.15s',
        ...style,
      }}
      onFocus={e => { e.target.style.borderColor = T.blue; e.target.style.boxShadow = `0 0 0 3px ${T.blueG}`; }}
      onBlur={e  => { e.target.style.borderColor = error ? T.red : T.border; e.target.style.boxShadow = 'none'; }}
      {...props}
    />
    {error && <p style={{ fontSize: 11, color: T.red }}>{error}</p>}
  </div>
);

/* ── Card ──────────────────────────────────────────────────── */
export const Card = ({ children, style, className, pad = 20, ...props }) => (
  <div
    className={`card-glow ${className || ''}`}
    style={{
      background: T.card, border: `1px solid ${T.border}`,
      borderRadius: 16, padding: pad,
      boxShadow: '0 2px 16px rgba(0,0,0,0.35), 0 1px 0 rgba(255,255,255,0.02) inset',
      transition: 'border-color 0.2s, box-shadow 0.2s',
      ...style,
    }}
    onMouseEnter={e => e.currentTarget.style.borderColor = T.border2}
    onMouseLeave={e => e.currentTarget.style.borderColor = T.border}
    {...props}
  >
    {children}
  </div>
);

/* ── Badge ─────────────────────────────────────────────────── */
const BADGE_V = {
  default: { bg: 'rgba(74,85,120,0.25)', fg: T.t2 },
  success: { bg: T.greenG,  fg: T.green  },
  danger:  { bg: T.redG,    fg: T.red    },
  warning: { bg: T.amberG,  fg: T.amber  },
  info:    { bg: T.blueG,   fg: T.blue   },
  purple:  { bg: T.purpleG, fg: T.purple },
  cyan:    { bg: 'rgba(34,211,238,0.1)', fg: T.cyan },
};
export const Badge = ({ children, variant = 'default', style }) => {
  const v = BADGE_V[variant] || BADGE_V.default;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      fontSize: 10, fontWeight: 700, padding: '3px 9px', borderRadius: 999,
      fontFamily: FONT, letterSpacing: '0.04em', whiteSpace: 'nowrap',
      background: v.bg, color: v.fg,
      ...style,
    }}>
      {children}
    </span>
  );
};

/* ── Modal ─────────────────────────────────────────────────── */
const MODAL_W = { sm: 440, md: 560, lg: 700, xl: 860, '2xl': 1050 };
export const Modal = ({ isOpen, onClose, title, children, size = 'md', subtitle }) => {
  if (!isOpen) return null;
  return (
    <div className="anim-in" style={{ position: 'fixed', inset: 0, zIndex: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(8px)' }} onClick={onClose} />
      <div className="anim-up" style={{
        position: 'relative', width: '100%', maxWidth: MODAL_W[size] || 560,
        background: T.card, border: `1px solid ${T.border}`, borderRadius: 18,
        boxShadow: '0 32px 100px rgba(0,0,0,0.7), 0 1px 0 rgba(255,255,255,0.04) inset',
        maxHeight: '92vh', display: 'flex', flexDirection: 'column', overflow: 'hidden',
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', padding: '18px 22px', borderBottom: `1px solid ${T.border}`, flexShrink: 0 }}>
          <div>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: T.t1, fontFamily: FONT, letterSpacing: '-0.02em' }}>{title}</h2>
            {subtitle && <p style={{ fontSize: 12, color: T.t3, marginTop: 3 }}>{subtitle}</p>}
          </div>
          <button onClick={onClose} style={{ padding: 6, border: 'none', background: 'transparent', color: T.t3, cursor: 'pointer', borderRadius: 8, display: 'flex', transition: 'all 0.15s', marginLeft: 12, flexShrink: 0 }}
            onMouseEnter={e => { e.currentTarget.style.background = T.hover; e.currentTarget.style.color = T.t1; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = T.t3; }}>
            <X size={15} />
          </button>
        </div>
        <div style={{ padding: '20px 22px', overflowY: 'auto', flex: 1 }}>{children}</div>
      </div>
    </div>
  );
};

/* ── Spinner / PageLoader ──────────────────────────────────── */
export const Spinner = ({ size = 18, color }) => (
  <Loader2 size={size} style={{ animation: 'spin 0.7s linear infinite', color: color || T.blue }} />
);
export const PageLoader = ({ text = 'Loading...' }) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 260, flexDirection: 'column', gap: 14 }}>
    <div style={{ width: 36, height: 36, borderRadius: '50%', border: `2px solid ${T.border}`, borderTopColor: T.blue, animation: 'spin 0.7s linear infinite' }} />
    <p style={{ fontSize: 12, color: T.t3, fontFamily: FONT }}>{text}</p>
  </div>
);

/* ── EmptyState ────────────────────────────────────────────── */
export const EmptyState = ({ icon = '📭', title = 'Nothing here yet', description, action }) => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '52px 24px', textAlign: 'center' }}>
    <div style={{ fontSize: 44, marginBottom: 18, filter: 'grayscale(0.3) opacity(0.6)' }}>{icon}</div>
    <p style={{ fontSize: 15, fontWeight: 600, color: T.t1, marginBottom: 8, letterSpacing: '-0.02em' }}>{title}</p>
    {description && <p style={{ fontSize: 13, color: T.t3, marginBottom: 22, maxWidth: 300, lineHeight: 1.6 }}>{description}</p>}
    {action}
  </div>
);

/* ── StatCard ──────────────────────────────────────────────── */
const STAT_C = {
  blue:   { ic: T.blue,   bg: T.blueG,   glow: '0 0 30px rgba(59,126,255,0.1)'  },
  green:  { ic: T.green,  bg: T.greenG,  glow: '0 0 30px rgba(0,217,126,0.08)'  },
  red:    { ic: T.red,    bg: T.redG,    glow: '0 0 30px rgba(255,79,109,0.08)' },
  amber:  { ic: T.amber,  bg: T.amberG,  glow: '0 0 30px rgba(255,181,71,0.08)' },
  purple: { ic: T.purple, bg: T.purpleG, glow: '0 0 30px rgba(155,109,255,0.08)'},
  cyan:   { ic: T.cyan,   bg: 'rgba(34,211,238,0.1)', glow: '0 0 30px rgba(34,211,238,0.08)' },
};
export const StatCard = ({ label, value, icon, change, sublabel, color = 'blue', loading }) => {
  const c = STAT_C[color] || STAT_C.blue;
  return (
    <div className="anim-up" style={{
      background: T.card, border: `1px solid ${T.border}`, borderRadius: 16, padding: 22,
      boxShadow: '0 2px 16px rgba(0,0,0,0.3)', transition: 'all 0.2s',
      display: 'flex', flexDirection: 'column', gap: 0,
    }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = T.border2; e.currentTarget.style.boxShadow = `0 4px 24px rgba(0,0,0,0.4), ${c.glow}`; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.boxShadow = '0 2px 16px rgba(0,0,0,0.3)'; }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 18 }}>
        <div style={{ width: 40, height: 40, borderRadius: 12, background: c.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: c.ic }}>
          {icon}
        </div>
        {change !== undefined && (
          <span style={{
            fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 999, fontFamily: FONT,
            background: change >= 0 ? T.greenG : T.redG,
            color: change >= 0 ? T.green : T.red,
          }}>
            {change >= 0 ? '↑' : '↓'} {Math.abs(change)}%
          </span>
        )}
      </div>
      {loading
        ? <div className="skeleton" style={{ height: 34, borderRadius: 8, marginBottom: 8, width: '70%' }} />
        : <p className="stat-num" style={{ fontSize: 28, fontWeight: 700, color: T.t1, letterSpacing: '-0.04em', lineHeight: 1, marginBottom: 6 }}>{value}</p>
      }
      <p style={{ fontSize: 11, fontWeight: 600, color: T.t3, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</p>
      {sublabel && <p style={{ fontSize: 11, color: T.t4, marginTop: 4 }}>{sublabel}</p>}
    </div>
  );
};

/* ── Table ─────────────────────────────────────────────────── */
export const Table = ({ columns, data, loading, onRowClick, emptyState, emptyIcon }) => (
  <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
      <thead>
        <tr style={{ borderBottom: `1px solid ${T.border}` }}>
          {columns.map((col, i) => (
            <th key={i} style={{ padding: '10px 16px', textAlign: col.align || 'left', fontSize: 10, fontWeight: 700, color: T.t3, textTransform: 'uppercase', letterSpacing: '0.08em', whiteSpace: 'nowrap', fontFamily: FONT }}>
              {col.label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {loading
          ? Array.from({ length: 5 }).map((_, i) => (
            <tr key={i} style={{ borderBottom: `1px solid rgba(28,37,64,0.5)` }}>
              {columns.map((_, j) => <td key={j} style={{ padding: '13px 16px' }}><div className="skeleton" style={{ height: 13, borderRadius: 4, width: `${50 + Math.random() * 40}%` }} /></td>)}
            </tr>
          ))
          : !data?.length
            ? <tr><td colSpan={columns.length}><EmptyState icon={emptyIcon} description={emptyState} /></td></tr>
            : data.map((row, i) => (
              <tr key={row._id || i}
                onClick={() => onRowClick?.(row)}
                style={{ borderBottom: `1px solid rgba(28,37,64,0.4)`, cursor: onRowClick ? 'pointer' : 'default', transition: 'background 0.1s' }}
                onMouseEnter={e => { if (onRowClick) e.currentTarget.style.background = T.hover; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
              >
                {columns.map((col, j) => (
                  <td key={j} style={{ padding: '12px 16px', color: T.t2, textAlign: col.align || 'left', fontSize: 12 }}>
                    {col.render ? col.render(row[col.key], row) : (row[col.key] ?? '—')}
                  </td>
                ))}
              </tr>
            ))
        }
      </tbody>
    </table>
  </div>
);

/* ── Pagination ────────────────────────────────────────────── */
export const Pagination = ({ page, pages, total, limit = 20, onPage }) => {
  if (!pages || pages <= 1) return null;
  const s = (page - 1) * limit + 1, e = Math.min(page * limit, total);
  const nums = [];
  for (let p = Math.max(1, page - 2); p <= Math.min(pages, page + 2); p++) nums.push(p);
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px', borderTop: `1px solid ${T.border}` }}>
      <p style={{ fontSize: 11, color: T.t3, fontFamily: FONT }}>{s}–{e} of {total}</p>
      <div style={{ display: 'flex', gap: 3 }}>
        <Button variant="ghost" size="sm" onClick={() => onPage(page - 1)} disabled={page === 1}>←</Button>
        {nums[0] > 1 && <><Button variant="ghost" size="sm" onClick={() => onPage(1)}>1</Button>{nums[0] > 2 && <span style={{ color: T.t3, padding: '0 3px', alignSelf: 'center', fontSize: 11 }}>…</span>}</>}
        {nums.map(p => <Button key={p} variant={p === page ? 'primary' : 'ghost'} size="sm" onClick={() => onPage(p)}>{p}</Button>)}
        {nums[nums.length - 1] < pages && <><span style={{ color: T.t3, padding: '0 3px', alignSelf: 'center', fontSize: 11 }}>…</span><Button variant="ghost" size="sm" onClick={() => onPage(pages)}>{pages}</Button></>}
        <Button variant="ghost" size="sm" onClick={() => onPage(page + 1)} disabled={page === pages}>→</Button>
      </div>
    </div>
  );
};

/* ── AlertBanner ───────────────────────────────────────────── */
const ALERT_V = {
  info:     { border: T.blueG,   bg: 'rgba(59,126,255,0.06)',   color: T.blue   },
  success:  { border: T.greenG,  bg: 'rgba(0,217,126,0.06)',    color: T.green  },
  positive: { border: T.greenG,  bg: 'rgba(0,217,126,0.06)',    color: T.green  },
  warning:  { border: T.amberG,  bg: 'rgba(255,181,71,0.06)',   color: T.amber  },
  danger:   { border: T.redG,    bg: 'rgba(255,79,109,0.06)',   color: T.red    },
  alert:    { border: T.redG,    bg: 'rgba(255,79,109,0.06)',   color: T.red    },
};
export const AlertBanner = ({ type = 'info', icon, title, message, onDismiss }) => {
  const v = ALERT_V[type] || ALERT_V.info;
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 11, padding: '12px 14px', borderRadius: 12, border: `1px solid ${v.border}`, background: v.bg }}>
      {icon && <span style={{ fontSize: 16, flexShrink: 0, marginTop: 1 }}>{icon}</span>}
      <div style={{ flex: 1, minWidth: 0 }}>
        {title && <p style={{ fontSize: 12, fontWeight: 700, color: v.color, marginBottom: 3, fontFamily: FONT }}>{title}</p>}
        <p style={{ fontSize: 12, color: T.t2, lineHeight: 1.5 }}>{message}</p>
      </div>
      {onDismiss && <button onClick={onDismiss} style={{ border: 'none', background: 'transparent', color: T.t3, cursor: 'pointer', padding: 3, display: 'flex', flexShrink: 0 }}><X size={13} /></button>}
    </div>
  );
};

/* ── Divider ───────────────────────────────────────────────── */
export const Divider = ({ label, style }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '18px 0', ...style }}>
    <div style={{ flex: 1, height: 1, background: T.border }} />
    {label && <span style={{ fontSize: 10, color: T.t3, whiteSpace: 'nowrap', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: FONT }}>{label}</span>}
    <div style={{ flex: 1, height: 1, background: T.border }} />
  </div>
);

/* ── Toggle ────────────────────────────────────────────────── */
export const Toggle = ({ checked, onChange, label }) => (
  <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', userSelect: 'none' }}>
    <div onClick={() => onChange?.(!checked)} style={{ width: 38, height: 21, borderRadius: 999, background: checked ? T.blue : T.border, position: 'relative', transition: 'background 0.2s', cursor: 'pointer', flexShrink: 0, boxShadow: checked ? `0 0 12px ${T.blueG}` : 'none' }}>
      <div style={{ position: 'absolute', top: 3, left: checked ? 20 : 3, width: 15, height: 15, borderRadius: '50%', background: '#fff', transition: 'left 0.2s', boxShadow: '0 1px 4px rgba(0,0,0,0.3)' }} />
    </div>
    {label && <span style={{ fontSize: 13, color: T.t2, fontFamily: FONT }}>{label}</span>}
  </label>
);

/* ── PageHeader (reusable page title + actions) ────────────── */
export const PageHeader = ({ title, subtitle, actions, icon }) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 24 }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      {icon && <div style={{ width: 40, height: 40, borderRadius: 12, background: T.blueG, display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.blue, flexShrink: 0 }}>{icon}</div>}
      <div>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: T.t1, letterSpacing: '-0.03em', lineHeight: 1, fontFamily: FONT }}>{title}</h1>
        {subtitle && <p style={{ fontSize: 12, color: T.t3, marginTop: 5 }}>{subtitle}</p>}
      </div>
    </div>
    {actions && <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>{actions}</div>}
  </div>
);

/* ── SectionTitle (card-level heading) ─────────────────────── */
export const SectionTitle = ({ title, subtitle, action, icon }) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      {icon && <span style={{ fontSize: 15 }}>{icon}</span>}
      <div>
        <p style={{ fontSize: 13, fontWeight: 700, color: T.t1, letterSpacing: '-0.02em', fontFamily: FONT }}>{title}</p>
        {subtitle && <p style={{ fontSize: 11, color: T.t3, marginTop: 2 }}>{subtitle}</p>}
      </div>
    </div>
    {action && <div>{action}</div>}
  </div>
);

/* ── Tabs ──────────────────────────────────────────────────── */
export const Tabs = ({ tabs, active, onChange }) => (
  <div style={{ display: 'flex', gap: 3, background: T.surface, border: `1px solid ${T.border}`, borderRadius: 12, padding: 4, width: 'fit-content' }}>
    {tabs.map(tab => (
      <button key={tab.id} onClick={() => onChange(tab.id)}
        style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '7px 14px', borderRadius: 9, border: 'none', fontFamily: FONT,
          fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s',
          background: active === tab.id ? T.blue : 'transparent',
          color: active === tab.id ? '#fff' : T.t3,
          boxShadow: active === tab.id ? '0 2px 8px rgba(59,126,255,0.35)' : 'none',
        }}
      >
        {tab.icon && <span style={{ display: 'flex' }}>{tab.icon}</span>}
        {tab.label}
        {tab.badge !== undefined && (
          <span style={{ fontSize: 10, fontWeight: 700, padding: '1px 6px', borderRadius: 999, background: active === tab.id ? 'rgba(255,255,255,0.2)' : T.border, color: active === tab.id ? '#fff' : T.t2 }}>{tab.badge}</span>
        )}
      </button>
    ))}
  </div>
);
