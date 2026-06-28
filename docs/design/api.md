# API Contract — Campus Service Request and Maintenance System

Versi: 1.0 | Tanggal: 2026-06-29 | Status: Draft — Menunggu Human Review

Dokumen ini mendefinisikan kontrak HTTP API antara React frontend dan Cloudflare Workers.
Setiap endpoint terdokumentasi lengkap: request, response sukses, dan semua kemungkinan error.

---

## 1. Konvensi Umum

### 1.1 Base URL

```
Development : http://localhost:8787
Production  : https://campus-service.<subdomain>.workers.dev
```

Semua path API diawali dengan `/api`.
Frontend React (Cloudflare Pages) berkomunikasi dengan Workers via path relatif `/api/*`
karena keduanya berada di domain yang sama (dikonfigurasi di `wrangler.toml`).

---

### 1.2 Format Response Standar

Semua response menggunakan format JSON yang konsisten:

**Response Sukses:**
```json
{
  "success": true,
  "data": { ... }
}
```

**Response Sukses dengan List:**
```json
{
  "success": true,
  "data": [ ... ],
  "meta": {
    "total": 42
  }
}
```

**Response Error:**
```json
{
  "success": false,
  "error": "Pesan error yang jelas dan actionable untuk pengguna"
}
```

---

### 1.3 Header Wajib

*Diperbarui oleh CR-02 — sistem autentikasi. Header `X-User-Role` dan `X-User-Id`
diganti dengan `Authorization: Bearer <token>` yang didapat dari `POST /api/auth/login`.*

| Header | Tipe | Wajib | Keterangan |
|---|---|---|---|
| `Authorization` | `Bearer <token>` | Ya (semua endpoint kecuali `/health`, `/auth/register`, `/auth/login`) | Token sesi dari login |
| `Content-Type` | `application/json` | Ya (POST/PATCH) | Wajib untuk request dengan body |

---

### 1.4 Format Timestamp

Semua timestamp menggunakan **ISO 8601 UTC**:
```
2026-06-29T06:27:00.000Z
```

---

### 1.5 Konvensi Penamaan

- Path: `kebab-case` (contoh: `/api/dashboard/summary`)
- Field JSON: `snake_case` (contoh: `request_number`, `created_at`)
- Status laporan: `Title Case` dengan spasi (contoh: `"Under Review"`, `"In Progress"`)
- Role user: `snake_case` (contoh: `"manajer_fasilitas"`)

---

## 2. Semua Endpoint

---

## 2a. Authentication Endpoints

*(Ditambahkan oleh CR-02 — tidak butuh token kecuali `GET /api/auth/me` dan `POST /api/auth/logout`)*

---

### POST /api/auth/register

**Deskripsi:** Daftar akun baru. Role otomatis `PELAPOR` — tidak bisa memilih role sendiri.
Admin yang ingin menambah Teknisi harus register dulu lalu upgrade role via `PATCH /api/users/:id/role`.
**FR yang didukung:** CR-02
**Aktor yang boleh akses:** Public (siapapun, tidak butuh token)

**Request Body:**
```json
{
  "name": "Gwen Wenas",
  "email": "gwen@unklab.ac.id",
  "password": "min8karakter"
}
```

| Field | Tipe | Wajib | Validasi |
|---|---|---|---|
| `name` | string | Ya | Minimal 2 karakter |
| `email` | string | Ya | Format email valid, domain bebas |
| `password` | string | Ya | Minimal 8 karakter |

**Response 201 Created:**
```json
{
  "success": true,
  "message": "Akun berhasil dibuat. Silakan login.",
  "data": {
    "id": "uuid-gwen-001",
    "name": "Gwen Wenas",
    "email": "gwen@unklab.ac.id",
    "role": "PELAPOR"
  }
}
```

**Response Error:**
- **409 Conflict** — Email sudah terdaftar
```json
{
  "success": false,
  "error": "Email gwen@unklab.ac.id sudah terdaftar. Gunakan email lain atau langsung login."
}
```
- **422 Unprocessable Entity** — Field tidak lengkap atau password terlalu pendek
```json
{
  "success": false,
  "error": "Password minimal 8 karakter."
}
```
- **400 Bad Request** — Format email tidak valid
```json
{
  "success": false,
  "error": "Format email tidak valid."
}
```

---

### POST /api/auth/login

**Deskripsi:** Login dengan email + password. Mengembalikan token sesi yang disimpan client
di `localStorage` dan dikirim di header `Authorization: Bearer <token>` untuk setiap request berikutnya.
**FR yang didukung:** CR-02
**Aktor yang boleh akses:** Public (tidak butuh token)

**Request Body:**
```json
{
  "email": "gwen@unklab.ac.id",
  "password": "min8karakter"
}
```

