---
name: Prompt 6 Features
description: ModuleRunner system, StarterPack generator, and ToolIcon brandColor pattern added in Prompt 6
---

## ModuleRunner (paths.jsx)
- Module `content` field has `type`: "materi" | "praktik" | "tour"
- "Mulai modul" button opens ModuleRunner modal (not direct toggle)
- "Selesai/Tandai" button inside modal calls `markModuleComplete` + closes
- TourContent uses `AI_TOOLS` global + `ToolIcon` — both available as window globals
- **Why:** needed real interactive content, not just a toggle checkbox

## LEARNING_PATHS content
- All 15 modules across 3 paths now have `content` field
- Intermediate "Workflow" kind renamed to "Materi" or "Praktik" as appropriate
- Advanced a1 is "Tour" (multi-AI workflow walkthrough)

## StarterPack
- `generateStarterPack(profile, session)` in `adaptive-prompt.jsx`, exported to window
- Builds personalized AI intro prompt from profile (level, faculty, major, learningStyle)
- `StarterPackButton` component in `maddah-detail.jsx` (before prompt template section)
- `StarterPackDashCard` component in `dashboard.jsx` (in Aksi Cepat grid, 3-col layout)

## ToolIcon brandColor
- All AI_TOOLS now have `brandColor` field (hex) + `logo: null`
- ToolIcon uses `brandColor || color` for linear-gradient background
- No more `filter: brightness(0) invert(1)` anywhere
- **Why:** local logo assets were missing/broken and forced-white filter looked bad
