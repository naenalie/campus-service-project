# Skill 05 — Validation & Change Management

## Tujuan
Memvalidasi bahwa requirements sudah lengkap, konsisten, tidak ambigu,
dan bisa diimplementasikan. Juga mengelola perubahan requirement.

## Kapan Digunakan
Setelah prioritization.md selesai. Dijalankan ulang setiap ada perubahan requirement.

## Input
- docs/requirements/requirements.md
- docs/requirements/prioritization.md

## Langkah Kerja
1. Cek kelengkapan: apakah semua use case tercakup?
2. Cek konsistensi: apakah ada requirement yang saling bertentangan?
3. Cek ambiguitas: apakah ada requirement yang bisa diinterpretasi berbeda?
4. Cek testability: apakah semua AC bisa diverifikasi?
5. Cek feasibility: apakah semua requirement bisa diimplementasi di stack yang dipilih?
6. Untuk setiap perubahan: catat alasan, dampak, dan keputusan

## Output
- docs/requirements/validation-report.md
- docs/requirements/change-request.md (minimal 1)

## Format Change Request
CR-XX | Tanggal | Requirement yang berubah | Alasan perubahan | 
Dampak ke requirement lain | Status (Approved/Rejected/Pending)

## Aturan
- Minimal temukan 3 masalah dalam requirements (ambiguitas/inkonsistensi/gap)
- Setiap masalah harus ada rekomendasi perbaikannya
- Change request harus ada impact analysis-nya

## Quality Check
- [ ] Semua requirement sudah dicek konsistensinya?
- [ ] Ada minimal 1 change request terdokumentasi?
- [ ] Semua AC sudah testable?

## Human Review
- Apakah validasi sudah kritis atau hanya formalitas?
- Apakah change request realistis?
