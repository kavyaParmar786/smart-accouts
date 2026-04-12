import { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronRight, LayoutDashboard, ArrowLeftRight, FileText, Package, BarChart3, Users, Scale, BookOpen, Zap, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card, Button, PageHeader, T } from '../../components/ui/index.jsx';

const FONT = "'Sora', ui-sans-serif, system-ui, sans-serif";

const GUIDES = [
  {
    id: 'start',
    icon: '🚀',
    title: 'Getting Started',
    color: T.blue,
    steps: [
      { title: 'Create your business', desc: 'Go to Settings → Business tab. Fill in your business name, type, and GSTIN. This info appears on your invoices.' },
      { title: 'Set your currency', desc: 'Choose INR, USD, or EUR in business settings. All reports and invoices will use this currency.' },
      { title: 'Add default categories', desc: 'Categories like "Sales", "Rent", and "Salary" are pre-created. Add custom ones in Settings if needed.' },
      { title: 'Invite your team', desc: 'Go to Team → Invite Member. Admins get full access; Staff can only add transactions and view reports.' },
    ],
  },
  {
    id: 'transactions',
    icon: '💸',
    title: 'Recording Income & Expenses',
    color: T.green,
    steps: [
      { title: 'Add a transaction', desc: 'Click "Add Transaction" on Dashboard or go to Transactions → "+ Add". Choose Income or Expense, enter amount, category, date, and payment method.' },
      { title: 'Payment methods', desc: 'Track how money moved: Cash, Bank Transfer, UPI, Card, or Other. This helps reconcile your bank statements.' },
      { title: 'Add a reference', desc: 'Optionally link a cheque number, PO number, or invoice number so you can trace entries later.' },
      { title: 'Filter & search', desc: 'Use the Filters button to narrow by date range, type, category, or payment method. Export any filtered view to CSV.' },
      { title: 'Edit or delete', desc: 'Click the edit (✏️) or delete (🗑️) icons on any row. Deleted transactions are permanent.' },
    ],
  },
  {
    id: 'invoices',
    icon: '🧾',
    title: 'Creating & Managing Invoices',
    color: T.cyan,
    steps: [
      { title: 'Create an invoice', desc: 'Go to Invoices → "Create Invoice". Fill in customer details, add line items with quantity and rate. GST is calculated automatically.' },
      { title: 'GST rates', desc: 'Each line item can have a different GST rate (0%, 5%, 12%, 18%, 28%). The subtotal, GST, and grand total are shown in real time.' },
      { title: 'Download PDF', desc: 'Open any invoice and click "Download PDF". A professionally formatted PDF is generated instantly — no internet required.' },
      { title: 'Mark as Sent', desc: 'After emailing the invoice to your customer, mark it as "Sent". This changes its status and helps track what\'s outstanding.' },
      { title: 'Record Payment', desc: 'When you receive payment, click "Record Payment" on the invoice. This auto-creates an income transaction and marks the invoice as Paid.' },
      { title: 'Overdue invoices', desc: 'Invoices past their due date appear as Overdue in red. The Notifications panel shows overdue alerts automatically.' },
    ],
  },
  {
    id: 'inventory',
    icon: '📦',
    title: 'Managing Inventory',
    color: T.amber,
    steps: [
      { title: 'Add a product', desc: 'Go to Inventory → "+ Add Product". Enter name, SKU, selling price, cost price, current stock quantity, and GST rate.' },
      { title: 'Low stock alerts', desc: 'Set a "Low Stock Alert At" threshold. When quantity drops below this, the product shows as Low Stock and appears in notifications.' },
      { title: 'Adjust stock', desc: 'Click the ↕️ icon on any product to adjust stock. Choose Stock In (purchase), Stock Out (sale/use), or Adjustment (correction). Always add a reason.' },
      { title: 'Track profit margin', desc: 'The inventory stats show total cost value vs retail value — the gap is your potential gross margin.' },
      { title: 'Units', desc: 'Products can be tracked in pcs, kg, g, litre, ml, box, set, pair, dozen, or meter.' },
    ],
  },
  {
    id: 'reports',
    icon: '📊',
    title: 'Reports & Analytics',
    color: T.purple,
    steps: [
      { title: 'P&L Statement', desc: 'Go to Reports → P&L tab. See total income, expenses, net profit, and profit margin for any date range or year.' },
      { title: 'Monthly Trends', desc: 'The Trends tab shows a 12-month line chart of income, expenses, and profit. Hover to see exact values.' },
      { title: 'Category Breakdown', desc: 'The Breakdown tab shows pie charts — which expense categories cost the most, and which income sources earn the most.' },
      { title: 'Export data', desc: 'Click "Export" on any report to download a CSV of all transactions for that period. Compatible with Excel and Google Sheets.' },
      { title: 'AI Insights', desc: 'The dashboard shows 4 AI-powered insights based on your data — like "Expenses up 30% this month" or "₹50,000 in overdue invoices". These update daily.' },
    ],
  },
  {
    id: 'balancesheet',
    icon: '⚖️',
    title: 'Balance Sheet',
    color: T.green,
    steps: [
      { title: 'What is a Balance Sheet?', desc: 'It\'s a snapshot of your financial position: what you own (Assets), what you owe (Liabilities), and what\'s left for you (Equity = Assets - Liabilities).' },
      { title: 'Assets', desc: 'Includes Cash & Bank (your net profit in cash), Accounts Receivable (unpaid invoices), and Inventory (stock value at cost price).' },
      { title: 'Liabilities', desc: 'Includes Accounts Payable (money you owe suppliers) and any long-term loans. Add these manually via adjustments.' },
      { title: 'Equity', desc: 'Owner\'s Equity = Total Assets - Total Liabilities. Positive equity means your business is solvent. Negative means you owe more than you own.' },
      { title: 'Accounting equation', desc: 'Assets must always equal Liabilities + Equity. SmartAccounts shows a balance check at the bottom of the page.' },
    ],
  },
  {
    id: 'ledger',
    icon: '📒',
    title: 'General Ledger',
    color: T.t2,
    steps: [
      { title: 'What is the Ledger?', desc: 'The ledger shows every transaction with a running balance — just like a bank statement but for your entire business.' },
      { title: 'Debits vs Credits', desc: 'Income entries show as green Credits (+). Expense entries show as red Debits (-). The running balance updates with each entry.' },
      { title: 'Filter by period', desc: 'Use the Year selector or date range fields to view any period. Great for reconciling with your bank at month-end.' },
      { title: 'Export', desc: 'Download the full ledger as CSV for your accountant or for import into accounting software.' },
    ],
  },
  {
    id: 'team',
    icon: '👥',
    title: 'Team & Access Control',
    color: T.purple,
    steps: [
      { title: 'Invite a team member', desc: 'Go to Team → "Invite Member". Enter their email. If they already have a SmartAccounts account, they\'re added instantly.' },
      { title: 'New user accounts', desc: 'If the email doesn\'t exist, a new account is created. You\'ll see a temporary password — share it securely with the new member.' },
      { title: 'Roles explained', desc: 'Owners have full control. Admins can manage all data and invite staff. Staff can only view and add transactions.' },
      { title: 'Change roles', desc: 'Click "Change" next to any member\'s name to switch between Admin and Staff. You cannot change the Owner role.' },
      { title: 'Multiple businesses', desc: 'A single user account can belong to multiple businesses with different roles in each. Use the business switcher in the sidebar.' },
      { title: 'Remove a member', desc: 'Click the 🗑️ icon to remove someone\'s access. Their transactions are preserved — only their access is revoked.' },
    ],
  },
];