**Response 200 OK:**
```json
{
  "success": true,
  "data": {
    "token": "tok_7f3a1b9c2e4d5f6a8b0c1d2e3f4a5b6c",
    "expires_at": "2026-07-06T06:50:00.000Z",
    "user": {
      "id": "uuid-gwen-001",
      "name": "Gwen Wenas",
      "email": "gwen@unklab.ac.id",
      "role": "PELAPOR"
    }
  }
}
```

**Response Error:**
- **401 Unauthorized** — Email atau password salah
```json
{
  "success": false,
  "error": "Email atau password salah."
}
```
- **403 Forbidden** — Akun dinonaktifkan Admin
```json
{
  "success": false,
  "error": "Akun kamu telah dinonaktifkan. Hubungi administrator untuk informasi lebih lanjut."
}
```
- **422 Unprocessable Entity** — Field kosong
```json
{
  "success": false,
  "error": "Email dan password wajib diisi."
}
```

---

### GET /api/auth/me

**Deskripsi:** Cek data user yang sedang login berdasarkan token di header.
Digunakan frontend saat app pertama kali dibuka untuk restore session.
**FR yang didukung:** CR-02
**Aktor yang boleh akses:** Semua role yang sudah login

**Request Headers:**
```
Authorization: Bearer tok_7f3a1b9c2e4d5f6a8b0c1d2e3f4a5b6c
```

**Request Body:** Tidak ada

**Response 200 OK:**
```json
{
  "success": true,
  "data": {
    "id": "uuid-gwen-001",
    "name": "Gwen Wenas",
    "email": "gwen@unklab.ac.id",
    "role": "PELAPOR",
    "is_active": 1
  }
}
```

**Response Error:**
- **401 Unauthorized** — Token tidak ada atau tidak valid
```json
{
  "success": false,
  "error": "Sesi tidak valid atau sudah kedaluwarsa. Silakan login kembali."
}
```
- **403 Forbidden** — Token valid tapi akun dinonaktifkan setelah login
```json
{
  "success": false,
  "error": "Akun kamu telah dinonaktifkan."
}
```

---

### POST /api/auth/logout

**Deskripsi:** Logout — hapus sesi dari tabel `sessions` di database.
Setelah ini token tidak bisa dipakai lagi.
**FR yang didukung:** CR-02
**Aktor yang boleh akses:** Semua role yang sudah login

**Request Headers:**
```
Authorization: Bearer tok_7f3a1b9c2e4d5f6a8b0c1d2e3f4a5b6c
```

**Request Body:** Tidak ada

**Response 200 OK:**
```json
{
  "success": true,
  "message": "Berhasil logout. Sampai jumpa!"
}
```

**Response Error:**
- **401 Unauthorized** — Token sudah tidak valid (sudah logout sebelumnya)
```json
{
  "success": false,
  "error": "Token tidak ditemukan atau sudah tidak aktif."
}
```

---

### PATCH /api/users/:id/role

**Deskripsi:** Admin mengubah role user lain. Ini satu-satunya cara mengubah role —
user tidak bisa mengubah role sendiri.
**FR yang didukung:** CR-02
**Aktor yang boleh akses:** `ADMIN` saja

**Path Params:**

| Param | Tipe | Keterangan |
|---|---|---|
| `id` | string (UUID) | ID user yang akan diubah role-nya |

**Request Body:**
```json
{
  "role": "TEKNISI"
}
```

| Field | Tipe | Wajib | Validasi |
|---|---|---|---|
| `role` | string | Ya | Harus salah satu dari: `PELAPOR`, `ADMIN`, `TEKNISI`, `MANAJER` |

**Response 200 OK:**
```json
{
  "success": true,
  "message": "Role berhasil diubah.",
  "data": {
    "id": "uuid-gwen-001",
    "name": "Gwen Wenas",
    "email": "gwen@unklab.ac.id",
    "role": "TEKNISI"
  }
}
```

**Response Error:**
- **401 Unauthorized** — Belum login
```json
{
  "success": false,
  "error": "Kamu harus login terlebih dahulu."
}
```
- **403 Forbidden** — Bukan ADMIN
```json
{
  "success": false,
  "error": "Hanya ADMIN yang bisa mengubah role pengguna."
}
```
- **403 Forbidden** — Admin mencoba mengubah role dirinya sendiri
```json
{
  "success": false,
  "error": "Kamu tidak bisa mengubah role akun kamu sendiri."
}
```
- **404 Not Found** — User tidak ditemukan
```json
{
  "success": false,
  "error": "User dengan ID tersebut tidak ditemukan."
}
```
- **400 Bad Request** — Nilai role tidak valid
```json
{
  "success": false,
  "error": "Role tidak valid. Pilih salah satu: PELAPOR, ADMIN, TEKNISI, MANAJER."
}
```

---

### PATCH /api/users/:id/status

