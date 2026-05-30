---
name: Mahad Crash Fix
description: Root cause and fix for the Ma'had Maddah crash in Talqeeh
---

## The Rule
`src/maddah-mahad-data.jsx` is a LEGACY file from an earlier Ma'had implementation. It must NOT be loaded via index.html script tag.

**Why:** Its last line `MAHAD_MADDAHS.forEach(m => MADDAHS.push(m))` injects 16 old-format entries (with `isMahad`, `mahadSubcat`, `mahadFor` properties and prompts as arrays-of-objects) directly into the S1 `MADDAHS` array. When maddah-detail.jsx tries to render these entries it crashes because it expects a different format.

**How to apply:** If the script tag for `src/maddah-mahad-data.jsx` is ever re-added to index.html, remove it immediately. The correct Ma'had data is in `src/mahad-data.jsx` (21 maddahs, `MAHAD_MADDAH` array, prompts as plain strings). `maddah-hub.jsx` safely guards: `typeof MAHAD_MADDAHS !== "undefined"`.

## What exists now (correct state)
- `src/mahad-data.jsx` — 21 maddah entries, `getMahadMaddahByJenjang`, `getMahadMaddahById` on window
- `src/pages/mahad-maddah.jsx` — consumes `MAHAD_MADDAH` (no S), route `/mahad-maddah`
- `src/maddah-mahad-data.jsx` — FILE STILL EXISTS but NOT loaded (no script tag)
