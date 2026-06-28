# Skill 07 — Database & API Design

## Tujuan

Merancang struktur database dan kontrak API secara detail sebelum mulai coding.

Prinsip dasar skill ini diambil dari Pressman: **"Design data as seriously as functions."**
Artinya skema tabel, tipe data, constraint, dan relasi harus dipikirkan sedetail 
logika kode — bukan asal buat dan dibenerin belakangan. Database yang buruk di awal 
akan menjadi utang teknis yang mahal saat sistem sudah berjalan.

Skill ini menghasilkan dua dokumen terpisah:
- `docs/design/database.md` — rancangan skema SQL lengkap
- `docs/design/api.md` — kontrak API endpoint (request + response + error)

---

## Kapan Digunakan

Setelah `docs/design/architecture.md` selesai dan direview manusia.
Jangan mulai coding tabel atau endpoint sebelum kedua dokumen ini selesai.

---

## Input

- `docs/requirements/requirements.md` — untuk tahu entitas dan business rule
- `docs/design/architecture.md` — untuk tahu komponen dan alur data yang sudah disepakati

---

## Langkah Kerja

### Langkah 1 — Identifikasi Entitas dari Requirements

Baca semua FR dan BR. Untuk tiap FR, tanya: "Data apa yang harus disimpan supaya FR ini bisa berjalan?"

Hasilkan daftar entitas (calon tabel). Contoh format:

| Entitas | Asal FR/BR | Keterangan |
|---|---|---|
| Request | FR-01, FR-02, FR-03... | Data utama laporan keluhan |
| ... | ... | ... |

**Aturan**: Jangan buat entitas yang tidak bisa di-trace ke FR atau BR. 
No gold-plating.

---

### Langkah 2 — Tentukan Atribut Tiap Entitas

Untuk setiap entitas, tentukan:
- Nama kolom (snake_case, konsisten)
- Tipe data yang tepat untuk SQLite (`TEXT`, `INTEGER`, `REAL`, `BLOB`, `NULL`)
- Constraint yang berlaku: `NOT NULL`, `UNIQUE`, `DEFAULT`, `CHECK`
- Apakah primary key, foreign key, atau biasa

Ingat batasan D1 (SQLite):
- Tidak ada tipe `ENUM` — gunakan `TEXT` dengan `CHECK` constraint
- Tidak ada tipe `BOOLEAN` — gunakan `INTEGER` (0/1)
- Tidak ada `AUTO_INCREMENT` — gunakan `INTEGER PRIMARY KEY` (SQLite auto-increment)
- Timestamp: simpan sebagai `TEXT` format ISO 8601 (`datetime('now')`)

Format dokumentasi per tabel:

```sql
CREATE TABLE nama_tabel (
  id          INTEGER PRIMARY KEY,
  kolom_a     TEXT    NOT NULL,
  kolom_b     INTEGER DEFAULT 0,
  -- ... dst
  created_at  TEXT    NOT NULL DEFAULT (datetime('now'))
);
```

Sertakan komentar SQL untuk kolom yang tidak self-explanatory.

---

### Langkah 3 — Tentukan Relasi Antar Entitas

Gambarkan relasi dengan diagram teks ERD sederhana:

```
requests ─────────────< request_status_history
   │ 1                               ∞
   │
   └─────────────< comments
         1               ∞
```

Untuk setiap foreign key:
- Tentukan perilaku `ON DELETE`: `CASCADE`, `SET NULL`, atau `RESTRICT`
- Jelaskan alasannya (jangan pakai default tanpa alasan)

---

### Langkah 4 — Rancang Skema SQL Final untuk D1

Tulis SQL CREATE TABLE yang siap dijalankan, dengan:
- Semua kolom dan constraint
- Foreign key (SQLite: harus aktifkan dengan `PRAGMA foreign_keys = ON`)
- Urutan pembuatan tabel yang benar (parent sebelum child)

Hasil akhir harus bisa langsung di-copy ke file migrasi SQL.

---

### Langkah 5 — Buat Index yang Tepat

Untuk kolom yang sering muncul di:
- `WHERE` clause (filter)
- `ORDER BY` (sorting)
- `JOIN` condition
- `GROUP BY` (agregasi)

Buat index. Format:

```sql
CREATE INDEX idx_requests_status ON requests(status);
CREATE INDEX idx_requests_reporter ON requests(reporter_id);
-- dst.
```

Jangan buat index untuk semua kolom — hanya yang memang sering di-query.
Jelaskan FR mana yang membutuhkan index tersebut.

---

### Langkah 6 — List Semua Endpoint API

Kumpulkan semua endpoint yang dibutuhkan berdasarkan FR dan alur data di `architecture.md`.
Kelompokkan per resource:

| Method | Path | Handler | FR yang Didukung | Role yang Boleh Akses |
|---|---|---|---|---|
| POST | /api/requests | createRequest | FR-01 | pelapor |
| GET | /api/requests | listRequests | FR-02, FR-10 | semua |
| ... | ... | ... | ... | ... |

Pastikan semua 12 FR punya minimal satu endpoint yang mendukungnya.

---

### Langkah 7 — Dokumentasikan Tiap Endpoint Secara Detail

Untuk setiap endpoint, tulis:

```
### METHOD /api/path

**Deskripsi**: Apa yang dilakukan endpoint ini.
**FR yang didukung**: FR-XX
**Role yang boleh akses**: pelapor / administrator / teknisi / semua

**Request Headers**:
- X-User-Role: [role pengirim]
- X-User-Id: [id pengirim]
- Content-Type: application/json (untuk POST/PATCH)

**Request Body** (jika ada):
{
  "field": "tipe dan keterangan"
}

**Response Sukses** (200/201):
{
  "success": true,
  "data": { ... }
}

**Response Error**:
- 400 Bad Request: validasi input gagal
  { "success": false, "error": "Deskripsi minimal 20 karakter" }
- 403 Forbidden: role tidak diizinkan
  { "success": false, "error": "Aksi ini hanya bisa dilakukan oleh administrator" }
- 404 Not Found: resource tidak ditemukan
  { "success": false, "error": "Laporan dengan ID tersebut tidak ditemukan" }
- 422 Unprocessable Entity: business rule dilanggar
  { "success": false, "error": "Status tidak bisa diubah dari Submitted ke Resolved" }
- 500 Internal Server Error: error dari database/runtime
  { "success": false, "error": "Terjadi kesalahan internal. Coba lagi." }
```

**Aturan keras**: Setiap endpoint WAJIB punya minimal:
- 1 contoh request + response sukses
- 2 contoh response error yang realistis (bukan hanya "500 server error")

---

### Langkah 8 — Verifikasi Kelengkapan

Sebelum selesai, jalankan dua verifikasi ini:

**Verifikasi A — FR Coverage**:
Buat tabel:

| FR | Endpoint yang Mendukung | Status |
|---|---|---|
| FR-01 | POST /api/requests | ✅ |
| FR-02 | GET /api/requests | ✅ |
| ... | ... | ... |

Tidak boleh ada baris dengan status ❌ di dokumen final.

**Verifikasi B — Role Coverage**:
Buat tabel:

| Role | Endpoint yang Bisa Diakses |
|---|---|
| pelapor | POST /api/requests, GET /api/requests, ... |
| administrator | ... |
| teknisi | ... |
| manajer fasilitas | ... |

---

## Output

### `docs/design/database.md`

```markdown
# Database Design — [Nama Sistem]

## 1. Daftar Entitas dan Alasannya
## 2. ERD (Entity Relationship Diagram)
## 3. Skema SQL Lengkap
## 4. Index dan Alasannya
## 5. Seed Data Awal (untuk development/testing)
```

### `docs/design/api.md`

```markdown
# API Contract — [Nama Sistem]

## 1. Konvensi Umum
   (base URL, format header, format error, format timestamp)
## 2. Endpoint per Resource
   - /api/requests
   - /api/comments
   - /api/dashboard
   - /api/users
## 3. Tabel Verifikasi FR Coverage
## 4. Tabel Role Access Matrix
```

---

## Aturan

- Jangan buat tabel yang tidak ada FR-nya — setiap tabel harus bisa di-trace
- Tiap endpoint **WAJIB** ada contoh request dan response JSON-nya (bukan hanya deskripsi)
- Error response harus lengkap — jangan hanya tulis happy path
- Nama kolom konsisten: `snake_case` (bukan camelCase, bukan PascalCase)
- Tiap endpoint harus ada penjelasan siapa yang boleh akses dan siapa yang tidak
- Format error response harus konsisten di semua endpoint: `{ "success": false, "error": "..." }`

---

## Quality Check

Sebelum serahkan ke human review, pastikan semua ini terpenuhi:

- [ ] Semua FR punya tabel/kolom yang mendukungnya?
- [ ] Tidak ada tabel yang dibuat tanpa FR yang membutuhkannya?
- [ ] Semua endpoint ada contoh request + response JSON-nya?
- [ ] Setiap endpoint minimal punya 2 contoh error response yang realistis?
- [ ] Ada index untuk kolom yang sering di-filter, search, atau JOIN?
- [ ] Relasi antar tabel sudah benar — foreign key dengan ON DELETE yang tepat?
- [ ] Urutan CREATE TABLE sudah benar (parent tabel dulu, child tabel belakangan)?
- [ ] Seed data awal untuk development sudah ada (minimal data user per role)?
- [ ] Tabel verifikasi FR Coverage sudah semua ✅?

---

## Kondisi Gagal

Berhenti dan minta input manusia jika:

- `architecture.md` belum ada atau belum direview
- Ada FR yang tidak jelas entitas datanya (tidak tahu harus simpan di tabel mana)
- Ada konflik antara dua FR yang membutuhkan struktur data yang saling bertentangan
- Business rule (BR) menuntut constraint database yang tidak bisa diimplementasikan di SQLite/D1

---

## Human Review

> Setelah membaca `docs/design/database.md` dan `docs/design/api.md`,
> jawab pertanyaan berikut sebelum lanjut ke implementasi coding:

### Pertanyaan Review

1. **Kelengkapan Tabel**: Apakah semua tabel yang dibuat memang dibutuhkan oleh FR?
   Adakah tabel yang terasa berlebihan atau sebaliknya — ada FR yang tidak punya tabel pendukung?

2. **Missing Endpoint**: Adakah endpoint yang hilang — ada fitur di FR tapi tidak ada endpoint-nya?
   Coba cocokkan satu per satu.

3. **Error Handling**: Apakah error response yang terdokumentasi sudah realistis?
   Atau masih terlalu optimis (hanya happy path)?

4. **Seed Data**: Apakah seed data yang diusulkan cukup untuk demo semua alur status 
   dari `Submitted` sampai `Closed`?

### Template Jawaban

```
Yang kurang sreg  : ...
Yang sudah oke    : ...
Yang perlu diubah : ...
Keputusan         : [Disetujui / Perlu revisi — sebutkan apa yang harus direvisi]
```

> Jangan lanjut ke coding sebelum mendapat "Disetujui" dari manusia.
