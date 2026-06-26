# Inception & Stakeholder Analysis
## Campus Service Request and Maintenance System

Dokumen ini mendefinisikan analisis awal masalah, stakeholder, batasan scope, asumsi, serta pertanyaan terbuka sebelum penulisan requirement dan implementasi sistem dilakukan.

---

## 1. Analisis Stakeholder

Sistem ini melibatkan empat peran utama dengan karakteristik, kebutuhan, dan kendala yang khas pada lingkungan kampus di Indonesia.

### A. Pelapor (Mahasiswa & Dosen)
*   **Peran**: Mengirimkan keluhan atau laporan kerusakan fasilitas, memantau status perkembangan perbaikan secara berkala, menambahkan komentar tambahan jika diperlukan, dan memberikan konfirmasi akhir ketika kerusakan dinyatakan selesai diperbaiki.
*   **Pain Point**:
    *   Prosedur pelaporan saat ini tidak jelas (apakah harus lewat WhatsApp, Google Form, atau melapor langsung ke staf tata usaha).
    *   Tidak adanya transparansi pasca pelaporan (pelapor tidak tahu apakah laporan mereka dibaca, ditolak, sedang dikerjakan, atau diabaikan).
    *   Miskomunikasi tentang tingkat keparahan masalah karena keterbatasan media penyampaian detail kerusakan.
*   **Tujuan**:
    *   Melaporkan masalah fasilitas dalam waktu kurang dari 1 menit dari perangkat manapun.
    *   Mendapatkan kepastian estimasi status penanganan masalah secara transparan.
    *   Memberikan penilaian/umpan balik jika hasil perbaikan di lapangan ternyata kurang memuaskan.
*   **Kekhawatiran / Ketakutan**:
    *   Laporan dianggap sepele dan tidak ditindaklanjuti selama berbulan-bulan.
    *   Sistem pelaporan terlalu rumit (misal membutuhkan formulir berlapis) sehingga malas untuk melaporkan kerusakan kecil.

### B. Administrator (Staf Unit Sarana Prasarana / Biro Umum)
*   **Peran**: Meninjau laporan yang masuk, mengklasifikasikan kategori masalah, menentukan tingkat prioritas perbaikan, menugaskan teknisi spesifik yang relevan, serta menutup tiket laporan setelah dikonfirmasi selesai.
*   **Pain Point**:
    *   Kewalahan menerima keluhan dari berbagai jalur acak (WhatsApp pribadi, memo cetak, email, telpon) sehingga sulit merekap.
    *   Kesulitan memantau beban kerja masing-masing teknisi di lapangan secara adil.
    *   Tidak memiliki catatan sejarah (audit log) perubahan status untuk melacak efisiensi kerja unit perawatan.
*   **Tujuan**:
    *   Memiliki satu dashboard terpusat untuk meninjau, memfilter, dan mendistribusikan penugasan kerja.
    *   Mempermudah pelacakan laporan yang menumpuk atau terlambat ditangani.
    *   Menghilangkan ketergantungan pada kertas instruksi kerja manual.
*   **Kekhawatiran / Ketakutan**:
    *   Sistem baru terlalu rumit dioperasikan oleh staf administrasi senior yang kurang tech-savvy.
    *   Keterbatasan penyimpanan serverless database Cloudflare D1 gratis jika data laporan menumpuk dalam jangka panjang.

### C. Teknisi (Staf Perbaikan Lapangan)
*   **Peran**: Menerima tugas perbaikan dari administrator, memperbarui progres pengerjaan di lapangan (dari Assigned -> In Progress -> Resolved), serta menuliskan catatan teknis atau kendala jika ada.
*   **Pain Point**:
    *   Menerima instruksi kerja lisan yang sering kali lupa atau kertas instruksi fisik yang mudah kotor/hilang saat bekerja.
    *   Informasi lokasi dan detail kerusakan awal seringkali tidak akurat atau kurang jelas.
    *   Tidak memiliki panduan prioritas pengerjaan (semua laporan dirasa mendesak oleh pelapor).
*   **Tujuan**:
    *   Melihat daftar tugas harian mereka secara rapi lewat ponsel pintar.
    *   Kemudahan melaporkan status pengerjaan secara langsung dan cepat di lokasi perbaikan (paperless).
*   **Kekhawatiran / Ketakutan**:
    *   Dituduh tidak bekerja oleh pimpinan karena tidak adanya bukti pencatatan waktu mulai dan selesai pengerjaan yang objektif.
    *   Aplikasi membutuhkan banyak input teks yang menyulitkan mereka saat bekerja dengan tangan kotor/basah di lapangan.
    *   Dituduh lambat bekerja padahal kendala disebabkan oleh kekosongan stok suku cadang `[ASUMSI]`.

### D. Manajer Fasilitas (Kepala Biro Sarana & Prasarana)
*   **Peran**: Mengevaluasi kinerja unit pemeliharaan secara makro, memantau waktu penyelesaian laporan (SLA), dan melihat laporan statistik kerusakan untuk menentukan keputusan anggaran peremajaan aset kampus.
*   **Pain Point**:
    *   Tidak memiliki data analitis objektif untuk mengevaluasi waktu rata-rata penyelesaian keluhan (SLA).
    *   Kesulitan mendeteksi area/gedung atau jenis fasilitas yang paling sering mengalami kerusakan berulang.
