---
name: Mahad Al-Azhar Module
description: Prompt 21 implementation — granular Ma'had levels, maddah data, /mahad-maddah page, dashboard card, tab bar
---

## Level IDs
- Old broad IDs (backward compat): `idadi`, `tsanawi` — still in LEVELS array + MAHAD_LEVEL_IDS
- New granular IDs: `idad_1`, `idad_2`, `idad_3`, `tsanawi_1_adabi`, `tsanawi_1_ilmi`, `tsanawi_2_adabi`, `tsanawi_2_ilmi`, `tsanawi_3_adabi`, `tsanawi_3_ilmi`

## Helpers (all exported to window via Object.assign in data.jsx)
- `isMahadLevel(level)` — checks MAHAD_LEVEL_IDS (includes both old + new)
- `isIdadLevel(level)` — level?.startsWith("idad")
- `isTsanawiLevel(level)` — level?.startsWith("tsanawi")
- `isIlmiLevel(level)` — level?.includes("ilmi")
- `isAdabiLevel(level)` — level?.includes("adabi")

## Files
- `src/mahad-data.jsx` — MAHAD_MADDAH array (19 maddah), getMahadMaddahByJenjang(), getMahadMaddahById()
- `src/pages/mahad-maddah.jsx` — MahadMaddahPage component (route: /mahad-maddah)
- mahad-data.jsx script loaded BEFORE mahad-maddah.jsx in index.html

## getMahadMaddahByJenjang logic
- Uses level.startsWith("idad") and level.startsWith("tsanawi") — works with BOTH old and new IDs
- Jurusan filter uses level.includes("ilmi") / level.includes("adabi")

## Dashboard
- Ma'had card added at "2d" slot (after S2 card, before MaddahHeroSection)
- Conditional: only shows when isMahadLevel(profile?.level)

## Mobile Tab Bar (layout.jsx)
- Ma'had users get: Dashboard, Maddah (/mahad-maddah), Ujian, Kurasah, Tools

## Design
- All violet colors replaced with emerald (rgba(62,207,142,...)) in mahad-maddah.jsx
- Gold (#C9A86A) kept for Arabic text and Islamic accents

**Why:** Old idadi/tsanawi users still need isMahadLevel to return true. Jurusan embedded in new level IDs (tsanawi_1_ilmi) rather than separate mahad_jurusan field.
