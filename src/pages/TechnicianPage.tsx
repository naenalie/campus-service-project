// src/pages/TechnicianPage.tsx
// Halaman tugas teknisi (FR-05, FR-06)
//
// Tanggung jawab: SATU — menampilkan daftar laporan yang ditugaskan ke teknisi yang login
//
// Komponen yang dirender:
//   <RequestCard />   -- list laporan tugas saya
//   <EmptyState />    -- jika tidak ada tugas yang di-assign
//
// Hook yang dipakai:
//   useRequests({ role: 'TEKNISI' }) -- fetch GET /api/requests (filter by assigned_to = user.id)
//
// API yang dipanggil:
//   GET /api/requests
// Protected route -- butuh login + role TEKNISI

export {};
