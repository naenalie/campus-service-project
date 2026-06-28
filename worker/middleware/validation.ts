// worker/middleware/validation.ts
// Validasi request body sebelum masuk ke handler
//
// Fungsi yang perlu diimplementasi:
//
// validateRegister(body): cek name, email, password (minimal 8 karakter)
// validateLogin(body): cek email + password tidak kosong
// validateCreateRequest(body): cek title (min 5), description (min 20),
//   location tidak kosong, category valid
// validateUpdateStatus(body): cek new_status valid + kondisi resolution_notes
// validateAddComment(body): cek content tidak kosong
// validateAssign(body): cek assigned_to adalah integer valid
// validateConfirm(body): cek confirmed boolean + rejection_notes jika !confirmed
//
// Semua fungsi mengembalikan:
//   { valid: true } jika lolos
//   { valid: false, error: 'pesan error' } jika gagal

export {}; // placeholder agar file valid sebagai module
