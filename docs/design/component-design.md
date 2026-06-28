# Component Design — Campus Service Request and Maintenance System

Versi: 1.0 | Tanggal: 2026-06-29 | Status: Draft — Menunggu Human Review

Prinsip yang diterapkan: **satu komponen = satu tanggung jawab.**
Komponen UI (presentational) tidak boleh memanggil API sendiri —
semua fetch hanya dari page component atau custom hook.

---

## 1. Struktur `src/` Lengkap dengan Penjelasan

```
src/
│
├── main.tsx                    ← Entry point: ReactDOM.render, tidak ada logic
├── App.tsx                     ← Root: setup Router + AuthContext Provider
│                                 Routing dengan ProtectedRoute untuk halaman yang
│                                 butuh login. Tidak ada bisnis logic.
├── index.css                   ← Global CSS: reset, variabel warna, font
│
├── context/
│   └── AuthContext.tsx         ← [CR-02] Global state: user yang sedang login
│                                 Menyimpan: user info, token, fungsi login/logout
│                                 Menggantikan RoleContext (role simulator lama)
│
├── types/
│   └── index.ts                ← Semua TypeScript interface dan type
│                                 Request, User, Comment, StatusHistory,
│                                 ApiResponse<T>, Role, Status, Category,
│                                 AuthUser, LoginPayload, RegisterPayload
│
├── services/
│   └── api.ts                  ← Satu-satunya tempat fetch() dipanggil
│                                 Semua fungsi: login, register, createRequest,
│                                 listRequests, updateStatus, addComment, dll.
│                                 Mengirim Authorization: Bearer <token> di semua
│                                 request yang butuh autentikasi.
│
├── hooks/
│   ├── useAuth.ts              ← [CR-02] Membaca user + token dari AuthContext
│   ├── useRequests.ts          ← Fetch + state untuk daftar laporan
│   └── useRequestDetail.ts     ← Fetch + state untuk satu laporan + history + komentar
│
├── pages/                      ← Satu file per halaman, fetch data di sini
│   ├── LoginPage.tsx           ← [CR-02] Form login email + password
│   │                              Redirect ke dashboard sesuai role setelah login:
│   │                              PELAPOR → /  | ADMIN → /admin
│   │                              TEKNISI → /teknisi | MANAJER → /manajer
│   ├── RegisterPage.tsx        ← [CR-02] Form daftar akun baru
│   │                              Role otomatis PELAPOR, redirect ke /login setelah sukses
│   ├── HomePage.tsx            ← Dashboard Pelapor: daftar laporan milik sendiri
│   ├── CreateRequestPage.tsx   ← Halaman form buat laporan (pelapor)
│   ├── RequestDetailPage.tsx   ← Halaman detail laporan (semua role)
│   ├── AdminDashboard.tsx      ← Halaman admin: antrean + aksi tinjau/assign
│   ├── TechnicianPage.tsx      ← Halaman teknisi: daftar tugas
│   └── ManagerDashboard.tsx    ← Halaman manajer: statistik
│
└── components/                 ← Komponen UI reusable, tidak fetch data sendiri
    ├── auth/
    │   └── ProtectedRoute.tsx  ← [CR-02] Wrapper route: cek login sebelum render
    │                              Jika belum login → redirect ke /login
    │                              Jika role tidak sesuai → redirect ke halaman utama
    ├── layout/
    │   ├── Header.tsx          ← Header global: nama user + role badge + tombol Logout
    │   │                         RoleSwitcher dihapus (CR-02)
    │   └── PageWrapper.tsx     ← Layout wrapper: padding, max-width
    ├── ui/
    │   ├── StatusBadge.tsx     ← Badge warna sesuai status laporan
    │   ├── RequestCard.tsx     ← Kartu satu laporan di daftar
    │   ├── FilterBar.tsx       ← Komponen filter status + kategori + search
    │   ├── EmptyState.tsx      ← Tampilan saat daftar kosong
    │   └── LoadingSpinner.tsx  ← Spinner loading
    ├── request/
    │   ├── RequestForm.tsx     ← Form buat laporan baru (FR-01)
    │   ├── RequestInfo.tsx     ← Info utama laporan (read-only)
    │   ├── StatusActions.tsx   ← Tombol aksi kondisional per role + status
    │   ├── AssignForm.tsx      ← Dropdown pilih teknisi + tombol assign (FR-04)
    │   └── ConfirmPanel.tsx    ← Panel setuju/tidak setuju pelapor (FR-07)
    ├── history/
    │   └── StatusHistory.tsx   ← Timeline riwayat perubahan status (FR-11)
    └── comment/
        ├── CommentSection.tsx  ← Wrapper: list + form komentar (FR-09)
        ├── CommentList.tsx     ← Hanya tampilkan list komentar
        └── CommentForm.tsx     ← Hanya form input komentar
```

