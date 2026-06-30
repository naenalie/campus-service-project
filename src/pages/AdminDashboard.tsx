// src/pages/AdminDashboard.tsx
// Halaman Dashboard Administrator Premium (FR-03, FR-04, FR-08, FR-10, FR-12)

import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import * as api from '../services/api';

export const AdminDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [summary, setSummary] = useState<any>(null);
  const [requests, setRequests] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters State
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');

  // Navigasi aktif di sidebar
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setIsLoading(true);
    setError(null);
    try {
      const [summaryData, requestsData, usersData] = await Promise.all([
        api.getDashboardSummary(),
        api.listRequests(),
        api.getAllUsers()
      ]);
      setSummary(summaryData);
      setRequests(requestsData);
      setUsers(usersData);
    } catch (err: any) {
      console.error('Gagal mengambil data dashboard:', err);
      setError('Gagal memuat data dari server. Hubungi dukungan IT.');
    } finally {
      setIsLoading(false);
    }
  }

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

  const handleUserRoleChange = async (userId: string, newRole: string) => {
    try {
      await api.updateUserRole(userId, newRole);
      // Refresh user data
      const usersData = await api.getAllUsers();
      setUsers(usersData);
    } catch (err: any) {
      alert(err.message || 'Gagal mengubah role user.');
    }
  };

  const handleUserStatusToggle = async (userId: string, currentStatus: number) => {
    try {
      const targetStatus = currentStatus === 1 ? 0 : 1;
      await api.updateUserStatus(userId, targetStatus);
      // Refresh user data
      const usersData = await api.getAllUsers();
      setUsers(usersData);
    } catch (err: any) {
      alert(err.message || 'Gagal mengubah status user.');
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
    { key: 'SUBMITTED', label: 'Baru', color: '#8B5CF6', icon: '🟣' },
    { key: 'UNDER_REVIEW', label: 'Ditinjau', color: '#3B82F6', icon: '🔵' },
    { key: 'ASSIGNED', label: 'Dialokasikan', color: '#10B981', icon: '🟢' },
    { key: 'IN_PROGRESS', label: 'Perbaikan', color: '#F59E0B', icon: '🟡' },
    { key: 'RESOLVED', label: 'Selesai', color: '#10B981', icon: '🟢' }
  ];

  const categoryCounts = summary?.by_category || {};
  const totalCategoryTickets = Object.values(categoryCounts).reduce((a: any, b: any) => a + b, 0) as number;

  return (
    <div style={localStyles.layoutContainer}>
      
      {/* SIDEBAR NAVIGATION */}
      <aside style={localStyles.sidebar}>
        <div style={localStyles.sidebarHeader}>
          <span style={{ fontSize: '32px' }}>🏛</span>
          <div>
            <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '18px', fontWeight: '800', color: '#FFFFFF', margin: 0 }}>UNKLAB</h2>
            <p style={{ fontSize: '11px', color: '#8E9A90', textTransform: 'uppercase', fontWeight: '700', margin: 0 }}>Campus Services</p>
          </div>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
          <button 
            onClick={() => setActiveTab('dashboard')} 
            className={`nature-pill ${activeTab === 'dashboard' ? 'active' : 'inactive'}`}
            style={{ justifyContent: 'flex-start', padding: '12px 20px', width: '100%', color: activeTab === 'dashboard' ? '#101411' : '#FFFFFF' }}
          >
            <span>📊</span> Dashboard
          </button>
          <button 
            onClick={() => setActiveTab('requests')} 
            className={`nature-pill ${activeTab === 'requests' ? 'active' : 'inactive'}`}
            style={{ justifyContent: 'flex-start', padding: '12px 20px', width: '100%', color: activeTab === 'requests' ? '#101411' : '#FFFFFF' }}
          >
            <span>📋</span> Semua Laporan
          </button>
          <button 
            onClick={() => setActiveTab('users')} 
            className={`nature-pill ${activeTab === 'users' ? 'active' : 'inactive'}`}
            style={{ justifyContent: 'flex-start', padding: '12px 20px', width: '100%', color: activeTab === 'users' ? '#101411' : '#FFFFFF' }}
          >
            <span>👥</span> Manajemen User
          </button>
        </nav>

        <div style={{ marginTop: 'auto', borderTop: '1px solid #2B332E', paddingTop: '20px' }}>
          <div style={{ padding: '0 8px', marginBottom: '16px' }}>
            <p style={{ fontSize: '14px', fontWeight: '800', color: '#FFFFFF', margin: 0 }}>{user?.name}</p>
            <p style={{ fontSize: '11px', color: '#D4E875', fontWeight: '700', margin: '2px 0 0 0' }}>{user?.role}</p>
          </div>
          <button onClick={handleLogout} className="nature-pill inactive" style={{ width: '100%', justifyContent: 'center', color: '#EF4444' }}>
            🚪 Keluar
          </button>
        </div>
      </aside>

      {/* MAIN CONTAINER CONTENT */}
      <main style={localStyles.mainContent}>
        
        {/* Header Section */}
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
          <div>
            <h1 className="nature-huge-header" style={{ fontSize: '32px', margin: 0 }}>
              Selamat Pagi, Admin 👋
            </h1>
            <p style={{ fontSize: '14px', color: '#68776B', marginTop: '4px', margin: 0 }}>
              {new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
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
          <div className="animate-in">
            
            {/* TAMPILAN DASHBOARD METRICS */}
            {activeTab === 'dashboard' && (
              <>
                {/* 5 KPI STAT CARDS */}
                <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '28px' }}>
                  {statsConfig.map(stat => {
                    const count = summary?.by_status?.[stat.key] || 0;
                    return (
                      <div key={stat.key} className="glass-card" style={{ flex: '1 0 160px', padding: '24px', borderRadius: '32px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                          <span style={{ fontSize: '11px', fontWeight: '800', color: stat.color, textTransform: 'uppercase' }}>
                            {stat.label}
                          </span>
                          <span>{stat.icon}</span>
                        </div>
                        <p style={{ fontSize: '40px', fontWeight: '800', color: '#101411', margin: 0 }}>{count}</p>
                        <p style={{ fontSize: '12px', color: '#68776B', margin: 0 }}>Total Laporan</p>
                      </div>
                    );
                  })}
                </div>

                {/* GRAPHICS & RECENT LIST */}
                <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '24px' }}>
                  
                  {/* Left Column: Recent Tickets */}
                  <div className="nature-main-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                      <span className="nature-micro-label">ANTREAN LAPORAN TERBARU</span>
                      <span style={{ fontSize: '12px', fontWeight: '800', backgroundColor: '#E0E8E1', padding: '4px 12px', borderRadius: '9999px' }}>
                        {requests.length} Total
                      </span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      {requests.slice(0, 4).map(req => (
                        <div key={req.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #E0E8E1', paddingBottom: '16px' }}>
                          <div>
                            <span style={{ fontFamily: 'monospace', fontSize: '12px', color: '#8E9A90', fontWeight: '700' }}>{req.request_number}</span>
                            <h4 style={{ fontSize: '15px', fontWeight: '800', color: '#101411', margin: '2px 0 0 0' }}>{req.title}</h4>
                            <p style={{ fontSize: '12px', color: '#68776B', margin: '4px 0 0 0' }}>
                              📍 {req.location} • Kategori: <strong>{req.category}</strong>
                            </p>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <span style={{ backgroundColor: '#101411', color: '#D4E875', fontSize: '11px', fontWeight: '800', padding: '6px 12px', borderRadius: '9999px' }}>
                              {req.status}
                            </span>
                            <Link to={`/requests/${req.id}`}>
                              <button className="nature-pill active" style={{ padding: '8px 14px', fontSize: '12px' }}>
                                Detail
                              </button>
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Right Column: Category Distribution */}
                  <div className="nature-main-card">
                    <span className="nature-micro-label">DISTRIBUSI KELUHAN</span>

                    <div style={{ marginTop: '20px' }}>
                      {totalCategoryTickets === 0 ? (
                        <p style={{ color: '#8E9A90', textAlign: 'center', padding: '24px 0' }}>Belum ada data tiket.</p>
                      ) : (
                        Object.keys(categoryCounts).map(cat => {
                          const count = categoryCounts[cat] || 0;
                          const percentage = totalCategoryTickets > 0 
                            ? Math.round((count / totalCategoryTickets) * 100) 
                            : 0;

                          return (
                            <div key={cat} style={{ marginBottom: '20px' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px', fontWeight: '700' }}>
                                <span>{cat}</span>
                                <span style={{ color: '#56665A' }}>{count} tiket ({percentage}%)</span>
                              </div>
                              <div style={{ height: '8px', backgroundColor: '#E0E8E1', borderRadius: '4px', overflow: 'hidden' }}>
                                <div style={{ height: '100%', backgroundColor: '#101411', width: `${percentage}%`, borderRadius: '4px' }}></div>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>

                </div>
              </>
            )}

            {/* TAMPILAN SEMUA LAPORAN */}
            {activeTab === 'requests' && (
              <div className="nature-main-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <span className="nature-micro-label">DAFTAR SEMUA LAPORAN MASUK</span>
                  <span style={{ fontSize: '12px', fontWeight: '800', backgroundColor: '#E0E8E1', padding: '4px 12px', borderRadius: '9999px' }}>
                    {filteredRequests.length} Ditemukan
                  </span>
                </div>

                {/* Filter Bar */}
                <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
                  <input
                    type="text"
                    placeholder="Cari Judul / No. Laporan..."
                    value={searchKeyword}
                    onChange={(e) => setSearchKeyword(e.target.value)}
                    style={localStyles.filterInput}
                  />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    style={{ ...localStyles.filterInput, flex: 1, cursor: 'pointer' }}
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
                    style={{ ...localStyles.filterInput, flex: 1, cursor: 'pointer' }}
                  >
                    <option value="">Semua Kategori</option>
                    <option value="Internet">Internet</option>
                    <option value="AC">AC</option>
                    <option value="Peralatan Kelas">Peralatan Kelas</option>
                    <option value="Kebersihan">Kebersihan</option>
                    <option value="Lainnya">Lainnya</option>
                  </select>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {filteredRequests.map(req => (
                    <div key={req.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #E0E8E1', paddingBottom: '16px' }}>
                      <div>
                        <span style={{ fontFamily: 'monospace', fontSize: '12px', color: '#8E9A90', fontWeight: '700' }}>{req.request_number}</span>
                        <h4 style={{ fontSize: '15px', fontWeight: '800', color: '#101411', margin: '2px 0 0 0' }}>{req.title}</h4>
                        <p style={{ fontSize: '12px', color: '#68776B', margin: '4px 0 0 0' }}>
                          📍 {req.location} • Kategori: <strong>{req.category}</strong>
                        </p>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ backgroundColor: '#FEF3C7', color: '#B45309', fontSize: '11px', fontWeight: '800', padding: '6px 12px', borderRadius: '9999px' }}>
                          {req.status}
                        </span>
                        <Link to={`/requests/${req.id}`}>
                          <button className="nature-pill active" style={{ padding: '8px 14px', fontSize: '12px' }}>
                            Tinjau
                          </button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAMPILAN MANAJEMEN USER */}
            {activeTab === 'users' && (
              <div className="nature-main-card">
                <div style={{ marginBottom: '24px' }}>
                  <span className="nature-micro-label">MANAJEMEN PENGGUNA SISTEM</span>
                  <h3 style={{ fontSize: '24px', fontWeight: '800', margin: '4px 0 0 0' }}>Daftar Pengguna UNKLAB</h3>
                </div>

                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid #C0D0C4' }}>
                        <th style={localStyles.th}>Nama</th>
                        <th style={localStyles.th}>Email</th>
                        <th style={localStyles.th}>Role / Peran</th>
                        <th style={localStyles.th}>Status Akun</th>
                        <th style={localStyles.th}>Aksi Ubah</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map(u => {
                        const isSelf = u.id === user?.id;
                        return (
                          <tr key={u.id} style={{ borderBottom: '1px solid #E0E8E1' }}>
                            <td style={localStyles.td}><strong>{u.name}</strong></td>
                            <td style={localStyles.td}>{u.email}</td>
                            <td style={localStyles.td}>
                              {isSelf ? (
                                <span style={{ fontWeight: '800', color: '#101411' }}>{u.role} (Anda)</span>
                              ) : (
                                <select
                                  value={u.role}
                                  onChange={(e) => handleUserRoleChange(u.id, e.target.value)}
                                  style={{ padding: '6px 12px', borderRadius: '9999px', border: '2px solid #C0D0C4', outline: 'none', fontWeight: '700', fontSize: '12px' }}
                                >
                                  <option value="PELAPOR">PELAPOR</option>
                                  <option value="ADMIN">ADMIN</option>
                                  <option value="TEKNISI">TEKNISI</option>
                                  <option value="MANAJER">MANAJER</option>
                                </select>
                              )}
                            </td>
                            <td style={localStyles.td}>
                              <span style={{ fontWeight: '800', color: u.is_active === 1 ? '#047857' : '#DC2626' }}>
                                {u.is_active === 1 ? 'AKTIF' : 'NONAKTIF'}
                              </span>
                            </td>
                            <td style={localStyles.td}>
                              {isSelf ? (
                                <span style={{ color: '#8E9A90', fontSize: '12px' }}>Terkunci</span>
                              ) : (
                                <button
                                  onClick={() => handleUserStatusToggle(u.id, u.is_active)}
                                  className={`nature-pill ${u.is_active === 1 ? 'inactive' : 'active'}`}
                                  style={{ padding: '6px 14px', fontSize: '11px', color: u.is_active === 1 ? '#DC2626' : '#FFFFFF' }}
                                >
                                  {u.is_active === 1 ? 'Nonaktifkan' : 'Aktifkan'}
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
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
    width: '100vw',
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
  filterInput: {
    padding: '10px 18px',
    borderRadius: '9999px',
    border: '2px solid rgba(255, 255, 255, 0.3)',
    backgroundColor: 'rgba(255, 255, 255, 0.14)',
    color: '#101411',
    fontWeight: '700',
    fontSize: '13px',
    outline: 'none',
    flex: 2,
  },
  th: {
    padding: '12px 8px',
    fontSize: '11px',
    fontWeight: '800',
    color: '#101411',
    textTransform: 'uppercase',
  },
  td: {
    padding: '14px 8px',
    fontSize: '13.5px',
    color: '#344037',
  },
};

