# Elicitation — Teknisi (Staf Perawatan Lapangan)

Dokumen ini berisi hasil penggalian kebutuhan (elicitation) tersembunyi, batasan, ketakutan, serta pertanyaan terstruktur untuk peran Teknisi.

---

## 1. Analisis Kebutuhan Mendalam

*   **Apa yang mereka BUTUHKAN (bukan sekadar inginkan)**:
    *   **Lokasi Spesifik dan Detail Akurat**: Informasi ruangan, nomor lantai, gedung, dan deskripsi kerusakan yang jelas dari pelapor agar tidak membuang waktu mencari-cari di lapangan.
    *   **Daftar Tugas yang Terurut Prioritas**: Tampilan daftar pekerjaan yang terurut berdasarkan prioritas (misal High di atas) agar mereka tahu apa yang harus dikerjakan dulu.
    *   **Pencatatan Kendala Lapangan**: Cara mudah untuk mencatat progres pengerjaan atau hambatan (seperti menunggu ketersediaan suku cadang) tanpa ribet.
*   **Apa yang mereka TAKUTKAN dari sistem baru ini**:
    *   Pengawasan mikro (micro-management) yang berlebihan oleh pimpinan melalui pelacakan waktu penyelesaian tugas secara real-time.
    *   Sistem error atau lemot saat mereka sedang bekerja di lapangan, yang membuat mereka dituduh tidak disiplin memperbarui status.
*   **Apa yang membuat mereka TIDAK mau pakai sistem ini**:
    *   Aplikasi mewajibkan pengisian form yang rumit, panjang, dan banyak mengetik teks saat menandai tugas selesai (sulit dilakukan di sela-sela kerja fisik).
    *   Aplikasi tidak responsif atau tidak ramah layar sentuh ponsel (mobile layout buruk).
*   **Apa yang mereka anggap "sudah pasti ada" (taken for granted)**:
    *   Tampilan default aplikasi langsung menyaring dan menampilkan hanya tugas-tugas yang ditugaskan kepada diri mereka sendiri (tugas personal), bukan tugas seluruh teknisi kampus.
*   **Batasan Waktu & Responsivitas**:
    *   Aplikasi harus sangat ringan dan stabil dimuat di area dengan sinyal internet seluler lemah (under 3 seconds load time).
    *   Tombol aksi transisi status (misal "Mulai Kerja" atau "Selesai") harus merespon instan di layar di bawah 0,5 detik.

---

## 2. Daftar Pertanyaan Elicitation

| No | Pertanyaan Elicitation | Alasan Pentingnya Pertanyaan |
| :--- | :--- | :--- |
| 1 | Apakah teknisi merasa perlu mengelompokkan tugas berdasarkan lokasi (gedung/lantai) demi efisiensi perjalanan mereka? | Menentukan apakah kita memerlukan fitur sortir/filter lokasi pada dashboard teknisi. |
| 2 | Bagaimana teknisi mencatat kendala jika suku cadang kosong atau perbaikan membutuhkan vendor eksternal? | Menggali kebutuhan opsi penanganan hambatan (apakah perlu catatan status khusus atau sekadar komentar tertulis). |
| 3 | Bagaimana teknisi menandai bahwa mereka telah menerima tugas dan dalam perjalanan ke lokasi? | Memvalidasi kebutuhan tombol aksi transisi status dari `Assigned` ke `In Progress`. |
| 4 | Apakah teknisi memerlukan riwayat perbaikan masa lalu untuk fasilitas/lokasi yang sama? | Membantu teknisi mendiagnosis kerusakan berulang jika ada data riwayat kerusakan alat di lokasi tersebut. |
| 5 | Apakah teknisi terbiasa menuliskan catatan teknis secara detail setelah perbaikan selesai? | Menentukan apakah kolom catatan penyelesaian tugas (resolved notes) bersifat wajib (mandatory) atau opsional. |
| 6 | Berapa lama batas toleransi teknisi untuk merespon tugas baru sejak ditugaskan oleh admin? | Menentukan indikator performa ketepatan waktu respon teknisi di lapangan. |
| 7 | Apakah teknisi merasa terganggu jika pelapor dapat langsung mengirim komentar pada keluhan yang sedang dikerjakan? | Menggali kebutuhan privasi komunikasi (apakah komentar pelapor perlu dibatasi atau dibolehkan penuh). |
| 8 | Bagaimana teknisi memperbarui status jika lokasi perbaikan (seperti basement/laboratorium) tidak terjangkau sinyal Wi-Fi/data? | Mengidentifikasi kebutuhan penanganan error jaringan atau rekomendasi petunjuk penggunaan jika offline. |

---

## 3. Potensi Konflik Antar Stakeholder

*   **Pencatatan SLA vs Kendala Riil**: Manajer menginginkan perhitungan waktu pengerjaan terus berjalan sejak tugas diberikan. Sementara itu, teknisi berargumen waktu pengerjaan harus dihentikan sementara (paused) jika pengerjaan terhambat faktor eksternal seperti pemesanan suku cadang.
*   **Detail Laporan vs Kecepatan Pengerjaan**: Pelapor menginginkan teknisi menuliskan detail kronologi perbaikan. Namun, teknisi ingin proses penutupan tiket secepat mungkin (satu tombol klik) agar mereka bisa segera berpindah ke lokasi perbaikan berikutnya.
