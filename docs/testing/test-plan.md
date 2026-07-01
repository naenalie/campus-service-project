# Dokumen Perencanaan Pengujian (Test Plan)

Sistem Pengelolaan Perawatan Sarana & Prasarana Kampus Universitas Klabat (UNKLAB).

## Matriks Pengujian

| ID | FR | Deskripsi Pengujian | Level | Prioritas | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| UT-01 | FR-01 | Menolak deskripsi laporan kurang dari 20 karakter | Unit | High | Passed |
| UT-02 | CR-02 | Menolak format email tidak valid | Unit | High | Passed |
| UT-03 | CR-02 | Menolak password kurang dari 8 karakter | Unit | High | Passed |
| UT-04 | FR-01 | Menolak kategori yang tidak ada di enum | Unit | Medium | Passed |
| UT-05 | FR-03 | Menguji transisi status valid dan invalid | Unit | High | Passed |
| UT-06 | FR-01 | Memastikan nomor laporan berformat `CSR-[timestamp]` | Unit | Medium | Passed |
| UT-07 | FR-09 | Menolak komentar kosong atau terlalu pendek | Unit | Medium | Passed |
| UT-08 | Auth | Menguji aturan permission update status per role | Unit | High | Passed |
| IT-09 | FR-10 | Query list laporan mendukung pencarian `keyword` | Integration | High | Passed |
| IT-10 | FR-10 | Query list laporan dapat menggabungkan status dan keyword | Integration | High | Passed |
| IT-11 | FR-07 | Pelapor dapat mengonfirmasi laporan `RESOLVED` menjadi `CLOSED` | Integration | High | Passed |
| IT-12 | FR-07 | Pelapor dapat menolak hasil dan membuka kembali laporan ke `UNDER_REVIEW` | Integration | High | Passed |
| IT-13 | FR-07 | Pelapor tidak dapat mengonfirmasi laporan milik user lain | Integration | High | Passed |
| IT-14 | FR-07 | Penolakan hasil wajib memiliki catatan yang cukup | Integration | Medium | Passed |
| SM-15 | Deployment | `GET /api/health` production mengembalikan 200 OK | Smoke | High | Passed |
| SM-16 | Security | `GET /api/requests` tanpa token production mengembalikan 401 | Smoke | High | Passed |
| SM-17 | Auth | Login akun test Pelapor/Admin/Manajer production berhasil | Smoke | High | Passed |
| SM-18 | Dashboard | Dashboard summary production dapat diakses oleh Manajer | Smoke | Medium | Passed |

## Lingkungan Pengujian

- Database: Cloudflare D1 local/mock untuk automated test, D1 remote untuk smoke test.
- Backend API: Cloudflare Workers.
- Frontend App: React/Vite.
- Framework otomatisasi: Vitest.
- Production URL: `https://campus-service-project.officiallygwen.workers.dev`

## Hasil Terakhir

```bash
npm run test:run
```

Result: 3 test files passed, 27 tests passed.

```bash
npm run build
```

Result: build completed successfully.

## Catatan Risiko

- Full browser acceptance screenshots belum dilampirkan di `evidence/screenshots/`.
- Pull Request publik di GitHub belum memenuhi minimum 6 PR.
