# Architecture Design — Campus Service Request and Maintenance System

Versi: 1.0 | Tanggal: 2026-06-29 | Status: Draft — Menunggu Human Review

Dokumen ini mengikuti **4 Design Model Elements** dari Pressman Chapter 9:
Architecture Model (Section 3), Interface Model (Section 5), 
Component-level Model (Section 4), dan Deployment Model (Section 6).

---

## 1. Gambaran Sistem (End-to-End Narrative)

Sistem ini adalah aplikasi web berbasis **Single-Page Application (SPA)** 
yang dijalankan sepenuhnya di infrastruktur Cloudflare.

Alur kerja dari sudut pandang pengguna adalah sebagai berikut:

**User membuka browser** → mengetik URL → browser meminta file HTML/JS/CSS
dari **Cloudflare Pages** (CDN global). Tidak ada server tradisional yang 
terlibat di sini — file statis dikirim langsung dari edge node terdekat 
pengguna (biasanya <50ms di Asia Tenggara).

**React SPA dimuat di browser** → routing ditangani oleh React Router 
di sisi client. Pengguna melihat UI berdasarkan role yang dipilih 
di role simulator (dropdown di header). Tidak ada session server — 
state role disimpan di React context.

**Pengguna melakukan aksi** (misalnya: submit laporan) → React memanggil 
`fetch()` ke endpoint API di domain yang sama (`/api/requests`). 
Request ini **tidak pernah sampai ke server fisik** — Cloudflare menangkapnya 
di edge dan meneruskannya ke **Cloudflare Workers**.

**Workers menerima request** → memvalidasi input (panjang karakter, 
field wajib) → mengeksekusi business rule (validasi transisi status, 
cek role yang diizinkan) → menjalankan query SQL ke **Cloudflare D1**.

**D1 (SQLite di edge)** → menyimpan atau membaca data → 
mengembalikan hasilnya ke Workers.

**Workers merespons** → mengirim JSON ke browser.

**React memperbarui UI** → komponen re-render dengan data baru 
tanpa reload halaman.

Dengan arsitektur ini, **tidak ada server yang harus dikelola sendiri**, 
tidak ada biaya hosting bulanan, dan **latensi sangat rendah** 
karena semua komputasi terjadi di edge node terdekat pengguna.

---

## 2. Keputusan Arsitektur

*Setiap keputusan di bawah ini bisa di-trace ke requirement yang ada.*

