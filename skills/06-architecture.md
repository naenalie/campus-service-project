# Skill 06 — Architecture Design

## Tujuan

Merancang struktur sistem secara keseluruhan sebelum mulai coding.
Menentukan bagaimana bagian-bagian besar sistem saling terhubung.
Berdasarkan prinsip Pressman: setiap keputusan arsitektur harus
bisa di-trace ke requirement yang sudah ada.

Skill ini menghasilkan **4 Design Model Elements** (Pressman Ch. 9):

| Element | Fokus | Output di file ini |
|---|---|---|
| **Architecture Model** | Komponen utama & hubungannya | Section 2 & 3 |
| **Interface Model** | Bagaimana komponen berkomunikasi | Section 4 |
| **Component-level Model** | Tanggung jawab tiap modul kode | Section 5 |
| **Deployment Model** | Di mana sistem berjalan secara fisik | Section 6 |

---

## Kapan Digunakan

Setelah `requirements.md` dan `prioritization.md` selesai dan sudah direview manusia.
**Jangan mulai coding sebelum arsitektur jelas.**

Kalau requirements masih berubah-ubah, arsitektur yang dibuat akan sia-sia.

---

## Input

- `docs/requirements/requirements.md`
- `docs/requirements/prioritization.md`
- `docs/requirements/validation-report.md` (opsional, untuk cek gap)

---

## Langkah Kerja

### Langkah 1 — Identifikasi Komponen Utama (Architecture Model)

Baca semua FR dari `requirements.md`.
Kelompokkan FR ke dalam komponen logis yang kohesif:

- Komponen hanya dibuat kalau ada FR yang menuntutnya (no gold-plating)
- Tiap komponen punya satu tanggung jawab utama
- Catat FR mana yang ditangani tiap komponen

Format tabel:

| Komponen | Tanggung Jawab | FR yang Ditangani |
|---|---|---|
| ... | ... | ... |

---

### Langkah 2 — Tentukan Komunikasi Antar Komponen (Architecture Model)

Gambarkan bagaimana komponen saling bicara:

- Sinkron atau asinkron?
- REST API, direct function call, atau event-driven?
- Siapa yang memanggil siapa? (dependency direction)

Dokumentasikan setiap keputusan dan **alasannya**.

Format: diagram teks (ASCII atau pseudocode), bukan hanya daftar.

---

### Langkah 3 — Alur Data 3 Skenario Utama (Architecture + Interface Model)

Pilih 3 skenario paling kritis dari prioritization.md.
Untuk setiap skenario, gambarkan alur langkah demi langkah:

```
User klik [Tombol]
  → Frontend [komponen mana?]
  → API [endpoint mana? method apa?]
  → Worker [fungsi mana?]
  → Database [query apa? tabel mana?]
  → Response [format apa?]
  → UI update [komponen mana yang berubah?]
```

Kalau ada validasi atau transformasi data di tengah jalan, sebutkan di mana itu terjadi.

---

### Langkah 4 — Struktur Folder Kode (Component-level Model)

Tentukan struktur folder yang modular.
Aturan keras:

- **Satu file = satu tanggung jawab**
- Jangan buat file `utils.ts` yang isinya campur aduk
- Pisahkan: routing, business logic, data access, validasi, tipe data
- Folder frontend dan backend harus terpisah jelas

Tulis struktur folder dengan komentar singkat tiap file/folder:

```
src/
├── components/        # UI components (satu komponen per file)
│   ├── [nama]/
│   │   ├── index.tsx  # komponen utama
│   │   └── ...
├── pages/             # halaman-halaman aplikasi
├── hooks/             # custom React hooks
├── services/          # logika komunikasi dengan API
├── types/             # TypeScript interfaces & types
└── utils/             # helper murni (pure functions only)

worker/
├── routes/            # routing handler per resource
├── handlers/          # business logic per use case
├── db/                # query functions (data access layer)
├── middleware/         # auth, logging, error handling
├── validators/        # validasi input
└── types/             # tipe data shared
```

Jelaskan **mengapa** struktur ini dipilih, bukan sekadar menampilkannya.

---

### Langkah 5 — Keputusan Arsitektur & Alasannya

Untuk setiap keputusan arsitektur signifikan, dokumentasikan dengan format:

