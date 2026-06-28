// worker/routes/admin.ts
// Routes khusus administrator
// Endpoint yang ditangani:
//   GET    /api/users             - daftar semua user (bisa filter by role)
//   PATCH  /api/users/:id/role   - ubah role user (CR-02)
//   PATCH  /api/users/:id/status - nonaktifkan/aktifkan akun (CR-02)
// TODO: semua route harus melewati authGuard + roleGuard('ADMIN')
