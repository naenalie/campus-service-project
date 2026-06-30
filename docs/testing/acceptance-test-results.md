# Laporan Hasil Uji Penerimaan Pengguna (Acceptance Test Results)
Sistem Pengelolaan Perawatan Sarana & Prasarana Kampus Universitas Klabat (UNKLAB)

Dokumen ini mencatat hasil pengujian fungsional dari sudut pandang pengguna akhir (*User Stories*) untuk memverifikasi kesiapan rilis sistem.

---

### AT-01 — Register akun baru sebagai Pelapor
**Role:** PELAPOR  
**Precondition:** Halaman `/register` terbuka, database bersih dari email uji yang akan digunakan.

| Step | Given | When | Then | Status |
| :--- | :--- | :--- | :--- | :--- |
| 1 | Pengguna berada di halaman registrasi | Mengisi nama, email `@unklab.ac.id`, password & konfirmasi password yang sama (min. 8 karakter), lalu klik "Daftar Sekarang" | Akun berhasil dibuat, pesan sukses muncul, dan redirect ke halaman `/login` terjadi setelah 2 detik | [ ] |
| 2 | Pengguna berada di halaman registrasi | Mengisi data dengan password kurang dari 8 karakter atau konfirmasi sandi tidak cocok | Sistem menahan registrasi dan menampilkan pesan error validasi berwarna merah | [ ] |

**Catatan:**  
**Screenshot:** `evidence/screenshots/AT-01.png`

---

### AT-02 — Login berhasil dan redirect sesuai role
**Role:** SEMUA ROLE  
**Precondition:** Pengguna telah memiliki akun terdaftar dengan peran PELAPOR, ADMIN, TEKNISI, atau MANAJER.

| Step | Given | When | Then | Status |
| :--- | :--- | :--- | :--- | :--- |
| 1 | Pengguna berada di `/login` dengan peran PELAPOR | Mengisi email & sandi valid, lalu klik "Masuk" | Berhasil login dan dialihkan secara otomatis ke beranda utama `/` | [ ] |
| 2 | Pengguna berada di `/login` dengan peran ADMIN | Mengisi email & sandi valid, lalu klik "Masuk" | Berhasil login dan dialihkan secara otomatis ke dashboard admin `/admin` | [ ] |
| 3 | Pengguna berada di `/login` dengan peran TEKNISI | Mengisi email & sandi valid, lalu klik "Masuk" | Berhasil login dan dialihkan secara otomatis ke workspace teknisi `/teknisi` | [ ] |
| 4 | Pengguna berada di `/login` dengan peran MANAJER | Mengisi email & sandi valid, lalu klik "Masuk" | Berhasil login dan dialihkan secara otomatis ke dashboard eksekutif `/manajer` | [ ] |

**Catatan:**  
**Screenshot:** `evidence/screenshots/AT-02.png`

---

### AT-03 — Login gagal dengan password salah
**Role:** SEMUA ROLE  
**Precondition:** Pengguna berada di halaman `/login`.

| Step | Given | When | Then | Status |
| :--- | :--- | :--- | :--- | :--- |
| 1 | Pengguna berada di halaman login | Mengisi email terdaftar tetapi password salah, lalu menekan tombol "Masuk" | Sistem gagal masuk, tombol kembali ke keadaan normal, card bergoyang (shake animation), dan muncul kotak error merah | [ ] |

**Catatan:**  
**Screenshot:** `evidence/screenshots/AT-03.png`

---

### AT-04 — Pelapor membuat laporan baru
**Role:** PELAPOR  
**Precondition:** Pelapor telah masuk ke sistem dan membuka halaman `/create`.

| Step | Given | When | Then | Status |
| :--- | :--- | :--- | :--- | :--- |
| 1 | Form laporan kosong | Mengisi judul, memilih gedung, menulis detail lokasi, memilih kategori via pill button, menulis deskripsi > 20 karakter, lalu klik "Kirim Laporan" | Tiket sukses dibuat, card berubah menampilkan tanda centang sukses hijau beserta nomor kode request `CSR-XXXXXXXXX` | [ ] |
| 2 | Form laporan kosong | Menulis deskripsi kurang dari 20 karakter | Counter karakter berwarna merah dan tombol kirim memunculkan error validasi di bawah kolom deskripsi | [ ] |

**Catatan:**  
**Screenshot:** `evidence/screenshots/AT-04.png`

---

### AT-05 — Pelapor melihat daftar laporan miliknya
**Role:** PELAPOR  
**Precondition:** Pelapor berada di beranda utama `/`.

