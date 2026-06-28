# UI Flow Design — Campus Service Request and Maintenance System

Versi: 1.0 | Tanggal: 2026-06-29 | Status: Draft — Menunggu Human Review

---

## 1. Daftar Halaman

Semua halaman di-trace ke FR. Tidak ada halaman yang dibuat tanpa alasan.

| # | Nama Halaman | Route | Aktor | FR yang Ditangani | Endpoint API |
|---|---|---|---|---|---|
| 1 | **Beranda / Daftar Laporan** | `/` | Pelapor | FR-02, FR-10 | `GET /api/requests` |
| 2 | **Form Buat Laporan** | `/create` | Pelapor | FR-01 | `POST /api/requests` |
| 3 | **Detail Laporan** | `/requests/:id` | Semua | FR-07, FR-09, FR-11 | `GET /api/requests/:id`, `POST /api/requests/:id/comments`, `PATCH /api/requests/:id/confirm` |
| 4 | **Dashboard Admin** | `/` (role: admin) | Administrator | FR-03, FR-04, FR-08, FR-10 | `GET /api/requests`, `PATCH /api/requests/:id/status`, `PATCH /api/requests/:id/assign` |
| 5 | **Daftar Tugas Teknisi** | `/` (role: teknisi) | Teknisi | FR-05, FR-06 | `GET /api/requests` |
| 6 | **Dashboard Manajer** | `/` (role: manajer) | Manajer Fasilitas | FR-12 | `GET /api/dashboard/summary` |

> **Catatan route**: Karena ini role simulator (bukan multi-page auth), semua role masuk
> ke `/` dan komponen yang dirender ditentukan oleh role aktif di context.
> Detail laporan (`/requests/:id`) dapat diakses oleh semua role.

### Tabel Verifikasi FR → Halaman

| FR | Halaman yang Menangani | Status |
|---|---|---|
| FR-01 | Form Buat Laporan | ✅ |
| FR-02 | Beranda Pelapor | ✅ |
| FR-03 | Dashboard Admin | ✅ |
| FR-04 | Dashboard Admin (tombol assign) | ✅ |
| FR-05 | Daftar Tugas Teknisi | ✅ |
| FR-06 | Daftar Tugas Teknisi + Detail Laporan | ✅ |
| FR-07 | Detail Laporan (tombol konfirmasi) | ✅ |
| FR-08 | Dashboard Admin + Detail Laporan | ✅ |
| FR-09 | Detail Laporan (section komentar) | ✅ |
| FR-10 | Beranda Pelapor + Dashboard Admin | ✅ |
| FR-11 | Detail Laporan (timeline history) | ✅ |
| FR-12 | Dashboard Manajer | ✅ |

✅ **Semua 12 FR memiliki halaman yang menanganinya.**

---

## 2. Alur Navigasi per Aktor

### 2.1 Alur Pelapor

```
[Buka App]
    │
    ▼
[RoleSwitcher: pilih "Pelapor"]
    │
    ▼
[Beranda Pelapor]
Tampil: daftar laporan milik saya (empty state jika belum ada)
    │
    ├── klik [+ Buat Laporan Baru]
    │       │
    │       ▼
    │   [Form Buat Laporan]
    │   Isi: judul, deskripsi, lokasi, kategori
    │   Validasi real-time (karakter minimum)
    │       │
    │       ├── klik [Kirim Laporan] ── sukses ──► kembali ke [Beranda]
    │       │                                      toast: "Laporan berhasil dikirim!"
    │       │
    │       └── klik [Batal] ──────────────────► kembali ke [Beranda]
    │
    ├── ketik di [Kotak Cari] atau pilih [Filter Status]
    │       │
    │       ▼
    │   [Beranda Pelapor] (daftar difilter, state URL diperbarui)
    │
    └── klik nama laporan di daftar
            │
            ▼
        [Detail Laporan]
        Tampil: info laporan, timeline status, komentar
            │
            ├── (jika status = Resolved) tombol [Setuju] / [Tidak Setuju]
            │       │
            │       ├── klik [Setuju] ──────────► konfirmasi, tombol dikunci
            │       └── klik [Tidak Setuju] ────► form catatan muncul, submit catatan
            │
            └── form komentar di bawah (kecuali status Closed)
                    │
                    └── klik [Kirim Komentar] ──► komentar muncul di list
```

