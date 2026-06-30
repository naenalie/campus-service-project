// src/pages/CreateRequestPage.tsx
// Halaman Form Pembuatan Laporan Keluhan Baru (FR-01) - Pelapor Only

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
        <div className="nature-main-card" style={localStyles.successCard}>
          <div style={{ fontSize: '64px', marginBottom: '16px' }}>✅</div>
          <h2 style={{ fontSize: '28px', fontWeight: '800', margin: 0 }}>Laporan Berhasil Dibuat!</h2>
          <p style={{ fontSize: '14px', color: '#68776B', margin: '8px 0 24px 0' }}>Laporan keluhan Anda telah masuk ke dalam sistem.</p>
          
          <div style={{ backgroundColor: '#F3F7F4', borderRadius: '24px', padding: '20px', marginBottom: '32px' }}>
            <p style={{ fontSize: '11px', fontWeight: '800', color: '#68776B', textTransform: 'uppercase', margin: 0 }}>Nomor Laporan</p>
            <p style={{ fontFamily: 'monospace', fontSize: '20px', fontWeight: '800', color: '#101411', marginTop: '6px', margin: 0 }}>{createdRequest.request_number}</p>
          </div>

          <div style={{ display: 'flex', gap: '16px' }}>
            <button 
              onClick={() => navigate(`/requests/${createdRequest.id}`)}
              className="nature-pill active"
              style={{ flex: 1, justifyContent: 'center' }}
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
              className="nature-pill inactive"
              style={{ flex: 1, justifyContent: 'center' }}
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
      <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', maxWidth: '640px', marginBottom: '24px' }}>
        <button 
          onClick={() => navigate('/')} 
          className="nature-pill inactive"
        >
          ← Kembali
        </button>
      </div>

      {/* Main Glass Form Card */}
      <div className="nature-main-card" style={localStyles.formCard}>
        <div style={{ marginBottom: '28px' }}>
          <span className="nature-micro-label">FORMULIR KELUHAN</span>
          <h1 className="nature-huge-header" style={{ fontSize: '32px', margin: '4px 0 0 0' }}>
            Buat Laporan Baru
          </h1>
          <p style={{ color: '#68776B', fontSize: '14px', marginTop: '4px', margin: 0 }}>
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
              style={localStyles.inputField}
            />
            {fieldErrors.title && <span style={localStyles.errorText}>{fieldErrors.title}</span>}
          </div>

          {/* Lokasi Gedung & Detail */}
          <div style={localStyles.formGroup}>
            <label style={localStyles.inputLabel}>Lokasi Kerusakan *</label>
            <div style={{ display: 'flex', gap: '12px' }}>
              <select
                value={building}
                onChange={(e) => setBuilding(e.target.value)}
                disabled={isSubmitting}
                style={{ ...localStyles.inputField, flex: 1, cursor: 'pointer' }}
              >
                <option value="">Pilih Gedung...</option>
                {BUILDINGS.map(b => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
              
              <input
                type="text"
                placeholder="Detail ruangan (contoh: R.301)"
                value={locationDetail}
                onChange={(e) => setLocationDetail(e.target.value)}
                disabled={isSubmitting}
                style={{ ...localStyles.inputField, flex: 2 }}
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
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '6px' }}>
              {CATEGORIES.map(cat => {
                const active = category === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    disabled={isSubmitting}
                    className={`nature-pill ${active ? 'active' : 'inactive'}`}
                    style={{ padding: '8px 16px', fontSize: '13px' }}
                  >
                    {active && <span className="pill-dot"></span>}
                    {cat}
                  </button>
                );
              })}
            </div>
            {fieldErrors.category && <span style={localStyles.errorText}>{fieldErrors.category}</span>}
          </div>

          {/* Deskripsi */}
          <div style={localStyles.formGroup}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label style={localStyles.inputLabel}>Deskripsi *</label>
              <span 
                style={{ 
                  fontSize: '12px', 
                  fontWeight: '700', 
                  color: isDescValid ? '#047857' : '#991B1B' 
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
              style={{ ...localStyles.inputField, borderRadius: '24px', minHeight: '120px', resize: 'vertical', fontFamily: 'inherit' }}
            />
            {fieldErrors.description && <span style={localStyles.errorText}>{fieldErrors.description}</span>}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="nature-pill active"
            style={{ width: '100%', justifyContent: 'center', padding: '14px', marginTop: '12px' }}
          >
            {isSubmitting ? 'Mengirim Laporan...' : 'Kirim Laporan →'}
          </button>

        </form>
      </div>

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
  formCard: {
    width: '100%',
    maxWidth: '640px',
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
    boxSizing: 'border-box',
  },
  errorText: {
    fontSize: '12px',
    color: '#991B1B',
    fontWeight: '700',
    marginTop: '2px',
  },
  successCard: {
    width: '100%',
    maxWidth: '500px',
    backgroundColor: '#FFFFFF',
  },
};