---

## 2. Hierarki Komponen (Component Tree)

### 2.1 Tree Global

```
<App>
  <AuthContext.Provider>                ← [CR-02] Menggantikan RoleContext
    <Router>
      <Routes>
        {/* Public routes — tidak butuh login */}
        <Route path="/login"    → <LoginPage />
        <Route path="/register" → <RegisterPage />

        {/* Protected routes — redirect ke /login jika belum auth */}
        <Route element={<ProtectedRoute />}>
          <Header />                    ← Muncul hanya di dalam protected routes
          <Route path="/"             → <HomePage />           (PELAPOR)
          <Route path="/create"       → <CreateRequestPage />  (PELAPOR)
          <Route path="/requests/:id" → <RequestDetailPage />  (semua)
          <Route path="/admin"        → <AdminDashboard />     (ADMIN)
          <Route path="/teknisi"      → <TechnicianPage />     (TEKNISI)
          <Route path="/manajer"      → <ManagerDashboard />   (MANAJER)
        </Route>
      </Routes>
    </Router>
  </AuthContext.Provider>
</App>
```

### 2.2 Tree LoginPage

```
<LoginPage>                             ← tidak ada Header di sini
  ├── form (email + password)
  ├── tombol [Masuk]
  ├── link → /register
  └── setelah login sukses:
      switch(user.role):
        PELAPOR  → navigate('/')
        ADMIN    → navigate('/admin')
        TEKNISI  → navigate('/teknisi')
        MANAJER  → navigate('/manajer')
```

### 2.3 Tree RegisterPage

```
<RegisterPage>                          ← tidak ada Header di sini
  ├── form (name + email + password)
  ├── tombol [Daftar]
  ├── link → /login
  └── setelah register sukses → navigate('/login')
      toast: "Akun berhasil dibuat. Silakan login."
```

### 2.4 Tree ProtectedRoute

```
<ProtectedRoute allowedRoles={['ADMIN', 'TEKNISI', ...]}>  ← props opsional
  └── jika isLoading:
        <LoadingSpinner />      ← sedang verifikasi token ke GET /api/auth/me
      jika !user:
        <Navigate to="/login" replace />  ← belum login, redirect
      jika allowedRoles && !allowedRoles.includes(user.role):
        <Navigate to="/" replace />      ← role tidak sesuai, redirect ke home
      jika lolos semua:
        <Outlet />              ← render child route yang dibungkus
```

### 2.5 Tree HomePage (Pelapor)

```
<HomePage>
  ├── <FilterBar />
  ├── <RequestCard /> × N     ← daftar laporan milik sendiri
  └── <EmptyState />           ← jika belum ada laporan
```

### 2.3 Tree RequestDetailPage

```
<RequestDetailPage>             ← fetch data, kelola state loading/error
  ├── <RequestInfo />           ← tampilkan data utama (read-only)
  ├── <StatusActions />         ← render tombol yang tepat per role + status
  │   ├── <AssignForm />        ← (jika admin + status=Under Review)
  │   └── <ConfirmPanel />      ← (jika pelapor + status=Resolved)
  ├── <StatusHistory />         ← timeline riwayat
  └── <CommentSection />        ← wrapper komentar
      ├── <CommentList />
      └── <CommentForm />       ← (tersembunyi jika status=Closed)
```

---

## 3. Spesifikasi Komponen — Penting

*(Komponen dengan tag [CR-02] ditambahkan karena perubahan ke sistem autentikasi.)*

---

### 3.0a `src/context/AuthContext.tsx` [CR-02]

**Tanggung jawab**: Menyimpan state autentikasi secara global. Menggantikan `RoleContext` lama.

