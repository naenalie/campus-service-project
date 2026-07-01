// src/App.tsx
// Router pusat Frontend aplikasi Campus Service - Nature Power Design System

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import './styles/design-system.css';

// Import Halaman (Pages)
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { HomePage } from './pages/HomePage';
import { CreateRequestPage } from './pages/CreateRequestPage';
import { RequestDetailPage } from './pages/RequestDetailPage';
import { AdminDashboard } from './pages/AdminDashboard';
import { TechnicianPage } from './pages/TechnicianPage';
import { ManagerDashboard } from './pages/ManagerDashboard';
import { DevSwitcherPage } from './pages/DevSwitcherPage';

// Responsive Navigation Layout Wrapper Component
const LayoutWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (e) {
      console.error(e);
    }
  };

  const isActive = (path: string) => location.pathname === path;

  let roleDashboardLink = '/';
  if (user?.role === 'ADMIN') roleDashboardLink = '/admin';
  if (user?.role === 'TEKNISI') roleDashboardLink = '/teknisi';
  if (user?.role === 'MANAJER') roleDashboardLink = '/manajer';

  return (
    <div className="nature-app-wrapper">
      {/* 1. DESKTOP LEFT SIDEBAR */}
      <aside className="nature-desktop-sidebar">
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <span style={{ fontSize: '32px' }}>🏛</span>
          <h2 className="nature-sidebar-text" style={{ color: '#FFFFFF', fontSize: '12px', fontWeight: '800', margin: '8px 0 0 0', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            UNKLAB
          </h2>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1, width: '100%' }}>
          <Link to="/" className={`nature-sidebar-link ${isActive('/') ? 'active' : ''}`}>
            <span>🏠</span> <span className="nature-sidebar-text">Beranda</span>
          </Link>
          <Link to="/create" className={`nature-sidebar-link ${isActive('/create') ? 'active' : ''}`}>
            <span>➕</span> <span className="nature-sidebar-text">Lapor Baru</span>
          </Link>
          {user?.role !== 'PELAPOR' && (
            <Link to={roleDashboardLink} className={`nature-sidebar-link ${isActive(roleDashboardLink) ? 'active' : ''}`}>
              <span>⚙️</span> <span className="nature-sidebar-text">Dashboard</span>
            </Link>
          )}
        </nav>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}>
          <button onClick={handleLogout} className="nature-sidebar-link" style={{ background: 'none', border: 'none', width: '100%', justifyContent: 'center' }}>
            <span>🚪</span> <span className="nature-sidebar-text">Keluar</span>
          </button>
        </div>
      </aside>

      {/* 2. MAIN CONTENT CONTAINER */}
      <div className="nature-content-area">
        {children}
      </div>

      {/* 3. MOBILE FLOATING BOTTOM NAV */}
      <nav className="nature-mobile-nav">
        <Link to="/" className={`nature-nav-icon-btn ${isActive('/') ? 'active' : ''}`}>
          🏠
        </Link>
        <Link to="/create" className={`nature-nav-icon-btn ${isActive('/create') ? 'active' : ''}`}>
          ➕
        </Link>
        {user?.role !== 'PELAPOR' && (
          <Link to={roleDashboardLink} className={`nature-nav-icon-btn ${isActive(roleDashboardLink) ? 'active' : ''}`}>
            ⚙️
          </Link>
        )}
        <button onClick={handleLogout} className="nature-nav-icon-btn">
          🚪
        </button>
      </nav>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/dev-switcher" element={<DevSwitcherPage />} />
            {/* Public Fullscreen Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Protected Routes wrapped in Responsive Layout */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <LayoutWrapper>
                    <HomePage />
                  </LayoutWrapper>
                </ProtectedRoute>
              }
            />
            <Route
              path="/requests/:id"
              element={
                <ProtectedRoute>
                  <LayoutWrapper>
                    <RequestDetailPage />
                  </LayoutWrapper>
                </ProtectedRoute>
              }
            />
            <Route
              path="/create"
              element={
                <ProtectedRoute allowedRoles={['PELAPOR']}>
                  <LayoutWrapper>
                    <CreateRequestPage />
                  </LayoutWrapper>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <LayoutWrapper>
                    <AdminDashboard />
                  </LayoutWrapper>
                </ProtectedRoute>
              }
            />
            <Route
              path="/teknisi"
              element={
                <ProtectedRoute allowedRoles={['TEKNISI']}>
                  <LayoutWrapper>
                    <TechnicianPage />
                  </LayoutWrapper>
                </ProtectedRoute>
              }
            />
            <Route
              path="/manajer"
              element={
                <ProtectedRoute allowedRoles={['MANAJER']}>
                  <LayoutWrapper>
                    <ManagerDashboard />
                  </LayoutWrapper>
                </ProtectedRoute>
              }
            />

            {/* Catch-all: Redirect rute tidak dikenal */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;

