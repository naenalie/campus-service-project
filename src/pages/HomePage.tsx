// src/pages/HomePage.tsx
// Halaman Utama Pelapor Premium (FR-01, FR-02, FR-10) dengan visualisasi Liquid Glass

import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ThemeToggle } from '../components/ThemeToggle';
import * as api from '../services/api';

export const HomePage: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [requests, setRequests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters State
  const [statusFilter, setStatusFilter] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');

  // Navigasi aktif di sidebar
  const [activeTab, setActiveTab] = useState('home');

  useEffect(() => {
    async function fetchRequests() {
      setIsLoading(true);
      setError(null);
      try {
        // GET /api/requests (otomatis memfilter laporan milik user login dari backend)
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
    return matchesStatus && matchesKeyword;
  });

  // Hitung Agregasi Statistik Ringkas
  const totalLaporanku = requests.length;
  const prosesCount = requests.filter(req => !['RESOLVED', 'CLOSED'].includes(req.status)).length;
  const selesaiCount = requests.filter(req => ['RESOLVED', 'CLOSED'].includes(req.status)).length;

  return (
    <div style={localStyles.layoutContainer}>
      
      {/* SIDEBAR NAVIGATION (Desktop Only) */}
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
            onClick={() => setActiveTab('home')} 
            className={`nav-item ${activeTab === 'home' ? 'active' : ''}`}
          >
            <span>🏠</span> Beranda
          </button>
          <Link to="/create" className="nav-item">
            <span>➕</span> Buat Laporan
          </Link>
          <button 
            onClick={() => setActiveTab('reports')} 
            className={`nav-item ${activeTab === 'reports' ? 'active' : ''}`}
          >
            <span>📋</span> Laporan Saya
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

      {/* MOBILE BOTTOM NAVBAR (Mobile Only) */}
      <nav className="navbar">
        <button onClick={() => setActiveTab('home')} className={`nav-item ${activeTab === 'home' ? 'active' : ''}`}>🏠</button>
        <Link to="/create" className="nav-item">➕</Link>
        <button onClick={() => setActiveTab('reports')} className={`nav-item ${activeTab === 'reports' ? 'active' : ''}`}>📋</button>
        <button onClick={handleLogout} className="nav-item">🚪</button>
      </nav>

      {/* MAIN CONTAINER CONTENT */}
      <main className="main-content" style={localStyles.mainContent}>
        
        {/* Header Section */}
        <header style={localStyles.contentHeader}>
          <div>
            <h1 className="text-display" style={localStyles.welcomeText}>
              Halo, {user?.name} 👋
            </h1>
            <p style={localStyles.dateText}>Ada keluhan mengenai fasilitas di kampus hari ini?</p>
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
            <div className="shimmer" style={{ width: '100%', height: '180px', borderRadius: '28px', marginBottom: '24px' }}></div>
            <div className="shimmer" style={{ width: '100%', height: '300px', borderRadius: '28px' }}></div>
          </div>
        ) : (
          <div className="animate-in">
            
            {/* HERO SECTION */}
            <section className="glass-card-strong animate-in" style={localStyles.heroCard}>
              <div style={localStyles.heroInfo}>
                <h2 style={localStyles.heroTitle}>Ada Masalah Fasilitas?</h2>
                <p style={localStyles.heroText}>
                  Laporkan setiap kerusakan sarana dan prasarana kampus UNKLAB di sini. Tim sarpras kami siap menindaklanjutinya dengan cepat demi kenyamanan studi Anda.
                </p>
                <Link to="/create" style={{ textDecoration: 'none' }}>
                  <button className="btn-primary" style={localStyles.heroBtn}>
                    <span>➕</span> Buat Laporan Baru
                  </button>
                </Link>
              </div>
              <div style={localStyles.heroArt}>🏛</div>
            </section>

            {/* STAT RINGKASAN (Swipeable di Mobile) */}
            <div className="swipe-container" style={localStyles.statsGrid}>
              <div className="glass-card swipe-card" style={localStyles.statCard}>
                <span style={localStyles.statIcon}>📋</span>
                <p style={localStyles.statNumber}>{totalLaporanku}</p>
                <p style={localStyles.statLabel}>Total Laporanku</p>
              </div>
              <div className="glass-card swipe-card" style={localStyles.statCard}>
                <span style={localStyles.statIcon}>⏳</span>
                <p style={localStyles.statNumber}>{prosesCount}</p>
                <p style={localStyles.statLabel}>Dalam Proses</p>
              </div>
              <div className="glass-card swipe-card" style={localStyles.statCard}>
                <span style={localStyles.statIcon}>✅</span>
                <p style={localStyles.statNumber}>{selesaiCount}</p>
                <p style={localStyles.statLabel}>Selesai Diperbaiki</p>
              </div>
            </div>

            {/* LAPORAN TERBARUKU LIST */}
            <section className="glass-card" style={localStyles.listCard}>
              <div style={localStyles.listHeader}>
                <h3 className="text-heading">Riwayat Laporanku</h3>
                <span style={localStyles.countBadge}>{filteredRequests.length} Tiket</span>
              </div>

              {/* Filter & Search Bar */}
              <div style={localStyles.filterBar}>
                <input
                  type="text"
                  placeholder="Cari laporan..."
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  className="neu-input"
                  style={{ flex: 2, minWidth: '200px' }}
                />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="neu-input"
                  style={{ flex: 1, minWidth: '140px', cursor: 'pointer' }}
                >
                  <option value="">Semua Status</option>
                  <option value="SUBMITTED">SUBMITTED</option>
                  <option value="UNDER_REVIEW">UNDER REVIEW</option>
                  <option value="ASSIGNED">ASSIGNED</option>
                  <option value="IN_PROGRESS">IN PROGRESS</option>
                  <option value="RESOLVED">RESOLVED</option>
                  <option value="CLOSED">CLOSED</option>
                </select>
              </div>

              {/* Laporan Cards */}
              <div style={localStyles.reportsContainer}>
                {filteredRequests.length === 0 ? (
                  <div style={localStyles.emptyStateContainer}>
                    <span style={{ fontSize: '48px', marginBottom: '14px' }}>📂</span>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '20px' }}>
                      Belum ada laporan keluhan yang tersimpan.
                    </p>
                    <Link to="/create" style={{ textDecoration: 'none' }}>
                      <button className="btn-glass">
                        Buat Laporan Pertamamu
                      </button>
                    </Link>
                  </div>
                ) : (
                  filteredRequests.map((req, index) => (
                    <div 
                      key={req.id} 
                      onClick={() => navigate(`/requests/${req.id}`)}
                      className="glass-card"
                      style={{ 
                        ...localStyles.reportCard, 
                        animationDelay: `${index * 0.1}s` 
                      }}
                    >
                      <div style={localStyles.reportCardHeader}>
                        <div>
                          <span style={localStyles.reportNumber}>{req.request_number}</span>
                          <h4 style={localStyles.reportTitle}>{req.title}</h4>
                        </div>
                        <span className={`status-badge status-${req.status.toLowerCase().replace('_', '-')}`}>
                          {req.status.replace('_', ' ')}
                        </span>
                      </div>

                      <div style={localStyles.reportCardBody}>
                        <p style={localStyles.reportDesc}>{req.description}</p>
                      </div>

                      <div style={localStyles.reportCardFooter}>
                        <div style={localStyles.reportMeta}>
                          <span>📍 {req.location}</span>
                          <span style={localStyles.metaDivider}>•</span>
                          <span>🔧 {req.category}</span>
                          <span style={localStyles.metaDivider}>•</span>
                          <span>🕒 {formatRelativeTime(req.created_at)}</span>
                        </div>
                        <button className="btn-glass" style={localStyles.detailBtn}>
                          Lihat Detail →
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>

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
    marginBottom: '24px',
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
  heroCard: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '36px 32px',
    borderRadius: '28px',
    marginBottom: '28px',
    background: 'linear-gradient(135deg, var(--bg-glass-strong), rgba(139, 92, 246, 0.05))',
    overflow: 'hidden',
  },
  heroInfo: {
    flex: 3,
  },
  heroTitle: {
    fontFamily: "'Outfit', sans-serif",
    fontSize: '24px',
    fontWeight: '700',
    color: 'var(--text-primary)',
    margin: 0,
  },
  heroText: {
    fontSize: '14px',
    color: 'var(--text-secondary)',
    lineHeight: '1.6',
    margin: '10px 0 24px 0',
    maxWidth: '540px',
  },
  heroBtn: {
    padding: '12px 24px',
  },
  heroArt: {
    flex: 1,
    fontSize: '100px',
    textAlign: 'right',
    opacity: 0.15,
    userSelect: 'none',
    pointerEvents: 'none',
  },
  statsGrid: {
    display: 'flex',
    gap: '16px',
    marginBottom: '28px',
    paddingBottom: '8px',
  },
  statCard: {
    flex: '1 0 160px',
    padding: '20px',
    borderRadius: '20px',
  },
  statIcon: {
    fontSize: '24px',
    display: 'block',
    marginBottom: '10px',
  },
  statNumber: {
    fontFamily: "'Outfit', sans-serif",
    fontSize: '28px',
    fontWeight: '700',
    color: 'var(--text-primary)',
    margin: 0,
  },
  statLabel: {
    fontSize: '12px',
    color: 'var(--text-secondary)',
    marginTop: '4px',
    margin: 0,
  },
  listCard: {
    padding: '28px 24px',
  },
  listHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  },
  countBadge: {
    fontSize: '11px',
    fontWeight: '600',
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    color: 'var(--accent-purple)',
    padding: '4px 10px',
    borderRadius: '12px',
  },
  filterBar: {
    display: 'flex',
    gap: '12px',
    marginBottom: '24px',
    flexWrap: 'wrap',
  },
  reportsContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  reportCard: {
    padding: '20px 24px',
    cursor: 'pointer',
    opacity: 0,
    transform: 'translateY(16px)',
    animation: 'fadeInUp 0.4s cubic-bezier(0.4, 0, 0.2, 1) forwards',
  },
  reportCardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '12px',
  },
  reportNumber: {
    fontFamily: 'monospace',
    fontSize: '11.5px',
    color: 'var(--text-muted)',
  },
  reportTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: 'var(--text-primary)',
    margin: '4px 0 0 0',
  },
  reportCardBody: {
    margin: '12px 0 16px 0',
  },
  reportDesc: {
    fontSize: '13.5px',
    color: 'var(--text-secondary)',
    lineHeight: '1.5',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
  },
  reportCardFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '12px',
  },
  reportMeta: {
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '8px',
    fontSize: '12px',
    color: 'var(--text-muted)',
  },
  metaDivider: {
    color: 'var(--border-subtle)',
  },
  detailBtn: {
    padding: '6px 12px',
    fontSize: '12px',
  },
  emptyStateContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '60px 0',
    textAlign: 'center',
  },
};
