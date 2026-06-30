// src/pages/RegisterPage.tsx
// Halaman Registrasi Premium berbasis flat solid Nature Power design (Pages 1-3)

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

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
      setName('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');

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
      
      <div 
        className={`nature-main-card ${shakeError ? 'error-shake' : ''}`}
        style={{
          width: '100%',
          maxWidth: '480px',
          padding: '40px',
          backgroundColor: '#FFFFFF',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>📝</div>
          <span className="nature-micro-label">REGISTRASI PENGGUNA</span>
          <h1 className="nature-huge-header" style={{ fontSize: '32px' }}>Daftar Akun</h1>
          <p style={{ fontSize: '13px', color: '#68776B', marginTop: '6px' }}>
            Bergabunglah dengan Layanan Kampus UNKLAB
          </p>
        </div>

        {error && (
          <div style={localStyles.errorAlert}>
            <span>⚠️</span> {error}
          </div>
        )}

        {success && (
          <div style={localStyles.successAlert}>
            <span>✅</span> {success}
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
              style={localStyles.inputField}
              required
            />
          </div>

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

          <div style={localStyles.formGroup}>
            <label htmlFor="confirmPassword" style={localStyles.inputLabel}>Konfirmasi Password</label>
            <input
              type={showPassword ? 'text' : 'password'}
              id="confirmPassword"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={isSubmitting || isLoading}
              style={localStyles.inputField}
              required
            />
          </div>

          <div style={localStyles.infoBox}>
            <span style={{ fontSize: '16px' }}>💡</span>
            <span style={{ fontSize: '12px', color: '#56665A', fontWeight: '600' }}>
              Akun baru otomatis terdaftar sebagai peran **Pelapor** (Mahasiswa / Staf Kampus).
            </span>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || isLoading}
            className="nature-pill active"
            style={{ width: '100%', display: 'flex', justifyContent: 'center', padding: '14px', marginTop: '12px' }}
          >
            {isSubmitting ? 'Membuat Akun...' : 'Daftar Sekarang'}
          </button>
        </form>

        <div style={{ marginTop: '24px', textAlign: 'center', borderTop: '1px solid #E0E8E1', paddingTop: '20px' }}>
          <p style={{ fontSize: '13px', color: '#68776B', marginBottom: '12px' }}>Sudah memiliki akun?</p>
          <Link to="/login" style={{ textDecoration: 'none' }}>
            <button className="nature-pill inactive" style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
              Login di sini
            </button>
          </Link>
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
    marginBottom: '16px',
  },
  successAlert: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    backgroundColor: '#D1FAE5',
    borderRadius: '16px',
    padding: '12px 16px',
    color: '#047857',
    fontSize: '13.5px',
    fontWeight: '700',
    marginBottom: '16px',
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
  infoBox: {
    display: 'flex',
    gap: '10px',
    backgroundColor: '#E0E8E1',
    borderRadius: '16px',
    padding: '12px 16px',
    alignItems: 'center',
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

