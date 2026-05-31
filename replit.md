# Talqeeh (تَلْقِيح)

An AI-powered study companion for Indonesian students at Al-Azhar University (Masisir). Provides curated AI prompts, learning frameworks, and subject-specific guides (Maddah) for Sharia studies.

## Tech Stack
- **Frontend:** React 18 + Vite + Tailwind CSS
- **Backend:** Node.js custom server (`server.cjs`) serving the built frontend and API routes
- **Database/Auth:** Supabase (member management, user data sync)
- **WhatsApp:** Fonnte API for WhatsApp notifications

## Project Structure
- `src/` — React frontend source
- `api/` — Serverless-style API handlers (admin-auth, admin-members, send-wa)
- `server.cjs` — Node.js server that serves built frontend + proxies API calls
- `public/` — Static assets

## Running the App
The app builds with Vite then serves via `server.cjs` on port 5000.

## Required Secrets
- `SUPABASE_ANON_KEY` — Supabase anonymous key (for frontend client)
- `SUPABASE_SERVICE_ROLE_KEY` — Supabase service role key (for admin operations)
- `ADMIN_PIN` — Admin dashboard PIN
- `FONNTE_TOKEN` — Fonnte API token for WhatsApp notifications

## User Preferences
