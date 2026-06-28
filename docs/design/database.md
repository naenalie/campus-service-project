# Database Design — Campus Service Request and Maintenance System

Versi: 1.0 | Tanggal: 2026-06-29 | Status: Draft — Menunggu Human Review

Dokumen ini merancang skema database D1 (SQLite) secara detail sebelum coding dimulai.
Prinsip: **setiap tabel harus bisa di-trace ke FR yang membutuhkannya.**

---

## 1. Entitas dan Relasi

### 1.1 Narasi Entitas

Sistem memiliki **4 entitas utama** yang masing-masing punya alasan keberadaannya:

**`users`** — Menyimpan data semua aktor sistem (Pelapor, Administrator, Teknisi, Manajer Fasilitas).
Dibutuhkan oleh FR-04 (dropdown daftar teknisi) dan sebagai referensi `reporter_id` / `assigned_to`
di tabel requests. Tanpa tabel ini, sistem tidak bisa membedakan siapa yang mengajukan laporan
dan siapa yang mengerjakannya.

**`service_requests`** — Entitas utama sistem. Menyimpan satu baris per laporan keluhan.
Ini adalah tabel pusat yang disentuh oleh hampir semua FR (FR-01 sampai FR-12).
Status laporan disimpan di sini sebagai nilai terkini, sementara riwayat lengkapnya
ada di `status_history`.

**`status_history`** — Menyimpan setiap perubahan status yang pernah terjadi pada sebuah laporan.
Dibutuhkan oleh FR-11 (riwayat perubahan status) dan BR-01 (audit trail alur linier).
Setiap kali status berubah, satu baris baru ditambahkan — bukan menimpa baris lama.
Ini memungkinkan penelusuran "siapa mengubah apa dan kapan" tanpa kehilangan data historis.

**`comments`** — Menyimpan komentar publik per laporan. Dibutuhkan oleh FR-09.
Satu laporan bisa punya banyak komentar dari aktor yang berbeda.
Komentar bersifat append-only — tidak ada edit atau delete (sesuai spirit audit trail).

### 1.2 Diagram Relasi (ERD Teks)

```
users
  │ id (PK)
  │
  ├─────────────────────────────────────────────────────┐
  │                                                     │
  │ (reporter_id)                          (assigned_to)│
  ▼                                                     ▼
service_requests ────────────────────────────────────────
  │ id (PK)
  │
  ├──────────────────────────────┐
  │                              │
  │ (request_id FK)    (request_id FK)
  ▼                              ▼
status_history               comments
  id (PK)                      id (PK)
  request_id (FK)              request_id (FK)
  changed_by (FK → users.id)   user_id (FK → users.id)
```

**Kardinalitas:**
- `users` → `service_requests` (sebagai reporter): **1 ke banyak** (satu user bisa punya banyak laporan)
- `users` → `service_requests` (sebagai teknisi): **1 ke banyak** (satu teknisi bisa dapat banyak tugas)
- `service_requests` → `status_history`: **1 ke banyak** (satu laporan punya banyak entri history)
- `service_requests` → `comments`: **1 ke banyak** (satu laporan bisa punya banyak komentar)
- `users` → `comments`: **1 ke banyak** (satu user bisa punya banyak komentar)
- `users` → `status_history` (sebagai `changed_by`): **1 ke banyak**

---

## 2. Skema SQL Lengkap

### 2.1 Tabel `users`

*Dibutuhkan oleh: FR-04 (dropdown teknisi), FR-01 (reporter_id), seluruh alur status*
*Diperbarui oleh: CR-02 — tambah kolom auth (password_hash, is_active, created_by)*

