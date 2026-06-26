# Change Requests — Campus Service Request and Maintenance System

Dokumen ini melacak seluruh permintaan perubahan (change request) formal pada spesifikasi kebutuhan sistem.

---

## Daftar Change Request

| ID | Tanggal | Requirement Terkait | Alasan Perubahan | Dampak ke Requirement Lain | Status |
| :--- | :--- | :--- | :--- | :--- | :---: |
| **CR-01** | 2026-06-26 | `BR-04 (Pencegahan Tutup Paksa)` & `FR-08 (Menutup Laporan)` | Mengatasi masalah tiket yang menggantung selamanya (unresponsive reporter) pada status `Resolved`. | Menambahkan aturan bisnis baru `BR-06 (Auto-Close 3 Hari)`. Admin/Sistem dapat memicu transisi status menjadi `Closed` jika pelapor pasif selama 72 jam setelah perbaikan selesai. | **Approved** |

---

## Analisis Dampak Detail (Impact Analysis)

### CR-01: Penambahan Aturan Auto-Close 3 Hari

*   **Latar Belakang**:
    Bila teknisi menyelesaikan tugas, status menjadi `Resolved`. Pelapor diharapkan memberikan konfirmasi ("Setuju" untuk ditutup, atau "Tidak Setuju" untuk ditinjau ulang). Namun jika pelapor tidak merespons (misalnya karena mahasiswa sibuk/lupa), tiket akan selamanya berstatus `Resolved`.
*   **Perubahan Spesifikasi**:
    *   **Aturan Bisnis Baru (BR-06)**: *"Keluhan yang berada dalam status `Resolved` selama lebih dari 72 jam tanpa ada respon konfirmasi dari pelapor akan otomatis berstatus Closed secara otomatis oleh sistem atau dapat ditutup manual oleh Administrator."*
    *   **Pembaruan Skema Database**: Tabel `service_requests` tidak perlu diubah, tetapi query pengecekan di backend API harus membandingkan waktu saat ini dengan timestamp perubahan status terakhir pada tabel `request_status_history`.
*   **Dampak ke Kode**:
    *   **Backend Worker**: Endpoint `PATCH /api/requests/:id` (atau endpoint cron job/worker) ditambahkan logika untuk mengizinkan Administrator memicu penutupan keluhan yang sudah `Resolved` &gt; 3 hari meskipun pelapor belum memberikan konfirmasi feedback.
    *   **Frontend UI**: Tampilkan lencana peringatan (warning badge) jika laporan `Resolved` telah melewati batas waktu konfirmasi pelapor agar admin sadar bahwa tiket tersebut dapat ditutup paksa secara manual.
