// src/pages/CreateRequestPage.tsx
// Halaman Form Pembuatan Laporan Keluhan Baru (FR-01) - Pelapor Only

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ThemeToggle } from '../components/ThemeToggle';
import * as api from '../services/api';

const BUILDINGS = ['GK1', 'GK2', 'GK3', 'Crystal', 'Chapel', 'Hall', 'Asrama'];
const CATEGORIES = ['Internet', 'AC', 'Peralatan Kelas', 'Kebersihan', 'Lainnya'];

export const CreateRequestPage: React.FC = () => {
  const navigate = useNavigate();

  // Form States
  const [title, setTitle] = useState('');
  const [building, setBuilding] = useState('');
  const [locationDetail, setLocationDetail] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');

  // UI States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [createdRequest, setCreatedRequest] = useState<any>(null);

  // Validasi Frontend
  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!title.trim()) {
      errors.title = 'Judul laporan wajib diisi.';
    } else if (title.trim().length < 5) {
      errors.title = 'Judul laporan minimal 5 karakter.';
    }

    if (!building) {
      errors.building = 'Pilih lokasi gedung sarana.';
    }

    if (!locationDetail.trim()) {
      errors.locationDetail = 'Detail lokasi (ruangan/lantai) wajib diisi.';
    }

    if (!category) {
      errors.category = 'Pilih salah satu kategori kerusakan.';
    }

    if (!description.trim()) {
      errors.description = 'Deskripsi kerusakan wajib diisi.';
    } else if (description.trim().length < 20) {
      errors.description = 'Jelaskan kerusakan secara detail (minimal 20 karakter).';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const fullLocation = `${building}, ${locationDetail.trim()}`;
      const payload = {
        title: title.trim(),
        location: fullLocation,
        category,
        description: description.trim()
      };

      const result = await api.createRequest(payload);
      setCreatedRequest(result);
    } catch (err: any) {
      console.error('Gagal mengirim laporan:', err);
      alert(err.message || 'Terjadi kesalahan saat menyimpan laporan keluhan.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const charCount = description.length;
  const isDescValid = charCount >= 20;

  // Render Success Message View
  if (createdRequest) {
    return (
      <div style={localStyles.pageContainer}>
        <div className="glass-card-strong animate-in" style={localStyles.successCard}>
          <div style={localStyles.successIcon}>✅</div>
          <h2 style={localStyles.successTitle}>Laporan Berhasil Dibuat!</h2>
          <p style={localStyles.successSubtitle}>Laporan keluhan Anda telah masuk ke dalam sistem.</p>
          
          <div style={localStyles.successInfoBox}>
            <p style={localStyles.successLabel}>Nomor Laporan</p>
            <p style={localStyles.successNumber}>{createdRequest.request_number}</p>
          </div>

          <div style={localStyles.successActions}>
            <button 
              onClick={() => navigate(`/requests/${createdRequest.id}`)}
              className="btn-primary"
              style={{ flex: 1 }}
            >
              Lihat Laporan
            </button>
            <button 
              onClick={() => {
                setCreatedRequest(null);
                setTitle('');
                setBuilding('');
                setLocationDetail('');
                setCategory('');
                setDescription('');
                setFieldErrors({});
              }}
              className="btn-glass"
              style={{ flex: 1 }}
            >
              Buat Laporan Lain
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={localStyles.pageContainer}>
      
      {/* Top Navbar */}
      <div style={localStyles.topBar}>
        <button 
          onClick={() => navigate('/')} 
          className="btn-glass"
          style={{ gap: '6px' }}
        >
          ← Kembali
        </button>
        <ThemeToggle />
      </div>

      {/* Main Glass Form Card */}
      <div className="glass-card-strong animate-in" style={localStyles.formCard}>
        <div style={localStyles.formHeader}>
          <span style={{ fontSize: '32px' }}>📝</span>
          <h1 className="text-heading" style={{ color: '#fff', margin: '8px 0 2px 0' }}>
            Buat Laporan Baru
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
            Deskripsikan masalah kerusakan fasilitas secara rinci.
          </p>
        </div>

        <form onSubmit={handleSubmit} style={localStyles.form}>
          
          {/* Judul Laporan */}
          <div style={localStyles.formGroup}>
            <label style={localStyles.inputLabel}>Judul Laporan *</label>
            <input
              type="text"
              placeholder="Contoh: AC Ruang 301 Tidak Dingin"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isSubmitting}
              className="neu-input"
            />
            {fieldErrors.title && <span style={localStyles.errorText}>{fieldErrors.title}</span>}
          </div>

          {/* Lokasi Gedung & Detail */}
          <div style={localStyles.formGroup}>
            <label style={localStyles.inputLabel}>Lokasi Kerusakan *</label>
            <div style={localStyles.locationRow}>
              <select
                value={building}
                onChange={(e) => setBuilding(e.target.value)}
                disabled={isSubmitting}
                className="neu-input"
                style={{ flex: 1, cursor: 'pointer' }}
              >
                <option value="">Pilih Gedung...</option>
                {BUILDINGS.map(b => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
              
              <input
                type="text"
                placeholder="Detail ruangan (contoh: Lantai 3, R.301)"
                value={locationDetail}
                onChange={(e) => setLocationDetail(e.target.value)}
                disabled={isSubmitting}
                className="neu-input"
                style={{ flex: 2 }}
              />
            </div>
            {(fieldErrors.building || fieldErrors.locationDetail) && (
              <span style={localStyles.errorText}>
                {fieldErrors.building || fieldErrors.locationDetail}
              </span>
            )}
          </div>

          {/* Kategori Kerusakan (Pills Select) */}
          <div style={localStyles.formGroup}>
            <label style={localStyles.inputLabel}>Kategori *</label>
            <div style={localStyles.categoriesGrid}>
              {CATEGORIES.map(cat => {
                const isSelected = category === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    disabled={isSubmitting}
                    className={isSelected ? 'btn-primary' : 'btn-glass'}
                    style={{ 
                      flex: '1 0 100px', 
                      padding: '10px',
                      fontSize: '13px',
                      border: isSelected ? 'none' : '1px solid var(--border-glass)'
                    }}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
            {fieldErrors.category && <span style={localStyles.errorText}>{fieldErrors.category}</span>}
          </div>

          {/* Deskripsi */}
          <div style={localStyles.formGroup}>
            <div style={localStyles.descHeader}>
              <label style={localStyles.inputLabel}>Deskripsi *</label>
              <span 
                style={{ 
                  fontSize: '12px', 
                  fontWeight: '600', 
                  color: isDescValid ? 'var(--status-resolved)' : 'var(--accent-rose)' 
                }}
              >
                {charCount}/500 karakter
              </span>
            </div>
            <textarea
              placeholder="Jelaskan masalah secara detail..."
              value={description}
              onChange={(e) => setDescription(e.target.value.slice(0, 500))}
              disabled={isSubmitting}
              className="neu-input"
              style={{ minHeight: '120px', resize: 'vertical', fontFamily: 'inherit' }}
            />
            {fieldErrors.description && <span style={localStyles.errorText}>{fieldErrors.description}</span>}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary"
            style={{ width: '100%', marginTop: '12px' }}
          >
            {isSubmitting ? (
              <>
                <div style={localStyles.spinnerMini}></div>
                <span>Mengirim Laporan...</span>
              </>
            ) : (
              'Kirim Laporan →'
            )}
          </button>

        </form>
      </div>

    </div>
  );
};

// Local Styles
const localStyles: Record<string, React.CSSProperties> = {
  pageContainer: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    width: '100vw',
    position: 'relative',
    padding: '80px 20px 40px 20px',
    zIndex: 1,
  },
  topBar: {
    position: 'absolute',
    top: '24px',
    left: '24px',
    right: '24px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 10,
  },
  formCard: {
    width: '100%',
    maxWidth: '600px',
    padding: '36px 32px',
  },
  formHeader: {
    textAlign: 'center',
    marginBottom: '28px',
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
  inputLabel: {
    fontSize: '12px',
    fontWeight: '600',
    color: 'var(--text-secondary)',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
  },
  locationRow: {
    display: 'flex',
    gap: '12px',
  },
  categoriesGrid: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '10px',
  },
  descHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  errorText: {
    fontSize: '11.5px',
    color: 'var(--accent-rose)',
    fontWeight: '500',
    marginTop: '2px',
  },
  spinnerMini: {
    width: '18px',
    height: '18px',
    border: '2px solid rgba(255,255,255,0.3)',
    borderTop: '2px solid white',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
  successCard: {
    width: '100%',
    maxWidth: '500px',
    padding: '48px 36px',
    textAlign: 'center',
  },
  successIcon: {
    fontSize: '64px',
    marginBottom: '16px',
  },
  successTitle: {
    fontFamily: "'Outfit', sans-serif",
    fontSize: '24px',
    fontWeight: '700',
    color: '#fff',
    margin: 0,
  },
  successSubtitle: {
    fontSize: '13.5px',
    color: 'var(--text-secondary)',
    margin: '6px 0 24px 0',
  },
  successInfoBox: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    border: '1px solid var(--border-glass)',
    borderRadius: '16px',
    padding: '16px',
    marginBottom: '32px',
  },
  successLabel: {
    fontSize: '11px',
    fontWeight: '600',
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
    margin: 0,
  },
  successNumber: {
    fontFamily: 'monospace',
    fontSize: '18px',
    fontWeight: '700',
    color: 'var(--accent-teal)',
    marginTop: '6px',
    margin: 0,
  },
  successActions: {
    display: 'flex',
    gap: '16px',
  },
};
