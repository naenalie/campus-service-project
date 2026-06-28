# Skill 08 — Interface & Component Design

## Tujuan

Merancang bagaimana user berinteraksi dengan sistem (**Interface Design**)
dan bagaimana logika internal tiap halaman/komponen bekerja (**Component Design**).

Skill ini menggabungkan dua elemen Pressman Chapter 9 sekaligus karena dalam
konteks React app, keduanya tidak bisa dipisahkan:
- **Interface Design** → "Tune UI for end-user": halaman apa, alur navigasi bagaimana,
  elemen apa yang muncul dalam kondisi tertentu
- **Component Design** → "Each module should do one thing": komponen React yang modular,
  props yang jelas, state yang terdefinisi

Skill ini menghasilkan dua dokumen:
- `docs/design/ui-flow.md` — halaman, alur navigasi, wireframe teks
- `docs/design/component-design.md` — spesifikasi teknis tiap komponen React

---

## Kapan Digunakan

Setelah `docs/design/database.md` dan `docs/design/api.md` selesai dan direview manusia.
Jangan mulai coding komponen sebelum kedua dokumen ini selesai — refactor UI jauh
lebih mahal daripada refactor database schema.

---

## Input

- `docs/requirements/requirements.md` — untuk tahu semua FR dan aktornya
- `docs/design/api.md` — untuk tahu endpoint mana yang dipanggil tiap halaman
- `docs/design/architecture.md` — untuk konsistensi struktur folder

---

## Langkah Kerja

### Langkah 1 — Daftar Semua Halaman Berdasarkan FR

Baca semua FR. Untuk setiap FR, tanya: "Di halaman mana user melakukan aksi ini?"

Kelompokkan halaman per aktor karena setiap aktor punya konteks dan kebutuhan berbeda.
Satu halaman boleh diakses oleh lebih dari satu aktor selama konteksnya sama.

Format output:

| Halaman | Route | Aktor | FR yang Ditangani |
|---|---|---|---|
| Dashboard Pelapor | `/` (role: pelapor) | Pelapor | FR-01, FR-02, FR-10 |
| ... | ... | ... | ... |

**Aturan**: Jangan buat halaman yang tidak bisa di-trace ke FR.

---

### Langkah 2 — Komponen React untuk Tiap Halaman

Untuk setiap halaman, daftar komponen React yang dibutuhkan.
Pisahkan antara:
- **Page component** — bertanggung jawab mengambil data (fetch) dan mengorkestrasi layout
- **UI component** — bertanggung jawab menampilkan data, menerima props, tidak fetch sendiri
- **Shared component** — dipakai di lebih dari satu halaman

Aturan modularitas:
- Komponen tidak boleh punya lebih dari satu "alasan untuk berubah"
- Komponen yang berisi form validasi tidak perlu tahu tentang routing
- Komponen yang berisi daftar data tidak perlu tahu tentang form submit

---

### Langkah 3 — Satu Komponen = Satu Tanggung Jawab

Untuk setiap komponen, jawab pertanyaan ini:
> "Apa satu hal yang komponen ini lakukan, dan hanya itu?"

Jika jawabannya mengandung kata "dan" lebih dari sekali, komponen itu terlalu besar.
Pecah menjadi komponen yang lebih kecil.

Contoh yang **salah** (satu komponen terlalu banyak tanggung jawab):
```
RequestDetailPage
  └─ menampilkan detail + merender form komentar + merender history +
     memanggil API status update + mengelola state konfirmasi + routing
```

Contoh yang **benar** (setiap komponen satu tanggung jawab):
```
RequestDetailPage          ← orkestrasi dan fetch data
├── RequestInfo            ← tampilkan info utama laporan (read-only)
├── StatusActions          ← tombol aksi sesuai role dan status
├── StatusHistory          ← timeline perubahan status
└── CommentSection         ← list komentar + form tambah komentar
    ├── CommentList        ← hanya tampilkan list
    └── CommentForm        ← hanya form input
```

---

### Langkah 4 — Alur Navigasi Antar Halaman

Gambarkan alur navigasi dengan diagram teks:

```
[RoleSwitcher pilih "pelapor"]
         │
         ▼
[Dashboard Pelapor]
   ├── klik "Buat Laporan" ──► [Form Laporan Baru] ──► submit ──► kembali ke Dashboard
   ├── klik nama laporan ────► [Detail Laporan]
   └── klik filter status ──► [Dashboard Pelapor] (filter aktif)
```

Gambarkan alur terpisah untuk setiap aktor.
Pastikan semua transisi status di business rule bisa dilakukan dari halaman yang tepat.

---

### Langkah 5 — Wireframe Teks untuk Tiap Halaman

Buat wireframe ASCII/teks untuk setiap halaman.
Wireframe harus menunjukkan:
- Layout (header, sidebar, konten utama)
- Elemen interaktif (button, input, dropdown)
- Kondisi kosong (empty state) dan kondisi loading
- Perbedaan tampilan per role (jika ada)

Format contoh:
```
┌─────────────────────────────────────────────────────┐
│  HEADER: Logo | [Role: Pelapor ▼]                   │
├─────────────────────────────────────────────────────┤
│  [+ Buat Laporan Baru]                              │
│                                                     │
│  Filter: [Status ▼] [Kategori ▼] [🔍 Cari...]      │
│                                                     │
│  ┌───────────────────────────────────────────────┐  │
│  │ CSR-001 | AC Ruang 301 | [Submitted] | 29 Jun │  │
│  └───────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────┐  │
│  │ CSR-002 | Internet Lambat | [Resolved] | ...  │  │
│  └───────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
```

