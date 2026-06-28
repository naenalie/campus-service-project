// src/pages/LoginPage.tsx
// Halaman login — form email + password (CR-02)
//
// Tanggung jawab: SATU — tampilkan form login dan proses autentikasi
// Setelah sukses, redirect ke halaman sesuai role:
//   PELAPOR -> /
//   ADMIN   -> /admin
//   TEKNISI -> /teknisi
//   MANAJER -> /manajer
//
// State lokal:
//   email, password: string
//   errors: { email?, password? }    -- validasi sebelum submit
//   apiError: string | null          -- pesan error dari server
//   isSubmitting: boolean            -- disable tombol saat request berlangsung
//
// Guard: jika sudah login -> redirect langsung (skip halaman ini)
// API: POST /api/auth/login via AuthContext.login()
// Public route -- tidak ada Header di halaman ini

export {};