```typescript
interface AuthContextType {
  user: AuthUser | null;    // null = belum login
  token: string | null;     // Bearer token dari login
  isLoading: boolean;       // true saat verify token ke GET /api/auth/me
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

interface AuthUser {
  id: string;
  name: string;    // contoh: "Gwen Wenas"
  email: string;   // contoh: "gwen@unklab.ac.id"
  role: 'PELAPOR' | 'ADMIN' | 'TEKNISI' | 'MANAJER';
  is_active: 1 | 0;
}

// onMount: cek localStorage untuk token -> jika ada, panggil GET /api/auth/me
// login(): POST /api/auth/login -> simpan token ke localStorage + state
// logout(): POST /api/auth/logout -> hapus localStorage -> reset state ke null
```

---

### 3.0b `src/hooks/useAuth.ts` [CR-02]

**Tanggung jawab**: Custom hook untuk membaca AuthContext.

```typescript
function useAuth(): AuthContextType
// Melempar error jika dipakai di luar AuthContext.Provider
// Dipakai di: semua page, Header, ProtectedRoute
```

---

### 3.0c `src/pages/LoginPage.tsx` [CR-02]

**Tanggung jawab**: Form login email + password. Redirect setelah sukses sesuai role.
Public route, tidak ada Header di halaman ini.

```typescript
// State lokal:
// - email, password: string
// - errors: { email?, password? }    -- validasi format sebelum submit
// - apiError: string | null          -- pesan dari server
// - isSubmitting: boolean

// Redirect setelah login sukses:
// PELAPOR -> navigate('/')        ADMIN   -> navigate('/admin')
// TEKNISI -> navigate('/teknisi') MANAJER -> navigate('/manajer')

// Guard: jika sudah login -> redirect langsung ke halaman utama role
// API: POST /api/auth/login via AuthContext.login()
```

---

### 3.0d `src/pages/RegisterPage.tsx` [CR-02]

**Tanggung jawab**: Form daftar akun baru. Role otomatis PELAPOR.
Public route, tidak ada Header di halaman ini.

```typescript
// State lokal:
// - name, email, password, confirmPassword: string
// - errors: { name?, email?, password?, confirmPassword? }
// - apiError: string | null  -- contoh: "Email gwen@unklab.ac.id sudah terdaftar"
// - isSubmitting: boolean

// Validasi: name >= 2 karakter | email valid | password >= 8 karakter | confirmPassword match
// Setelah sukses: toast -> navigate('/login') setelah 2 detik
// API: POST /api/auth/register (via api.ts, bukan AuthContext)
```

---

### 3.0e `src/components/auth/ProtectedRoute.tsx` [CR-02]

**Tanggung jawab**: Guard semua route yang butuh login. Render Outlet jika lolos, redirect jika tidak.

```typescript
interface ProtectedRouteProps {
  allowedRoles?: Array<'PELAPOR' | 'ADMIN' | 'TEKNISI' | 'MANAJER'>;
}

// Urutan cek (penting, jangan dibalik):
// 1. isLoading -> <LoadingSpinner />        (tunggu auth selesai di-verify dulu)
// 2. !user     -> <Navigate to="/login" />  (belum login)
// 3. allowedRoles && role tidak sesuai -> <Navigate to="/" />
// 4. Lolos semua -> <Outlet />

// State lokal: tidak ada | API call: tidak ada
```

---

### 3.1 `src/context/RoleContext.tsx`

**Tanggung jawab**: Menyimpan state role aktif secara global agar semua komponen
bisa membaca role tanpa prop drilling.

```typescript
// Shape context
interface RoleContextType {
  role: 'pelapor' | 'administrator' | 'teknisi' | 'manajer_fasilitas';
  userId: number;
  userName: string;
  setRole: (role: Role, userId: number, userName: string) => void;
}

// Default value (role pertama saat app dibuka)
const defaultRole = { role: 'pelapor', userId: 1, userName: 'Ahmad Fauzi' };
```

**Catatan**: Tidak ada fetch di sini. Context hanya menyimpan state.

---

### 3.2 `src/services/api.ts`

**Tanggung jawab**: Satu-satunya tempat di mana `fetch()` dipanggil.
Semua fungsi menerima parameter dan mengembalikan data yang sudah di-parse.
Tidak ada JSX, tidak ada state, tidak ada side effect.

