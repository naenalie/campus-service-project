-- database/migrations/0001_initial.sql

DROP TABLE IF EXISTS sessions;
DROP TABLE IF EXISTS comments;
DROP TABLE IF EXISTS status_history;
DROP TABLE IF EXISTS service_requests;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'PELAPOR' 
    CHECK(role IN ('PELAPOR', 'ADMIN', 'TEKNISI', 'MANAJER')),
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_by TEXT REFERENCES users(id)
);

CREATE TABLE service_requests (
  id TEXT PRIMARY KEY,
  request_number TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  location TEXT NOT NULL,
  category TEXT NOT NULL 
    CHECK(category IN ('Internet', 'AC', 'Peralatan Kelas', 
                       'Kebersihan', 'Lainnya')),
  priority TEXT NOT NULL DEFAULT 'MEDIUM'
    CHECK(priority IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
  status TEXT NOT NULL DEFAULT 'SUBMITTED'
    CHECK(status IN ('SUBMITTED', 'UNDER_REVIEW', 'ASSIGNED', 
                     'IN_PROGRESS', 'RESOLVED', 'CLOSED')),
  reporter_id TEXT NOT NULL REFERENCES users(id),
  assigned_to TEXT REFERENCES users(id),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE status_history (
  id TEXT PRIMARY KEY,
  request_id TEXT NOT NULL REFERENCES service_requests(id),
  old_status TEXT,
  new_status TEXT NOT NULL,
  changed_by TEXT NOT NULL REFERENCES users(id),
  note TEXT,
  changed_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE comments (
  id TEXT PRIMARY KEY,
  request_id TEXT NOT NULL REFERENCES service_requests(id),
  user_id TEXT NOT NULL REFERENCES users(id),
  content TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  token TEXT NOT NULL UNIQUE,
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_requests_status ON service_requests(status);
CREATE INDEX idx_requests_reporter ON service_requests(reporter_id);
CREATE INDEX idx_requests_assigned ON service_requests(assigned_to);
CREATE INDEX idx_history_request ON status_history(request_id);
CREATE INDEX idx_comments_request ON comments(request_id);
CREATE INDEX idx_sessions_token ON sessions(token);
CREATE INDEX idx_users_email ON users(email);
