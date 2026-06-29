// src/pages/RequestDetailPage.tsx
// Halaman Detail Laporan Keluhan Kampus (FR-07, FR-09, FR-11) dengan RBAC Conditional Controls

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ThemeToggle } from '../components/ThemeToggle';
import * as api from '../services/api';

export const RequestDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Data States
  const [request, setRequest] = useState<any>(null);
  const [technicians, setTechnicians] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Comments & Actions State
  const [newComment, setNewComment] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);

  // Admin Custom Dropdowns UI State
  const [showPriorityDropdown, setShowPriorityDropdown] = useState(false);
  const [showAssignDropdown, setShowAssignDropdown] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);

  // Pelapor Rejection Modal
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionNotes, setRejectionNotes] = useState('');

  // Fetch detail saat mount
  useEffect(() => {
    fetchDetail();
    if (user?.role === 'ADMIN') {
      fetchTechnicians();
    }
  }, [id, user]);

  const fetchDetail = async () => {
    if (!id) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.getRequestDetail(id);
      setRequest(data);
    } catch (err: any) {
      console.error('Gagal mengambil detail keluhan:', err);
      setError(err.message || 'Laporan tidak ditemukan atau Anda tidak memiliki akses.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTechnicians = async () => {
    try {
      const data = await api.getTechnicians();
      setTechnicians(data);
    } catch (err) {
      console.error('Gagal mengambil daftar teknisi:', err);
    }
  };

  const handleBack = () => {
    if (user?.role === 'ADMIN') navigate('/admin');
    else if (user?.role === 'TEKNISI') navigate('/teknisi');
    else if (user?.role === 'MANAJER') navigate('/manajer');
    else navigate('/');
  };

  // 1. Submit Komentar Baru (FR-09)
  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !id) return;

    setIsSubmittingComment(true);
    try {
      await api.addComment(id, newComment.trim());
      setNewComment('');
      // Reload detail tiket untuk memuat list komentar terbaru
      const data = await api.getRequestDetail(id);
      setRequest(data);
    } catch (err: any) {
      console.error('Gagal menambah komentar:', err);
      alert(err.message || 'Gagal menambahkan komentar baru.');
    } finally {
      setIsSubmittingComment(false);
    }
  };

  // 2. Aksi Pelapor: Konfirmasi Setuju (RESOLVED -> CLOSED) (FR-07)
  const handleConfirmAccept = async () => {
    if (!id || isActionLoading) return;
    if (window.confirm('Apakah Anda setuju bahwa perbaikan ini telah diselesaikan dengan memuaskan?')) {
      setIsActionLoading(true);
      try {
        await api.confirmRequest(id, true);
        await fetchDetail();
      } catch (err: any) {
        alert(err.message || 'Gagal mengirim konfirmasi.');
      } finally {
        setIsActionLoading(false);
      }
    }
  };

  // 3. Aksi Pelapor: Kirim Tolak (RESOLVED -> Komplain Baru) (FR-07)
  const handleConfirmRejectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !rejectionNotes.trim() || isActionLoading) return;

    setIsActionLoading(true);
    try {
      await api.confirmRequest(id, false, rejectionNotes.trim());
      setShowRejectModal(false);
      await fetchDetail();
    } catch (err: any) {
      alert(err.message || 'Gagal mengirim penolakan.');
    } finally {
      setIsActionLoading(false);
    }
  };

  // 4. Aksi Admin: Ganti Prioritas (FR-03)
  const handleUpdatePriority = async (newPriority: string) => {
    if (!id) return;
    setIsActionLoading(true);
    setShowPriorityDropdown(false);
    try {
      // Simulasikan pemicu patch priority admin
      const response = await fetch(`/api/requests/${id}/priority`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({ priority: newPriority })
      });
      const resData = await response.json() as any;
      if (!response.ok || !resData.success) throw new Error(resData.error);
      
      await fetchDetail();
    } catch (err: any) {
      alert(err.message || 'Gagal mengubah prioritas.');
    } finally {
      setIsActionLoading(false);
    }
  };

  // 5. Aksi Admin: Assign Teknisi (FR-04)
  const handleAssignTechnician = async (techId: string) => {
    if (!id) return;
    setIsActionLoading(true);
    setShowAssignDropdown(false);
    try {
      await api.assignTechnician(id, techId);
      await fetchDetail();
    } catch (err: any) {
      alert(err.message || 'Gagal mengalokasikan teknisi.');
    } finally {
      setIsActionLoading(false);
    }
  };

  // 6. Aksi Admin: Ganti Status Manual (FR-03, FR-08)
  const handleUpdateStatusAdmin = async (targetStatus: string) => {
    if (!id) return;
    setIsActionLoading(true);
    setShowStatusDropdown(false);
    try {
      await api.updateStatus(id, targetStatus, 'Status diperbarui secara manual oleh Administrator.');
      await fetchDetail();
    } catch (err: any) {
      alert(err.message || 'Gagal memperbarui status.');
    } finally {
      setIsActionLoading(false);
    }
  };

  // 7. Aksi Teknisi: Mulai & Selesai (FR-05, FR-06)
  const handleStartTaskTech = async () => {
    if (!id || isActionLoading) return;
    setIsActionLoading(true);
    try {
      await api.updateStatus(id, 'IN_PROGRESS', 'Teknisi memulai pengerjaan perbaikan.');
      await fetchDetail();
    } catch (err: any) {
      alert(err.message || 'Gagal memperbarui progres.');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleCompleteTaskTech = () => {
    // Kita arahkan ke modal input penyelesaian yang di-handle di halaman atau prompt
    const notes = window.prompt('Masukkan catatan penyelesaian perbaikan:');
    if (notes === null) return; // cancel
    if (!notes.trim()) {
      alert('Catatan penyelesaian wajib diisi!');
      return;
    }
    
    setIsActionLoading(true);
    api.updateStatus(id!, 'RESOLVED', notes.trim())
      .then(() => fetchDetail())
      .catch((err) => alert(err.message || 'Gagal menandai tugas selesai.'))
      .finally(() => setIsActionLoading(false));
  };

  // Format Tanggal
  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('id-ID', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div style={localStyles.loadingContainer}>
        <div className="shimmer" style={{ width: '100%', height: '140px', borderRadius: '20px', marginBottom: '20px' }}></div>
        <div className="shimmer" style={{ width: '100%', height: '100px', borderRadius: '20px', marginBottom: '20px' }}></div>
        <div className="shimmer" style={{ width: '100%', height: '180px', borderRadius: '20px' }}></div>
      </div>
    );
  }

  if (error || !request) {
    return (
      <div style={localStyles.errorContainer}>
        <div className="glass-card-strong" style={localStyles.errorCard}>
          <span style={{ fontSize: '48px' }}>🚫</span>
          <h2 style={{ color: 'var(--accent-rose)', margin: '14px 0 6px 0' }}>Laporan Tidak Ditemukan</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '24px' }}>
            {error || 'Laporan keluhan yang Anda cari tidak tersedia di sistem.'}
          </p>
          <button onClick={handleBack} className="btn-glass">
            ← Kembali ke Beranda
          </button>
        </div>
      </div>
    );
  }

  const isClosed = request.status === 'CLOSED';

  return (
    <div style={localStyles.pageContainer}>
      
      {/* Top sticky navbar */}
      <div style={localStyles.topBar}>
        <button onClick={handleBack} className="btn-glass">
          ← Kembali
        </button>
        <span style={localStyles.ticketIdHeader}>{request.request_number}</span>
        <ThemeToggle />
      </div>

      <div className="animate-in" style={localStyles.contentWrapper}>
        
        {/* 1. HEADER CARD (INFO UTAMA) */}
        <div className="glass-card" style={localStyles.infoCard}>
          <h1 style={localStyles.ticketTitle}>{request.title}</h1>
          
          <div style={localStyles.badgesRow}>
            <span className={`status-badge status-${request.status.toLowerCase().replace('_', '-')}`}>
              {request.status.replace('_', ' ')}
            </span>
            <span style={{ ...localStyles.badgeText, backgroundColor: 'rgba(245, 158, 11, 0.1)', color: 'var(--accent-amber)' }}>
              ⚡ {request.priority}
            </span>
            <span style={{ ...localStyles.badgeText, backgroundColor: 'rgba(20, 184, 166, 0.1)', color: 'var(--accent-teal)' }}>
              🔧 {request.category}
            </span>
          </div>

          <div style={localStyles.metaDetails}>
            <p>📍 Lokasi: <strong>{request.location}</strong></p>
            <p>👤 Dilaporkan oleh: <strong>Gwen</strong> • {formatTime(request.created_at)}</p>
          </div>
        </div>

        {/* 2. DESKRIPSI CARD */}
        <div className="glass-card" style={localStyles.sectionCard}>
          <h3 style={localStyles.sectionTitle}>Deskripsi Kerusakan</h3>
          <p style={localStyles.descText}>{request.description}</p>
        </div>

        {/* 3. RIWAYAT TIMELINE STATUS */}
        <div className="glass-card" style={localStyles.sectionCard}>
          <h3 style={localStyles.sectionTitle}>Riwayat Penanganan Tiket</h3>
          
          <div style={localStyles.timeline}>
            {request.status_history?.map((h: any, index: number) => {
              const isLatest = index === request.status_history.length - 1;
              return (
                <div key={h.id} style={localStyles.timelineItem}>
                  <div style={localStyles.timelineLeft}>
                    <div 
                      style={{ 
                        ...localStyles.timelineDot,
                        backgroundColor: isLatest ? 'var(--accent-purple)' : 'var(--text-muted)',
                        boxShadow: isLatest ? '0 0 8px var(--accent-purple)' : 'none'
                      }}
                    ></div>
                    {index < request.status_history.length - 1 && <div style={localStyles.timelineLine}></div>}
                  </div>
                  <div style={localStyles.timelineRight}>
                    <div style={localStyles.timelineHeader}>
                      <span style={{ fontWeight: '600', color: isLatest ? '#fff' : 'var(--text-primary)' }}>
                        {h.new_status.replace('_', ' ')}
                      </span>
                      <span style={localStyles.timelineTime}>{formatTime(h.changed_at)}</span>
                    </div>
                    {h.note && <p style={localStyles.timelineNote}>{h.note}</p>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 4. SEKSI KOMENTAR */}
        <div className="glass-card" style={localStyles.sectionCard}>
          <h3 style={localStyles.sectionTitle}>Diskusi & Catatan Publik</h3>

          <div style={localStyles.commentsList}>
            {request.comments?.length === 0 ? (
              <p style={localStyles.emptyComments}>Belum ada komentar.</p>
            ) : (
              request.comments?.map((c: any) => (
                <div key={c.id} style={localStyles.commentItem}>
                  <div style={localStyles.avatar}>
                    {user?.id === c.user_id ? 'Me' : '👤'}
                  </div>
                  <div style={localStyles.commentContent}>
                    <div style={localStyles.commentHeader}>
                      <span style={localStyles.commentUser}>Pengguna</span>
                      <span style={localStyles.commentTime}>{formatTime(c.created_at)}</span>
                    </div>
                    <p style={localStyles.commentText}>{c.content}</p>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Form Kirim Komentar */}
          {!isClosed ? (
            <form onSubmit={handleCommentSubmit} style={localStyles.commentForm}>
              <textarea
                placeholder="Tulis komentar/catatan di sini..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                disabled={isSubmittingComment}
                className="neu-input"
                style={{ minHeight: '60px', padding: '10px 14px', resize: 'vertical' }}
                required
              />
              <button 
                type="submit" 
                disabled={isSubmittingComment}
                className="btn-primary"
                style={{ alignSelf: 'flex-end', padding: '8px 16px', fontSize: '13px' }}
              >
                {isSubmittingComment ? 'Mengirim...' : 'Kirim →'}
              </button>
            </form>
          ) : (
            <p style={localStyles.lockedText}>🔒 Kolom diskusi telah dikunci karena tiket telah ditutup.</p>
          )}
        </div>

        {/* 5. CONDITIONAL ACTION BUTTONS BAR */}
        {!isClosed && (
          <div className="glass-card-strong" style={localStyles.actionsBar}>
            
            {/* AKSES PELAPOR & status RESOLVED */}
            {user?.role === 'PELAPOR' && request.status === 'RESOLVED' && (
              <div style={localStyles.flexRow}>
                <button 
                  onClick={handleConfirmAccept}
                  disabled={isActionLoading}
                  className="btn-primary"
                  style={{ background: 'linear-gradient(135deg, var(--status-resolved), var(--accent-teal))', flex: 1 }}
                >
                  Setuju & Konfirmasi Selesai
                </button>
                <button 
                  onClick={() => setShowRejectModal(true)}
                  disabled={isActionLoading}
                  className="btn-glass"
                  style={{ borderColor: 'var(--accent-rose)', color: 'var(--accent-rose)', flex: 1 }}
                >
                  Tidak Setuju & Ajukan Ulang
                </button>
              </div>
            )}

            {/* AKSES ADMINISTRATOR (Dropdown controls) */}
            {user?.role === 'ADMIN' && (
              <div style={localStyles.adminActionsRow}>
                
                {/* 1. Dropdown Ubah Status */}
                <div style={{ position: 'relative' }}>
                  <button 
                    onClick={() => {
                      setShowStatusDropdown(!showStatusDropdown);
                      setShowAssignDropdown(false);
                      setShowPriorityDropdown(false);
                    }}
                    className="btn-glass"
                  >
                    Ubah Status ▾
                  </button>
                  {showStatusDropdown && (
                    <div className="glass-card-strong" style={localStyles.dropdownMenu}>
                      <button onClick={() => handleUpdateStatusAdmin('UNDER_REVIEW')} style={localStyles.dropdownItem}>UNDER REVIEW</button>
                      <button onClick={() => handleUpdateStatusAdmin('CLOSED')} style={localStyles.dropdownItem}>CLOSED (TUTUP)</button>
                    </div>
                  )}
                </div>

                {/* 2. Dropdown Assign Teknisi */}
                {request.status === 'UNDER_REVIEW' && (
                  <div style={{ position: 'relative' }}>
                    <button 
                      onClick={() => {
                        setShowAssignDropdown(!showAssignDropdown);
                        setShowStatusDropdown(false);
                        setShowPriorityDropdown(false);
                      }}
                      className="btn-glass"
                    >
                      Tugaskan Teknisi ▾
                    </button>
                    {showAssignDropdown && (
                      <div className="glass-card-strong" style={localStyles.dropdownMenu}>
                        {technicians.length === 0 ? (
                          <span style={localStyles.dropdownMuted}>Belum ada teknisi aktif</span>
                        ) : (
                          technicians.map(t => (
                            <button 
                              key={t.id} 
                              onClick={() => handleAssignTechnician(t.id)} 
                              style={localStyles.dropdownItem}
                            >
                              {t.name}
                            </button>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* 3. Dropdown Ubah Prioritas */}
                <div style={{ position: 'relative' }}>
                  <button 
                    onClick={() => {
                      setShowPriorityDropdown(!showPriorityDropdown);
                      setShowStatusDropdown(false);
                      setShowAssignDropdown(false);
                    }}
                    className="btn-glass"
                  >
                    Set Prioritas ▾
                  </button>
                  {showPriorityDropdown && (
                    <div className="glass-card-strong" style={localStyles.dropdownMenu}>
                      <button onClick={() => handleUpdatePriority('LOW')} style={localStyles.dropdownItem}>LOW</button>
                      <button onClick={() => handleUpdatePriority('MEDIUM')} style={localStyles.dropdownItem}>MEDIUM</button>
                      <button onClick={() => handleUpdatePriority('HIGH')} style={localStyles.dropdownItem}>HIGH</button>
                      <button onClick={() => handleUpdatePriority('CRITICAL')} style={localStyles.dropdownItem}>CRITICAL</button>
                    </div>
                  )}
                </div>

              </div>
            )}

            {/* AKSES TEKNISI (Jika tiket dialokasikan padanya) */}
            {user?.role === 'TEKNISI' && request.assigned_to === user.id && (
              <div style={localStyles.flexRow}>
                {request.status === 'ASSIGNED' && (
                  <button 
                    onClick={handleStartTaskTech}
                    disabled={isActionLoading}
                    className="btn-primary"
                    style={{ width: '100%' }}
                  >
                    Mulai Pengerjaan Perbaikan →
                  </button>
                )}
                {request.status === 'IN_PROGRESS' && (
                  <button 
                    onClick={handleCompleteTaskTech}
                    disabled={isActionLoading}
                    className="btn-primary"
                    style={{ width: '100%', background: 'linear-gradient(135deg, var(--status-resolved), var(--accent-teal))' }}
                  >
                    Tandai Perbaikan Selesai ✓
                  </button>
                )}
              </div>
            )}

          </div>
        )}

      </div>

      {/* MODAL PELAPOR: Input Catatan Penolakan (Tidak Setuju) */}
      {showRejectModal && (
        <div style={localStyles.modalOverlay}>
          <div className="glass-card-strong animate-in" style={localStyles.modalCard}>
            <h3 className="text-heading" style={{ color: '#fff', marginBottom: '12px' }}>Ajukan Ulang Perbaikan</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '16px' }}>
              Berikan catatan penolakan mengenai bagian mana dari perbaikan yang belum selesai atau tidak memuaskan.
            </p>

            <form onSubmit={handleConfirmRejectSubmit}>
              <textarea
                placeholder="Contoh: AC masih mengeluarkan bunyi bising dan hembusan anginnya tetap hangat..."
                value={rejectionNotes}
                onChange={(e) => setRejectionNotes(e.target.value)}
                disabled={isActionLoading}
                className="neu-input"
                style={{ minHeight: '100px', resize: 'vertical', marginBottom: '24px' }}
                required
              />

              <div style={localStyles.modalButtons}>
                <button 
                  type="button" 
                  onClick={() => setShowRejectModal(false)}
                  disabled={isActionLoading}
                  className="btn-glass"
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  disabled={isActionLoading}
                  className="btn-primary"
                  style={{ background: 'linear-gradient(135deg, var(--accent-rose), var(--accent-rose))' }}
                >
                  Kirim Komplain
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
  pageContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    minHeight: '100vh',
    width: '100vw',
    position: 'relative',
    padding: '80px 20px 40px 20px',
    zIndex: 1,
  },
  topBar: {
    position: 'absolute',
    top: '24px',
    left: '24px',
    right: '24px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 10,
  },
  ticketIdHeader: {
    fontFamily: 'monospace',
    fontSize: '15px',
    fontWeight: '700',
    color: '#fff',
    backgroundColor: 'rgba(255,255,255,0.04)',
    border: '1px solid var(--border-glass)',
    padding: '6px 16px',
    borderRadius: '12px',
  },
  contentWrapper: {
    width: '100%',
    maxWidth: '640px',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  infoCard: {
    padding: '28px 24px',
  },
  ticketTitle: {
    fontFamily: "'Outfit', sans-serif",
    fontSize: '22px',
    fontWeight: '700',
    color: '#fff',
    margin: '0 0 14px 0',
  },
  badgesRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '10px',
    marginBottom: '20px',
  },
  badgeText: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '4px 10px',
    borderRadius: 'var(--radius-pill)',
    fontSize: '12px',
    fontWeight: '600',
  },
  metaDetails: {
    borderTop: '1px solid var(--border-subtle)',
    paddingTop: '16px',
    fontSize: '13px',
    color: 'var(--text-secondary)',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  sectionCard: {
    padding: '24px',
  },
  sectionTitle: {
    fontFamily: "'Outfit', sans-serif",
    fontSize: '15px',
    fontWeight: '700',
    color: 'var(--accent-purple)',
    marginBottom: '16px',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
  },
  descText: {
    fontSize: '14px',
    color: '#f8fafc',
    lineHeight: '1.6',
  },
  timeline: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0',
  },
  timelineItem: {
    display: 'flex',
    gap: '16px',
  },
  timelineLeft: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    position: 'relative',
    width: '16px',
  },
  timelineDot: {
    width: '12px',
    height: '12px',
    borderRadius: '50%',
    zIndex: 2,
    marginTop: '6px',
  },
  timelineLine: {
    width: '2px',
    backgroundColor: 'var(--border-subtle)',
    position: 'absolute',
    top: '18px',
    bottom: '-12px',
    zIndex: 1,
  },
  timelineRight: {
    flex: 1,
    paddingBottom: '24px',
  },
  timelineHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '13.5px',
  },
  timelineTime: {
    fontSize: '11px',
    color: 'var(--text-muted)',
  },
  timelineNote: {
    fontSize: '12.5px',
    color: 'var(--text-secondary)',
    marginTop: '4px',
    margin: 0,
    lineHeight: '1.4',
  },
  commentsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    marginBottom: '20px',
  },
  emptyComments: {
    fontSize: '13px',
    color: 'var(--text-muted)',
    textAlign: 'center',
    padding: '12px 0',
  },
  commentItem: {
    display: 'flex',
    gap: '12px',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.02)',
    padding: '12px 16px',
    borderRadius: '12px',
    border: '1px solid var(--border-subtle)',
  },
  avatar: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    backgroundColor: 'var(--accent-purple)',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '11px',
    fontWeight: '700',
  },
  commentContent: {
    flex: 1,
  },
  commentHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '12px',
    marginBottom: '4px',
  },
  commentUser: {
    fontWeight: '600',
    color: 'var(--text-primary)',
  },
  commentTime: {
    color: 'var(--text-muted)',
  },
  commentText: {
    fontSize: '13px',
    color: '#cbd5e1',
    lineHeight: '1.4',
    margin: 0,
  },
  commentForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    borderTop: '1px solid var(--border-subtle)',
    paddingTop: '20px',
  },
  lockedText: {
    fontSize: '13px',
    color: 'var(--text-muted)',
    textAlign: 'center',
    paddingTop: '12px',
  },
  actionsBar: {
    padding: '20px 24px',
  },
  flexRow: {
    display: 'flex',
    gap: '16px',
  },
  adminActionsRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '12px',
    justifyContent: 'center',
  },
  dropdownMenu: {
    position: 'absolute',
    bottom: '48px',
    left: '50%',
    transform: 'translateX(-50%)',
    width: '180px',
    padding: '8px 0',
    zIndex: 10,
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 10px 20px rgba(0,0,0,0.5)',
  },
  dropdownItem: {
    width: '100%',
    background: 'none',
    border: 'none',
    padding: '10px 16px',
    textAlign: 'left',
    color: '#cbd5e1',
    fontSize: '12.5px',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  dropdownMuted: {
    padding: '10px 16px',
    color: 'var(--text-muted)',
    fontSize: '12px',
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    width: '100%',
    maxWidth: '640px',
    margin: '80px auto',
  },
  errorContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    padding: '20px',
  },
  errorCard: {
    maxWidth: '400px',
    width: '100%',
    textAlign: 'center',
    padding: '40px 24px',
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

// CSS Hover Highlight untuk Dropdown Items
if (typeof document !== 'undefined') {
  const styleTag = document.createElement('style');
  styleTag.innerHTML = `
    .dropdownItem:hover {
      background-color: rgba(255, 255, 255, 0.05);
      color: #fff;
    }
  `;
  document.head.appendChild(styleTag);
}
