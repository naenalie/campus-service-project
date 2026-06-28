// src/pages/RequestDetailPage.tsx
// Halaman detail laporan (FR-07, FR-09, FR-11)
//
// Tanggung jawab: SATU — fetch detail laporan, kelola state loading/error,
// dan merender sub-komponen dengan data yang sudah di-fetch.
// Tampilan bervariasi secara kondisional berdasarkan role user dan status laporan.
//
// Komponen yang dirender:
//   <RequestInfo />       -- data utama laporan (read-only)
//   <StatusActions />     -- tombol aksi kondisional per role + status
//     <AssignForm />      -- dropdown pilih teknisi (jika admin + status=Under Review)
//     <ConfirmPanel />    -- panel setuju/tidak setuju (jika pelapor + status=Resolved)
//   <StatusHistory />     -- timeline riwayat status
//   <CommentSection />    -- section list komentar dan form komentar
//
// Hook yang dipakai:
//   useRequestDetail(id)  -- kelola fetch & mutasi (update status, assign, confirm, comment)
//
// API yang dipanggil:
//   onMount: GET /api/requests/:id
//   action: POST /api/requests/:id/comments
//   action: PATCH /api/requests/:id/status
//   action: PATCH /api/requests/:id/assign
//   action: PATCH /api/requests/:id/confirm
// Protected route -- butuh login

export {};
