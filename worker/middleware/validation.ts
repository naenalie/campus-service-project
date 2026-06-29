// worker/middleware/validation.ts
// Implementasi lengkap validasi input untuk Cloudflare Workers API

const VALID_CATEGORIES = ['Internet', 'AC', 'Peralatan Kelas', 'Kebersihan', 'Lainnya'];
const VALID_STATUSES = ['SUBMITTED', 'UNDER_REVIEW', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];

const VALID_TRANSITIONS: Record<string, string[]> = {
  'SUBMITTED': ['UNDER_REVIEW'],
  'UNDER_REVIEW': ['ASSIGNED'],
  'ASSIGNED': ['IN_PROGRESS'],
  'IN_PROGRESS': ['RESOLVED'],
  'RESOLVED': ['CLOSED']
};

/**
 * Validasi Registrasi Pengguna
 */
export function validateRegister(input: unknown): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!input || typeof input !== 'object') {
    return { valid: false, errors: ['Request body harus berupa JSON object'] };
  }

  const data = input as Record<string, unknown>;
  const name = typeof data.name === 'string' ? data.name.trim() : '';
  const email = typeof data.email === 'string' ? data.email.trim() : '';
  const password = typeof data.password === 'string' ? data.password : '';

  if (!name) {
    errors.push('Nama tidak boleh kosong');
  } else if (name.length < 2) {
    errors.push('Nama minimal 2 karakter');
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email) {
    errors.push('Email tidak boleh kosong');
  } else if (!emailRegex.test(email)) {
    errors.push('Format email tidak valid');
  }

  if (!password) {
    errors.push('Password tidak boleh kosong');
  } else if (password.length < 8) {
    errors.push('Password minimal 8 karakter');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Validasi Pembuatan Laporan Keluhan Baru
 */
export function validateCreateRequest(input: unknown): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!input || typeof input !== 'object') {
    return { valid: false, errors: ['Request body harus berupa JSON object'] };
  }

  const data = input as Record<string, unknown>;
  const title = typeof data.title === 'string' ? data.title.trim() : '';
  const description = typeof data.description === 'string' ? data.description.trim() : '';
  const location = typeof data.location === 'string' ? data.location.trim() : '';
  const category = typeof data.category === 'string' ? data.category.trim() : '';

  if (!title) {
    errors.push('Judul laporan tidak boleh kosong');
  } else if (title.length < 5) {
    errors.push('Judul laporan minimal 5 karakter');
  }

  if (!description) {
    errors.push('Deskripsi laporan tidak boleh kosong');
  } else if (description.length < 20) {
    errors.push('Deskripsi laporan minimal 20 karakter');
  }

  if (!location) {
    errors.push('Lokasi tidak boleh kosong');
  }

  if (!category) {
    errors.push('Kategori tidak boleh kosong');
  } else if (!VALID_CATEGORIES.includes(category)) {
    errors.push(`Kategori tidak valid. Pilihan: ${VALID_CATEGORIES.join(', ')}`);
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Validasi Pembaruan Status (Transisi Linier BR-01)
 */
export function validateUpdateStatus(input: unknown): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!input || typeof input !== 'object') {
    return { valid: false, errors: ['Request body harus berupa JSON object'] };
  }

  const data = input as Record<string, unknown>;
  const currentStatusRaw = data.current_status !== undefined ? data.current_status : data.currentStatus;
  const newStatusRaw = data.new_status !== undefined ? data.new_status : data.newStatus;

  const currentStatus = typeof currentStatusRaw === 'string' ? currentStatusRaw.trim().toUpperCase() : '';
  const newStatus = typeof newStatusRaw === 'string' ? newStatusRaw.trim().toUpperCase() : '';

  if (!newStatus) {
    errors.push('Status baru wajib ditentukan');
  } else if (!VALID_STATUSES.includes(newStatus)) {
    errors.push(`Status baru tidak valid. Pilihan: ${VALID_STATUSES.join(', ')}`);
  }

  // Jika ada status saat ini, verifikasi transisi linier (BR-01)
  if (currentStatus && newStatus) {
    if (!VALID_STATUSES.includes(currentStatus)) {
      errors.push('Status saat ini di database tidak valid');
    } else {
      const allowed = VALID_TRANSITIONS[currentStatus] || [];
      if (!allowed.includes(newStatus)) {
        errors.push(`Transisi status tidak valid. Laporan berstatus '${currentStatus}' tidak bisa dipindahkan langsung ke '${newStatus}'`);
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Validasi Penulisan Komentar Baru
 */
export function validateComment(input: unknown): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!input || typeof input !== 'object') {
    return { valid: false, errors: ['Request body harus berupa JSON object'] };
  }

  const data = input as Record<string, unknown>;
  const content = typeof data.content === 'string' ? data.content.trim() : '';

  if (!content) {
    errors.push('Komentar tidak boleh kosong');
  } else if (content.length < 3) {
    errors.push('Komentar minimal 3 karakter');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}
