# Skill 13 — Automated Testing

## Tujuan
Membuat unit test dan integration test yang otomatis berjalan setiap kali ada perubahan kode.
Test harus SPESIFIK — bukan cuma cek "tidak error" tapi cek output yang benar.

## Kapan Digunakan
Setelah setiap fitur selesai dikoding.
Jalankan ulang setiap kali ada perubahan.

## Input
- `docs/testing/test-plan.md`
- Kode yang sudah dibuat di `worker/` dan `src/`

## Langkah Kerja
1. Baca test matrix dari `test-plan.md`
2. Tulis unit test untuk fungsi validasi dan helper
3. Tulis integration test untuk setiap API endpoint
4. Pastikan ada test untuk happy path DAN error case
5. Jalankan: `npm run test:run`
6. Kalau ada yang gagal → perbaiki kode atau testnya
7. Pastikan semua lulus sebelum lanjut

## Output
- `tests/unit/*.test.ts`
- `tests/integration/*.test.ts`
- Laporan: semua test lulus

## Aturan
- Minimal 20 test total
- Jangan test hal yang tidak ada di requirements
- Test name harus deskriptif dalam bahasa Indonesia
- Setiap test harus independent — tidak bergantung urutan eksekusi

## Quality Check
- [ ] Minimal 20 test sudah ada?
- [ ] Semua test lulus (0 failed)?
- [ ] Ada test untuk validasi input?
- [ ] Ada test untuk auth/authorization?
- [ ] CI sudah berjalan otomatis?

## Human Review
Yang kurang sreg: ...
Yang sudah oke: ...
Yang saya ubah: ...
Keputusan: [Disetujui / Perlu revisi]