---

### 2.2 Alur Administrator

```
[Buka App]
    │
    ▼
[RoleSwitcher: pilih "Administrator"]
    │
    ▼
[Dashboard Admin]
Tampil: semua laporan, default filter = semua status
    │
    ├── pilih [Filter Status / Kategori] atau ketik [Cari]
    │       │
    │       ▼
    │   [Dashboard Admin] (daftar difilter)
    │
    ├── klik laporan berstatus "Submitted"
    │       │
    │       ▼
    │   [Detail Laporan] — tampilan admin
    │   Tombol yang muncul: [Tinjau Laporan] (FR-03)
    │       │
    │       └── klik [Tinjau Laporan] ──► status → Under Review
    │                                     kembali ke Dashboard atau stay di Detail
    │
    ├── klik laporan berstatus "Under Review"
    │       │
    │       ▼
    │   [Detail Laporan] — tampilan admin
    │   Tampil: dropdown [Pilih Teknisi] + tombol [Tugaskan] (FR-04)
    │       │
    │       └── pilih teknisi → klik [Tugaskan] ──► status → Assigned
    │
    ├── klik laporan berstatus "Resolved"
    │       │
    │       ▼
    │   [Detail Laporan] — tampilan admin
    │   Tampil: tombol [Tutup Laporan] (FR-08) jika pelapor sudah konfirmasi
    │       │
    │       └── klik [Tutup Laporan] ──► status → Closed, halaman locked
    │
    └── komentar bisa ditambahkan di semua laporan non-Closed
```

---

### 2.3 Alur Teknisi

```
[Buka App]
    │
    ▼
[RoleSwitcher: pilih "Teknisi"]
    │
    ▼
[Daftar Tugas Teknisi]
Tampil: hanya laporan yang di-assign ke saya, status = Assigned atau In Progress
(empty state jika belum ada tugas)
    │
    ├── klik laporan berstatus "Assigned"
    │       │
    │       ▼
    │   [Detail Laporan] — tampilan teknisi
    │   Tombol yang muncul: [Mulai Pengerjaan] (FR-05)
    │       │
    │       └── klik [Mulai Pengerjaan] ──► status → In Progress
    │                                       tombol berubah menjadi [Tandai Selesai]
    │
    └── klik laporan berstatus "In Progress"
            │
            ▼
        [Detail Laporan] — tampilan teknisi
        Tampil: textarea [Catatan Perbaikan] + tombol [Tandai Selesai] (FR-06)
            │
            ├── isi catatan → klik [Tandai Selesai] ──► status → Resolved
            │                                           kembali ke Daftar Tugas
            │
            └── klik [Tandai Selesai] tanpa catatan ──► error: "Catatan wajib diisi"
```

---

### 2.4 Alur Manajer Fasilitas

```
[Buka App]
    │
    ▼
[RoleSwitcher: pilih "Manajer Fasilitas"]
    │
    ▼
[Dashboard Manajer]
Tampil:
  - Kartu statistik: Total, Submitted, In Progress, Resolved, Closed
  - Breakdown per kategori (AC, Internet, dll.)
    │
    └── klik [Refresh] atau data diperbarui otomatis saat halaman reload
        (tidak ada navigasi ke halaman lain dari sini)
        Manajer bisa akses Detail Laporan tapi read-only (tidak ada tombol aksi)
```

---

## 3. Wireframe Tiap Halaman (ASCII)

### 3.1 Header Global (muncul di semua halaman)

```
┌─────────────────────────────────────────────────────────────────────┐
│  🏛  Campus Service Request System        [Role: Pelapor ▼]         │
└─────────────────────────────────────────────────────────────────────┘
```

