---
name: Muqaranah + Kurasah Modules
description: Architecture decisions for the two new modules added to MADAD — route patterns, storage keys, cross-component data flow
---

## Storage Keys
- `madad_notes` — Kurasah notes array (loadNotes/saveNotes in auth.jsx, also dispatches madad:refresh)
- `madad_muqaranah_custom` — custom user-created muqaranah (loadCustomMuqaranah/saveCustomMuqaranah in muqaranah-data.jsx)

## Route Patterns (hash routing)
- `/paths/muqaranah` — landing grid (MuqaranahPage)
- `/paths/muqaranah?id=xxx` — detail (MuqaranahDetailPage) — note: path.startsWith match, not exact
- `/paths/muqaranah/new` — form (MuqaranahFormPage)
- `/kurasah` — landing rak notes (KurasahPage)
- `/kurasah?id=xxx` — editor (KurasahEditorPage)
- `/kurasah/new` — new note (KurasahEditorPage)
- All kurasah routes added to memberOnly in app.jsx

## Note Schema
`{ id, title, body (raw markdown), tags: string[], source: { type, id, label } | null, createdAt, updatedAt }`

## Key Design Decisions
**Why:** saveNotes in auth.jsx dispatches madad:refresh — so KurasahPage, KurasahRecentCards (dashboard), all auto-react.

**KurasahRecentCards is defined AFTER DashboardPage** in dashboard.jsx — OK because it's called during React render (after all script code runs), not at parse time.

**Script load order in index.html:** muqaranah-data → markdown-render → quick-note → muqaranah pages → kurasah pages → app.jsx. quick-note.jsx depends on loadNotes/saveNotes from auth.jsx (loaded before).

**ViewColumn (muqaranah-detail):** isMobile prop passed from parent state via window.resize listener, not CSS-only — because accordion vs grid logic requires JS-level branching.
