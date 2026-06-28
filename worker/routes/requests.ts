// worker/routes/requests.ts
// Routes untuk laporan keluhan (service requests)
// Endpoint yang ditangani:
//   GET    /api/requests          - list laporan (FR-02, FR-10)
//   POST   /api/requests          - buat laporan baru (FR-01)
//   GET    /api/requests/:id      - detail laporan (FR-11)
//   PATCH  /api/requests/:id/status  - update status (FR-03, FR-05, FR-06, FR-08)
//   PATCH  /api/requests/:id/assign  - assign teknisi (FR-04)
//   PATCH  /api/requests/:id/confirm - konfirmasi pelapor (FR-07)
//   POST   /api/requests/:id/comments - tambah komentar (FR-09)
//   GET    /api/requests/:id/history  - riwayat status (FR-11)
// TODO: semua route harus melewati authGuard middleware
