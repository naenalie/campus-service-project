// worker/types/index.ts
// TypeScript types yang digunakan di seluruh backend Worker

export interface Env {
  DB: D1Database;
}

export interface User {
  id: string;
  name: string;
  email: string;
  password_hash?: string;
  role: 'PELAPOR' | 'ADMIN' | 'TEKNISI' | 'MANAJER';
  is_active: number;
  created_at: string;
}

export interface ServiceRequest {
  id: string;
  request_number: string;
  title: string;
  description: string;
  location: string;
  category: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'SUBMITTED' | 'UNDER_REVIEW' | 'ASSIGNED' | 
          'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  reporter_id: string;
  assigned_to: string | null;
  created_at: string;
  updated_at: string;
}

export interface StatusHistory {
  id: string;
  request_id: string;
  old_status: string | null;
  new_status: string;
  changed_by: string;
  note: string | null;
  changed_at: string;
}

export interface Comment {
  id: string;
  request_id: string;
  user_id: string;
  content: string;
  created_at: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface AuthenticatedRequest extends Request {
  user?: User;
}