| # | Keputusan | Alternatif yang Dipertimbangkan | Alasan Dipilih | Trade-off yang Diterima |
|---|---|---|---|---|
| **ADR-01** | Cloudflare Workers sebagai backend runtime | Express.js di VPS, Node.js di Railway/Render | Workers berjalan di edge (0 cold start), gratis sampai 100K req/hari, tanpa manajemen server. Mendukung NFR-04 (uptime 99.9%). | Tidak bisa pakai npm package yang bergantung pada Node.js built-ins (fs, net, crypto penuh). Harus pakai Web Standard API. |
| **ADR-02** | Cloudflare D1 (SQLite) sebagai database | PostgreSQL (Supabase/Neon), MySQL (PlanetScale), Firebase Firestore | D1 terintegrasi langsung dengan Workers tanpa koneksi TCP eksternal — latensi query sangat rendah. Gratis di tier awal. Schema relasional cocok untuk data terstruktur laporan keluhan (bukan document store). | D1 masih GA baru (2024), beberapa fitur PostgreSQL tidak ada (misalnya: full-text search bawaan, enum type). Harus pakai teks biasa untuk kolom status. |
| **ADR-03** | React sebagai frontend framework | Vue.js, plain HTML+JS, Svelte | Tim kampus lebih familiar dengan React (ekosistem lebih besar). Vite + React sudah terintegrasi langsung di `create-cloudflare`. TypeScript support kuat. State management dengan hooks cukup untuk scope proyek ini. | Bundle size lebih besar dari Svelte. Untuk proyek ini tidak ada perbedaan signifikan karena SPA kecil. |
| **ADR-04** | Monorepo (satu repo untuk frontend + worker) | Separate repo (frontend di satu repo, worker di repo lain) | Proyek individu dengan skala kecil — monorepo menyederhanakan CI/CD, shared TypeScript types, dan tidak perlu koordinasi antar-repo. Perintah `npm run dev` satu kali sudah menjalankan keduanya. | Ketika proyek besar dan tim bertambah, monorepo akan butuh tooling tambahan (Turborepo, Nx). Untuk sekarang tidak relevan. |
| **ADR-05** | Role Simulator (dropdown) menggantikan Auth sesungguhnya | Login dengan Google OAuth, session-based auth dengan JWT | Proyek ini adalah **sistem demonstrasi** — fokus pada alur bisnis, bukan keamanan autentikasi production. Role simulator memungkinkan penguji berpindah antar aktor dalam satu browser tanpa logout/login berulang. Scope sesuai dengan `Won't Have` di prioritization. | Tidak bisa dipakai di production sungguhan. Untuk keperluan akademik dan demo, ini sudah cukup dan malah mempermudah evaluasi dosen. |
| **ADR-06** | Validasi input dilakukan di DUA lapisan (frontend + worker) | Validasi hanya di frontend, atau hanya di backend | Validasi frontend memberikan feedback instan ke user (UX baik, mendukung NFR-03). Validasi di Workers adalah *last line of defense* — mencegah manipulasi request langsung via curl/Postman yang bypass UI. Sesuai prinsip "defense in depth". | Ada sedikit duplikasi kode validasi. Diterima karena scope validasi kecil (panjang string, field wajib). |

---

## 3. Komponen Utama Sistem (Architecture Model)

Sistem dibagi menjadi 4 komponen layer yang terpisah secara fisik dan logis.

### 3.1 Frontend Layer

| Atribut | Detail |
|---|---|
| **Nama** | React SPA |
| **Tugas** | Menampilkan UI, mengelola state per-role, mengirim request ke API |
| **Teknologi** | React 18, TypeScript, Vite, React Router v6 |
| **Lokasi Deploy** | Cloudflare Pages (CDN) |
| **Folder** | `src/` |
| **FR yang Ditangani** | FR-01 (form submit), FR-02 (list laporan), FR-03, FR-04 (UI admin), FR-05, FR-06 (UI teknisi), FR-07 (konfirmasi), FR-08 (close), FR-09 (komentar), FR-10 (search/filter), FR-11 (history log), FR-12 (dashboard) |

### 3.2 API Layer

| Atribut | Detail |
|---|---|
| **Nama** | Cloudflare Workers |
| **Tugas** | Menerima HTTP request, validasi input, eksekusi business rule, query database |
| **Teknologi** | Cloudflare Workers (Web Standard), TypeScript, Hono.js (micro-router) |
| **Lokasi Deploy** | Cloudflare Edge Network |
| **Folder** | `worker/` |
| **FR yang Ditangani** | Semua FR (semua aksi data melewati layer ini) |

> **Catatan**: Hono.js dipilih sebagai router ringan yang kompatibel dengan 
> Workers runtime (tidak bergantung Node.js). Ukuran bundle < 15KB.

### 3.3 Database Layer

| Atribut | Detail |
|---|---|
| **Nama** | Cloudflare D1 |
| **Tugas** | Menyimpan dan mengambil data laporan, user, komentar, history status |
| **Teknologi** | Cloudflare D1 (SQLite-compatible), schema di `database/migrations/` |
| **Lokasi Deploy** | Cloudflare Edge (co-located dengan Workers) |
| **Folder** | `database/migrations/` |
| **FR yang Ditangani** | FR-01 s/d FR-12 (semua data persisten) |

### 3.4 CI/CD Layer

