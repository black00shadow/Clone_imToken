import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import AdminLayout from './layouts/AdminLayout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ChainsPage from './pages/ChainsPage';
import TokensPage from './pages/TokensPage';
import DappsPage from './pages/DappsPage';
import AnnouncementsPage from './pages/AnnouncementsPage';
import BannersPage from './pages/BannersPage';
import RemoteConfigPage from './pages/RemoteConfigPage';
import RiskAddressesPage from './pages/RiskAddressesPage';
import AppVersionsPage from './pages/AppVersionsPage';
import WalletsPage from './pages/WalletsPage';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem('token');
  if (!token) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/"
          element={
            <PrivateRoute>
              <AdminLayout />
            </PrivateRoute>
          }
        >
          <Route index element={<DashboardPage />} />
          <Route path="chains" element={<ChainsPage />} />
          <Route path="tokens" element={<TokensPage />} />
          <Route path="dapps" element={<DappsPage />} />
          <Route path="announcements" element={<AnnouncementsPage />} />
          <Route path="banners" element={<BannersPage />} />
          <Route path="remote-config" element={<RemoteConfigPage />} />
          <Route path="risk-addresses" element={<RiskAddressesPage />} />
          <Route path="wallets" element={<WalletsPage />} />
          <Route path="app-versions" element={<AppVersionsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
