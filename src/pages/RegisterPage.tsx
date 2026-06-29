// src/pages/RegisterPage.tsx
// Halaman Registrasi Premium (CR-02) berbasis Liquid Glass + Glassmorphism + Neumorphism

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ThemeToggle } from '../components/ThemeToggle';

export const RegisterPage: React.FC = () => {
  const { register, isLoading } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [shakeError, setShakeError] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setShakeError(false);

    // Validasi input di Frontend
    if (!name.trim() || !email.trim() || !password || !confirmPassword) {
      triggerError('Semua kolom wajib diisi.');
      return;
    }

    if (password.length < 8) {
      triggerError('Password minimal harus terdiri dari 8 karakter.');
      return;
    }

    if (password !== confirmPassword) {
      triggerError('Konfirmasi password tidak cocok dengan password yang dimasukkan.');
      return;
    }

    setIsSubmitting(true);
    try {
      await register(name.trim(), email.trim(), password);
      setSuccess('Registrasi akun berhasil! Silakan masuk...');
      
      // Reset input form
      setName('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');

      // Redirect ke login setelah 2 detik
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err: any) {
      console.error('Registration error:', err);
      triggerError(err.message || 'Registrasi gagal. Silakan coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const triggerError = (msg: string) => {
    setError(msg);
    setShakeError(true);
    setTimeout(() => setShakeError(false), 400);
  };

  return (
    <div style={localStyles.pageContainer}>
      {/* Theme Toggle di Pojok Kanan Atas */}
      <div style={localStyles.toggleWrapper}>
        <ThemeToggle />
      </div>

      {/* Main Register Layout */}
      <div className="animate-in" style={localStyles.contentWrapper}>
        
        {/* Logo & Judul Instansi */}
        <div style={localStyles.logoContainer}>
          <div style={localStyles.logoIconWrapper}>
            <span style={localStyles.logoIcon}>📝</span>
          </div>
          <h1 style={localStyles.mainTitle}>Daftar Akun</h1>
          <p style={localStyles.captionText}>Bergabunglah dengan Sistem Layanan Kampus UNKLAB</p>
        </div>

        {/* Card Form Register */}
        <div 
          className={`glass-card-strong ${shakeError ? 'error-shake' : ''}`} 
          style={localStyles.registerCard}
        >
          {error && (
            <div style={localStyles.errorAlert}>
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div style={localStyles.successAlert}>
              <span>✅</span>
              <span>{success}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} style={localStyles.form}>
            <div style={localStyles.formGroup}>
              <label htmlFor="name" style={localStyles.inputLabel}>Nama Lengkap</label>
              <input
                type="text"
                id="name"
                placeholder="Gwen"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isSubmitting || isLoading}
                className="neu-input"
                required
              />
            </div>

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

            <div style={localStyles.formGroup}>
              <label htmlFor="confirmPassword" style={localStyles.inputLabel}>Konfirmasi Password</label>
              <input
                type={showPassword ? 'text' : 'password'}
                id="confirmPassword"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isSubmitting || isLoading}
                className="neu-input"
                required
              />
            </div>

            <div style={localStyles.infoBox}>
              <span style={localStyles.infoIcon}>💡</span>
              <span style={localStyles.infoText}>
                Akun baru otomatis terdaftar sebagai peran **Pelapor** (Mahasiswa / Staf Kampus).
              </span>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || isLoading}
              className="btn-primary"
              style={{ width: '100%', marginTop: '6px' }}
            >
              {isSubmitting ? (
                <>
                  <div style={localStyles.spinnerMini}></div>
                  <span>Membuat Akun...</span>
                </>
              ) : (
                'Daftar Sekarang'
              )}
            </button>
          </form>

          {/* Divider */}
          <div style={localStyles.dividerContainer}>
            <div style={localStyles.dividerLine}></div>
            <span style={localStyles.dividerText}>atau</span>
            <div style={localStyles.dividerLine}></div>
          </div>

          {/* Link Kembali ke Login */}
          <div style={localStyles.loginLinkWrapper}>
            <p style={localStyles.loginText}>Sudah memiliki akun?</p>
            <Link to="/login" style={{ textDecoration: 'none' }}>
              <button className="btn-glass" style={{ width: '100%' }}>
                Login di sini
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

// Local inline-styles (senada dengan LoginPage)
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
    maxWidth: '430px',
  },
  logoContainer: {
    textAlign: 'center',
    marginBottom: '24px',
  },
  logoIconWrapper: {
    width: '60px',
    height: '60px',
    borderRadius: '18px',
    background: 'linear-gradient(135deg, var(--accent-purple), var(--accent-teal))',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 8px 24px rgba(139, 92, 246, 0.25)',
    marginBottom: '14px',
  },
  logoIcon: {
    fontSize: '30px',
    color: '#fff',
  },
  mainTitle: {
    fontFamily: "'Outfit', sans-serif",
    fontSize: '26px',
    fontWeight: '700',
    color: 'var(--text-primary)',
    margin: '0',
    lineHeight: '1.2',
  },
  captionText: {
    fontSize: '12px',
    color: 'var(--text-muted)',
    margin: '6px 0 0 0',
  },
  registerCard: {
    width: '100%',
    padding: '32px 24px',
  },
  errorAlert: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    backgroundColor: 'rgba(244, 63, 94, 0.12)',
    border: '1px solid rgba(244, 63, 94, 0.25)',
    borderRadius: '12px',
    padding: '12px 16px',
    color: 'var(--accent-rose)',
    fontSize: '13.5px',
    marginBottom: '20px',
    lineHeight: '1.4',
  },
  successAlert: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    backgroundColor: 'rgba(16, 185, 129, 0.12)', // Emerald subtle
    border: '1px solid rgba(16, 185, 129, 0.25)',
    borderRadius: '12px',
    padding: '12px 16px',
    color: 'var(--status-resolved)',
    fontSize: '13.5px',
    marginBottom: '20px',
    lineHeight: '1.4',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
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
  infoBox: {
    display: 'flex',
    gap: '10px',
    backgroundColor: 'rgba(59, 130, 246, 0.08)',
    border: '1px solid rgba(59, 130, 246, 0.2)',
    borderRadius: '12px',
    padding: '10px 14px',
  },
  infoIcon: {
    fontSize: '15px',
  },
  infoText: {
    color: 'var(--text-secondary)',
    fontSize: '12px',
    lineHeight: '1.4',
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
    margin: '20px 0',
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
  loginLinkWrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    alignItems: 'center',
  },
  loginText: {
    fontSize: '13.5px',
    color: 'var(--text-secondary)',
  },
  footerText: {
    fontSize: '12px',
    color: 'var(--text-muted)',
    marginTop: '28px',
  },
};
