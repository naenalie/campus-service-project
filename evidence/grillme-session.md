# GrillMe Session - Campus Service Request and Maintenance System

Dokumen ini mendokumentasikan hasil tanya-jawab (GrillMe) antara Asisten AI dan Pengguna terkait spesifikasi desain dan teknis aplikasi.

---

### Daftar Pertanyaan & Jawaban

#### 1. Mekanisme Otentikasi dan Pembagian Peran (Role-switching)
* **Pertanyaan**: Bagaimana mekanisme otentikasi dan pembagian peran (role-switching) untuk aktor (Pelapor, Administrator, Teknisi, Manajer Fasilitas) akan diimplementasikan?
* **Jawaban**: Menggunakan dropdown pada halaman login dan juga akan ada pembatasan pada tiap-tiap role.

#### 2. Format Nomor Laporan
* **Pertanyaan**: Format nomor laporan apa yang ingin digunakan untuk setiap Service Request?
* **Jawaban**: Format standard bawaan `CSR-${Date.now()}` (misalnya CSR-1719283921).

#### 3. Manajemen Kategori Masalah
* **Pertanyaan**: Bagaimana daftar kategori masalah (Internet, AC, Kebersihan, dll.) sebaiknya dikelola?
* **Jawaban**: Disimpan sebagai nilai hardcoded (Internet, AC, Peralatan Kelas, Kebersihan, Lainnya) untuk meminimalkan kompleksitas skema database.

#### 4. Penentuan Prioritas Masalah
* **Pertanyaan**: Bagaimana penentuan prioritas masalah (LOW, MEDIUM, HIGH) saat laporan dibuat?
* **Jawaban**: Default ke MEDIUM saat pelapor mengirim, dan hanya administrator yang bisa mengubahnya setelah meninjau laporan.

#### 5. Mekanisme Penugasan Teknisi
* **Pertanyaan**: Bagaimana mekanisme penugasan teknisi oleh Administrator?
* **Jawaban**: Admin memilih secara manual nama teknisi dari daftar dropdown (sumber data diambil dari tabel `users` ber-role Teknisi).

#### 6. Alur Status Tambahan
* **Pertanyaan**: Apakah ada status tambahan yang ingin ditambahkan ke dalam alur status default (Submitted -> Under Review -> Assigned -> In Progress -> Resolved -> Closed)?
* **Jawaban**: Cukup gunakan alur status default untuk menjaga kesederhanaan dan kepatuhan penuh pada spesifikasi tugas.

#### 7. Alur Persetujuan Pekerjaan Teknisi
* **Pertanyaan**: Bagaimana alur persetujuan (confirmation) hasil pekerjaan teknisi?
* **Jawaban**: Setelah teknisi menyelesaikan tugas (status 'Resolved'), pelapor memberikan konfirmasi (setuju/tidak) di UI, dan admin yang berhak melakukan penutupan ('Closed').

#### 8. Visualisasi Dashboard Manajer Fasilitas
* **Pertanyaan**: Visualisasi atau statistik apa yang harus ditampilkan di Dashboard Manajer Fasilitas?
* **Jawaban**: Ringkasan statistik jumlah laporan berdasarkan status (Total, In Progress, Resolved) dan persentase berdasarkan kategori.

#### 9. Pencatatan Riwayat Perubahan Status (Log History)
* **Pertanyaan**: Bagaimana Anda ingin mencatat riwayat perubahan status laporan (status history log)?
* **Jawaban**: Membuat tabel log terpisah (`request_status_history`) untuk mencatat id_laporan, status_sebelumnya, status_baru, pengubah (user), catatan/alasan, dan timestamp.

#### 10. Kebijakan Penulisan Komentar/Catatan
* **Pertanyaan**: Bagaimana kebijakan penulisan komentar/catatan pada laporan?
* **Jawaban**: Semua aktor yang terlibat (Pelapor, Admin, Teknisi) dapat menambahkan komentar publik yang bisa dibaca oleh siapa saja di halaman detail laporan.

#### 11. Framework CSS / UI Styling
* **Pertanyaan**: Apakah ada framework CSS atau pustaka UI khusus yang ingin Anda gunakan untuk styling frontend React?
* **Jawaban**: Menggunakan Vanilla CSS murni dengan CSS Variables untuk desain premium, modern, dan responsif (tanpa instalasi library pihak ketiga tambahan).

#### 12. Aturan Validasi Input Tambahan
* **Pertanyaan**: Aturan validasi input tambahan apa saja yang ingin diterapkan pada form laporan?
* **Jawaban**: Judul laporan minimal 5 karakter, deskripsi minimal 20 karakter, dan kolom lokasi wajib diisi (tidak boleh kosong).

#### 13. Strategi Pembagian Automated Tests
* **Pertanyaan**: Bagaimana rencana pembagian 20+ automated tests yang diwajibkan?
* **Jawaban**: Kombinasi antara Unit Test untuk fungsi helper/validasi (di tests/unit/) dan Integration Test untuk API endpoint worker (di tests/integration/).

#### 14. Alur CI/CD ke Cloudflare
* **Pertanyaan**: Bagaimana alur CI/CD untuk deployment otomatis ke Cloudflare?
* **Jawaban**: Menghubungkan repositori GitHub langsung dengan Cloudflare Pages (setiap push ke branch `main` langsung men-deploy otomatis via Cloudflare Dashboard).

#### 15. Lokasi Penyimpanan Traceability Matrix
* **Pertanyaan**: Di mana dokumen Traceability Matrix (FR -> User Story -> Test) sebaiknya disimpan dan diperbarui?
* **Jawaban**: Di file [docs/requirements/traceability.md](file:///c:/Users/User/Desktop/campus-service-project/docs/requirements/traceability.md) sebagai tabel markdown terstruktur.
