// src/pages/AdminDashboard.tsx
// Halaman Dashboard Administrator Premium (FR-03, FR-04, FR-08, FR-10, FR-12)

import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ThemeToggle } from '../components/ThemeToggle';
import * as api from '../services/api';

export const AdminDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [summary, setSummary] = useState<any>(null);
  const [requests, setRequests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters State
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');

  // Navigasi aktif di sidebar
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      setError(null);
      try {
        // Fetch summary metrics & requests list
        const [summaryData, requestsData] = await Promise.all([
          api.getDashboardSummary(),
          api.listRequests()
        ]);
        setSummary(summaryData);
        setRequests(requestsData);
      } catch (err: any) {
        console.error('Gagal mengambil data dashboard:', err);
        setError('Gagal memuat data dari server. Hubungi dukungan IT.');
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  const handleLogout = async () => {
    if (window.confirm('Apakah Anda yakin ingin keluar dari sistem?')) {
      try {
        await logout();
        navigate('/login');
      } catch (err) {
        console.error('Logout error:', err);
      }
    }
  };

  // Filter & Search Logic di Client
  const filteredRequests = requests.filter(req => {
    const matchesStatus = statusFilter ? req.status === statusFilter : true;
    const matchesCategory = categoryFilter ? req.category === categoryFilter : true;
    const matchesKeyword = searchKeyword
      ? req.title.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        req.request_number.toLowerCase().includes(searchKeyword.toLowerCase())
      : true;
    return matchesStatus && matchesCategory && matchesKeyword;
  });

  // Urutan Status & Data Stat Cards
  const statsConfig = [
    { key: 'SUBMITTED', label: 'Baru', color: 'var(--status-submitted)', icon: '🟣' },
    { key: 'UNDER_REVIEW', label: 'Ditinjau', color: 'var(--status-review)', icon: '🔵' },
    { key: 'ASSIGNED', label: 'Dialokasikan', color: 'var(--status-assigned)', icon: '🟢' },
    { key: 'IN_PROGRESS', label: 'Perbaikan', color: 'var(--status-progress)', icon: '🟡' },
    { key: 'RESOLVED', label: 'Selesai', color: 'var(--status-resolved)', icon: '🟢' }
  ];

  // Visual Bar Chart Logic
  const categoryCounts = summary?.by_category || {};
  const totalCategoryTickets = Object.values(categoryCounts).reduce((a: any, b: any) => a + b, 0) as number;

  return (
    <div style={localStyles.layoutContainer}>
      
      {/* SIDEBAR NAVIGATION (Desktop Only - Hidden in Mobile via CSS media query) */}
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
            onClick={() => setActiveTab('dashboard')} 
            className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
          >
            <span>📊</span> Dashboard
          </button>
          <button 
            onClick={() => setActiveTab('requests')} 
            className={`nav-item ${activeTab === 'requests' ? 'active' : ''}`}
          >
            <span>📋</span> Semua Laporan
          </button>
          <button 
            onClick={() => setActiveTab('users')} 
            className={`nav-item ${activeTab === 'users' ? 'active' : ''}`}
          >
            <span>👥</span> Manajemen User
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

      {/* MOBILE BOTTOM NAVBAR (Mobile Only - Hidden in Desktop via CSS) */}
      <nav className="navbar">
        <button onClick={() => setActiveTab('dashboard')} className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}>📊</button>
        <button onClick={() => setActiveTab('requests')} className={`nav-item ${activeTab === 'requests' ? 'active' : ''}`}>📋</button>
        <button onClick={() => setActiveTab('users')} className={`nav-item ${activeTab === 'users' ? 'active' : ''}`}>👥</button>
        <button onClick={handleLogout} className="nav-item">🚪</button>
      </nav>

      {/* MAIN CONTAINER CONTENT */}
      <main className="main-content" style={localStyles.mainContent}>
        
        {/* Header Section */}
        <header style={localStyles.contentHeader}>
          <div>
            <h1 className="text-display" style={localStyles.welcomeText}>
              Selamat pagi, Admin 👋
            </h1>
            <p style={localStyles.dateText}>
              {new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
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
          <div className="animate-in">
            
            {/* STAT CARDS (Swipeable di mobile, grid di desktop) */}
            <div className="swipe-container" style={localStyles.statsGrid}>
              {statsConfig.map(stat => {
                const count = summary?.by_status?.[stat.key] || 0;
                return (
                  <div key={stat.key} className="glass-card swipe-card" style={localStyles.statCard}>
                    <div style={localStyles.statHeader}>
                      <span style={{ fontSize: '24px' }}>{stat.icon}</span>
                      <span style={{ color: stat.color, fontWeight: '700', fontSize: '11px', textTransform: 'uppercase' }}>
                        {stat.label}
                      </span>
                    </div>
                    <p style={localStyles.statNumber}>{count}</p>
                    <p style={localStyles.statMuted}>Total Tiket</p>
                  </div>
                );
              })}
            </div>

            {/* TWO COLUMN GRAPHICS & LISTING */}
            <div style={localStyles.dashboardGrid}>
              
              {/* KOLOM KIRI: Daftar Tiket & Filter */}
              <div className="glass-card" style={localStyles.listCard}>
                <div style={localStyles.cardTitleArea}>
                  <h3 className="text-heading">Daftar Tiket Terbaru</h3>
                  <span style={localStyles.ticketCountBadge}>{filteredRequests.length} Tiket</span>
                </div>

                {/* Filter Bar */}
                <div style={localStyles.filterBar}>
                  <input
                    type="text"
                    placeholder="Cari No. Tiket / Judul..."
                    value={searchKeyword}
                    onChange={(e) => setSearchKeyword(e.target.value)}
                    className="neu-input"
                    style={{ flex: 2, minWidth: '180px' }}
                  />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="neu-input"
                    style={{ flex: 1, minWidth: '130px', cursor: 'pointer' }}
                  >
                    <option value="">Semua Status</option>
                    <option value="SUBMITTED">SUBMITTED</option>
                    <option value="UNDER_REVIEW">UNDER REVIEW</option>
                    <option value="ASSIGNED">ASSIGNED</option>
                    <option value="IN_PROGRESS">IN PROGRESS</option>
                    <option value="RESOLVED">RESOLVED</option>
                    <option value="CLOSED">CLOSED</option>
                  </select>
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="neu-input"
                    style={{ flex: 1, minWidth: '130px', cursor: 'pointer' }}
                  >
                    <option value="">Semua Kategori</option>
                    <option value="Internet">Internet</option>
                    <option value="AC">AC</option>
                    <option value="Peralatan Kelas">Peralatan Kelas</option>
                    <option value="Kebersihan">Kebersihan</option>
                    <option value="Lainnya">Lainnya</option>
                  </select>
                </div>

                {/* Tickets Items */}
                <div style={localStyles.ticketsList}>
                  {filteredRequests.length === 0 ? (
                    <div style={localStyles.emptyStateCenter}>
                      <span style={{ fontSize: '40px', marginBottom: '8px' }}>📂</span>
                      <p style={{ color: 'var(--text-muted)' }}>Tidak ada tiket keluhan yang cocok.</p>
                    </div>
                  ) : (
                    filteredRequests.slice(0, 5).map(req => (
                      <div key={req.id} style={localStyles.ticketItem}>
                        <div style={localStyles.ticketHeader}>
                          <div>
                            <span style={localStyles.ticketNumber}>{req.request_number}</span>
                            <h4 style={localStyles.ticketTitle}>{req.title}</h4>
                          </div>
                          <span className={`status-badge status-${req.status.toLowerCase().replace('_', '-')}`}>
                            {req.status.replace('_', ' ')}
                          </span>
                        </div>
                        
                        <div style={localStyles.ticketFooter}>
                          <p style={localStyles.ticketMeta}>
                            Oleh: <strong style={{ color: 'var(--text-primary)' }}>Gwen</strong> •{' '}
                            {new Date(req.created_at).toLocaleDateString('id-ID', { month: 'short', day: 'numeric' })}
                          </p>
                          <Link to={`/requests/${req.id}`} style={{ textDecoration: 'none' }}>
                            <button className="btn-glass" style={localStyles.tinjauButton}>
                              Tinjau →
                            </button>
                          </Link>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* KOLOM KANAN: Visual Charts & Analytics */}
              <div className="glass-card" style={localStyles.chartCard}>
                <h3 className="text-heading" style={{ marginBottom: '24px' }}>Distribusi Kerusakan</h3>

                {totalCategoryTickets === 0 ? (
                  <div style={localStyles.emptyStateCenter}>
                    <span style={{ fontSize: '40px', marginBottom: '8px' }}>📊</span>
                    <p style={{ color: 'var(--text-muted)' }}>Belum ada data distribusi tiket.</p>
                  </div>
                ) : (
                  <div>
                    {Object.keys(categoryCounts).map(cat => {
                      const count = categoryCounts[cat] || 0;
                      const percentage = totalCategoryTickets > 0 
                        ? Math.round((count / totalCategoryTickets) * 100) 
                        : 0;

                      return (
                        <div key={cat} style={{ marginBottom: '20px' }}>
                          <div style={localStyles.chartLabelArea}>
                            <span style={{ fontWeight: '500' }}>{cat}</span>
                            <span style={{ color: 'var(--text-secondary)' }}>
                              <strong>{count}</strong> tiket ({percentage}%)
                            </span>
                          </div>
                          <div style={localStyles.chartTrack}>
                            <div 
                              style={{ 
                                ...localStyles.chartBar, 
                                width: `${percentage}%`,
                              }}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

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
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '28px',
  },
  welcomeText: {
    color: 'var(--text-primary)',
    margin: 0,
  },
  dateText: {
    fontSize: '13.5px',
    color: 'var(--text-muted)',
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
  statsGrid: {
    display: 'flex',
    gap: '16px',
    marginBottom: '28px',
    paddingBottom: '8px',
  },
  statCard: {
    flex: '1 0 180px',
    padding: '24px',
    borderRadius: '20px',
  },
  statHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '14px',
  },
  statNumber: {
    fontFamily: "'Outfit', sans-serif",
    fontSize: '36px',
    fontWeight: '700',
    color: 'var(--text-primary)',
    margin: 0,
    lineHeight: '1',
  },
  statMuted: {
    fontSize: '12px',
    color: 'var(--text-muted)',
    marginTop: '6px',
    margin: 0,
  },
  dashboardGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
    gap: '24px',
  },
  listCard: {
    padding: '28px 24px',
  },
  cardTitleArea: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  },
  ticketCountBadge: {
    fontSize: '11px',
    fontWeight: '600',
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    color: 'var(--accent-purple)',
    padding: '4px 10px',
    borderRadius: '12px',
  },
  filterBar: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '12px',
    marginBottom: '24px',
  },
  ticketsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  ticketItem: {
    borderBottom: '1px solid var(--border-subtle)',
    paddingBottom: '16px',
  },
  ticketHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '12px',
  },
  ticketNumber: {
    fontFamily: 'monospace',
    fontSize: '12px',
    color: 'var(--text-muted)',
  },
  ticketTitle: {
    fontSize: '15px',
    fontWeight: '600',
    color: 'var(--text-primary)',
    margin: '4px 0 0 0',
  },
  ticketFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '12px',
  },
  ticketMeta: {
    fontSize: '12px',
    color: 'var(--text-muted)',
    margin: 0,
  },
  tinjauButton: {
    padding: '6px 12px',
    fontSize: '12px',
  },
  chartCard: {
    padding: '28px 24px',
    height: 'fit-content',
  },
  chartLabelArea: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '13px',
    marginBottom: '6px',
  },
  chartTrack: {
    height: '8px',
    backgroundColor: 'var(--border-subtle)',
    borderRadius: '4px',
    overflow: 'hidden',
  },
  chartBar: {
    height: '100%',
    background: 'linear-gradient(90deg, var(--accent-purple), var(--accent-teal))',
    borderRadius: '4px',
  },
  emptyStateCenter: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px 0',
    textAlign: 'center',
  },
};
