# Requirements — Campus Service Request and Maintenance System

Dokumen ini mendefinisikan Functional Requirements, Non-Functional Requirements, Business Rules, User Stories, dan Acceptance Criteria untuk pengembangan aplikasi.

---

## 1. Functional Requirements

Berikut adalah daftar kebutuhan fungsional sistem pelaporan dan perawatan fasilitas kampus:

| ID | Deskripsi | Aktor | Prioritas | Dependency |
| :--- | :--- | :--- | :--- | :--- |
| **FR-01** | Membuat laporan keluhan baru dengan mengisi judul (min. 5 karakter), deskripsi (min. 20 karakter), lokasi (wajib), dan kategori (Internet/AC/Peralatan Kelas/Kebersihan/Lainnya). | Pelapor | HIGH | None |
| **FR-02** | Melihat daftar laporan keluhan pribadi beserta status terkininya. | Pelapor | HIGH | None |
| **FR-03** | Meninjau laporan baru, memodifikasi tingkat prioritas/kategori, dan mengubah status laporan menjadi `Under Review`. | Administrator | HIGH | FR-01 |
| **FR-04** | Menugaskan teknisi dari daftar dropdown (staf ber-role Teknisi) dan mengubah status keluhan menjadi `Assigned`. | Administrator | HIGH | FR-03 |
| **FR-05** | Menerima tugas perbaikan yang diberikan dan mengubah status laporan menjadi `In Progress`. | Teknisi | HIGH | FR-04 |
| **FR-06** | Menandai pengerjaan selesai, memasukkan catatan teknis penyelesaian perbaikan, dan mengubah status menjadi `Resolved`. | Teknisi | HIGH | FR-05 |
| **FR-07** | Memberikan konfirmasi persetujuan (Setuju / Tidak Setuju) atas laporan yang telah diperbaiki. | Pelapor | HIGH | FR-06 |
| **FR-08** | Menutup laporan keluhan secara permanen (mengubah status keluhan menjadi `Closed`). | Administrator | HIGH | FR-07 |
| **FR-09** | Menambahkan komentar publik berupa teks pada halaman detail laporan keluhan. | Pelapor, Admin, Teknisi | MEDIUM | FR-01 |
| **FR-10** | Melakukan pencarian laporan (berdasarkan nomor laporan atau judul) serta menyaring (filter) laporan berdasarkan status dan kategori. | Pelapor, Admin, Teknisi | HIGH | FR-01 |
| **FR-11** | Menampilkan riwayat perubahan status (status history log) secara kronologis pada halaman detail keluhan. | Pelapor, Admin, Teknisi | MEDIUM | FR-01 |
| **FR-12** | Menampilkan dashboard statistik ringkasan (jumlah total tiket per status, total per kategori kerusakan) secara visual. | Manajer Fasilitas | HIGH | FR-01 |

---

## 2. Non-Functional Requirements

Setiap kebutuhan non-fungsional di bawah ini dilengkapi dengan metrik pengujian yang terukur:

*   **NFR-01 (Performa)**: Halaman utama aplikasi dan form pelaporan harus dapat dimuat di bawah **2 detik** untuk 95% request pada koneksi jaringan seluler standar (3G/4G).
*   **NFR-02 (Keamanan)**: Token API Cloudflare tidak boleh disimpan atau dipaparkan dalam bentuk teks biasa di repositori kode publik. Pengecekan keamanan kredensial harus lolos linter otomatis sebelum di-commit.
*   **NFR-03 (Usability / Responsivitas)**: Layout antarmuka web harus sepenuhnya responsif (mobile-friendly) dan wajib mendapatkan skor performa serta aksesibilitas minimal **90** pada pengujian audit Google Lighthouse.
*   **NFR-04 (Reliability)**: Tingkat ketersediaan (uptime) API serverless Cloudflare Workers minimal mencapai **99.9%** per bulan tanpa ada pemadaman (downtime) tidak terencana.
*   **NFR-05 (Maintainability)**: Proyek harus lulus 100% pengujian automated tests (Vitest) dengan cakupan kode (code coverage) minimal **80%** sebelum diizinkan untuk di-deploy ke produksi.
*   **NFR-06 (Compatibility)**: Aplikasi web harus dapat berfungsi tanpa malfungsi visual atau fungsional pada browser modern terpopuler (Chrome, Edge, Firefox, dan Safari) versi rilis stabil 2 tahun terakhir.

---

## 3. Business Rules

