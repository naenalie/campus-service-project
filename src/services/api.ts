// src/services/api.ts
// Service client API (CR-02) untuk request HTTP fetch ke Cloudflare Workers backend

import type { User } from '../context/AuthContext';

const BASE_URL = '/api';

function getHeaders(token?: string | null): HeadersInit {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  const activeToken = token || localStorage.getItem('auth_token');
  if (activeToken) {
    headers['Authorization'] = `Bearer ${activeToken}`;
  }
  return headers;
}

async function handleResponse<T>(response: Response): Promise<T> {
  const json = await response.json() as any;
  if (!response.ok || !json.success) {
    throw new Error(json.error || `Request failed with status ${response.status}`);
  }
  return json.data as T;
}

// -------------------------------------------------------------
// AUTHENTICATION API
// -------------------------------------------------------------

export async function login(email: string, password: string): Promise<{ token: string; user: User }> {
  const response = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ email, password })
  });
  return handleResponse<{ token: string; user: User }>(response);
}

export async function register(name: string, email: string, password: string): Promise<void> {
  const response = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ name, email, password })
  });
  await handleResponse<any>(response);
}

export async function getMe(token: string): Promise<User> {
  const response = await fetch(`${BASE_URL}/auth/me`, {
    method: 'GET',
    headers: getHeaders(token)
  });
  return handleResponse<User>(response);
}

export async function logout(token: string): Promise<void> {
  const response = await fetch(`${BASE_URL}/auth/logout`, {
    method: 'POST',
    headers: getHeaders(token)
  });
  await handleResponse<any>(response);
}

// -------------------------------------------------------------
// SERVICE REQUESTS API (Stub - Implementasi Lengkap di Day 5)
// -------------------------------------------------------------

export async function listRequests(filters?: any): Promise<any[]> {
  const query = filters ? '?' + new URLSearchParams(filters).toString() : '';
  const response = await fetch(`${BASE_URL}/requests${query}`, {
    method: 'GET',
    headers: getHeaders()
  });
  return handleResponse<any[]>(response);
}

export async function getRequestDetail(id: string): Promise<any> {
  const response = await fetch(`${BASE_URL}/requests/${id}`, {
    method: 'GET',
    headers: getHeaders()
  });
  return handleResponse<any>(response);
}

export async function createRequest(payload: any): Promise<any> {
  const response = await fetch(`${BASE_URL}/requests`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(payload)
  });
  return handleResponse<any>(response);
}

export async function updateStatus(id: string, newStatus: string, notes?: string): Promise<any> {
  const response = await fetch(`${BASE_URL}/requests/${id}/status`, {
    method: 'PATCH',
    headers: getHeaders(),
    body: JSON.stringify({ new_status: newStatus, notes })
  });
  return handleResponse<any>(response);
}

export async function assignTechnician(id: string, techId: string): Promise<any> {
  const response = await fetch(`${BASE_URL}/requests/${id}/assign`, {
    method: 'PATCH',
    headers: getHeaders(),
    body: JSON.stringify({ assigned_to: techId })
  });
  return handleResponse<any>(response);
}

export async function confirmRequest(id: string, confirmed: boolean, rejectionNotes?: string): Promise<any> {
  const response = await fetch(`${BASE_URL}/requests/${id}/confirm`, {
    method: 'PATCH',
    headers: getHeaders(),
    body: JSON.stringify({ confirmed, rejection_notes: rejectionNotes })
  });
  return handleResponse<any>(response);
}

export async function addComment(id: string, content: string): Promise<any> {
  const response = await fetch(`${BASE_URL}/requests/${id}/comments`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ content })
  });
  return handleResponse<any>(response);
}

export async function getDashboardSummary(): Promise<any> {
  const response = await fetch(`${BASE_URL}/dashboard/summary`, {
    method: 'GET',
    headers: getHeaders()
  });
  return handleResponse<any>(response);
}

export async function getTechnicians(): Promise<any[]> {
  const response = await fetch(`${BASE_URL}/users?role=TEKNISI`, {
    method: 'GET',
    headers: getHeaders()
  });
  return handleResponse<any[]>(response);
}