| Atribut | Detail |
|---|---|
| **Nama** | GitHub Actions + Cloudflare Pages Deployment |
| **Tugas** | Menjalankan test otomatis dan deploy ke Cloudflare Pages/Workers saat push ke `main` |
| **Teknologi** | GitHub Actions, Wrangler CLI, Vitest |
| **Lokasi** | `.github/workflows/` |
| **NFR yang Ditangani** | NFR-05 (80% code coverage), NFR-02 (no secret di repo) |

### 3.5 Diagram Komunikasi Antar Komponen

```
┌─────────────────────────────────────────────────────────────────┐
│  Browser (User Device)                                          │
│                                                                 │
│  ┌──────────────┐    fetch()     ┌─────────────────────────┐   │
│  │  React SPA   │ ─────────────► │  Cloudflare Workers     │   │
│  │  (Vite/TSX)  │ ◄─────────────  │  (Hono Router + Logic)  │   │
│  └──────────────┘    JSON        └────────────┬────────────┘   │
│         │                                     │                 │
│  CDN static assets                     D1 binding              │
│         │                                     │                 │
│  ┌──────▼──────┐                    ┌─────────▼───────────┐   │
│  │  Cloudflare │                    │  Cloudflare D1      │   │
│  │  Pages      │                    │  (SQLite Database)  │   │
│  │  (CDN Edge) │                    │                     │   │
│  └─────────────┘                    └─────────────────────┘   │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  GitHub Actions CI/CD                                    │  │
│  │  push to main → vitest → wrangler deploy                 │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

**Pola komunikasi**: 
- Frontend ↔ Workers: REST over HTTPS (sinkron, request-response)
- Workers ↔ D1: D1 binding (bukan TCP koneksi, akses langsung dalam runtime)
- GitHub ↔ Cloudflare: Wrangler CLI via API token (CI/CD pipeline)

---

## 4. Struktur Folder Kode (Component-level Model)

Prinsip yang diterapkan: **satu file = satu tanggung jawab**. 
Tidak ada file "god object" yang menangani routing, validasi, query, 
dan business logic sekaligus.

### 4.1 Frontend — `src/`

```
src/
│
├── main.tsx                    ← Entry point: render React ke DOM, setup router
├── App.tsx                     ← Root component: layout utama + role context provider
├── index.css                   ← Global CSS reset dan design tokens (warna, font)
│
├── components/                 ← Komponen UI yang reusable (bukan halaman)
│   ├── RoleSwitcher/
│   │   └── RoleSwitcher.tsx    ← Dropdown header untuk ganti peran aktor
│   ├── StatusBadge/
│   │   └── StatusBadge.tsx     ← Badge warna per status (Submitted, In Progress, dst.)
│   ├── RequestCard/
│   │   └── RequestCard.tsx     ← Card laporan di daftar (judul, status, tanggal)
│   ├── RequestForm/
│   │   └── RequestForm.tsx     ← Form submit laporan baru (FR-01)
│   ├── CommentBox/
│   │   └── CommentBox.tsx      ← Form input + list komentar (FR-09)
│   ├── StatusHistory/
│   │   └── StatusHistory.tsx   ← Timeline riwayat status (FR-11)
│   └── StatsCard/
│       └── StatsCard.tsx       ← Kartu angka statistik untuk dashboard (FR-12)
│
├── pages/                      ← Halaman (satu file per route/aktor)
│   ├── ReporterDashboard.tsx   ← Halaman utama Pelapor: list laporan + form baru
│   ├── AdminDashboard.tsx      ← Halaman Admin: antrean keluhan + aksi tinjau/assign
│   ├── TechnicianDashboard.tsx ← Halaman Teknisi: tugas assigned + aksi mulai/selesai
│   ├── ManagerDashboard.tsx    ← Halaman Manajer: dashboard statistik (FR-12)
│   └── RequestDetail.tsx       ← Halaman detail per laporan (semua role bisa akses)
│
├── hooks/                      ← Custom React hooks (logika, bukan UI)
│   ├── useRequests.ts          ← Fetch + state untuk daftar laporan
│   ├── useRequestDetail.ts     ← Fetch + state untuk satu laporan beserta history
│   └── useRole.ts              ← Membaca dan mengubah role aktif dari context
│
├── services/                   ← Semua komunikasi dengan API (fetch wrapper)
│   ├── requestService.ts       ← CRUD laporan: create, list, detail, update status
│   ├── commentService.ts       ← Create + list komentar
│   └── dashboardService.ts     ← Fetch data agregat untuk dashboard manajer
│
├── context/
│   └── RoleContext.tsx         ← React context untuk state role aktif global
│
└── types/
    └── index.ts                ← Semua TypeScript interfaces: Request, Comment,
                                   StatusHistory, User, Role, ApiResponse
