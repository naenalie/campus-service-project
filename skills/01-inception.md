# Skill 01 — Inception & Stakeholder Analysis

## Tujuan
Memahami secara mendalam masalah yang ingin diselesaikan, siapa yang terdampak, 
apa batasannya, dan asumsi apa yang perlu divalidasi sebelum requirement ditulis.

## Kapan Digunakan
Dijalankan PERTAMA KALI sebelum requirement apapun ditulis. 
Jangan lanjut ke Skill 02 sebelum semua pertanyaan terbuka di sini terjawab.

## Input yang Dibutuhkan
- Deskripsi masalah awal (dari CASE.md)
- Daftar aktor sistem
- Konteks lingkungan kampus

## Langkah Kerja
1. Identifikasi masalah utama yang dialami tiap stakeholder
2. Tentukan tujuan bisnis dan tujuan teknis secara terpisah
3. Definisikan scope — apa yang masuk dan apa yang TIDAK masuk
4. Identifikasi asumsi yang belum divalidasi
5. Catat pertanyaan terbuka yang harus dijawab sebelum lanjut
6. Berhenti jika ada stakeholder yang belum terdefinisi perannya

## Output
- docs/requirements/inception.md

## Aturan
- Jangan membuat asumsi tanpa menandainya dengan [ASUMSI]
- Jangan mendefinisikan requirement di tahap ini
- Fokus pada MASALAH, bukan SOLUSI
- Tiap stakeholder harus punya pain point yang spesifik

## Quality Check
- [ ] Semua 4 aktor sudah punya pain point spesifik?
- [ ] Scope sudah mendefinisikan apa yang TIDAK termasuk?
- [ ] Minimal 5 asumsi sudah dicatat?
- [ ] Minimal 5 pertanyaan terbuka sudah dicatat?

## Kondisi Gagal
Berhenti dan minta klarifikasi jika:
- Stakeholder utama belum jelas siapa decision maker-nya
- Tidak ada informasi tentang volume data atau jumlah pengguna

## Human Review
Bagian yang WAJIB diperiksa manusia:
- Apakah pain point tiap stakeholder realistis untuk konteks kampus Indonesia?
- Apakah asumsi teknis masuk akal untuk Cloudflare free tier?
- Apakah scope sudah cukup untuk dinilai tapi tidak terlalu besar?
