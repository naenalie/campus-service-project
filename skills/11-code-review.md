# Skill 11: Code Review Guidelines

Dokumen ini merinci panduan peninjauan kode (code review) sebelum perubahan digabungkan (*merge*) ke cabang utama (`main`).

## 1. Fokus Peninjauan
- **Kebenaran Fungsional**: Memastikan perubahan menyelesaikan masalah atau mengimplementasikan fitur sesuai dengan Product Requirements Document (PRD).
- **Keamanan**: Memastikan tidak ada rahasia (*credentials* atau *API keys*) yang tersimpan dalam kode biasa.
- **Performa**: Memastikan tidak ada operasi database yang tidak efisien atau render React yang tidak perlu.
- **Keterbacaan**: Memastikan nama variabel dan fungsi intuitif serta dokumentasi memadai.

## 2. Kriteria Penerimaan (Approval)
- Kode lolos proses linting (`npm run lint` jika ada) dan formatting.
- Kode berhasil melalui kompilasi TypeScript (`npm run build` sukses).
- Seluruh automated unit tests lulus tanpa ada kegagalan.
