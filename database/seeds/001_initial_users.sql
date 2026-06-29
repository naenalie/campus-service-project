-- database/seeds/001_initial_users.sql
-- File seed awal untuk data pengguna (testing)
--
-- [PENTING]
-- Password untuk semua user test di bawah secara konsep diset: "password123"
-- Nilai '$2a$10$YourHashHere' adalah placeholder hash bcrypt.
-- Sebelum script ini dijalankan di environment nyata atau lokal,
-- hash password harus di-generate ulang dengan bcrypt yang valid.
--

INSERT INTO users (id, name, email, password_hash, role) VALUES
(
  'user-admin-001',
  'Admin', 
  'admin@unklab.ac.id',
  '$2a$10$YourHashHere',
  'ADMIN'
),
(
  'user-teknisi-001',
  'Teknisi',
  'teknisi@unklab.ac.id', 
  '$2a$10$YourHashHere',
  'TEKNISI'
),
(
  'user-manajer-001',
  'Manager',
  'manager@unklab.ac.id',
  '$2a$10$YourHashHere', 
  'MANAJER'
),
(
  'user-pelapor-001',
  'Gwen',
  'gwen@unklab.ac.id',
  '$2a$10$YourHashHere',
  'PELAPOR'
);