```typescript
// Setiap fungsi mengembalikan Promise<T> atau melempar error

export async function listRequests(params: {
  status?: string;
  category?: string;
  keyword?: string;
  role: string;
  userId: number;
}): Promise<ServiceRequest[]>

export async function createRequest(payload: {
  title: string;
  description: string;
  location: string;
  category: string;
}, userId: number): Promise<ServiceRequest>

export async function getRequestDetail(id: number, userId: number, role: string): Promise<RequestDetail>

export async function updateStatus(id: number, payload: {
  new_status: string;
  resolution_notes?: string;
  notes?: string;
}, userId: number, role: string): Promise<ServiceRequest>

export async function assignTechnician(id: number, payload: {
  assigned_to: number;
  notes?: string;
}, userId: number): Promise<ServiceRequest>

export async function confirmRequest(id: number, payload: {
  confirmed: boolean;
  rejection_notes?: string;
}, userId: number): Promise<{ reporter_confirmation: number }>

export async function addComment(id: number, content: string, userId: number, role: string): Promise<Comment>

export async function getDashboardSummary(userId: number, role: string): Promise<DashboardSummary>

export async function getTechnicians(): Promise<User[]>
```

---

### 3.3 `src/types/index.ts`

**Tanggung jawab**: Mendefinisikan semua TypeScript type yang dipakai di seluruh app.
Diimpor oleh komponen dan services — tidak ada logic.

```typescript
export type Role = 'pelapor' | 'administrator' | 'teknisi' | 'manajer_fasilitas';

export type Status =
  | 'Submitted'
  | 'Under Review'
  | 'Assigned'
  | 'In Progress'
  | 'Resolved'
  | 'Closed';

export type Category = 'Internet' | 'AC' | 'Peralatan Kelas' | 'Kebersihan' | 'Lainnya';

export type Priority = 'Low' | 'Medium' | 'High' | 'Critical';

export interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
}

export interface ServiceRequest {
  id: number;
  request_number: string;
  title: string;
  description: string;
  location: string;
  category: Category;
  status: Status;
  priority: Priority;
  reporter_id: number;
  reporter_name: string;
  assigned_to: number | null;
  assigned_to_name: string | null;
  resolution_notes: string | null;
  reporter_confirmation: 0 | 1 | null;
  rejection_notes: string | null;
  created_at: string;
  updated_at: string;
  resolved_at: string | null;
  closed_at: string | null;
}

export interface StatusHistoryEntry {
  id: number;
  from_status: Status | null;
  to_status: Status;
  changed_by_name: string;
  changed_by_role: Role;
  notes: string | null;
  changed_at: string;
}

export interface Comment {
  id: number;
  user_name: string;
  user_role: Role;
  content: string;
  created_at: string;
}

export interface RequestDetail extends ServiceRequest {
  status_history: StatusHistoryEntry[];
  comments: Comment[];
}

export interface DashboardSummary {
  by_status: Record<Status, number>;
  by_category: Record<Category, number>;
  totals: {
    all: number;
    active: number;
    resolved: number;
    closed: number;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta?: { total: number };
}
```

---

### 3.4 `src/hooks/useRequests.ts`

**Tanggung jawab**: Mengelola state daftar laporan + filter + fetch.
Dipakai oleh `HomePage`, `AdminDashboard`, `TechnicianPage`.

```typescript
// Props / parameter hook
interface UseRequestsParams {
  role: Role;
  userId: number;
  initialStatus?: Status;
}

// Return value
interface UseRequestsReturn {
  requests: ServiceRequest[];       // data laporan
  isLoading: boolean;               // sedang fetch?
  error: string | null;             // pesan error jika gagal
  filters: {                        // state filter aktif
    status: string;
    category: string;
    keyword: string;
  };
  setFilter: (key: string, value: string) => void;  // ubah filter
  refetch: () => void;              // trigger fetch ulang manual
}

// Kapan fetch terjadi:
// - onMount (pertama kali)
// - setiap kali filters berubah (useEffect dependency)
// - setiap kali refetch() dipanggil (setelah mutasi)
```

---

### 3.5 `src/hooks/useRequestDetail.ts`

**Tanggung jawab**: Mengelola state detail satu laporan + history + komentar.
Dipakai oleh `RequestDetailPage`.