**Deskripsi:** Admin menonaktifkan atau mengaktifkan kembali akun user.
User yang dinonaktifkan tidak bisa login dan semua session-nya di-invalidate.
**FR yang didukung:** CR-02
**Aktor yang boleh akses:** `ADMIN` saja

**Request Body:**
```json
{
  "is_active": 0
}
```

**Response 200 OK:**
```json
{
  "success": true,
  "message": "Akun pengguna berhasil dinonaktifkan.",
  "data": {
    "id": "uuid-gwen-001",
    "name": "Gwen Wenas",
    "is_active": 0
  }
}
```

**Response Error:**
- **403 Forbidden** — Admin mencoba nonaktifkan akun sendiri
```json
{
  "success": false,
  "error": "Kamu tidak bisa menonaktifkan akun kamu sendiri."
}
```
- **404 Not Found**
```json
{
  "success": false,
  "error": "User dengan ID tersebut tidak ditemukan."
}
```

---

## 2b. Application Endpoints

---

### GET /api/health

**Deskripsi:** Cek apakah Workers API berjalan normal. Digunakan oleh CI/CD pipeline dan monitoring.
**FR yang didukung:** —
**Aktor yang boleh akses:** Semua (tidak butuh header role)

**Request Body:** Tidak ada

**Response 200:**
```json
{
  "success": true,
  "data": {
    "status": "ok",
    "timestamp": "2026-06-29T06:27:00.000Z",
    "version": "1.0.0"
  }
}
```

**Response Error:** Jika Workers tidak bisa merespons, Cloudflare akan return 503 secara otomatis.

---

### GET /api/users

**Deskripsi:** Ambil daftar user, dengan filter role opsional. Utamanya digunakan untuk mengisi dropdown
daftar teknisi saat admin ingin assign laporan.
**FR yang didukung:** FR-04
**Aktor yang boleh akses:** `administrator`

**Query Params:**

| Param | Tipe | Wajib | Keterangan |
|---|---|---|---|
| `role` | string | Tidak | Filter berdasarkan role. Contoh: `?role=teknisi` |

**Request Body:** Tidak ada

**Response 200:**
```json
{
  "success": true,
  "data": [
    {
      "id": 4,
      "name": "Dewi Lestari",
      "email": "dewi@kampus.ac.id",
      "role": "teknisi"
    },
    {
      "id": 5,
      "name": "Eko Prasetyo",
      "email": "eko@kampus.ac.id",
      "role": "teknisi"
    }
  ],
  "meta": {
    "total": 2
  }
}
```

**Response Error:**
- **403 Forbidden** — Role bukan administrator
```json
{
  "success": false,
  "error": "Akses ditolak. Hanya administrator yang bisa melihat daftar pengguna."
}
```
- **400 Bad Request** — Nilai role tidak valid
```json
{
  "success": false,
  "error": "Nilai role tidak valid. Role yang tersedia: pelapor, administrator, teknisi, manajer_fasilitas."
}
```

---

### GET /api/requests

**Deskripsi:** Ambil daftar laporan keluhan. Hasil difilter otomatis berdasarkan role:
pelapor hanya melihat lapora miliknya sendiri, teknisi hanya melihat yang di-assign ke mereka,
admin dan manajer melihat semua. Filter tambahan tersedia via query params.
**FR yang didukung:** FR-02, FR-10
**Aktor yang boleh akses:** Semua role

**Query Params:**

| Param | Tipe | Wajib | Keterangan |
|---|---|---|---|
| `status` | string | Tidak | Filter status: `Submitted`, `Under Review`, dst. |
| `category` | string | Tidak | Filter kategori: `AC`, `Internet`, dst. |
| `keyword` | string | Tidak | Cari berdasarkan judul atau nomor laporan |

**Request Body:** Tidak ada

