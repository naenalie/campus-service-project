# Skill 09 — Issue Planning

## Tujuan

Mengubah setiap Functional Requirement menjadi GitHub Issue yang detail,
bisa dikerjakan dalam satu sesi, dan bisa diverifikasi secara objektif.

Prinsip utama: **satu issue = satu unit kerja yang terisolasi.**
Issue yang terlalu besar akan terbengkalai. Issue yang terlalu kecil
akan menyulitkan tracking. Ukuran ideal: bisa selesai dalam 1–3 jam kerja.

---

## Kapan Digunakan

Setelah **semua dokumen design** selesai dan direview manusia:
- `docs/design/architecture.md` ✅
- `docs/design/database.md` ✅
- `docs/design/api.md` ✅
- `docs/design/ui-flow.md` ✅
- `docs/design/component-design.md` ✅

Jangan buat issue sebelum design jelas — nanti pekerjaan teknisnya
akan berubah terus dan issue menjadi tidak berguna.

---

## Input

- `docs/requirements/requirements.md` — sumber FR dan AC
- `docs/design/architecture.md` — untuk tahu struktur folder dan nama file
- `docs/design/api.md` — untuk tahu nama endpoint yang harus dibuat
- `docs/design/component-design.md` — untuk tahu nama komponen yang harus dibuat

---

## Langkah Kerja

### Langkah 1 — Baca Semua FR

Baca `requirements.md` bagian Functional Requirements.
Catat: ID, deskripsi, aktor, prioritas, dan dependency.

Susun dalam urutan yang akan jadi dasar urutan issue.

---

### Langkah 2 — Buat Satu Issue per FR (atau per Fitur Kohesif)

Untuk setiap FR, buat satu issue.

**Kapan boleh digabung**: Dua FR boleh digabung dalam satu issue jika:
- Keduanya selalu dikerjakan bersamaan (contoh: backend + frontend satu endpoint kecil)
- Keduanya tidak bisa ditest secara terpisah

**Kapan harus dipecah**: Satu FR harus dipecah jadi dua issue jika:
- Ada bagian backend yang bisa selesai dan di-test tanpa frontend
- FR terlalu kompleks sehingga tidak bisa selesai dalam satu sesi

---

### Langkah 3 — Isi Detail Setiap Issue

Setiap issue harus memiliki semua bagian berikut.
Jangan lewati bagian manapun — bagian yang kosong adalah tanda
bahwa pekerjaan belum cukup dipikirkan.

**Bagian yang wajib ada:**

1. **Requirement** — ID dan deskripsi FR dari requirements.md
2. **User Story** — dikutip langsung dari requirements.md (US-XX)
3. **Acceptance Criteria** — dikutip langsung dari requirements.md (AC-XX-01, AC-XX-02)
4. **Pekerjaan Teknis** — daftar checklist spesifik per lapisan (backend, frontend, testing)
5. **Selesai Jika** — definisi "done" yang objektif dan bisa diverifikasi

---

### Langkah 4 — Tentukan Urutan Pengerjaan

Urutkan issue berdasarkan dependency:
- Issue yang tidak punya dependency → dikerjakan duluan
- Issue yang menjadi dependency issue lain → harus selesai sebelum issue child-nya

Gunakan data dependency dari `requirements.md` dan `prioritization.md`.

Hasil akhir: tabel urutan pengerjaan dengan keterangan "blocking" (issue yang harus selesai dulu).

---

### Langkah 5 — Tandai Dependency Antar Issue

Untuk setiap issue, tambahkan keterangan:
- **Blocked by**: issue mana yang harus selesai dulu sebelum issue ini bisa dikerjakan
- **Blocks**: issue mana yang menunggu issue ini selesai

Ini membantu saat ada beberapa issue yang bisa dikerjakan paralel.

---

## Output

### Daftar GitHub Issues

Format tiap issue — gunakan persis format ini agar konsisten:

```markdown
---
**Judul Issue**: [FR-XX] Nama Fitur yang Deskriptif

**Labels**: `backend`, `frontend`, `must-have` (sesuaikan)
**Milestone**: Day 1 / Day 2 / Day 3 / Day 4
**Blocked by**: #issue-number (jika ada)
**Blocks**: #issue-number (jika ada)

---

## Requirement
**FR-XX**: (salin deskripsi FR persis dari requirements.md)
**Prioritas**: Must Have / Should Have / Could Have
**Aktor**: Pelapor / Administrator / Teknisi / Manajer Fasilitas

## User Story
**US-XX**: Sebagai [aktor], saya ingin [aksi], sehingga [manfaat].

## Acceptance Criteria
- **AC-XX-01**: Given [kondisi], When [aksi], Then [hasil yang diharapkan]
- **AC-XX-02**: Given [kondisi], When [aksi], Then [hasil yang diharapkan]

## Pekerjaan Teknis

### Backend (worker/)
- [ ] Buat/update endpoint [METHOD] /api/[path] di `worker/routes/[file].ts`
- [ ] Buat handler di `worker/handlers/[namaHandler].ts`
- [ ] Buat query SQL di `worker/db/[namaQuery].ts`
- [ ] Tambah validasi di `worker/validators/[namaValidator].ts`
- [ ] Tambah business rule check di handler (BR-XX jika relevan)

### Frontend (src/)
- [ ] Buat/update komponen di `src/components/[nama]/[Nama].tsx`
- [ ] Buat/update halaman di `src/pages/[NamaPage].tsx`
- [ ] Tambah fungsi fetch di `src/services/api.ts`
- [ ] Hubungkan ke state di `src/hooks/[namaHook].ts`

### Testing
- [ ] Buat unit test untuk handler di `tests/unit/[nama].test.ts`
- [ ] Buat integration test untuk endpoint di `tests/integration/[nama].test.ts`
- [ ] Verifikasi manual: jalankan skenario AC-XX-01
- [ ] Verifikasi manual: jalankan skenario AC-XX-02

### Traceability
- [ ] Cek bahwa FR-XX sudah tercakup di tabel traceability `architecture.md`

## Selesai Jika (Definition of Done)
- [ ] Semua AC di atas terpenuhi saat diuji manual
- [ ] Semua unit test lulus (`npm run test`)
- [ ] Tidak ada TypeScript error (`npm run typecheck`)
- [ ] Endpoint merespons sesuai contoh di `api.md`
- [ ] Komponen tampil sesuai wireframe di `ui-flow.md`
```

