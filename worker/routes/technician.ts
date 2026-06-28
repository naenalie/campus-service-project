// worker/routes/technician.ts
// Routes khusus teknisi
// Endpoint yang ditangani:
//   GET /api/requests (dengan filter assigned_to = user yang login)
// Catatan: endpoint yang sama dengan requests.ts, tapi filter otomatis di middleware
// atau bisa juga route ini tidak perlu dibuat terpisah jika filter sudah di requests.ts
// TODO: evaluasi apakah perlu route terpisah atau cukup filter di GET /api/requests