| Step | Given | When | Then | Status |
| :--- | :--- | :--- | :--- | :--- |
| 1 | Pelapor memiliki riwayat tiket | Membuka halaman utama | Sistem memuat secara dinamis daftar keluhan yang dilaporkan oleh pelapor terkait saja, lengkap dengan status badge dan info tanggal relatif | [ ] |
| 2 | Daftar tiket termuat | Menulis kata kunci pencarian di kolom pencarian atau mengganti filter status | Daftar tiket langsung menyaring hasil secara *real-time* | [ ] |

**Catatan:**  
**Screenshot:** `evidence/screenshots/AT-05.png`

---

### AT-06 — Pelapor melihat detail laporan + riwayat status
**Role:** PELAPOR  
**Precondition:** Pelapor memiliki tiket aktif dan berada di halaman `/requests/:id`.

| Step | Given | When | Then | Status |
| :--- | :--- | :--- | :--- | :--- |
| 1 | Halaman detail tiket terbuka | Membaca visual halaman | Informasi judul, detail lokasi, kategori, log timeline status transisi, dan kolom diskusi komentar termuat secara rapi | [ ] |

**Catatan:**  
**Screenshot:** `evidence/screenshots/AT-06.png`

---

### AT-07 — Admin melihat semua laporan dengan filter
**Role:** ADMIN  
**Precondition:** Admin masuk ke sistem dan berada di `/admin`.

| Step | Given | When | Then | Status |
| :--- | :--- | :--- | :--- | :--- |
| 1 | Dashboard admin termuat | Membaca daftar tiket terbaru | Admin melihat daftar keseluruhan laporan keluhan dari semua pelapor, lengkap dengan control filter pencarian, status, dan kategori | [ ] |

**Catatan:**  
**Screenshot:** `evidence/screenshots/AT-07.png`

---

### AT-08 — Admin mengubah prioritas laporan
**Role:** ADMIN  
**Precondition:** Admin berada di halaman detail laporan `/requests/:id`.

| Step | Given | When | Then | Status |
| :--- | :--- | :--- | :--- | :--- |
| 1 | Detail tiket termuat | Klik tombol "Set Prioritas ▾" dan memilih tingkat prioritas baru (misal: `CRITICAL`) | Prioritas tiket terupdate, log riwayat history bertambah, dan badge prioritas berganti warna | [ ] |

**Catatan:**  
**Screenshot:** `evidence/screenshots/AT-08.png`

---

### AT-09 — Admin assign laporan ke teknisi
**Role:** ADMIN  
**Precondition:** Tiket dalam status `UNDER_REVIEW`, admin berada di halaman detail tiket.

| Step | Given | When | Then | Status |
| :--- | :--- | :--- | :--- | :--- |
| 1 | Tombol penugasan muncul | Klik tombol "Tugaskan Teknisi ▾" lalu memilih nama teknisi aktif dari dropdown list | Tiket dialokasikan ke teknisi terpilih, status otomatis beralih linier menjadi `ASSIGNED` | [ ] |

**Catatan:**  
**Screenshot:** `evidence/screenshots/AT-09.png`

---

### AT-10 — Admin mengubah status laporan
**Role:** ADMIN  
**Precondition:** Admin berada di halaman detail tiket.

| Step | Given | When | Then | Status |
| :--- | :--- | :--- | :--- | :--- |
| 1 | Dropdown ubah status aktif | Klik "Ubah Status ▾" dan memilih target status valid secara linier (misal: `CLOSED`) | Status berhasil diperbarui di database dan riwayat penanganan mencatat tindakan manual admin | [ ] |

**Catatan:**  
**Screenshot:** `evidence/screenshots/AT-10.png`

---

### AT-11 — Teknisi melihat daftar tugas
**Role:** TEKNISI  
**Precondition:** Teknisi telah masuk ke sistem dan berada di `/teknisi`.

| Step | Given | When | Then | Status |
| :--- | :--- | :--- | :--- | :--- |
| 1 | Workspace teknisi terbuka | Membaca daftar di bagian bawah peta | Muncul kumpulan kartu tugas perbaikan yang dialokasikan padanya secara horizontal (.swipe-container) | [ ] |

**Catatan:**  
**Screenshot:** `evidence/screenshots/AT-11.png`

---

### AT-12 — Teknisi melihat peta kampus dengan pin laporan
**Role:** TEKNISI  
**Precondition:** Teknisi berada di halaman `/teknisi`.

| Step | Given | When | Then | Status |
| :--- | :--- | :--- | :--- | :--- |
| 1 | SVG Peta Kampus termuat | Mengamati visualisasi peta | Gedung yang memiliki tugas aktif memancarkan cahaya glow amber/purple dan memiliki pin badge notifikasi angka merah yang berdenyut (pulse) | [ ] |

