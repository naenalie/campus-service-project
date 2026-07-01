// src/components/ProtectedRoute.tsx
// Komponen Route Guard (CR-02) untuk proteksi halaman berbasis autentikasi dan otorisasi role

import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: Array<'PELAPOR' | 'ADMIN' | 'TEKNISI' | 'MANAJER'>;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { user, token, isLoading } = useAuth();

  // 1. Tampilkan state loading jika sistem sedang memverifikasi token sesi di background
  if (isLoading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p style={styles.loadingText}>Memuat sesi...</p>
      </div>
    );
  }

  // 2. Jika token tidak ada atau data user null -> redirect ke halaman login
  const currentToken = token || localStorage.getItem('auth_token');
  if (!user || !currentToken) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect ke halaman yang sesuai role mereka
    if (user.role === 'ADMIN') return <Navigate to="/admin" replace />;
    if (user.role === 'TEKNISI') return <Navigate to="/teknisi" replace />;
    if (user.role === 'MANAJER') return <Navigate to="/manajer" replace />;
    return <Navigate to="/" replace />;
  }

  // 4. Lolos semua verifikasi -> render children
  return <>{children}</>;
};

// Premium Styling untuk ProtectedRoute Wrapper
const styles: Record<string, React.CSSProperties> = {
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    backgroundColor: '#0f172a',
    fontFamily: "system-ui, sans-serif",
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '4px solid #334155',
    borderTop: '4px solid #3b82f6',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  loadingText: {
    marginTop: '16px',
    color: '#94a3b8',
    fontSize: '14px',
  },
  deniedContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    backgroundColor: '#0f172a',
    padding: '20px',
    fontFamily: "system-ui, sans-serif",
  },
  deniedCard: {
    backgroundColor: '#1e293b',
    border: '1px solid #334155',
    borderRadius: '16px',
    padding: '40px 32px',
    maxWidth: '400px',
    width: '100%',
    textAlign: 'center',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)',
  },
  deniedIcon: {
    fontSize: '64px',
    display: 'block',
    marginBottom: '16px',
  },
  deniedTitle: {
    fontSize: '22px',
    fontWeight: '700',
    color: '#ef4444', // Red 500
    margin: '0 0 10px 0',
  },
  deniedText: {
    fontSize: '14px',
    color: '#cbd5e1',
    lineHeight: '1.6',
    margin: '0 0 24px 0',
  },
  deniedButton: {
    backgroundColor: '#334155',
    color: '#f8fafc',
    border: '1px solid #475569',
    borderRadius: '8px',
    padding: '10px 20px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
};

// CSS Animation Spinner (ditambahkan runtime di dokumen head jika belum ada)
if (typeof document !== 'undefined') {
  const styleTag = document.createElement('style');
  styleTag.innerHTML = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(styleTag);
}