RoleSwitcher di kanan atas. Mengubah role akan me-render ulang konten utama.

---

### 3.2 Beranda Pelapor (FR-02, FR-10)

```
┌─────────────────────────────────────────────────────────────────────┐
│  🏛  Campus Service Request System        [Role: Pelapor ▼]         │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  Laporan Saya                            [+ Buat Laporan Baru]      │
│                                                                     │
│  [Filter Status ▼ Semua]  [Kategori ▼ Semua]  [🔍 Cari laporan...] │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │ CSR-001 | AC Ruang 301 Tidak Berfungsi                       │   │
│  │ 📍 Gedung B Lt. 3  •  AC  •  29 Jun 2026      [Submitted]   │   │
│  │                                          [Lihat Detail →]    │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │ CSR-002 | Internet Lambat di Lab Komputer                    │   │
│  │ 📍 Gedung C Lt. 1  •  Internet  •  28 Jun 2026  [Resolved]  │   │
│  │                                          [Lihat Detail →]    │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ─ ─ ─ ─ Empty State (jika belum ada laporan) ─ ─ ─ ─ ─ ─ ─ ─ ─   │
│  │         📋 Belum ada laporan.                               │   │
│  │         Klik "Buat Laporan Baru" untuk mulai.              │   │
└─────────────────────────────────────────────────────────────────────┘
```

---

### 3.3 Form Buat Laporan (FR-01)

```
┌─────────────────────────────────────────────────────────────────────┐
│  🏛  Campus Service Request System        [Role: Pelapor ▼]         │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ← Kembali    Buat Laporan Baru                                     │
│  ─────────────────────────────────────────────────────────────────  │
│                                                                     │
│  Judul Laporan *                                                    │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ AC Ruang 301 tidak berfungsi...                             │   │
│  └─────────────────────────────────────────────────────────────┘   │
│  ⚠ Minimal 5 karakter   (tulis saat error saja)                    │
│                                                                     │
│  Deskripsi Detail *                                                 │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ AC di ruang 301 gedung B sudah tidak dingin sejak...        │   │
│  │                                                             │   │
│  └─────────────────────────────────────────────────────────────┘   │
│  ⚠ Minimal 20 karakter   (tulis saat error saja)                   │
│                                                                     │
│  Lokasi *                                                           │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ Gedung B Lantai 3 Ruang 301                                 │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  Kategori *                                                         │
│  [Internet] [AC ✓] [Peralatan Kelas] [Kebersihan] [Lainnya]        │
│   (toggle button group)                                             │
│                                                                     │
│  ─────────────────────────────────────────────────────────────────  │
│  [Batal]                                      [Kirim Laporan →]     │
│                                                                     │
│  ─ ─ ─ Loading State ─ ─ ─                                         │
│  [Kirim Laporan →] berubah menjadi [⏳ Mengirim...] dan di-disable  │
└─────────────────────────────────────────────────────────────────────┘
```

---

### 3.4 Halaman Detail Laporan (FR-07, FR-09, FR-11) — tampilan bervariasi per role

