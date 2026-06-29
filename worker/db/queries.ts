// worker/db/queries.ts
// Implementasi lengkap query database SQLite/D1 untuk seluruh alur bisnis

import { User, ServiceRequest, StatusHistory, Comment } from '../types';

// ==========================================
// USER QUERIES
// ==========================================

export async function getUserByEmail(db: D1Database, email: string): Promise<User | null> {
  return await db
    .prepare('SELECT * FROM users WHERE email = ? LIMIT 1')
    .bind(email)
    .first<User>();
}

export async function getUserById(db: D1Database, id: string): Promise<User | null> {
  return await db
    .prepare('SELECT * FROM users WHERE id = ? LIMIT 1')
    .bind(id)
    .first<User>();
}

export async function createUser(
  db: D1Database, 
  data: { name: string; email: string; password_hash: string; role?: 'PELAPOR' | 'ADMIN' | 'TEKNISI' | 'MANAJER' }
): Promise<User> {
  const id = crypto.randomUUID();
  const role = data.role || 'PELAPOR';
  
  await db
    .prepare('INSERT INTO users (id, name, email, password_hash, role) VALUES (?, ?, ?, ?, ?)')
    .bind(id, data.name, data.email, data.password_hash, role)
    .run();

  const user = await getUserById(db, id);
  if (!user) throw new Error('Gagal memverifikasi pembuatan user baru');
  return user;
}

export async function updateUserRole(
  db: D1Database, 
  userId: string, 
  role: 'PELAPOR' | 'ADMIN' | 'TEKNISI' | 'MANAJER'
): Promise<User> {
  await db
    .prepare('UPDATE users SET role = ? WHERE id = ?')
    .bind(role, userId)
    .run();

  const user = await getUserById(db, userId);
  if (!user) throw new Error('User tidak ditemukan setelah pembaruan role');
  return user;
}

export async function getAllUsers(db: D1Database): Promise<User[]> {
  const { results } = await db
    .prepare('SELECT id, name, email, role, is_active, created_at FROM users ORDER BY created_at DESC')
    .all<User>();
  return results || [];
}

// ==========================================
// SESSION QUERIES
// ==========================================

export async function createSession(db: D1Database, userId: string, token: string): Promise<void> {
  const id = crypto.randomUUID();
  // Sesi token valid selama 7 hari ke depan
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

  await db
    .prepare('INSERT INTO sessions (id, user_id, token, expires_at) VALUES (?, ?, ?, ?)')
    .bind(id, userId, token, expiresAt)
    .run();
}

export async function getSessionByToken(db: D1Database, token: string): Promise<{ user: User } | null> {
  const now = new Date().toISOString();
  const query = `
    SELECT u.id, u.name, u.email, u.role, u.is_active, u.created_at
    FROM sessions s
    JOIN users u ON s.user_id = u.id
    WHERE s.token = ? AND s.expires_at > ? AND u.is_active = 1
    LIMIT 1
  `;
  
  const user = await db.prepare(query).bind(token, now).first<User>();
  return user ? { user } : null;
}

export async function deleteSession(db: D1Database, token: string): Promise<void> {
  await db
    .prepare('DELETE FROM sessions WHERE token = ?')
    .bind(token)
    .run();
}

// ==========================================
// SERVICE REQUEST QUERIES
// ==========================================

export async function getAllRequests(
  db: D1Database, 
  filters?: { status?: string; category?: string; priority?: string; assigned_to?: string; reporter_id?: string }
): Promise<ServiceRequest[]> {
  let query = 'SELECT * FROM service_requests WHERE 1=1';
  const params: string[] = [];

  if (filters) {
    if (filters.status) {
      query += ' AND status = ?';
      params.push(filters.status.toUpperCase());
    }
    if (filters.category) {
      query += ' AND category = ?';
      params.push(filters.category);
    }
    if (filters.priority) {
      query += ' AND priority = ?';
      params.push(filters.priority.toUpperCase());
    }
    if (filters.assigned_to) {
      query += ' AND assigned_to = ?';
      params.push(filters.assigned_to);
    }
    if (filters.reporter_id) {
      query += ' AND reporter_id = ?';
      params.push(filters.reporter_id);
    }
  }

  query += ' ORDER BY created_at DESC';

  const { results } = await db.prepare(query).bind(...params).all<ServiceRequest>();
  return results || [];
}

export async function getRequestById(db: D1Database, id: string): Promise<ServiceRequest | null> {
  return await db
    .prepare('SELECT * FROM service_requests WHERE id = ? LIMIT 1')
    .bind(id)
    .first<ServiceRequest>();
}

export async function createRequest(
  db: D1Database, 
  data: { title: string; description: string; location: string; category: string }, 
  reporterId: string
): Promise<ServiceRequest> {
  const id = crypto.randomUUID();
  const requestNumber = `CSR-${Date.now()}`;

  // Insert Laporan
  await db
    .prepare(`
      INSERT INTO service_requests (id, request_number, title, description, location, category, priority, status, reporter_id)
      VALUES (?, ?, ?, ?, ?, ?, 'MEDIUM', 'SUBMITTED', ?)
    `)
    .bind(id, requestNumber, data.title, data.description, data.location, data.category, reporterId)
    .run();

  // Log Transisi Awal status history
  const historyId = crypto.randomUUID();
  await db
    .prepare(`
      INSERT INTO status_history (id, request_id, old_status, new_status, changed_by, note)
      VALUES (?, ?, NULL, 'SUBMITTED', ?, 'Laporan berhasil dibuat')
    `)
    .bind(historyId, id, reporterId)
    .run();

  const req = await getRequestById(db, id);
  if (!req) throw new Error('Gagal memverifikasi pembuatan laporan baru');
  return req;
}

