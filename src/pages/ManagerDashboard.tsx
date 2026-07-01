// src/pages/ManagerDashboard.tsx
// Halaman Dashboard Eksekutif Manajer Fasilitas Kampus (FR-12) - Read Only & Ringkasan Statistik

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { ThemeToggle } from '../components/ThemeToggle';
import * as api from '../services/api';

interface RequestItem {
  id: string;
  request_number: string;
  title: string;
  location: string;
  category: string;
  priority: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export const ManagerDashboard: React.FC = () => {
  const { logout } = useAuth();

  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    setError(null);
    try {
      const data = await api.listRequests();
      setRequests(data);
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
      fetchDashboardData();
    }, 300000); // Auto refresh 5 menit

    return () => clearInterval(intervalId);
  }, []);

  // 1. STAT CARDS CALCULATIONS
  const totalCount = requests.length;
  const activeCount = requests.filter(r => r.status.toUpperCase() !== 'CLOSED').length;

  const overdueRequests = requests.filter(r => {
    if (r.status.toUpperCase() !== 'IN_PROGRESS') return false;
    const created = new Date(r.created_at).getTime();
    const diffDays = (Date.now() - created) / (1000 * 60 * 60 * 24);
    return diffDays > 7;
  });
  const overdueCount = overdueRequests.length;

  const completedThisMonth = requests.filter(r => {
    const isFinished = ['RESOLVED', 'CLOSED'].includes(r.status.toUpperCase());
    if (!isFinished) return false;
    const date = new Date(r.updated_at || r.created_at);
    const now = new Date();
    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
  }).length;

  // 2. STATUS DISTRIBUTION
  const statusCounts: Record<string, number> = {
    SUBMITTED: 0,
    UNDER_REVIEW: 0,
    ASSIGNED: 0,
    IN_PROGRESS: 0,
    RESOLVED: 0,
    CLOSED: 0
  };
  requests.forEach(r => {
    const s = r.status.toUpperCase();
    if (statusCounts[s] !== undefined) {
      statusCounts[s]++;
    }
  });

  // 3. BUILDING DISTRIBUTION
  const buildingsList = ['GK1', 'GK2', 'GK3', 'GA', 'FWC', 'Chapel', 'Sport Hall', 'Lapangan Tenis', 'Kantin'];
  const buildingCounts: Record<string, number> = {};
  buildingsList.forEach(b => {
    buildingCounts[b] = 0;
  });
  buildingCounts['Lainnya'] = 0;

  requests.forEach(r => {
    const loc = r.location.toLowerCase();
    let matched = false;
    for (const b of buildingsList) {
      if (
        loc.includes(b.toLowerCase()) || 
        (b === 'Chapel' && loc.includes('pc')) || 
        (b === 'Sport Hall' && loc.includes('sh')) || 
        (b === 'Lapangan Tenis' && loc.includes('lt')) || 
        (b === 'Kantin' && loc.includes('kt'))
      ) {
        buildingCounts[b]++;
        matched = true;
        break;
      }
    }
    if (!matched) {
      buildingCounts['Lainnya']++;
    }
  });

  const sortedBuildings = Object.entries(buildingCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);

  // 4. CATEGORY DISTRIBUTION
  const categoryCounts = {
    AC: 0,
    Internet: 0,
    Peralatan: 0, // matches 'Peralatan Kelas'
    Kebersihan: 0,
    Lainnya: 0
  };
  requests.forEach(r => {
    const cat = r.category;
    if (cat === 'AC') categoryCounts.AC++;
    else if (cat === 'Internet') categoryCounts.Internet++;
    else if (cat.includes('Peralatan')) categoryCounts.Peralatan++;
    else if (cat === 'Kebersihan') categoryCounts.Kebersihan++;
    else categoryCounts.Lainnya++;
  });

  const totalCat = Object.values(categoryCounts).reduce((a, b) => a + b, 0) as number;
  
  const categoryPercentages = totalCat > 0 ? {
    AC: Math.round((categoryCounts.AC / totalCat) * 100),
    Internet: Math.round((categoryCounts.Internet / totalCat) * 100),
    Peralatan: Math.round((categoryCounts.Peralatan / totalCat) * 100),
    Kebersihan: Math.round((categoryCounts.Kebersihan / totalCat) * 100),
    Lainnya: Math.round((categoryCounts.Lainnya / totalCat) * 100),
  } : {
    AC: 35,
    Internet: 28,
    Peralatan: 20,
    Kebersihan: 12,
    Lainnya: 5
  };

  // Conic-gradient for Category Donut Chart
  const getDonutGradient = () => {
    const { AC, Internet, Peralatan, Kebersihan } = categoryPercentages;
    const stop1 = AC;
    const stop2 = stop1 + Internet;
    const stop3 = stop2 + Peralatan;
    const stop4 = stop3 + Kebersihan;

    return `conic-gradient(
      #3b82f6 0% ${stop1}%, 
      #10b981 ${stop1}% ${stop2}%, 
      #f59e0b ${stop2}% ${stop3}%, 
      #ef4444 ${stop3}% ${stop4}%, 
      #8b5cf6 ${stop4}% 100%
    )`;
  };

  // Helper for status bar widths
  const getMaxStatusCount = () => {
    const counts = Object.values(statusCounts);
    return Math.max(...counts, 1);
  };

  // Helper for building bar widths
  const getMaxBuildingCount = () => {
    const counts = sortedBuildings.map(b => b.count);
    return Math.max(...counts, 1);
  };

  const getDaysOverdue = (createdAtStr: string) => {
    const created = new Date(createdAtStr).getTime();
    const diff = Date.now() - created;
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  };

  return (
    <div style={styles.layoutWrapper}>
      {/* HEADER BAR */}
      <header style={styles.header}>
        <div>
          <h1 style={styles.mainTitle}>Dashboard Manajer Fasilitas</h1>
          <p style={styles.subtitle}>Ringkasan kondisi fasilitas kampus UNKLAB</p>
        </div>
        <div style={styles.headerRight}>
          <ThemeToggle />
          <button onClick={logout} className="nature-pill inactive" style={{ padding: '8px 16px', fontSize: '12px' }}>
            Logout
          </button>
        </div>
      </header>

      {/* DASHBOARD CONTENT */}
      <main style={styles.mainContent}>
        {isLoading ? (
          <div style={styles.loaderContainer}>
            <div className="glass-card" style={{ width: '100%', height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ color: '#56665A', fontWeight: 'bold' }}>Loading dashboard statistics...</span>
            </div>
          </div>
        ) : error ? (
          <div style={styles.errorCard}>⚠️ {error}</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            
            {/* ROW STAT CARDS (4 cards) */}
            <section style={styles.statsGrid}>
              <div className="glass-card" style={styles.statCard}>
                <span style={{ fontSize: '28px' }}>📊</span>
                <div>
                  <div style={styles.statLabel}>Total Laporan</div>
                  <div style={styles.statValue}>{totalCount}</div>
                </div>
              </div>

              <div className="glass-card" style={styles.statCard}>
                <span style={{ fontSize: '28px' }}>🔔</span>
                <div>
                  <div style={styles.statLabel}>Aktif Sekarang</div>
                  <div style={{ ...styles.statValue, color: activeCount > 0 ? '#ef4444' : '#10b981', fontWeight: 'bold', fontSize: '24px' }}>
                    {activeCount}
                  </div>
                </div>
              </div>

              <div className="glass-card" style={{ ...styles.statCard, border: overdueCount > 0 ? '1px solid rgba(239, 68, 68, 0.4)' : '1px solid rgba(255, 255, 255, 0.12)' }}>
                <span style={{ fontSize: '28px' }}>⏰</span>
                <div>
                  <div style={styles.statLabel}>Laporan Overdue</div>
                  <div style={{ ...styles.statValue, color: overdueCount > 0 ? '#ef4444' : '#cbd5e1', fontWeight: 'bold', fontSize: '24px' }}>
                    {overdueCount}
                  </div>
                </div>
              </div>

              <div className="glass-card" style={styles.statCard}>
                <span style={{ fontSize: '28px' }}>✨</span>
                <div>
                  <div style={styles.statLabel}>Selesai Bulan Ini</div>
                  <div style={styles.statValue}>{completedThisMonth}</div>
                </div>
              </div>
            </section>

            {/* OVERDUE WARNING BOX (IF ANY) */}
            {overdueCount > 0 && (
              <section style={styles.overdueSection}>
                <div style={styles.warningHeader}>
                  <span style={{ fontSize: '20px' }}>🚨</span>
                  <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 'bold', color: '#fca5a5' }}>
                    Peringatan: Terdapat Laporan Mengalami Keterlambatan Penanganan (&gt; 7 Hari)
                  </h3>
                </div>
                <div style={styles.overdueList}>
                  {overdueRequests.map((req) => (
                    <div key={req.id} style={styles.overdueItem}>
                      <span style={styles.overdueNumber}>{req.request_number}</span>
                      <span style={styles.overdueTitle}>{req.title}</span>
                      <span style={styles.overdueLocation}>📍 {req.location}</span>
                      <span style={styles.overdueBadge}>Terlambat {getDaysOverdue(req.created_at)} hari</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* CHARTS GRID CONTAINER */}
            <div style={styles.chartsGrid}>
              
              {/* DISTRIBUSI STATUS (CSS Bar Chart) */}
              <div className="glass-card" style={styles.chartCard}>
                <h3 style={styles.chartTitle}>Distribusi Berdasarkan Status</h3>
                <div style={styles.barChartContainer}>
                  {Object.entries(statusCounts).map(([status, count]) => {
                    const pct = Math.round((count / getMaxStatusCount()) * 100);
                    return (
                      <div key={status} style={styles.statusRow}>
                        <div style={styles.statusLabel}>{status.replace('_', ' ')}</div>
                        <div style={styles.progressBarWrapper}>
                          <div style={{ ...styles.progressBar, width: `${pct}%`, background: '#2563eb' }}></div>
                        </div>
                        <div style={styles.statusValueText}>{count}</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* DISTRIBUSI GEDUNG (CSS Horizontal Bar Chart) */}
              <div className="glass-card" style={styles.chartCard}>
                <h3 style={styles.chartTitle}>Distribusi Berdasarkan Lokasi Gedung</h3>
                <div style={{ ...styles.barChartContainer, maxHeight: '250px', overflowY: 'auto' }}>
                  {sortedBuildings.map((b) => {
                    const pct = Math.round((b.count / getMaxBuildingCount()) * 100);
                    return (
                      <div key={b.name} style={styles.statusRow}>
                        <div style={{ ...styles.statusLabel, width: '110px' }}>{b.name}</div>
                        <div style={styles.progressBarWrapper}>
                          <div style={{ ...styles.progressBar, width: `${pct}%`, background: '#10b981' }}></div>
                        </div>
                        <div style={styles.statusValueText}>{b.count}</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* DISTRIBUSI KATEGORI (Donut Chart & Legend) */}
              <div className="glass-card" style={{ ...styles.chartCard, gridColumn: 'span 2' }}>
                <h3 style={styles.chartTitle}>Proporsi Kategori Keluhan</h3>
                <div style={styles.donutLayout}>
                  <div style={{ ...styles.donutCircle, background: getDonutGradient() }}>
                    <div style={styles.donutCenter}>
                      <span style={{ fontSize: '11px', color: '#94a3b8' }}>Total Laporan</span>
                      <strong style={{ fontSize: '20px', color: 'white' }}>{totalCount}</strong>
                    </div>
                  </div>
                  
                  {/* Legend Grid */}
                  <div style={styles.categoryLegendGrid}>
                    <div style={styles.legendItem}>
                      <span style={{ ...styles.legendDot, background: '#3b82f6' }}></span>
                      <span style={styles.legendLabel}>AC: <strong>{categoryPercentages.AC}%</strong> ({categoryCounts.AC})</span>
                    </div>
                    <div style={styles.legendItem}>
                      <span style={{ ...styles.legendDot, background: '#10b981' }}></span>
                      <span style={styles.legendLabel}>Internet: <strong>{categoryPercentages.Internet}%</strong> ({categoryCounts.Internet})</span>
                    </div>
                    <div style={styles.legendItem}>
                      <span style={{ ...styles.legendDot, background: '#f59e0b' }}></span>
                      <span style={styles.legendLabel}>Peralatan: <strong>{categoryPercentages.Peralatan}%</strong> ({categoryCounts.Peralatan})</span>
                    </div>
                    <div style={styles.legendItem}>
                      <span style={{ ...styles.legendDot, background: '#ef4444' }}></span>
                      <span style={styles.legendLabel}>Kebersihan: <strong>{categoryPercentages.Kebersihan}%</strong> ({categoryCounts.Kebersihan})</span>
                    </div>
                    <div style={styles.legendItem}>
                      <span style={{ ...styles.legendDot, background: '#8b5cf6' }}></span>
                      <span style={styles.legendLabel}>Lainnya: <strong>{categoryPercentages.Lainnya}%</strong> ({categoryCounts.Lainnya})</span>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* FOOTER INFO */}
            <footer style={styles.footer}>
              <p style={{ margin: 0 }}>ℹ️ Data diperbarui secara otomatis setiap 5 menit.</p>
              <p style={{ margin: '4px 0 0 0' }}>Hanya untuk keperluan monitoring manajerial — hubungi Administrator untuk tindakan operasional.</p>
            </footer>

          </div>
        )}
      </main>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  layoutWrapper: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#0a090f',
    backgroundImage: 'radial-gradient(circle at top right, rgba(30,58,138,0.1), transparent)',
    color: '#cbd5e1',
    fontFamily: 'Outfit, sans-serif'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '24px 40px',
    borderBottom: '1px solid rgba(255,255,255,0.08)',
    background: 'rgba(10, 9, 15, 0.4)',
    backdropFilter: 'blur(10px)'
  },
  mainTitle: {
    margin: 0,
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#f8fafc',
    letterSpacing: '-0.5px'
  },
  subtitle: {
    margin: '4px 0 0 0',
    fontSize: '13px',
    color: '#64748b'
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px'
  },
  mainContent: {
    flex: 1,
    padding: '32px 40px',
    overflowY: 'auto'
  },
  loaderContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '200px'
  },
  errorCard: {
    background: 'rgba(239, 68, 68, 0.1)',
    border: '1px solid rgba(239, 68, 68, 0.25)',
    borderRadius: '12px',
    padding: '16px',
    color: '#f87171',
    fontWeight: '500'
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '20px'
  },
  statCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '20px 24px',
    borderRadius: '16px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
  },
  statLabel: {
    fontSize: '11px',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  statValue: {
    fontSize: '22px',
    fontWeight: 'bold',
    color: '#f8fafc',
    marginTop: '2px'
  },
  overdueSection: {
    background: 'rgba(239, 68, 68, 0.08)',
    border: '1px solid rgba(239, 68, 68, 0.25)',
    borderRadius: '16px',
    padding: '16px 20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  warningHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  overdueList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  overdueItem: {
    background: 'rgba(15, 23, 42, 0.4)',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: '8px',
    padding: '10px 16px',
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    fontSize: '12px',
    color: '#cbd5e1'
  },
  overdueNumber: {
    fontFamily: 'monospace',
    fontWeight: 'bold',
    color: '#f87171'
  },
  overdueTitle: {
    fontWeight: '600',
    flex: 1,
    marginLeft: '12px',
    minWidth: '200px'
  },
  overdueLocation: {
    color: '#94a3b8',
    marginRight: '20px'
  },
  overdueBadge: {
    background: 'rgba(239, 68, 68, 0.2)',
    color: '#f87171',
    fontWeight: 'bold',
    padding: '3px 8px',
    borderRadius: '4px',
    fontSize: '10px',
    textTransform: 'uppercase'
  },
  chartsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
    gap: '24px'
  },
  chartCard: {
    padding: '24px',
    borderRadius: '20px',
    boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  chartTitle: {
    margin: 0,
    fontSize: '15px',
    fontWeight: 'bold',
    color: '#f1f5f9',
    letterSpacing: '-0.2px'
  },
  barChartContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  statusRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  statusLabel: {
    fontSize: '11px',
    fontWeight: 'bold',
    color: '#94a3b8',
    width: '95px',
    textTransform: 'uppercase',
    letterSpacing: '0.3px',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  },
  progressBarWrapper: {
    flex: 1,
    height: '10px',
    background: 'rgba(255,255,255,0.06)',
    borderRadius: '6px',
    overflow: 'hidden'
  },
  progressBar: {
    height: '100%',
    borderRadius: '6px',
    transition: 'width 0.6s cubic-bezier(0.16, 1, 0.3, 1)'
  },
  statusValueText: {
    fontSize: '12px',
    fontWeight: 'bold',
    color: '#cbd5e1',
    width: '20px',
    textAlign: 'right'
  },
  donutLayout: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '32px',
    padding: '12px 0'
  },
  donutCircle: {
    width: '150px',
    height: '150px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
    position: 'relative'
  },
  donutCenter: {
    width: '110px',
    height: '110px',
    borderRadius: '50%',
    background: '#0f172a',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2
  },
  categoryLegendGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '12px',
    flex: 1,
    minWidth: '200px'
  },
  legendItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  legendDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%'
  },
  legendLabel: {
    fontSize: '12px',
    color: '#94a3b8'
  },
  footer: {
    borderTop: '1px solid rgba(255,255,255,0.06)',
    paddingTop: '20px',
    textAlign: 'center',
    fontSize: '11px',
    color: '#475569',
    lineHeight: 1.5
  }
};
