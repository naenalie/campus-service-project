// src/pages/TechnicianPage.tsx
// Halaman Penugasan Kerja & Progress Teknisi (FR-05, FR-06) dengan Peta Kampus Interaktif

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

import { useAuth } from '../context/AuthContext';
import { CampusMap } from '../components/CampusMap';
import * as api from '../services/api';

export const TechnicianPage: React.FC = () => {
  const { user } = useAuth();

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
      
      {/* HEADER BANNER GLASS */}
      <header style={{ marginBottom: '28px' }}>
        <h1 className="nature-huge-header" style={{ fontSize: '32px', margin: 0 }}>
          Tugas Perbaikan (Teknisi) 🔧
        </h1>
        <p style={{ fontSize: '14px', color: '#68776B', marginTop: '4px', margin: 0 }}>
          Daftar Penugasan Kerja Sarana Kampus Universitas Klabat
        </p>
      </header>

      {/* MAP & LIST CONTENT */}
      <div style={localStyles.contentContainer}>
        
        {/* TOP HALF: CAMPUS MAP VIEW */}
        <section style={localStyles.mapSection}>
          <CampusMap 
            requests={requests}
            selectedBuilding={selectedBuilding}
            onSelectBuilding={setSelectedBuilding}
          />
        </section>

        {/* BOTTOM HALF: TASK LIST */}
        <section style={localStyles.tasksSection}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 className="nature-huge-header" style={{ fontSize: '22px', margin: 0 }}>
              {selectedBuilding ? `Tugas di ${selectedBuilding}` : 'Semua Tugasmu'} ({filteredTasks.length})
            </h3>
            {selectedBuilding && (
              <button 
                onClick={() => setSelectedBuilding(null)}
                className="nature-pill inactive"
                style={{ padding: '6px 12px', fontSize: '11px' }}
              >
                Lihat Semua
              </button>
            )}
          </div>

          {isLoading ? (
            <div style={{ display: 'flex', gap: '16px', overflowX: 'hidden' }}>
              <div className="glass-card" style={{ width: '280px', height: '140px', borderRadius: '32px' }}></div>
              <div className="glass-card" style={{ width: '280px', height: '140px', borderRadius: '32px' }}></div>
            </div>
          ) : error ? (
            <p style={{ color: '#DC2626', fontSize: '14px', fontWeight: '700' }}>{error}</p>
          ) : filteredTasks.length === 0 ? (
            <div className="glass-card" style={{ textAlign: 'center', padding: '40px 0', borderRadius: '40px' }}>
              <span style={{ fontSize: '32px' }}>🎉</span>
              <p style={{ color: '#68776B', fontSize: '14px', marginTop: '6px', fontWeight: '700', margin: 0 }}>
                {selectedBuilding ? `Tidak ada tugas aktif di ${selectedBuilding}.` : 'Semua tugas selesai! Pekerjaan bagus.'}
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '16px', overflowX: 'auto', paddingBottom: '12px' }}>
              {filteredTasks.map(task => (
                <div key={task.id} className="nature-main-card" style={{ flex: '0 0 280px', padding: '24px', boxSizing: 'border-box' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <span style={{ fontFamily: 'monospace', fontSize: '11px', color: '#8E9A90', fontWeight: '800' }}>{task.request_number}</span>
                    <span style={{ backgroundColor: '#101411', color: '#D4E875', fontSize: '10px', fontWeight: '800', padding: '4px 8px', borderRadius: '9999px', textTransform: 'uppercase' }}>
                      {task.status}
                    </span>
                  </div>

                  <h4 style={{ fontSize: '16px', fontWeight: '800', color: '#101411', margin: '0 0 8px 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{task.title}</h4>
                  <p style={{ fontSize: '13px', color: '#56665A', margin: '0 0 16px 0' }}>📍 Lokasi: <strong>{task.location}</strong></p>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Link to={`/requests/${task.id}`} style={{ textDecoration: 'none' }}>
                      <span style={{ fontSize: '12px', fontWeight: '800', color: '#101411', textDecoration: 'underline' }}>Detail Tiket</span>
                    </Link>
                    
                    {task.status === 'ASSIGNED' && (
                      <button 
                        onClick={() => handleStartTask(task.id)}
                        className="nature-pill active" 
                        style={{ padding: '8px 16px', fontSize: '12px' }}
                      >
                        Mulai →
                      </button>
                    )}
                    {task.status === 'IN_PROGRESS' && (
                      <button 
                        onClick={() => openResolvedModal(task.id)}
                        className="nature-pill active" 
                        style={{ padding: '8px 16px', fontSize: '12px', backgroundColor: '#047857' }}
                      >
                        Selesai
                      </button>
                    )}
                    {['RESOLVED', 'CLOSED'].includes(task.status) && (
                      <span style={{ fontSize: '12px', color: '#047857', fontWeight: '800' }}>Selesai ✓</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

      </div>

      {/* MODAL PROMPT RESOLVED TASK */}
      {showResolvedModal && (
        <div style={localStyles.modalOverlay}>
          <div className="nature-main-card" style={{ width: '100%', maxWidth: '440px' }}>
            <h3 style={{ fontSize: '22px', fontWeight: '800', margin: '0 0 8px 0' }}>Penyelesaian Perbaikan</h3>
            <p style={{ color: '#68776B', fontSize: '13px', marginBottom: '20px' }}>
              Tulis laporan singkat/catatan teknis mengenai hasil tindakan perbaikan fisik yang telah Anda selesaikan.
            </p>

            {submitError && (
              <p style={{ color: '#DC2626', fontSize: '13px', fontWeight: '700', marginBottom: '12px' }}>⚠️ {submitError}</p>
            )}

            <form onSubmit={handleCompleteTaskSubmit}>
              <textarea
                placeholder="Contoh: Mengganti kapasitor AC yang bocor di ruang kelas GK1 Lantai 3. AC sekarang dingin dan normal."
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
                disabled={isSubmitting}
                style={{
                  padding: '12px 20px',
                  borderRadius: '24px',
                  border: '2px solid #C0D0C4',
                  backgroundColor: '#FFFFFF',
                  color: '#101411',
                  fontWeight: '600',
                  fontSize: '14px',
                  outline: 'none',
                  minHeight: '110px',
                  resize: 'vertical',
                  marginBottom: '24px',
                  width: '100%',
                  boxSizing: 'border-box',
                  fontFamily: 'inherit'
                }}
                required
              />

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button 
                  type="button" 
                  onClick={() => setShowResolvedModal(false)}
                  className="nature-pill inactive"
                  disabled={isSubmitting}
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  className="nature-pill active"
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

const localStyles: Record<string, React.CSSProperties> = {
  layoutWrapper: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    boxSizing: 'border-box',
  },
  contentContainer: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    padding: '24px',
    gap: '24px',
    boxSizing: 'border-box',
  },
  mapSection: {
    flex: '6 0 280px',
    minHeight: '280px',
  },
  tasksSection: {
    flex: '4 0 220px',
    display: 'flex',
    flexDirection: 'column',
  },
  modalOverlay: {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 200,
    padding: '20px',
  },
};

