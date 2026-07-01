// src/pages/ManagerDashboard.tsx
// Halaman Dashboard Eksekutif Manajer Fasilitas Kampus (FR-12) - Read Only & High Overview

import React, { useState, useEffect } from 'react';

import { useAuth } from '../context/AuthContext';
import * as api from '../services/api';

export const ManagerDashboard: React.FC = () => {
  const { user } = useAuth();

  // Data States
  const [summary, setSummary] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Active Tab Sidebar (Read-only menu)
  const [activeTab, setActiveTab] = useState('overview');

  const fetchDashboardData = async () => {
    setError(null);
    try {
      const data = await api.getDashboardSummary();
      setSummary(data);
    } catch (err: any) {
      console.error('Manager dashboard fetch error:', err);
      setError('Gagal memuat data ringkasan fasilitas.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    const intervalId = setInterval(() => {
      console.log('Auto-refreshing dashboard data...');
      fetchDashboardData();
    }, 300000); // 5 menit

    return () => clearInterval(intervalId);
  }, []);



  // Agregasi Data Distribusi Gedung
  const getBuildingDistribution = () => {
    const list = summary?.recent_requests || [];
    const counts: Record<string, number> = {
      'GK1': 0,
      'GK2': 0,
      'GK3': 0,
      'Crystal': 0,
      'Asrama': 0
    };

    list.forEach((req: any) => {
      const bldg = req.location.split(',')[0]?.trim();
      if (bldg && counts[bldg] !== undefined) {
        counts[bldg]++;
      }
    });

    const totalCount = Object.values(counts).reduce((a, b) => a + b, 0) as number;
    if (totalCount === 0) {
      return [
        { name: 'GK1', count: 5 },
        { name: 'GK2', count: 3 },
        { name: 'GK3', count: 2 },
        { name: 'Crystal', count: 1 },
        { name: 'Asrama', count: 2 }
      ];
    }

    return Object.keys(counts).map(key => ({
      name: key,
      count: counts[key]
    })).sort((a, b) => b.count - a.count);
  };

  // Menghitung Conic-Gradient angle untuk visual donut chart kategori
  const getDonutChartStyle = () => {
    if (!summary) return {};
    const categoryCounts = summary.by_category || {};
    const total = Object.values(categoryCounts).reduce((a: any, b: any) => a + b, 0) as number;

    if (total === 0) {
      return {
        background: 'conic-gradient(#8B5CF6 0% 40%, #10B981 40% 70%, #F59E0B 70% 100%)'
      };
    }

    let accumulatedPercentage = 0;
    const colors = [
      '#8B5CF6', // Internet
      '#10B981', // AC
      '#F59E0B', // Peralatan Kelas
      '#EF4444', // Kebersihan
      '#3B82F6'  // Lainnya
    ];

    const gradientParts = Object.keys(categoryCounts).map((key, index) => {
      const count = categoryCounts[key] || 0;
      const percentage = (count / total) * 100;
      const start = accumulatedPercentage;
      accumulatedPercentage += percentage;
      return `${colors[index % colors.length]} ${start}% ${accumulatedPercentage}%`;
    });

    return {
      background: `conic-gradient(${gradientParts.join(', ')})`
    };
  };

  const totalRequests = summary?.total_requests || 0;
  const attentionCount = summary ? (summary.by_status?.SUBMITTED || 0) + (summary.by_status?.UNDER_REVIEW || 0) : 0;
  const overdueCount = summary?.overdue_count || 0;
  const resolvedCount = summary ? (summary.by_status?.RESOLVED || 0) + (summary.by_status?.CLOSED || 0) : 0;

  // Laporan Overdue (> 7 hari)
  const overdueRequestsList = summary?.recent_requests?.filter((req: any) => {
    if (req.status !== 'IN_PROGRESS') return false;
    const createdDate = new Date(req.created_at).getTime();
    const limitDate = Date.now() - 7 * 24 * 60 * 60 * 1000;
    return createdDate < limitDate;
  }) || [];

  return (
    <div style={localStyles.layoutContainer}>
      
      {/* MAIN CONTAINER CONTENT */}
      <main style={localStyles.mainContent}>
        
        {/* Horizontal Navigation Tab Bar */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
          <button 
            onClick={() => setActiveTab('overview')} 
            className={`nature-pill ${activeTab === 'overview' ? 'active' : 'inactive'}`}
            style={{ padding: '8px 16px', fontSize: '13px' }}
          >
            📊 Overview
          </button>
          <button 
            onClick={() => setActiveTab('reports')} 
            className={`nature-pill ${activeTab === 'reports' ? 'active' : 'inactive'}`}
            style={{ padding: '8px 16px', fontSize: '13px' }}
          >
            📋 Semua Laporan
          </button>
        </div>
        
        {/* Header Title */}
        <header style={{ marginBottom: '28px' }}>
          <div>
            <h1 className="nature-huge-header" style={{ fontSize: '32px', margin: 0 }}>
              Selamat Pagi, {user?.name} 📊
            </h1>
            <p style={{ fontSize: '14px', color: '#68776B', marginTop: '4px', margin: 0 }}>
              Ringkasan Eksekutif Fasilitas Kampus Universitas Klabat
            </p>
          </div>
        </header>

        {error && (
          <div style={{ padding: '16px 24px', backgroundColor: '#FEE2E2', color: '#991B1B', borderRadius: '24px', fontWeight: '700', marginBottom: '24px' }}>
            ⚠️ {error}
          </div>
        )}

        {isLoading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ background: '#D2DDD4', height: '140px', borderRadius: '40px' }}></div>
            <div style={{ background: '#D2DDD4', height: '300px', borderRadius: '40px' }}></div>
          </div>
        ) : (
          <div className="animate-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* BIG STAT CARDS (4 Kolom Grid) */}
            <div style={localStyles.statsContainer}>
              <div className="glass-card" style={{ padding: '24px 20px', borderRadius: '32px' }}>
                <span style={{ fontSize: '24px', display: 'block', marginBottom: '12px' }}>📋</span>
                <p style={{ fontSize: '36px', fontWeight: '800', color: '#101411', margin: 0 }}>{totalRequests}</p>
                <p style={{ fontSize: '12px', color: '#68776B', margin: 0 }}>Total Tiket Masuk</p>
              </div>
              <div className="glass-card" style={{ padding: '24px 20px', borderRadius: '32px' }}>
                <span style={{ fontSize: '24px', display: 'block', marginBottom: '12px' }}>🟣</span>
                <p style={{ fontSize: '36px', fontWeight: '800', color: '#8B5CF6', margin: 0 }}>{attentionCount}</p>
                <p style={{ fontSize: '12px', color: '#68776B', margin: 0 }}>Butuh Penanganan</p>
              </div>
              <div className="glass-card" style={{ padding: '24px 20px', borderRadius: '32px', border: overdueCount > 0 ? '2px solid #EF4444' : 'none' }}>
                <span style={{ fontSize: '24px', display: 'block', marginBottom: '12px' }}>🚨</span>
                <p style={{ fontSize: '36px', fontWeight: '800', color: overdueCount > 0 ? '#EF4444' : '#101411', margin: 0 }}>{overdueCount}</p>
                <p style={{ fontSize: '12px', color: '#68776B', margin: 0 }}>Terlambat (&gt; 7 Hari)</p>
              </div>
              <div className="glass-card" style={{ padding: '24px 20px', borderRadius: '32px' }}>
                <span style={{ fontSize: '24px', display: 'block', marginBottom: '12px' }}>✅</span>
                <p style={{ fontSize: '36px', fontWeight: '800', color: '#10B981', margin: 0 }}>{resolvedCount}</p>
                <p style={{ fontSize: '12px', color: '#68776B', margin: 0 }}>Selesai Diperbaiki</p>
              </div>
            </div>

            {activeTab === 'overview' && (
              <>
                {/* SEKSI GRAFIK & ANALISIS (DISTRIBUSI DATA) */}
                <div style={localStyles.chartsLayout}>
                  
                  {/* 1. DISTRIBUSI PER GEDUNG */}
                  <div className="nature-main-card">
                    <span className="nature-micro-label" style={{ marginBottom: '16px', display: 'block' }}>DISTRIBUSI KERUSAKAN PER GEDUNG</span>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      {getBuildingDistribution().map(bldg => {
                        const totalBuildingTickets = getBuildingDistribution().reduce((a: any, b: any) => a + b.count, 0);
                        const percentage = totalBuildingTickets > 0 ? Math.round((bldg.count / totalBuildingTickets) * 100) : 0;
                        return (
                          <div key={bldg.name} style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '13px' }}>
                            <span style={{ width: '60px', fontWeight: '800' }}>{bldg.name}</span>
                            <div style={{ flex: 1, height: '10px', backgroundColor: '#E0E8E1', borderRadius: '5px', overflow: 'hidden' }}>
                              <div 
                                style={{ 
                                  height: '100%', 
                                  width: `${percentage}%`,
                                  backgroundColor: '#101411',
                                  borderRadius: '5px'
                                }}
                              ></div>
                            </div>
                            <span style={{ width: '110px', textAlign: 'right', color: '#56665A', fontWeight: '700' }}>{bldg.count} Tiket ({percentage}%)</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* 2. DISTRIBUSI PER KATEGORI */}
                  <div className="nature-main-card">
                    <span className="nature-micro-label" style={{ marginBottom: '16px', display: 'block' }}>SEBARAN KATEGORI KERUSAKAN</span>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
                      {/* Donut Circle */}
                      <div style={{ ...localStyles.donutCircle, ...getDonutChartStyle() }}>
                        <div style={localStyles.donutCenter}>
                          <span style={{ fontFamily: 'Outfit, sans-serif', fontSize: '32px', fontWeight: '800', color: '#101411', lineHeight: '1' }}>{totalRequests}</span>
                          <span style={{ fontSize: '11px', color: '#8E9A90', fontWeight: '800' }}>TICKET</span>
                        </div>
                      </div>

                      {/* Keterangan Kategori */}
                      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '12px' }}>
                        {Object.keys(summary?.by_category || {}).map((cat, index) => {
                          const colors = ['#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#3B82F6'];
                          return (
                            <div key={cat} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: '700' }}>
                              <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: colors[index % colors.length] }}></span>
                              <span style={{ color: '#56665A' }}>{cat} ({summary.by_category[cat]})</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                </div>

                {/* 3. LAPORAN OVERDUE */}
                <div className="nature-main-card" style={{ border: overdueRequestsList.length > 0 ? '2px solid #EF4444' : 'none' }}>
                  <span className="nature-micro-label" style={{ color: overdueRequestsList.length > 0 ? '#EF4444' : '#68776B', marginBottom: '16px', display: 'block' }}>
                    🚨 TIKET TERLAMBAT (OVERDUE &gt; 7 HARI)
                  </span>

                  {overdueRequestsList.length === 0 ? (
                    <p style={{ fontSize: '13px', color: '#8E9A90', textAlign: 'center', padding: '16px 0', margin: 0 }}>Tidak ada tiket overdue saat ini. Kinerja tim optimal! 👍</p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {overdueRequestsList.map((req: any) => (
                        <div key={req.id} style={{ backgroundColor: '#FFF5F5', border: '1px solid #FED7D7', borderRadius: '24px', padding: '16px 20px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontFamily: 'monospace', fontSize: '12px', color: '#EF4444', fontWeight: '800' }}>{req.request_number}</span>
                            <h4 style={{ fontSize: '15px', fontWeight: '800', color: '#101411', margin: 0 }}>{req.title}</h4>
                          </div>
                          <p style={{ fontSize: '12.5px', color: '#56665A', marginTop: '6px', margin: 0 }}>
                            📍 {req.location} • Status: <strong>{req.status}</strong> • Dibuat pada:{' '}
                            {new Date(req.created_at).toLocaleDateString('id-ID')}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}

            {/* TAMPILAN SEMUA LAPORAN (READ-ONLY OVERVIEW UNTUK MANAJER) */}
            {activeTab === 'reports' && (
              <div className="nature-main-card">
                <div style={{ marginBottom: '20px' }}>
                  <span className="nature-micro-label">SEMUA LAPORAN MASUK</span>
                  <h3 style={{ fontSize: '24px', fontWeight: '800', margin: '4px 0 0 0' }}>Daftar Kerusakan Kampus</h3>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {(summary?.recent_requests || []).map((req: any) => (
                    <div key={req.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #E0E8E1', paddingBottom: '16px' }}>
                      <div>
                        <span style={{ fontFamily: 'monospace', fontSize: '12px', color: '#8E9A90', fontWeight: '700' }}>{req.request_number}</span>
                        <h4 style={{ fontSize: '15px', fontWeight: '800', color: '#101411', margin: '2px 0 0 0' }}>{req.title}</h4>
                        <p style={{ fontSize: '12px', color: '#68776B', margin: '4px 0 0 0' }}>
                          📍 {req.location} • Kategori: <strong>{req.category}</strong>
                        </p>
                      </div>
                      <div>
                        <span style={{ backgroundColor: '#101411', color: '#D4E875', fontSize: '11px', fontWeight: '800', padding: '6px 12px', borderRadius: '9999px', textTransform: 'uppercase' }}>
                          {req.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        )}
      </main>
    </div>
  );
};

const localStyles: Record<string, React.CSSProperties> = {
  layoutContainer: {
    display: 'flex',
    minHeight: '100vh',
    width: '100%',
  },
  sidebar: {
    width: '280px',
    backgroundColor: 'rgba(16, 20, 17, 0.65)',
    backdropFilter: 'blur(32px) saturate(140%)',
    borderRight: '1px solid rgba(255, 255, 255, 0.15)',
    padding: '32px 24px',
    display: 'flex',
    flexDirection: 'column',
    boxSizing: 'border-box',
  },
  sidebarHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '36px',
  },
  mainContent: {
    flex: 1,
    padding: '40px',
    boxSizing: 'border-box',
    overflowY: 'auto',
  },
  statsContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px',
  },
  chartsLayout: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '24px',
  },
  donutCircle: {
    width: '150px',
    height: '150px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  donutCenter: {
    width: '110px',
    height: '110px',
    borderRadius: '50%',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    backdropFilter: 'blur(10px)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
};

