// worker/types/index.ts
// TypeScript types untuk sisi Cloudflare Workers
//
// Types yang perlu didefinisikan:
//
// Env - binding Cloudflare (D1, KV, dll.)
// interface Env {
//   DB: D1Database;  <- binding D1 dari wrangler.toml
// }
//
// Role - role user yang valid
// type Role = 'PELAPOR' | 'ADMIN' | 'TEKNISI' | 'MANAJER';
//
// Status - status laporan yang valid
// type Status = 'Submitted' | 'Under Review' | 'Assigned' |
//              'In Progress' | 'Resolved' | 'Closed';
//
// Category - kategori laporan
// type Category = 'Internet' | 'AC' | 'Peralatan Kelas' | 'Kebersihan' | 'Lainnya';
//
// UserRow - baris dari tabel users
// SessionRow - baris dari tabel sessions
// RequestRow - baris dari tabel service_requests
// StatusHistoryRow - baris dari tabel status_history
// CommentRow - baris dari tabel comments
//
// ApiResponse<T> - format standar response API
// interface ApiResponse<T> {
//   success: boolean;
//   data?: T;
//   error?: string;
//   meta?: { total: number };
// }

export {}; // placeholder agar file valid sebagai module
