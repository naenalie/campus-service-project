// worker/routes/auth.ts
// Implementasi router autentikasi backend (CR-02)

import { Env, ApiResponse } from '../types';
import { validateRegister } from '../middleware/validation';
import { hashPassword, verifyPassword, generateToken, getAuthenticatedUser } from '../middleware/auth';
import { getUserByEmail, createUser, createSession, deleteSession } from '../db/queries';

const jsonHeaders = { 'Content-Type': 'application/json' };

/**
 * Handler utama untuk route /api/auth/*
 */
export async function handleAuthRoutes(request: Request, env: Env, url: URL): Promise<Response> {
  const { pathname } = url;
  const method = request.method;

  try {
    // -------------------------------------------------------------
    // POST /api/auth/register
    // -------------------------------------------------------------
    if (method === 'POST' && pathname === '/api/auth/register') {
      let body: any;
      try {
        body = await request.json();
      } catch (err) {
        const res: ApiResponse<null> = { success: false, error: 'Request body harus berupa JSON valid' };
        return new Response(JSON.stringify(res), { status: 400, headers: jsonHeaders });
      }

      // Validasi input
      const validation = validateRegister(body);
      if (!validation.valid) {
        const res: ApiResponse<null> = { success: false, error: validation.errors.join(', ') };
        return new Response(JSON.stringify(res), { status: 422, headers: jsonHeaders });
      }

      // Cek duplikasi email
      const existingUser = await getUserByEmail(env.DB, body.email);
      if (existingUser) {
        const res: ApiResponse<null> = { success: false, error: 'Email sudah terdaftar. Silakan gunakan email lain.' };
        return new Response(JSON.stringify(res), { status: 409, headers: jsonHeaders });
      }

      // Hash password dan simpan user baru
      const hashedPassword = await hashPassword(body.password);
      const newUser = await createUser(env.DB, {
        name: body.name,
        email: body.email,
        password_hash: hashedPassword,
        role: 'PELAPOR' // Default role (CR-02)
      });

      const res: ApiResponse<any> = {
        success: true,
        message: 'Akun berhasil dibuat. Silakan login.',
        data: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role
        }
      };
      return new Response(JSON.stringify(res), { status: 201, headers: jsonHeaders });
    }

    // -------------------------------------------------------------
    // POST /api/auth/login
    // -------------------------------------------------------------
    if (method === 'POST' && pathname === '/api/auth/login') {
      let body: any;
      try {
        body = await request.json();
      } catch (err) {
        const res: ApiResponse<null> = { success: false, error: 'Request body harus berupa JSON valid' };
        return new Response(JSON.stringify(res), { status: 400, headers: jsonHeaders });
      }

      const email = typeof body.email === 'string' ? body.email.trim() : '';
      const password = typeof body.password === 'string' ? body.password : '';

      if (!email || !password) {
        const res: ApiResponse<null> = { success: false, error: 'Email dan password wajib diisi.' };
        return new Response(JSON.stringify(res), { status: 422, headers: jsonHeaders });
      }

      // Cari user
      const user = await getUserByEmail(env.DB, email);
      if (!user) {
        const res: ApiResponse<null> = { success: false, error: 'Email atau password salah.' };
        return new Response(JSON.stringify(res), { status: 401, headers: jsonHeaders });
      }

      // Cek apakah akun dinonaktifkan
      if (user.is_active !== 1) {
        const res: ApiResponse<null> = { success: false, error: 'Akun Anda telah dinonaktifkan. Hubungi administrator.' };
        return new Response(JSON.stringify(res), { status: 403, headers: jsonHeaders });
      }

      // Verifikasi password
      const passwordMatches = await verifyPassword(password, user.password_hash);
      if (!passwordMatches) {
        const res: ApiResponse<null> = { success: false, error: 'Email atau password salah.' };
        return new Response(JSON.stringify(res), { status: 401, headers: jsonHeaders });
      }

      // Generate token dan simpan session
      const token = generateToken();
      await createSession(env.DB, user.id, token);

      const res: ApiResponse<any> = {
        success: true,
        data: {
          token,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role
          }
        }
      };
      return new Response(JSON.stringify(res), { status: 200, headers: jsonHeaders });
    }

    // -------------------------------------------------------------
    // GET /api/auth/me
    // -------------------------------------------------------------
    if (method === 'GET' && pathname === '/api/auth/me') {
      const user = await getAuthenticatedUser(request, env.DB);
      if (!user) {
        const res: ApiResponse<null> = { success: false, error: 'Sesi tidak valid atau sudah kedaluwarsa. Silakan login kembali.' };
        return new Response(JSON.stringify(res), { status: 401, headers: jsonHeaders });
      }

      const res: ApiResponse<any> = {
        success: true,
        data: user
      };
      return new Response(JSON.stringify(res), { status: 200, headers: jsonHeaders });
    }

    // -------------------------------------------------------------
    // POST /api/auth/logout
    // -------------------------------------------------------------
    if (method === 'POST' && pathname === '/api/auth/logout') {
      const authHeader = request.headers.get('Authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7).trim();
        if (token) {
          await deleteSession(env.DB, token);
        }
      }

      const res: ApiResponse<any> = {
        success: true,
        message: 'Berhasil logout. Sampai jumpa!'
      };
      return new Response(JSON.stringify(res), { status: 200, headers: jsonHeaders });
    }

    // Menangani route /api/auth/* yang tidak terdaftar
    return new Response(
      JSON.stringify({ success: false, error: 'Endpoint auth tidak ditemukan' }), 
      { status: 404, headers: jsonHeaders }
    );
  } catch (error) {
    console.error(`Auth route error [${method} ${pathname}]:`, error);
    const res: ApiResponse<null> = { 
      success: false, 
      error: 'Terjadi kesalahan internal pada server auth. Silakan coba beberapa saat lagi.' 
    };
    return new Response(JSON.stringify(res), { status: 500, headers: jsonHeaders });
  }
}