**Response 200:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "request_number": "CSR-1751177718000",
      "title": "AC Ruang 301 Tidak Berfungsi",
      "location": "Gedung B Lantai 3 Ruang 301",
      "category": "AC",
      "status": "Submitted",
      "priority": "Medium",
      "reporter_name": "Ahmad Fauzi",
      "assigned_to_name": null,
      "created_at": "2026-06-29T06:00:00.000Z",
      "updated_at": "2026-06-29T06:00:00.000Z"
    }
  ],
  "meta": {
    "total": 1
  }
}
```

**Response Error:**
- **400 Bad Request** — Nilai filter tidak valid
```json
{
  "success": false,
  "error": "Nilai status tidak valid. Status yang tersedia: Submitted, Under Review, Assigned, In Progress, Resolved, Closed."
}
```
- **500 Internal Server Error** — Query database gagal
```json
{
  "success": false,
  "error": "Terjadi kesalahan internal saat mengambil data. Silakan coba lagi."
}
```

---

### POST /api/requests

**Deskripsi:** Buat laporan keluhan baru. Request number di-generate otomatis di server.
Status awal selalu `Submitted`. Entry pertama di `status_history` di-insert otomatis
dalam transaksi yang sama.
**FR yang didukung:** FR-01
**Aktor yang boleh akses:** `pelapor`

**Request Body:**
```json
{
  "title": "AC Ruang 301 Tidak Berfungsi",
  "description": "AC di ruang 301 gedung B sudah tidak dingin sejak 3 hari lalu. Kuliah siang sangat tidak nyaman bagi mahasiswa.",
  "location": "Gedung B Lantai 3 Ruang 301",
  "category": "AC"
}
```

| Field | Tipe | Wajib | Validasi |
|---|---|---|---|
| `title` | string | Ya | Minimal 5 karakter |
| `description` | string | Ya | Minimal 20 karakter |
| `location` | string | Ya | Tidak boleh kosong |
| `category` | string | Ya | Harus salah satu dari enum yang valid |

**Response 201 Created:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "request_number": "CSR-1751177718000",
    "title": "AC Ruang 301 Tidak Berfungsi",
    "description": "AC di ruang 301 gedung B sudah tidak dingin sejak 3 hari lalu. Kuliah siang sangat tidak nyaman bagi mahasiswa.",
    "location": "Gedung B Lantai 3 Ruang 301",
    "category": "AC",
    "status": "Submitted",
    "priority": "Medium",
    "reporter_id": 1,
    "reporter_name": "Ahmad Fauzi",
    "assigned_to": null,
    "resolution_notes": null,
    "created_at": "2026-06-29T06:27:00.000Z",
    "updated_at": "2026-06-29T06:27:00.000Z"
  }
}
```

**Response Error:**
- **400 Bad Request** — Validasi gagal (judul terlalu pendek)
```json
{
  "success": false,
  "error": "Judul laporan minimal 5 karakter."
}
```
- **400 Bad Request** — Validasi gagal (deskripsi terlalu pendek)
```json
{
  "success": false,
  "error": "Deskripsi minimal 20 karakter."
}
```
- **400 Bad Request** — Kategori tidak valid
```json
{
  "success": false,
  "error": "Kategori tidak valid. Pilih salah satu: Internet, AC, Peralatan Kelas, Kebersihan, Lainnya."
}
```
- **403 Forbidden** — Bukan pelapor
```json
{
  "success": false,
  "error": "Hanya pelapor yang bisa membuat laporan baru."
}
```

---

### GET /api/requests/:id

**Deskripsi:** Ambil detail lengkap satu laporan: data utama, riwayat status, dan komentar.
**FR yang didukung:** FR-11, FR-09
**Aktor yang boleh akses:** Semua role (dengan pembatasan: pelapor hanya bisa akses laporan miliknya)

**Path Params:**

| Param | Tipe | Keterangan |
|---|---|---|
| `id` | integer | ID laporan |

**Request Body:** Tidak ada

