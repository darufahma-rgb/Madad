---
name: Bank Soal Feature
description: Complete bank soal implementation — API endpoints, submit page, admin panel tab, siap-imtihan section
---

## Files created / modified

**New API (4 files):**
- `api/submit-soal.js` — public POST, handles `_checkOnly` flag for duplicate check without insert, FONNTE not needed here
- `api/parse-soal.js` — uses `OPENROUTER_API_KEY` (NOT yet in secrets), calls Claude Haiku vision, updates soal column
- `api/approve-soal.js` — requires `x-admin-token`, approve/reject, deletes foto from storage after approve, sends WA via FONNTE
- `api/admin-bank-soal.js` — requires `x-admin-token`, actions: `list` (with optional status_filter) + `stats`

**New page:**
- `src/pages/submit-soal.jsx` — window-global pattern (`window.SubmitSoalPage`), public route, compressImage utility, 3-step flow

## Key constraints
- **Fonnte env var = `FONNTE_TOKEN`** (not FONNTE_API_KEY as the spec said)
- **OPENROUTER_API_KEY** must be added to secrets before parse-soal.js works
- Body parsing in all API handlers: `req.on('data',...)` + `req.on('end',...)` pattern (no req.body)
- `api/approve-soal.js` and `api/admin-bank-soal.js` both import `verifyToken` from `./admin-auth.js`
- Storage bucket `soal-foto` must exist in Supabase with public upload RLS policy
- bank_soal table SELECT for anon key must allow `status=eq.approved` rows (for BankSoalSection)

## Server routes added (server.cjs)
`/api/submit-soal`, `/api/parse-soal`, `/api/approve-soal`, `/api/admin-bank-soal`

## Routing
- `isPublic` includes `/submit-soal`
- AdminBankSoal component added before `window.AdminPage = AdminPage` at bottom of admin.jsx
- BankSoalSection added before SiapImtihanPage component, and inserted as `<BankSoalSection/>` after header section inside SiapImtihanPage