```sql
CREATE TABLE IF NOT EXISTS users (
  -- Primary key: UUID sebagai TEXT untuk keamanan (bukan integer sequential)
  id            TEXT    PRIMARY KEY,

  -- Nama lengkap user, ditampilkan di UI dan disimpan snapshot di komentar/history
  name          TEXT    NOT NULL,

  -- Email unik — dipakai sebagai username login
  email         TEXT    NOT NULL UNIQUE,

  -- Hash password (bcrypt atau argon2, JANGAN simpan plain text)
  -- Kolom ini wajib ada sejak CR-02 — sistem tidak lagi pakai role simulator
  password_hash TEXT    NOT NULL,

  -- Role sistem — UPPERCASE sesuai CR-02
  -- Nilai: PELAPOR | ADMIN | TEKNISI | MANAJER
  -- Hanya bisa diubah oleh ADMIN via PATCH /api/users/:id/role
  role          TEXT    NOT NULL
                CHECK(role IN ('PELAPOR', 'ADMIN', 'TEKNISI', 'MANAJER')),

  -- Status akun: 1 = aktif, 0 = dinonaktifkan oleh Admin
  -- User yang di-deactivate tidak bisa login (401 atau 403)
  is_active     INTEGER NOT NULL DEFAULT 1
                CHECK(is_active IN (0, 1)),

  -- Timestamp pembuatan akun
  created_at    TEXT    NOT NULL DEFAULT (datetime('now')),

  -- Self-referencing FK: siapa Admin yang membuat akun ini
  -- NULL jika user register sendiri (otomatis dapat role PELAPOR)
  created_by    TEXT    REFERENCES users(id) ON DELETE SET NULL
);

-- Index untuk login: query by email saat POST /api/auth/login
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Index untuk filter berdasarkan role (FR-04: ambil semua TEKNISI untuk dropdown)
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
```

**Aturan bisnis tabel `users` (dari CR-02):**
- User yang **register sendiri** (`POST /api/auth/register`) otomatis mendapat role `PELAPOR`
- Role hanya bisa diubah oleh `ADMIN` via endpoint `PATCH /api/users/:id/role`
- `is_active = 0` berarti akun dinonaktifkan oleh Admin — user tidak bisa login (response 403)
- `created_by` berisi `id` Admin yang membuat akun (NULL jika self-register)

---

### 2.1b Tabel `sessions`

*Tabel baru dari CR-02 — menggantikan mekanisme header X-User-Role + X-User-Id*
*Dibutuhkan oleh: semua endpoint yang butuh autentikasi*

```sql
CREATE TABLE IF NOT EXISTS sessions (
  -- Token unik yang dikirim sebagai Bearer token di header Authorization
  id          TEXT    PRIMARY KEY,

  -- User pemilik sesi ini
  user_id     TEXT    NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Token yang dikirim ke client dan disimpan di localStorage
  -- ON DELETE CASCADE: jika user dihapus, semua sesinya ikut dihapus
  token       TEXT    NOT NULL UNIQUE,

  -- Waktu kadaluarsa token — setelah ini token tidak valid lagi
  -- Format: datetime('now', '+7 days')
  expires_at  TEXT    NOT NULL,

  -- Kapan sesi ini dibuat
  created_at  TEXT    NOT NULL DEFAULT (datetime('now'))
);

-- Index untuk lookup token saat validasi request (dipakai di setiap request)
-- Ini index yang paling sering dipakai — wajib ada
CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token);

-- Index untuk query "hapus semua sesi user X" saat logout all devices
CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);
```

---

### 2.2 Tabel `service_requests`

*Dibutuhkan oleh: FR-01 (create), FR-02 (list), FR-03 (review), FR-04 (assign),
FR-05 (in progress), FR-06 (resolved), FR-07 (konfirmasi), FR-08 (closed),
FR-10 (filter/search), FR-12 (dashboard stats)*

