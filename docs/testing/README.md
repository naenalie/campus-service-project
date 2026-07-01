# Testing Documentation

This folder contains the test plan, acceptance-test notes, and verification evidence for the Campus Service Request system.

## Automated Tests

Command:

```bash
npm run test:run
```

Latest result:

- 3 test files passed.
- 27 tests passed.
- Coverage areas: request validation, helper behavior, keyword search query generation, and Pelapor confirmation route.

## Build Verification

Command:

```bash
npm run build
```

Latest result: build completed successfully for both Worker and client bundles.

## Manual / Acceptance Testing

Manual acceptance scenarios are recorded in `acceptance-test-results.md`. Production smoke checks were run against:

- `https://campus-service-project.officiallygwen.workers.dev/api/health`
- `POST /api/auth/login`
- `GET /api/requests`
- `GET /api/dashboard/summary`
