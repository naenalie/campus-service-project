// worker/routes/technician.ts
// Implementasi router khusus Teknisi (TEKNISI)

import type { Env, User, ApiResponse } from '../types';
import { getAllRequests, getRequestById, updateRequestStatus } from '../db/queries';

const jsonHeaders = { 'Content-Type': 'application/json' };

const ALLOWED_TECH_STATUSES = ['IN_PROGRESS', 'RESOLVED'];

/**
 * Handler utama untuk route /api/teknisi/* dan aksi perubahan oleh TEKNISI
 */
export async function handleTechnicianRoutes(
  request: Request, 
  env: Env, 
  url: URL, 
  user: User
): Promise<Response> {
  const { pathname } = url;
  const method = request.method;

  // Proteksi RBAC: Hanya role TEKNISI yang diizinkan mengakses route ini
  if (user.role !== 'TEKNISI') {
    const res: ApiResponse<null> = { success: false, error: 'Akses ditolak. Endpoint ini hanya untuk Teknisi.' };
    return new Response(JSON.stringify(res), { status: 403, headers: jsonHeaders });
  }

  try {
    // -------------------------------------------------------------
    // GET /api/teknisi/tasks - Daftar tugas pengerjaan
    // -------------------------------------------------------------
    if (method === 'GET' && pathname === '/api/teknisi/tasks') {
      const status = url.searchParams.get('status');

      const filters: any = {
        assigned_to: user.id
      };
      if (status) {
        filters.status = status.toUpperCase();
      }

      let requests = await getAllRequests(env.DB, filters);
      if (!status) {
        requests = requests.filter(r => r.status !== 'CLOSED');
      }
      
      const res: ApiResponse<any[]> = {
        success: true,
        data: requests
      };
      return new Response(JSON.stringify(res), { status: 200, headers: jsonHeaders });
    }

    const parts = pathname.split('/');

    // -------------------------------------------------------------
    // PATCH /api/requests/:id/status atau /progress - Update progress perbaikan oleh Teknisi
    // -------------------------------------------------------------
    if (
      method === 'PATCH' &&
      parts.length === 5 &&
      parts[1] === 'api' &&
      parts[2] === 'requests' &&
      (parts[4] === 'progress' || parts[4] === 'status')
    ) {
      const id = parts[3];

      const requestData = await getRequestById(env.DB, id);
      if (!requestData) {
        const res: ApiResponse<null> = { success: false, error: 'Laporan keluhan tidak ditemukan.' };
        return new Response(JSON.stringify(res), { status: 404, headers: jsonHeaders });
      }

      // Terapkan BR-02: Teknisi dilarang mengubah tiket yang tidak dialokasikan ke dirinya sendiri
      if (requestData.assigned_to !== user.id) {
        const res: ApiResponse<null> = { success: false, error: 'Akses ditolak. Anda hanya diperbolehkan memperbarui tugas yang ditugaskan kepada diri Anda sendiri.' };
        return new Response(JSON.stringify(res), { status: 403, headers: jsonHeaders });
      }

      let body: any;
      try {
        body = await request.json();
      } catch (err) {
        const res: ApiResponse<null> = { success: false, error: 'Request body harus berupa JSON valid' };
        return new Response(JSON.stringify(res), { status: 400, headers: jsonHeaders });
      }

      const statusInput = body.status ?? body.new_status;
      const targetStatus = typeof statusInput === 'string' ? statusInput.trim().toUpperCase() : '';
      const note = typeof body.notes === 'string' ? body.notes.trim() : '';

      if (!targetStatus || !ALLOWED_TECH_STATUSES.includes(targetStatus)) {
        const res: ApiResponse<null> = { success: false, error: `Status progres tidak valid. Pilihan: ${ALLOWED_TECH_STATUSES.join(', ')}` };
        return new Response(JSON.stringify(res), { status: 400, headers: jsonHeaders });
      }

      // Terapkan BR-03: Catatan wajib diisi jika merubah status ke RESOLVED
      if (targetStatus === 'RESOLVED' && !note) {
        const res: ApiResponse<null> = { success: false, error: 'Catatan penyelesaian teknis wajib diisi sebelum menandai perbaikan selesai (Resolved).' };
        return new Response(JSON.stringify(res), { status: 400, headers: jsonHeaders });
      }

      // Terapkan BR-01: Verifikasi transisi linier status
      if (targetStatus === 'IN_PROGRESS' && requestData.status !== 'ASSIGNED') {
        const res: ApiResponse<null> = { success: false, error: "Transisi status tidak valid. Hanya keluhan berstatus 'Assigned' yang bisa diubah menjadi 'In Progress'." };
        return new Response(JSON.stringify(res), { status: 422, headers: jsonHeaders });
      }

      if (targetStatus === 'RESOLVED' && requestData.status !== 'IN_PROGRESS') {
        const res: ApiResponse<null> = { success: false, error: "Transisi status tidak valid. Hanya keluhan berstatus 'In Progress' yang bisa diubah menjadi 'Resolved'." };
        return new Response(JSON.stringify(res), { status: 422, headers: jsonHeaders });
      }

      // Jalankan update status perbaikan
      const updatedRequest = await updateRequestStatus(env.DB, id, targetStatus as any, user.id, note);

      const res: ApiResponse<any> = {
        success: true,
        message: `Progress laporan berhasil diperbarui menjadi ${targetStatus}.`,
        data: updatedRequest
      };
      return new Response(JSON.stringify(res), { status: 200, headers: jsonHeaders });
    }

    return new Response(
      JSON.stringify({ success: false, error: 'Endpoint teknisi tidak ditemukan' }), 
      { status: 404, headers: jsonHeaders }
    );
  } catch (error) {
    console.error(`Technician route error [${method} ${pathname}]:`, error);
    const res: ApiResponse<null> = { 
      success: false, 
      error: 'Terjadi kesalahan internal pada server teknisi. Silakan coba lagi.' 
    };
    return new Response(JSON.stringify(res), { status: 500, headers: jsonHeaders });
  }
}
