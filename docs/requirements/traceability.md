# Traceability Matrix — Campus Service Request and Maintenance System

Matriks ini menghubungkan setiap Functional Requirement (FR) ke User Story (US), Design, GitHub Issue, implementasi kode, dan test yang membuktikannya.

---

## Matriks Keterlacakan

| Requirement | User Story | Design | Issue / PR | Implementasi | Test | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :---: |
| **FR-01** (Buat laporan baru) | US-01 | UI-01, API-01, DB-01 | #12 | `src/pages/CreateRequestPage.tsx`, `worker/routes/requests.ts` | UT-01, UT-04, UT-06 | ✅ Selesai |
| **FR-02** (Lihat daftar laporan pribadi) | US-02 | UI-02, API-02 | #12 | `src/pages/HomePage.tsx` | AT-01 | ✅ Selesai |
| **FR-03** (Tinjau & ubah status ke Under Review) | US-03 | API-03 | #12 | `worker/routes/requests.ts` (PATCH `/status`) | UT-05 | ✅ Selesai |
| **FR-04** (Assign teknisi) | US-04 | API-04 | #12 | `worker/routes/requests.ts` (PATCH `/assign`) | AT-07 | ✅ Selesai |
| **FR-05** (Terima tugas → In Progress) | US-05 | API-05 | #12 | `worker/routes/requests.ts` (PATCH `/status`) | AT-08 | ✅ Selesai |
| **FR-06** (Tandai selesai → Resolved) | US-06 | API-06 | #12 | `worker/routes/requests.ts` (PATCH `/status`) | AT-08 | ✅ Selesai |
| **FR-07** (Konfirmasi pelapor → Closed / buka kembali) | US-07 | API-07 | #12 | `worker/routes/requests.ts` (PATCH `/confirm`) | IT-11, IT-12, IT-13, IT-14 | ✅ Selesai |
| **FR-08** (Tutup laporan → Closed) | US-08 | API-08 | #12 | `worker/routes/requests.ts` (PATCH `/status`) | AT-07 | ✅ Selesai |
| **FR-09** (Komentar publik) | US-09 (partial) | API-09, DB-02 | #12 | `worker/routes/requests.ts` (POST `/comments`) | UT-07 | ✅ Selesai |
| **FR-10** (Pencarian & filter laporan) | US-09 | API-10 | #12 | `worker/db/queries.ts` (`getAllRequests`) | IT-09, IT-10 | ✅ Selesai |
| **FR-11** (Riwayat status log) | US-03, US-05 | DB-03, API-11 | #12 | `worker/routes/requests.ts` (GET `/history`) | AT-07 | ✅ Selesai |
| **FR-12** (Dashboard statistik Manajer) | US-10 | UI-10, API-12 | #12 | `src/pages/ManagerDashboard.tsx`, `worker/routes/dashboard.ts` | AT-09, SM-18 | ✅ Selesai |
| **CR-02** (Sistem autentikasi login) | — | DB-04, API-Auth | #12, PR#12 | `worker/routes/auth.ts`, `src/pages/LoginPage.tsx`, `src/context/AuthContext.tsx` | UT-02, UT-03, SM-17 | ✅ Selesai |

---

## Matriks NFR

| NFR | Metrik Target | Verifikasi | Status |
| :--- | :--- | :--- | :---: |
| **NFR-01** (Performa < 2 detik) | 95% request < 2s pada 3G/4G | Cloudflare Workers edge deployment — startup time 4ms | ✅ Met |
| **NFR-02** (Keamanan token) | Token tidak ada di repo publik | `git grep` tidak menemukan token — `.gitignore` memproteksi `.env` & `.wrangler/` | ✅ Met |
| **NFR-03** (Responsivitas) | Tampilan mobile-friendly | Layout responsive dengan CSS flexbox/grid, telah diuji di mobile viewport | ✅ Met |
| **NFR-04** (Reliability 99.9%) | Cloudflare Workers SLA | Cloudflare Workers paket gratis memiliki SLA 99.9% uptime | ✅ Met |
| **NFR-05** (Test coverage 80%) | 27/27 tests lulus (100%) | `npm run test:run` — 3 file, 27 tests all passed | ✅ Met |
| **NFR-06** (Compatibility) | Chrome, Edge, Firefox, Safari | Diuji di Chrome dan Edge; Vite menghasilkan bundle yang kompatibel | ✅ Met |

---

## Legend

| Simbol | Arti |
| --- | --- |
| ✅ Selesai | Requirement diimplementasikan, diuji, dan telah live di production |
| 🔄 Parsial | Requirement diimplementasikan tapi test masih manual (belum automated) |
| ❌ Belum | Requirement belum diimplementasikan |
