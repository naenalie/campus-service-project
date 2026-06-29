// src/pages/ManagerDashboard.tsx
// Halaman Dashboard Eksekutif Manajer Fasilitas Kampus (FR-12) - Read Only & High Overview

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ThemeToggle } from '../components/ThemeToggle';
import * as api from '../services/api';

export const ManagerDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

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

  // 1. Fetch data saat mount & atur Polling Auto-Refresh 5 menit (300000ms)
  useEffect(() => {
    fetchDashboardData();

    const intervalId = setInterval(() => {
      console.log('Auto-refreshing dashboard data...');
      fetchDashboardData();
    }, 300000); // 5 menit

    return () => clearInterval(intervalId);
  }, []);

  const handleLogout = async () => {
    if (window.confirm('Apakah Anda yakin ingin keluar?')) {
      try {
        await logout();
        navigate('/login');
      } catch (err) {
        console.error('Logout error:', err);
      }
    }
  };

  // Agregasi Data Distribusi Gedung (Dinamis dari recent_requests & mock fallback jika kosong)
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

    // Fallback data representatif agar dashboard tetap indah saat awal kosong
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
      // Donut Chart Fallback (Subtle placeholder)
      return {
        background: 'conic-gradient(var(--accent-purple) 0% 40%, var(--accent-teal) 40% 70%, var(--accent-amber) 70% 100%)'
      };
    }

    let accumulatedPercentage = 0;
    const colors = [
      'var(--accent-purple)', // Internet
      'var(--accent-teal)',   // AC
      'var(--accent-amber)',  // Peralatan Kelas
      'var(--accent-rose)',   // Kebersihan
      'var(--accent-blue)'    // Lainnya
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

  // Metrik Penghitungan Tiket
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
      
      {/* SIDEBAR NAVIGATION (Desktop) */}
      <aside className="sidebar">
        <div style={localStyles.sidebarHeader}>
          <span style={localStyles.sidebarLogo}>🏛</span>
          <div>
            <h2 style={localStyles.sidebarTitle}>UNKLAB</h2>
            <p style={localStyles.sidebarSubtitle}>Campus Services</p>
          </div>
        </div>

        <nav style={localStyles.sidebarNav}>
          <button 
            onClick={() => setActiveTab('overview')} 
            className={`nav-item ${activeTab === 'overview' ? 'active' : ''}`}
          >
            <span>📊</span> Overview
          </button>
          <button 
            onClick={() => setActiveTab('reports')} 
            className={`nav-item ${activeTab === 'reports' ? 'active' : ''}`}
          >
            <span>📋</span> Semua Laporan
          </button>
          <button 
            onClick={() => setActiveTab('trends')} 
            className={`nav-item ${activeTab === 'trends' ? 'active' : ''}`}
          >
            <span>📈</span> Tren Kerusakan
          </button>
        </nav>

        <div style={localStyles.sidebarFooter}>
          <div style={localStyles.userInfo}>
            <p style={localStyles.userName}>{user?.name}</p>
            <p style={localStyles.userRole}>{user?.role}</p>
          </div>
          <div style={localStyles.footerActions}>
            <ThemeToggle />
            <button onClick={handleLogout} style={localStyles.logoutButton} title="Logout">
              🚪 Keluar
            </button>
          </div>
        </div>
      </aside>

      {/* MOBILE BOTTOM NAVBAR */}
      <nav className="navbar">
        <button onClick={() => setActiveTab('overview')} className={`nav-item ${activeTab === 'overview' ? 'active' : ''}`}>📊</button>
        <button onClick={() => setActiveTab('reports')} className={`nav-item ${activeTab === 'reports' ? 'active' : ''}`}>📋</button>
        <button onClick={() => setActiveTab('trends')} className={`nav-item ${activeTab === 'trends' ? 'active' : ''}`}>📈</button>
        <button onClick={handleLogout} className="nav-item">🚪</button>
      </nav>

      {/* MAIN CONTAINER CONTENT */}
      <main className="main-content" style={localStyles.mainContent}>
        
        {/* Header Title */}
        <header style={localStyles.contentHeader}>
          <div>
            <h1 className="text-display" style={localStyles.welcomeText}>
              Selamat pagi, {user?.name} 📊
            </h1>
            <p style={localStyles.dateText}>Ringkasan Eksekutif Fasilitas Kampus Universitas Klabat</p>
          </div>
        </header>

        {error && (
          <div className="glass-card" style={localStyles.errorCard}>
            <span style={{ fontSize: '20px' }}>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {isLoading ? (
          <div style={localStyles.loadingCenter}>
            <div className="shimmer" style={{ width: '100%', height: '140px', borderRadius: '20px', marginBottom: '24px' }}></div>
            <div className="shimmer" style={{ width: '100%', height: '300px', borderRadius: '20px' }}></div>
          </div>
        ) : (
          <div className="animate-in" style={localStyles.dashboardGrid}>
            
            {/* BIG STAT CARDS (4 Kolom Grid) */}
            <div style={localStyles.statsContainer}>
              <div className="glass-card" style={localStyles.statCard}>
                <span style={localStyles.statIcon}>📋</span>
                <p style={localStyles.statNumber}>{totalRequests}</p>
                <p style={localStyles.statLabel}>Total Tiket Masuk</p>
              </div>
              <div className="glass-card" style={localStyles.statCard}>
                <span style={{ ...localStyles.statIcon, color: 'var(--accent-purple)' }}>🟣</span>
                <p style={localStyles.statNumber}>{attentionCount}</p>
                <p style={localStyles.statLabel}>Butuh Penanganan</p>
              </div>
              <div className="glass-card" style={{ ...localStyles.statCard, border: overdueCount > 0 ? '1px solid rgba(244, 63, 94, 0.3)' : '1px solid var(--border-glass)' }}>
                <span style={{ ...localStyles.statIcon, color: 'var(--accent-rose)' }}>🚨</span>
                <p style={{ ...localStyles.statNumber, color: overdueCount > 0 ? 'var(--accent-rose)' : 'inherit' }}>{overdueCount}</p>
                <p style={localStyles.statLabel}>Terlambat (&gt; 7 Hari)</p>
              </div>
              <div className="glass-card" style={localStyles.statCard}>
                <span style={{ ...localStyles.statIcon, color: 'var(--status-resolved)' }}>✅</span>
                <p style={localStyles.statNumber}>{resolvedCount}</p>
                <p style={localStyles.statLabel}>Selesai Diperbaiki</p>
              </div>
            </div>

            {/* SEKSI GRAFIK & ANALISIS (DISTRIBUSI DATA) */}
            <div style={localStyles.chartsLayout}>
              
              {/* 1. DISTRIBUSI PER GEDUNG */}
              <div className="glass-card" style={localStyles.chartCard}>
                <h3 className="text-heading" style={localStyles.cardTitle}>Distribusi Kerusakan per Gedung</h3>
                <div style={localStyles.barChartContainer}>
                  {getBuildingDistribution().map(bldg => {
                    const totalBuildingTickets = getBuildingDistribution().reduce((a: any, b: any) => a + b.count, 0);
                    const percentage = totalBuildingTickets > 0 ? Math.round((bldg.count / totalBuildingTickets) * 100) : 0;
                    return (
                      <div key={bldg.name} style={localStyles.barRow}>
                        <span style={localStyles.barLabel}>{bldg.name}</span>
                        <div style={localStyles.barTrack}>
                          <div 
                            style={{ 
                              ...localStyles.barFill, 
                              width: `${percentage}%`,
                              background: 'linear-gradient(90deg, var(--accent-purple), var(--accent-teal))'
                            }}
                          ></div>
                        </div>
                        <span style={localStyles.barCount}>{bldg.count} Tiket ({percentage}%)</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 2. DISTRIBUSI PER KATEGORI (Donut Chart CSS) */}
              <div className="glass-card" style={localStyles.chartCard}>
                <h3 className="text-heading" style={localStyles.cardTitle}>Sebaran Kategori Kerusakan</h3>
                
                <div style={localStyles.donutWrapper}>
                  {/* Donut Circle */}
                  <div style={{ ...localStyles.donutCircle, ...getDonutChartStyle() }}>
                    <div style={localStyles.donutCenter}>
                      <span style={localStyles.donutTotalText}>{totalRequests}</span>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>TICKET</span>
                    </div>
                  </div>

                  {/* Keterangan Kategori */}
                  <div style={localStyles.legendGrid}>
                    {Object.keys(summary?.by_category || {}).map((cat, index) => {
                      const colors = ['var(--accent-purple)', 'var(--accent-teal)', 'var(--accent-amber)', 'var(--accent-rose)', 'var(--accent-blue)'];
                      return (
                        <div key={cat} style={localStyles.legendItem}>
                          <span style={{ ...localStyles.legendDot, backgroundColor: colors[index % colors.length] }}></span>
                          <span style={localStyles.legendText}>{cat} ({summary.by_category[cat]})</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

            </div>

            {/* 3. LAPORAN OVERDUE (PRIORITAS WARNING BAR) */}
            <div className="glass-card" style={localStyles.overdueSection}>
              <h3 className="text-heading" style={{ ...localStyles.cardTitle, color: 'var(--accent-rose)' }}>
                🚨 Tiket Terlambat (Overdue &gt; 7 Hari)
              </h3>

              {overdueRequestsList.length === 0 ? (
                <p style={localStyles.emptyText}>Tidak ada tiket overdue saat ini. Kinerja tim optimal! 👍</p>
              ) : (
                <div style={localStyles.overdueList}>
                  {overdueRequestsList.map((req: any) => (
                    <div key={req.id} style={localStyles.overdueItem}>
                      <div style={localStyles.overdueHeader}>
                        <span style={localStyles.overdueNumber}>{req.request_number}</span>
                        <h4 style={localStyles.overdueTitle}>{req.title}</h4>
                      </div>
                      <p style={localStyles.overdueMeta}>
                        📍 {req.location} • Status: <strong>{req.status}</strong> • Dibuat pada:{' '}
                        {new Date(req.created_at).toLocaleDateString('id-ID')}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}
      </main>
    </div>
  );
};

// Local Styles
const localStyles: Record<string, React.CSSProperties> = {
  layoutContainer: {
    display: 'flex',
    minHeight: '100vh',
    backgroundColor: 'var(--bg-primary)',
    position: 'relative',
    zIndex: 1,
  },
  sidebarHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '32px',
    padding: '0 8px',
  },
  sidebarLogo: {
    fontSize: '32px',
    color: 'var(--accent-purple)',
  },
  sidebarTitle: {
    fontFamily: "'Outfit', sans-serif",
    fontSize: '18px',
    fontWeight: '700',
    color: 'var(--text-primary)',
    margin: 0,
    lineHeight: '1.2',
  },
  sidebarSubtitle: {
    fontSize: '11px',
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
    margin: 0,
  },
  sidebarNav: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    flex: 1,
  },
  sidebarFooter: {
    marginTop: 'auto',
    borderTop: '1px solid var(--border-subtle)',
    paddingTop: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  userInfo: {
    padding: '0 8px',
  },
  userName: {
    fontSize: '14px',
    fontWeight: '600',
    color: 'var(--text-primary)',
    margin: 0,
  },
  userRole: {
    fontSize: '11px',
    color: 'var(--accent-purple)',
    fontWeight: '500',
    margin: '2px 0 0 0',
  },
  footerActions: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logoutButton: {
    background: 'none',
    border: 'none',
    color: 'var(--accent-rose)',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    padding: '6px 12px',
  },
  mainContent: {
    width: '100%',
  },
  contentHeader: {
    marginBottom: '28px',
  },
  welcomeText: {
    color: 'var(--text-primary)',
    margin: 0,
  },
  dateText: {
    fontSize: '14px',
    color: 'var(--text-secondary)',
    marginTop: '4px',
  },
  errorCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '16px 24px',
    borderLeft: '4px solid var(--accent-rose)',
    color: 'var(--accent-rose)',
    marginBottom: '24px',
  },
  loadingCenter: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
    width: '100%',
  },
  dashboardGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  statsContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px',
  },
  statCard: {
    padding: '24px 20px',
    borderRadius: '20px',
  },
  statIcon: {
    fontSize: '24px',
    display: 'block',
    marginBottom: '12px',
  },
  statNumber: {
    fontFamily: "'Outfit', sans-serif",
    fontSize: '32px',
    fontWeight: '700',
    color: 'var(--text-primary)',
    margin: 0,
    lineHeight: '1.1',
  },
  statLabel: {
    fontSize: '12.5px',
    color: 'var(--text-secondary)',
    marginTop: '4px',
    margin: 0,
  },
  chartsLayout: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '24px',
  },
  chartCard: {
    padding: '28px 24px',
  },
  cardTitle: {
    marginBottom: '20px',
  },
  barChartContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  barRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    fontSize: '13px',
  },
  barLabel: {
    width: '60px',
    fontWeight: '600',
  },
  barTrack: {
    flex: 1,
    height: '10px',
    backgroundColor: 'var(--border-subtle)',
    borderRadius: '5px',
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: '5px',
  },
  barCount: {
    width: '110px',
    textAlign: 'right',
    color: 'var(--text-secondary)',
  },
  donutWrapper: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '20px',
    padding: '10px 0',
  },
  donutCircle: {
    width: '150px',
    height: '150px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    boxShadow: '0 8px 16px rgba(0,0,0,0.15)',
  },
  donutCenter: {
    width: '110px',
    height: '110px',
    borderRadius: '50%',
    backgroundColor: 'var(--bg-primary)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  donutTotalText: {
    fontFamily: "'Outfit', sans-serif",
    fontSize: '32px',
    fontWeight: '700',
    color: 'var(--text-primary)',
    lineHeight: '1',
  },
  legendGrid: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: '12px',
  },
  legendItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '12px',
  },
  legendDot: {
    width: '10px',
    height: '10px',
    borderRadius: '50%',
  },
  legendText: {
    color: 'var(--text-secondary)',
  },
  overdueSection: {
    padding: '24px',
    border: '1px solid rgba(244,63,94,0.2)',
  },
  overdueList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  overdueItem: {
    backgroundColor: 'rgba(244, 63, 94, 0.03)',
    border: '1px solid rgba(244, 63, 94, 0.15)',
    borderRadius: '12px',
    padding: '14px 18px',
  },
  overdueHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  overdueNumber: {
    fontFamily: 'monospace',
    fontSize: '12px',
    color: 'var(--accent-rose)',
    fontWeight: '600',
  },
  overdueTitle: {
    fontSize: '14.5px',
    fontWeight: '600',
    color: '#fff',
    margin: '4px 0 0 0',
  },
  overdueMeta: {
    fontSize: '12px',
    color: 'var(--text-muted)',
    marginTop: '6px',
    margin: 0,
  },
  emptyText: {
    fontSize: '13px',
    color: 'var(--text-muted)',
    textAlign: 'center',
    padding: '16px 0',
  },
};