```
### ADR-XX — [Judul Keputusan]
**Konteks**: Apa situasi yang memaksa keputusan ini dibuat?
**Opsi yang dipertimbangkan**:
  - Opsi A: ... (kelebihan / kekurangan)
  - Opsi B: ... (kelebihan / kekurangan)
**Keputusan**: Dipilih [Opsi X] karena ...
**Konsekuensi**: Apa yang harus diterima akibat keputusan ini?
**FR yang terdampak**: FR-XX, FR-YY
```

Minimal 4 ADR harus ada di output.

---

### Langkah 6 — Deployment Model & Risiko Teknis

Gambarkan di mana setiap komponen berjalan secara fisik:

- Browser (client-side)
- Cloudflare CDN (static assets)
- Cloudflare Workers (server-side logic)
- Cloudflare D1 (database)

Identifikasi risiko teknis, terutama yang terkait **Cloudflare free tier**:

| Risiko | Dampak | Probabilitas | Mitigasi |
|---|---|---|---|
| ... | High/Med/Low | High/Med/Low | ... |

Catat batasan-batasan free tier yang harus diperhatikan selama development.

---

## Output

File: `docs/design/architecture.md`

Struktur dokumen output:

```markdown
# Architecture Design — [Nama Sistem]

## 1. Ringkasan Arsitektur
## 2. Komponen Utama (Architecture Model)
## 3. Komunikasi Antar Komponen
## 4. Alur Data — Skenario Utama (Interface Model)
## 5. Struktur Folder Kode (Component-level Model)
## 6. Deployment Model
## 7. Architectural Decision Records (ADR)
## 8. Risiko Teknis & Mitigasi
## 9. Traceability: FR → Komponen
```

---

## Aturan

- Setiap keputusan arsitektur **WAJIB** ada alasannya — kalau tidak bisa dijelaskan, berarti belum dipikirkan
- **Kode harus modular**: satu file = satu tanggung jawab
- Jangan buat komponen yang tidak ada FR-nya (no gold-plating)
- Harus ada penjelasan kenapa pilih stack ini dan bukan alternatif lainnya
- Bahasa konsisten: pakai istilah yang sama dengan yang ada di requirements.md

---

## Quality Check

Sebelum menyerahkan ke human review, pastikan semua item ini terpenuhi:

- [ ] Semua FR punya komponen yang menanganinya? (cek tabel traceability)
- [ ] Tidak ada komponen yang dibuat tanpa FR yang mendukungnya?
- [ ] Struktur folder sudah modular — tidak ada file "god object"?
- [ ] Setiap keputusan arsitektur (ADR) ada alasan dan konsekuensinya?
- [ ] Alur data untuk 3 skenario utama sudah tergambar step by step?
- [ ] Deployment model jelas — mana yang jalan di browser, mana di worker?
- [ ] Risiko Cloudflare free tier sudah dicatat dengan mitigasinya?
- [ ] Minimal 4 ADR sudah didokumentasikan?

---

## Kondisi Gagal

Berhenti dan minta input manusia jika:

- Requirements belum stabil atau belum ada review manusia
- Ada FR yang tidak jelas aktornya (siapa yang trigger, siapa yang terima)
- Ditemukan konflik antara dua FR yang tidak bisa diselesaikan di level arsitektur
- Stack yang dipilih tidak mendukung salah satu NFR (misalnya: latency requirement vs lokasi server)

---

## Human Review

> Setelah membaca `docs/design/architecture.md`, jawab pertanyaan berikut
> sebelum melanjutkan ke fase coding:

### Pertanyaan Review

1. **Modularitas**: Apakah struktur folder yang diusulkan sudah benar-benar modular?
   *(Ciri modular: tiap file punya satu tugas spesifik, tidak ada file yang "tahu terlalu banyak")*

2. **Alur Data**: Apakah alur data masuk akal — dari user klik tombol sampai data tersimpan di D1?
   *(Cek: apakah ada langkah yang hilang? ada validasi yang terlewat?)*

3. **Keputusan Arsitektur**: Ada ADR yang menurut kamu kurang tepat atau perlu didiskusikan lebih lanjut?

4. **Risiko**: Apakah ada risiko teknis yang belum dicatat yang kamu tahu dari pengalaman?

### Template Jawaban

```
Yang kurang sreg  : ...
Yang sudah oke    : ...
Yang perlu diubah : ...
Keputusan         : [Disetujui / Perlu revisi — sebutkan apa yang harus direvisi]
```

> Jangan lanjut ke Skill 07 sebelum mendapat "Disetujui" dari manusia.
