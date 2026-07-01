// worker/routes/requests.ts
// Implementasi router laporan keluhan (service requests)

import type { Env, User, ApiResponse } from '../types';
import { validateCreateRequest, validateComment, validateUpdateStatus } from '../middleware/validation';
import { 
  getAllRequests, 
  getRequestById, 
  createRequest, 
  getRequestHistory, 
  getCommentsByRequest, 
  createComment,
  updateRequestStatus,
  assignRequest
} from '../db/queries';

const jsonHeaders = { 'Content-Type': 'application/json' };

/**
 * Handler utama untuk route /api/requests/*
 */
export async function handleRequestRoutes(
  request: Request, 
  env: Env, 
  url: URL, 
  user: User
): Promise<Response> {
  const { pathname } = url;
  const method = request.method;

  try {
    // -------------------------------------------------------------
    // GET /api/requests - Ambil semua laporan dengan filter
    // -------------------------------------------------------------
    if (method === 'GET' && pathname === '/api/requests') {
      const status = url.searchParams.get('status');
      const category = url.searchParams.get('category');
      const priority = url.searchParams.get('priority');
      const assigned_to = url.searchParams.get('assigned_to');
      const keyword = url.searchParams.get('keyword');

      const filters: any = {};
      if (status) filters.status = status;
      if (category) filters.category = category;
      if (priority) filters.priority = priority;
      if (assigned_to) filters.assigned_to = assigned_to;
      if (keyword) filters.keyword = keyword;

      // PELAPOR hanya boleh melihat laporannya sendiri
      if (user.role === 'PELAPOR') {
        filters.reporter_id = user.id;
      }

      const requests = await getAllRequests(env.DB, filters);
      
      const res: ApiResponse<any[]> = {
        success: true,
        data: requests
      };
      return new Response(JSON.stringify(res), { status: 200, headers: jsonHeaders });
    }

    // -------------------------------------------------------------
    // POST /api/requests - Membuat laporan baru
    // -------------------------------------------------------------
    if (method === 'POST' && pathname === '/api/requests') {
      if (user.role !== 'PELAPOR') {
        const res: ApiResponse<null> = { success: false, error: 'Hanya pelapor yang diizinkan membuat laporan baru.' };
        return new Response(JSON.stringify(res), { status: 403, headers: jsonHeaders });
      }

      let body: any;
      try {
        body = await request.json();
      } catch (err) {
        const res: ApiResponse<null> = { success: false, error: 'Request body harus berupa JSON valid' };
        return new Response(JSON.stringify(res), { status: 400, headers: jsonHeaders });
      }

      // Validasi input form
      const validation = validateCreateRequest(body);
      if (!validation.valid) {
        const res: ApiResponse<null> = { success: false, error: validation.errors.join(', ') };
        return new Response(JSON.stringify(res), { status: 422, headers: jsonHeaders });
      }

      // Simpan laporan ke DB (sekaligus logging history awal)
      const newRequest = await createRequest(env.DB, body, user.id);

      const res: ApiResponse<any> = {
        success: true,
        message: 'Laporan berhasil dibuat',
        data: newRequest
      };
      return new Response(JSON.stringify(res), { status: 201, headers: jsonHeaders });
    }

    // -------------------------------------------------------------
    // URL Parsing untuk parameter path id (:id)
    // -------------------------------------------------------------
    // Format path: /api/requests/:id atau /api/requests/:id/comments atau /api/requests/:id/history
    const parts = pathname.split('/');
    if (parts.length >= 4 && parts[1] === 'api' && parts[2] === 'requests') {
      const id = parts[3];

      // Verifikasi keberadaan laporan terlebih dahulu
      const requestData = await getRequestById(env.DB, id);
      if (!requestData) {
        const res: ApiResponse<null> = { success: false, error: `Laporan keluhan dengan ID tersebut tidak ditemukan.` };
        return new Response(JSON.stringify(res), { status: 404, headers: jsonHeaders });
      }

      // Otorisasi kepemilikan data: PELAPOR dilarang mengakses laporan milik user lain
      if (user.role === 'PELAPOR' && requestData.reporter_id !== user.id) {
        const res: ApiResponse<null> = { success: false, error: 'Akses ditolak. Anda tidak memiliki izin mengakses data laporan ini.' };
        return new Response(JSON.stringify(res), { status: 403, headers: jsonHeaders });
      }

      // -------------------------------------------------------------
      // GET /api/requests/:id - Detail lengkap laporan
      // -------------------------------------------------------------
      if (method === 'GET' && parts.length === 4) {
        const comments = await getCommentsByRequest(env.DB, id);
        const history = await getRequestHistory(env.DB, id);

        const res: ApiResponse<any> = {
          success: true,
          data: {
            ...requestData,
            comments,
            status_history: history
          }
        };
        return new Response(JSON.stringify(res), { status: 200, headers: jsonHeaders });
      }

      // -------------------------------------------------------------
      // POST /api/requests/:id/comments - Tambah Komentar baru
      // -------------------------------------------------------------
      if (method === 'POST' && parts.length === 5 && parts[4] === 'comments') {
        // Cek rule BR-05 (Read-only Closed Tickets)
        if (requestData.status === 'CLOSED') {
          const res: ApiResponse<null> = { success: false, error: 'Aksi ditolak. Laporan ini telah ditutup (Closed) dan bersifat read-only.' };
          return new Response(JSON.stringify(res), { status: 422, headers: jsonHeaders });
        }

        let body: any;
        try {
          body = await request.json();
        } catch (err) {
          const res: ApiResponse<null> = { success: false, error: 'Request body harus berupa JSON valid' };
          return new Response(JSON.stringify(res), { status: 400, headers: jsonHeaders });
        }

        // Validasi format komentar
        const validation = validateComment(body);
        if (!validation.valid) {
          const res: ApiResponse<null> = { success: false, error: validation.errors.join(', ') };
          return new Response(JSON.stringify(res), { status: 422, headers: jsonHeaders });
        }

        const newComment = await createComment(env.DB, id, user.id, body.content);

        const res: ApiResponse<any> = {
          success: true,
          message: 'Komentar berhasil ditambahkan',
          data: newComment
        };
        return new Response(JSON.stringify(res), { status: 201, headers: jsonHeaders });
      }

      // -------------------------------------------------------------
      // PATCH /api/requests/:id/confirm - Konfirmasi hasil oleh pelapor
      // -------------------------------------------------------------
      if (method === 'PATCH' && parts.length === 5 && parts[4] === 'confirm') {
        if (user.role !== 'PELAPOR') {
          const res: ApiResponse<null> = { success: false, error: 'Hanya pelapor yang dapat mengonfirmasi hasil perbaikan.' };
          return new Response(JSON.stringify(res), { status: 403, headers: jsonHeaders });
        }

        if (requestData.reporter_id !== user.id) {
          const res: ApiResponse<null> = { success: false, error: 'Akses ditolak. Anda hanya dapat mengonfirmasi laporan milik sendiri.' };
          return new Response(JSON.stringify(res), { status: 403, headers: jsonHeaders });
        }

        if (requestData.status !== 'RESOLVED') {
          const res: ApiResponse<null> = { success: false, error: 'Konfirmasi hanya dapat dilakukan pada laporan berstatus Resolved.' };
          return new Response(JSON.stringify(res), { status: 422, headers: jsonHeaders });
        }

        let body: any;
        try {
          body = await request.json();
        } catch (err) {
          const res: ApiResponse<null> = { success: false, error: 'Request body harus berupa JSON valid' };
          return new Response(JSON.stringify(res), { status: 400, headers: jsonHeaders });
        }

        const confirmed = body.confirmed === true;
        const rejectionNotes = typeof body.rejection_notes === 'string' ? body.rejection_notes.trim() : '';

        if (!confirmed && rejectionNotes.length < 10) {
          const res: ApiResponse<null> = { success: false, error: 'Catatan penolakan minimal 10 karakter.' };
          return new Response(JSON.stringify(res), { status: 422, headers: jsonHeaders });
        }

        const newStatus = confirmed ? 'CLOSED' : 'UNDER_REVIEW';
        const note = confirmed
          ? 'Pelapor mengonfirmasi hasil perbaikan dan laporan ditutup.'
          : `Pelapor menolak hasil perbaikan: ${rejectionNotes}`;

        const updatedRequest = await env.DB.batch([
          env.DB
            .prepare('UPDATE service_requests SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
            .bind(newStatus, id),
          env.DB
            .prepare(`
              INSERT INTO status_history (id, request_id, old_status, new_status, changed_by, note)
              VALUES (?, ?, ?, ?, ?, ?)
            `)
            .bind(crypto.randomUUID(), id, requestData.status, newStatus, user.id, note)
        ]).then(async () => getRequestById(env.DB, id));

        const res: ApiResponse<any> = {
          success: true,
          message: confirmed ? 'Konfirmasi diterima. Laporan telah ditutup.' : 'Komplain diterima. Laporan dibuka kembali untuk ditinjau.',
          data: updatedRequest
        };
        return new Response(JSON.stringify(res), { status: 200, headers: jsonHeaders });
      }

      // -------------------------------------------------------------
      // GET /api/requests/:id/history - Log Transisi Status
      // -------------------------------------------------------------
      if (method === 'GET' && parts.length === 5 && parts[4] === 'history') {
        const history = await getRequestHistory(env.DB, id);
        
        const res: ApiResponse<any[]> = {
          success: true,
          data: history
        };
        return new Response(JSON.stringify(res), { status: 200, headers: jsonHeaders });
      }

      // -------------------------------------------------------------
      // PATCH /api/requests/:id/status - Update Status Laporan (BR-01, BR-02, BR-03, BR-04)
      // -------------------------------------------------------------
      if (method === 'PATCH' && parts.length === 5 && parts[4] === 'status') {
        let body: any;
        try {
          body = await request.json();
        } catch (err) {
          const res: ApiResponse<null> = { success: false, error: 'Request body harus berupa JSON valid' };
          return new Response(JSON.stringify(res), { status: 400, headers: jsonHeaders });
        }

        const newStatus = typeof body.new_status === 'string' ? body.new_status.trim().toUpperCase() : '';
        const note = typeof body.notes === 'string' ? body.notes.trim() : '';

        // Terapkan BR-02: Teknisi hanya boleh merubah tugas yang dialokasikan ke dirinya sendiri
        if (user.role === 'TEKNISI') {
          if (requestData.assigned_to !== user.id) {
            const res: ApiResponse<null> = { success: false, error: 'Akses ditolak. Anda hanya diperbolehkan memperbarui tugas yang ditugaskan kepada diri Anda sendiri.' };
            return new Response(JSON.stringify(res), { status: 403, headers: jsonHeaders });
          }
          if (newStatus !== 'IN_PROGRESS' && newStatus !== 'RESOLVED') {
            const res: ApiResponse<null> = { success: false, error: 'Aksi ditolak. Teknisi hanya diperbolehkan mengubah status menjadi In Progress atau Resolved.' };
            return new Response(JSON.stringify(res), { status: 403, headers: jsonHeaders });
          }
          // Terapkan BR-03: Catatan wajib diisi jika merubah status ke RESOLVED
          if (newStatus === 'RESOLVED' && !note) {
            const res: ApiResponse<null> = { success: false, error: 'Catatan penyelesaian teknis wajib diisi sebelum menandai perbaikan selesai (Resolved).' };
            return new Response(JSON.stringify(res), { status: 400, headers: jsonHeaders });
          }
        }

        // Terapkan BR-04: Pelapor dilarang merubah status via endpoint ini secara langsung
        if (user.role === 'PELAPOR') {
          const res: ApiResponse<null> = { success: false, error: 'Akses ditolak. Pelapor harus menggunakan endpoint konfirmasi untuk menutup tiket.' };
          return new Response(JSON.stringify(res), { status: 403, headers: jsonHeaders });
        }

        // Validasi transisi linier status (BR-01)
        const validation = validateUpdateStatus({
          current_status: requestData.status,
          new_status: newStatus
        });
        if (!validation.valid) {
          const res: ApiResponse<null> = { success: false, error: validation.errors.join(', ') };
          return new Response(JSON.stringify(res), { status: 422, headers: jsonHeaders });
        }

        // Terapkan BR-04 (Pencegahan tutup paksa jika belum Resolved)
        if (newStatus === 'CLOSED' && requestData.status !== 'RESOLVED') {
          const res: ApiResponse<null> = { success: false, error: 'Aksi ditolak. Laporan hanya boleh dipindahkan ke status Closed setelah perbaikan selesai (Resolved).' };
          return new Response(JSON.stringify(res), { status: 422, headers: jsonHeaders });
        }

        const updatedRequest = await updateRequestStatus(env.DB, id, newStatus as any, user.id, note);
        
        const res: ApiResponse<any> = {
          success: true,
          message: 'Status laporan berhasil diperbarui',
          data: updatedRequest
        };
        return new Response(JSON.stringify(res), { status: 200, headers: jsonHeaders });
      }

      // -------------------------------------------------------------
      // PATCH /api/requests/:id/assign - Alokasi Teknisi oleh Admin (BR-01, BR-02)
      // -------------------------------------------------------------
      if (method === 'PATCH' && parts.length === 5 && parts[4] === 'assign') {
        if (user.role !== 'ADMIN') {
          const res: ApiResponse<null> = { success: false, error: 'Akses ditolak. Hanya administrator yang dapat menugaskan teknisi.' };
          return new Response(JSON.stringify(res), { status: 403, headers: jsonHeaders });
        }

        let body: any;
        try {
          body = await request.json();
        } catch (err) {
          const res: ApiResponse<null> = { success: false, error: 'Request body harus berupa JSON valid' };
          return new Response(JSON.stringify(res), { status: 400, headers: jsonHeaders });
        }

        const technicianId = typeof body.assigned_to === 'string' ? body.assigned_to.trim() : '';
        if (!technicianId) {
          const res: ApiResponse<null> = { success: false, error: 'ID teknisi wajib diisi.' };
          return new Response(JSON.stringify(res), { status: 400, headers: jsonHeaders });
        }

        // Verifikasi bahwa user yang ditunjuk benar-benar merupakan TEKNISI aktif
        const techUser = await env.DB.prepare('SELECT id, name, role, is_active FROM users WHERE id = ?').bind(technicianId).first<any>();
        if (!techUser || techUser.role !== 'TEKNISI' || techUser.is_active === 0) {
          const res: ApiResponse<null> = { success: false, error: 'Teknisi yang ditunjuk tidak ditemukan atau statusnya tidak aktif.' };
          return new Response(JSON.stringify(res), { status: 422, headers: jsonHeaders });
        }

        // Cek linear transition (Hanya tiket UNDER_REVIEW yang bisa di-assign)
        if (requestData.status !== 'UNDER_REVIEW') {
          const res: ApiResponse<null> = { success: false, error: 'Aksi ditolak. Penugasan teknisi hanya dapat dilakukan ketika status tiket berada dalam peninjauan (Under Review).' };
          return new Response(JSON.stringify(res), { status: 422, headers: jsonHeaders });
        }

        const updatedRequest = await assignRequest(env.DB, id, technicianId, user.id);

        const res: ApiResponse<any> = {
          success: true,
          message: `Berhasil menugaskan ${techUser.name || 'teknisi'} untuk penanganan laporan`,
          data: updatedRequest
        };
        return new Response(JSON.stringify(res), { status: 200, headers: jsonHeaders });
      }

      // -------------------------------------------------------------
      // PATCH /api/requests/:id/confirm - Konfirmasi pelapor untuk penutupan tiket (BR-04, BR-05)
      // -------------------------------------------------------------
      if (method === 'PATCH' && parts.length === 5 && parts[4] === 'confirm') {
        let body: any;
        try {
          body = await request.json();
        } catch (err) {
          const res: ApiResponse<null> = { success: false, error: 'Request body harus berupa JSON valid' };
          return new Response(JSON.stringify(res), { status: 400, headers: jsonHeaders });
        }

        const { confirmed, rejection_notes } = body;
        
        // Verifikasi kepemilikan: Hanya pelapor asal yang boleh mengonfirmasi (atau admin)
        if (user.role === 'PELAPOR' && requestData.reporter_id !== user.id) {
          const res: ApiResponse<null> = { success: false, error: 'Akses ditolak. Anda hanya diperbolehkan mengonfirmasi laporan Anda sendiri.' };
          return new Response(JSON.stringify(res), { status: 403, headers: jsonHeaders });
        }

        // Terapkan aturan: Hanya bisa dikonfirmasi jika status saat ini RESOLVED
        if (requestData.status !== 'RESOLVED') {
          const res: ApiResponse<null> = { success: false, error: 'Aksi ditolak. Laporan hanya bisa dikonfirmasi jika statusnya sudah diselesaikan (Resolved).' };
          return new Response(JSON.stringify(res), { status: 422, headers: jsonHeaders });
        }

        let nextStatus: any;
        let note: string;

        if (confirmed) {
          nextStatus = 'CLOSED';
          note = 'Pelapor mengonfirmasi perbaikan selesai. Laporan ditutup.';
        } else {
          nextStatus = 'IN_PROGRESS'; // Kembali ke IN_PROGRESS untuk dikerjakan ulang oleh teknisi
          note = `Pelapor menolak hasil perbaikan. Alasan: ${rejection_notes || ''}`;
        }

        const updatedRequest = await updateRequestStatus(env.DB, id, nextStatus, user.id, note);

        const res: ApiResponse<any> = {
          success: true,
          message: confirmed ? 'Laporan berhasil dikonfirmasi dan ditutup' : 'Laporan ditolak dan dikembalikan untuk ditinjau',
          data: updatedRequest
        };
        return new Response(JSON.stringify(res), { status: 200, headers: jsonHeaders });
      }
    }

    return new Response(
      JSON.stringify({ success: false, error: 'Endpoint requests tidak ditemukan' }), 
      { status: 404, headers: jsonHeaders }
    );
  } catch (error) {
    console.error(`Requests route error [${method} ${pathname}]:`, error);
    const res: ApiResponse<null> = { 
      success: false, 
      error: 'Terjadi kesalahan internal pada server requests. Silakan coba lagi.' 
    };
    return new Response(JSON.stringify(res), { status: 500, headers: jsonHeaders });
  }
}