```sql
CREATE TABLE IF NOT EXISTS service_requests (
  -- Primary key
  id              INTEGER PRIMARY KEY AUTOINCREMENT,

  -- Nomor laporan unik yang ditampilkan ke user, format: CSR-<timestamp>
  request_number  TEXT    NOT NULL UNIQUE,

  -- Judul laporan, minimal 5 karakter (validasi di app layer, bukan DB)
  title           TEXT    NOT NULL,

  -- Deskripsi detail kerusakan, minimal 20 karakter (validasi di app layer)
  description     TEXT    NOT NULL,

  -- Lokasi fisik kerusakan (gedung, ruangan, lantai)
  location        TEXT    NOT NULL,

  -- Kategori kerusakan sesuai FR-01
  category        TEXT    NOT NULL
                  CHECK(category IN ('Internet', 'AC', 'Peralatan Kelas', 'Kebersihan', 'Lainnya')),

  -- Status terkini laporan (nilai historis ada di status_history)
  -- Alur linier: Submitted → Under Review → Assigned → In Progress → Resolved → Closed
  status          TEXT    NOT NULL DEFAULT 'Submitted'
                  CHECK(status IN ('Submitted', 'Under Review', 'Assigned', 'In Progress', 'Resolved', 'Closed')),

  -- Prioritas, bisa dimodifikasi admin saat meninjau (FR-03)
  priority        TEXT    NOT NULL DEFAULT 'Medium'
                  CHECK(priority IN ('Low', 'Medium', 'High', 'Critical')),

  -- Foreign key ke users.id — siapa yang melaporkan
  reporter_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE RESTRICT,

  -- Foreign key ke users.id — teknisi yang ditugaskan (NULL sebelum Assigned)
  assigned_to     INTEGER REFERENCES users(id) ON DELETE SET NULL,

  -- Catatan penyelesaian teknis oleh teknisi (wajib saat status → Resolved, BR-03)
  resolution_notes TEXT,

  -- Flag konfirmasi dari pelapor: NULL = belum dikonfirmasi, 1 = setuju, 0 = tidak setuju
  -- Pakai INTEGER karena SQLite tidak punya BOOLEAN
  reporter_confirmation INTEGER CHECK(reporter_confirmation IN (NULL, 0, 1)),

  -- Catatan ketidakpuasan pelapor jika konfirmasi = 0 (tidak setuju)
  rejection_notes TEXT,

  -- Timestamp laporan dibuat
  created_at      TEXT    NOT NULL DEFAULT (datetime('now')),

  -- Timestamp terakhir kali laporan diupdate (status berubah)
  updated_at      TEXT    NOT NULL DEFAULT (datetime('now')),

  -- Timestamp saat laporan ditandai Resolved
  resolved_at     TEXT,

  -- Timestamp saat laporan ditutup (Closed)
  closed_at       TEXT
);

-- Index untuk filter berdasarkan status (FR-02, FR-10, FR-12)
CREATE INDEX IF NOT EXISTS idx_sr_status ON service_requests(status);

-- Index untuk filter berdasarkan kategori (FR-10)
CREATE INDEX IF NOT EXISTS idx_sr_category ON service_requests(category);

-- Index untuk list laporan per pelapor (FR-02)
CREATE INDEX IF NOT EXISTS idx_sr_reporter ON service_requests(reporter_id);

-- Index untuk list tugas per teknisi (FR-05)
CREATE INDEX IF NOT EXISTS idx_sr_assigned ON service_requests(assigned_to);

-- Index untuk search berdasarkan request_number (FR-10)
CREATE INDEX IF NOT EXISTS idx_sr_request_number ON service_requests(request_number);

-- Index untuk sorting berdasarkan waktu buat (default tampilan terbaru di atas)
CREATE INDEX IF NOT EXISTS idx_sr_created_at ON service_requests(created_at DESC);
```

---

### 2.3 Tabel `status_history`

*Dibutuhkan oleh: FR-11 (riwayat status), BR-01 (audit trail alur linier)*

