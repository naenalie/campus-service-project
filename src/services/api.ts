// src/services/api.ts
// Service client API (CR-02)
//
// Tanggung jawab: SATU — membungkus query HTTP fetch ke Cloudflare Workers backend.
// Semua request otomatis menyisipkan header Authorization: Bearer <token>
// jika token sesi login tersedia di localStorage/state.
//
// Daftar API client:
//   - login(email, password)
//   - register(name, email, password)
//   - getMe()
//   - listRequests(filters)
//   - getRequestDetail(id)
//   - createRequest(payload)
//   - updateStatus(id, newStatus, resolutionNotes)
//   - assignTechnician(id, techId)
//   - confirmRequest(id, confirmed, rejectionNotes)
//   - addComment(id, content)
//   - getDashboardSummary()
//   - getTechnicians()
//   - updateUserRole(id, role)
//   - updateUserStatus(id, isActive)

export {};
