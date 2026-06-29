# Skill 12 — Test Planning

## Tujuan
Merencanakan apa yang harus ditest, bagaimana cara testnya, dan siapa yang bertanggung jawab sebelum menulis satu baris kode test pun.

## Kapan Digunakan
Setelah semua coding selesai dan app bisa jalan di localhost.

## Input
- `docs/requirements/requirements.md`
- `docs/design/api.md`
- Semua file kode yang sudah dibuat

## Langkah Kerja
1. **List semua FR yang harus diverifikasi**: Identifikasi semua Functional Requirements dari dokumen spesifikasi.
2. **Tentukan level test per FR**:
   - **Unit test**: Fungsi validasi, helper functions.
   - **Integration test**: API endpoint + database (D1).
   - **Acceptance test**: Alur lengkap per user story di frontend/backend.
3. **Tentukan prioritas test**: Mulailah dari alur kritis yang berdampak besar (misal: otentikasi, pembuatan tiket, transisi status).
4. **Buat test matrix**:
   `FR` → `Test case` → `Level` → `Priority` → `Status`

## Output
- `docs/testing/test-plan.md`

## Aturan
- Minimal **20 automated test cases** secara total.
- Setiap FR yang berstatus *Must Have* wajib memiliki minimal 1 test case.
- Menguji skenario sukses (*happy path*) **DAN** skenario gagal/error (*error case*).
- Jangan melewatkan pengujian batas nilai (*edge case*).

## Quality Check
- [ ] Apakah semua FR *Must Have* sudah memiliki test case?
- [ ] Apakah ada test khusus untuk validasi input?
- [ ] Apakah ada test untuk verifikasi otentikasi dan otorisasi (auth/authorization)?
- [ ] Apakah ada test untuk transisi alur status tiket keluhan (status transition)?
- [ ] Apakah jumlah total test case sudah minimal 20?