```sql
CREATE TABLE IF NOT EXISTS status_history (
  -- Primary key
  id          INTEGER PRIMARY KEY AUTOINCREMENT,

  -- Laporan yang berubah statusnya
  request_id  INTEGER NOT NULL REFERENCES service_requests(id) ON DELETE CASCADE,

  -- Status sebelum perubahan (NULL untuk entry pertama: Submitted)
  from_status TEXT    CHECK(from_status IN (NULL, 'Submitted', 'Under Review', 'Assigned', 'In Progress', 'Resolved', 'Closed')),

  -- Status setelah perubahan
  to_status   TEXT    NOT NULL
              CHECK(to_status IN ('Submitted', 'Under Review', 'Assigned', 'In Progress', 'Resolved', 'Closed')),

  -- User yang mengubah status (foreign key ke users.id)
  changed_by  INTEGER NOT NULL REFERENCES users(id) ON DELETE RESTRICT,

  -- Catatan opsional saat perubahan status (misalnya: catatan penolakan)
  notes       TEXT,

  -- Timestamp perubahan terjadi
  changed_at  TEXT    NOT NULL DEFAULT (datetime('now'))
);

-- ON DELETE CASCADE: jika laporan dihapus, semua history-nya ikut terhapus
-- Ini masuk akal karena history tidak berguna tanpa laporan induknya

-- Index untuk ambil semua history satu laporan (FR-11)
CREATE INDEX IF NOT EXISTS idx_sh_request ON status_history(request_id, changed_at);
```

---

### 2.4 Tabel `comments`

*Dibutuhkan oleh: FR-09 (komentar publik per laporan)*

```sql
CREATE TABLE IF NOT EXISTS comments (
  -- Primary key
  id          INTEGER PRIMARY KEY AUTOINCREMENT,

  -- Laporan yang dikomentari
  request_id  INTEGER NOT NULL REFERENCES service_requests(id) ON DELETE CASCADE,

  -- User yang berkomentar (pelapor, admin, atau teknisi)
  user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE RESTRICT,

  -- Nama user saat komentar dibuat (di-snapshot agar nama tidak berubah jika user diubah)
  user_name   TEXT    NOT NULL,

  -- Role user saat komentar dibuat (untuk label di UI: "[Admin] Budi: ...")
  user_role   TEXT    NOT NULL,

  -- Isi komentar
  content     TEXT    NOT NULL,

  -- Timestamp komentar dibuat
  created_at  TEXT    NOT NULL DEFAULT (datetime('now'))
);

-- ON DELETE CASCADE: komentar ikut terhapus jika laporan dihapus

-- Index untuk ambil semua komentar satu laporan (FR-09)
CREATE INDEX IF NOT EXISTS idx_comments_request ON comments(request_id, created_at);
```

---

### 2.5 Ringkasan: Traceability Tabel → FR

| Tabel | FR yang Didukung | Alasan |
|---|---|---|
| `users` | FR-04 | Ambil daftar teknisi untuk dropdown assign |
| `service_requests` | FR-01, 02, 03, 04, 05, 06, 07, 08, 10, 12 | Entitas utama laporan keluhan |
| `status_history` | FR-11, BR-01 | Riwayat perubahan status per laporan |
| `comments` | FR-09 | Komentar publik per laporan |

✅ Tidak ada tabel yang tidak bisa di-trace ke FR.

---

## 3. Migration Plan

File migrasi dijalankan secara berurutan. **Parent tabel harus dibuat sebelum child tabel**
karena child tabel punya foreign key ke parent.

### Urutan Migration

```
database/migrations/
├── 0001_create_users.sql           ← Parent tabel, tidak ada FK ke tabel lain
├── 0002_create_service_requests.sql ← FK ke users (reporter_id, assigned_to)
├── 0003_create_status_history.sql  ← FK ke service_requests dan users
├── 0004_create_comments.sql        ← FK ke service_requests dan users
└── 0005_seed_users.sql             ← Data awal: satu user per role untuk demo
```

### Alasan Urutan

1. `users` dulu — karena `service_requests`, `status_history`, dan `comments` semuanya referensi ke `users`
2. `service_requests` kedua — karena `status_history` dan `comments` referensi ke tabel ini
3. `status_history` dan `comments` bisa dibalik urutannya, keduanya tidak saling referensi

### Seed Data (0005_seed_users.sql)

Data awal yang dibutuhkan agar demo bisa langsung dijalankan:

