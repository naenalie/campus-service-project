# Laporan Hasil Uji Penerimaan Pengguna

Sistem Pengelolaan Perawatan Sarana & Prasarana Kampus Universitas Klabat (UNKLAB).

## Ringkasan

| Area | Status | Bukti |
| --- | --- | --- |
| Production URL dapat dibuka | Passed | `GET /api/health` mengembalikan 200 OK |
| Login akun test | Passed | Pelapor, Admin, dan Manajer berhasil login melalui API production |
| Proteksi endpoint | Passed | `GET /api/requests` tanpa token mengembalikan 401 |
| Daftar laporan Admin | Passed | `GET /api/requests` dengan token Admin mengembalikan data tiket |
| Dashboard Manajer | Passed | `GET /api/dashboard/summary` dengan token Manajer mengembalikan agregat |
| Build lokal | Passed | `npm run build` sukses |
| Automated test | Passed | 27 test lulus |

## Skenario Acceptance

| ID | Role | Skenario | Status |
| --- | --- | --- | --- |
| AT-01 | Pelapor | Login dan melihat daftar laporan miliknya | Passed via production smoke |
| AT-02 | Pelapor | Membuat laporan baru | Covered by validation/unit test; final browser screenshot pending |
| AT-03 | Pelapor | Melihat detail, komentar, dan riwayat status | Covered by route implementation; final browser screenshot pending |
| AT-04 | Pelapor | Mengonfirmasi laporan resolved menjadi closed | Passed by integration test |
| AT-05 | Pelapor | Menolak hasil resolved dan membuka kembali laporan | Passed by integration test |
| AT-06 | Admin | Melihat semua laporan | Passed via production API smoke |
| AT-07 | Admin | Mengubah status, prioritas, dan assignment | Route fixed; final browser screenshot pending |
| AT-08 | Teknisi | Mengubah progres assigned/in progress/resolved | Route fixed; final browser screenshot pending |
| AT-09 | Manajer | Melihat dashboard statistik | Passed via production API smoke |
| AT-10 | Semua Role | Logout membersihkan sesi lokal | Covered by implementation; final browser screenshot pending |

## Bug yang Ditemukan dan Diperbaiki

| ID | Masalah | Dampak | Status |
| --- | --- | --- | --- |
| BUG-01 | Route mutasi tiket `/api/requests/:id/status`, `/assign`, dan `/priority` tidak diarahkan ke handler role yang benar | Admin/Teknisi dapat gagal update status atau assignment | Fixed |
| BUG-02 | Endpoint `/api/requests/:id/confirm` belum tersedia di backend | Pelapor tidak dapat menjalankan FR-07 | Fixed |
| BUG-03 | Backend belum memproses filter `keyword` | Search server-side tidak sesuai dokumen API | Fixed |
| BUG-04 | Beberapa README kosong | Evidence repository kurang lengkap | Fixed |

## Sisa Evidence Manual

- Tambahkan screenshot browser untuk alur Pelapor, Admin, Teknisi, dan Manajer jika dosen meminta bukti visual.
- Lengkapi Pull Request GitHub sampai minimal 6 PR agar sesuai rubrik proses.
