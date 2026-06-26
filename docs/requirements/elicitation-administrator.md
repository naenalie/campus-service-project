# Elicitation — Administrator (Sarpras / Biro Umum)

Dokumen ini berisi hasil penggalian kebutuhan (elicitation) tersembunyi, batasan, ketakutan, serta pertanyaan terstruktur untuk peran Administrator.

---

## 1. Analisis Kebutuhan Mendalam

*   **Apa yang mereka BUTUHKAN (bukan sekadar inginkan)**:
    *   **Single Source of Truth**: Satu dashboard utama yang menampung semua keluhan masuk tanpa ada data tercecer dari saluran luar (seperti WhatsApp/memo lisan).
    *   **Panel Kontrol Penugasan**: Antarmuka cepat untuk menugaskan teknisi dan merubah tingkat prioritas/kategori dengan sekali klik.
    *   **Kemampuan Reject & Re-route**: Hak untuk menolak laporan yang tidak valid/iseng serta mengalihkan penugasan dari teknisi A ke teknisi B jika teknisi A berhalangan.
*   **Apa yang mereka TAKUTKAN dari sistem baru ini**:
    *   Meningkatnya beban administratif (staf harus menghabiskan lebih banyak waktu di depan komputer/aplikasi untuk memproses data dibanding sebelum menggunakan sistem).
    *   Kehilangan riwayat penugasan kerja yang telah lalu karena kapasitas database Cloudflare D1 gratis habis.
*   **Apa yang membuat mereka TIDAK mau pakai sistem ini**:
    *   Sistem sering lambat atau mengalami crash saat memuat antrean laporan masuk, sehingga memperlambat respons mereka.
    *   Prosedur operasional sistem yang kaku dan tidak membolehkan perubahan penugasan setelah status masuk ke `In Progress`.
*   **Apa yang mereka anggap "sudah pasti ada" (taken for granted)**:
    *   Hak istimewa (admin privilege) untuk mengesampingkan (override) status pengerjaan atau menugaskan ulang tugas kapan saja tanpa persetujuan teknisi/pelapor.
*   **Batasan Waktu & Responsivitas**:
    *   Dashboard antrean laporan admin harus memuat daftar terbaru dalam waktu kurang dari 1 detik.
    *   Operasi pengubahan status atau penugasan teknisi harus tersimpan dan tersinkronisasi ke database dalam waktu kurang dari 1,5 detik.

---

## 2. Daftar Pertanyaan Elicitation

| No | Pertanyaan Elicitation | Alasan Pentingnya Pertanyaan |
| :--- | :--- | :--- |
| 1 | Bagaimana Administrator menentukan prioritas (LOW, MEDIUM, HIGH) secara objektif tanpa bias personal? | Menentukan apakah kita memerlukan aturan baku (business rule) otomatis atau murni kebijakan subjektif admin. |
| 2 | Apakah administrator memerlukan fitur untuk memindahkan tugas dari satu teknisi ke teknisi lain secara instan? | Menentukan fleksibilitas perubahan database pada field `assigned_to` selama siklus hidup keluhan. |
| 3 | Bagaimana admin memvalidasi kebenaran laporan yang masuk sebelum menugaskannya ke teknisi? | Menggali kebutuhan alur verifikasi awal sebelum status keluhan berubah dari `Submitted` menjadi `Under Review` / `Assigned`. |
| 4 | Apakah admin memerlukan indikator visual/lencana angka merah untuk laporan baru yang berstatus Submitted? | Penting untuk desain UI dashboard admin agar laporan kritis baru langsung terlihat dan tidak tertimbun. |
| 5 | Bagaimana prosedur penutupan laporan jika pelapor tidak merespons konfirmasi penyelesaian? | Menentukan apakah sistem memerlukan fitur penutupan otomatis (auto-close) oleh admin setelah periode waktu tertentu. |
| 6 | Apakah admin berhak menolak laporan (status Rejected) dan memberikan alasan tertulis kepada pelapor? | Memperjelas alur status di luar alur linier, serta menentukan apakah kolom catatan alasan penolakan wajib diisi. |
| 7 | Berapa banyak jumlah teknisi aktif yang biasanya dikelola dalam satu fakultas/lingkungan kampus? | Membantu mengoptimalkan query list dropdown teknisi agar UI dropdown tetap ringan. |
| 8 | Apakah admin memerlukan log audit lengkap (siapa mengubah status apa, kapan, dan alasannya) di antarmuka web? | Memandu desain database dan query pada tabel `request_status_history`. |

---

## 3. Potensi Konflik Antar Stakeholder

*   **Penyelesaian Cepat vs Validitas Pekerjaan**: Administrator ingin tiket segera ditutup (`Closed`) untuk menjaga metrik KPI/SLA terlihat baik. Sebaliknya, pelapor ingin tiket tetap terbuka jika hasil perbaikan fisik belum benar-benar sempurna.
*   **Beban Kerja vs Penugasan Manual**: Admin ingin bebas menugaskan laporan kepada teknisi mana pun tanpa batasan. Namun, Teknisi menginginkan sistem memiliki pembatasan beban kerja (capping) agar penugasan tidak menumpuk pada satu orang saja.