```

### 4.2 Backend — `worker/`

```
worker/
│
├── index.ts                    ← Entry point Worker: inisialisasi Hono app,
│                                 mount semua routes, export handler
│
├── routes/                     ← Routing layer (HANYA routing, tidak ada logic)
│   ├── requests.ts             ← Route /api/requests (GET, POST, GET/:id, PATCH /:id/status)
│   ├── comments.ts             ← Route /api/comments (POST, GET per request)
│   └── dashboard.ts            ← Route /api/dashboard/stats (GET agregat)
│
├── handlers/                   ← Business logic layer (satu handler = satu use case)
│   ├── createRequest.ts        ← UC: Pelapor submit laporan baru (FR-01)
│   ├── listRequests.ts         ← UC: List laporan per role + filter/search (FR-02, FR-10)
│   ├── getRequestDetail.ts     ← UC: Detail laporan + history + komentar (FR-11)
│   ├── updateStatus.ts         ← UC: Semua transisi status (FR-03 s/d FR-08)
│   ├── addComment.ts           ← UC: Tambah komentar (FR-09)
│   └── getDashboardStats.ts    ← UC: Agregasi data untuk manajer (FR-12)
│
├── db/                         ← Data Access Layer (semua query SQL di sini)
│   ├── requestQueries.ts       ← Query untuk tabel `requests`
│   ├── historyQueries.ts       ← Query untuk tabel `request_status_history`
│   ├── commentQueries.ts       ← Query untuk tabel `comments`
│   └── userQueries.ts          ← Query untuk tabel `users` (ambil daftar teknisi)
│
├── middleware/                  ← Cross-cutting concerns
│   ├── roleGuard.ts            ← Cek role dari header, blokir aksi yang tidak diizinkan
│   └── errorHandler.ts         ← Global error handler: format error JSON konsisten
│
└── validators/                 ← Validasi input (second layer defense)
    ├── requestValidator.ts     ← Validasi payload submit laporan (FR-01)
    └── statusValidator.ts      ← Validasi transisi status (BR-01: alur linier)
```

**Mengapa struktur ini?**

- `routes/` hanya tahu URL dan HTTP method — tidak ada SQL di sini
- `handlers/` berisi business logic — tidak ada routing dan tidak ada SQL mentah
- `db/` berisi semua SQL — mudah di-mock saat testing
- `validators/` terpisah agar bisa diuji sendiri tanpa HTTP layer
- Pemisahan ini membuat setiap file bisa dibaca, diuji, dan diubah 
  tanpa harus membuka file lain

---

## 5. Alur Data — 3 Skenario Utama (Interface Model)

### Skenario A: Pelapor Submit Laporan Baru (FR-01)

```
1. BROWSER
   User mengisi RequestForm.tsx (judul, deskripsi, lokasi, kategori)
   → validasi inline: judul < 5 karakter? tampilkan error, jangan submit
   → validasi inline: deskripsi < 20 karakter? tampilkan error, jangan submit
   → User klik tombol "Kirim Laporan"

