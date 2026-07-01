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

    // Health check — no auth needed (with DB roles & tickets self-healing/sync logic)
    if (pathname === '/api/health') {
      try {
        // Automatically sync roles in D1 remote database
        await env.DB.prepare("UPDATE users SET role = 'ADMIN' WHERE email = 'admin@test.com'").run();
        await env.DB.prepare("UPDATE users SET role = 'TEKNISI' WHERE email = 'teknisi@test.com'").run();
        await env.DB.prepare("UPDATE users SET role = 'MANAJER' WHERE email = 'manajer@test.com'").run();
        await env.DB.prepare("UPDATE users SET role = 'PELAPOR' WHERE email = 'pelapor@test.com'").run();
        
        // Sync reporter_id of seeded tickets with the actual ID of pelapor@test.com
        await env.DB.prepare(`
          UPDATE service_requests 
          SET reporter_id = (SELECT id FROM users WHERE email = 'pelapor@test.com' LIMIT 1)
          WHERE reporter_id = '89069f1c-5b7a-43e1-b5ea-ea2bb478c7c5' 
             OR reporter_id = 'ccbf7513-fe4c-44e7-b6a7-ccd55a4b1d3c'
        `).run();

        // Sync assigned_to of seeded tickets with the actual ID of teknisi@test.com
        await env.DB.prepare(`
          UPDATE service_requests 
          SET assigned_to = (SELECT id FROM users WHERE email = 'teknisi@test.com' LIMIT 1)
          WHERE assigned_to IS NOT NULL
        `).run();

        return json({ status: 'ok', message: 'Database remote synced successfully', timestamp: new Date().toISOString() });
      } catch (err: any) {
        return json({ status: 'error', error: err.message, timestamp: new Date().toISOString() }, 500);
      }
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

    if (pathname.startsWith('/api/requests')) {
      return handleRequestRoutes(request, env, url, user);
    }

    return json({ success: false, error: 'Route tidak ditemukan' }, 404);
  }
} satisfies ExportedHandler<Env>;
