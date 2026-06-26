# Validation Report
## Campus Service Request and Maintenance System

Dokumen ini menyajikan hasil evaluasi kritis terhadap kelengkapan, konsistensi, kejelasan (ambiguitas), keterujian (testability), dan kelayakan (feasibility) dari dokumen requirements yang telah disusun.

---

## 1. Daftar Masalah yang Ditemukan

### Masalah 1: Gap Logika — Tiket Menggantung (Unresponsive Reporter)
*   **Kutipan Requirement**:
    *   `FR-08`: Menutup laporan keluhan secara permanen (`Closed`).
    *   `BR-04`: Administrator dilarang menutup keluhan (`Closed`) secara langsung jika status belum mencapai `Resolved` dan belum dikonfirmasi (setuju/tidak) oleh pelapor.
*   **Deskripsi Masalah**:
    Terdapat celah logika (gap) jika pelapor tidak pernah memberikan konfirmasi persetujuan (baik "Setuju" maupun "Tidak Setuju") setelah teknisi merubah status keluhan menjadi `Resolved`. Berdasarkan `BR-04`, Admin tidak diperbolehkan menutup keluhan tersebut. Hal ini akan menyebabkan tiket berstatus `Resolved` menggantung selamanya di antrean pengerjaan aktif dan mendistorsi metrik SLA layanan.
*   **Rekomendasi Perbaikan**:
    Membuat aturan bisnis baru (`BR-06`) yang menyatakan: *"Sistem atau Administrator diperbolehkan menutup secara sepihak keluhan yang telah berstatus `Resolved` jika pelapor tidak memberikan konfirmasi feedback dalam waktu 3 x 24 jam sejak status diperbarui oleh teknisi."*

### Masalah 2: Inkonsistensi — Hak Menulis Komentar setelah Tiket Ditutup
*   **Kutipan Requirement**:
    *   `BR-05`: Laporan keluhan yang sudah dipindahkan ke status `Closed` bersifat *read-only*. Seluruh form komentar, tombol pembaruan status, dan form edit akan dikunci secara permanen.
    *   `US-07-02`: Given laporan pribadi berstatus `Resolved`, When pelapor menekan tombol "Tidak Setuju" dan mengisi catatan komentar ketidakpuasan, Then laporan tetap berstatus `Resolved` dengan lampiran log komplain tambahan untuk ditinjau ulang oleh admin.
*   **Deskripsi Masalah**:
    Ada ketidakjelasan jika laporan ditutup paksa oleh admin (akibat gap pada Masalah 1). Apabila status laporan telah berubah menjadi `Closed`, tetapi pelapor merasa tidak puas, `BR-05` mengunci kolom komentar secara permanen. Namun pelapor memiliki hak untuk menyampaikan keluhan kembali. Jika kolom komentar terkunci, koordinasi perbaikan ulang menjadi lumpuh.
*   **Rekomendasi Perbaikan**:
    Mengubah alur: Pelapor dilarang menulis komentar baru setelah status laporan `Closed`. Jika pelapor tidak setuju dengan hasil kerja, mereka wajib memicu tombol "Tidak Setuju" saat keluhan masih berstatus `Resolved`. Aksi "Tidak Setuju" ini akan otomatis memicu transisi status kembali ke `Under Review` oleh sistem, sehingga kolom komentar terbuka kembali. Jika status keluhan sudah `Closed`, pelapor harus membuat keluhan baru di sistem.

### Masalah 3: Ambiguitas — Validasi Karakter Kosong (Whitespace Bypass)
*   **Kutipan Requirement**:
    *   `FR-01`: Membuat laporan keluhan baru dengan mengisi judul (min. 5 karakter), deskripsi (min. 20 karakter)...
    *   `AC-01-02`: Given form... When diisi deskripsi kurang dari 20 karakter, Then sistem menolak...
*   **Deskripsi Masalah**:
    Requirement tidak menspesifikasikan apakah batasan karakter minimal tersebut harus berupa karakter alfanumerik yang bermakna atau sekadar spasi (whitespace). Pelapor dapat memintas (bypass) validasi dengan menekan tombol spasi sebanyak 20 kali tanpa menuliskan deskripsi kerusakan riil.
*   **Rekomendasi Perbaikan**:
    Ubah logika pemrosesan input pada frontend dan backend API: *"Teks judul, deskripsi, dan lokasi harus dibersihkan dari spasi di awal dan akhir menggunakan fungsi `.trim()` sebelum panjang karakternya dihitung untuk validasi."*

---

## 2. Checklist Keterujian (Testability Checklist)

Evaluasi keterujian Acceptance Criteria (AC) pada 10 User Stories:

| User Story | Acceptance Criteria | Testable? | Keterangan Uji |
| :--- | :--- | :---: | :--- |
| **US-01** | AC-01-01 & AC-01-02 | **Ya** | Bisa diuji dengan input form kurang dari batas minimal karakter (menghasilkan error 422) dan input valid (menghasilkan status 201). |
| **US-02** | AC-02-01 & AC-02-02 | **Ya** | Bisa diuji dengan memeriksa database D1. Jika data request kosong, pastikan pesan "Belum ada laporan." dirender di UI. |
| **US-03** | AC-03-01 & AC-03-02 | **Ya** | Periksa transisi status record di DB dan pastikan button "Tinjau" dinonaktifkan di UI saat status != `Submitted`. |
| **US-04** | AC-04-01 & AC-04-02 | **Ya** | Periksa kolom `assigned_to` setelah assign dan tes penolakan backend jika transisi status melanggar aturan. |
| **US-05** | AC-05-01 & AC-05-02 | **Ya** | Periksa apakah filter role teknisi membatasi data list keluhan agar hanya memuat tugas personal. |
| **US-06** | AC-06-01 & AC-06-02 | **Ya** | Kirim request API PATCH tanpa parameter `resolved_notes` dan pastikan server membalas dengan status error 422. |
| **US-07** | AC-07-01 & AC-07-02 | **Ya** | Uji tombol "Setuju" dan periksa penambahan log di tabel `request_status_history`. |
| **US-08** | AC-08-01 & AC-08-02 | **Ya** | Uji pengiriman komentar ke keluhan yang berstatus `Closed`. Pastikan API mengembalikan error. |
| **US-09** | AC-09-01 & AC-09-02 | **Ya** | Uji filter status & kategori serta fungsi input search pencarian real-time di antarmuka frontend. |
| **US-10** | AC-10-01 & AC-10-02 | **Ya** | Bandingkan jumlah agregasi data visual di UI dashboard manajer dengan data query manual SQL D1. |

---

## 3. Kesimpulan

Secara keseluruhan, dokumen requirements telah memetakan kebutuhan dasar operasional empat aktor secara mendalam. 

> [!IMPORTANT]
> **Keputusan**: Dokumen requirements dinyatakan **Siap dengan Catatan** untuk masuk ke fase desain arsitektur, dengan syarat perbaikan 3 masalah (gap, inkonsistensi, dan ambiguitas) di atas diadopsi ke dalam dokumentasi desain dan diwujudkan melalui Change Request (CR) resmi.