```sql
-- Aktifkan foreign key enforcement
PRAGMA foreign_keys = ON;

-- Seed 4 user, satu per role
INSERT INTO users (name, email, role) VALUES
  ('Ahmad Fauzi',      'ahmad@kampus.ac.id',   'pelapor'),
  ('Siti Rahayu',      'siti@kampus.ac.id',    'pelapor'),
  ('Budi Santoso',     'budi@kampus.ac.id',    'administrator'),
  ('Dewi Lestari',     'dewi@kampus.ac.id',    'teknisi'),
  ('Eko Prasetyo',     'eko@kampus.ac.id',     'teknisi'),
  ('Hendra Wijaya',    'hendra@kampus.ac.id',  'manajer_fasilitas');

-- Seed 1 laporan contoh agar demo langsung ada data
INSERT INTO service_requests (request_number, title, description, location, category, status, reporter_id)
VALUES (
  'CSR-1751177718000',
  'AC Ruang 301 Tidak Berfungsi',
  'AC di ruang 301 gedung B sudah tidak dingin sejak 3 hari lalu. Kuliah siang sangat tidak nyaman.',
  'Gedung B Lantai 3 Ruang 301',
  'AC',
  'Submitted',
  1  -- Ahmad Fauzi
);

-- Seed history pertama untuk laporan di atas
INSERT INTO status_history (request_id, from_status, to_status, changed_by, notes)
VALUES (1, NULL, 'Submitted', 1, 'Laporan pertama kali dibuat');
```

---

## 4. Query Penting

### 4.1 GET Semua Laporan dengan Filter Status + Kategori

*Digunakan oleh: FR-02 (pelapor), FR-03 (admin), FR-10 (search/filter)*

```sql
-- Ambil semua laporan dengan nama pelapor dan nama teknisi
-- Filter opsional: status dan/atau kategori dan/atau search keyword
-- Jika filter tidak dikirim, tampilkan semua

SELECT
  sr.id,
  sr.request_number,
  sr.title,
  sr.location,
  sr.category,
  sr.status,
  sr.priority,
  sr.created_at,
  sr.updated_at,
  u_reporter.name  AS reporter_name,
  u_tech.name      AS assigned_to_name
FROM service_requests sr
JOIN  users u_reporter ON sr.reporter_id   = u_reporter.id
LEFT JOIN users u_tech ON sr.assigned_to   = u_tech.id
WHERE
  (sr.status   = :status   OR :status   IS NULL)   -- filter status opsional
  AND (sr.category = :category OR :category IS NULL)   -- filter kategori opsional
  AND (                                                 -- search opsional
    sr.title          LIKE '%' || :keyword || '%'
    OR sr.request_number LIKE '%' || :keyword || '%'
    OR :keyword IS NULL
  )
  AND (sr.reporter_id = :reporter_id OR :reporter_id IS NULL) -- filter per pelapor
  AND (sr.assigned_to = :tech_id     OR :tech_id     IS NULL) -- filter per teknisi
ORDER BY sr.created_at DESC;
```

---

### 4.2 GET Detail Laporan Beserta History dan Komentar (JOIN)

*Digunakan oleh: FR-11 (history), FR-09 (komentar), RequestDetail page*

```sql
-- Query 1: Data utama laporan
SELECT
  sr.*,
  u_reporter.name  AS reporter_name,
  u_reporter.email AS reporter_email,
  u_tech.name      AS assigned_to_name
FROM service_requests sr
JOIN  users u_reporter ON sr.reporter_id = u_reporter.id
LEFT JOIN users u_tech ON sr.assigned_to = u_tech.id
WHERE sr.id = :request_id;

-- Query 2: Riwayat status laporan (untuk status timeline)
SELECT
  sh.id,
  sh.from_status,
  sh.to_status,
  sh.notes,
  sh.changed_at,
  u.name AS changed_by_name,
  u.role AS changed_by_role
FROM status_history sh
JOIN users u ON sh.changed_by = u.id
WHERE sh.request_id = :request_id
ORDER BY sh.changed_at ASC;

-- Query 3: Komentar laporan
SELECT
  c.id,
  c.content,
  c.user_name,
  c.user_role,
  c.created_at
FROM comments c
WHERE c.request_id = :request_id
ORDER BY c.created_at ASC;

-- Catatan: ketiga query ini dijalankan terpisah dari Workers,
-- hasilnya digabungkan di handler sebelum dikirim ke frontend.
```

