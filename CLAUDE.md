  # CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Vite dev server at http://localhost:5173
npm run build        # Production build → /dist
npm run preview      # Preview production build locally
npm run lint         # ESLint (flat config v9)
npm test             # Vitest single run
npm run test:watch   # Vitest watch mode
```

Run a single test file: `npx vitest run src/tests/shared/rpeEngine.test.js`
ejecuta 
Local Supabase (if configured): see `supabase/config.toml` — API on port 54321, DB on 54322.

## Architecture

### Tech Stack
- **React 19** SPA + **React Router 7** (lazy code-splitting on all major modules)
- **Zustand 5** — global state with `persist` middleware (localStorage + checksum integrity)
- **Supabase** — PostgreSQL + Auth + Realtime; multi-tenant via Row-Level Security (RLS)
- **Vite 8** + **Tailwind CSS v4** + **Framer Motion**
- **PWA** (vite-plugin-pwa/Workbox) — offline-first, service worker with background sync queue

### Entry Points
```
index.html
  → src/main.jsx          (React root, SW registration)
    → src/App.jsx         (BrowserRouter, route definitions, lazy imports)
      → src/app/shell/CRMApp.jsx   (auth state, RBAC, module routing — authenticated zone)
      → src/marketing/    (public portal, no auth)
```

### Route Structure
- `/` → Marketing portal (`PortalLayout`)
- `/crm/*` → Authenticated CRM shell (`CRMApp.jsx`) with modules: `home`, `entrenamiento`, `plantilla`, `administracion`, `calendario`, `partidos`, `reportes`, `kioskmode`, `miclub`
- `/confirmar/:clubId/:eventId` → Public RSVP page

### State & Persistence
`src/shared/store/useStore.js` is the Zustand store. All UI state lives here. It persists automatically to `localStorage` and syncs to Supabase in the background via `useSupabaseSync.js`. When Supabase is offline, reads/writes fall through to localStorage only (`storageService.js`).

### Service Layer
```
src/shared/services/
  authService.js        — Supabase Auth (signUp, signIn, signOut, getProfile)
  supabaseService.js    — All table read/write (write-through to localStorage)
  healthService.js      — RPE health snapshots; calls rpeEngine.js
  storageService.js     — localStorage fallback, backup/restore, JSON export
  migrationService.js   — Data migrations run on boot
  backupService.js      — Full JSON backup export
```

### Algorithms (do not change without running algorithm-integrity CI)
- `src/shared/utils/rpeEngine.js` — Session-RPE model (Foster et al., 2001); risk thresholds: Óptimo >70, Precaución 50–70, Riesgo <50
- `src/shared/utils/alttezScore.js` — Composite performance score 0–10 (attendance + RPE + match stats + wellness)

### Supabase Schema (9 tables)
`clubs`, `athletes`, `sessions`, `payments`, `movements`, `match_stats`, `health_snapshots`, `profiles`, `tactical_data`. All tables have `club_id` and are isolated by RLS using `get_my_club_id()`. Auth profile auto-created on signup via `handle_new_user()` trigger.

### Edge Function
`supabase/functions/analyze-diagram/index.ts` — Accepts a base64 image, calls Claude Vision API, returns an SVG tactical diagram (200×160px). Requires `ANTHROPIC_API_KEY` in Deno environment.

### Testing
Tests live in `src/tests/**/*.test.{js,jsx}` (jsdom environment via Vitest). Coverage focuses on algorithms (`rpeEngine`, `alttezScore`) and services (`healthService`, `storageService`, `authService`).

### CI/CD
GitHub Actions (`.github/workflows/`):
- `ci.yml` — lint + build + test on push to `master`/`desarrollo` and on PRs
- `bundle-check.yml` — warns if any JS chunk in `dist/assets/` exceeds 500 KB
- `algorithm-integrity.yml` — runs `node scripts/test-algorithms.js` on changes to `src/utils/`

Deployment is via Vercel; `vercel.json` defines SPA rewrites and security headers (CSP, HSTS).

## Key Conventions

- **Language:** All UI text, labels, and messages are in Spanish (target market: Latin America).
- **No TypeScript:** Pure JSX with JSDoc type hints. Keep it that way unless explicitly asked.
- **Design tokens:** Colors and typography live in `src/shared/tokens/palette.js` and `tailwind.config.js`. Primary accent is `#39FF14` (neon lime). Do not hardcode colors outside tokens.
- **RBAC:** Roles are `admin`, `coach`, `staff`. Module access is guarded by `canAccessModule(role, module)` from `src/shared/constants/roles.js`.
- **Tactical Board:** Current version is `TacticalBoard/` v9 under `src/app/roster/`. Treat it as complete unless specifically asked to modify it.