**Response 200:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "request_number": "CSR-1751177718000",
    "title": "AC Ruang 301 Tidak Berfungsi",
    "description": "AC di ruang 301 gedung B sudah tidak dingin sejak 3 hari lalu.",
    "location": "Gedung B Lantai 3 Ruang 301",
    "category": "AC",
    "status": "Resolved",
    "priority": "High",
    "reporter_id": 1,
    "reporter_name": "Ahmad Fauzi",
    "assigned_to": 4,
    "assigned_to_name": "Dewi Lestari",
    "resolution_notes": "AC telah dibersihkan dan freon diisi ulang.",
    "reporter_confirmation": null,
    "rejection_notes": null,
    "created_at": "2026-06-29T06:00:00.000Z",
    "updated_at": "2026-06-29T09:00:00.000Z",
    "resolved_at": "2026-06-29T09:00:00.000Z",
    "closed_at": null,
    "status_history": [
      {
        "id": 1,
        "from_status": null,
        "to_status": "Submitted",
        "changed_by_name": "Ahmad Fauzi",
        "changed_by_role": "pelapor",
        "notes": "Laporan baru dibuat",
        "changed_at": "2026-06-29T06:00:00.000Z"
      },
      {
        "id": 2,
        "from_status": "Submitted",
        "to_status": "Under Review",
        "changed_by_name": "Budi Santoso",
        "changed_by_role": "administrator",
        "notes": null,
        "changed_at": "2026-06-29T07:00:00.000Z"
      },
      {
        "id": 3,
        "from_status": "Under Review",
        "to_status": "Assigned",
        "changed_by_name": "Budi Santoso",
        "changed_by_role": "administrator",
        "notes": null,
        "changed_at": "2026-06-29T07:30:00.000Z"
      },
      {
        "id": 4,
        "from_status": "Assigned",
        "to_status": "In Progress",
        "changed_by_name": "Dewi Lestari",
        "changed_by_role": "teknisi",
        "notes": null,
        "changed_at": "2026-06-29T08:00:00.000Z"
      },
      {
        "id": 5,
        "from_status": "In Progress",
        "to_status": "Resolved",
        "changed_by_name": "Dewi Lestari",
        "changed_by_role": "teknisi",
        "notes": "AC telah dibersihkan dan freon diisi ulang.",
        "changed_at": "2026-06-29T09:00:00.000Z"
      }
    ],
    "comments": [
      {
        "id": 1,
        "user_name": "Budi Santoso",
        "user_role": "administrator",
        "content": "Laporan sudah kami terima, teknisi akan segera ditugaskan.",
        "created_at": "2026-06-29T07:00:00.000Z"
      }
    ]
  }
}
```

**Response Error:**
- **404 Not Found** — Laporan tidak ditemukan
```json
{
  "success": false,
  "error": "Laporan dengan ID 999 tidak ditemukan."
}
```
- **403 Forbidden** — Pelapor mencoba akses laporan orang lain
```json
{
  "success": false,
  "error": "Kamu tidak memiliki akses ke laporan ini."
}
```

---

### PATCH /api/requests/:id/status

**Deskripsi:** Update status laporan. Endpoint ini menangani semua transisi status dari FR-03 sampai FR-08.
Validasi business rule (alur linier, role yang diizinkan, BR-02 untuk teknisi) dilakukan di sini.
**FR yang didukung:** FR-03, FR-05, FR-06, FR-07, FR-08
**Aktor yang boleh akses:** Bergantung pada transisi status (lihat tabel di bawah)

**Tabel Izin Transisi Status:**

| Dari | Ke | Role yang Diizinkan | FR |
|---|---|---|---|
| `Submitted` | `Under Review` | administrator | FR-03 |
| `Assigned` | `In Progress` | teknisi (hanya yang di-assign) | FR-05 |
| `In Progress` | `Resolved` | teknisi (hanya yang di-assign) | FR-06 |
| `Resolved` | `Closed` | administrator | FR-08 |

**Path Params:**

| Param | Tipe | Keterangan |
|---|---|---|
| `id` | integer | ID laporan |

**Request Body:**
```json
{
  "new_status": "Resolved",
  "resolution_notes": "AC telah dibersihkan dan freon diisi ulang. Unit kembali berfungsi normal.",
  "notes": ""
}
```

| Field | Tipe | Wajib | Keterangan |
|---|---|---|---|
| `new_status` | string | Ya | Status baru yang dituju |
| `resolution_notes` | string | Kondisional | Wajib jika `new_status` = `Resolved` (BR-03) |
| `notes` | string | Tidak | Catatan opsional untuk history log |

**Response 200:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "request_number": "CSR-1751177718000",
    "status": "Resolved",
    "resolution_notes": "AC telah dibersihkan dan freon diisi ulang.",
    "resolved_at": "2026-06-29T09:00:00.000Z",
    "updated_at": "2026-06-29T09:00:00.000Z"
  }
}
```

**Response Error:**
- **400 Bad Request** — `new_status` tidak dikirim
```json
{
  "success": false,
  "error": "Field new_status wajib diisi."
}
```
- **400 Bad Request** — Catatan penyelesaian kosong saat transisi ke Resolved
```json
{
  "success": false,
  "error": "Catatan perbaikan wajib diisi sebelum menandai laporan sebagai Resolved."
}
```
- **403 Forbidden** — Role tidak diizinkan untuk transisi ini
```json
{
  "success": false,
  "error": "Hanya administrator yang bisa mengubah status ke Under Review."
}
```
- **403 Forbidden** — Teknisi mencoba update laporan yang bukan tugasnya (BR-02)
```json
{
  "success": false,
  "error": "Kamu tidak ditugaskan ke laporan ini. Hanya teknisi yang di-assign yang bisa memperbarui status."
}
```
- **422 Unprocessable Entity** — Transisi status tidak valid (BR-01)
```json
{
  "success": false,
  "error": "Transisi status tidak valid. Laporan berstatus 'Submitted' tidak bisa langsung dipindahkan ke 'Resolved'."
}
```
- **422 Unprocessable Entity** — Mencoba ubah status laporan Closed (BR-05)
```json
{
  "success": false,
  "error": "Laporan yang sudah Closed tidak bisa diubah statusnya."
}
```
- **404 Not Found**
```json
{
  "success": false,
  "error": "Laporan dengan ID 999 tidak ditemukan."
}
```

---

### PATCH /api/requests/:id/assign

**Deskripsi:** Admin menugaskan teknisi ke laporan yang sudah Under Review.
Endpoint terpisah dari `/status` karena aksi ini butuh payload `assigned_to` 
dan selalu menghasilkan transisi status `Under Review` → `Assigned`.
**FR yang didukung:** FR-04
**Aktor yang boleh akses:** `administrator`

**Path Params:**

| Param | Tipe | Keterangan |
|---|---|---|
| `id` | integer | ID laporan |