```
┌─────────────────────────────────────────────────────────────────────┐
│  🏛  Campus Service Request System        [Role: Pelapor ▼]         │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ← Kembali                                                          │
│                                                                     │
│  CSR-1751177718000                              [🟡 In Progress]    │
│  ─────────────────────────────────────────────────────────────────  │
│  AC Ruang 301 Tidak Berfungsi                                       │
│                                                                     │
│  📍 Gedung B Lantai 3 Ruang 301   📂 AC   ⚡ High                   │
│  👤 Dilaporkan oleh: Ahmad Fauzi  🔧 Dikerjakan oleh: Dewi Lestari  │
│  🕐 Dibuat: 29 Jun 2026  |  Diperbarui: 29 Jun 2026                │
│                                                                     │
│  Deskripsi:                                                         │
│  AC di ruang 301 gedung B sudah tidak dingin sejak 3 hari lalu...  │
│                                                                     │
│  ─ ─ ─ ─ ─ ─ ─ TOMBOL AKSI (kondisional per role + status) ─ ─ ─  │
│                                                                     │
│  [Pelapor, status=Resolved]                                         │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │ ✅ Perbaikan selesai. Apakah masalah sudah teratasi?         │   │
│  │        [✓ Ya, Setuju]     [✗ Tidak, Masih Bermasalah]        │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  [Admin, status=Submitted]     → tombol [Tinjau Laporan]            │
│  [Admin, status=Under Review]  → dropdown teknisi + [Tugaskan]      │
│  [Admin, status=Resolved]      → tombol [Tutup Laporan]             │
│  [Teknisi, status=Assigned]    → tombol [Mulai Pengerjaan]          │
│  [Teknisi, status=In Progress] → textarea catatan + [Tandai Selesai]│
│  [status=Closed]               → banner "Laporan ini sudah ditutup" │
│                                                                     │
│  ─────────────────────────────────────────────────────────────────  │
│  Riwayat Status                                                     │
│                                                                     │
│  ● Submitted     │ Ahmad Fauzi (pelapor)     │ 29 Jun 06:00         │
│  ● Under Review  │ Budi Santoso (admin)      │ 29 Jun 07:00         │
│  ● Assigned      │ Budi Santoso (admin)      │ 29 Jun 07:30         │
│  ● In Progress   │ Dewi Lestari (teknisi)    │ 29 Jun 08:00         │
│                                                                     │
│  ─────────────────────────────────────────────────────────────────  │
│  Komentar (3)                                                       │
│                                                                     │
│  [Admin] Budi: Laporan sudah diterima...             29 Jun 07:00  │
│  [Teknisi] Dewi: Saya akan cek hari ini...           29 Jun 08:05  │
│                                                                     │
│  (jika status != Closed)                                            │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ Tulis komentar...                                           │   │
│  └─────────────────────────────────────────────────────────────┘   │
│  [Kirim Komentar]                                                   │
│                                                                     │
│  (jika status = Closed) → form komentar disembunyikan               │
└─────────────────────────────────────────────────────────────────────┘
```

---

### 3.5 Dashboard Admin (FR-03, FR-04, FR-08, FR-10)

```
┌─────────────────────────────────────────────────────────────────────┐
│  🏛  Campus Service Request System        [Role: Administrator ▼]   │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  Kelola Laporan                                                     │
│  ─────────────────────────────────────────────────────────────────  │
│  [Submitted: 3] [Under Review: 2] [Assigned: 5] [Active: 4]        │
│  (chip ringkasan klik-able sebagai shortcut filter)                 │
│                                                                     │
│  [Filter Status ▼ Semua]  [Kategori ▼ Semua]  [🔍 Cari laporan...] │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │ CSR-001 | AC Ruang 301            [Submitted]   ⚡ Medium    │   │
│  │ 👤 Ahmad Fauzi • 29 Jun             [Tinjau →]              │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │ CSR-002 | Internet Lambat         [Under Review] ⚡ High     │   │
│  │ 👤 Siti Rahayu • 28 Jun       [Lihat & Assign →]            │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │ CSR-003 | Kursi Rusak             [Resolved]    ⚡ Low       │   │
│  │ 👤 Ahmad Fauzi • 27 Jun         [Tutup Laporan]             │   │
│  └──────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
```

---

### 3.6 Daftar Tugas Teknisi (FR-05, FR-06)

