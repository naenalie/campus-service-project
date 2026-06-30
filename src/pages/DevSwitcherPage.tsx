import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const TEST_ACCOUNTS = [
  { role: 'PELAPOR', email: 'pelapor@test.com', icon: '👤', color: '#8B5CF6', path: '/' },
  { role: 'ADMIN', email: 'admin@test.com', icon: '👑', color: '#3B82F6', path: '/admin' },
  { role: 'TEKNISI', email: 'teknisi@test.com', icon: '🔧', color: '#14B8A6', path: '/teknisi' },
  { role: 'MANAJER', email: 'manajer@test.com', icon: '📊', color: '#F59E0B', path: '/manajer' },
];

export const DevSwitcherPage: React.FC = () => {
  const { login, logout } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const quickLogin = async (email: string, role: string, path: string) => {
    setLoading(role);
    setError(null);
    try {
      await logout();
      await new Promise(r => setTimeout(r, 300));
      await login(email, 'test12345678');
      navigate(path);
    } catch (err: any) {
      setError('Gagal: ' + (err.message || 'Cek apakah akun sudah dibuat'));
    } finally {
      setLoading(null);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      position: 'relative',
      zIndex: 1,
    }}>
      <div className="nature-main-card" style={{ padding: '40px', maxWidth: '480px', width: '100%' }}>
        <h1 style={{ textAlign: 'center', color: 'var(--text-primary)', marginBottom: '8px', fontSize: '22px', fontWeight: 700 }}>
          🔧 Dev Role Switcher
        </h1>
        <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px', marginBottom: '32px' }}>
          Klik untuk login cepat ke role manapun
        </p>

        {error && (
          <div style={{
            background: 'rgba(244,63,94,0.1)',
            border: '1px solid rgba(244,63,94,0.3)',
            borderRadius: '12px',
            padding: '12px 16px',
            color: '#F43F5E',
            fontSize: '13px',
            marginBottom: '16px',
          }}>
            ⚠️ {error}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {TEST_ACCOUNTS.map((acc) => (
            <button
              key={acc.role}
              onClick={() => quickLogin(acc.email, acc.role, acc.path)}
              disabled={loading !== null}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                padding: '16px 20px',
                cursor: loading ? 'wait' : 'pointer',
                background: loading === acc.role 
                  ? acc.color + '33' 
                  : 'rgba(255,255,255,0.05)',
                border: '1px solid ' + acc.color + '33',
                borderRadius: '16px',
                width: '100%',
                textAlign: 'left',
                opacity: loading && loading !== acc.role ? 0.4 : 1,
                transition: 'all 0.2s ease',
              }}
            >
              <div style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                background: acc.color + '22',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '22px',
                flexShrink: 0,
              }}>
                {acc.icon}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '14px' }}>
                  {loading === acc.role ? 'Loading...' : 'Login sebagai ' + acc.role}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                  {acc.email} · password: test12345678
                </div>
              </div>
              <div style={{ color: acc.color, fontSize: '18px' }}>→</div>
            </button>
          ))}
        </div>

        <div style={{
          marginTop: '24px',
          padding: '12px 16px',
          background: 'rgba(245,158,11,0.08)',
          border: '1px solid rgba(245,158,11,0.2)',
          borderRadius: '12px',
          fontSize: '12px',
          color: '#F59E0B',
        }}>
          ⚠️ Hapus halaman ini sebelum submit final ke dosen.
        </div>
      </div>
    </div>
  );
};

export default DevSwitcherPage;