*   **Tujuan**:
    *   Memiliki dashboard visual real-time yang menyajikan grafik performa layanan pemeliharaan kampus.
    *   Mengakses metrik total laporan masuk, pengerjaan aktif, dan laporan sukses diselesaikan dalam satu klik.
*   **Kekhawatiran / Ketakutan**:
    *   Data performa di manipulasi oleh staf di bawahnya jika tidak ada sistem log terenkripsi/terkunci.
    *   Biaya operasional aplikasi menjadi bengkak (maka sistem didesain memanfaatkan paket gratis Cloudflare Workers & D1).

---

## 2. Analisis Masalah Utama

Sistem ini ditujukan untuk memecahkan 4 masalah utama:
1.  **Pelaporan Tidak Terstruktur**: Keluhan tersebar di berbagai media yang tidak tercatat secara formal.
2.  **Silo Informasi (No Status Tracking)**: Pelapor tidak memiliki visibilitas atas progres perbaikan keluhan mereka.
3.  **Ketidakpastian Prioritas**: Teknisi kesulitan mengidentifikasi tugas mana yang harus diselesaikan terlebih dahulu (misal: AC ruang ujian bocor vs lampu toilet mati).
4.  **Ketiadaan Metrik Performa**: Manajemen tidak memiliki data riil untuk mengevaluasi kinerja staf pemeliharaan.

---

## 3. Batasan Scope (Lingkup Kerja)

### A. Di dalam Scope (In-Scope)
*   Formulir pengiriman keluhan dengan validasi input (Judul min. 5 karakter, Deskripsi min. 20 karakter, Lokasi wajib diisi).
*   Penomoran otomatis keluhan menggunakan format `CSR-${Date.now()}`.
*   Mekanisme penugasan teknisi (manual oleh Administrator dari dropdown list).
*   Alur transisi status keluhan secara linier:
    `Submitted` &rarr; `Under Review` &rarr; `Assigned` &rarr; `In Progress` &rarr; `Resolved` &rarr; `Closed`.
*   Tabel log riwayat status per keluhan (`request_status_history`) untuk audit log.
*   Sistem komentar teks publik pada setiap laporan untuk koordinasi.
*   Dashboard statistik sederhana (angka agregat status dan persentase kategori kerusakan) untuk Manajer Fasilitas.
*   Dropdown Role Switcher di header untuk simulasi demo role Pelapor, Admin, Teknisi, dan Manajer.

### B. Di luar Scope (Out-of-Scope)
*   Sistem autentikasi multi-faktor rill atau integrasi Single Sign-On (SSO) kampus.
*   Upload foto/file bukti kerusakan (karena batasan kapasitas penyimpanan objek gratis Cloudflare).
*   Notifikasi SMS / Email / WhatsApp otomatis secara real-time.
*   Sistem pemindai QR Code fisik di pintu kelas untuk laporan langsung.
*   Modul inventarisasi dan manajemen pemesanan suku cadang.

---

## 4. Asumsi yang Perlu Divalidasi [ASUMSI]

1.  `[ASUMSI]` Layanan Cloudflare Workers Free Tier dengan limit 100.000 request/hari dan database D1 sebesar 500 MB sangat memadai untuk menampung data operasional pemeliharaan 1 fakultas selama minimal 2 tahun.
2.  `[ASUMSI]` Sebagian besar teknisi lapangan menggunakan ponsel pintar (smartphone) Android dengan paket data aktif untuk memperbarui status pengerjaan di lokasi.
3.  `[ASUMSI]` Proses registrasi daftar akun teknisi (staf unit perawatan) cukup dilakukan oleh developer melalui database migration script awal, tidak diperlukan antarmuka registrasi user mandiri.
4.  `[ASUMSI]` Kategori kerusakan cukup dibatasi secara hardcoded pada level kode (Internet, AC, Peralatan Kelas, Kebersihan, Lainnya) untuk meminimalkan beban query database.
5.  `[ASUMSI]` Seluruh civitas akademika (dosen, mahasiswa, staf) menggunakan satu server lokal kampus yang terhubung internet untuk membuka website ini.

---

## 5. Pertanyaan Terbuka [PERTANYAAN TERBUKA]

1.  `[PERTANYAAN TERBUKA]` Berapa target waktu tanggap (SLA) ideal yang diharapkan dari status `Submitted` ke `Assigned` untuk masing-masing tingkat prioritas (LOW, MEDIUM, HIGH)?
2.  `[PERTANYAAN TERBUKA]` Apakah pelapor dapat mengajukan keberatan (re-open) jika laporan mereka ditutup (`Closed`) oleh Administrator namun fasilitasnya rusak kembali dalam waktu dekat?
3.  `[PERTANYAAN TERBUKA]` Apakah data riwayat status (`request_status_history`) perlu menyertakan koordinat GPS opsional teknisi saat melakukan check-in perbaikan untuk meminimalkan laporan palsu?
4.  `[PERTANYAAN TERBUKA]` Bagaimana kebijakan penghapusan atau pengarsipan data keluhan yang sudah selesai (`Closed`) setelah melewati kurun waktu tertentu agar database D1 gratis tidak penuh?
5.  `[PERTANYAAN TERBUKA]` Apakah Manajer Fasilitas memerlukan fitur unduh laporan dalam format file spreadsheet (CSV/Excel) untuk laporan rutin bulanan rektorat?
