// worker/middleware/auth.ts
// Implementasi lengkap sistem autentikasi & otorisasi Cloudflare Workers (CR-02)

import type { User } from '../types';

/**
 * Generate Sesi Token UUID v4 secara acak
 */
export function generateToken(): string {
  return crypto.randomUUID();
}

/**
 * Hash password menggunakan Web Crypto API (SHA-256 dengan salt)
 */
export async function hashPassword(password: string): Promise<string> {
  // Generate random salt 16-byte
  const saltBytes = crypto.getRandomValues(new Uint8Array(16));
  const saltHex = Array.from(saltBytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');

  // Hash salt + password menggunakan SHA-256
  const encoder = new TextEncoder();
  const data = encoder.encode(saltHex + password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  
  const hashHex = Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');

  // Gabungkan dengan pemisah titik dua (salt:hash)
  return `${saltHex}:${hashHex}`;
}

/**
 * Verifikasi password dengan mencocokkan hash yang disimpan di DB
 */
export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  const parts = storedHash.split(':');
  if (parts.length !== 2) return false;

  const [saltHex, originalHashHex] = parts;

  // Hash salt + password input yang diuji
  const encoder = new TextEncoder();
  const data = encoder.encode(saltHex + password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  
  const hashHex = Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');

  return hashHex === originalHashHex;
}

/**
 * Mendapatkan user yang sedang login berdasarkan token Authorization header
 */
export async function getAuthenticatedUser(request: Request, db: D1Database): Promise<User | null> {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7).trim();
  if (!token) return null;

  try {
    // Ambil session dan data user terkait dari database
    const query = `
      SELECT u.id, u.name, u.email, u.role, u.is_active, u.created_at, s.expires_at 
      FROM sessions s
      JOIN users u ON s.user_id = u.id
      WHERE s.token = ?
      LIMIT 1
    `;
    
    const session = await db.prepare(query).bind(token).first<{
      id: string;
      name: string;
      email: string;
      role: 'PELAPOR' | 'ADMIN' | 'TEKNISI' | 'MANAJER';
      is_active: number;
      created_at: string;
      expires_at: string;
    }>();

    if (!session) return null;

    // Cek apakah akun dinonaktifkan admin (CR-02)
    if (session.is_active !== 1) {
      return null;
    }

    // Cek apakah session token sudah expired (dibandingkan UTC ISO String)
    const now = new Date().toISOString();
    if (session.expires_at < now) {
      // (Optional) Hapus sesi yang expired
      await db.prepare('DELETE FROM sessions WHERE token = ?').bind(token).run();
      return null;
    }

    return {
      id: session.id,
      name: session.name,
      email: session.email,
      role: session.role,
      is_active: session.is_active,
      created_at: session.created_at
    };
  } catch (error) {
    console.error('Auth verification error:', error);
    return null;
  }
}

/**
 * Helper untuk validasi otorisasi request (pengganti middleware hono)
 * Digunakan langsung di entry-point router request handling
 */
export async function requireAuth(
  request: Request,
  db: D1Database,
  allowedRoles?: Array<'PELAPOR' | 'ADMIN' | 'TEKNISI' | 'MANAJER'>
): Promise<{ user?: User; response?: Response }> {
  const user = await getAuthenticatedUser(request, db);
  
  if (!user) {
    return {
      response: new Response(
        JSON.stringify({ success: false, error: 'Sesi tidak valid atau sudah kedaluwarsa. Silakan login kembali.' }),
        { 
          status: 401, 
          headers: { 'Content-Type': 'application/json' } 
        }
      )
    };
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return {
      response: new Response(
        JSON.stringify({ success: false, error: 'Akses ditolak. Peran Anda tidak memiliki izin mengakses menu ini.' }),
        { 
          status: 403, 
          headers: { 'Content-Type': 'application/json' } 
        }
      )
    };
  }

  return { user };
}