2. FRONTEND → API
   requestService.ts memanggil:
   POST /api/requests
   Headers: { "X-User-Role": "pelapor", "X-User-Id": "user-001" }
   Body (JSON): {
     "title": "AC ruang 301 mati",
     "description": "AC di ruang 301 gedung B tidak berfungsi sejak kemarin...",
     "location": "Gedung B Lantai 3 Ruang 301",
     "category": "AC"
   }

3. CLOUDFLARE WORKERS — routes/requests.ts
   Router mencocokkan POST /api/requests
   → Panggil middleware roleGuard.ts: cek header X-User-Role = "pelapor" ✓
   → Panggil handler createRequest.ts

4. CLOUDFLARE WORKERS — handlers/createRequest.ts
   → Panggil requestValidator.ts: validasi ulang semua field
     - title.length >= 5? ✓
     - description.length >= 20? ✓
     - location tidak kosong? ✓
     - category salah satu dari enum yang valid? ✓
   → Buat request_number = "CSR-" + Date.now()
   → Status awal = "Submitted"

5. CLOUDFLARE WORKERS — db/requestQueries.ts
   → Eksekusi query:
     INSERT INTO requests 
       (request_number, title, description, location, category, 
        status, reporter_id, created_at)
     VALUES (?, ?, ?, ?, ?, 'Submitted', ?, datetime('now'))
   → Eksekusi query (dalam satu transaksi):
     INSERT INTO request_status_history 
       (request_id, from_status, to_status, changed_by, changed_at)
     VALUES (last_insert_rowid(), NULL, 'Submitted', ?, datetime('now'))

6. API → BROWSER
   Response 201 Created:
   {
     "success": true,
     "data": { "id": 42, "request_number": "CSR-1751177718000", ... }
   }

7. BROWSER
   useRequests hook menerima response
   → invalidate cache daftar laporan
   → React re-render ReporterDashboard: laporan baru muncul di atas list
   → Tampilkan toast notifikasi "Laporan berhasil dikirim!"
   → Reset form ke kondisi kosong
```

---

### Skenario B: Admin Assign Laporan ke Teknisi (FR-04)

```
1. BROWSER
   Admin di AdminDashboard.tsx melihat laporan berstatus "Under Review"
   → Admin memilih nama teknisi dari dropdown (diisi dari API)
   → Admin klik tombol "Tugaskan"

2. FRONTEND → API (untuk ambil daftar teknisi)
   Sebelum dropdown ditampilkan:
   GET /api/users?role=teknisi
   → Workers query userQueries.ts: SELECT id, name FROM users WHERE role='teknisi'
   → Response: [{ id: "tech-01", name: "Budi Santoso" }, ...]
   → Dropdown diisi nama-nama teknisi

3. FRONTEND → API (untuk assign)
   requestService.ts memanggil:
   PATCH /api/requests/42/status
   Headers: { "X-User-Role": "administrator", "X-User-Id": "admin-001" }
   Body (JSON): {
     "new_status": "Assigned",
     "assigned_to": "tech-01",
     "note": ""
   }

4. CLOUDFLARE WORKERS — handlers/updateStatus.ts
   → roleGuard: role "administrator" diizinkan untuk aksi Assigned ✓
   → Ambil status saat ini dari DB: SELECT status FROM requests WHERE id = 42
   → statusValidator: apakah "Under Review" → "Assigned" adalah transisi valid? ✓
     (validasi BR-01: alur linier)
   → Cek: assigned_to tidak boleh kosong untuk transisi ke Assigned

5. CLOUDFLARE WORKERS — db/requestQueries.ts
   → Transaksi DB:
     UPDATE requests SET status='Assigned', assigned_to='tech-01' WHERE id=42
     INSERT INTO request_status_history (...) VALUES (42, 'Under Review', 'Assigned', 'admin-001', datetime('now'))

6. API → BROWSER
   Response 200 OK:
   { "success": true, "data": { "id": 42, "status": "Assigned", ... } }

