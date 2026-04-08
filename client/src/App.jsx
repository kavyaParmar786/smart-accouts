import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import AppLayout from './components/layout/AppLayout.jsx';
import Login from './pages/auth/Login.jsx';
import Register from './pages/auth/Register.jsx';
import Dashboard from './pages/dashboard/Dashboard.jsx';
import Transactions from './pages/transactions/Transactions.jsx';
import Ledger from './pages/ledger/Ledger.jsx';
import Invoices from './pages/invoices/Invoices.jsx';
import Inventory from './pages/inventory/Inventory.jsx';
import Reports from './pages/reports/Reports.jsx';
import Settings from './pages/settings/Settings.jsx';

function ProtectedRoute({ children }) {
  const { token } = useAuthStore();
  if (!token) return <Navigate to="/login" replace />;
  return <AppLayout>{children}</AppLayout>;
}

function PublicRoute({ children }) {
  const { token } = useAuthStore();
  if (token) return <Navigate to="/dashboard" replace />;
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login"        element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/register"     element={<PublicRoute><Register /></PublicRoute>} />
        <Route path="/dashboard"    element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/transactions" element={<ProtectedRoute><Transactions /></ProtectedRoute>} />
        <Route path="/ledger"       element={<ProtectedRoute><Ledger /></ProtectedRoute>} />
        <Route path="/invoices"     element={<ProtectedRoute><Invoices /></ProtectedRoute>} />
        <Route path="/inventory"    element={<ProtectedRoute><Inventory /></ProtectedRoute>} />
        <Route path="/reports"      element={<ProtectedRoute><Reports /></ProtectedRoute>} />
        <Route path="/settings"     element={<ProtectedRoute><Settings /></ProtectedRoute>} />
        <Route path="*"             element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
