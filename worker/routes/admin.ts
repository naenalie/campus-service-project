// worker/routes/admin.ts
// Implementasi router khusus administrator (ADMIN)

import { Env, User, ApiResponse } from '../types';
import { validateUpdateStatus } from '../middleware/validation';
import { 
  getRequestById, 
  updateRequestStatus, 
  assignRequest, 
  getUserById, 
  getAllUsers, 
  updateUserRole 
} from '../db/queries';

const jsonHeaders = { 'Content-Type': 'application/json' };

const VALID_PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
const VALID_ROLES = ['PELAPOR', 'ADMIN', 'TEKNISI', 'MANAJER'];

/**
 * Handler utama untuk route /api/admin/* dan aksi perubahan oleh ADMIN
 */
export async function handleAdminRoutes(
  request: Request, 
  env: Env, 
  url: URL, 
  user: User
): Promise<Response> {
  const { pathname } = url;
  const method = request.method;

  // Proteksi mutlak: Hanya role ADMIN yang boleh melintas
  if (user.role !== 'ADMIN') {
    const res: ApiResponse<null> = { success: false, error: 'Akses ditolak. Endpoint ini hanya untuk Administrator.' };
    return new Response(JSON.stringify(res), { status: 403, headers: jsonHeaders });
  }

  try {
    // -------------------------------------------------------------
    // GET /api/users - Daftar semua user
    // -------------------------------------------------------------
    if (method === 'GET' && pathname === '/api/users') {
      const users = await getAllUsers(env.DB);
      const res: ApiResponse<any[]> = {
        success: true,
        data: users
      };
      return new Response(JSON.stringify(res), { status: 200, headers: jsonHeaders });
    }

    const parts = pathname.split('/');
    
    // -------------------------------------------------------------
    // USER MANAGEMENT ACTION
    // -------------------------------------------------------------
    if (parts.length >= 4 && parts[1] === 'api' && parts[2] === 'users') {
      const targetUserId = parts[3];

      // PATCH /api/users/:id/role - Mengubah role user lain
      if (method === 'PATCH' && parts.length === 5 && parts[4] === 'role') {
        // Cegah admin merubah role-nya sendiri secara tidak sengaja (dapat me-lockout akses admin)
        if (targetUserId === user.id) {
          const res: ApiResponse<null> = { success: false, error: 'Kamu tidak bisa mengubah role akun kamu sendiri.' };
          return new Response(JSON.stringify(res), { status: 403, headers: jsonHeaders });
        }

        let body: any;
        try {
          body = await request.json();
        } catch (err) {
          const res: ApiResponse<null> = { success: false, error: 'Request body harus berupa JSON valid' };
          return new Response(JSON.stringify(res), { status: 400, headers: jsonHeaders });
        }

        const newRole = typeof body.role === 'string' ? body.role.trim().toUpperCase() : '';
        if (!newRole || !VALID_ROLES.includes(newRole)) {
          const res: ApiResponse<null> = { success: false, error: `Role tidak valid. Pilihan: ${VALID_ROLES.join(', ')}` };
          return new Response(JSON.stringify(res), { status: 400, headers: jsonHeaders });
        }

        const targetUser = await getUserById(env.DB, targetUserId);
        if (!targetUser) {
          const res: ApiResponse<null> = { success: false, error: 'User dengan ID tersebut tidak ditemukan.' };
          return new Response(JSON.stringify(res), { status: 404, headers: jsonHeaders });
        }

        const updatedUser = await updateUserRole(env.DB, targetUserId, newRole as any);
        const res: ApiResponse<any> = {
          success: true,
          message: 'Role pengguna berhasil diperbarui.',
          data: {
            id: updatedUser.id,
            name: updatedUser.name,
            email: updatedUser.email,
            role: updatedUser.role
          }
        };
        return new Response(JSON.stringify(res), { status: 200, headers: jsonHeaders });
      }

      // PATCH /api/users/:id/status - Menonaktifkan/Mengaktifkan kembali akun
      if (method === 'PATCH' && parts.length === 5 && parts[4] === 'status') {
        if (targetUserId === user.id) {
          const res: ApiResponse<null> = { success: false, error: 'Kamu tidak bisa menonaktifkan akun kamu sendiri.' };
          return new Response(JSON.stringify(res), { status: 403, headers: jsonHeaders });
        }

        let body: any;
        try {
          body = await request.json();
        } catch (err) {
          const res: ApiResponse<null> = { success: false, error: 'Request body harus berupa JSON valid' };
          return new Response(JSON.stringify(res), { status: 400, headers: jsonHeaders });
        }

        const isActive = body.is_active;
        if (isActive !== 0 && isActive !== 1) {
          const res: ApiResponse<null> = { success: false, error: 'Parameter is_active harus bernilai 0 (nonaktif) atau 1 (aktif).' };
          return new Response(JSON.stringify(res), { status: 400, headers: jsonHeaders });
        }

        const targetUser = await getUserById(env.DB, targetUserId);
        if (!targetUser) {
          const res: ApiResponse<null> = { success: false, error: 'User dengan ID tersebut tidak ditemukan.' };
          return new Response(JSON.stringify(res), { status: 404, headers: jsonHeaders });
        }

        await env.DB.prepare('UPDATE users SET is_active = ? WHERE id = ?').bind(isActive, targetUserId).run();
        // Hapus semua session token user ini jika dinonaktifkan
        if (isActive === 0) {
          await env.DB.prepare('DELETE FROM sessions WHERE user_id = ?').bind(targetUserId).run();
        }

        const res: ApiResponse<any> = {
          success: true,
          message: isActive === 1 ? 'Akun berhasil diaktifkan kembali.' : 'Akun berhasil dinonaktifkan.',
          data: {
            id: targetUser.id,
            name: targetUser.name,
            is_active: isActive
          }
        };
        return new Response(JSON.stringify(res), { status: 200, headers: jsonHeaders });
      }
    }

    // -------------------------------------------------------------
    // REQUEST TICKETS ACTIONS (ADMIN SCOPE)
    // -------------------------------------------------------------
    if (parts.length >= 4 && parts[1] === 'api' && parts[2] === 'requests') {
      const requestId = parts[3];

      const requestData = await getRequestById(env.DB, requestId);
      if (!requestData) {
        const res: ApiResponse<null> = { success: false, error: 'Laporan keluhan dengan ID tersebut tidak ditemukan.' };
        return new Response(JSON.stringify(res), { status: 404, headers: jsonHeaders });
      }

      // PATCH /api/requests/:id/status - Update Status keluhan (BR-01, BR-04, BR-05)
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

        // Validasi format & transisi linier status (BR-01)
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

        const updatedRequest = await updateRequestStatus(env.DB, requestId, newStatus as any, user.id, note);
        
        const res: ApiResponse<any> = {
          success: true,
          message: `Status laporan berhasil diperbarui menjadi ${newStatus}.`,
          data: updatedRequest
        };
        return new Response(JSON.stringify(res), { status: 200, headers: jsonHeaders });
      }

      // PATCH /api/requests/:id/assign - Mengalokasikan Teknisi (FR-04)
      if (method === 'PATCH' && parts.length === 5 && parts[4] === 'assign') {
        let body: any;
        try {
          body = await request.json();
        } catch (err) {
          const res: ApiResponse<null> = { success: false, error: 'Request body harus berupa JSON valid' };
          return new Response(JSON.stringify(res), { status: 400, headers: jsonHeaders });
        }

        const technicianId = typeof body.assigned_to === 'string' ? body.assigned_to.trim() : '';
        if (!technicianId) {
          const res: ApiResponse<null> = { success: false, error: 'Field assigned_to (ID teknisi) wajib dikirim.' };
          return new Response(JSON.stringify(res), { status: 400, headers: jsonHeaders });
        }

        // Verifikasi bahwa user target ada dan perannya TEKNISI
        const technician = await getUserById(env.DB, technicianId);
        if (!technician || technician.role !== 'TEKNISI') {
          const res: ApiResponse<null> = { success: false, error: 'User yang ditugaskan harus terdaftar dan memiliki role TEKNISI.' };
          return new Response(JSON.stringify(res), { status: 400, headers: jsonHeaders });
        }

        // Alokasi hanya boleh dilakukan saat laporan status UNDER_REVIEW
        if (requestData.status !== 'UNDER_REVIEW') {
          const res: ApiResponse<null> = { success: false, error: 'Aksi ditolak. Alokasi teknisi hanya diperbolehkan jika status laporan sedang ditinjau (Under Review).' };
          return new Response(JSON.stringify(res), { status: 422, headers: jsonHeaders });
        }

        const updatedRequest = await assignRequest(env.DB, requestId, technicianId, user.id);

        const res: ApiResponse<any> = {
          success: true,
          message: 'Teknisi berhasil dialokasikan untuk laporan ini.',
          data: updatedRequest
        };
        return new Response(JSON.stringify(res), { status: 200, headers: jsonHeaders });
      }

      // PATCH /api/requests/:id/priority - Merubah prioritas laporan keluhan (FR-03)
      if (method === 'PATCH' && parts.length === 5 && parts[4] === 'priority') {
        let body: any;
        try {
          body = await request.json();
        } catch (err) {
          const res: ApiResponse<null> = { success: false, error: 'Request body harus berupa JSON valid' };
          return new Response(JSON.stringify(res), { status: 400, headers: jsonHeaders });
        }

        const newPriority = typeof body.priority === 'string' ? body.priority.trim().toUpperCase() : '';
        if (!newPriority || !VALID_PRIORITIES.includes(newPriority)) {
          const res: ApiResponse<null> = { success: false, error: `Prioritas tidak valid. Pilihan: ${VALID_PRIORITIES.join(', ')}` };
          return new Response(JSON.stringify(res), { status: 400, headers: jsonHeaders });
        }

        // Jalankan query update priority
        await env.DB
          .prepare('UPDATE service_requests SET priority = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
          .bind(newPriority, requestId)
          .run();

        const updatedRequest = await getRequestById(env.DB, requestId);

        const res: ApiResponse<any> = {
          success: true,
          message: 'Tingkat prioritas laporan berhasil diubah.',
          data: updatedRequest
        };
        return new Response(JSON.stringify(res), { status: 200, headers: jsonHeaders });
      }
    }

    return new Response(
      JSON.stringify({ success: false, error: 'Endpoint admin tidak ditemukan' }), 
      { status: 404, headers: jsonHeaders }
    );
  } catch (error) {
    console.error(`Admin route error [${method} ${pathname}]:`, error);
    const res: ApiResponse<null> = { 
      success: false, 
      error: 'Terjadi kesalahan internal pada server admin. Silakan coba lagi.' 
    };
    return new Response(JSON.stringify(res), { status: 500, headers: jsonHeaders });
  }
}
