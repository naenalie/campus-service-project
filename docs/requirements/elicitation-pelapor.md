# Elicitation — Pelapor (Mahasiswa & Dosen)

Dokumen ini berisi hasil penggalian kebutuhan (elicitation) tersembunyi, batasan, ketakutan, serta pertanyaan terstruktur untuk peran Pelapor.

---

## 1. Analisis Kebutuhan Mendalam

*   **Apa yang mereka BUTUHKAN (bukan sekadar inginkan)**:
    *   **Kepastian Penerimaan Laporan**: Pelapor membutuhkan konfirmasi instan bahwa laporan mereka telah masuk ke sistem antrean admin tanpa perlu menelpon/menghubungi staf sarpras secara personal.
    *   **Riwayat Laporan Pribadi**: Halaman khusus untuk melihat seluruh laporan yang pernah mereka buat beserta status terkininya.
    *   **Feedback & Re-open**: Hak untuk menyatakan "Tidak Setuju" jika hasil perbaikan di lapangan dirasa kurang baik, sehingga tiket bisa ditinjau kembali.
*   **Apa yang mereka TAKUTKAN dari sistem baru ini**:
    *   Sistem ini hanya menjadi "hiasan birokrasi" di mana laporan tetap menumpuk dan tidak dikerjakan, tetapi status di sistem dimanipulasi menjadi selesai.
    *   Proses pengisian formulir keluhan yang terlalu rumit dengan banyak isian teknis yang tidak dipahami orang awam.
*   **Apa yang membuat mereka TIDAK mau pakai sistem ini**:
    *   Wajib mendaftarkan akun secara rumit dan melakukan verifikasi email manual sebelum melapor (mereka lebih memilih langsung WA admin).
    *   Tampilan form tidak ramah pengguna perangkat seluler (mobile).
*   **Apa yang mereka anggap "sudah pasti ada" (taken for granted)**:
    *   Sistem secara otomatis mendeteksi identitas mereka (Nama dan Email/NIM/NIDN) saat login simulator tanpa perlu mengetik ulang informasi profil.
*   **Batasan Waktu & Responsivitas**:
    *   Loading form pelaporan harus di bawah 2 detik.
    *   Status pembaruan dari admin/teknisi harus langsung muncul di halaman detail laporan dalam waktu kurang dari 5 detik setelah diubah.

---

## 2. Daftar Pertanyaan Elicitation

| No | Pertanyaan Elicitation | Alasan Pentingnya Pertanyaan |
| :--- | :--- | :--- |
| 1 | Bagaimana pelapor mengetahui nama admin/teknisi yang menangani keluhan mereka? | Transparansi personal meningkatkan kepercayaan pelapor bahwa laporan sedang diproses oleh orang yang bertanggung jawab. |
| 2 | Apakah pelapor bersedia menuliskan detail lokasi spesifik (nama gedung, lantai, nomor ruangan) secara manual setiap melapor? | Membantu menentukan apakah kita memerlukan database lokasi kampus (master data) atau cukup kolom teks bebas. |
| 3 | Bagaimana jika perbaikan dinyatakan selesai oleh teknisi, namun menurut pelapor belum tuntas? | Menentukan alur transisi status antara `Resolved`, persetujuan pelapor, dan penutupan final `Closed`. |
| 4 | Berapa lama waktu maksimal yang dapat ditoleransi pelapor untuk menerima tanggapan pertama (status berubah dari Submitted)? | Menentukan parameter metrik SLA (Service Level Agreement) awal untuk sistem. |
| 5 | Apakah pelapor merasa perlu adanya pengelompokan laporan berdasarkan kepentingan pribadi (misal tab "Laporan Saya")? | Memandu desain navigasi layout dashboard frontend agar pelapor tidak melihat data orang lain secara acak. |
| 6 | Bagaimana jika kategori kerusakan tidak ada di dalam daftar default (Internet, AC, Peralatan Kelas, Kebersihan)? | Menentukan kebutuhan kolom opsi "Lainnya" beserta input teks bebas untuk kategori custom. |
| 7 | Apakah pelapor mengharapkan notifikasi email/chat ketika status laporan mereka berubah? | Mengidentifikasi batasan integrasi sistem pihak ketiga (misalnya email/WA) di masa depan. |
| 8 | Apakah pelapor bersedia menggunakan sistem jika hanya bisa diakses menggunakan jaringan internet kampus (intranet/Wi-Fi kampus)? | Memengaruhi arsitektur deployment jaringan dan kebijakan keamanan akses serverless Workers. |

---

## 3. Potensi Konflik Antar Stakeholder

*   **Transparansi vs Privasi Teknisi**: Pelapor ingin mengetahui identitas dan kontak teknisi yang ditugaskan demi kemudahan koordinasi. Namun, Teknisi khawatir privasi mereka terganggu dan dihubungi secara langsung di luar jam kerja/di luar sistem resmi.
*   **Validasi Masalah vs Kemudahan Pelaporan**: Admin ingin pelapor mengisi formulir dengan detail teknis lengkap agar mudah diklasifikasi. Sebaliknya, pelapor menginginkan form sesederhana mungkin tanpa banyak isian yang membingungkan.
