# Release Note — Campus Service Request and Maintenance System

## v1.0.0 — Production Release

**Tanggal**: 2026-07-01  
**URL Production**: https://campus-service-project.officiallygwen.workers.dev  
**Commit**: 7c1af8a  
**Platform**: Cloudflare Workers + D1 (Serverless, Gratis)

---

## Ringkasan Rilis

Rilis pertama dari Campus Service Request and Maintenance System — sistem pelaporan dan perawatan fasilitas kampus UNKLAB berbasis serverless fullstack. Seluruh fitur wajib (FR-01 hingga FR-12) telah diimplementasikan, diuji, dan di-deploy ke production.

---

## Fitur yang Dirilis

### Autentikasi & Role-Based Access (CR-02)
- Login berbasis email + password dengan token sesi tersimpan di D1
- 4 role: PELAPOR, ADMIN, TEKNISI, MANAJER — masing-masing dengan akses berbeda
- Proteksi endpoint menggunakan middleware `authGuard`
- Halaman Register untuk daftar akun baru (role otomatis PELAPOR)

### Alur Laporan Lengkap (FR-01 s/d FR-12)
- **PELAPOR**: Buat laporan → pantau status → tambah komentar → konfirmasi selesai → buka kembali
- **ADMIN**: Tinjau laporan → set prioritas → assign teknisi → tutup laporan
- **TEKNISI**: Lihat tugas assigned → mulai pengerjaan → tandai selesai + catatan teknis
- **MANAJER**: Dashboard statistik (total, per status, per kategori, overdue) — read-only

### Database & API
- Schema D1 dengan 4 tabel: `users`, `sessions`, `service_requests`, `service_request_status_history`
- RESTful API dengan 15+ endpoint (auth, requests, comments, dashboard, users)
- Query dengan LEFT JOIN untuk menampilkan nama reporter dan teknisi secara native
- Filter server-side: status, kategori, keyword, assigned_to

### Automated Testing
- **27 tests total**: 14 unit tests (validasi), 7 unit helper tests, 6 integration tests
- Coverage: validasi input, transisi status, permission role, pencarian keyword, konfirmasi pelapor
- CI via GitHub Actions: otomatis menjalankan test + build pada setiap push/PR ke main

---

## Change Requests yang Disetujui

| ID | Perubahan | Alasan |
| --- | --- | --- |
| **CR-01** | Tambah aturan BR-06: Auto-close setelah 72 jam tiket RESOLVED tanpa konfirmasi | Mencegah tiket menggantung karena pelapor tidak responsif |
| **CR-02** | Tambah sistem autentikasi login (email + password + token sesi) | Menggantikan role simulator yang tidak aman untuk deployment nyata |

---

## Bug yang Ditemukan & Diperbaiki

| ID | Bug | Status |
| --- | --- | --- |
| BUG-01 | Route mutasi tiket tidak diarahkan ke handler yang benar | Fixed |
| BUG-02 | Endpoint `/api/requests/:id/confirm` belum ada di backend | Fixed |
| BUG-03 | Filter `keyword` belum diproses di backend query | Fixed |
| BUG-04 | Beberapa README kosong (tidak ada bukti) | Fixed |

---

## Performa Build

```bash
npm run test:run
# → 3 test files, 27 tests — all passed

npm run build
# → Worker bundle: 55.13 kB (gzip: 9.49 kB)
# → Client bundle: 326.90 kB (gzip: 93.39 kB)
# → Build time: ~900ms total
```

---

## Known Limitations

1. **Upload foto** tidak diimplementasikan — di luar scope per spesifikasi tugas (butuh object storage berbayar)
2. **Notifikasi email** tidak diimplementasikan — di luar scope per spesifikasi tugas
3. **Pull Request** di GitHub: 1 PR formal yang merged (PR #12). Commit langsung ke main digunakan untuk iterasi cepat
4. **Halaman `/dev-switcher`** tersedia untuk kemudahan demo, bukan untuk produksi nyata
5. **Screenshot browser** untuk acceptance test belum dilampirkan secara formal di `evidence/`

---

## Deployment Steps (Verifikasi Ulang)

```bash
# 1. Install dependencies
npm ci

# 2. Run tests
npm run test:run

# 3. Build production bundle
npm run build

# 4. Deploy ke Cloudflare
npm run deploy

# 5. Verifikasi production
curl https://campus-service-project.officiallygwen.workers.dev/api/health
# → {"status":"ok"}
```