Aturan bisnis berikut mengikat logika sistem dan tidak boleh dilanggar oleh program:

*   **BR-01 (Alur Status Linier)**: Transisi status keluhan harus mengikuti alur linier yang baku:
    `Submitted` &rarr; `Under Review` &rarr; `Assigned` &rarr; `In Progress` &rarr; `Resolved` &rarr; `Closed`. Pengguna dilarang melompati transisi status (misal: langsung Closed dari Submitted).
*   **BR-02 (Batasan Tugas Teknisi)**: Teknisi hanya diizinkan untuk melihat, memperbarui status, dan memberikan catatan pada keluhan yang secara eksplisit ditugaskan kepada diri mereka sendiri (`assigned_to` cocok dengan identitas mereka).
*   **BR-03 (Mandatory Resolved Notes)**: Kolom catatan penyelesaian teknis (resolved notes) wajib diisi oleh teknisi ketika memicu perubahan status dari `In Progress` menjadi `Resolved`.
*   **BR-04 (Pencegahan Tutup Paksa)**: Administrator dilarang menutup keluhan (`Closed`) secara langsung jika status keluhan belum mencapai `Resolved` dan belum melewati tahap konfirmasi pelapor/teknisi.
*   **BR-05 (Read-only Closed Tickets)**: Laporan keluhan yang sudah dipindahkan ke status `Closed` bersifat *read-only*. Seluruh form komentar, tombol pembaruan status, dan form edit akan dikunci secara permanen.

---

## 4. User Stories & Acceptance Criteria

Berikut adalah 10 user stories yang merangkum kebutuhan semua aktor sistem:

### US-01 — Pembuatan Laporan Baru
Sebagai **Pelapor**, saya ingin **membuat laporan keluhan fasilitas baru dengan detail deskripsi dan lokasi**, sehingga **pihak sarpras mengetahui adanya kerusakan secara akurat**.
#### Acceptance Criteria
*   **AC-01-01**: Given form pembuatan laporan dibuka, When semua kolom diisi valid (judul &ge; 5 karakter, deskripsi &ge; 20 karakter, lokasi diisi), Then sistem sukses menyimpan laporan dengan status `Submitted` dan nomor request otomatis format `CSR-${Date.now()}`.
*   **AC-01-02**: Given form pembuatan laporan dibuka, When diisi deskripsi kurang dari 20 karakter, Then sistem memunculkan pesan error "Deskripsi minimal 20 karakter" dan menolak menyimpan laporan.

### US-02 — Melihat Riwayat Laporan Pribadi
Sebagai **Pelapor**, saya ingin **melihat daftar laporan keluhan yang pernah saya buat**, sehingga **saya bisa memantau perkembangan laporan tersebut**.
#### Acceptance Criteria
*   **AC-02-01**: Given pelapor login di simulator, When memuat halaman utama, Then sistem menampilkan daftar keluhan yang pernah dibuat oleh akun pelapor tersebut lengkap dengan status terkininya.
*   **AC-02-02**: Given pelapor belum pernah membuat keluhan, When memuat halaman utama, Then sistem menampilkan teks "Belum ada laporan."

### US-03 — Peninjauan Laporan Baru
Sebagai **Administrator**, saya ingin **meninjau keluhan baru dan menetapkan status Under Review**, sehingga **laporannya siap untuk dialokasikan ke teknisi**.
#### Acceptance Criteria
*   **AC-03-01**: Given laporan berstatus `Submitted`, When admin menekan tombol "Tinjau Laporan", Then status laporan berubah menjadi `Under Review` dan tercatat pada tabel log riwayat.
*   **AC-03-02**: Given laporan berstatus selain `Submitted`, When admin membuka halaman detail keluhan, Then tombol "Tinjau Laporan" dinonaktifkan atau disembunyikan.

### US-04 — Penugasan Teknisi
Sebagai **Administrator**, saya ingin **menugaskan staf teknisi yang sesuai untuk laporan keluhan**, sehingga **tindakan perbaikan fisik dapat segera dilaksanakan**.
#### Acceptance Criteria
*   **AC-04-01**: Given laporan berstatus `Under Review`, When admin memilih nama teknisi dari dropdown dan klik "Tugaskan", Then status laporan berubah menjadi `Assigned` dan kolom `assigned_to` terisi nama teknisi tersebut.
*   **AC-04-02**: Given laporan belum berstatus `Under Review`, When admin mencoba menugaskan teknisi, Then sistem memblokir aksi tersebut dan menampilkan error validasi alur status.

