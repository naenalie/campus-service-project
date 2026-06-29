// src/pages/RegisterPage.tsx
// Antarmuka Halaman Registrasi (CR-02) dengan visualisasi premium dan modern

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
  
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Validasi input di Frontend
    if (!name.trim() || !email.trim() || !password || !confirmPassword) {
      setError('Semua kolom wajib diisi.');
      return;
    }

    if (password.length < 8) {
      setError('Password minimal harus terdiri dari 8 karakter.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Konfirmasi password tidak cocok dengan password yang dimasukkan.');
      return;
    }

    setIsSubmitting(true);
    try {
      await register(name.trim(), email.trim(), password);
      setSuccess('Registrasi berhasil! Mengalihkan ke halaman login...');
      // Reset form
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
      setError(err.message || 'Registrasi gagal. Silakan coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <span style={styles.logoIcon}>📝</span>
          <h1 style={styles.title}>Daftar Akun</h1>
          <p style={styles.subtitle}>Sistem Pelaporan Layanan Kampus</p>
        </div>

        {error && (
          <div style={styles.errorAlert}>
            <span style={styles.alertIcon}>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div style={styles.successAlert}>
            <span style={styles.alertIcon}>✅</span>
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.formGroup}>
            <label htmlFor="name" style={styles.label}>Nama Lengkap</label>
            <input
              type="text"
              id="name"
              placeholder="Gwen Wenas"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isSubmitting || isLoading}
              style={styles.input}
              required
            />
          </div>

          <div style={styles.formGroup}>
            <label htmlFor="email" style={styles.label}>Email Kampus</label>
            <input
              type="email"
              id="email"
              placeholder="gwen@unklab.ac.id"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isSubmitting || isLoading}
              style={styles.input}
              required
            />
          </div>

          <div style={styles.formGroup}>
            <label htmlFor="password" style={styles.label}>Password (Min. 8 karakter)</label>
            <input
              type="password"
              id="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isSubmitting || isLoading}
              style={styles.input}
              required
            />
          </div>

          <div style={styles.formGroup}>
            <label htmlFor="confirmPassword" style={styles.label}>Konfirmasi Password</label>
            <input
              type="password"
              id="confirmPassword"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={isSubmitting || isLoading}
              style={styles.input}
              required
            />
          </div>

          <div style={styles.infoBox}>
            <span style={styles.infoIcon}>💡</span>
            <span style={styles.infoText}>
              Akun baru otomatis terdaftar dengan peran sebagai **Pelapor** (Mahasiswa/Dosen/Staf).
            </span>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || isLoading}
            style={isSubmitting || isLoading ? { ...styles.button, ...styles.buttonDisabled } : styles.button}
          >
            {isSubmitting ? '⏳ Membuat Akun...' : 'Daftar Sekarang'}
          </button>
        </form>

        <div style={styles.footer}>
          <p style={styles.footerText}>
            Sudah memiliki akun?{' '}
            <Link to="/login" style={styles.link}>
              Login di sini
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

// Premium CSS-in-JS Styles (senada dengan LoginPage)
const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    backgroundColor: '#0f172a',
    fontFamily: "'Outfit', 'Inter', system-ui, sans-serif",
    padding: '20px',
  },
  card: {
    width: '100%',
    maxWidth: '440px',
    backgroundColor: '#1e293b',
    borderRadius: '16px',
    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3), 0 8px 10px -6px rgba(0, 0, 0, 0.3)',
    padding: '40px 32px',
    border: '1px solid #334155',
  },
  header: {
    textAlign: 'center',
    marginBottom: '28px',
  },
  logoIcon: {
    fontSize: '44px',
    display: 'block',
    marginBottom: '10px',
  },
  title: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#f8fafc',
    margin: '0 0 6px 0',
  },
  subtitle: {
    fontSize: '14px',
    color: '#94a3b8',
    margin: 0,
  },
  errorAlert: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    backgroundColor: '#451a03',
    border: '1px solid #78350f',
    borderRadius: '8px',
    padding: '12px 16px',
    color: '#fef3c7',
    fontSize: '14px',
    marginBottom: '20px',
  },
  successAlert: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    backgroundColor: '#064e3b', // Emerald Dark
    border: '1px solid #065f46',
    borderRadius: '8px',
    padding: '12px 16px',
    color: '#d1fae5',
    fontSize: '14px',
    marginBottom: '20px',
  },
  alertIcon: {
    fontSize: '16px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '18px',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  label: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#cbd5e1',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  input: {
    backgroundColor: '#0f172a',
    border: '1px solid #475569',
    borderRadius: '8px',
    padding: '11px 14px',
    color: '#f8fafc',
    fontSize: '14px',
    outline: 'none',
    transition: 'border-color 0.2s',
  },
  infoBox: {
    display: 'flex',
    gap: '10px',
    backgroundColor: '#1e3a8a', // Blue Dark
    borderRadius: '8px',
    padding: '10px 14px',
    border: '1px solid #1d4ed8',
  },
  infoIcon: {
    fontSize: '16px',
  },
  infoText: {
    color: '#dbeafe',
    fontSize: '12.5px',
    lineHeight: '1.4',
  },
  button: {
    backgroundColor: '#10b981', // Emerald 500
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    padding: '14px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background-color 0.2s, transform 0.1s',
    marginTop: '6px',
  },
  buttonDisabled: {
    backgroundColor: '#065f46',
    color: '#a7f3d0',
    cursor: 'not-allowed',
  },
  footer: {
    marginTop: '28px',
    textAlign: 'center',
  },
  footerText: {
    fontSize: '14px',
    color: '#94a3b8',
    margin: 0,
  },
  link: {
    color: '#34d399', // Emerald 400
    textDecoration: 'none',
    fontWeight: '600',
  },
};
