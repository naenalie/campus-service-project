# Campus Service Request & Maintenance System (UNKLAB)

Aplikasi Web Sistem Pelaporan & Perawatan Sarana Prasarana Kampus Universitas Klabat (UNKLAB) berbasis serverless fullstack: Vite React, Cloudflare Workers, dan D1 Database.

## URL Production

- **Production URL**: [https://campus-service-project.officiallygwen.workers.dev](https://campus-service-project.officiallygwen.workers.dev)
- **Health Check**: [https://campus-service-project.officiallygwen.workers.dev/api/health](https://campus-service-project.officiallygwen.workers.dev/api/health)
- **Dev Role Switcher**: [https://campus-service-project.officiallygwen.workers.dev/dev-switcher](https://campus-service-project.officiallygwen.workers.dev/dev-switcher)

## Akun Test Simulasi Role

Password semua akun: `test12345678`

- **PELAPOR**: `pelapor@test.com` (Halaman Beranda / Lapor Baru)
- **ADMIN**: `admin@test.com` (Dashboard Manajemen Tiket & User)
- **TEKNISI**: `teknisi@test.com` (Halaman Perbaikan & Peta Kampus)
- **MANAJER**: `manajer@test.com` (Dashboard Statistik Agregat Eksekutif)

## Sistem Desain

Antarmuka memakai gaya glassmorphism dengan latar visual kampus dan layout role-based untuk Pelapor, Admin, Teknisi, dan Manajer.

## Verifikasi Terakhir

- `npm run test:run` - 27 test lulus.
- `npm run build` - build frontend dan Worker sukses.
- Production `/api/health` - status 200.
- Production login akun test Pelapor/Admin/Manajer - sukses.

## Perintah D1 Database & Deployment

Run Local D1 Query:

```bash
npx wrangler d1 execute campus-maintenance-db --local --command="SELECT name, email, role FROM users"
```

Deploy to Production:

```bash
npm run deploy
```

## Known Limitations

- Halaman `/dev-switcher` hanya untuk demonstrasi role saat review. Hapus dari production jika dosen meminta tidak ada akses login cepat.
- Pull Request publik yang terdeteksi di GitHub baru 1; rubrik tugas meminta minimal 6 PR, sehingga proses GitHub masih perlu dilengkapi melalui branch/PR terpisah.