```
┌─────────────────────────────────────────────────────────────────────┐
│  🏛  Campus Service Request System        [Role: Teknisi ▼]         │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  Tugas Saya                                                         │
│  ─────────────────────────────────────────────────────────────────  │
│  [Assigned: 2]  [In Progress: 1]                                    │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │ CSR-001 | AC Ruang 301 Tidak Berfungsi    [Assigned]         │   │
│  │ 📍 Gedung B Lt. 3  •  AC  •  Ditugaskan 29 Jun              │   │
│  │                              [Lihat & Mulai Pengerjaan →]    │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │ CSR-004 | Proyektor Mati          [In Progress]              │   │
│  │ 📍 Aula Utama  •  Peralatan Kelas  •  Mulai 28 Jun          │   │
│  │                              [Lihat & Tandai Selesai →]      │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ─ ─ ─ Empty State ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─   │
│  │   🔧 Belum ada tugas yang ditugaskan ke kamu.              │   │
│  │   Hubungi administrator jika ada kekeliruan.               │   │
└─────────────────────────────────────────────────────────────────────┘
```

---

### 3.7 Dashboard Manajer Fasilitas (FR-12)

```
┌─────────────────────────────────────────────────────────────────────┐
│  🏛  Campus Service Request System    [Role: Manajer Fasilitas ▼]   │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  Dashboard Ringkasan Fasilitas                                      │
│  ─────────────────────────────────────────────────────────────────  │
│                                                                     │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐       │
│  │  Total     │ │ Aktif      │ │ Resolved   │ │ Closed     │       │
│  │    34      │ │    14      │ │     8      │ │    12      │       │
│  │  Laporan   │ │  Laporan   │ │  Laporan   │ │  Laporan   │       │
│  └────────────┘ └────────────┘ └────────────┘ └────────────┘       │
│                                                                     │
│  ─────────────────────────────────────────────────────────────────  │
│  Distribusi per Status                                              │
│                                                                     │
│  Submitted    ████░░░░░░░░░░░░░░░░  3 laporan   (9%)               │
│  Under Review ██░░░░░░░░░░░░░░░░░░  2 laporan   (6%)               │
│  Assigned     █████░░░░░░░░░░░░░░░  5 laporan  (15%)               │
│  In Progress  ████░░░░░░░░░░░░░░░░  4 laporan  (12%)               │
│  Resolved     ████████░░░░░░░░░░░░  8 laporan  (24%)               │
│  Closed       ████████████░░░░░░░░ 12 laporan  (35%)               │
│                                                                     │
│  ─────────────────────────────────────────────────────────────────  │
│  Distribusi per Kategori                                            │
│                                                                     │
│  AC               ██████████░  10  (29%)                           │
│  Internet         ████████░░░   8  (24%)                           │
│  Peralatan Kelas  ██████░░░░░   6  (18%)                           │
│  Kebersihan       ████░░░░░░░   4  (12%)                           │
│  Lainnya          ██████░░░░░   6  (18%)                           │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 4. Conditional UI — Elemen yang Muncul/Sembunyi

Tabel ini mendefinisikan kapan setiap elemen interaktif ditampilkan atau disembunyikan.

| Elemen | Kondisi Tampil | Kondisi Sembunyi |
|---|---|---|
| Tombol [+ Buat Laporan] | role = `pelapor` | role lain |
| Tombol [Tinjau Laporan] | role = `administrator` DAN status = `Submitted` | kondisi lain |
| Dropdown [Pilih Teknisi] + [Tugaskan] | role = `administrator` DAN status = `Under Review` | kondisi lain |
| Tombol [Mulai Pengerjaan] | role = `teknisi` DAN status = `Assigned` DAN assigned_to = userId saya | kondisi lain |
| Textarea + [Tandai Selesai] | role = `teknisi` DAN status = `In Progress` DAN assigned_to = userId saya | kondisi lain |
| Panel [Setuju / Tidak Setuju] | role = `pelapor` DAN status = `Resolved` DAN reporter_confirmation = null | sudah dikonfirmasi atau status lain |
| Tombol [Tutup Laporan] | role = `administrator` DAN status = `Resolved` | kondisi lain |
| Form Komentar | status ≠ `Closed` DAN role ≠ `manajer_fasilitas` | status = `Closed` atau role = manajer |
| Banner "Laporan sudah ditutup" | status = `Closed` | status lain |
| Tab Dashboard Statistik | role = `manajer_fasilitas` atau `administrator` | role lain |