```typescript
// Parameter
interface UseRequestDetailParams {
  id: number;         // dari URL params
  role: Role;
  userId: number;
}

// Return value
interface UseRequestDetailReturn {
  request: RequestDetail | null;
  isLoading: boolean;
  error: string | null;
  // Mutasi — setiap mutasi otomatis memanggil refetch setelah sukses
  updateStatus: (newStatus: Status, resolutionNotes?: string) => Promise<void>;
  assignTechnician: (techId: number) => Promise<void>;
  confirmResult: (confirmed: boolean, rejectionNotes?: string) => Promise<void>;
  addComment: (content: string) => Promise<void>;
  isSubmitting: boolean;    // true saat ada mutasi yang sedang berjalan
  mutationError: string | null;
}
```

---

### 3.6 `src/pages/HomePage.tsx`

**Tanggung jawab**: Render halaman utama yang berbeda berdasarkan role aktif.
Ini adalah "router" level komponen — tidak ada fetch di sini.

```typescript
// Props: tidak ada (ambil dari context)
// State: tidak ada (delegasi ke masing-masing child)

function HomePage() {
  const { role } = useRole();

  switch (role) {
    case 'pelapor':           return <ReporterView />;
    case 'administrator':     return <AdminDashboard />;
    case 'teknisi':           return <TechnicianPage />;
    case 'manajer_fasilitas': return <ManagerDashboard />;
    default:                  return <EmptyState message="Role tidak dikenal" />;
  }
}
```

---

### 3.7 `src/pages/RequestDetailPage.tsx`

**Tanggung jawab**: Fetch detail laporan, kelola state loading/error,
render semua sub-komponen dengan data yang sudah di-fetch.

```typescript
// Props: tidak ada (ambil :id dari useParams, role dari useRole)
// State: dikelola oleh useRequestDetail hook

// API yang dipanggil:
// - onMount: GET /api/requests/:id
// - saat addComment: POST /api/requests/:id/comments
// - saat updateStatus: PATCH /api/requests/:id/status
// - saat assignTechnician: PATCH /api/requests/:id/assign
// - saat confirmResult: PATCH /api/requests/:id/confirm

// Loading state: tampilkan skeleton / spinner
// Error state: tampilkan banner error dengan tombol "Coba Lagi"
```

---

### 3.8 `src/components/ui/StatusBadge.tsx`

**Tanggung jawab**: Menampilkan badge warna sesuai status laporan.
Pure presentational — tidak ada state, tidak ada logic bisnis.

```typescript
interface StatusBadgeProps {
  status: Status;
}

// Mapping status → warna:
// Submitted    → abu-abu
// Under Review → biru muda
// Assigned     → biru
// In Progress  → kuning/oranye
// Resolved     → hijau muda
// Closed       → hijau tua / abu gelap

// Tidak ada state lokal. Tidak ada fetch.
```

---

### 3.9 `src/components/ui/RequestCard.tsx`

**Tanggung jawab**: Menampilkan satu laporan dalam bentuk kartu di daftar.
Menerima data via props, memanggil callback saat diklik.

```typescript
interface RequestCardProps {
  request: ServiceRequest;
  onClick: (id: number) => void;    // navigasi ke detail
  // Tidak perlu tahu role — tampilan seragam, aksi ada di halaman detail
}

// State lokal: tidak ada
// API call: tidak ada
// Render: request_number, title, location, category, status badge, created_at
```

---

### 3.10 `src/components/ui/FilterBar.tsx`

**Tanggung jawab**: Menampilkan kontrol filter status, filter kategori, dan input search.
Mengangkat perubahan ke parent via callback.

```typescript
interface FilterBarProps {
  filters: { status: string; category: string; keyword: string };
  onFilterChange: (key: string, value: string) => void;
}

// State lokal: inputKeyword (debounce 300ms sebelum panggil onFilterChange)
// API call: tidak ada
// Debounce pada search untuk hindari terlalu banyak request saat user mengetik
```

---

### 3.11 `src/components/request/StatusActions.tsx`

**Tanggung jawab**: Menentukan dan merender tombol aksi yang tepat berdasarkan
kombinasi `role` dan `status` laporan. Ini adalah "decision component" — logic
if/else ada di sini, bukan di halaman.

