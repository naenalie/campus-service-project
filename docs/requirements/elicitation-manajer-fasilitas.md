# Elicitation — Manajer Fasilitas (Kepala Biro Sarpras)

Dokumen ini berisi hasil penggalian kebutuhan (elicitation) tersembunyi, batasan, ketakutan, serta pertanyaan terstruktur untuk peran Manajer Fasilitas.

---

## 1. Analisis Kebutuhan Mendalam

*   **Apa yang mereka BUTUHKAN (bukan sekadar inginkan)**:
    *   **Data Kinerja Objektif**: Statistik agregat waktu respon (response time) dan waktu penyelesaian perbaikan (resolution time) untuk mengevaluasi kinerja tim maintenance secara berkala.
    *   **Identifikasi Aset Lemah**: Laporan tentang area, gedung, atau jenis fasilitas yang paling sering mengalami kerusakan berulang sebagai basis data peremajaan aset.
    *   **Dashboard Visual Ringkas**: Grafik yang mudah dibaca untuk presentasi rutin ke jajaran Rektorat tanpa perlu mengunduh data mentah terlebih dahulu.
*   **Apa yang mereka TAKUTKAN dari sistem baru ini**:
    *   Manipulasi data performa (staf/teknisi memanipulasi tanggal penyelesaian di sistem agar performa SLA terlihat sempurna padahal pengerjaan fisik terlambat).
    *   Hilangnya data historis penting jika database server gratis mengalami kendala penyimpanan.
*   **Apa yang membuat mereka TIDAK mau pakai sistem ini**:
    *   Dashboard analitik terlalu kompleks, membingungkan, dan membutuhkan keahlian database (SQL) untuk membaca data atau mendapatkan kesimpulan laporan.
    *   Biaya pemeliharaan sistem tersembunyi yang muncul di kemudian hari (padahal komitmen awal adalah 100% free tier).
*   **Apa yang mereka anggap "sudah pasti ada" (taken for granted)**:
    *   Data laporan terlindungi dengan aman dari akses publik luar kampus dan memiliki tingkat integritas data audit log yang tidak dapat diubah oleh pengguna biasa.
*   **Batasan Waktu & Responsivitas**:
    *   Halaman dashboard analitik manajer harus memuat grafik agregat secara instan (di bawah 3 detik) meskipun volume data laporan sudah mencapai ribuan baris.

---

## 2. Daftar Pertanyaan Elicitation

| No | Pertanyaan Elicitation | Alasan Pentingnya Pertanyaan |
| :--- | :--- | :--- |
| 1 | Metrik performa apa saja yang paling kritis untuk ditampilkan pada grafik utama dashboard Anda? | Menentukan desain visualisasi grafik data (apakah diagram lingkaran kategori, atau grafik batang jumlah status laporan). |
| 2 | Apakah Anda memerlukan analisis perbandingan kinerja antar teknisi (jumlah perbaikan yang diselesaikan)? | Menentukan kebutuhan visualisasi performa staf dan penambahan kolom identitas teknisi pada tabel D1. |
| 3 | Bagaimana Anda mendefinisikan laporan yang sukses secara SLA (misal: selesai dalam waktu < 24 jam)? | Membantu merumuskan logika pewarnaan indikator keterlambatan (warning thresholds) pada tabel laporan. |
| 4 | Apakah Anda memerlukan pengelompokan frekuensi kerusakan berdasarkan aset spesifik (misal: merk AC tertentu)? | Menentukan tingkat kedetailan isian kategori kerusakan pada database D1. |
| 5 | Apakah Anda memerlukan sistem pencadangan (backup) data berkala di luar database utama Cloudflare D1? | Mengidentifikasi kebutuhan ekspor data atau integrasi sistem penyimpanan sekunder di masa depan. |
| 6 | Bagaimana Anda ingin memverifikasi bahwa data log status history tidak dimanipulasi oleh admin atau teknisi? | Memvalidasi pentingnya perlindungan integritas tabel `request_status_history` agar tidak bisa diedit via UI. |
| 7 | Apakah Anda memerlukan laporan terenkripsi yang hanya bisa diakses oleh Anda dan Rektorat? | Menilai tingkat kebutuhan privasi data laporan keuangan perbaikan/aset yang sensitif. |
| 8 | Seberapa sering Anda mengevaluasi dashboard ini (harian, mingguan, atau bulanan)? | Membantu optimalisasi caching data agregat pada server Workers agar query tidak membebani database D1 gratis. |

---

## 3. Potensi Konflik Antar Stakeholder

*   **Audit Ketat vs Fleksibilitas Teknisi**: Manajer Fasilitas menginginkan pencatatan waktu audit yang sangat presisi dan tidak bisa diubah untuk mengevaluasi kinerja. Di sisi lain, teknisi menginginkan fleksibilitas penyesuaian catatan pengerjaan karena dinamika situasi lapangan yang sering tidak terduga.
*   **Transparansi Keluhan vs Reputasi Unit**: Pelapor (mahasiswa/dosen) menginginkan seluruh data keluhan dapat diakses secara transparan di publik. Namun, Manajer Fasilitas mungkin khawatir publikasi keluhan sarana kampus secara bebas dapat merusak citra tata kelola operasional kampus di mata pihak eksternal.
