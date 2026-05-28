---
name: Maddah System
description: Prompt 3A complete — 36 Maddah data, adaptive prompt engine, Hub and Detail pages, routing, navbar.
---

## Status
Prompt 3A complete. Prompt 3B (fill 33 skeleton Maddah) is next — do NOT start 3B until 3A confirmed clean.

## Files Created (Prompt 3A)
- `src/maddah-data.jsx` — 36 Maddah, MADDAH_CATEGORIES, MADDAH_PROMPT_KINDS, helpers. 3 full + 33 skeleton.
- `src/adaptive-prompt.jsx` — resolveAdaptivePrompt(), resolveGenericPrompt(), TINGKATAN_LABEL, FAKULTAS_LABEL, LEVEL_BAHASA_INSTRUCTION all on window.
- `src/pages/maddah-hub.jsx` — MaddahHubPage on window.MaddahHubPage
- `src/pages/maddah-detail.jsx` — MaddahDetailPage on window.MaddahDetailPage

## Files Updated
- `index.html` — 4 new script tags inserted before `<!-- App shell (last) -->` comment
- `src/app.jsx` — routes `/maddah`, `/maddah/` → MaddahHubPage; `/maddah/*` → MaddahDetailPage
- `src/layout.jsx` — "Maddah" link added to memberLinks after "Dashboard"

## Script Load Order
maddah-data.jsx → adaptive-prompt.jsx → maddah-hub.jsx → maddah-detail.jsx → app.jsx

## 3 Full Maddah (template quality for 3B)
- `tafsir-tahlili` (qurani) — ushuluddin/dirasat/quran, tingkat 3-4-pasca
- `nahwu` (lughawi) — all fakultas, tingkat mustawa-1-2-3-4
- `ushul-fiqh` (fiqhi) — ushuluddin/syariah/dirasat, tingkat 2-3-4-5-pasca

## Key Constraints
- localStorage keys stay `madad_*` — only copy/text renamed to Talqih
- Routes are hash-based: navigate("/maddah") → window.location.hash = "#/maddah"
- Adaptive prompt placeholders: [TINGKATAN] [FAKULTAS] [JURUSAN] [GAYA_BELAJAR] [MADDAH] [LEVEL_BAHASA]
- User-fill placeholders like [BAB], [KAIDAH] etc are intentionally NOT auto-resolved

**Why:** The 3 full Maddah serve as the pattern standard for Prompt 3B batch fills.
