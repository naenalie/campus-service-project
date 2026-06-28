# Change Requests — Campus Service Request and Maintenance System

Dokumen ini melacak seluruh permintaan perubahan (change request) formal pada spesifikasi kebutuhan sistem.

---

## Daftar Change Request

| ID | Tanggal | Requirement Terkait | Alasan Perubahan | Dampak ke Requirement Lain | Status |
| :--- | :--- | :--- | :--- | :--- | :---: |
| **CR-01** | 2026-06-26 | `BR-04 (Pencegahan Tutup Paksa)` & `FR-08 (Menutup Laporan)` | Mengatasi masalah tiket yang menggantung selamanya (unresponsive reporter) pada status `Resolved`. | Menambahkan aturan bisnis baru `BR-06 (Auto-Close 3 Hari)`. Admin/Sistem dapat memicu transisi status menjadi `Closed` jika pelapor pasif selama 72 jam setelah perbaikan selesai. | **Approved** |
| **CR-02** | 2026-06-29 | Sistem Autentikasi (semua FR terdampak) | Awalnya tidak ada login/auth di spec — sistem menggunakan role simulator. Setelah review, sistem perlu login dengan email + password karena: (1) tiap aktor punya akses yang berbeda dan harus dikontrol server-side, (2) tanpa login siapapun bisa mengakses panel admin hanya dengan mengganti dropdown, (3) role harus dikontrol oleh Admin, bukan dipilih sendiri oleh user. | Tambah tabel `sessions` untuk manajemen token. Update tabel `users` dengan kolom `password_hash` dan `is_active`. Tambah endpoint `POST /api/auth/login`, `POST /api/auth/register`, `GET /api/auth/me`, `POST /api/auth/logout`. Tambah endpoint `PATCH /api/users/:id/role` untuk manajemen role oleh Admin. Tambah middleware `authGuard` di semua endpoint yang butuh proteksi. Ganti header `X-User-Role` + `X-User-Id` dengan `Authorization: Bearer <token>`. Tambah halaman Login di frontend. Tambah halaman User Management di panel Admin. | **Approved** |

---

## Analisis Dampak Detail (Impact Analysis)

### CR-01: Penambahan Aturan Auto-Close 3 Hari

*   **Latar Belakang**:
    Bila teknisi menyelesaikan tugas, status menjadi `Resolved`. Pelapor diharapkan memberikan konfirmasi ("Setuju" untuk ditutup, atau "Tidak Setuju" untuk ditinjau ulang). Namun jika pelapor tidak merespons (misalnya karena mahasiswa sibuk/lupa), tiket akan selamanya berstatus `Resolved`.
*   **Perubahan Spesifikasi**:
    *   **Aturan Bisnis Baru (BR-06)**: *"Keluhan yang berada dalam status `Resolved` selama lebih dari 72 jam tanpa ada respon konfirmasi dari pelapor akan otomatis berstatus Closed secara otomatis oleh sistem atau dapat ditutup manual oleh Administrator."*
    *   **Pembaruan Skema Database**: Tabel `service_requests` tidak perlu diubah, tetapi query pengecekan di backend API harus membandingkan waktu saat ini dengan timestamp perubahan status terakhir pada tabel `request_status_history`.
*   **Dampak ke Kode**:
    *   **Backend Worker**: Endpoint `PATCH /api/requests/:id` (atau endpoint cron job/worker) ditambahkan logika untuk mengizinkan Administrator memicu penutupan keluhan yang sudah `Resolved` > 3 hari meskipun pelapor belum memberikan konfirmasi feedback.
    *   **Frontend UI**: Tampilkan lencana peringatan (warning badge) jika laporan `Resolved` telah melewati batas waktu konfirmasi pelapor agar admin sadar bahwa tiket tersebut dapat ditutup paksa secara manual.

### CR-02: Penambahan Sistem Autentikasi Login

*   **Latar Belakang**:
    Desain awal menggunakan role simulator (dropdown ganti peran) yang nyaman untuk demo
    tetapi tidak aman untuk deployment nyata. Siapapun bisa mengganti perannya sendiri
    menjadi Administrator dan mengakses semua data. Setelah review, diputuskan sistem
    harus punya autentikasi berbasis email + password dengan token sesi.

*   **Perubahan Skema Database**:
    *   **Tabel `users`**: Tambah kolom `password_hash TEXT NOT NULL`, `is_active INTEGER DEFAULT 1`,
        `created_by TEXT` (FK self-referencing — siapa admin yang membuat akun ini).
        Ubah tipe `id` dari `INTEGER` menjadi `TEXT` (UUID) agar lebih aman.
        Ubah nama role ke UPPERCASE: `PELAPOR`, `ADMIN`, `TEKNISI`, `MANAJER`.
    *   **Tabel `sessions`** *(baru)*: Menyimpan token sesi aktif.
        Kolom: `id TEXT PK`, `user_id TEXT FK`, `token TEXT UNIQUE`, `expires_at TEXT`, `created_at TEXT`.

*   **Perubahan API**:
    *   Tambah endpoint baru: `POST /api/auth/register`, `POST /api/auth/login`,
        `GET /api/auth/me`, `POST /api/auth/logout`, `PATCH /api/users/:id/role`.
    *   Semua endpoint yang dulunya pakai header `X-User-Role` + `X-User-Id`
        diganti menjadi `Authorization: Bearer <token>`.
    *   Middleware `authGuard` wajib dijalankan di semua endpoint kecuali
        `/api/health`, `/api/auth/register`, dan `/api/auth/login`.

*   **Perubahan Frontend**:
    *   Tambah halaman `LoginPage.tsx` — form email + password.
    *   Tambah halaman `RegisterPage.tsx` — form daftar akun baru (role otomatis PELAPOR).
    *   Tambah halaman `UserManagementPage.tsx` di panel Admin — tabel semua user + aksi ganti role.
    *   Hapus komponen `RoleSwitcher.tsx` (tidak diperlukan lagi).
    *   `RoleContext` diganti dengan `AuthContext` yang menyimpan token + data user dari `GET /api/auth/me`.

*   **Dampak ke Kode yang Sudah Ada**:
    *   `src/services/api.ts`: Semua fungsi fetch harus mengirimkan header `Authorization: Bearer <token>`.
    *   `worker/middleware/roleGuard.ts`: Diganti dengan `authGuard.ts` yang membaca token dari header.
    *   `docs/design/database.md`: Tabel `users` diperbarui.
    *   `docs/design/api.md`: Ditambah section Authentication Endpoints.

*   **Contoh User Seed (development)**:
    *   `gwen@unklab.ac.id` — role PELAPOR
    *   `admin@unklab.ac.id` — role ADMIN
    *   `tech@unklab.ac.id` — role TEKNISI
    *   `manager@unklab.ac.id` — role MANAJER
