// src/pages/AdminDashboard.tsx
// Halaman dashboard Admin (FR-03, FR-04, FR-08, FR-10)
//
// Tanggung jawab: SATU — menampilkan antrean semua laporan keluhan dan
// menyediakan filter serta kontrol pencarian untuk administrator.
//
// Komponen yang dirender:
//   <FilterBar />       -- filter status, kategori, search
//   <RequestCard />     -- list laporan
//   <EmptyState />      -- jika antrean kosong
//
// Hook yang dipakai:
//   useRequests({ role: 'ADMIN' }) -- fetch GET /api/requests (semua laporan)
//
// API yang dipanggil:
//   GET /api/requests
// Protected route -- butuh login + role ADMIN

export {};