const FAQ = [
  { q: 'Can I use SmartAccounts for GST filing?', a: 'SmartAccounts calculates GST on invoices and tracks GST collected vs paid. You can export the data for your CA to file GST returns. We don\'t file directly with the government.' },
  { q: 'Is my data safe?', a: 'All data is stored in MongoDB with encrypted passwords (bcrypt). JWT tokens expire after 7 days. Each business\'s data is completely isolated from others.' },
  { q: 'Can two users edit the same invoice at the same time?', a: 'Yes, but the last save wins. We recommend only one person edit an invoice at a time. Future versions will add conflict detection.' },
  { q: 'Can I import existing data?', a: 'Currently you can add transactions manually. CSV import is on the roadmap. For large datasets, contact us for a bulk import.' },
  { q: 'How do I switch between businesses?', a: 'Click the business name in the top of the sidebar. A dropdown shows all your businesses. Click any to switch — the page will reload with that business\'s data.' },
  { q: 'What happens if I delete a transaction?', a: 'It\'s permanently deleted. There\'s no recycle bin. Transactions linked to paid invoices cannot be deleted through the invoice — only from the Transactions page.' },
];

function GuideCard({ guide, expanded, onToggle }) {
  return (
    <Card style={{ padding: 0, overflow: 'hidden', border: expanded ? `1px solid ${guide.color}40` : undefined, transition: 'border-color 0.2s' }}>
      <button
        onClick={onToggle}
        style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 14, padding: '18px 22px', background: expanded ? `${guide.color}08` : 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left', transition: 'background 0.2s' }}
        onMouseEnter={e => { if (!expanded) e.currentTarget.style.background = T.hover; }}
        onMouseLeave={e => { if (!expanded) e.currentTarget.style.background = 'transparent'; }}
      >
        <span style={{ fontSize: 26, flexShrink: 0 }}>{guide.icon}</span>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: 14, fontWeight: 700, color: T.t1, fontFamily: FONT, letterSpacing: '-0.02em' }}>{guide.title}</p>
          <p style={{ fontSize: 11, color: T.t3, marginTop: 3 }}>{guide.steps.length} steps</p>
        </div>
        <ChevronDown size={16} color={T.t3} style={{ flexShrink: 0, transition: 'transform 0.2s', transform: expanded ? 'rotate(180deg)' : 'rotate(0)' }} />
      </button>

      {expanded && (
        <div className="anim-up" style={{ borderTop: `1px solid ${T.border}` }}>
          {guide.steps.map((step, i) => (
            <div key={i} style={{ display: 'flex', gap: 16, padding: '16px 22px', borderBottom: i < guide.steps.length - 1 ? `1px solid rgba(28,37,64,0.4)` : 'none' }}>
              <div style={{ flexShrink: 0, marginTop: 2 }}>
                <div style={{ width: 24, height: 24, borderRadius: '50%', background: `${guide.color}20`, border: `1px solid ${guide.color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, color: guide.color, fontFamily: FONT }}>
                  {i + 1}
                </div>
              </div>
              <div>
                <p style={{ fontSize: 13, fontWeight: 700, color: T.t1, fontFamily: FONT, marginBottom: 5 }}>{step.title}</p>
                <p style={{ fontSize: 12, color: T.t2, lineHeight: 1.7 }}>{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

function FAQItem({ item }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderBottom: `1px solid rgba(28,37,64,0.5)` }}>
      <button onClick={() => setOpen(o => !o)}
        style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '16px 0', background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: T.t1, fontFamily: FONT }}>{item.q}</p>
        {open ? <ChevronDown size={15} color={T.t3} /> : <ChevronRight size={15} color={T.t3} />}
      </button>
      {open && (
        <p className="anim-up" style={{ fontSize: 12, color: T.t2, lineHeight: 1.7, paddingBottom: 16 }}>{item.a}</p>
      )}
    </div>
  );
}

export default function UserGuide() {
  const [expanded, setExpanded] = useState('start');
  const navigate = useNavigate();

  const QUICK_LINKS = [
    { label: 'Dashboard',     to: '/dashboard',     icon: LayoutDashboard, color: T.blue   },
    { label: 'Transactions',  to: '/transactions',  icon: ArrowLeftRight,  color: T.green  },
    { label: 'Invoices',      to: '/invoices',      icon: FileText,        color: T.cyan   },
    { label: 'Inventory',     to: '/inventory',     icon: Package,         color: T.amber  },
    { label: 'Reports',       to: '/reports',       icon: BarChart3,       color: T.purple },
    { label: 'Balance Sheet', to: '/balance-sheet', icon: Scale,           color: T.green  },
    { label: 'Team',          to: '/team',          icon: Users,           color: T.purple },
    { label: 'Ledger',        to: '/ledger',        icon: BookOpen,        color: T.t2     },
  ];

  return (
    <div className="page">
      <PageHeader
        title="User Guide"
        subtitle="Everything you need to know to get the most out of SmartAccounts"
        icon={<HelpCircle size={20} />}
      />

      {/* Hero banner */}
      <div style={{ background: 'linear-gradient(135deg, rgba(59,126,255,0.12) 0%, rgba(155,109,255,0.08) 100%)', border: `1px solid rgba(59,126,255,0.2)`, borderRadius: 16, padding: 28, marginBottom: 28, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -20, right: -20, width: 150, height: 150, borderRadius: '50%', background: 'radial-gradient(rgba(59,126,255,0.15), transparent)', pointerEvents: 'none' }} />
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
          <div style={{ fontSize: 40, flexShrink: 0 }}>💡</div>
          <div>
            <p style={{ fontSize: 18, fontWeight: 800, color: T.t1, fontFamily: FONT, letterSpacing: '-0.03em', marginBottom: 8 }}>Welcome to SmartAccounts</p>
            <p style={{ fontSize: 13, color: T.t2, lineHeight: 1.7, maxWidth: 600 }}>
              SmartAccounts is a full-stack accounting SaaS for Indian businesses. Track income & expenses, create GST invoices, manage inventory, view P&L reports and balance sheets — all in one place.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 16 }}>
              {['GST Invoicing', 'P&L Reports', 'Balance Sheet', 'Inventory', 'Team Access', 'AI Insights'].map(tag => (
                <span key={tag} style={{ fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 999, background: T.blueG, color: T.blue, fontFamily: FONT }}>✓ {tag}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Quick nav */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 10, marginBottom: 28 }}>
        {QUICK_LINKS.map(({ label, to, icon: Icon, color }) => (
          <button key={to} onClick={() => navigate(to)}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, padding: '16px 12px', background: T.card, border: `1px solid ${T.border}`, borderRadius: 14, cursor: 'pointer', transition: 'all 0.2s', textAlign: 'center' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = color + '60'; e.currentTarget.style.background = color + '10'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.background = T.card; }}
          >
            <div style={{ width: 36, height: 36, borderRadius: 10, background: color + '20', display: 'flex', alignItems: 'center', justifyContent: 'center', color }}>
              <Icon size={16} />
            </div>
            <span style={{ fontSize: 11, fontWeight: 700, color: T.t2, fontFamily: FONT }}>{label}</span>
          </button>
        ))}
      </div>

      {/* Guide sections */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24, alignItems: 'start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <p style={{ fontSize: 11, fontWeight: 800, color: T.t3, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8, fontFamily: FONT }}>Step-by-Step Guides</p>
          {GUIDES.map(guide => (
            <GuideCard
              key={guide.id}
              guide={guide}
              expanded={expanded === guide.id}
              onToggle={() => setExpanded(expanded === guide.id ? null : guide.id)}
            />
          ))}
        </div>

        {/* FAQ */}
        <div style={{ position: 'sticky', top: 24 }}>
          <p style={{ fontSize: 11, fontWeight: 800, color: T.t3, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8, fontFamily: FONT }}>FAQ</p>
          <Card>
            {FAQ.map((item, i) => <FAQItem key={i} item={item} />)}
          </Card>

          {/* Tips box */}
          <Card style={{ marginTop: 16, background: 'rgba(0,217,126,0.05)', borderColor: `${T.green}30` }}>
            <div style={{ display: 'flex', gap: 10 }}>
              <span style={{ fontSize: 20, flexShrink: 0 }}>💡</span>
              <div>
                <p style={{ fontSize: 12, fontWeight: 700, color: T.green, fontFamily: FONT, marginBottom: 8 }}>Pro Tips</p>
                {[
                  'Record all transactions daily — it takes 2 minutes and keeps your books clean.',
                  'Use the Ledger view at month-end to reconcile with your bank statement.',
                  'Set low-stock alerts for your top 10 products — never run out unexpectedly.',
                  'Download the P&L as CSV and share with your CA — saves hours of data entry.',
                  'Mark invoices as Sent immediately after emailing — overdue detection depends on it.',
                ].map((tip, i) => (
                  <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'flex-start' }}>
                    <CheckCircle size={12} color={T.green} style={{ marginTop: 2, flexShrink: 0 }} />
                    <p style={{ fontSize: 11, color: T.t2, lineHeight: 1.6 }}>{tip}</p>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
