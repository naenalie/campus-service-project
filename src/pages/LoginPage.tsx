// src/pages/LoginPage.tsx
// Antarmuka Halaman Login (CR-02) dengan visualisasi premium dan modern

import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const LoginPage: React.FC = () => {
  const { user, login, isLoading } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Guard: Jika user sudah login, arahkan langsung ke dashboard yang tepat
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

    if (!email.trim() || !password) {
      setError('Email dan password wajib diisi.');
      return;
    }

    setIsSubmitting(true);
    try {
      await login(email.trim(), password);
      // Sesi login berhasil, useEffect di atas akan menangani redirect
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'Email atau password salah. Silakan coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <span style={styles.logoIcon}>🏛</span>
          <h1 style={styles.title}>Campus Service</h1>
          <p style={styles.subtitle}>Request and Maintenance System</p>
        </div>

        {error && (
          <div style={styles.errorAlert}>
            <span style={styles.alertIcon}>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={styles.form}>
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
            <label htmlFor="password" style={styles.label}>Password</label>
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

          <button
            type="submit"
            disabled={isSubmitting || isLoading}
            style={isSubmitting || isLoading ? { ...styles.button, ...styles.buttonDisabled } : styles.button}
          >
            {isSubmitting ? '⏳ Menghubungkan...' : 'Masuk →'}
          </button>
        </form>

        <div style={styles.footer}>
          <p style={styles.footerText}>
            Belum memiliki akun?{' '}
            <Link to="/register" style={styles.link}>
              Daftar di sini
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

// Premium CSS-in-JS Styles (curated dark-mode compatible style)
const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    backgroundColor: '#0f172a', // Slate 900
    fontFamily: "'Outfit', 'Inter', system-ui, sans-serif",
    padding: '20px',
  },
  card: {
    width: '100%',
    maxWidth: '420px',
    backgroundColor: '#1e293b', // Slate 800
    borderRadius: '16px',
    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3), 0 8px 10px -6px rgba(0, 0, 0, 0.3)',
    padding: '40px 32px',
    border: '1px solid #334155', // Slate 700
  },
  header: {
    textAlign: 'center',
    marginBottom: '32px',
  },
  logoIcon: {
    fontSize: '48px',
    display: 'block',
    marginBottom: '12px',
  },
  title: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#f8fafc', // Slate 50
    margin: '0 0 6px 0',
  },
  subtitle: {
    fontSize: '14px',
    color: '#94a3b8', // Slate 400
    margin: 0,
  },
  errorAlert: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    backgroundColor: '#451a03', // Amber/Red Dark
    border: '1px solid #78350f',
    borderRadius: '8px',
    padding: '12px 16px',
    color: '#fef3c7',
    fontSize: '14px',
    marginBottom: '24px',
  },
  alertIcon: {
    fontSize: '16px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  label: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#cbd5e1', // Slate 300
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  input: {
    backgroundColor: '#0f172a',
    border: '1px solid #475569', // Slate 600
    borderRadius: '8px',
    padding: '12px 16px',
    color: '#f8fafc',
    fontSize: '15px',
    outline: 'none',
    transition: 'border-color 0.2s',
  },
  button: {
    backgroundColor: '#3b82f6', // Blue 500
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    padding: '14px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background-color 0.2s, transform 0.1s',
    marginTop: '10px',
  },
  buttonDisabled: {
    backgroundColor: '#1e3a8a',
    color: '#93c5fd',
    cursor: 'not-allowed',
  },
  footer: {
    marginTop: '32px',
    textAlign: 'center',
  },
  footerText: {
    fontSize: '14px',
    color: '#94a3b8',
    margin: 0,
  },
  link: {
    color: '#60a5fa', // Blue 400
    textDecoration: 'none',
    fontWeight: '600',
  },
};