---

### Langkah 6 — State Management Tiap Komponen

Untuk setiap komponen yang punya state, dokumentasikan:
- State apa yang disimpan
- Kapan state berubah
- Apakah state perlu dibagikan ke komponen lain (→ lift state up / gunakan context)

Format:
```
Komponen: RequestForm
State lokal:
  - formData: { title, description, location, category } — nilai input user
  - errors: { title?, description?, location?, category? } — pesan error validasi
  - isSubmitting: boolean — disable tombol saat request sedang dikirim
  - submitError: string | null — error dari API (bukan validasi)
Props diterima:
  - onSuccess: (newRequest) => void — callback setelah submit berhasil
```

---

### Langkah 7 — API Call per Halaman

Untuk setiap halaman, dokumentasikan:
- Endpoint mana yang dipanggil saat halaman dimuat (onMount)
- Endpoint mana yang dipanggil saat user melakukan aksi
- Bagaimana error dari API ditampilkan ke user

Format tabel:
| Halaman | Trigger | Endpoint | Kondisi Error |
|---|---|---|---|
| Dashboard Pelapor | onMount | `GET /api/requests` | Tampilkan banner "Gagal memuat data" |
| Dashboard Pelapor | klik submit | `POST /api/requests` | Tampilkan error di bawah form |

---

## Output

### `docs/design/ui-flow.md`

```markdown
# UI Flow Design — [Nama Sistem]

## 1. Daftar Halaman dan FR yang Ditangani
## 2. Alur Navigasi per Aktor
   - Alur Pelapor
   - Alur Administrator
   - Alur Teknisi
   - Alur Manajer Fasilitas
## 3. Wireframe Tiap Halaman
   (ASCII layout per halaman, termasuk empty state)
## 4. Conditional UI — Elemen yang Muncul/Sembunyi Berdasarkan Kondisi
## 5. Verifikasi: Semua FR Punya Halaman?
```

### `docs/design/component-design.md`

```markdown
# Component Design — [Nama Sistem]

## 1. Hierarki Komponen (Component Tree)
## 2. Spesifikasi Tiap Komponen
   (nama, tanggung jawab, props, state lokal, API call, catatan)
## 3. Shared Components
## 4. Context dan Global State
## 5. API Call Map per Halaman
```

---

## Aturan

- Satu komponen React = satu tanggung jawab — kalau bisa dijawab dengan "dan" lebih dari sekali, pecah
- Jangan buat halaman yang tidak ada FR-nya (no gold-plating)
- Wireframe harus menunjukkan **semua elemen penting** termasuk empty state dan loading state
- Setiap komponen yang punya state **wajib** ada dokumentasi props dan state-nya
- Komponen UI (presentational) tidak boleh memanggil API sendiri —
  semua fetch hanya dilakukan di page component atau custom hook

---

## Quality Check

Sebelum serahkan ke human review, pastikan semua ini terpenuhi:

- [ ] Semua FR punya halaman/komponen yang menanganinya?
- [ ] Tidak ada halaman yang dibuat tanpa FR yang membutuhkannya?
- [ ] Setiap komponen punya satu tanggung jawab yang jelas?
- [ ] Komponen sudah dipecah menjadi page, UI, dan shared component?
- [ ] Alur navigasi sudah logis untuk setiap aktor?
- [ ] Wireframe menunjukkan empty state, loading state, dan error state?
- [ ] Conditional UI sudah terdefinisi — elemen mana yang muncul/sembunyi berdasarkan role dan status?
- [ ] State management sudah direncanakan — mana yang lokal, mana yang di-lift ke parent, mana yang di context?
- [ ] Tabel API Call per halaman sudah lengkap?

---

## Kondisi Gagal

Berhenti dan minta input manusia jika:

- `docs/design/api.md` belum ada atau belum direview
- Ada FR yang tidak jelas "di halaman mana" user melakukan aksinya
- Ada konflik antara tampilan yang diinginkan dua aktor di halaman yang sama

---

## Human Review

> Setelah membaca `docs/design/ui-flow.md` dan `docs/design/component-design.md`,
> jawab pertanyaan berikut sebelum mulai coding:

### Pertanyaan Review

1. **Alur Navigasi**: Apakah alur navigasi sudah masuk akal untuk pengguna kampus?
   Coba bayangkan diri kamu sebagai teknisi — apakah kamu bisa menemukan laporan
   yang ditugaskan dan mengubah statusnya tanpa kebingungan?

2. **Halaman yang Missing**: Adakah halaman yang dibutuhkan user tapi tidak ada
   di dokumen ini? Misalnya: halaman konfirmasi setelah submit, halaman 404, dll.

3. **Modularitas Komponen**: Apakah komponen yang dirancang sudah benar-benar modular?
   Adakah komponen yang terasa terlalu besar (god component)?

4. **Conditional UI**: Apakah semua kondisi "tampil/sembunyi" sudah terdokumentasi?
   Contoh: tombol "Assign Teknisi" hanya muncul di Admin dan hanya saat status = Under Review.

### Template Jawaban

```
Yang kurang sreg  : ...
Yang sudah oke    : ...
Yang perlu diubah : ...
Keputusan         : [Disetujui / Perlu revisi — sebutkan apa yang harus direvisi]
```

> Jangan mulai coding komponen sebelum mendapat "Disetujui" dari manusia.