7. BROWSER
   → useRequestDetail hook re-fetch detail laporan
   → UI diperbarui: badge status berubah menjadi "Assigned" (warna biru)
   → Tombol "Tugaskan" diganti menjadi read-only karena status sudah bergeser
```

---

### Skenario C: Teknisi Update Status ke Resolved (FR-06)

```
1. BROWSER
   Teknisi di TechnicianDashboard melihat laporan "In Progress" miliknya
   → Teknisi mengisi textarea "Catatan Perbaikan" 
     (wajib, BR-03: mandatory resolved notes)
   → Teknisi klik "Tandai Selesai"

2. VALIDASI FRONTEND (sebelum request dikirim)
   → Cek: apakah catatan perbaikan kosong?
   → Jika kosong: tampilkan pesan "Catatan perbaikan wajib diisi" 
     dan JANGAN kirim request ke API
   → Jika terisi: lanjut ke step berikutnya

3. FRONTEND → API
   PATCH /api/requests/42/status
   Headers: { "X-User-Role": "teknisi", "X-User-Id": "tech-01" }
   Body (JSON): {
     "new_status": "Resolved",
     "resolution_notes": "AC telah dibersihkan dan freon diisi ulang. 
                          Unit kembali berfungsi normal."
   }

4. CLOUDFLARE WORKERS — handlers/updateStatus.ts
   → roleGuard: role "teknisi" diizinkan untuk aksi Resolved ✓
   → Ambil data laporan: SELECT status, assigned_to FROM requests WHERE id=42
   → Cek BR-02: apakah assigned_to = "tech-01" (sesuai dengan X-User-Id)? ✓
     Jika tidak cocok → return 403 Forbidden "Kamu tidak ditugaskan ke laporan ini"
   → statusValidator: apakah "In Progress" → "Resolved" adalah transisi valid? ✓
   → Cek BR-03: apakah resolution_notes tidak kosong? ✓

5. CLOUDFLARE WORKERS — db/requestQueries.ts
   → Transaksi DB (atomic):
     UPDATE requests 
       SET status='Resolved', resolution_notes='...', resolved_at=datetime('now')
       WHERE id=42
     INSERT INTO request_status_history 
       (request_id, from_status, to_status, changed_by, notes, changed_at)
       VALUES (42, 'In Progress', 'Resolved', 'tech-01', '...catatan...', datetime('now'))

6. API → BROWSER
   Response 200 OK: { "success": true, "data": { "id": 42, "status": "Resolved" } }

7. BROWSER
   → Dashboard teknisi diperbarui: laporan hilang dari list "Tugas Aktif"
   → Pelapor (jika refresh halaman) akan melihat status baru "Resolved" 
     dan tombol "Setuju / Tidak Setuju" muncul untuk konfirmasi (FR-07)
```

---

## 6. Deployment Model

Gambaran di mana setiap bagian sistem berjalan secara fisik:

```
┌─────────────────────────────────────────────────────────────────────┐
│  DEVICE PENGGUNA (Browser)                                          │
│  Chrome / Firefox / Edge / Safari                                   │
│  • Menjalankan: JavaScript React SPA                                │
│  • Menyimpan: role state (React context, tidak di-persist)          │
└──────────────────────┬──────────────────────────────────────────────┘
                       │ HTTPS request
                       ▼
