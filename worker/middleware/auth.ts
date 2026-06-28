// worker/middleware/auth.ts
// Middleware autentikasi dan otorisasi (CR-02)
//
// authGuard:
//   - Baca header Authorization: Bearer <token>
//   - Query tabel sessions untuk validasi token
//   - Jika tidak ada / expired / user tidak aktif -> return 401/403
//   - Jika valid -> set c.set('user', userData) dan lanjutkan
//
// roleGuard(allowedRoles):
//   - Cek role user dari context (sudah di-set oleh authGuard)
//   - Jika role tidak ada di allowedRoles -> return 403
//   - Jika sesuai -> lanjutkan
//
// Urutan penggunaan di route:
//   route.use(authGuard)                      <- cek login dulu
//   route.use(roleGuard(['ADMIN']))            <- cek role setelahnya

export {}; // placeholder agar file valid sebagai module
