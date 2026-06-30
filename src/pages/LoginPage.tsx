// src/pages/LoginPage.tsx
// Halaman Login Premium berbasis flat solid Nature Power design (Pages 1-3)

import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

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
      const loggedInUser = await login(email.trim(), password);
      if (loggedInUser.role === 'ADMIN') navigate('/admin');
      else if (loggedInUser.role === 'TEKNISI') navigate('/teknisi');
      else if (loggedInUser.role === 'MANAJER') navigate('/manajer');
      else navigate('/');
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
    setTimeout(() => setShakeError(false), 400);
  };

  return (
    <div style={localStyles.pageContainer}>
      
      {/* 2 Column Split Layout Container */}
      <div 
        className={`nature-main-card ${shakeError ? 'error-shake' : ''}`}
        style={{
          width: '100%',
          maxWidth: '960px',
          display: 'grid',
          gridTemplateColumns: window.innerWidth < 769 ? '1fr' : '1fr 1fr',
          padding: 0,
          overflow: 'hidden',
          backgroundColor: '#FFFFFF',
        }}
      >
        {/* Left Column: Dark Brand Banner */}
        <div 
          style={{
            backgroundColor: '#101411', // Solid black
            color: '#FFFFFF',
            padding: '48px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            minHeight: '400px',
          }}
        >
          <div>
            <div style={{ fontSize: '48px', marginBottom: '24px' }}>🏛</div>
            <span className="nature-micro-label" style={{ color: '#D4E875', marginBottom: '8px' }}>UNKLAB CAMPUS SERVICES</span>
            <h1 className="nature-huge-header" style={{ color: '#FFFFFF', fontSize: '38px', lineHeight: 1.1 }}>
              Rise and shine, UNKLAB!
            </h1>
            <p style={{ fontSize: '15px', color: '#8E9A90', marginTop: '16px', lineHeight: 1.6 }}>
              Layanan perbaikan sarana prasarana Universitas Klabat. Kami siap membantu Anda menjaga kenyamanan belajar mengajar.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px', fontWeight: '700', color: '#D4E875' }}>
            <span>⚡ Respon Cepat & Tanggap</span>
            <span>📍 Peta Lokasi Gedung Kampus</span>
          </div>
        </div>

        {/* Right Column: Login Form */}
        <div style={{ padding: '48px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div>
            <span className="nature-micro-label">AUTENTIKASI AKUN</span>
            <h3 style={{ fontSize: '28px', fontWeight: '800', margin: '4px 0 24px 0', letterSpacing: '-0.02em' }}>
              Selamat datang kembali
            </h3>
          </div>

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
                placeholder="gwen@student.unklab.ac.id"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isSubmitting || isLoading}
                style={localStyles.inputField}
                required
              />
            </div>

            <div style={localStyles.formGroup}>
              <label htmlFor="password" style={localStyles.inputLabel}>Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isSubmitting || isLoading}
                  style={{ ...localStyles.inputField, paddingRight: '48px' }}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={localStyles.eyeButton}
                  tabIndex={-1}
                >
                  {showPassword ? '👁️' : '🔒'}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || isLoading}
              className="nature-pill active"
              style={{ width: '100%', display: 'flex', justifyContent: 'center', padding: '14px', marginTop: '12px' }}
            >
              {isSubmitting ? 'Menghubungkan...' : 'Masuk →'}
            </button>
          </form>

          {/* Link Daftar Akun Baru */}
          <div style={{ marginTop: '32px', textAlign: 'center', borderTop: '1px solid #E0E8E1', paddingTop: '24px' }}>
            <p style={{ fontSize: '14px', color: '#68776B', marginBottom: '16px' }}>Belum memiliki akun?</p>
            <Link to="/register" style={{ textDecoration: 'none' }}>
              <button className="nature-pill inactive" style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                Daftar Sekarang
              </button>
            </Link>
          </div>
        </div>

      </div>

      <p style={{ fontSize: '12px', color: '#68776B', marginTop: '32px', fontWeight: '700' }}>
        © 2026 UNKLAB Campus Services
      </p>
    </div>
  );
};

const localStyles: Record<string, React.CSSProperties> = {
  pageContainer: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    width: '100%',
    backgroundColor: 'transparent',
    padding: '24px',
    boxSizing: 'border-box',
  },
  errorAlert: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    backgroundColor: '#FEE2E2',
    borderRadius: '16px',
    padding: '12px 16px',
    color: '#991B1B',
    fontSize: '13.5px',
    fontWeight: '700',
    marginBottom: '20px',
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
    fontSize: '11px',
    fontWeight: '800',
    color: '#101411',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  inputField: {
    padding: '12px 20px',
    borderRadius: '9999px',
    border: '2px solid #C0D0C4',
    backgroundColor: '#FFFFFF',
    color: '#101411',
    fontWeight: '600',
    fontSize: '14px',
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box',
  },
  eyeButton: {
    position: 'absolute',
    right: '16px',
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'none',
    border: 'none',
    color: '#68776B',
    fontSize: '18px',
    cursor: 'pointer',
    padding: '4px',
    outline: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
};

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

