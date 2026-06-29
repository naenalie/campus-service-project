// src/pages/TechnicianPage.tsx
// Halaman Penugasan Kerja & Progress Teknisi (FR-05, FR-06) dengan Peta Kampus Interaktif

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ThemeToggle } from '../components/ThemeToggle';
import { CampusMap } from '../components/CampusMap';
import * as api from '../services/api';

export const TechnicianPage: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [requests, setRequests] = useState<any[]>([]);
  const [selectedBuilding, setSelectedBuilding] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // States untuk modal/prompt penyelesaian tugas
  const [showResolvedModal, setShowResolvedModal] = useState(false);
  const [currentTaskId, setCurrentTaskId] = useState<string | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch daftar tugas teknisi saat mount
  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Fetch semua tugas yang dialokasikan ke Teknisi yang login
      const data = await api.listRequests({ assigned_to: user?.id });
      setRequests(data);
    } catch (err: any) {
      console.error('Gagal mengambil data tugas teknisi:', err);
      setError('Gagal memuat tugas perbaikan dari server.');
    } finally {
      setIsLoading(false);
    }
  };

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

  // 1. Memulai Pengerjaan Tugas (ASSIGNED -> IN_PROGRESS)
  const handleStartTask = async (taskId: string) => {
    try {
      setIsLoading(true);
      await api.updateStatus(taskId, 'IN_PROGRESS', 'Teknisi memulai perbaikan fisik di lokasi.');
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
    if (!resolutionNotes.trim()) {
      setSubmitError('Catatan penyelesaian teknis wajib diisi.');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);
    try {
      if (currentTaskId) {
        await api.updateStatus(currentTaskId, 'RESOLVED', resolutionNotes.trim());
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

  // Filter tugas berdasarkan selectedBuilding dari Peta Kampus
  const filteredTasks = selectedBuilding
    ? requests.filter(req => req.location.toLowerCase().includes(selectedBuilding.toLowerCase()))
    : requests;

  return (
    <div style={localStyles.layoutWrapper}>
      
      {/* HEADER GLASS (Sticky) */}
      <header className="glass-card-strong" style={localStyles.header}>
        <div style={localStyles.headerBrand}>
          <span style={{ fontSize: '24px' }}>🏛</span>
          <div>
            <h2 style={localStyles.headerTitle}>Tugas Perbaikan</h2>
            <p style={localStyles.headerSubtitle}>Daftar Penugasan Kerja</p>
          </div>
        </div>

        <div style={localStyles.headerMeta}>
          <span style={localStyles.userBadge}>
            👤 {user?.name} (TEKNISI)
          </span>
          <ThemeToggle />
          <button onClick={handleLogout} style={localStyles.logoutBtn}>
            🚪
          </button>
        </div>
      </header>

      {/* MAP & LIST CONTENT */}
      <div style={localStyles.contentContainer}>
        
        {/* TOP HALF: CAMPUS MAP VIEW (60% Viewport Height) */}
        <section style={localStyles.mapSection}>
          <CampusMap 
            requests={requests}
            selectedBuilding={selectedBuilding}
            onSelectBuilding={setSelectedBuilding}
          />
        </section>

        {/* BOTTOM HALF: TASK LIST (40% Viewport Height) */}
        <section style={localStyles.tasksSection}>
          <div style={localStyles.sectionHeader}>
            <h3 className="text-heading" style={{ color: '#fff' }}>
              {selectedBuilding ? `Tugas di ${selectedBuilding}` : 'Semua Tugasmu'} ({filteredTasks.length})
            </h3>
            {selectedBuilding && (
              <button 
                onClick={() => setSelectedBuilding(null)}
                className="btn-glass"
                style={{ padding: '6px 12px', fontSize: '11px' }}
              >
                Lihat Semua
              </button>
            )}
          </div>

          {isLoading ? (
            <div style={localStyles.loadingCenter}>
              <div className="shimmer" style={{ width: '280px', height: '140px', borderRadius: '20px' }}></div>
              <div className="shimmer" style={{ width: '280px', height: '140px', borderRadius: '20px' }}></div>
            </div>
          ) : error ? (
            <p style={{ color: 'var(--accent-rose)', fontSize: '14px' }}>{error}</p>
          ) : filteredTasks.length === 0 ? (
            <div style={localStyles.emptyCenter}>
              <span style={{ fontSize: '32px' }}>🎉</span>
              <p style={{ color: 'var(--text-muted)', fontSize: '13.5px', marginTop: '6px' }}>
                {selectedBuilding ? `Tidak ada tugas aktif di ${selectedBuilding}.` : 'Semua tugas selesai! Pekerjaan bagus.'}
              </p>
            </div>
          ) : (
            <div className="swipe-container" style={localStyles.swipeContainer}>
              {filteredTasks.map(task => (
                <div key={task.id} className="glass-card swipe-card" style={localStyles.taskCard}>
                  <div style={localStyles.cardHeader}>
                    <span style={localStyles.taskNumber}>{task.request_number}</span>
                    <span className={`status-badge status-${task.status.toLowerCase().replace('_', '-')}`}>
                      {task.status.replace('_', ' ')}
                    </span>
                  </div>

                  <h4 style={localStyles.taskTitle}>{task.title}</h4>
                  <p style={localStyles.taskLocation}>📍 Lokasi: <strong>{task.location}</strong></p>

                  <div style={localStyles.cardFooter}>
                    {task.status === 'ASSIGNED' && (
                      <button 
                        onClick={() => handleStartTask(task.id)}
                        className="btn-primary" 
                        style={localStyles.actionBtn}
                      >
                        Mulai →
                      </button>
                    )}
                    {task.status === 'IN_PROGRESS' && (
                      <button 
                        onClick={() => openResolvedModal(task.id)}
                        className="btn-primary" 
                        style={{ ...localStyles.actionBtn, background: 'linear-gradient(135deg, var(--status-resolved), var(--accent-teal))' }}
                      >
                        Selesai
                      </button>
                    )}
                    {['RESOLVED', 'CLOSED'].includes(task.status) && (
                      <span style={localStyles.doneText}>Selesai dikerjakan ✓</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

      </div>

      {/* MODAL PROMPT RESOLVED TASK (IN_PROGRESS -> RESOLVED) */}
      {showResolvedModal && (
        <div style={localStyles.modalOverlay}>
          <div className="glass-card-strong animate-in" style={localStyles.modalCard}>
            <h3 className="text-heading" style={{ color: '#fff', marginBottom: '14px' }}>Penyelesaian Perbaikan</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '20px' }}>
              Tulis laporan singkat/catatan teknis mengenai hasil tindakan perbaikan fisik yang telah Anda selesaikan.
            </p>

            {submitError && (
              <p style={{ color: 'var(--accent-rose)', fontSize: '12.5px', marginBottom: '12px' }}>⚠️ {submitError}</p>
            )}

            <form onSubmit={handleCompleteTaskSubmit}>
              <textarea
                placeholder="Contoh: Mengganti kapasitor AC yang bocor di ruang kelas GK1 Lantai 3. AC sekarang dingin dan normal."
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
                disabled={isSubmitting}
                className="neu-input"
                style={{ minHeight: '110px', resize: 'vertical', marginBottom: '24px' }}
                required
              />

              <div style={localStyles.modalButtons}>
                <button 
                  type="button" 
                  onClick={() => setShowResolvedModal(false)}
                  className="btn-glass"
                  disabled={isSubmitting}
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  className="btn-primary"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Menyimpan...' : 'Simpan Selesai'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

// Local Styles
const localStyles: Record<string, React.CSSProperties> = {
  layoutWrapper: {
    minHeight: '100vh',
    backgroundColor: '#0A090F',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    zIndex: 1,
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '14px 24px',
    borderRadius: '0 0 20px 20px',
    borderTop: 'none',
    borderLeft: 'none',
    borderRight: 'none',
    position: 'sticky',
    top: 0,
    zIndex: 50,
  },
  headerBrand: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    color: '#fff',
  },
  headerTitle: {
    fontFamily: "'Outfit', sans-serif",
    fontSize: '16px',
    fontWeight: '700',
    margin: 0,
    lineHeight: '1.2',
  },
  headerSubtitle: {
    fontSize: '11px',
    color: 'var(--text-muted)',
    margin: 0,
  },
  headerMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  userBadge: {
    fontSize: '12px',
    color: '#cbd5e1',
    fontWeight: '600',
  },
  logoutBtn: {
    background: 'none',
    border: 'none',
    fontSize: '18px',
    cursor: 'pointer',
    padding: '4px',
  },
  contentContainer: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    padding: '16px 20px 80px',
    gap: '16px',
  },
  mapSection: {
    flex: '6 0 260px',
    minHeight: '260px',
  },
  tasksSection: {
    flex: '4 0 220px',
    display: 'flex',
    flexDirection: 'column',
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px',
  },
  swipeContainer: {
    display: 'flex',
    gap: '14px',
    overflowX: 'auto',
    paddingBottom: '8px',
  },
  taskCard: {
    flex: '0 0 260px',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    minHeight: '150px',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  taskNumber: {
    fontFamily: 'monospace',
    fontSize: '11px',
    color: 'var(--accent-amber)',
    fontWeight: '600',
  },
  taskTitle: {
    fontSize: '14.5px',
    fontWeight: '600',
    color: '#f8fafc',
    margin: '12px 0 6px 0',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  taskLocation: {
    fontSize: '12.5px',
    color: 'var(--text-secondary)',
    margin: '0 0 16px 0',
  },
  cardFooter: {
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  actionBtn: {
    padding: '8px 18px',
    fontSize: '13px',
    borderRadius: '12px',
  },
  doneText: {
    fontSize: '12.5px',
    color: 'var(--status-resolved)',
    fontWeight: '600',
  },
  loadingCenter: {
    display: 'flex',
    gap: '16px',
    overflowX: 'hidden',
  },
  emptyCenter: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '30px 0',
    textAlign: 'center',
  },
  modalOverlay: {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    backdropFilter: 'blur(8px)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 200,
    padding: '20px',
  },
  modalCard: {
    width: '100%',
    maxWidth: '440px',
    padding: '32px 24px',
    boxShadow: '0 20px 40px rgba(0,0,0,0.7)',
  },
  modalButtons: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
  },
};
