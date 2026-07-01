# Campus Service Request & Maintenance System (UNKLAB)

Aplikasi Web Sistem Pelaporan & Perawatan Sarana Prasarana Kampus Universitas Klabat (UNKLAB) berbasis serverless fullstack: Vite React, Cloudflare Workers, dan D1 Database.

## URL Production

- **Production URL**: [https://campus-service-project.officiallygwen.workers.dev](https://campus-service-project.officiallygwen.workers.dev)
- **Health Check**: [https://campus-service-project.officiallygwen.workers.dev/api/health](https://campus-service-project.officiallygwen.workers.dev/api/health)
- **Repository**: [https://github.com/naenalie/campus-service-project](https://github.com/naenalie/campus-service-project)

## Akun Test Simulasi Role

Password semua akun: `test12345678`

| Role | Email | Halaman Utama |
| --- | --- | --- |
| **PELAPOR** | `pelapor@test.com` | Beranda — buat & pantau laporan |
| **ADMIN** | `admin@test.com` | Dashboard manajemen tiket & user |
| **TEKNISI** | `teknisi@test.com` | Halaman tugas perbaikan |
| **MANAJER** | `manajer@test.com` | Dashboard statistik eksekutif |

## Fitur Utama

- ✅ Sistem login berbasis email + password (4 role)
- ✅ Buat laporan keluhan dengan validasi input
- ✅ Alur status linier: `SUBMITTED → UNDER_REVIEW → ASSIGNED → IN_PROGRESS → RESOLVED → CLOSED`
- ✅ Penugasan teknisi oleh Admin
- ✅ Konfirmasi hasil perbaikan oleh Pelapor
- ✅ Riwayat status dan komentar pada detail laporan
- ✅ Dashboard statistik untuk Manajer Fasilitas
- ✅ Pencarian dan filter laporan berdasarkan status/kategori/keyword

## Tech Stack

| Komponen | Teknologi |
| --- | --- |
| Frontend | React + TypeScript (Vite) |
| Backend / API | Cloudflare Workers (TypeScript) |
| Database | Cloudflare D1 (SQLite serverless) |
| Auth | Token sesi via tabel `sessions` di D1 |
| CI | GitHub Actions (Vitest + build check) |

## Verifikasi Terakhir

- `npm run test:run` — **27 test lulus** (3 file: unit, validation, integration)
- `npm run build` — build frontend dan Worker sukses
- Production `/api/health` — status 200
- Production login akun test Pelapor/Admin/Manajer — sukses

## Perintah D1 Database & Deployment

```bash
# Jalankan database lokal
npm run dev

# Jalankan semua test
npm run test:run

# Build produksi
npm run build

# Deploy ke Cloudflare
npm run deploy

# Query D1 lokal
npx wrangler d1 execute campus-maintenance-db --local --command="SELECT name, email, role FROM users"
```

## Struktur Proyek

```
campus-service-project/
├── README.md              # Dokumen ini
├── CASE.md                # Studi kasus lengkap
├── skills/                # 15 file SKILL.md (01–15)
├── docs/
│   ├── requirements/      # Inception, elicitation, requirements, user stories, change request
│   ├── design/            # Architecture, database, API, UI flow, component design
│   ├── planning/          # GitHub Issues plan
│   ├── testing/           # Test plan & acceptance test results
│   └── deployment/        # Deployment evidence & release note
├── src/                   # Frontend React (pages, components, services)
├── worker/                # Backend Cloudflare Workers (routes, middleware, db)
├── database/              # Migrations SQL
├── tests/                 # Unit, integration, acceptance tests (Vitest)
├── evidence/              # AI session evidence
└── .github/workflows/     # CI workflow (GitHub Actions)
```

## Known Limitations

- Upload foto tidak diimplementasikan (out of scope per spesifikasi tugas)
- Notifikasi email tidak diimplementasikan (out of scope per spesifikasi tugas)
- Halaman `/dev-switcher` tersedia untuk kemudahan demo, bukan untuk produksi nyata