---

### 4.3 INSERT Laporan Baru + Otomatis Insert ke Status History

*Digunakan oleh: FR-01 (submit laporan)*

```sql
-- Harus dijalankan dalam satu TRANSAKSI agar atomik
-- Jika salah satu gagal, keduanya di-rollback

BEGIN TRANSACTION;

-- Step 1: Insert laporan baru
INSERT INTO service_requests (
  request_number,
  title,
  description,
  location,
  category,
  status,
  priority,
  reporter_id
) VALUES (
  :request_number,  -- 'CSR-' || strftime('%s','now') * 1000
  :title,
  :description,
  :location,
  :category,
  'Submitted',      -- status awal selalu Submitted
  'Medium',         -- prioritas default, bisa diubah admin nanti
  :reporter_id
);

-- Step 2: Insert entry pertama di status_history
INSERT INTO status_history (
  request_id,
  from_status,
  to_status,
  changed_by,
  notes
) VALUES (
  last_insert_rowid(),  -- id dari INSERT di atas
  NULL,                 -- tidak ada status sebelumnya (laporan baru)
  'Submitted',
  :reporter_id,
  'Laporan baru dibuat'
);

COMMIT;
```

---

### 4.4 Dashboard: COUNT Laporan per Status

*Digunakan oleh: FR-12 (dashboard manajer)*

```sql
-- Agregat jumlah laporan per status
SELECT
  status,
  COUNT(*) AS total
FROM service_requests
GROUP BY status;

-- Agregat jumlah laporan per kategori
SELECT
  category,
  COUNT(*) AS total
FROM service_requests
GROUP BY category
ORDER BY total DESC;

-- Angka ringkasan utama untuk StatsCard
SELECT
  COUNT(*)                                                    AS total_semua,
  SUM(CASE WHEN status = 'Submitted'    THEN 1 ELSE 0 END)  AS total_submitted,
  SUM(CASE WHEN status = 'Under Review' THEN 1 ELSE 0 END)  AS total_under_review,
  SUM(CASE WHEN status = 'Assigned'     THEN 1 ELSE 0 END)  AS total_assigned,
  SUM(CASE WHEN status = 'In Progress'  THEN 1 ELSE 0 END)  AS total_in_progress,
  SUM(CASE WHEN status = 'Resolved'     THEN 1 ELSE 0 END)  AS total_resolved,
  SUM(CASE WHEN status = 'Closed'       THEN 1 ELSE 0 END)  AS total_closed
FROM service_requests;
```

---

## 5. Matriks Validasi: Semua FR Tercakup

| FR | Tabel | Kolom Kunci | Status |
|---|---|---|---|
| FR-01 | `service_requests` | title, description, location, category, status, reporter_id | ✅ |
| FR-02 | `service_requests` | reporter_id, status | ✅ |
| FR-03 | `service_requests`, `status_history` | status (→ Under Review), priority | ✅ |
| FR-04 | `service_requests`, `users` | assigned_to, status (→ Assigned) | ✅ |
| FR-05 | `service_requests`, `status_history` | status (→ In Progress) | ✅ |
| FR-06 | `service_requests`, `status_history` | status (→ Resolved), resolution_notes | ✅ |
| FR-07 | `service_requests`, `status_history` | reporter_confirmation, rejection_notes | ✅ |
| FR-08 | `service_requests`, `status_history` | status (→ Closed), closed_at | ✅ |
| FR-09 | `comments` | request_id, user_id, content | ✅ |
| FR-10 | `service_requests` | status, category, title, request_number (index) | ✅ |
| FR-11 | `status_history` | request_id, from_status, to_status, changed_by, changed_at | ✅ |
| FR-12 | `service_requests` | COUNT per status, COUNT per category | ✅ |

✅ **Semua 12 FR memiliki tabel dan kolom yang mendukungnya.**
