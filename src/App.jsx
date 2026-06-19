// ============================================================
//  src/App.jsx
//  Defines all the pages and routes of the app.
// ============================================================

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage      from './pages/LoginPage';
import DashboardPage  from './pages/DashboardPage';
import CustomersPage  from './pages/CustomersPage';
import InvoicesPage   from './pages/InvoicesPage';
import UsersPage      from './pages/UsersPage';
import InvoicePrintPage from './pages/InvoicePrintPage';
import Layout         from './components/Layout';
import './index.css';

// Protect routes — redirect to login if not authenticated
function PrivateRoute({ children }) {
  const { isLoggedIn, loading } = useAuth();
  if (loading) return <div style={{ display:'flex', justifyContent:'center', paddingTop:80 }}><div className="spinner"/></div>;
  return isLoggedIn ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" toastOptions={{ style: { fontSize: 13 } }} />
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={
            <PrivateRoute>
              <Layout />
            </PrivateRoute>
          }>
            {/* Nested routes render inside Layout's <Outlet> */}
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard"  element={<DashboardPage />} />
            <Route path="customers"  element={<CustomersPage />} />
            <Route path="invoices"   element={<InvoicesPage />} />
            <Route path="users"      element={<UsersPage />} />
            <Route path="invoice/print/:id" element={<InvoicePrintPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
