// src/pages/RequestDetailPage.tsx
// Halaman Detail Laporan Keluhan Kampus (FR-07, FR-09, FR-11) dengan RBAC Conditional Controls

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
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
    const notes = window.prompt('Masukkan catatan penyelesaian perbaikan:');
    if (notes === null) return;
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
      <div style={localStyles.pageContainer}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%', maxWidth: '640px' }}>
          <div style={{ background: '#D2DDD4', height: '140px', borderRadius: '40px' }}></div>
          <div style={{ background: '#D2DDD4', height: '240px', borderRadius: '40px' }}></div>
        </div>
      </div>
    );
  }

  if (error || !request) {
    return (
      <div style={localStyles.pageContainer}>
        <div className="nature-main-card" style={{ maxWidth: '480px', textAlign: 'center' }}>
          <span style={{ fontSize: '48px' }}>🚫</span>
          <h2 style={{ color: '#991B1B', margin: '14px 0 6px 0' }}>Laporan Tidak Ditemukan</h2>
          <p style={{ color: '#68776B', fontSize: '14px', marginBottom: '24px' }}>
            {error || 'Laporan keluhan yang Anda cari tidak tersedia di sistem.'}
          </p>
          <button onClick={handleBack} className="nature-pill active" style={{ width: '100%', justifyContent: 'center' }}>
            ← Kembali ke Beranda
          </button>
        </div>
      </div>
    );
  }

  const isClosed = request.status === 'CLOSED';

  return (
    <div style={localStyles.pageContainer}>
      
      {/* Top Navbar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', maxWidth: '640px', marginBottom: '24px', alignItems: 'center' }}>
        <button onClick={handleBack} className="nature-pill inactive">
          ← Kembali
        </button>
        <span className="glass-card" style={{ fontFamily: 'monospace', fontSize: '13px', fontWeight: '800', backgroundColor: 'rgba(255, 255, 255, 0.15)', padding: '8px 16px', borderRadius: '9999px', border: '1px solid rgba(255, 255, 255, 0.4)' }}>
          {request.request_number}
        </span>
      </div>

      <div style={{ width: '100%', maxWidth: '640px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* 1. HEADER CARD (INFO UTAMA) */}
        <div className="nature-main-card">
          <span className="nature-micro-label" style={{ color: '#8B5CF6' }}>TIKET KELUHAN</span>
          <h1 className="nature-huge-header" style={{ fontSize: '28px', margin: '4px 0 16px 0' }}>{request.title}</h1>
          
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '24px' }}>
            <span style={{ backgroundColor: '#101411', color: '#D4E875', fontSize: '11px', fontWeight: '800', padding: '6px 12px', borderRadius: '9999px', textTransform: 'uppercase' }}>
              {request.status.replace('_', ' ')}
            </span>
            <span style={{ backgroundColor: '#FEF3C7', color: '#B45309', fontSize: '11px', fontWeight: '800', padding: '6px 12px', borderRadius: '9999px', textTransform: 'uppercase' }}>
              ⚡ {request.priority}
            </span>
            <span style={{ backgroundColor: '#D1FAE5', color: '#047857', fontSize: '11px', fontWeight: '800', padding: '6px 12px', borderRadius: '9999px', textTransform: 'uppercase' }}>
              🔧 {request.category}
            </span>
          </div>

          <div style={{ borderTop: '1px solid #E0E8E1', paddingTop: '16px', fontSize: '14px', color: '#56665A', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <span>📍 Lokasi: <strong>{request.location}</strong></span>
            <span>🕒 Dilaporkan pada: <strong>{formatTime(request.created_at)}</strong></span>
          </div>
        </div>

        {/* 2. DESKRIPSI CARD */}
        <div className="nature-main-card">
          <span className="nature-micro-label">DESKRIPSI MASALAH</span>
          <p style={{ fontSize: '15px', color: '#101411', lineHeight: '1.6', margin: '8px 0 0 0' }}>{request.description}</p>
        </div>

        {/* 3. RIWAYAT TIMELINE STATUS */}
        <div className="nature-main-card">
          <span className="nature-micro-label">TIMELINE PENANGANAN</span>
          
          <div style={{ display: 'flex', flexDirection: 'column', marginTop: '16px' }}>
            {request.status_history?.map((h: any, index: number) => {
              const isLatest = index === request.status_history.length - 1;
              return (
                <div key={h.id} style={{ display: 'flex', gap: '16px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', width: '16px' }}>
                    <div 
                      style={{ 
                        width: '12px',
                        height: '12px',
                        borderRadius: '50%',
                        zIndex: 2,
                        marginTop: '6px',
                        backgroundColor: isLatest ? '#101411' : '#8E9A90',
                      }}
                    ></div>
                    {index < request.status_history.length - 1 && (
                      <div style={{ width: '2px', backgroundColor: '#C0D0C4', position: 'absolute', top: '18px', bottom: '-12px', zIndex: 1 }}></div>
                    )}
                  </div>
                  <div style={{ flex: 1, paddingBottom: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13.5px' }}>
                      <span style={{ fontWeight: '800', color: isLatest ? '#101411' : '#56665A' }}>
                        {h.new_status.replace('_', ' ')}
                      </span>
                      <span style={{ fontSize: '11px', color: '#8E9A90', fontWeight: '700' }}>{formatTime(h.changed_at)}</span>
                    </div>
                    {h.note && <p style={{ fontSize: '13px', color: '#68776B', margin: '4px 0 0 0', lineHeight: 1.4 }}>{h.note}</p>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 4. SEKSI KOMENTAR */}
        <div className="nature-main-card">
          <span className="nature-micro-label">DISKUSI & KOORDINASI</span>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', margin: '16px 0' }}>
            {request.comments?.length === 0 ? (
              <p style={{ fontSize: '13px', color: '#8E9A90', textAlign: 'center', padding: '12px 0' }}>Belum ada komentar.</p>
            ) : (
              request.comments?.map((c: any) => (
                <div key={c.id} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', backgroundColor: '#F3F7F4', padding: '16px', borderRadius: '24px' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#101411', color: '#D4E875', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: '800' }}>
                    {user?.id === c.user_id ? 'ME' : '👤'}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px', fontWeight: '700' }}>
                      <span style={{ color: '#101411' }}>{user?.id === c.user_id ? 'Anda' : 'Pengguna'}</span>
                      <span style={{ color: '#8E9A90' }}>{formatTime(c.created_at)}</span>
                    </div>
                    <p style={{ fontSize: '13.5px', color: '#56665A', margin: 0, lineHeight: 1.4 }}>{c.content}</p>
                  </div>
                </div>
              ))
            )}
          </div>

          {!isClosed ? (
            <form onSubmit={handleCommentSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px', borderTop: '1px solid #E0E8E1', paddingTop: '20px' }}>
              <textarea
                placeholder="Tulis komentar/catatan di sini..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                disabled={isSubmittingComment}
                style={{
                  padding: '12px 20px',
                  borderRadius: '24px',
                  border: '1.5px solid rgba(255, 255, 255, 0.4)',
                  backgroundColor: 'rgba(255, 255, 255, 0.15)',
                  color: 'inherit',
                  fontWeight: '600',
                  fontSize: '14px',
                  outline: 'none',
                  minHeight: '60px',
                  resize: 'vertical',
                  fontFamily: 'inherit'
                }}
                required
              />
              <button 
                type="submit" 
                disabled={isSubmittingComment}
                className="nature-pill active"
                style={{ alignSelf: 'flex-end', padding: '8px 16px', fontSize: '13px' }}
              >
                {isSubmittingComment ? 'Mengirim...' : 'Kirim →'}
              </button>
            </form>
          ) : (
            <p style={{ fontSize: '13px', color: '#8E9A90', textAlign: 'center', paddingTop: '12px' }}>🔒 Kolom diskusi telah dikunci karena tiket telah ditutup.</p>
          )}
        </div>

        {/* 5. ACTION CONTROL BAR */}
        {!isClosed && (
          <div className="nature-main-card" style={{ padding: '24px' }}>
            
            {/* AKSES PELAPOR & status RESOLVED */}
            {user?.role === 'PELAPOR' && request.status === 'RESOLVED' && (
              <div style={{ display: 'flex', gap: '16px' }}>
                <button 
                  onClick={handleConfirmAccept}
                  disabled={isActionLoading}
                  className="nature-pill active"
                  style={{ flex: 1, justifyContent: 'center' }}
                >
                  Setuju & Konfirmasi Selesai
                </button>
                <button 
                  onClick={() => setShowRejectModal(true)}
                  disabled={isActionLoading}
                  className="nature-pill inactive"
                  style={{ flex: 1, justifyContent: 'center', color: '#991B1B' }}
                >
                  Tidak Setuju & Komplain
                </button>
              </div>
            )}

            {/* AKSES ADMINISTRATOR (Dropdown controls) */}
            {user?.role === 'ADMIN' && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'center' }}>
                
                {/* 1. Dropdown Ubah Status */}
                <div style={{ position: 'relative' }}>
                  <button 
                    onClick={() => {
                      setShowStatusDropdown(!showStatusDropdown);
                      setShowAssignDropdown(false);
                      setShowPriorityDropdown(false);
                    }}
                    className="nature-pill inactive"
                  >
                    Ubah Status ▾
                  </button>
                  {showStatusDropdown && (
                    <div style={localStyles.dropdownMenu}>
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
                      className="nature-pill inactive"
                    >
                      Tugaskan Teknisi ▾
                    </button>
                    {showAssignDropdown && (
                      <div style={localStyles.dropdownMenu}>
                        {technicians.length === 0 ? (
                          <span style={{ padding: '10px 16px', color: '#8E9A90', fontSize: '12px' }}>Belum ada teknisi aktif</span>
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
                    className="nature-pill inactive"
                  >
                    Set Prioritas ▾
                  </button>
                  {showPriorityDropdown && (
                    <div style={localStyles.dropdownMenu}>
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
              <div style={{ display: 'flex', gap: '16px' }}>
                {request.status === 'ASSIGNED' && (
                  <button 
                    onClick={handleStartTaskTech}
                    disabled={isActionLoading}
                    className="nature-pill active"
                    style={{ width: '100%', justifyContent: 'center' }}
                  >
                    Mulai Pengerjaan Perbaikan →
                  </button>
                )}
                {request.status === 'IN_PROGRESS' && (
                  <button 
                    onClick={handleCompleteTaskTech}
                    disabled={isActionLoading}
                    className="nature-pill active"
                    style={{ width: '100%', justifyContent: 'center' }}
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
          <div className="nature-main-card" style={{ width: '100%', maxWidth: '440px' }}>
            <h3 style={{ fontSize: '22px', fontWeight: '800', margin: '0 0 8px 0' }}>Ajukan Ulang Perbaikan</h3>
            <p style={{ color: '#68776B', fontSize: '13px', marginBottom: '20px' }}>
              Berikan catatan penolakan mengenai bagian mana dari perbaikan yang belum selesai atau tidak memuaskan.
            </p>

            <form onSubmit={handleConfirmRejectSubmit}>
              <textarea
                placeholder="Contoh: AC masih mengeluarkan bunyi bising dan hembusan anginnya tetap hangat..."
                value={rejectionNotes}
                onChange={(e) => setRejectionNotes(e.target.value)}
                disabled={isActionLoading}
                style={{
                  padding: '12px 20px',
                  borderRadius: '24px',
                  border: '1.5px solid rgba(255, 255, 255, 0.4)',
                  backgroundColor: 'rgba(255, 255, 255, 0.15)',
                  color: 'inherit',
                  fontWeight: '600',
                  fontSize: '14px',
                  outline: 'none',
                  minHeight: '100px',
                  resize: 'vertical',
                  marginBottom: '24px',
                  width: '100%',
                  boxSizing: 'border-box'
                }}
                required
              />

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button 
                  type="button" 
                  onClick={() => setShowRejectModal(false)}
                  disabled={isActionLoading}
                  className="nature-pill inactive"
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  disabled={isActionLoading}
                  className="nature-pill active"
                  style={{ backgroundColor: '#991B1B', color: '#FFFFFF' }}
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

const localStyles: Record<string, React.CSSProperties> = {
  pageContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    minHeight: '100vh',
    width: '100%',
    backgroundColor: 'transparent',
    padding: '24px',
    boxSizing: 'border-box',
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
    backgroundColor: '#101411',
    borderRadius: '24px',
    boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
    overflow: 'hidden',
  },
  dropdownItem: {
    width: '100%',
    background: 'none',
    border: 'none',
    padding: '12px 20px',
    textAlign: 'left',
    color: '#FFFFFF',
    fontSize: '13px',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
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

if (typeof document !== 'undefined') {
  const styleTag = document.createElement('style');
  styleTag.innerHTML = `
    .dropdownItem:hover {
      background-color: #D4E875 !important;
      color: #101411 !important;
    }
  `;
  document.head.appendChild(styleTag);
}

