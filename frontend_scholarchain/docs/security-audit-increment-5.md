# Security Audit — Increment 5: API Key Isolation

**Date:** 2026-05-24  
**Auditor:** Shervin Dale Tabernero  
**Build:** `npx next build --webpack` (production bundle)

---

## Objective

Confirm that `BLOCKFROST_PROJECT_ID` (the Blockfrost API key) is completely absent from the client-side JavaScript bundle served to browsers. Exposing this key would allow any visitor to exhaust the free-tier quota (50,000 req/day) or impersonate the application on the Blockfrost API.

---

## Audit Method

After a clean production build, the following grep commands were executed against `.next/static/` — the directory that contains all JavaScript chunks shipped to browsers:

```bash
grep -r "BLOCKFROST" .next/static/
grep -r "preprodlWl7" .next/static/
```

---

## Results

| Check | Command | Result |
|-------|---------|--------|
| Env var name | `grep -r "BLOCKFROST" .next/static/` | **0 matches** ✅ |
| Env var value | `grep -r "preprodlWl7" .next/static/` | **0 matches** ✅ |

**Verdict: PASSED — API key is fully isolated to the server-side environment.**

---

## Why This Works

`BLOCKFROST_PROJECT_ID` does **not** use the `NEXT_PUBLIC_` prefix. Next.js only inlines environment variables prefixed with `NEXT_PUBLIC_` into the browser bundle. Without that prefix, the value is only readable by server-side code at request time.

All Blockfrost calls are made exclusively inside `app/api/treasury/route.ts` and `app/api/transactions/route.ts`, which are Next.js API route handlers — they run on the server and are never bundled into client JavaScript.

The `lib/blockfrost/client.ts` module reads `process.env.BLOCKFROST_PROJECT_ID` using Node.js `process.env`, which has no meaning in a browser context. This module is only ever imported by the API route files.

---

## Architecture Summary

```
Browser                  Next.js Server              Blockfrost API
   │                          │                            │
   │── GET /transparency ────►│                            │
   │                          │── GET /api/treasury ──────►│ ← project_id header (server-only)
   │                          │◄── { adaBalance: 12.5 } ──│
   │◄── { adaBalance: 12.5 } ─│                            │
   │                          │                            │
   │  (No API key ever        │                            │
   │   crosses this boundary) │                            │
```

---

## Constraints Satisfied

| Constraint | Status |
|------------|--------|
| C5-01: `BLOCKFROST_PROJECT_ID` has no `NEXT_PUBLIC_` prefix | ✅ Confirmed |
| C5-02: All Blockfrost calls made from `app/api/` route handlers only | ✅ Confirmed |
| C5-08: API key absent from client bundle (verified via grep) | ✅ Confirmed |
