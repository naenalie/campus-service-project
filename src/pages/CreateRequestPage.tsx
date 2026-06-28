// src/pages/CreateRequestPage.tsx
// Halaman form buat laporan baru (FR-01)
//
// Tanggung jawab: SATU — tampilkan form dan kirim laporan baru ke API
// Hanya bisa diakses oleh PELAPOR
//
// Komponen yang dirender:
//   <RequestForm />   -- form dengan field: judul, deskripsi, lokasi, kategori
//
// Setelah submit sukses:
//   - Redirect ke / (daftar laporan)
//   - Toast: "Laporan berhasil dikirim! Nomor: CSR-xxxx"
//
// API: POST /api/requests
// Protected route -- butuh login + role PELAPOR

export {};