```typescript
interface StatusActionsProps {
  request: ServiceRequest;
  role: Role;
  userId: number;
  technicians: User[];              // untuk dropdown assign
  onUpdateStatus: (newStatus: Status, resolutionNotes?: string) => Promise<void>;
  onAssign: (techId: number) => Promise<void>;
  onConfirm: (confirmed: boolean, rejectionNotes?: string) => Promise<void>;
  isSubmitting: boolean;
}

// State lokal:
// - resolutionNotes: string       (untuk form resolved)
// - selectedTechId: number | null (untuk dropdown assign)
// - rejectionNotes: string        (untuk panel konfirmasi negatif)
// - showRejectionForm: boolean    (toggle form tidak setuju)

// Logic render:
// role=admin  + status=Submitted    → tombol [Tinjau Laporan]
// role=admin  + status=Under Review → <AssignForm />
// role=admin  + status=Resolved     → tombol [Tutup Laporan]
// role=teknisi + status=Assigned + assigned_to=userId → tombol [Mulai Pengerjaan]
// role=teknisi + status=In Progress + assigned_to=userId → textarea + [Tandai Selesai]
// role=pelapor + status=Resolved + confirmation=null → <ConfirmPanel />
// status=Closed → null (tidak ada tombol)
```

---

### 3.12 `src/components/request/AssignForm.tsx`

**Tanggung jawab**: Form dropdown pilih teknisi + tombol assign.
Dipanggil oleh `StatusActions` ketika kondisi yang tepat terpenuhi.

```typescript
interface AssignFormProps {
  technicians: User[];
  onAssign: (techId: number) => Promise<void>;
  isSubmitting: boolean;
}

// State lokal:
// - selectedTechId: number | null
// - error: string | null   (jika submit tanpa memilih teknisi)

// API call: tidak ada (fetch technicians dilakukan di page level, dikirim via props)
```

---

### 3.13 `src/components/history/StatusHistory.tsx`

**Tanggung jawab**: Merender timeline riwayat perubahan status.
Pure presentational.

```typescript
interface StatusHistoryProps {
  history: StatusHistoryEntry[];
}

// State lokal: tidak ada
// API call: tidak ada
// Render: list timeline vertikal, dari paling lama ke paling baru
// Format tiap entry: ● [to_status] | [changed_by_name] ([changed_by_role]) | [changed_at]
```

---

### 3.14 `src/components/comment/CommentSection.tsx`

**Tanggung jawab**: Wrapper yang mengorkestrasi CommentList dan CommentForm.
Tahu apakah laporan sudah Closed (dari props) untuk menyembunyikan form.

```typescript
interface CommentSectionProps {
  comments: Comment[];
  requestStatus: Status;
  userRole: Role;
  onAddComment: (content: string) => Promise<void>;
  isSubmitting: boolean;
}

// State lokal: tidak ada (delegasi ke CommentForm)
// API call: tidak ada (onAddComment dari parent)
// Logic: tampilkan <CommentForm> hanya jika status !== 'Closed' && role !== 'manajer_fasilitas'
```

---

### 3.15 `src/components/comment/CommentForm.tsx`

**Tanggung jawab**: Form input komentar baru.

```typescript
interface CommentFormProps {
  onSubmit: (content: string) => Promise<void>;
  isSubmitting: boolean;
}

// State lokal:
// - content: string         (nilai textarea)
// - error: string | null   (jika submit kosong)

// Setelah submit berhasil: reset content ke string kosong
```

---

### 3.16 `src/pages/AdminDashboard.tsx`

**Tanggung jawab**: Halaman panel admin. Fetch semua laporan, tampilkan dengan aksi.

```typescript
// Props: tidak ada
// Hook: useRequests({ role: 'administrator', userId })
// API tambahan (onMount): GET /api/users?role=teknisi (untuk dropdown assign di detail)

// State lokal:
// - technicians: User[]  (daftar teknisi, di-fetch sekali saat mount)

// Render:
// <StatsSummaryBar />  ← chip klik-able sebagai shortcut filter
// <FilterBar />
// <RequestCard />      × N
// <EmptyState />       jika tidak ada laporan
```

---

### 3.17 `src/pages/ManagerDashboard.tsx`

