// src/App.tsx
// Router pusat Frontend aplikasi Campus Service Request & Maintenance System

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { OrbBackground } from './components/OrbBackground';
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

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <OrbBackground />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Routes (Tidak butuh autentikasi) */}
            <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected Routes (Wajib Login) */}
          {/* 1. Beranda / List Tiket Pribadi (Semua Aktor) */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <HomePage />
              </ProtectedRoute>
            }
          />

          {/* 2. Detail Laporan (Semua Aktor - Tampilan conditional diatur di halaman) */}
          <Route
            path="/requests/:id"
            element={
              <ProtectedRoute>
                <RequestDetailPage />
              </ProtectedRoute>
            }
          />

          {/* 3. Membuat Laporan Baru (Hanya untuk PELAPOR) */}
          <Route
            path="/create"
            element={
              <ProtectedRoute allowedRoles={['PELAPOR']}>
                <CreateRequestPage />
              </ProtectedRoute>
            }
          />

          {/* 4. Dashboard Antrean & Kelola Tiket (Hanya untuk ADMIN) */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* 5. Daftar Penugasan Kerja & Progress (Hanya untuk TEKNISI) */}
          <Route
            path="/teknisi"
            element={
              <ProtectedRoute allowedRoles={['TEKNISI']}>
                <TechnicianPage />
              </ProtectedRoute>
            }
          />

          {/* 6. Dashboard Statistik & Visualisasi Analitik (Hanya untuk MANAJER) */}
          <Route
            path="/manajer"
            element={
              <ProtectedRoute allowedRoles={['MANAJER']}>
                <ManagerDashboard />
              </ProtectedRoute>
            }
          />

          {/* Catch-all: Redirect rute tidak dikenal ke halaman utama (/) */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
