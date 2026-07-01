# Deployment Evidence

Target:
- Repository: https://github.com/naenalie/campus-service-project
- Production URL: https://campus-service-project.officiallygwen.workers.dev
- Runtime: Cloudflare Workers
- Database: Cloudflare D1

Build Verification:
- npm run test:run: 27 tests passed
- npm run build: success

Smoke Test:
- GET /api/health: 200 OK
- GET /api/requests (no token): 401 Unauthorized
- Login Pelapor/Admin/Manajer: Success

See release-note.md for v1.0.0 details.
