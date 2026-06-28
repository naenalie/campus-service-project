# Issue Plan — Campus Service Request and Maintenance System

Dokumen ini berisi rekapitulasi perencanaan unit kerja (issues) untuk pengembangan sistem, diurutkan berdasarkan dependency teknis dan urutan pengerjaan.

## Ringkasan
- **Total Issue**: 11
- **Total FR**: 12 + CR-02 (Authentication)
- **FR yang belum jadi issue**: 0

---

## Daftar GitHub Issues

### Issue #1: [FR-00] Setup Fondasi & Auth System (CR-02)
- **Labels**: `setup`, `backend`, `frontend`, `must-have`
- **Milestone**: Day 1
- **Blocked by**: None
- **Blocks**: Issue #2, Issue #3

#### Detail Pekerjaan Teknis
**Backend (worker/)**:
- Inisialisasi Hono router di `worker/index.ts`.
- Buat middleware `authGuard` dan `roleGuard` di `worker/middleware/auth.ts`.
- Buat middleware `validation` di `worker/middleware/validation.ts`.
- Definisikan API endpoint auth di `worker/routes/auth.ts`:
  - `POST /api/auth/register` (Registrasi akun baru, role default `PELAPOR`)
  - `POST /api/auth/login` (Login email + password, generate token)
  - `GET /api/auth/me` (Cek profile user aktif dari token)
  - `POST /api/auth/logout` (Hapus token session dari database)
- Tulis implementasi query database auth di `worker/db/queries.ts`:
  - `createUser`, `getUserByEmail`, `createSession`, `getSessionByToken`, `deleteSession`.

**Frontend (src/)**:
- Setup routing di `src/App.tsx` menggunakan React Router.
- Buat `ProtectedRoute` di `src/components/ProtectedRoute.tsx`.
- Buat `AuthContext` di `src/context/AuthContext.tsx` untuk mengelola global auth state + localStorage token.
- Buat halaman login di `src/pages/LoginPage.tsx` dan registrasi di `src/pages/RegisterPage.tsx`.
- Hubungkan front-end ke API auth di `src/services/api.ts`.

---

### Issue #2: [FR-01] Pembuatan Laporan Baru
- **Labels**: `feature`, `backend`, `frontend`, `must-have`
- **Milestone**: Day 1
- **Blocked by**: Issue #1
- **Blocks**: Issue #4, Issue #5, Issue #6

#### Detail Pekerjaan Teknis
**Backend (worker/)**:
- Buat endpoint `POST /api/requests` di `worker/routes/requests.ts` (diproteksi `authGuard`).
- Tambahkan validation di `worker/middleware/validation.ts` (judul min 5 karakter, deskripsi min 20 karakter).
- Tulis query `createRequest` di `worker/db/queries.ts` (menyimpan detail laporan baru dengan status default `SUBMITTED`, dan secara transaksi memasukkan log awal di `status_history`).

**Frontend (src/)**:
- Buat halaman `src/pages/CreateRequestPage.tsx`.
- Buat form input laporan di `src/components/RequestForm.tsx`.
- Daftarkan fetch client `createRequest` di `src/services/api.ts`.

---

### Issue #3: [FR-02] Melihat Daftar Laporan Pribadi (Pelapor)
- **Labels**: `feature`, `frontend`, `must-have`
- **Milestone**: Day 2
- **Blocked by**: Issue #1
- **Blocks**: Issue #5, Issue #10

#### Detail Pekerjaan Teknis
**Backend (worker/)**:
- Modifikasi handler endpoint `GET /api/requests` di `worker/routes/requests.ts` agar menyaring data otomatis jika role user login adalah `PELAPOR` (hanya menampilkan laporan miliknya sendiri).

**Frontend (src/)**:
- Implementasikan `src/pages/HomePage.tsx` (dashboard khusus pelapor).
- Tulis custom hook `src/hooks/useRequests.ts` untuk fetching data.
- Buat komponen layout daftar keluhan `<RequestCard />` di `src/components/RequestCard.tsx` dan `<StatusBadge />` di `src/components/StatusBadge.tsx`.

---

### Issue #4: [FR-03] Peninjauan Laporan Baru (Admin)
- **Labels**: `feature`, `backend`, `frontend`, `must-have`
- **Milestone**: Day 2
- **Blocked by**: Issue #2
- **Blocks**: Issue #6

#### Detail Pekerjaan Teknis
**Backend (worker/)**:
- Buat endpoint `PATCH /api/requests/:id/status` di `worker/routes/requests.ts` (hanya diakses role `ADMIN`).
- Validasi aturan status linier (BR-01): `Submitted` -> `Under Review`.
- Update status laporan di `service_requests` dan catat perubahan di `status_history`.

**Frontend (src/)**:
- Buat halaman dashboard khusus administrator di `src/pages/AdminDashboard.tsx`.
- Buat panel action `<StatusActions />` di `src/components/request/StatusActions.tsx`.
- Sediakan tombol "Tinjau Laporan" yang hanya muncul bagi admin jika status keluhan adalah `Submitted`.

