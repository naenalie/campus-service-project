# Skill 14 — Acceptance Testing

## Tujuan
Memverifikasi bahwa alur lengkap pengguna berjalan sesuai acceptance criteria yang sudah didefinisikan.
Ini adalah test dari sudut pandang USER, bukan developer.

## Kapan Digunakan
Setelah automated tests lulus.
Dijalankan manual oleh mahasiswa.

## Input
- `docs/requirements/requirements.md` (semua AC)
- App yang sudah berjalan di localhost atau URL publik

## Langkah Kerja
1. Buka app di browser
2. Untuk tiap user story, jalankan skenario lengkap
3. Dokumentasikan: Given → When → Then
4. Catat: Pass / Fail / Blocked
5. Screenshot atau rekam bukti
6. Kalau Fail → catat bug dan perbaiki

## Output
- `docs/testing/acceptance-test-results.md`
- Screenshot bukti (simpan di `evidence/screenshots/`)

## Aturan
- Jalankan di browser yang berbeda minimal 2 (Chrome dan Firefox/Edge)
- Test di mode mobile (F12 → toggle device)
- Jangan skip skenario error case

## Quality Check
- [ ] Semua US sudah ditest?
- [ ] Dark mode dan light mode sudah dicek?
- [ ] Mobile view sudah dicek?
- [ ] Tidak ada broken UI yang terlihat?

## Human Review
Yang kurang sreg: ...
Yang sudah oke: ...
Yang saya ubah: ...
Keputusan: [Disetujui / Perlu revisi]
