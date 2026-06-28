// src/pages/HomePage.tsx
// Dashboard Pelapor — daftar laporan milik sendiri (FR-02, FR-10)
//
// Tanggung jawab: SATU — fetch dan tampilkan daftar laporan milik user yang login
// Bukan lagi "router per role" — setiap role punya halaman sendiri di route masing-masing
//
// Komponen yang dirender:
//   <FilterBar />     -- filter status, kategori, dan search
//   <RequestCard />   -- kartu satu laporan (diulang untuk setiap laporan)
//   <EmptyState />    -- jika belum ada laporan
//
// Hook yang dipakai:
//   useAuth()         -- ambil user yang sedang login
//   useRequests()     -- fetch GET /api/requests (filter otomatis by userId)
//
// API: GET /api/requests (token dikirim otomatis via api.ts)
// Protected route -- butuh login

export {};
