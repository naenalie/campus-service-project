// worker/db/queries.ts
// Semua query SQL ke D1 database
// Prinsip: TIDAK ada SQL mentah di luar file ini
// Semua fungsi menerima 'db: D1Database' sebagai parameter pertama
//
// Query yang perlu diimplementasi:
//
// -- Auth --
// getUserByEmail(db, email): cari user untuk login
// createUser(db, payload): insert user baru
// createSession(db, userId, token, expiresAt): insert session
// getSessionByToken(db, token): validasi Bearer token
// deleteSession(db, token): hapus session saat logout
//
// -- Requests --
// listRequests(db, filters, userId, role): query dengan filter
// getRequestById(db, id): detail satu laporan
// createRequest(db, payload, userId): insert laporan baru
// updateRequestStatus(db, id, status, extra): update status + insert history
// assignTechnician(db, id, techId, adminId): assign + update status
// confirmRequest(db, id, confirmed, notes, userId): konfirmasi pelapor
//
// -- Comments --
// getCommentsByRequest(db, requestId): list komentar
// addComment(db, requestId, userId, content): insert komentar
//
// -- Status History --
// getHistoryByRequest(db, requestId): list riwayat status
//
// -- Dashboard --
// getDashboardSummary(db): COUNT GROUP BY untuk statistik
//
// -- Admin: User Management --
// listUsers(db, roleFilter?): list semua user
// updateUserRole(db, userId, newRole): ubah role
// updateUserStatus(db, userId, isActive): nonaktifkan/aktifkan

export {}; // placeholder agar file valid sebagai module
