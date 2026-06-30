# Skill 10: Coding and Implementation Standards

Dokumen ini merinci standar penulisan kode (coding standards) untuk memastikan konsistensi, keterbacaan, dan skalabilitas pada frontend (React, TypeScript, Vite) dan backend (Cloudflare Workers, Hono, D1).

## 1. Panduan TypeScript & ES6+
- Wajib menggunakan TypeScript strict mode untuk semua file `.ts` dan `.tsx`.
- Hindari penggunaan tipe data `any` secara implisit maupun eksplisit. Gunakan tipe data spesifik atau `unknown` jika diperlukan.
- Deklarasikan interface/type secara teratur di direktori `types/` untuk digunakan secara global.

## 2. Struktur Komponen React
- Gunakan Functional Components dengan deklarasi tipe `React.FC`.
- Pahami siklus hidup komponen dan gunakan hooks (`useEffect`, `useState`, `useMemo`) secara bijak.
- Selalu pisahkan styling statis global ke `design-system.css` dan gunakan styling inline seminimal mungkin hanya untuk nilai dinamis.
