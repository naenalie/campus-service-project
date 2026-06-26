# Skill 04 — Prioritization

## Tujuan
Menentukan urutan pengerjaan requirement berdasarkan nilai bisnis, 
risiko teknis, dan ketergantungan antar fitur.

## Kapan Digunakan
Setelah requirements.md selesai dan direview manusia.

## Input
- docs/requirements/requirements.md

## Langkah Kerja
1. Kategorikan tiap FR dengan metode MoSCoW:
   - Must Have: sistem tidak bisa jalan tanpa ini
   - Should Have: penting tapi bisa didelivery belakangan
   - Could Have: nice to have
   - Won't Have: di luar scope sekarang
2. Identifikasi dependency — FR mana yang harus selesai dulu
3. Identifikasi technical risk — FR mana yang paling berisiko secara teknis
4. Buat urutan pengerjaan berdasarkan: dependency + risiko + nilai bisnis
5. Catat konflik prioritas antar stakeholder dan resolusinya

## Output
- docs/requirements/prioritization.md

## Aturan
- Setiap keputusan prioritas harus ada ALASANNYA
- Jangan prioritaskan berdasarkan "yang paling mudah" saja
- Must Have tidak boleh lebih dari 60% total FR

## Quality Check
- [ ] Semua FR sudah dikategorikan MoSCoW?
- [ ] Dependency antar FR sudah dipetakan?
- [ ] Urutan pengerjaan sudah logis?
- [ ] Konflik prioritas sudah diselesaikan?

## Kondisi Gagal
Berhenti jika ada FR yang dependency-nya belum jelas.

## Human Review
- Apakah Must Have-nya realistis untuk dikerjakan dalam waktu yang ada?
- Apakah ada fitur yang salah kategori?