**Request Body:**
```json
{
  "assigned_to": 4,
  "notes": "Ditugaskan karena spesialisasi AC"
}
```

| Field | Tipe | Wajib | Keterangan |
|---|---|---|---|
| `assigned_to` | integer | Ya | ID user dengan role teknisi |
| `notes` | string | Tidak | Catatan opsional untuk history log |

**Response 200:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "status": "Assigned",
    "assigned_to": 4,
    "assigned_to_name": "Dewi Lestari",
    "updated_at": "2026-06-29T07:30:00.000Z"
  }
}
```

**Response Error:**
- **400 Bad Request** — `assigned_to` tidak dikirim
```json
{
  "success": false,
  "error": "Field assigned_to wajib diisi."
}
```
- **400 Bad Request** — User yang di-assign bukan teknisi
```json
{
  "success": false,
  "error": "User yang ditugaskan harus memiliki role teknisi."
}
```
- **403 Forbidden** — Bukan administrator
```json
{
  "success": false,
  "error": "Hanya administrator yang bisa menugaskan teknisi."
}
```
- **422 Unprocessable Entity** — Status laporan bukan `Under Review`
```json
{
  "success": false,
  "error": "Teknisi hanya bisa ditugaskan pada laporan berstatus 'Under Review'. Status saat ini: 'Submitted'."
}
```
- **404 Not Found** — Laporan atau user tidak ditemukan
```json
{
  "success": false,
  "error": "Teknisi dengan ID 999 tidak ditemukan."
}
```

---

### PATCH /api/requests/:id/confirm

**Deskripsi:** Pelapor memberikan konfirmasi atas hasil perbaikan laporan yang sudah Resolved.
Jika setuju → history dicatat. Jika tidak setuju → rejection notes disimpan.
**FR yang didukung:** FR-07
**Aktor yang boleh akses:** `pelapor` (hanya yang membuat laporan ini)

**Path Params:**

| Param | Tipe | Keterangan |
|---|---|---|
| `id` | integer | ID laporan |

**Request Body:**
```json
{
  "confirmed": true,
  "rejection_notes": ""
}
```

| Field | Tipe | Wajib | Keterangan |
|---|---|---|---|
| `confirmed` | boolean (0/1) | Ya | `true` = setuju, `false` = tidak setuju |
| `rejection_notes` | string | Kondisional | Wajib jika `confirmed` = false |

**Response 200 (setuju):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "reporter_confirmation": 1,
    "message": "Terima kasih sudah mengkonfirmasi. Laporan siap untuk ditutup oleh administrator."
  }
}
```

**Response 200 (tidak setuju):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "reporter_confirmation": 0,
    "rejection_notes": "AC masih tidak dingin saat dicoba hari ini.",
    "message": "Catatan ketidakpuasan kamu sudah dicatat. Admin akan meninjau ulang laporan ini."
  }
}
```

**Response Error:**
- **403 Forbidden** — Bukan pelapor laporan ini
```json
{
  "success": false,
  "error": "Kamu tidak bisa mengkonfirmasi laporan milik orang lain."
}
```
- **422 Unprocessable Entity** — Laporan belum Resolved
```json
{
  "success": false,
  "error": "Konfirmasi hanya bisa dilakukan pada laporan berstatus 'Resolved'."
}
```
- **400 Bad Request** — Tidak setuju tapi rejection_notes kosong
```json
{
  "success": false,
  "error": "Harap tuliskan alasan ketidakpuasan kamu pada kolom catatan."
}
```

---

### POST /api/requests/:id/comments

**Deskripsi:** Tambahkan komentar publik ke halaman detail laporan.
Tidak bisa komentar di laporan yang sudah `Closed` (BR-05).
**FR yang didukung:** FR-09
**Aktor yang boleh akses:** `pelapor`, `administrator`, `teknisi`

**Path Params:**

| Param | Tipe | Keterangan |
|---|---|---|
| `id` | integer | ID laporan |

**Request Body:**
```json
{
  "content": "Laporan sudah kami terima, teknisi akan segera ditugaskan."
}
```

| Field | Tipe | Wajib | Keterangan |
|---|---|---|---|
| `content` | string | Ya | Isi komentar, minimal 1 karakter |

**Response 201:**
```json
{
  "success": true,
  "data": {
    "id": 5,
    "request_id": 1,
    "user_name": "Budi Santoso",
    "user_role": "administrator",
    "content": "Laporan sudah kami terima, teknisi akan segera ditugaskan.",
    "created_at": "2026-06-29T07:00:00.000Z"
  }
}
```

**Response Error:**
- **400 Bad Request** — Komentar kosong
```json
{
  "success": false,
  "error": "Komentar tidak boleh kosong."
}
```
- **422 Unprocessable Entity** — Laporan sudah Closed (BR-05)
```json
{
  "success": false,
  "error": "Laporan ini sudah ditutup. Komentar tidak bisa ditambahkan."
}
```
- **403 Forbidden** — Manajer mencoba komentar (tidak diizinkan)
```json
{
  "success": false,
  "error": "Manajer fasilitas tidak memiliki izin untuk berkomentar di laporan."
}
```
- **404 Not Found**
```json
{
  "success": false,
  "error": "Laporan dengan ID 999 tidak ditemukan."
}
```

---

### GET /api/requests/:id/history

**Deskripsi:** Ambil riwayat perubahan status sebuah laporan secara kronologis.
Data ini juga sudah disertakan di `GET /api/requests/:id`, namun endpoint ini
tersedia untuk keperluan refresh timeline secara terpisah tanpa reload seluruh detail.
**FR yang didukung:** FR-11
**Aktor yang boleh akses:** Semua role

**Path Params:**

| Param | Tipe | Keterangan |
|---|---|---|
| `id` | integer | ID laporan |

**Request Body:** Tidak ada

**Response 200:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "from_status": null,
      "to_status": "Submitted",
      "changed_by_name": "Ahmad Fauzi",
      "changed_by_role": "pelapor",
      "notes": "Laporan baru dibuat",
      "changed_at": "2026-06-29T06:00:00.000Z"
    },
    {
      "id": 2,
      "from_status": "Submitted",
      "to_status": "Under Review",
      "changed_by_name": "Budi Santoso",
      "changed_by_role": "administrator",
      "notes": null,
      "changed_at": "2026-06-29T07:00:00.000Z"
    }
  ]
}
```

