// src/pages/RegisterPage.tsx
// Halaman daftar akun baru (CR-02)
//
// Tanggung jawab: SATU — tampilkan form registrasi dan kirim ke API
// Role otomatis PELAPOR — tidak ada pilihan role di form ini
// Setelah sukses: toast "Akun berhasil dibuat" -> redirect ke /login
//
// State lokal:
//   name, email, password, confirmPassword: string
//   errors: { name?, email?, password?, confirmPassword? }
//   apiError: string | null   -- contoh: "Email gwen@unklab.ac.id sudah terdaftar"
//   isSubmitting: boolean
//
// Validasi client-side:
//   name >= 2 karakter
//   email format valid
//   password >= 8 karakter
//   confirmPassword === password
//
// API: POST /api/auth/register
// Public route -- tidak ada Header di halaman ini

export {};