### US-05 — Menerima Tugas Perbaikan
Sebagai **Teknisi**, saya ingin **melihat tugas pengerjaan yang didelegasikan ke saya dan menandainya sebagai In Progress**, sehingga **admin tahu pekerjaan mulai dikerjakan**.
#### Acceptance Criteria
*   **AC-05-01**: Given laporan berstatus `Assigned` ditugaskan atas nama saya, When saya menekan tombol "Mulai Pengerjaan", Then status laporan berubah menjadi `In Progress` di database.
*   **AC-05-02**: Given laporan berstatus `Assigned` ditugaskan ke teknisi lain, When saya masuk ke dashboard teknisi pribadi, Then laporan tersebut tidak boleh muncul di daftar tugas saya.

### US-06 — Menyelesaikan Perbaikan
Sebagai **Teknisi**, saya ingin **menuliskan catatan perbaikan dan menandai laporan sebagai Resolved**, sehingga **pelapor tahu kerusakan telah diperbaiki**.
#### Acceptance Criteria
*   **AC-06-01**: Given laporan berstatus `In Progress`, When saya mengisi catatan perbaikan teknis dan menekan tombol "Tandai Selesai", Then status laporan berubah menjadi `Resolved` dan catatan tersimpan di database.
*   **AC-06-02**: Given laporan berstatus `In Progress`, When saya menekan tombol "Tandai Selesai" tanpa mengisi catatan perbaikan, Then sistem menampilkan pesan peringatan dan menolak perubahan status.

### US-07 — Konfirmasi Hasil Perbaikan
Sebagai **Pelapor**, saya ingin **memberikan konfirmasi persetujuan atas hasil perbaikan teknisi**, sehingga **laporan dapat diselesaikan secara adil**.
#### Acceptance Criteria
*   **AC-07-01**: Given laporan pribadi berstatus `Resolved`, When saya menekan tombol "Setuju / Konfirmasi Selesai", Then status laporan diperbarui dengan keterangan konfirmasi positif di log riwayat.
*   **AC-07-02**: Given laporan pribadi berstatus `Resolved`, When saya menekan tombol "Tidak Setuju" dan mengisi catatan komentar ketidakpuasan, Then laporan tetap berstatus `Resolved` dengan lampiran log komplain tambahan untuk ditinjau ulang oleh admin.

### US-08 — Menutup Laporan Selesai
Sebagai **Administrator**, saya ingin **menutup laporan keluhan yang sudah diselesaikan secara permanen**, sehingga **tiket pengerjaan dapat diselesaikan dari antrean aktif**.
#### Acceptance Criteria
*   **AC-08-01**: Given laporan berstatus `Resolved`, When admin menekan tombol "Tutup Laporan", Then status laporan berubah menjadi `Closed` di database.
*   **AC-08-02**: Given laporan berstatus `Closed`, When ada user mencoba mengirim komentar baru atau mengubah status, Then sistem menampilkan pesan error dan memblokir aksi tersebut.

### US-09 — Pencarian dan Filter Keluhan
Sebagai **Pengguna**, saya ingin **mencari laporan keluhan berdasarkan kata kunci judul/nomor dan memfilternya berdasarkan kategori/status**, sehingga **saya dapat menemukan laporan tertentu dengan cepat**.
#### Acceptance Criteria
*   **AC-09-01**: Given dashboard berisi daftar keluhan, When pengguna mengetik kata kunci pada kotak pencarian, Then sistem menyaring daftar laporan secara real-time berdasarkan nomor laporan (`CSR-...`) atau judul laporan.
*   **AC-09-02**: Given dashboard berisi daftar keluhan, When pengguna memilih opsi filter status "In Progress", Then sistem hanya menampilkan laporan yang memiliki status `In Progress`.

### US-10 — Dashboard Statistik Layanan
Sebagai **Manajer Fasilitas**, saya ingin **melihat visualisasi ringkasan performa perawatan fasilitas**, sehingga **saya dapat menganalisis data untuk anggaran berkala**.
#### Acceptance Criteria
*   **AC-10-01**: Given halaman dashboard manajer dibuka, When dimuat, Then sistem menampilkan metrik total laporan berdasarkan status (Total, In Progress, Resolved) dan persentase laporan berdasarkan kategori dalam bentuk komponen visual.
*   **AC-10-02**: Given database mengalami penambahan laporan baru, When dashboard manajer direfresh, Then angka agregat statistik langsung terupdate secara real-time dan akurat.