**Response Error:**
- **404 Not Found**
```json
{
  "success": false,
  "error": "Laporan dengan ID 999 tidak ditemukan."
}
```

---

### GET /api/dashboard/summary

**Deskripsi:** Ambil data agregat untuk dashboard Manajer Fasilitas.
Query menggunakan SQL `COUNT ... GROUP BY` langsung di D1 — tidak memuat semua baris.
**FR yang didukung:** FR-12
**Aktor yang boleh akses:** `manajer_fasilitas`, `administrator`

**Query Params:** Tidak ada

**Request Body:** Tidak ada

**Response 200:**
```json
{
  "success": true,
  "data": {
    "by_status": {
      "Submitted": 3,
      "Under Review": 2,
      "Assigned": 5,
      "In Progress": 4,
      "Resolved": 8,
      "Closed": 12
    },
    "by_category": {
      "AC": 10,
      "Internet": 8,
      "Peralatan Kelas": 6,
      "Kebersihan": 4,
      "Lainnya": 6
    },
    "totals": {
      "all": 34,
      "active": 14,
      "resolved": 8,
      "closed": 12
    }
  }
}
```

**Response Error:**
- **403 Forbidden** — Role tidak diizinkan
```json
{
  "success": false,
  "error": "Akses ditolak. Dashboard hanya bisa diakses oleh administrator atau manajer fasilitas."
}
```
- **500 Internal Server Error** — Query agregasi gagal
```json
{
  "success": false,
  "error": "Terjadi kesalahan saat menghitung statistik. Silakan coba lagi."
}
```

---

## 3. Error Catalog

Tabel lengkap semua kemungkinan error di sistem ini:

| HTTP Status | Kode Kondisi | Contoh Pesan | Endpoint Terkait |
|---|---|---|---|
| **400** | Input kosong atau missing | `"Field title wajib diisi."` | POST /requests |
| **400** | Judul terlalu pendek | `"Judul laporan minimal 5 karakter."` | POST /requests |
| **400** | Deskripsi terlalu pendek | `"Deskripsi minimal 20 karakter."` | POST /requests |
| **400** | Kategori tidak valid | `"Kategori tidak valid. Pilih salah satu: ..."` | POST /requests |
| **400** | new_status tidak dikirim | `"Field new_status wajib diisi."` | PATCH /status |
| **400** | Resolution notes kosong | `"Catatan perbaikan wajib diisi sebelum Resolved."` | PATCH /status |
| **400** | assigned_to kosong | `"Field assigned_to wajib diisi."` | PATCH /assign |
| **400** | User bukan teknisi | `"User yang ditugaskan harus memiliki role teknisi."` | PATCH /assign |
| **400** | Komentar kosong | `"Komentar tidak boleh kosong."` | POST /comments |
| **400** | Rejection notes kosong | `"Harap tuliskan alasan ketidakpuasan kamu."` | PATCH /confirm |
| **403** | Role tidak diizinkan | `"Hanya administrator yang bisa melakukan aksi ini."` | Semua endpoint |
| **403** | Teknisi bukan pemilik tugas | `"Kamu tidak ditugaskan ke laporan ini."` | PATCH /status |
| **403** | Pelapor akses laporan orang lain | `"Kamu tidak memiliki akses ke laporan ini."` | GET /requests/:id |
| **404** | Laporan tidak ditemukan | `"Laporan dengan ID 999 tidak ditemukan."` | Semua /requests/:id |
| **404** | User tidak ditemukan | `"Teknisi dengan ID 999 tidak ditemukan."` | PATCH /assign |
| **422** | Transisi status tidak valid | `"Transisi status dari 'X' ke 'Y' tidak diizinkan."` | PATCH /status |
| **422** | Laporan sudah Closed | `"Laporan yang sudah Closed tidak bisa diubah."` | PATCH /status, POST /comments |
| **422** | Assign saat status bukan Under Review | `"Teknisi hanya bisa ditugaskan pada laporan berstatus 'Under Review'."` | PATCH /assign |
| **422** | Konfirmasi bukan saat Resolved | `"Konfirmasi hanya bisa dilakukan pada laporan berstatus 'Resolved'."` | PATCH /confirm |
| **500** | Database error | `"Terjadi kesalahan internal. Silakan coba lagi."` | Semua endpoint |

