// src/context/AuthContext.tsx
// Provider Context untuk menyimpan data sesi login global (CR-02)
//
// Tanggung jawab: SATU — menyediakan state authUser, token, loading state,
// serta modul fungsi login & logout ke seluruh component tree.
// Menggantikan RoleContext lama yang berbasis dropdown simulator.
//
// State global:
//   user: AuthUser | null
//   token: string | null
//   isLoading: boolean
//
// Lifecycle:
//   onMount: cek localStorage untuk token lama -> GET /api/auth/me untuk refresh/restore session

export {};
