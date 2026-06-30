# Campus Service Request & Maintenance System (UNKLAB)

Aplikasi Web Sistem Pelaporan & Perawatan Sarana Prasarana Kampus Universitas Klabat (UNKLAB) berbasis Serverless Fullstack (Vite React + Cloudflare Workers + D1 Database).

## 🔗 URL Production & Dev Switcher
- **Production URL**: [https://campus-service-project.officiallygwen.workers.dev](https://campus-service-project.officiallygwen.workers.dev)
- **Dev Role Switcher**: [https://campus-service-project.officiallygwen.workers.dev/dev-switcher](https://campus-service-project.officiallygwen.workers.dev/dev-switcher)

---

## 👥 Akun Test Simulasi Role (Password: `test12345678`)
- **PELAPOR**: `pelapor@test.com` (Halaman Beranda / Lapor Baru)
- **ADMIN**: `admin@test.com` (Dashboard Manajemen Tiket & User)
- **TEKNISI**: `teknisi@test.com` (Halaman Perbaikan & Peta Kampus)
- **MANAJER**: `manajer@test.com` (Dashboard Statistik Agregat Eksekutif)

---

## 🎨 Sistem Desain: "Liquid Antigravity Glassmorphism"
Antarmuka premium transparan murni (*frosted glass*) dengan outline specular highlight dan bayangan 3D di atas latar belakang pemandangan asri Universitas Klabat (kaki Gunung Klabat).

## 🚀 Perintah D1 Database & Deployment
- Run Local D1 Query:
  ```bash
  npx wrangler d1 execute campus-maintenance-db --local --command="SELECT name, email, role FROM users"
  ```
- Deploy to Production:
  ```bash
  npm run deploy
  ```
