---
name: MADAD Architecture
description: Stack, file layout, routing, and dashboard structure for the no-bundler CDN stack.
---

# MADAD Architecture

## Stack
- Plain HTML + React 18 via CDN + Babel standalone (no bundler)
- Tailwind via CDN (config in `<script>` tag in index.html)
- Server: `python3 -m http.server 5000`
- All JSX files loaded as `<script type="text/babel">` via index.html

## File Layout
- `src/icons.jsx` — icon system
- `src/ui.jsx` — primitives (Stars, LogoMark, Arch, Blob, Reveal, WordReveal, etc.)
- `src/auth.jsx` — auth + progress hooks, storage keys use `madad_` prefix
- `src/data.jsx` — AI_TOOLS, LEARNING_PATHS, STRUGGLES, FIELDS, LEARNING_STYLES, recommend()
- `src/layout.jsx` — Navbar, Footer, LoginModal, PaymentModal
- `src/app.jsx` — routing + state (paymentOpen, loginOpen)
- `src/pages/` — landing, onboarding, dashboard, tool-guide, paths, ethics, admin

## Dashboard Section Order (canonical from design.md)
1. Greeting (Assalamu'alaikum [Name])
2. Continue Learning + Stage (side by side grid)
3. AI Recommendations (with reasoning per profile)
4. Adaptive Guide Quick Preview (top rec + learning style guide + starter prompt)
5. Learning Paths (progress bars)
6. Progress & Quick Actions

## Payment Flow
- Payment modal → Lynk.id → success state shows "kode akses dikirim admin"
- Login modal → access code → onboarding (3 questions) → dashboard

## Demo Access
- Code: `MSR-DEMO-1234`, Admin PIN: `9090`

**Why:** No bundler means all components must be registered on `window.*` — exports are at bottom of each file as `window.ComponentName = ComponentName`.
