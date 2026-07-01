// worker/index.ts
// Router utama Cloudflare Workers (delegator API)

import { handleAuthRoutes } from './routes/auth';
import { handleRequestRoutes } from './routes/requests';
import { handleAdminRoutes } from './routes/admin';
import { handleTechnicianRoutes } from './routes/technician';
import { handleDashboardRoutes } from './routes/dashboard';
import { getAuthenticatedUser } from './middleware/auth';
import type { Env } from './types';

function json(data: unknown, status = 200) {
  return Response.json(data, { 
    status,
    headers: { 
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    } 
  });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const pathname = url.pathname;

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        }
      });
    }

    // Health check — no auth needed
    if (pathname === '/api/health') {
      return json({ status: 'ok', timestamp: new Date().toISOString() });
    }

    // Auth routes — no auth needed (register, login, me, logout)
    if (pathname.startsWith('/api/auth')) {
      return handleAuthRoutes(request, env, url);
    }

    // Semua route aplikasi di bawah butuh authentication (CR-02)
    const user = await getAuthenticatedUser(request, env.DB);
    if (!user) {
      return json({ success: false, error: 'Sesi tidak valid atau telah kedaluwarsa. Silakan login kembali.' }, 401);
    }

    // Routing delegasi ke handler masing-masing modul
    if (pathname.startsWith('/api/dashboard')) {
      return handleDashboardRoutes(request, env, url, user);
    }

    if (pathname.startsWith('/api/admin') || 
        pathname.startsWith('/api/users')) {
      return handleAdminRoutes(request, env, url, user);
    }

    if (pathname.startsWith('/api/teknisi')) {
      return handleTechnicianRoutes(request, env, url, user);
    }

    // Aksi mutasi tiket di bawah /api/requests perlu diarahkan ke handler role.
    // Handler umum tetap menangani create, list, detail, komentar, history, dan confirm.
    if (pathname.startsWith('/api/requests/') && request.method === 'PATCH') {
      const parts = pathname.split('/');
      const action = parts[4];

      if (['assign', 'priority'].includes(action) || (action === 'status' && user.role === 'ADMIN')) {
        return handleAdminRoutes(request, env, url, user);
      }

      if ((action === 'status' || action === 'progress') && user.role === 'TEKNISI') {
        return handleTechnicianRoutes(request, env, url, user);
      }
    }

    if (pathname.startsWith('/api/requests')) {
      return handleRequestRoutes(request, env, url, user);
    }

    return json({ success: false, error: 'Route tidak ditemukan' }, 404);
  }
} satisfies ExportedHandler<Env>;
