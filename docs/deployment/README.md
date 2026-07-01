# Deployment Evidence

## Target

- Repository: `https://github.com/naenalie/campus-service-project`
- Production URL: `https://campus-service-project.officiallygwen.workers.dev`
- Runtime: Cloudflare Workers
- Database: Cloudflare D1 (`campus-maintenance-db`)

## Build and Test Verification

Latest local verification:

```bash
npm run test:run
```

Result: 3 test files passed, 27 tests passed.

```bash
npm run build
```

Result: TypeScript build and Vite production build completed successfully.

## Production Smoke Test

| Check | Result |
| --- | --- |
| `GET /api/health` | 200 OK |
| `GET /api/requests` without token | 401 Unauthorized |
| `POST /api/auth/login` with Pelapor account | Success |
| `POST /api/auth/login` with Admin account | Success |
| `GET /api/requests` with Admin token | Success, returns production tickets |
| `GET /api/dashboard/summary` with Manajer token | Success, returns dashboard aggregate |

## Deployment Steps

1. Install dependencies with `npm ci`.
2. Run `npm run test:run`.
3. Run `npm run build`.
4. Apply D1 migration if schema changed:

```bash
npx wrangler d1 execute campus-maintenance-db --remote --file=database/migrations/0001_initial.sql
```

5. Deploy:

```bash
npm run deploy
```

6. Re-test `GET /api/health` and login with seeded test accounts.

## Release Note

This release fixes role-based ticket mutation routing, adds Pelapor confirmation for resolved tickets, supports server-side keyword search, and adds integration tests for confirmation/search behavior.

## Known Limitations

- GitHub Pull Request history still needs to be expanded to meet the assignment minimum of 6 PRs.
- The `/dev-switcher` page is useful for demo review, but should be removed or protected before a strict production handoff.
