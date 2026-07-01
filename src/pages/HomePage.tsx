// src/pages/HomePage.tsx
// Halaman Utama Pelapor Premium dengan visualisasi flat solid Nature Power (Pages 1-3)

import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import * as api from '../services/api';
import { CampusMap } from '../components/CampusMap';

export const HomePage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [requests, setRequests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters State
  const [statusFilter, setStatusFilter] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedBuilding, setSelectedBuilding] = useState<string | null>(null);

  useEffect(() => {
    async function fetchRequests() {
      setIsLoading(true);
      setError(null);
      try {
        const data = await api.listRequests();
        setRequests(data);
      } catch (err: any) {
        console.error('Gagal memuat keluhan pelapor:', err);
        setError('Gagal memuat riwayat laporan Anda dari server.');
      } finally {
        setIsLoading(false);
      }
    }
    fetchRequests();
  }, []);

  // Format Tanggal Relatif
  const formatRelativeTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (60 * 1000));
    const diffHours = Math.floor(diffMs / (60 * 60 * 1000));
    const diffDays = Math.floor(diffMs / (24 * 60 * 60 * 1000));

    if (diffMins < 1) return 'Baru saja';
    if (diffMins < 60) return `${diffMins} menit lalu`;
    if (diffHours < 24) return `${diffHours} jam lalu`;
    if (diffDays === 1) return 'Kemarin';
    return date.toLocaleDateString('id-ID', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Filter & Search Logic di Client
  const filteredRequests = requests.filter(req => {
    const matchesStatus = statusFilter ? req.status === statusFilter : true;
    const matchesKeyword = searchKeyword
      ? req.title.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        req.request_number.toLowerCase().includes(searchKeyword.toLowerCase())
      : true;
    const matchesBuilding = selectedBuilding
      ? req.location.toLowerCase().includes(selectedBuilding.toLowerCase())
      : true;
    return matchesStatus && matchesKeyword && matchesBuilding;
  });

  // Agregasi Statistik Ringkas
  const totalLaporanku = requests.length;
  const prosesCount = requests.filter(req => !['RESOLVED', 'CLOSED'].includes(req.status)).length;
  const selesaiCount = requests.filter(req => ['RESOLVED', 'CLOSED'].includes(req.status)).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      {/* 1. HEADER WELCOME SECTION */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <span className="nature-micro-label">LAYANAN SARPRAS UNIVERSITAS</span>
          <h1 className="nature-huge-header">Halo, {user?.name} 👋</h1>
          <p style={{ fontSize: '15px', color: '#68776B', marginTop: '8px', margin: 0 }}>
            Pantau laporan fasilitas kampus dan laporkan masalah baru dengan cepat.
          </p>
        </div>
      </header>

      {error && (
        <div style={{ backgroundColor: '#FEE2E2', color: '#991B1B', padding: '16px 24px', borderRadius: '24px', fontWeight: '700', display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span>⚠️</span> {error}
        </div>
      )}

      {isLoading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={{ background: '#D2DDD4', height: '360px', borderRadius: '40px', width: '100%' }}></div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          
          {/* GRID LAYOUT (BENTO BOX GRID SIMULATED IN CSS GRID) */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '24px' }}>
            
            {/* WIDGET 1: NATURE HERO IMAGE CARD (Span 8) */}
            {/* WIDGET 1: NATURE HERO IMAGE CARD (Span 8) */}
            <div className="nature-grid-8-col">
              <div 
                className="nature-image-card" 
                style={{ 
                  backgroundImage: 'url("/campus_maintenance_banner.png")' 
                }}
              >
                <div className="nature-image-card-overlay" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.2) 100%)' }}></div>
                <div className="nature-image-card-content">
                  <span className="nature-micro-label" style={{ color: '#D4E875', textShadow: '0 1px 4px rgba(0, 0, 0, 0.8)' }}>LAYANAN SARPRAS</span>
                  <h2 style={{ fontSize: '28px', fontWeight: '800', margin: '4px 0 12px 0', letterSpacing: '-0.02em', color: '#FFFFFF', lineHeight: 1.2, textShadow: '0 2px 8px rgba(0, 0, 0, 0.9)' }}>
                    Sistem Pemeliharaan Kampus UNKLAB
                  </h2>
                  <p style={{ fontSize: '14px', color: '#FFFFFF', marginBottom: '24px', fontWeight: '500', textShadow: '0 1px 6px rgba(0, 0, 0, 0.85)', lineHeight: '1.4' }}>
                    Jaga kualitas fasilitas belajar mengajar. Laporkan segera setiap kerusakan sarana dan prasarana di lingkungan Universitas Klabat untuk penanganan cepat.
                  </p>
                  <Link to="/create" style={{ textDecoration: 'none' }}>
                    <button className="nature-pill active">
                      <span>➕</span> Buat Laporan Baru <span className="pill-dot"></span>
                    </button>
                  </Link>
                </div>
              </div>
            </div>

            {/* WIDGET 2: STATS SUMMARY WIDGET (Span 4) */}
            <div className="nature-grid-4-col">
              <div className="nature-main-card" style={{ height: '400px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxSizing: 'border-box' }}>
                <div>
                  <span className="nature-micro-label">STATUS TIKET</span>
                  <h3 style={{ fontSize: '24px', fontWeight: '800', margin: '4px 0 24px 0', letterSpacing: '-0.02em' }}>Ringkasan Laporan</h3>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#F3F7F4', padding: '16px 20px', borderRadius: '24px' }}>
                    <span style={{ fontSize: '14px', fontWeight: '700', color: '#56665A' }}>📋 Total Tiket</span>
                    <strong style={{ fontSize: '20px', fontWeight: '800' }}>{totalLaporanku}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#FEF3C7', padding: '16px 20px', borderRadius: '24px' }}>
                    <span style={{ fontSize: '14px', fontWeight: '700', color: '#B45309' }}>⏳ Dalam Proses</span>
                    <strong style={{ fontSize: '20px', fontWeight: '800', color: '#B45309' }}>{prosesCount}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#D1FAE5', padding: '16px 20px', borderRadius: '24px' }}>
                    <span style={{ fontSize: '14px', fontWeight: '700', color: '#047857' }}>✅ Selesai Diperbaiki</span>
                    <strong style={{ fontSize: '20px', fontWeight: '800', color: '#047857' }}>{selesaiCount}</strong>
                  </div>
                </div>

                <div style={{ fontSize: '12px', color: '#8E9A90', textAlign: 'center', marginTop: '16px' }}>
                  Pembaruan data otomatis D1 Database
                </div>
              </div>
            </div>

          </div>

          {/* 2. CAMPUS MAP VISUALIZATION */}
          <div style={{ marginBottom: '12px' }}>
            <CampusMap 
              requests={requests}
              selectedBuilding={selectedBuilding}
              onSelectBuilding={setSelectedBuilding}
            />
          </div>

          {/* 3. REPORT LISTING SECTION */}
          <div className="nature-main-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <span className="nature-micro-label">RIWAYAT AKTIVITAS</span>
                <h3 style={{ fontSize: '24px', fontWeight: '800', margin: '4px 0 0 0', letterSpacing: '-0.02em' }}>
                  Laporan Saya ({filteredRequests.length})
                </h3>
              </div>
              
              <input
                type="text"
                placeholder="Cari kata kunci laporan..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                style={{
                  padding: '12px 24px',
                  borderRadius: '9999px',
                  border: '2px solid #C0D0C4',
                  backgroundColor: '#FFFFFF',
                  color: '#101411',
                  fontWeight: '600',
                  fontSize: '14px',
                  outline: 'none',
                  width: '100%',
                  maxWidth: '300px',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            {/* Filter Pills */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '32px' }}>
              {[
                { val: '', label: 'Semua Status' },
                { val: 'SUBMITTED', label: 'SUBMITTED' },
                { val: 'UNDER_REVIEW', label: 'UNDER REVIEW' },
                { val: 'ASSIGNED', label: 'ASSIGNED' },
                { val: 'IN_PROGRESS', label: 'IN PROGRESS' },
                { val: 'RESOLVED', label: 'RESOLVED' },
                { val: 'CLOSED', label: 'CLOSED' }
              ].map(item => {
                const active = statusFilter === item.val;
                return (
                  <button
                    key={item.label}
                    onClick={() => setStatusFilter(item.val)}
                    className={`nature-pill ${active ? 'active' : 'inactive'}`}
                  >
                    {active && <span className="pill-dot"></span>}
                    {item.label}
                  </button>
                );
              })}
            </div>

            {/* Laporan Card Items */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {filteredRequests.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '48px 0', backgroundColor: '#F3F7F4', borderRadius: '32px' }}>
                  <span style={{ fontSize: '48px' }}>📂</span>
                  <p style={{ color: '#68776B', fontWeight: '700', margin: '16px 0 24px 0' }}>
                    Belum ada laporan keluhan yang sesuai filter Anda.
                  </p>
                  <Link to="/create" style={{ textDecoration: 'none' }}>
                    <button className="nature-pill active">
                      Buat Laporan Pertama <span className="pill-dot"></span>
                    </button>
                  </Link>
                </div>
              ) : (
                filteredRequests.map(req => (
                  <div 
                    key={req.id} 
                    onClick={() => navigate(`/requests/${req.id}`)}
                    style={{ 
                      cursor: 'pointer',
                      backgroundColor: '#F3F7F4',
                      borderRadius: '24px',
                      padding: '24px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '16px',
                      transition: 'transform 0.2s ease',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'none'}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                      <div>
                        <span style={{ fontFamily: 'monospace', fontSize: '12px', fontWeight: '700', color: '#8E9A90' }}>
                          {req.request_number}
                        </span>
                        <h4 style={{ fontSize: '18px', fontWeight: '800', color: '#101411', margin: '4px 0 0 0' }}>
                          {req.title}
                        </h4>
                      </div>
                      
                      {/* Active Status pill display */}
                      <span 
                        style={{ 
                          backgroundColor: '#101411', 
                          color: '#D4E875', 
                          fontSize: '11px', 
                          fontWeight: '800', 
                          padding: '8px 16px', 
                          borderRadius: '9999px',
                          textTransform: 'uppercase'
                        }}
                      >
                        {req.status.replace('_', ' ')}
                      </span>
                    </div>

                    <p style={{ fontSize: '14px', color: '#56665A', lineHeight: '1.6', margin: 0 }}>
                      {req.description}
                    </p>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', borderTop: '1px solid #E0E8E1', paddingTop: '16px' }}>
                      <div style={{ display: 'flex', gap: '16px', fontSize: '12px', fontWeight: '700', color: '#68776B', flexWrap: 'wrap' }}>
                        <span>📍 {req.location}</span>
                        <span>•</span>
                        <span>🔧 {req.category}</span>
                        <span>•</span>
                        <span>🕒 {formatRelativeTime(req.created_at)}</span>
                      </div>
                      
                      <button 
                        className="nature-pill active" 
                        style={{ padding: '8px 16px', fontSize: '12px' }}
                      >
                        Detail →
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

          </div>

        </div>
      )}

    </div>
  );
};