---

### `docs/planning/issue-plan.md`

File rekap yang berisi:

```markdown
# Issue Plan — [Nama Sistem]

## Ringkasan
Total issue: N
Total FR: 12
FR yang belum jadi issue: (harus 0)

## Tabel Urutan Pengerjaan
| # | Issue | FR | Milestone | Blocked By | Estimasi |
|---|---|---|---|---|---|
| 1 | [FR-00] Setup Fondasi | - | Day 1 | - | 1 jam |
| 2 | [FR-01] Submit Laporan | FR-01 | Day 1 | Issue 1 | 2 jam |
| ...

## Dependency Graph (teks)
Issue 1 (Setup)
  └── Issue 2 (FR-01)
      └── Issue 3 (FR-02)
      └── Issue 4 (FR-03)
          └── Issue 5 (FR-04)
              ...

## Paralel yang Bisa Dikerjakan Bersamaan
- Issue 7 (FR-09 Komentar) dan Issue 8 (FR-11 History) tidak saling blocking
- Keduanya bisa dikerjakan paralel setelah Issue 3 selesai
```

---

## Format Tiap Issue (Ringkasan Cepat)

```
Judul      : [FR-XX] Nama Fitur
Labels     : backend, frontend, must-have / should-have / could-have
Milestone  : Day 1 / 2 / 3 / 4
Blocked by : #N (jika ada)

Body:
  ## Requirement      ← FR-XX dari requirements.md
  ## User Story       ← US-XX dari requirements.md
  ## AC               ← AC-XX-01, AC-XX-02 dari requirements.md
  ## Pekerjaan Teknis ← Backend + Frontend + Testing (nama file spesifik)
  ## Selesai Jika     ← Definition of Done yang objektif
```

---

## Aturan

- Jangan buat issue yang tidak ada FR-nya — setiap issue harus di-trace ke requirement
- Satu issue harus bisa **selesai dalam satu sesi kerja** (1–3 jam) — jika tidak, pecah
- Pekerjaan teknis harus **spesifik**: sebutkan nama file, nama fungsi, nama endpoint
  (bukan "buat backend" tapi "buat handler `createRequest.ts` di `worker/handlers/`")
- Setiap issue harus punya **minimal 2 AC** yang bisa diverifikasi secara manual
- Urutan pengerjaan harus **menghormati dependency** — jangan list issue secara alfabetis

---

## Quality Check

Sebelum serahkan ke human review, pastikan semua ini terpenuhi:

- [ ] Setiap FR sudah jadi minimal 1 issue?
- [ ] Tidak ada issue yang tidak bisa di-trace ke FR?
- [ ] Urutan pengerjaan sudah mempertimbangkan dependency dari requirements.md?
- [ ] Pekerjaan teknis tiap issue cukup spesifik — ada nama file-nya?
- [ ] Setiap issue punya minimal 2 AC yang bisa diverifikasi?
- [ ] Ada issue setup/fondasi di urutan pertama sebelum FR-01?
- [ ] Tabel rekap `issue-plan.md` sudah menunjukkan dependency graph?
- [ ] Issue yang bisa dikerjakan paralel sudah ditandai?

---

## Kondisi Gagal

Berhenti dan minta input manusia jika:

- Salah satu dokumen design belum ada atau belum direview
- Ada FR yang pekerjaan teknisnya tidak jelas (tidak tahu file mana yang harus diubah)
- Ada FR yang acceptance criteria-nya ambigu sehingga tidak bisa dibuat "Selesai Jika" yang objektif

---

## Human Review

> Setelah membaca `docs/planning/issue-plan.md` dan semua issue yang dihasilkan,
> jawab pertanyaan berikut sebelum mulai coding:

### Pertanyaan Review

1. **Urutan Logis**: Apakah urutan pengerjaan issue sudah logis?
   Coba bayangkan mengerjakan dari issue #1 ke issue #N — apakah ada issue yang
   terasa out-of-order atau membutuhkan sesuatu yang belum ada?

2. **Ukuran Issue**: Ada issue yang terlalu besar dan harus dipecah lagi?
   (patokan: jika pekerjaan teknisnya lebih dari 8 checklist item, pertimbangkan pecah)

3. **Kelengkapan FR**: Ada FR yang belum jadi issue?
   Cek tabel rekap — harus 0 FR yang orphan.

4. **Spesifisitas**: Apakah pekerjaan teknis cukup spesifik?
   Kamu harus bisa langsung membuka file yang disebutkan dan tahu apa yang harus ditulis.

### Template Jawaban

```
Yang kurang sreg  : ...
Yang sudah oke    : ...
Yang perlu diubah : ...
Keputusan         : [Disetujui / Perlu revisi — sebutkan apa yang harus direvisi]
```

> Jangan mulai coding sebelum mendapat "Disetujui" dari manusia.
> Issue yang tidak disetujui akan menyebabkan pekerjaan yang perlu diulang.