**Catatan:**  
**Screenshot:** `evidence/screenshots/AT-12.png`

---

### AT-13 — Teknisi klik gedung di peta → filter tugas
**Role:** TEKNISI  
**Precondition:** Teknisi berada di halaman `/teknisi`.

| Step | Given | When | Then | Status |
| :--- | :--- | :--- | :--- | :--- |
| 1 | Peta kampus termuat | Klik salah satu gedung di peta (misal: `GK1`) | Muncul pop-up detail glass mengambang berisi info keluhan di GK1, dan daftar card tugas di bawah otomatis ter-filter hanya menampilkan tugas di GK1 saja | [ ] |

**Catatan:**  
**Screenshot:** `evidence/screenshots/AT-13.png`

---

### AT-14 — Teknisi update progress laporan
**Role:** TEKNISI  
**Precondition:** Teknisi berada di detail tiket `/requests/:id` atau card list tugas miliknya.

| Step | Given | When | Then | Status |
| :--- | :--- | :--- | :--- | :--- |
| 1 | Tiket berstatus `ASSIGNED` | Klik tombol "Mulai →" | Status tiket beralih ke `IN_PROGRESS` dan tercatat di log riwayat perbaikan | [ ] |
| 2 | Tiket berstatus `IN_PROGRESS` | Klik tombol "Selesai" dan memasukkan catatan perbaikan teknis pada modal dialog | Status tiket beralih ke `RESOLVED`, siap menunggu persetujuan pelapor | [ ] |

**Catatan:**  
**Screenshot:** `evidence/screenshots/AT-14.png`

---

### AT-15 — Manajer melihat dashboard ringkasan
**Role:** MANAJER  
**Precondition:** Manajer telah masuk ke sistem dan berada di `/manajer`.

| Step | Given | When | Then | Status |
| :--- | :--- | :--- | :--- | :--- |
| 1 | Halaman dashboard terbuka | Mengamati tampilan data | Ringkasan grafik batang kerusakan per gedung, donut chart sebaran kategori, 4 card statistik utama, dan tabel warning tiket overdue tervisualisasikan secara read-only | [ ] |

**Catatan:**  
**Screenshot:** `evidence/screenshots/AT-15.png`

---

### AT-16 — Dark mode toggle berfungsi di semua halaman
**Role:** SEMUA ROLE  
**Precondition:** Pengguna membuka sistem di halaman mana pun.

| Step | Given | When | Then | Status |
| :--- | :--- | :--- | :--- | :--- |
| 1 | Tombol toggle mode sun/moon terlihat | Klik pada toggle switch | Warna tema bertukar secara halus (light/dark) diiringi transisi spring CSS, dan data-theme terekam di localStorage | [ ] |

**Catatan:**  
**Screenshot:** `evidence/screenshots/AT-16.png`

---

### AT-17 — Tampilan mobile responsive di semua halaman
**Role:** SEMUA ROLE  
**Precondition:** Pengguna membuka sistem lewat peramban mobile (smartphone).

| Step | Given | When | Then | Status |
| :--- | :--- | :--- | :--- | :--- |
| 1 | Aplikasi termuat di resolusi ponsel | Menggulir halaman | Navigasi sidebar berganti menjadi bottom navbar, stat cards menjadi swipeable secara horizontal (.swipe-container), dan grid layout menyusut secara vertikal | [ ] |

**Catatan:**  
**Screenshot:** `evidence/screenshots/AT-17.png`

---

### AT-18 — Logout berhasil dari semua role
**Role:** SEMUA ROLE  
**Precondition:** Pengguna dalam kondisi login aktif.

| Step | Given | When | Then | Status |
| :--- | :--- | :--- | :--- | :--- |
| 1 | Pengguna mengklik tombol "Keluar" / "Logout" | Menyetujui konfirmasi keluar | Sesi login dihapus dari localStorage, dan sistem mengalihkan pengguna kembali ke halaman utama `/login` | [ ] |

**Catatan:**  
**Screenshot:** `evidence/screenshots/AT-18.png`

---

## Ringkasan Akhir Pengujian

| Total Skenario | Pass (Lulus) | Fail (Gagal) | Partial (Sebagian) |
| :---: | :---: | :---: | :---: |
| 18 | [ ] | [ ] | [ ] |

---

## Log Bug yang Ditemukan
*(Bagian ini mencatat setiap kendala atau bug visual/fungsional yang ditemukan selama pengujian penerimaan)*

| ID | Deskripsi Bug | Halaman Terkait | Dampak | Status Perbaikan |
| :---: | :--- | :---: | :---: | :---: |
| 1 | - | - | - | - |