---

### Issue #5: [FR-10] Pencarian & Penyaringan Laporan
- **Labels**: `feature`, `backend`, `frontend`, `must-have`
- **Milestone**: Day 2
- **Blocked by**: Issue #2, Issue #3
- **Blocks**: None

#### Detail Pekerjaan Teknis
**Backend (worker/)**:
- Tambahkan query parameter handling pada `GET /api/requests` untuk pencarian berdasarkan judul/nomor keluhan (`keyword`), penyaringan kategori (`category`), dan status (`status`).

**Frontend (src/)**:
- Buat komponen penyaring `<FilterBar />` di `src/components/FilterBar.tsx` (dengan debounce pada input search keyword).
- Integrasikan filter bar ke dalam halaman `HomePage.tsx` dan `AdminDashboard.tsx`.

---

### Issue #6: [FR-04] Penugasan Teknisi ke Laporan (Admin)
- **Labels**: `feature`, `backend`, `frontend`, `must-have`
- **Milestone**: Day 3
- **Blocked by**: Issue #4
- **Blocks**: Issue #7

#### Detail Pekerjaan Teknis
**Backend (worker/)**:
- Buat endpoint `GET /api/users?role=TEKNISI` di `worker/routes/admin.ts` untuk dropdown daftar teknisi.
- Buat endpoint `PATCH /api/requests/:id/assign` di `worker/routes/requests.ts` (hanya diakses role `ADMIN`).
- Validasi alur status (BR-01): status harus `Under Review` untuk bisa ditugaskan ke teknisi.
- Update kolom `assigned_to` dan set status ke `ASSIGNED`, catat log di `status_history`.

**Frontend (src/)**:
- Tambahkan sub-komponen `<AssignForm />` di `src/components/request/AssignForm.tsx`.
- Tampilkan dropdown daftar teknisi di detail halaman `RequestDetailPage.tsx` untuk admin.

---

### Issue #7: [FR-05 & FR-06] Pengerjaan Perbaikan oleh Teknisi
- **Labels**: `feature`, `backend`, `frontend`, `must-have`
- **Milestone**: Day 3
- **Blocked by**: Issue #6
- **Blocks**: Issue #8

#### Detail Pekerjaan Teknis
**Backend (worker/)**:
- Modifikasi endpoint `PATCH /api/requests/:id/status` agar menerima transisi:
  - `ASSIGNED` -> `IN_PROGRESS` (diakses oleh teknisi yang di-assign)
  - `IN_PROGRESS` -> `RESOLVED` (diakses oleh teknisi yang di-assign, wajib mengirim `resolution_notes` sesuai BR-03)
- Lakukan check kepemilikan tugas (BR-02): pastikan `assigned_to === user.id`.

**Frontend (src/)**:
- Buat halaman tugas teknisi di `src/pages/TechnicianPage.tsx`.
- Tambahkan panel pengerjaan di `<StatusActions />`:
  - Tombol "Mulai Pengerjaan" (jika status `ASSIGNED`)
  - Input textarea "Catatan Perbaikan" + tombol "Tandai Selesai" (jika status `IN_PROGRESS`).

---

### Issue #8: [FR-07] Konfirmasi Hasil Perbaikan (Pelapor)
- **Labels**: `feature`, `backend`, `frontend`, `must-have`
- **Milestone**: Day 3
- **Blocked by**: Issue #7
- **Blocks**: Issue #9

#### Detail Pekerjaan Teknis
**Backend (worker/)**:
- Buat endpoint `PATCH /api/requests/:id/confirm` di `worker/routes/requests.ts`.
- Validasi hanya pelapor pemilik tiket yang bisa memberi konfirmasi.
- Jika pelapor setuju (confirmed = true) -> catat konfirmasi di database.
- Jika pelapor tidak setuju (confirmed = false) -> simpan `rejection_notes` dan catat log komplain tambahan ke history.

**Frontend (src/)**:
- Buat komponen panel konfirmasi `<ConfirmPanel />` di `src/components/request/ConfirmPanel.tsx`.
- Render panel ini pada `RequestDetailPage.tsx` hanya untuk pelapor dan saat status laporan bernilai `RESOLVED`.

---

### Issue #9: [FR-08] Penutupan Laporan (Admin)
- **Labels**: `feature`, `backend`, `frontend`, `must-have`
- **Milestone**: Day 4
- **Blocked by**: Issue #8
- **Blocks**: None

#### Detail Pekerjaan Teknis
**Backend (worker/)**:
- Update endpoint `PATCH /api/requests/:id/status` agar menerima transisi `RESOLVED` -> `CLOSED` (diakses `ADMIN`).
- Terapkan BR-04: pastikan tiket sudah melewati tahap konfirmasi pelapor (atau auto-close sesuai aturan CR-01).
- Terapkan BR-05: pastikan setelah tiket berstatus `CLOSED`, semua request update status/komentar baru ditolak (read-only).