┌─────────────────────────────────────────────────────────────────────┐
│  CLOUDFLARE GLOBAL NETWORK (Edge)                                   │
│                                                                     │
│  ┌──────────────────────┐   ┌──────────────────────────────────┐   │
│  │  Cloudflare Pages    │   │  Cloudflare Workers              │   │
│  │  (CDN)               │   │  (Serverless Compute at Edge)    │   │
│  │                      │   │                                  │   │
│  │  Menyajikan:         │   │  Menjalankan:                    │   │
│  │  • index.html        │   │  • Routing (Hono)                │   │
│  │  • bundle JS/CSS     │   │  • Business Logic                │   │
│  │  • favicon, assets   │   │  • Input Validation              │   │
│  │                      │   │  • DB Queries                    │   │
│  │  Build dari:         │   │                                  │   │
│  │  • src/ (Vite build) │   │  Source: worker/                 │   │
│  └──────────────────────┘   └──────────────┬─────────────────┘    │
│                                             │ D1 binding            │
│                               ┌─────────────▼─────────────────┐   │
│                               │  Cloudflare D1                 │   │
│                               │  (SQLite-compatible DB)        │   │
│                               │                                │   │
│                               │  Tables:                       │   │
│                               │  • requests                    │   │
│                               │  • users                       │   │
│                               │  • request_status_history      │   │
│                               │  • comments                    │   │
│                               └────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
                       ▲
                       │ wrangler deploy (via GitHub Actions)
