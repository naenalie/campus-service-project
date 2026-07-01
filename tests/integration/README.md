# Integration Tests

Integration tests exercise API-level behavior that crosses module boundaries without requiring the production D1 database.

Current file:

- `requests-confirm-search.test.ts`

Covered behavior:

- Keyword search adds SQL `LIKE` filters for request number, title, description, and location.
- Keyword search can be combined with status filtering.
- Pelapor can confirm a `RESOLVED` request and close it.
- Pelapor can reject a `RESOLVED` request and reopen it to `UNDER_REVIEW`.
- A Pelapor cannot confirm another user's request.
- Rejection requires a useful note.

Run with:

```bash
npm run test:run
```
