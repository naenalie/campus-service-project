<div align="center">

<img src="https://img.shields.io/badge/Cloudflare-Workers-F38020?style=for-the-badge&logo=cloudflare&logoColor=white" />
<img src="https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black" />
<img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white" />
<img src="https://img.shields.io/badge/Cloudflare-D1_Database-F38020?style=for-the-badge&logo=cloudflare&logoColor=white" />
<img src="https://img.shields.io/badge/Vitest-Tests_Passing-6E9F18?style=for-the-badge&logo=vitest&logoColor=white" />

<br/><br/>

# 🏛️ Campus Service Request & Maintenance System

### Sistem Pelaporan & Pemeliharaan Sarana Prasarana Kampus
**Universitas Klabat (UNKLAB) — Airmadidi, Sulawesi Utara**

*Dibangun dengan React + TypeScript · Cloudflare Workers · D1 SQLite*

<br/>

[![Production](https://img.shields.io/badge/🌐_Live_Production-campus--service--project.officiallygwen.workers.dev-8B5CF6?style=for-the-badge)](https://campus-service-project.officiallygwen.workers.dev)
[![Health Check](https://img.shields.io/badge/💚_API_Health-/api/health-14B8A6?style=for-the-badge)](https://campus-service-project.officiallygwen.workers.dev/api/health)
[![GitHub](https://img.shields.io/badge/📁_Repository-naenalie/campus--service--project-181717?style=for-the-badge&logo=github)](https://github.com/naenalie/campus-service-project)

</div>

---

## 📖 Tentang Proyek

Sistem ini dibuat untuk menyelesaikan masalah nyata di kampus UNKLAB — **pelaporan kerusakan fasilitas yang selama ini tidak terstruktur**. Sebelumnya, laporan kerusakan disampaikan secara lisan atau lewat pesan WhatsApp, sehingga tidak ada tracking, tidak ada prioritas, dan tidak ada bukti penyelesaian.

Dengan sistem ini, seluruh alur dari **laporan masuk → ditinjau → ditugaskan → dikerjakan → selesai → ditutup** terdokumentasi secara digital dan bisa dipantau oleh semua pihak yang berkepentingan.

---

## 🌐 Akses Aplikasi

| | Link |
|---|---|
| 🚀 **Production URL** | [campus-service-project.officiallygwen.workers.dev](https://campus-service-project.officiallygwen.workers.dev) |
| 💚 **Health Check API** | [campus-service-project.officiallygwen.workers.dev/api/health](https://campus-service-project.officiallygwen.workers.dev/api/health) |
| 🔧 **Dev Role Switcher** | [campus-service-project.officiallygwen.workers.dev/dev-switcher](https://campus-service-project.officiallygwen.workers.dev/dev-switcher) *(demo only)* |
| 📁 **GitHub Repository** | [github.com/naenalie/campus-service-project](https://github.com/naenalie/campus-service-project) |

---

## 👥 Aktor & Akun Demo

> Semua akun menggunakan password: `test12345678`

| Role | Email | Halaman | Hak Akses |
|------|-------|---------|-----------|
| 👤 **Pelapor** | `pelapor@test.com` | `/` | Buat & pantau laporan milik sendiri |
| 👑 **Admin** | `admin@test.com` | `/admin` | Kelola semua laporan, assign teknisi |
| 🔧 **Teknisi** | `teknisi@test.com` | `/teknisi` | Lihat tugas, update progress perbaikan |
| 📊 **Manajer** | `manajer@test.com` | `/manajer` | Dashboard statistik (read-only) |

---

## 🔄 Alur Status Laporan

Alur transisi status dalam sistem mengikuti urutan linier yang diatur secara ketat oleh aturan bisnis (Business Rules):

```
[SUBMITTED] ➔ [UNDER_REVIEW] ➔ [ASSIGNED] ➔ [IN_PROGRESS] ➔ [RESOLVED] ➔ [CLOSED]
```

1. **SUBMITTED**: Tiket baru dibuat oleh Pelapor.
2. **UNDER_REVIEW**: Tiket ditinjau oleh Admin untuk menentukan prioritas/kategori.
3. **ASSIGNED**: Tiket ditugaskan ke Teknisi spesifik oleh Admin.
4. **IN_PROGRESS**: Teknisi mulai mengerjakan perbaikan di lokasi.
5. **RESOLVED**: Teknisi menyelesaikan perbaikan dan menyertakan catatan penyelesaian.
6. **CLOSED**: Pelapor mengonfirmasi hasil perbaikan (atau auto-close 72 jam).

---

## 📁 Struktur Dokumen Proyek

Proyek ini mendokumentasikan setiap proses rekayasa perangkat lunak secara rinci di dalam folder `docs/`:

- **docs/requirements/**: Dokumen analisis awal (`inception.md`), wawancara stakeholder (`elicitation-*.md`), daftar kebutuhan (`requirements.md`), matriks prioritas (`prioritization.md`), serta laporan validasi (`validation-report.md`) dan change requests (`change-request.md`).
- **docs/design/**: Spesifikasi arsitektur (`architecture.md`), skema database (`database.md`), kontrak API (`api.md`), dan ui-flow (`ui-flow.md`).
- **docs/testing/**: Rencana pengujian (`test-plan.md`) dan hasil uji penerimaan (`acceptance-test-results.md`).
- **docs/deployment/**: Release notes (`release-note.md`), deployment logs (`deployment-log.md`), dan penjelasan proyek (`project-explanation.md`).

---

## 🛠️ Langkah Menjalankan Proyek secara Lokal

```bash
# 1. Clone repository
git clone https://github.com/naenalie/campus-service-project.git
cd campus-service-project

# 2. Install dependency
npm install

# 3. Jalankan migrasi database D1 lokal
npx wrangler d1 execute campus-maintenance-db --local --file=database/migrations/0001_initial.sql

# 4. Jalankan development server
npm run dev

# 5. Jalankan automated tests
npm run test:run
```
