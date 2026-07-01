// src/pages/TechnicianPage.tsx
// Halaman Penugasan Kerja & Progress Teknisi (FR-05, FR-06) dengan Peta Kampus Interaktif

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ThemeToggle } from '../components/ThemeToggle';
import * as api from '../services/api';

interface Task {
  id: string;
  request_number: string;
  title: string;
  location: string;
  status: string;
  description: string;
  priority: string;
  category: string;
  created_at: string;
}

interface Building {
  id: string;
  name: string;
  icon: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

export const TechnicianPage: React.FC = () => {
  const { user, logout } = useAuth();

  const [requests, setRequests] = useState<Task[]>([]);
  const [selectedBuilding, setSelectedBuilding] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // States untuk modal penyelesaian tugas
  const [showResolvedModal, setShowResolvedModal] = useState(false);
  const [currentTaskId, setCurrentTaskId] = useState<string | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Panggil endpoint /api/teknisi/tasks
      const data = await api.listTechnicianTasks();
      setRequests(data);
    } catch (err: any) {
      console.error('Gagal mengambil data tugas teknisi:', err);
      setError('Gagal memuat tugas perbaikan dari server.');
    } finally {
      setIsLoading(false);
    }
  };

  // 1. Memulai Pengerjaan Tugas (ASSIGNED -> IN_PROGRESS)
  const handleStartTask = async (taskId: string) => {
    try {
      setIsLoading(true);
      await api.updateProgress(taskId, 'IN_PROGRESS', 'Teknisi memulai perbaikan fisik di lokasi.');
      await fetchTasks();
    } catch (err: any) {
      console.error('Start task error:', err);
      alert(err.message || 'Gagal merubah status menjadi In Progress.');
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Membuka Modal Penyelesaian Tugas (IN_PROGRESS -> RESOLVED)
  const openResolvedModal = (taskId: string) => {
    setCurrentTaskId(taskId);
    setResolutionNotes('');
    setSubmitError(null);
    setShowResolvedModal(true);
  };

  const handleCompleteTaskSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (resolutionNotes.trim().length < 10) {
      setSubmitError('Catatan penyelesaian teknis wajib diisi minimal 10 karakter.');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);
    try {
      if (currentTaskId) {
        await api.updateProgress(currentTaskId, 'RESOLVED', resolutionNotes.trim());
        setShowResolvedModal(false);
        await fetchTasks();
      }
    } catch (err: any) {
      console.error('Complete task error:', err);
      setSubmitError(err.message || 'Gagal menandai tugas selesai.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 9 Gedung Utama Universitas Klabat
  const buildings: Building[] = [
    { id: 'GK1', name: 'Gedung Kuliah 1', icon: '🏫', x: 50, y: 35, w: 180, h: 48 },
    { id: 'GK2', name: 'Gedung Kuliah 2', icon: '🏫', x: 50, y: 95, w: 180, h: 48 },
    { id: 'GK3', name: 'Gedung Kuliah 3', icon: '🏫', x: 50, y: 155, w: 180, h: 48 },
    { id: 'GA', name: 'Gedung Rektorat (GA)', icon: '🏛️', x: 290, y: 35, w: 190, h: 48 },
    { id: 'Pioneer Chapel', name: 'Pioneer Chapel', icon: '⛪', x: 290, y: 105, w: 190, h: 70 },
    { id: 'Kantin', name: 'Kantin UNKLAB', icon: '🍽️', x: 290, y: 195, w: 190, h: 48 },
    { id: 'FWC', name: 'Fernheim Center (FWC)', icon: '🏢', x: 540, y: 35, w: 210, h: 50 },
    { id: 'SportHall', name: 'Sport Hall', icon: '🏀', x: 540, y: 105, w: 210, h: 50 },
    { id: 'Lapangan Tenis', name: 'Lapangan Tenis', icon: '🎾', x: 540, y: 175, w: 210, h: 48 }
  ];

  // Hitung jumlah keluhan aktif per gedung
  const getBuildingActiveCount = (buildingId: string) => {
    return requests.filter(req => {
      const matchesLoc = req.location.toLowerCase().includes(buildingId.toLowerCase());
      const isActive = ['ASSIGNED', 'IN_PROGRESS'].includes(req.status);
      return matchesLoc && isActive;
    }).length;
  };

  const filteredTasks = selectedBuilding
    ? requests.filter(req => req.location.toLowerCase().includes(selectedBuilding.toLowerCase()))
    : requests;

  return (
    <div style={styles.layoutWrapper}>
      {/* HEADER STICKY */}
      <header style={styles.header}>
        <div style={styles.headerLeft}>
          <span style={styles.avatar}>🔧</span>
          <div>
            <h4 style={styles.userName}>{user?.name}</h4>
            <span className="nature-micro-label" style={{ margin: 0, fontSize: '10px', color: '#8E9A90' }}>
              Teknisi Lapangan
            </span>
          </div>
        </div>
        <div style={styles.headerRight}>
          <ThemeToggle />
          <button onClick={logout} className="nature-pill inactive" style={{ padding: '8px 16px', fontSize: '12px' }}>
            Logout
          </button>
        </div>
      </header>

      {/* BODY CONTENT SPLIT */}
      <div style={styles.mainContent}>
        {/* MAP SECTION (55% Height) */}
        <section style={styles.mapSection}>
          <div style={styles.mapCard}>
            <div style={styles.mapHeader}>
              <div style={styles.indicatorContainer}>
                <span style={styles.pulseDot}></span>
                <span style={styles.mapTitle}>Peta Pemeliharaan Kampus UNKLAB</span>
              </div>
              {selectedBuilding && (
                <button onClick={() => setSelectedBuilding(null)} className="nature-pill inactive" style={{ padding: '4px 10px', fontSize: '11px' }}>
                  Reset Filter Gedung
                </button>
              )}
            </div>

            <div style={styles.svgWrapper}>
              <svg width="800" height="260" viewBox="0 0 800 260" style={{ overflow: 'visible' }}>
                <defs>
                  {/* Gradien Padang Rumput */}
                  <linearGradient id="cGrassGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#1E5E2F" />
                    <stop offset="100%" stopColor="#2E7D32" />
                  </linearGradient>
                  {/* Shadow Filter */}
                  <filter id="cSoftShadow" x="-10%" y="-10%" width="120%" height="120%">
                    <feDropShadow dx="0" dy="6" stdDeviation="6" floodColor="#000" floodOpacity="0.2" />
                  </filter>
                </defs>

                {/* Base Green Field */}
                <rect x="10" y="10" width="780" height="240" rx="20" fill="url(#cGrassGrad)" filter="url(#cSoftShadow)" />

                {/* Main Campus Roads */}
                <line x1="260" y1="10" x2="260" y2="250" stroke="#334155" strokeWidth="12" opacity="0.6" />
                <line x1="510" y1="10" x2="510" y2="250" stroke="#334155" strokeWidth="12" opacity="0.6" />
                <line x1="260" y1="130" x2="510" y2="130" stroke="#334155" strokeWidth="12" opacity="0.6" />

                {/* Pedestrian Pathways */}
                <line x1="260" y1="60" x2="290" y2="60" stroke="#E2E8F0" strokeWidth="2" strokeDasharray="3 3" opacity="0.8" />
                <line x1="480" y1="140" x2="510" y2="140" stroke="#E2E8F0" strokeWidth="2" strokeDasharray="3 3" opacity="0.8" />

                {/* Campus Roundabout Garden */}
                <circle cx="385" cy="130" r="12" fill="#E2E8F0" opacity="0.2" />

                {/* Interactive Buildings */}
                {buildings.map(b => {
                  const activeCount = getBuildingActiveCount(b.id);
                  const hasProblem = activeCount > 0;
                  const isSelected = selectedBuilding === b.id;

                  let fillVal = 'rgba(255, 255, 255, 0.95)';
                  let strokeVal = 'rgba(255,255,255,0.8)';
                  let strokeW = 1.5;
                  let textCol = '#101411';

                  if (isSelected) {
                    fillVal = '#D4E875';
                    strokeVal = '#101411';
                    strokeW = 3;
                    textCol = '#101411';
                  } else if (hasProblem) {
                    fillVal = '#FEF3C7';
                    strokeVal = '#F59E0B';
                    strokeW = 2;
                    textCol = '#92400E';
                  }

                  return (
                    <g 
                      key={b.id} 
                      onClick={() => setSelectedBuilding(isSelected ? null : b.id)}
                      style={{ cursor: 'pointer' }}
                    >
                      {/* Base Card Rect */}
                      <rect
                        x={b.x}
                        y={b.y}
                        width={b.w}
                        height={b.h}
                        rx="10"
                        ry="10"
                        fill={fillVal}
                        stroke={strokeVal}
                        strokeWidth={strokeW}
                        filter="url(#cSoftShadow)"
                        style={{ transition: 'all 0.25s ease' }}
                      />

                      {/* Accent Bar */}
                      <rect
                        x={b.x + 1}
                        y={b.y + 10}
                        width="3"
                        height={b.h - 20}
                        rx="1"
                        fill={hasProblem ? '#F59E0B' : (isSelected ? '#101411' : '#64748B')}
                      />

                      {/* Icon & Title Text */}
                      <text x={b.x + 14} y={b.y + b.h / 2 + 5} fontSize="14" pointerEvents="none">
                        {b.icon}
                      </text>
                      <text
                        x={b.x + 36}
                        y={b.y + b.h / 2 + 4}
                        fill={textCol}
                        fontSize="11"
                        fontWeight="800"
                        fontFamily="Outfit, sans-serif"
                        pointerEvents="none"
                      >
                        {b.name}
                      </text>

                      {/* Red Counter Badge */}
                      {hasProblem && (
                        <g transform={`translate(${b.x + b.w - 10}, ${b.y + 10})`}>
                          <circle cx="0" cy="0" r="9.5" fill="#EF4444" stroke="#ffffff" strokeWidth="1.5" />
                          <text x="0" y="3" fill="#ffffff" fontSize="9" fontWeight="900" textAnchor="middle" pointerEvents="none">
                            {activeCount}
                          </text>
                        </g>
                      )}
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>
        </section>

        {/* TASK LIST SECTION (45% Height) */}
        <section style={styles.listSection}>
          <div style={styles.listHeader}>
            <h3 className="nature-huge-header" style={{ fontSize: '20px', margin: 0 }}>
              {selectedBuilding ? `Tugas Aktif di ${selectedBuilding}` : 'Semua Penugasan Aktif'} ({filteredTasks.length})
            </h3>
          </div>

          {isLoading ? (
            <div style={styles.loaderContainer}>
              <div className="glass-card" style={{ width: '280px', height: '140px', borderRadius: '24px' }}></div>
              <div className="glass-card" style={{ width: '280px', height: '140px', borderRadius: '24px' }}></div>
            </div>
          ) : error ? (
            <div style={styles.errorText}>⚠️ {error}</div>
          ) : filteredTasks.length === 0 ? (
            <div className="glass-card" style={styles.emptyCard}>
              <span style={{ fontSize: '32px' }}>🎉</span>
              <p style={{ color: '#56665A', fontSize: '14px', fontWeight: '700', marginTop: '8px', margin: 0 }}>
                {selectedBuilding ? `Tidak ada tugas aktif di ${selectedBuilding}.` : 'Semua tugas perbaikan selesai! Bagus sekali.'}
              </p>
            </div>
          ) : (
            <div style={styles.cardsScroll}>
              {filteredTasks.map(task => (
                <div key={task.id} className="nature-main-card" style={styles.taskCard}>
                  <div style={styles.cardHeader}>
                    <span style={styles.taskNumber}>{task.request_number}</span>
                    <span style={{
                      ...styles.statusBadge,
                      backgroundColor: task.status === 'IN_PROGRESS' ? '#FEF3C7' : '#E0E8E1',
                      color: task.status === 'IN_PROGRESS' ? '#B45309' : '#101411'
                    }}>
                      {task.status.replace('_', ' ')}
                    </span>
                  </div>

                  <h4 style={styles.taskTitle}>{task.title}</h4>
                  <p style={styles.taskLoc}>📍 {task.location}</p>

                  <div style={styles.cardFooter}>
                    <Link to={`/requests/${task.id}`} style={styles.detailLink}>
                      Detail Laporan
                    </Link>

                    {task.status === 'ASSIGNED' && (
                      <button onClick={() => handleStartTask(task.id)} className="nature-pill active" style={{ padding: '8px 16px', fontSize: '12px' }}>
                        🔧 Mulai Pengerjaan
                      </button>
                    )}

                    {task.status === 'IN_PROGRESS' && (
                      <button onClick={() => openResolvedModal(task.id)} className="nature-pill active" style={{ padding: '8px 16px', fontSize: '12px', backgroundColor: '#047857' }}>
                        ✅ Tandai Selesai
                      </button>
                    )}

                    {['RESOLVED', 'CLOSED'].includes(task.status) && (
                      <span style={styles.checkDone}>✓ Selesai</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* RESOLUTION NOTE MODAL */}
      {showResolvedModal && (
        <div style={styles.modalOverlay}>
          <div className="nature-main-card" style={styles.modalCard}>
            <h3 style={{ fontSize: '20px', fontWeight: '800', margin: '0 0 8px 0' }}>Laporan Catatan Perbaikan</h3>
            <p style={{ color: '#68776B', fontSize: '13px', marginBottom: '16px', lineHeight: '1.4' }}>
              Tuliskan tindakan teknis perbaikan sarana yang telah selesai dikerjakan secara konkret.
            </p>

            {submitError && (
              <p style={{ color: '#DC2626', fontSize: '13px', fontWeight: '700', marginBottom: '12px' }}>⚠️ {submitError}</p>
            )}

            <form onSubmit={handleCompleteTaskSubmit}>
              <textarea
                placeholder="Tulis minimal 10 karakter catatan perbaikan di sini..."
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
                disabled={isSubmitting}
                style={styles.textarea}
                required
              />

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button type="button" onClick={() => setShowResolvedModal(false)} className="nature-pill inactive" disabled={isSubmitting}>
                  Batal
                </button>
                <button type="submit" className="nature-pill active" disabled={isSubmitting}>
                  {isSubmitting ? 'Menyimpan...' : 'Simpan Perbaikan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// Premium Styles
const styles: Record<string, React.CSSProperties> = {
  layoutWrapper: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    boxSizing: 'border-box',
    backgroundColor: 'transparent'
  },
  header: {
    padding: '14px 24px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid rgba(255,255,255,0.3)',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    backgroundColor: 'rgba(255, 255, 255, 0.45)',
    position: 'sticky',
    top: 0,
    zIndex: 99,
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  avatar: {
    fontSize: '24px',
  },
  userName: {
    fontSize: '15px',
    fontWeight: '800',
    color: '#101411',
    margin: 0,
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  mainContent: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    padding: '24px',
    gap: '24px',
    boxSizing: 'border-box',
    height: 'calc(100vh - 75px)'
  },
  mapSection: {
    flex: '55 0 280px',
    minHeight: '280px',
    maxHeight: '340px'
  },
  mapCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.45)',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    borderRadius: '24px',
    border: '1px solid rgba(255, 255, 255, 0.7)',
    padding: '16px 24px',
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    boxSizing: 'border-box'
  },
  mapHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px'
  },
  indicatorContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  pulseDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    backgroundColor: '#2E7D32',
    boxShadow: '0 0 8px #2E7D32',
  },
  mapTitle: {
    fontFamily: "'Outfit', sans-serif",
    fontSize: '14px',
    fontWeight: '700',
    color: '#101411',
  },
  svgWrapper: {
    flex: 1,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'auto'
  },
  listSection: {
    flex: '45 0 220px',
    display: 'flex',
    flexDirection: 'column',
    minHeight: '200px'
  },
  listHeader: {
    marginBottom: '12px',
  },
  loaderContainer: {
    display: 'flex',
    gap: '16px',
    overflowX: 'hidden'
  },
  errorText: {
    color: '#DC2626',
    fontWeight: '700',
    fontSize: '14px'
  },
  emptyCard: {
    textAlign: 'center',
    padding: '40px 0',
    borderRadius: '24px',
    backgroundColor: 'rgba(255, 255, 255, 0.45)',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)'
  },
  cardsScroll: {
    display: 'flex',
    gap: '16px',
    overflowX: 'auto',
    paddingBottom: '12px'
  },
  taskCard: {
    flex: '0 0 300px',
    padding: '20px',
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    height: '165px'
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px'
  },
  taskNumber: {
    fontFamily: 'monospace',
    fontSize: '11px',
    color: '#8E9A90',
    fontWeight: '800'
  },
  statusBadge: {
    fontSize: '10px',
    fontWeight: '800',
    padding: '4px 10px',
    borderRadius: '9999px',
    textTransform: 'uppercase'
  },
  taskTitle: {
    fontSize: '15px',
    fontWeight: '800',
    color: '#101411',
    margin: '0 0 4px 0',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  },
  taskLoc: {
    fontSize: '12px',
    color: '#56665A',
    margin: '0 0 12px 0'
  },
  cardFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTop: '1px solid rgba(0,0,0,0.06)',
    paddingTop: '10px'
  },
  detailLink: {
    fontSize: '12px',
    fontWeight: '800',
    color: '#101411',
    textDecoration: 'underline'
  },
  checkDone: {
    fontSize: '12px',
    color: '#047857',
    fontWeight: '800'
  },
  modalOverlay: {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
    backdropFilter: 'blur(4px)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 200,
    padding: '20px',
  },
  modalCard: {
    width: '100%',
    maxWidth: '440px',
    padding: '24px',
    boxSizing: 'border-box'
  },
  textarea: {
    padding: '12px 20px',
    borderRadius: '20px',
    border: '2px solid #C0D0C4',
    backgroundColor: '#FFFFFF',
    color: '#101411',
    fontWeight: '600',
    fontSize: '14px',
    outline: 'none',
    minHeight: '100px',
    resize: 'vertical',
    marginBottom: '20px',
    width: '100%',
    boxSizing: 'border-box',
    fontFamily: 'inherit'
  }
};
