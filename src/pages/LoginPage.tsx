// src/pages/LoginPage.tsx
// Halaman Login Premium (CR-02) berbasis Liquid Glass + Glassmorphism + Neumorphism

import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ThemeToggle } from '../components/ThemeToggle';

export const LoginPage: React.FC = () => {
  const { user, login, isLoading } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [shakeError, setShakeError] = useState(false);

  // Redirect otomatis jika sudah memiliki sesi login aktif
  useEffect(() => {
    if (user) {
      switch (user.role) {
        case 'ADMIN':
          navigate('/admin');
          break;
        case 'TEKNISI':
          navigate('/teknisi');
          break;
        case 'MANAJER':
          navigate('/manajer');
          break;
        default:
          navigate('/');
          break;
      }
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setShakeError(false);

    if (!email.trim() || !password) {
      triggerError('Email dan password wajib diisi.');
      return;
    }

    setIsSubmitting(true);
    try {
      await login(email.trim(), password);
    } catch (err: any) {
      console.error('Login error:', err);
      triggerError(err.message || 'Email atau password salah. Silakan coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const triggerError = (msg: string) => {
    setError(msg);
    setShakeError(true);
    // Matikan efek shake setelah 400ms agar bisa di-trigger ulang
    setTimeout(() => setShakeError(false), 400);
  };

  return (
    <div style={localStyles.pageContainer}>
      {/* Theme Toggle di Pojok Kanan Atas */}
      <div style={localStyles.toggleWrapper}>
        <ThemeToggle />
      </div>

      {/* Main Login Layout */}
      <div className="animate-in" style={localStyles.contentWrapper}>
        
        {/* Logo & Judul Instansi */}
        <div style={localStyles.logoContainer}>
          <div style={localStyles.logoIconWrapper}>
            <span style={localStyles.logoIcon}>🏛</span>
          </div>
          <h1 style={localStyles.mainTitle}>Campus Service</h1>
          <h2 style={localStyles.subTitle}>Universitas Klabat</h2>
          <p style={localStyles.captionText}>Sistem Pengelolaan Perawatan Sarana & Prasarana</p>
        </div>

        {/* Card Form Login */}
        <div 
          className={`glass-card-strong ${shakeError ? 'error-shake' : ''}`} 
          style={localStyles.loginCard}
        >
          <h3 className="text-heading" style={localStyles.cardHeader}>Selamat datang kembali</h3>

          {error && (
            <div style={localStyles.errorAlert}>
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} style={localStyles.form}>
            <div style={localStyles.formGroup}>
              <label htmlFor="email" style={localStyles.inputLabel}>Email Kampus</label>
              <input
                type="email"
                id="email"
                placeholder="gwen@unklab.ac.id"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isSubmitting || isLoading}
                className="neu-input"
                required
              />
            </div>

            <div style={localStyles.formGroup}>
              <label htmlFor="password" style={localStyles.inputLabel}>Password</label>
              <div style={localStyles.passwordWrapper}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isSubmitting || isLoading}
                  className="neu-input"
                  style={{ paddingRight: '48px' }}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={localStyles.eyeButton}
                  tabIndex={-1}
                  aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                >
                  {showPassword ? '👁️' : '🔒'}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || isLoading}
              className="btn-primary"
              style={{ width: '100%', marginTop: '8px' }}
            >
              {isSubmitting ? (
                <>
                  <div style={localStyles.spinnerMini}></div>
                  <span>Menghubungkan...</span>
                </>
              ) : (
                'Masuk →'
              )}
            </button>
          </form>

          {/* Divider */}
          <div style={localStyles.dividerContainer}>
            <div style={localStyles.dividerLine}></div>
            <span style={localStyles.dividerText}>atau</span>
            <div style={localStyles.dividerLine}></div>
          </div>

          {/* Link Daftar Akun Baru */}
          <div style={localStyles.registerWrapper}>
            <p style={localStyles.registerText}>Belum memiliki akun?</p>
            <Link to="/register" style={{ textDecoration: 'none' }}>
              <button className="btn-glass" style={{ width: '100%' }}>
                Daftar Sekarang
              </button>
            </Link>
          </div>
        </div>

        {/* Footer */}
        <p style={localStyles.footerText}>© 2026 UNKLAB Campus Services</p>
      </div>
    </div>
  );
};

// Local inline-styles
const localStyles: Record<string, React.CSSProperties> = {
  pageContainer: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    width: '100vw',
    position: 'relative',
    padding: '24px',
    zIndex: 1,
  },
  toggleWrapper: {
    position: 'absolute',
    top: '24px',
    right: '24px',
    zIndex: 10,
  },
  contentWrapper: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%',
    maxWidth: '420px',
  },
  logoContainer: {
    textAlign: 'center',
    marginBottom: '28px',
  },
  logoIconWrapper: {
    width: '64px',
    height: '64px',
    borderRadius: '20px',
    background: 'linear-gradient(135deg, var(--accent-purple), var(--accent-teal))',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 8px 24px rgba(139, 92, 246, 0.25)',
    marginBottom: '16px',
  },
  logoIcon: {
    fontSize: '32px',
    color: '#fff',
  },
  mainTitle: {
    fontFamily: "'Outfit', sans-serif",
    fontSize: '28px',
    fontWeight: '700',
    color: 'var(--text-primary)',
    margin: '0',
    lineHeight: '1.2',
  },
  subTitle: {
    fontFamily: "'Outfit', sans-serif",
    fontSize: '18px',
    fontWeight: '600',
    color: 'var(--accent-purple)',
    margin: '4px 0 0 0',
  },
  captionText: {
    fontSize: '12px',
    color: 'var(--text-muted)',
    margin: '8px 0 0 0',
  },
  loginCard: {
    width: '100%',
    padding: '36px 28px',
  },
  cardHeader: {
    textAlign: 'center',
    color: 'var(--text-primary)',
    marginBottom: '24px',
  },
  errorAlert: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    backgroundColor: 'rgba(244, 63, 94, 0.12)', // Rose subtle
    border: '1px solid rgba(244, 63, 94, 0.25)',
    borderRadius: '12px',
    padding: '12px 16px',
    color: 'var(--accent-rose)',
    fontSize: '13.5px',
    marginBottom: '20px',
    lineHeight: '1.4',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '18px',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  inputLabel: {
    fontSize: '12px',
    fontWeight: '600',
    color: 'var(--text-secondary)',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
  },
  passwordWrapper: {
    position: 'relative',
    width: '100%',
  },
  eyeButton: {
    position: 'absolute',
    right: '14px',
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'none',
    border: 'none',
    color: 'var(--text-muted)',
    fontSize: '18px',
    cursor: 'pointer',
    padding: '4px',
    outline: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  spinnerMini: {
    width: '18px',
    height: '18px',
    border: '2px solid rgba(255,255,255,0.3)',
    borderTop: '2px solid white',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
  dividerContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    margin: '24px 0',
  },
  dividerLine: {
    flex: 1,
    height: '1px',
    backgroundColor: 'var(--border-subtle)',
  },
  dividerText: {
    fontSize: '12px',
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
  },
  registerWrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    alignItems: 'center',
  },
  registerText: {
    fontSize: '13.5px',
    color: 'var(--text-secondary)',
  },
  footerText: {
    fontSize: '12px',
    color: 'var(--text-muted)',
    marginTop: '32px',
  },
};

// CSS Injection Shake Animation untuk card error
if (typeof document !== 'undefined') {
  const styleTag = document.createElement('style');
  styleTag.innerHTML = `
    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      25% { transform: translateX(-6px); }
      75% { transform: translateX(6px); }
    }
    .error-shake {
      animation: shake 0.15s ease-in-out 0s 2;
    }
  `;
  document.head.appendChild(styleTag);
}
