// src/pages/TechnicianPage.tsx
// Halaman Penugasan Kerja & Progress Teknisi (FR-05, FR-06) dengan Grid Penugasan Tugas Hari Ini

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
  reporter_name?: string | null;
}

const getBuildingLabel = (location: string): string => {
  const loc = location.toUpperCase();
  if (loc.includes('GK1')) return 'GK1';
  if (loc.includes('GK2')) return 'GK2';
  if (loc.includes('GK3')) return 'GK3';
  if (loc.includes('GA') || loc.includes('ADMINISTRASI')) return 'GA';
  if (loc.includes('FWC') || loc.includes('FERN')) return 'FWC';
  if (loc.includes('CHAPEL') || loc.includes('PIONEER')) return 'Chapel';
  if (loc.includes('SPORT') || loc.includes('HALL')) return 'Sport Hall';
  if (loc.includes('TENIS') || loc.includes('TENNIS')) return 'Lap. Tenis';
  if (loc.includes('KANTIN')) return 'Kantin';
  
  const parts = location.split(',');
  return parts[0]?.trim() || location;
};

const getCategoryIcon = (category: string) => {
  const cat = category.toLowerCase();
  if (cat.includes('internet')) return '🌐';
  if (cat.includes('ac')) return '❄️';
  if (cat.includes('peralatan') || cat.includes('kelas')) return '🏫';
  if (cat.includes('kebersihan')) return '🧹';
  if (cat.includes('fisik') || cat.includes('kerusakan')) return '🧱';
  return '🔧';
};

const getPriorityColor = (priority: string) => {
  const p = priority.toUpperCase();
  if (p === 'HIGH' || p === 'CRITICAL') return '#ef4444';
  if (p === 'MEDIUM') return '#f59e0b';
  return '#22c55e'; // LOW
};

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

  const activeTasks = requests.filter(t => ['ASSIGNED', 'IN_PROGRESS'].includes(t.status.toUpperCase()));

  const filteredTasks = selectedBuilding
    ? requests.filter(req => {
        const loc = req.location.toLowerCase();
        const sel = selectedBuilding.toLowerCase();
        if (sel === 'sporthall') {
          return loc.includes('sport') || loc.includes('hall');
        }
        if (sel === 'chapel') {
          return loc.includes('chapel');
        }
        return loc.includes(sel);
      })
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
        {/* TUGAS HARI INI SECTION */}
        <section style={styles.tugasHariIniContainer}>
          <h3 className="nature-huge-header" style={{ fontSize: '18px', margin: '0 0 12px 0', color: '#101411' }}>
            📋 Tugas Hari Ini ({activeTasks.length})
          </h3>

          {isLoading ? (
            <div style={styles.loaderContainer}>
              <div className="glass-card" style={{ width: '100%', height: '140px', borderRadius: '24px' }}></div>
            </div>
          ) : activeTasks.length === 0 ? (
            <div className="glass-card" style={styles.emptyCard}>
              <span style={{ fontSize: '32px' }}>🎉</span>
              <p style={{ color: '#56665A', fontSize: '14px', fontWeight: '700', marginTop: '8px', margin: 0 }}>
                Tidak ada penugasan aktif untuk Anda hari ini!
              </p>
            </div>
          ) : (
            <div style={styles.tugasGrid}>
              {activeTasks.map(task => (
                <div 
                  key={task.id} 
                  style={{
                    ...styles.newTugasCard,
                    borderLeft: `6px solid ${getPriorityColor(task.priority)}`
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <span 
                      onClick={() => setSelectedBuilding(getBuildingLabel(task.location))} 
                      style={{ ...styles.newPillBadge, cursor: 'pointer' }}
                      title="Klik untuk filter riwayat di bawah"
                    >
                      🏢 {getBuildingLabel(task.location)}
                    </span>
                    <span style={styles.taskNumber}>
                      {task.request_number}
                    </span>
                  </div>

                  <h4 style={styles.newCardTitle}>{task.title}</h4>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 'auto' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#56665A' }}>
                        <span>{getCategoryIcon(task.category)}</span>
                        <span style={{ fontWeight: '500' }}>{task.category}</span>
                      </div>
                      <div style={{ fontSize: '11px', color: '#8E9A90', marginTop: '2px' }}>
                        Pelapor: {task.reporter_name || 'Umum'}
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <Link to={`/requests/${task.id}`} style={{ ...styles.detailLink, marginRight: '8px' }}>
                        Detail
                      </Link>

                      {task.status === 'ASSIGNED' && (
                        <button 
                          onClick={() => handleStartTask(task.id)} 
                          style={styles.btnMulai}
                        >
                          Mulai →
                        </button>
                      )}

                      {task.status === 'IN_PROGRESS' && (
                        <button 
                          onClick={() => openResolvedModal(task.id)} 
                          style={styles.btnSelesai}
                        >
                          Tandai Selesai ✓
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* TASK LIST SECTION (All tasks: RESOLVED, CLOSED, etc.) */}
        <section id="task-list" style={styles.listSection}>
          <div style={styles.listHeader}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 className="nature-huge-header" style={{ fontSize: '18px', margin: 0 }}>
                {selectedBuilding ? `Riwayat Tugas di ${selectedBuilding}` : 'Semua Riwayat Tugas'} ({filteredTasks.length})
              </h3>
              {selectedBuilding && (
                <button 
                  onClick={() => setSelectedBuilding(null)} 
                  style={styles.btnClearFilter}
                >
                  Tampilkan Semua ×
                </button>
              )}
            </div>
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
                {selectedBuilding ? `Tidak ada tugas di ${selectedBuilding}.` : 'Belum ada riwayat tugas perbaikan.'}
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
                      backgroundColor: 
                        task.status === 'IN_PROGRESS' ? '#FEF3C7' : 
                        task.status === 'RESOLVED' ? '#D1FAE5' : '#E0E8E1',
                      color: 
                        task.status === 'IN_PROGRESS' ? '#B45309' : 
                        task.status === 'RESOLVED' ? '#047857' : '#101411'
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
    gap: '32px',
    boxSizing: 'border-box',
    overflowY: 'auto'
  },
  tugasHariIniContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  tugasGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
    gap: '16px',
    maxHeight: '380px',
    overflowY: 'auto',
    padding: '4px'
  },
  newTugasCard: {
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
    border: '1px solid #e5e7eb',
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    minHeight: '140px',
    boxSizing: 'border-box'
  },
  newPillBadge: {
    backgroundColor: '#f1f5f9',
    color: '#334155',
    fontSize: '11px',
    fontWeight: 700,
    padding: '2px 8px',
    borderRadius: '9999px',
  },
  newCardTitle: {
    fontSize: '15px',
    fontWeight: 600,
    color: '#1e293b',
    margin: '8px 0',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  },
  btnMulai: {
    border: '1px solid #1e293b',
    backgroundColor: 'transparent',
    color: '#1e293b',
    padding: '6px 12px',
    fontSize: '12px',
    fontWeight: 600,
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  btnSelesai: {
    backgroundColor: '#10b981',
    color: '#ffffff',
    border: 'none',
    padding: '6px 12px',
    fontSize: '12px',
    fontWeight: 600,
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  listSection: {
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
  btnClearFilter: {
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    border: 'none',
    borderRadius: '20px',
    padding: '4px 12px',
    fontSize: '11px',
    fontWeight: '700',
    color: '#56665A',
    cursor: 'pointer',
    transition: 'background 0.2s',
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
