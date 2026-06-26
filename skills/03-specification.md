# Skill 03 — Specification

## Tujuan
Menghasilkan Functional Requirement, Non-Functional Requirement, Business Rules,
User Stories, dan Acceptance Criteria yang SPESIFIK dan TESTABLE.

## Kapan Digunakan
Setelah semua file elicitation selesai dan direview manusia.

## Input
- docs/requirements/inception.md
- docs/requirements/elicitation-*.md (semua file)

## Langkah Kerja
1. Baca semua file elicitation
2. Kelompokkan kebutuhan: Fungsional / Non-Fungsional / Business Rule
3. Tulis tiap FR dengan format: FR-XX | Deskripsi | Aktor | Prioritas
4. Tulis tiap NFR dengan metrik yang TERUKUR (bukan "harus cepat")
5. Tulis User Story dengan format: Sebagai [aktor], saya ingin [aksi], 
   sehingga [manfaat]
6. Tulis minimal 2 Acceptance Criteria per User Story yang bisa ditest
7. Tandai dependency antar requirement

## Output
- docs/requirements/requirements.md

## Aturan
- FR minimal 12, NFR minimal 6, Business Rule minimal 5, User Story minimal 10
- NFR HARUS punya metrik terukur. Contoh SALAH: "sistem harus cepat". 
  Contoh BENAR: "API harus merespons dalam 500ms untuk 95% request"
- Acceptance Criteria harus bisa diverifikasi — ada kondisi pass dan fail
- Tiap requirement harus punya ID unik
- Jangan duplikasi requirement

## Quality Check
- [ ] Semua FR bisa di-trace ke User Story?
- [ ] Semua NFR punya metrik terukur?
- [ ] Acceptance Criteria bisa ditest oleh orang lain?
- [ ] Ada requirement untuk tiap aktor?
- [ ] Edge case sudah dicakup?

## Kondisi Gagal
Berhenti jika elicitation belum lengkap atau belum direview manusia.

## Human Review
- Apakah FR-nya realistis untuk dikerjakan dalam 3-4 hari?
- Apakah NFR-nya achievable di Cloudflare free tier?
- Apakah ada FR yang terlalu ambigu?
