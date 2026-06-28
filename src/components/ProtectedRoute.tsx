// src/components/ProtectedRoute.tsx
// Wrapper route untuk memproteksi halaman dari akses tanpa login (CR-02)
//
// Tanggung jawab: SATU — memverifikasi status auth dan role sebelum merender halaman.
//
// Props:
//   allowedRoles?: Array<'PELAPOR' | 'ADMIN' | 'TEKNISI' | 'MANAJER'>
//
// Alur verifikasi:
//   1. Jika isLoading di AuthContext -> render <LoadingSpinner />
//   2. Jika tidak ada user -> redirect ke /login
//   3. Jika allowedRoles diatur & role user tidak cocok -> redirect ke / (atau halaman home default role-nya)
//   4. Jika valid -> render <Outlet /> (child routes)

export {};
