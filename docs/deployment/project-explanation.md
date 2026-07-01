# Penjelasan Proyek — Campus Service Request System

Dokumen ini menjelaskan struktur arsitektur sistem dan detail implementasi penting.

---

## Deskripsi Singkat
Sistem ini memfasilitasi pelaporan keluhan sarana prasarana Kampus Universitas Klabat (UNKLAB). Sistem di-deploy sebagai full-stack serverless application pada Cloudflare menggunakan React (Vite) untuk frontend dan Cloudflare Workers untuk backend API, dengan data persisten disimpan di Cloudflare D1.

## Aktor & Fitur Utama
1. **Pelapor**: Mengajukan keluhan, melihat status perkembangan, memberikan konfirmasi penutupan atau menolak hasil penanganan.
2. **Admin**: Memeriksa, menetapkan prioritas, menunjuk teknisi penanggung jawab, dan menutup tiket.
3. **Teknisi**: Menerima tugas perbaikan dan menandai status penyelesaian perbaikan.
4. **Manajer**: Melihat dashboard analytics performa sarana prasarana kampus.