**Frontend (src/)**:
- Tambahkan tombol "Tutup Laporan" bagi Admin pada `RequestDetailPage.tsx`.
- Kunci semua form komentar dan aksi edit di halaman detail keluhan jika status laporan bernilai `CLOSED`.

---

### Issue #10: [FR-09 & FR-11] Detail Keluhan, Komentar & Riwayat Status
- **Labels**: `feature`, `backend`, `frontend`
- **Milestone**: Day 4
- **Blocked by**: Issue #3
- **Blocks**: None

#### Detail Pekerjaan Teknis
**Backend (worker/)**:
- Buat endpoint `POST /api/requests/:id/comments` untuk menambahkan komentar baru (diproteksi `authGuard`, ditolak jika status `CLOSED` sesuai BR-05).
- Buat handler `GET /api/requests/:id` agar me-return detail laporan beserta list komentar (`comments`) dan list riwayat (`status_history`) dalam bentuk join transaction query.

**Frontend (src/)**:
- Buat halaman `src/pages/RequestDetailPage.tsx`.
- Tulis komponen info keluhan `<RequestInfo />`.
- Tulis komponen komentar `<CommentSection />` dan log riwayat `<StatusHistory />`.

---

### Issue #11: [FR-12] Dashboard Statistik Visual (Manajer Fasilitas)
- **Labels**: `feature`, `backend`, `frontend`
- **Milestone**: Day 4
- **Blocked by**: Issue #1
- **Blocks**: None

#### Detail Pekerjaan Teknis
**Backend (worker/)**:
- Buat endpoint `GET /api/dashboard/summary` di `worker/routes/dashboard.ts` (hanya diakses oleh `ADMIN` atau `MANAJER`).
- Tulis SQL agregasi di `worker/db/queries.ts` (menggunakan `COUNT` dan `GROUP BY` per status/kategori).

**Frontend (src/)**:
- Buat halaman `src/pages/ManagerDashboard.tsx` berisi representasi bagan persentase per kategori kerusakan dan status laporan aktif.

---

## Tabel Urutan Pengerjaan
| # | Issue | FR | Milestone | Blocked By | Estimasi |
|---|---|---|---|---|---|
| 1 | [FR-00] Setup Fondasi & Auth System (CR-02) | - | Day 1 | - | 3 jam |
| 2 | [FR-01] Pembuatan Laporan Baru | FR-01 | Day 1 | Issue #1 | 2 jam |
| 3 | [FR-02] Melihat Daftar Laporan Pribadi | FR-02 | Day 2 | Issue #1 | 2 jam |
| 4 | [FR-03] Peninjauan Laporan Baru (Admin) | FR-03 | Day 2 | Issue #2 | 1.5 jam |
| 5 | [FR-10] Pencarian & Penyaringan Laporan | FR-10 | Day 2 | Issue #2, #3 | 2 jam |
| 6 | [FR-04] Penugasan Teknisi ke Laporan | FR-04 | Day 3 | Issue #4 | 1.5 jam |
| 7 | [FR-05 & FR-06] Pengerjaan Perbaikan Teknisi | FR-05, FR-06 | Day 3 | Issue #6 | 2.5 jam |
| 8 | [FR-07] Konfirmasi Hasil Perbaikan | FR-07 | Day 3 | Issue #7 | 2 jam |
| 9 | [FR-08] Penutupan Laporan | FR-08 | Day 4 | Issue #8 | 1.5 jam |
| 10| [FR-09 & FR-11] Komentar & Riwayat Status | FR-09, FR-11 | Day 4 | Issue #3 | 3 jam |
| 11| [FR-12] Dashboard Statistik Visual | FR-12 | Day 4 | Issue #1 | 2 jam |

---

## Dependency Graph
```
[Setup Fondasi & Auth (Issue #1)]
   ├── [Pembuatan Laporan (Issue #2)] ────┐
   │      ├── [Daftar Laporan (Issue #3)] │
   │      │      ├── [Pencarian & Filter (Issue #5)]
   │      │      └── [Komentar & Riwayat (Issue #10)]
   │      └── [Peninjauan Laporan (Issue #4)]
   │             └── [Penugasan Teknisi (Issue #6)]
   │                    └── [Pengerjaan Teknisi (Issue #7)]
   │                           └── [Konfirmasi Hasil (Issue #8)]
   │                                  └── [Penutupan Laporan (Issue #9)]
   └── [Dashboard Statistik (Issue #11)]
```

## Paralel yang Bisa Dikerjakan Bersamaan
1. **Issue #11 (Dashboard Manajer)** dapat dikerjakan secara paralel segera setelah Issue #1 selesai, karena ia tidak bergantung pada alur status tiket.
2. **Issue #5 (Pencarian & Filter)** dapat dikerjakan paralel setelah Issue #3 diimplementasikan.