export async function updateRequestStatus(
  db: D1Database, 
  id: string, 
  newStatus: 'SUBMITTED' | 'UNDER_REVIEW' | 'ASSIGNED' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED', 
  changedBy: string, 
  note?: string | null
): Promise<ServiceRequest> {
  const current = await getRequestById(db, id);
  if (!current) throw new Error('Laporan tidak ditemukan');

  const oldStatus = current.status;

  // Update Status Laporan
  await db
    .prepare('UPDATE service_requests SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
    .bind(newStatus, id)
    .run();

  // Log Riwayat Transaksi
  const historyId = crypto.randomUUID();
  await db
    .prepare(`
      INSERT INTO status_history (id, request_id, old_status, new_status, changed_by, note)
      VALUES (?, ?, ?, ?, ?, ?)
    `)
    .bind(historyId, id, oldStatus, newStatus, changedBy, note || null)
    .run();

  const req = await getRequestById(db, id);
  if (!req) throw new Error('Gagal memverifikasi status laporan setelah diperbarui');
  return req;
}

export async function assignRequest(
  db: D1Database, 
  id: string, 
  technicianId: string, 
  adminId: string
): Promise<ServiceRequest> {
  const current = await getRequestById(db, id);
  if (!current) throw new Error('Laporan tidak ditemukan');

  // Update Alokasi dan ubah status ke ASSIGNED
  await db
    .prepare(`
      UPDATE service_requests 
      SET assigned_to = ?, status = 'ASSIGNED', updated_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `)
    .bind(technicianId, id)
    .run();

  // Log Riwayat status_history
  const historyId = crypto.randomUUID();
  await db
    .prepare(`
      INSERT INTO status_history (id, request_id, old_status, new_status, changed_by, note)
      VALUES (?, ?, ?, 'ASSIGNED', ?, 'Administrator mengalokasikan teknisi')
    `)
    .bind(historyId, id, current.status, adminId)
    .run();

  const req = await getRequestById(db, id);
  if (!req) throw new Error('Gagal memverifikasi status laporan setelah alokasi');
  return req;
}

export async function getRequestHistory(db: D1Database, requestId: string): Promise<StatusHistory[]> {
  const { results } = await db
    .prepare('SELECT * FROM status_history WHERE request_id = ? ORDER BY changed_at ASC')
    .bind(requestId)
    .all<StatusHistory>();
  return results || [];
}

// ==========================================
// COMMENT QUERIES
// ==========================================

export async function getCommentsByRequest(db: D1Database, requestId: string): Promise<Comment[]> {
  const { results } = await db
    .prepare('SELECT * FROM comments WHERE request_id = ? ORDER BY created_at ASC')
    .bind(requestId)
    .all<Comment>();
  return results || [];
}

export async function createComment(
  db: D1Database, 
  requestId: string, 
  userId: string, 
  content: string
): Promise<Comment> {
  const id = crypto.randomUUID();

  await db
    .prepare('INSERT INTO comments (id, request_id, user_id, content) VALUES (?, ?, ?, ?)')
    .bind(id, requestId, userId, content)
    .run();

  const comment = await db
    .prepare('SELECT * FROM comments WHERE id = ? LIMIT 1')
    .bind(id)
    .first<Comment>();

  if (!comment) throw new Error('Gagal memverifikasi pembuatan komentar baru');
  return comment;
}

// ==========================================
// DASHBOARD QUERIES
// ==========================================

export async function getDashboardSummary(db: D1Database): Promise<{
  total: number;
  by_status: Record<string, number>;
  by_category: Record<string, number>;
  recent_requests: ServiceRequest[];
}> {
  // Hitung total tiket
  const totalRow = await db.prepare('SELECT COUNT(*) as count FROM service_requests').first<{ count: number }>();
  const total = totalRow ? totalRow.count : 0;

  // Status breakdown
  const statusRows = await db
    .prepare('SELECT status, COUNT(*) as count FROM service_requests GROUP BY status')
    .all<{ status: string; count: number }>();
  
  const by_status: Record<string, number> = {
    SUBMITTED: 0,
    UNDER_REVIEW: 0,
    ASSIGNED: 0,
    IN_PROGRESS: 0,
    RESOLVED: 0,
    CLOSED: 0
  };
  for (const r of statusRows.results || []) {
    by_status[r.status.toUpperCase()] = r.count;
  }

  // Category breakdown
  const categoryRows = await db
    .prepare('SELECT category, COUNT(*) as count FROM service_requests GROUP BY category')
    .all<{ category: string; count: number }>();
  
  const by_category: Record<string, number> = {
    'Internet': 0,
    'AC': 0,
    'Peralatan Kelas': 0,
    'Kebersihan': 0,
    'Lainnya': 0
  };
  for (const r of categoryRows.results || []) {
    by_category[r.category] = r.count;
  }

  // 5 laporan terbaru
  const recentRows = await db
    .prepare('SELECT * FROM service_requests ORDER BY created_at DESC LIMIT 5')
    .all<ServiceRequest>();

  return {
    total,
    by_status,
    by_category,
    recent_requests: recentRows.results || []
  };
}