---

## 4. Matriks Verifikasi FR → Endpoint

| FR | Deskripsi | Endpoint | Status |
|---|---|---|---|
| FR-01 | Submit laporan baru | `POST /api/requests` | ✅ |
| FR-02 | List laporan pribadi | `GET /api/requests` | ✅ |
| FR-03 | Tinjau laporan → Under Review | `PATCH /api/requests/:id/status` | ✅ |
| FR-04 | Assign teknisi → Assigned | `PATCH /api/requests/:id/assign` | ✅ |
| FR-05 | Mulai pengerjaan → In Progress | `PATCH /api/requests/:id/status` | ✅ |
| FR-06 | Tandai selesai → Resolved | `PATCH /api/requests/:id/status` | ✅ |
| FR-07 | Konfirmasi pelapor | `PATCH /api/requests/:id/confirm` | ✅ |
| FR-08 | Tutup laporan → Closed | `PATCH /api/requests/:id/status` | ✅ |
| FR-09 | Tambah komentar | `POST /api/requests/:id/comments` | ✅ |
| FR-10 | Search & filter laporan | `GET /api/requests?status=&category=&keyword=` | ✅ |
| FR-11 | Riwayat status laporan | `GET /api/requests/:id/history` + included di `GET /api/requests/:id` | ✅ |
| FR-12 | Dashboard statistik | `GET /api/dashboard/summary` | ✅ |

✅ **Semua 12 FR memiliki endpoint yang mendukungnya.**

---

## 5. Role Access Matrix

| Endpoint | pelapor | administrator | teknisi | manajer_fasilitas |
|---|---|---|---|---|
| `GET /api/health` | ✅ | ✅ | ✅ | ✅ |
| `GET /api/users` | ❌ | ✅ | ❌ | ❌ |
| `GET /api/requests` | ✅ (laporan sendiri) | ✅ (semua) | ✅ (tugas sendiri) | ✅ (semua) |
| `POST /api/requests` | ✅ | ❌ | ❌ | ❌ |
| `GET /api/requests/:id` | ✅ (laporan sendiri) | ✅ | ✅ | ✅ |
| `PATCH /api/requests/:id/status` | ❌ | ✅ (Under Review→, Closed) | ✅ (In Progress→, Resolved) | ❌ |
| `PATCH /api/requests/:id/assign` | ❌ | ✅ | ❌ | ❌ |
| `PATCH /api/requests/:id/confirm` | ✅ (laporan sendiri) | ❌ | ❌ | ❌ |
| `POST /api/requests/:id/comments` | ✅ | ✅ | ✅ | ❌ |
| `GET /api/requests/:id/history` | ✅ | ✅ | ✅ | ✅ |
| `GET /api/dashboard/summary` | ❌ | ✅ | ❌ | ✅ |

---

## 6. Human Review

> Setelah membaca dokumen ini, jawab pertanyaan berikut
> sebelum lanjut ke implementasi coding:

1. **Kelengkapan Tabel**: Apakah semua tabel di `database.md` memang dibutuhkan oleh FR?
   Adakah yang berlebihan atau ada FR yang tidak punya tabel?

2. **Missing Endpoint**: Adakah endpoint yang hilang?
   Coba cocokkan satu per satu dengan FR di tabel verifikasi (Section 4).

3. **Error Handling**: Apakah error catalog di Section 3 sudah realistis?
   Atau masih ada kasus yang terlewat?

4. **Seed Data**: Apakah data seed di `database.md` cukup untuk demo alur
   `Submitted` → `Under Review` → `Assigned` → `In Progress` → `Resolved` → `Closed`?

### Template Jawaban

```
Yang kurang sreg  : ...
Yang sudah oke    : ...
Yang perlu diubah : ...
Keputusan         : [Disetujui / Perlu revisi — sebutkan apa yang harus direvisi]
```

> Jangan mulai coding sebelum mendapat "Disetujui".
