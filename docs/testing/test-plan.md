# Dokumen Perencanaan Pengujian (Test Plan)
Sistem Pengelolaan Perawatan Sarana & Prasarana Kampus Universitas Klabat (UNKLAB)

Dokumen ini disusun untuk memetakan skenario pengujian fungsional dan integritas sistem (baik dari sisi backend Cloudflare Worker maupun frontend React) sebelum implementasi kode pengujian otomatis ditulis.

---

## Matriks Pengujian (Test Matrix)

| ID | FR | Deskripsi Pengujian | Level | Prioritas | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **UT-01** | FR-01 / Val | Verifikasi bahwa sistem menolak deskripsi laporan yang kurang dari 20 karakter | Unit Test | High | Pending |
| **UT-02** | CR-02 / Val | Memastikan validasi format alamat email kampus (harus berakhiran `@unklab.ac.id`) | Unit Test | High | Pending |
| **UT-03** | CR-02 / Val | Verifikasi bahwa pendaftaran akun baru menolak password dengan panjang kurang dari 8 karakter | Unit Test | High | Pending |
| **UT-04** | FR-01 / Val | Memastikan kategori kerusakan yang dikirimkan wajib sesuai dengan salah satu enum terdaftar | Unit Test | Medium | Pending |
| **UT-05** | FR-03 / Val | Menguji aturan transisi status tiket keluhan yang valid (misal: `SUBMITTED` -> `UNDER_REVIEW`) | Unit Test | High | Pending |
| **UT-06** | FR-01 / Gen | Memastikan kode generator membuat nomor laporan `request_number` dengan format unik `CSR-[timestamp]` | Unit Test | Medium | Pending |
| **UT-07** | CR-02 / Sec | Memastikan proses hashing password menghasilkan string acak aman yang berbeda dari teks sandi asli | Unit Test | High | Pending |
| **IT-08** | CR-02 / API | Menguji endpoint `POST /api/auth/register` berhasil membuat pengguna baru dengan peran `PELAPOR` | Integration | High | Pending |
| **IT-09** | CR-02 / API | Menguji endpoint `POST /api/auth/register` gagal/error ketika mendeteksi pendaftaran dengan email duplikat | Integration | High | Pending |
| **IT-10** | CR-02 / API | Menguji endpoint `POST /api/auth/login` berhasil memberikan token sesi autentikasi yang valid | Integration | High | Pending |
| **IT-11** | CR-02 / API | Menguji endpoint `POST /api/auth/login` mengembalikan error `401` jika kata sandi salah | Integration | High | Pending |
| **IT-12** | FR-02 / Sec | Memastikan pemanggilan `GET /api/requests` tanpa token authorization mengembalikan status error `401 Unauthorized` | Integration | High | Pending |
| **IT-13** | FR-01 / API | Menguji endpoint `POST /api/requests` berhasil menyimpan tiket laporan keluhan baru ke database D1 | Integration | High | Pending |
| **IT-14** | FR-01 / API | Menguji endpoint `POST /api/requests` gagal dan mengembalikan error `400` jika deskripsi terlalu pendek | Integration | Medium | Pending |
| **IT-15** | FR-03 / Sec | Memastikan endpoint `PATCH /api/requests/:id/status` mengembalikan error `403 Forbidden` jika diakses non-admin | Integration | High | Pending |
| **IT-16** | FR-11 / API | Menguji endpoint `GET /api/requests/:id` berhasil mengembalikan detail tiket lengkap dengan log history & komentar | Integration | High | Pending |
| **IT-17** | FR-12 / Sec | Memastikan `GET /api/dashboard/summary` mengembalikan error `403` jika diakses oleh pengguna selain ADMIN/MANAJER | Integration | High | Pending |
| **AT-18** | End-to-End | **Skenario Pelapor**: Register akun baru -> Login sukses -> Buat tiket laporan keluhan baru -> Lihat status tiket di beranda | Acceptance | High | Pending |
| **AT-19** | End-to-End | **Skenario Admin**: Login -> Tinjau tiket baru -> Tugaskan staf teknisi -> Update status pengerjaan | Acceptance | High | Pending |
| **AT-20** | End-to-End | **Skenario Teknisi**: Login -> Lihat tugas masuk -> Update progress perbaikan -> Input catatan & tandai selesai | Acceptance | High | Pending |

---

## Lingkungan Pengujian (Testing Environment)
- **Database**: Cloudflare D1 local emulator (SQLite).
- **Backend API**: Cloudflare Workers local dev server (Wrangler).
- **Frontend App**: React (Vite dev server) pada URL `http://localhost:5173`.
- **Framework Otomatisasi**: Vitest / MSW (Mock Service Worker) untuk integration, dan Playwright/Cypress untuk pengujian penerimaan.