┌──────────────────────┴──────────────────────────────────────────────┐
│  GITHUB (Source Control + CI/CD)                                    │
│  • Repository: campus-service-project                               │
│  • .github/workflows/deploy.yml                                     │
│  • Trigger: push ke branch main                                     │
│  • Steps: checkout → npm install → vitest → wrangler deploy         │
└─────────────────────────────────────────────────────────────────────┘
```

**Batasan Free Tier Cloudflare yang harus diperhatikan:**

| Resource | Batas Free Tier | Estimasi Pemakaian Proyek | Aman? |
|---|---|---|---|
| Workers Requests | 100.000 req/hari | < 500 req/hari (proyek demo) | ✅ Sangat aman |
| Workers CPU Time | 10ms per request | Query sederhana ~1-3ms | ✅ Aman |
| D1 Reads | 5 juta baris/hari | < 1000 baris/hari | ✅ Sangat aman |
| D1 Writes | 100.000 baris/hari | < 100 baris/hari | ✅ Aman |
| D1 Storage | 5 GB | < 1 MB untuk demo | ✅ Aman |
| Pages Builds | 500 build/bulan | < 30 build selama pengerjaan | ✅ Aman |

---

## 7. Risiko Teknis & Mitigasi

| # | Risiko | Komponen Terdampak | Dampak | Probabilitas | Mitigasi |
|---|---|---|---|---|---|
| **R-01** | D1 SQLite tidak support concurrent write yang tinggi | DB Layer | Laporan gagal disimpan saat trafik tinggi | Low (ini proyek demo) | Gunakan D1 transaction untuk operasi gabungan. Acceptable untuk skala demo. |
| **R-02** | Workers 10ms CPU limit terlampaui jika query kompleks | API Layer | Request timeout, user melihat error 500 | Low | Batasi query ke operasi sederhana (no N+1). Gunakan `COUNT ... GROUP BY` untuk dashboard, bukan load semua baris. |
| **R-03** | Secret/token Cloudflare ter-commit ke GitHub | CI/CD | Akun Cloudflare bisa diambil alih | Medium | Simpan semua secret di GitHub Actions Secrets (`CLOUDFLARE_API_TOKEN`). Tambahkan `.gitignore` untuk file `.env`. NFR-02 jelas tentang ini. |
| **R-04** | Status transition bypass via request langsung ke API | API Layer | Data korup (status melompat dari Submitted ke Closed) | Medium | `statusValidator.ts` memvalidasi setiap transisi status — **bukan** hanya di frontend. BR-01 diimplementasikan di Workers, bukan hanya UI. |
| **R-05** | Browser cache stale setelah update status | Frontend | User lihat status lama, bingung laporan tidak berubah | Medium | Setiap mutasi (PATCH) diikuti dengan invalidasi cache dan re-fetch data. Gunakan `cache: 'no-store'` pada fetch GET. |
| **R-06** | Teknisi akses laporan yang bukan tugasnya via direct API call | API Layer | Pelanggaran BR-02 (data leakage antar teknisi) | Low | Handler `updateStatus.ts` selalu memverifikasi bahwa `X-User-Id` = `assigned_to` di database sebelum eksekusi. |
| **R-07** | D1 cold start saat pertama kali Workers diakses | DB Layer | Latency spike pada request pertama setelah lama tidak dipakai | Low | Tidak bisa dihindari di free tier. Untuk demo, tidak signifikan. Dokumentasikan ke penguji. |

---

## 8. Traceability: FR → Komponen

Tabel ini memastikan setiap FR punya komponen yang menanganinya.

| FR | Deskripsi Singkat | Frontend Component | Worker Handler | DB Query File |
|---|---|---|---|---|
| FR-01 | Submit laporan baru | `RequestForm.tsx`, `ReporterDashboard.tsx` | `createRequest.ts` | `requestQueries.ts` |
| FR-02 | List laporan pribadi | `ReporterDashboard.tsx`, `RequestCard.tsx` | `listRequests.ts` | `requestQueries.ts` |
| FR-03 | Tinjau laporan (Under Review) | `AdminDashboard.tsx` | `updateStatus.ts` | `requestQueries.ts`, `historyQueries.ts` |
| FR-04 | Assign teknisi (Assigned) | `AdminDashboard.tsx` | `updateStatus.ts` | `requestQueries.ts`, `userQueries.ts` |
| FR-05 | Mulai pengerjaan (In Progress) | `TechnicianDashboard.tsx` | `updateStatus.ts` | `requestQueries.ts`, `historyQueries.ts` |
| FR-06 | Tandai selesai (Resolved) | `TechnicianDashboard.tsx` | `updateStatus.ts` | `requestQueries.ts`, `historyQueries.ts` |
| FR-07 | Konfirmasi pelapor | `RequestDetail.tsx` | `updateStatus.ts` | `requestQueries.ts`, `historyQueries.ts` |
| FR-08 | Tutup laporan (Closed) | `AdminDashboard.tsx`, `RequestDetail.tsx` | `updateStatus.ts` | `requestQueries.ts`, `historyQueries.ts` |
| FR-09 | Sistem komentar | `CommentBox.tsx`, `RequestDetail.tsx` | `addComment.ts` | `commentQueries.ts` |
| FR-10 | Search & filter | `AdminDashboard.tsx`, `ReporterDashboard.tsx` | `listRequests.ts` | `requestQueries.ts` |
| FR-11 | Riwayat status | `StatusHistory.tsx`, `RequestDetail.tsx` | `getRequestDetail.ts` | `historyQueries.ts` |
| FR-12 | Dashboard manajer | `ManagerDashboard.tsx`, `StatsCard.tsx` | `getDashboardStats.ts` | `requestQueries.ts` |

✅ **Semua 12 FR memiliki komponen yang menanganinya.** Tidak ada FR yang orphan.

---

## 9. Human Review

> Setelah membaca dokumen ini, jawab pertanyaan berikut
> sebelum melanjutkan ke fase implementasi:

### Pertanyaan Review

1. **Modularitas**: Apakah struktur folder `src/` dan `worker/` yang diusulkan
   sudah benar-benar modular? Sudah jelas mana yang routing, mana yang business logic,
   mana yang query SQL?

2. **Alur Data**: Apakah ketiga skenario (A, B, C) masuk akal dari sisi user?
   Adakah langkah yang terasa aneh atau terlewat?

3. **Keputusan Arsitektur**: Ada ADR yang kurang tepat atau perlu dibahas lebih jauh?
   (contoh: penggunaan Hono.js, atau pemisahan `handlers/` dan `routes/`)

4. **Risiko**: Adakah risiko yang belum dicatat tapi kamu tahu dari pengalaman?

### Template Jawaban

```
Yang kurang sreg  : ...
Yang sudah oke    : ...
Yang perlu diubah : ...
Keputusan         : [Disetujui / Perlu revisi — sebutkan apa yang harus direvisi]
```

> Jangan lanjut ke implementasi coding sebelum mendapat "Disetujui".
