---
name: Vite Migration
description: CDN+Babel → Vite React build; key decisions and constraints for this project
---

## Stack after migration
- Vite 6 + @vitejs/plugin-react, Tailwind CSS 3, PostCSS
- Entry: src/main.jsx → imports all modules in order, then App
- Build output: dist/ (served by server.cjs and Vercel)
- Deploy: vercel.json with buildCommand=npm run build, outputDirectory=dist

## Critical: window-global cross-file pattern (KEEP AS-IS)
All JSX files still use `Object.assign(window, { ... })` or `window.X = X` at the bottom to expose components.
App.jsx and other consumers reference these as bare globals (e.g. `<LoginModal/>`) — in Vite bundles, Rollup leaves unresolved bare identifiers as runtime global lookups, so `window.LoginModal` resolves correctly at runtime.
**Do NOT convert to ESM imports** between files — the window-global pattern works and was intentionally kept.

## Import order in main.jsx matters
Foundation files must come before pages:
icons → ui → data → supabase → auth → layout → maddah-data → mahad-data → muqaranah-data → intentions-data → adaptive-prompt → markdown-render → quick-note → dashboard-companions → [all pages] → App

## server.cjs split
package.json has `"type": "module"` (required for Vite ESM). The Node.js server must use CommonJS (require/module.exports). Solution: server is server.cjs (NOT server.js). Workflow: `npm run build && node server.cjs`.

**Why:** `"type": "module"` makes .js files ESM; .cjs extension forces CommonJS regardless.

## React hook aliases → removed
auth.jsx had `useStateAuth/useEffectAuth/useCallbackAuth` aliases; dashboard-companions.jsx had `useStateC/useEffectC/useMemoC`. These were CDN-era workarounds — removed during migration, replaced with direct React imports.

## Assets location
- Source: public/assets/ (Vite copies to dist/assets/)
- DO NOT put assets in src/ — use public/assets/
- Logo file: talqeeh-logo.png (not logo.png); index.html references /assets/talqeeh-logo.png

## CSS
All CSS from old index.html style blocks now lives in src/index.css with @tailwind base/components/utilities at top.
