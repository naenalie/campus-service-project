# CASE.md — Campus Service Request and Maintenance System

## Studi Kasus: Sistem Pelaporan dan Perawatan Fasilitas Kampus

### Latar Belakang

Kampus Universitas Klabat (UNKLAB) memiliki banyak ruang kelas, laboratorium, dan fasilitas umum yang memerlukan pemeliharaan rutin maupun perbaikan mendesak. Selama ini, proses pelaporan kerusakan fasilitas dilakukan secara tidak terstruktur — melalui WhatsApp, memo cetak, atau laporan verbal langsung ke staf tata usaha. Kondisi ini menyebabkan banyak laporan yang hilang, lambat ditangani, atau bahkan diabaikan tanpa diketahui pelapor.

Proyek ini bertujuan membangun sebuah aplikasi web terpusat untuk menerima, meneruskan, dan memantau penanganan laporan kerusakan fasilitas kampus secara transparan dan terstruktur.

---

### Masalah yang Diselesaikan

| No. | Masalah | Dampak |
| --- | --- | --- |
| 1 | Tidak ada saluran pelaporan terpusat | Laporan tersebar di banyak media, mudah hilang |
| 2 | Tidak ada transparansi status penanganan | Pelapor tidak tahu apakah masalahnya sedang ditangani |
| 3 | Tidak ada audit log perubahan status | Sulit melacak siapa yang mengerjakan apa dan kapan |
| 4 | Beban kerja teknisi tidak dapat dipantau | Penugasan tidak merata dan tidak adil |
| 5 | Tidak ada dashboard ringkasan untuk manajemen | Manajer fasilitas tidak dapat memantau performa unit perawatan |

---

### Aktor Sistem

| Aktor | Peran | Akses Utama |
| --- | --- | --- |
| **Pelapor** | Mahasiswa atau dosen yang melaporkan kerusakan | Buat laporan, pantau status, beri konfirmasi |
| **Administrator** | Staf Unit Sarana Prasarana | Tinjau, assign teknisi, ubah status, tutup tiket |
| **Teknisi** | Staf perbaikan lapangan | Lihat tugas, update progres, tandai selesai |
| **Manajer Fasilitas** | Kepala unit / manajemen | Lihat dashboard statistik (read-only) |

---

### Alur Sistem

```
SUBMITTED → UNDER_REVIEW → ASSIGNED → IN_PROGRESS → RESOLVED → CLOSED
```

Setiap transisi status hanya dapat dilakukan oleh aktor yang berwenang dan harus mengikuti urutan di atas (tidak boleh melompati tahap).

---

### Teknologi yang Digunakan

| Komponen | Teknologi |
| --- | --- |
| Frontend | React (Vite + TypeScript) |
| Backend / API | Cloudflare Workers (TypeScript) |
| Database | Cloudflare D1 (SQLite serverless) |
| Autentikasi | JWT-like token via D1 sessions table |
| Deployment | Cloudflare Workers (paket gratis) |
| CI | GitHub Actions (Vitest + build check) |

---

### Batasan Scope (In Scope)

- Pembuatan dan pengelolaan laporan keluhan fasilitas
- Sistem login berbasis email dan password (4 role: PELAPOR, ADMIN, TEKNISI, MANAJER)
- Alur status linier yang diproteksi oleh role
- Riwayat perubahan status (status history log)
- Komentar publik pada halaman detail laporan
- Dashboard statistik untuk Manajer
- Deployment ke Cloudflare Workers (serverless, tanpa biaya)

### Di Luar Scope (Out of Scope)

- Upload foto atau lampiran file
- Notifikasi email / push notification
- Login menggunakan akun Google / SSO
- QR code ruangan
- Klasifikasi kategori otomatis oleh AI
- Manajemen inventaris spare part
- Manajemen vendor perbaikan

---

### Referensi

- Repository: https://github.com/naenalie/campus-service-project
- Production URL: https://campus-service-project.officiallygwen.workers.dev
- Mata Kuliah: Software Engineering — Universitas Klabat (UNKLAB)
- Dosen: Andrew Tanny Liem
