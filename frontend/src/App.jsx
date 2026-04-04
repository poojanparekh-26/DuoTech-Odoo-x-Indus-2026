import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';

import FloorsPage          from './pages/FloorsPage';
import TablesPage          from './pages/TablesPage';
import OrderPage           from './pages/OrderPage';
import KitchenPage         from './pages/KitchenPage';
import PaymentPage         from './pages/PaymentPage';
import QRMenuPage          from './pages/QRMenuPage';
import CustomerSummaryPage from './pages/CustomerSummaryPage';
import DashboardPage       from './pages/DashboardPage';
import LoginPage           from './pages/LoginPage';

/** Wraps protected routes — redirects to /login if no token is stored. */
function RequireAuth({ children }) {
  const location = useLocation();
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/login"             element={<LoginPage />} />
        <Route path="/qr/:token"         element={<QRMenuPage />} />
        <Route path="/customer-display"  element={<CustomerSummaryPage />} />

        {/* Protected */}
        <Route path="/" element={<RequireAuth><FloorsPage /></RequireAuth>} />
        <Route path="/tables" element={<RequireAuth><TablesPage /></RequireAuth>} />
        <Route path="/order"  element={<RequireAuth><OrderPage /></RequireAuth>} />
        <Route path="/kitchen" element={<RequireAuth><KitchenPage /></RequireAuth>} />
        <Route path="/payment" element={<RequireAuth><PaymentPage /></RequireAuth>} />
        <Route path="/dashboard" element={<RequireAuth><DashboardPage /></RequireAuth>} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