**Tanggung jawab**: Halaman dashboard statistik manajer.

```typescript
// Props: tidak ada
// Hook: tidak pakai useRequests — langsung fetch summary
// API: GET /api/dashboard/summary (onMount)

// State lokal:
// - summary: DashboardSummary | null
// - isLoading: boolean
// - error: string | null

// Render:
// 4× <StatsCard />        ← total, aktif, resolved, closed
// <StatusBarChart />      ← distribusi per status (CSS bar sederhana)
// <CategoryBarChart />    ← distribusi per kategori
```

---

## 4. API Call Map per Halaman

Tabel ini mendokumentasikan semua API call yang terjadi di sistem, di mana, dan kapan.

| Halaman / Komponen | Trigger | Endpoint | Error Handling |
|---|---|---|---|
| `HomePage` (Pelapor) | onMount, filter berubah | `GET /api/requests` | Banner error + tombol retry |
| `CreateRequestPage` | klik [Kirim Laporan] | `POST /api/requests` | Pesan error di bawah tombol submit |
| `RequestDetailPage` | onMount | `GET /api/requests/:id` | Full-page error state + retry |
| `RequestDetailPage` | klik [Tinjau Laporan] | `PATCH /api/requests/:id/status` | Error toast / inline message |
| `RequestDetailPage` | klik [Tugaskan] | `PATCH /api/requests/:id/assign` | Error di dalam AssignForm |
| `RequestDetailPage` | klik [Mulai Pengerjaan] | `PATCH /api/requests/:id/status` | Error toast |
| `RequestDetailPage` | klik [Tandai Selesai] | `PATCH /api/requests/:id/status` | Error di textarea area |
| `RequestDetailPage` | klik [Setuju] / [Tidak Setuju] | `PATCH /api/requests/:id/confirm` | Error di ConfirmPanel |
| `RequestDetailPage` | klik [Tutup Laporan] | `PATCH /api/requests/:id/status` | Error toast |
| `RequestDetailPage` | klik [Kirim Komentar] | `POST /api/requests/:id/comments` | Error di CommentForm |
| `AdminDashboard` | onMount | `GET /api/requests` + `GET /api/users?role=teknisi` | Banner error |
| `TechnicianPage` | onMount, filter berubah | `GET /api/requests` | Banner error |
| `ManagerDashboard` | onMount | `GET /api/dashboard/summary` | Full-page error state |

---

## 5. Catatan Implementasi

### Urutan Coding yang Disarankan

Berdasarkan dependency antar komponen, urutan coding yang disarankan:

```
1. src/types/index.ts           ← tidak ada dependency
2. src/services/api.ts          ← butuh types
3. src/context/RoleContext.tsx  ← butuh types
4. src/components/ui/*          ← komponen presentational paling independen
5. src/hooks/useRequests.ts     ← butuh api.ts + types
6. src/hooks/useRequestDetail.ts ← butuh api.ts + types
7. src/pages/CreateRequestPage  ← butuh RequestForm + api.ts
8. src/pages/RequestDetailPage  ← butuh semua sub-komponen
9. src/pages/AdminDashboard     ← butuh hooks + RequestCard + FilterBar
10. src/pages/TechnicianPage    ← butuh hooks + RequestCard
11. src/pages/ManagerDashboard  ← butuh api.ts (dashboard endpoint)
12. src/pages/HomePage.tsx      ← butuh semua pages di atas
13. src/App.tsx                 ← butuh semua pages + context
```

### Pattern Error Handling yang Konsisten

Semua komponen mengikuti pattern yang sama untuk error:

```
isLoading = true  → tampilkan <LoadingSpinner />
error != null     → tampilkan banner error dengan pesan + tombol "Coba Lagi"
data kosong       → tampilkan <EmptyState />
data ada          → tampilkan konten normal
```

### Aturan Mutasi

Setiap kali ada mutasi berhasil (POST, PATCH):
1. Set `isSubmitting = true` sebelum fetch
2. Jalankan fetch
3. Jika sukses: panggil `refetch()` untuk ambil data terbaru dari server
4. Jika gagal: set `mutationError` dengan pesan dari API
5. Set `isSubmitting = false` setelah selesai (sukses atau gagal)

Ini memastikan UI selalu menampilkan data yang konsisten dengan database.
