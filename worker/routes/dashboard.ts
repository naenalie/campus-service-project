// worker/routes/dashboard.ts
// Implementasi router statistik dashboard untuk Administrator & Manajer Fasilitas

import type { Env, User, ApiResponse } from '../types';
import { getDashboardSummary } from '../db/queries';

const jsonHeaders = { 'Content-Type': 'application/json' };

/**
 * Handler utama untuk route /api/dashboard/*
 */
export async function handleDashboardRoutes(
  request: Request, 
  env: Env, 
  url: URL, 
  user: User
): Promise<Response> {
  const { pathname } = url;
  const method = request.method;

  // Proteksi RBAC: Hanya role ADMIN dan MANAJER yang diizinkan mengakses data statistik
  if (user.role !== 'ADMIN' && user.role !== 'MANAJER') {
    const res: ApiResponse<null> = { success: false, error: 'Akses ditolak. Dashboard statistik hanya boleh diakses oleh Admin atau Manajer Fasilitas.' };
    return new Response(JSON.stringify(res), { status: 403, headers: jsonHeaders });
  }

  try {
    // -------------------------------------------------------------
    // GET /api/dashboard/summary - Ringkasan performa fasilitas
    // -------------------------------------------------------------
    if (method === 'GET' && pathname === '/api/dashboard/summary') {
      // Ambil metrik dasar dari query library
      const summary = await getDashboardSummary(env.DB);

      // Hitung breakdown berdasarkan prioritas (LOW, MEDIUM, HIGH, CRITICAL)
      const priorityRows = await env.DB
        .prepare('SELECT priority, COUNT(*) as count FROM service_requests GROUP BY priority')
        .all<{ priority: string; count: number }>();
      
      const by_priority: Record<string, number> = {
        LOW: 0,
        MEDIUM: 0,
        HIGH: 0,
        CRITICAL: 0
      };
      for (const r of priorityRows.results || []) {
        by_priority[r.priority.toUpperCase()] = r.count;
      }

      // Hitung tiket "overdue" (status IN_PROGRESS yang didiamkan > 7 hari)
      const overdueRow = await env.DB
        .prepare(`
          SELECT COUNT(*) as count 
          FROM service_requests 
          WHERE status = 'IN_PROGRESS' 
            AND updated_at < datetime('now', '-7 days')
        `)
        .first<{ count: number }>();
      
      const overdue_count = overdueRow ? overdueRow.count : 0;

      const res: ApiResponse<any> = {
        success: true,
        data: {
          total_requests: summary.total,
          by_status: summary.by_status,
          by_category: summary.by_category,
          by_priority,
          recent_requests: summary.recent_requests,
          overdue_count
        }
      };
      return new Response(JSON.stringify(res), { status: 200, headers: jsonHeaders });
    }

    return new Response(
      JSON.stringify({ success: false, error: 'Endpoint dashboard tidak ditemukan' }), 
      { status: 404, headers: jsonHeaders }
    );
  } catch (error) {
    console.error(`Dashboard route error [${method} ${pathname}]:`, error);
    const res: ApiResponse<null> = { 
      success: false, 
      error: 'Terjadi kesalahan saat menghitung agregat dashboard. Silakan coba lagi.' 
    };
    return new Response(JSON.stringify(res), { status: 500, headers: jsonHeaders });
  }
}
