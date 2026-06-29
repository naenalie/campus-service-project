// worker/routes/requests.ts
// Implementasi router laporan keluhan (service requests)

import { Env, User, ApiResponse } from '../types';
import { validateCreateRequest, validateComment } from '../middleware/validation';
import { 
  getAllRequests, 
  getRequestById, 
  createRequest, 
  getRequestHistory, 
  getCommentsByRequest, 
  createComment 
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

      const filters: any = {};
      if (status) filters.status = status;
      if (category) filters.category = category;
      if (priority) filters.priority = priority;

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
