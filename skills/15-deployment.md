# Skill 15 — Deployment

## Tujuan
Mempublikasikan aplikasi ke internet menggunakan Cloudflare Pages + Workers secara gratis, dan memverifikasi bahwa semua fitur berjalan di production persis seperti di localhost.

## Kapan Digunakan
Setelah semua test lulus dan acceptance test selesai.
JANGAN deploy kalau masih ada test yang gagal.

## Input
- App yang sudah lulus semua test
- Akun Cloudflare yang sudah tersetup
- Database D1 yang sudah ada

## Langkah Kerja
1. Jalankan `npm run build` secara lokal — pastikan sukses
2. Jalankan migration ke production database
3. Deploy ke Cloudflare
4. Verifikasi URL publik bisa dibuka
5. Test semua fitur utama di URL publik
6. Catat URL di `README.md`

## Output
- URL publik yang aktif
- `docs/deployment/release-note.md`
- `docs/deployment/deployment-log.md`

## Aturan
- Jangan deploy kalau `npm run build` gagal
- Jangan deploy kalau ada secret/token di kode
- Migration `--remote` hanya dijalankan SEKALI kecuali ada migration baru
- Selalu verifikasi `/api/health` setelah deploy

## Quality Check
- [ ] npm run build sukses lokal?
- [ ] Tidak ada secret di GitHub?
- [ ] Migration production sudah dijalankan?
- [ ] URL publik bisa dibuka?
- [ ] /api/health mengembalikan status ok?
- [ ] Test fitur utama di URL publik sudah dilakukan?

## Human Review
Yang kurang sreg: ...
Yang sudah oke: ...
Yang saya ubah: ...
Keputusan: [Disetujui / Perlu revisi]
