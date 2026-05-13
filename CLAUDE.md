# CLAUDE.md

Guía para Claude Code (claude.ai/code) al trabajar en este repositorio.

## Commands

```bash
npm run dev          # Vite dev server en http://localhost:5173
npm run build        # Build de producción → /dist
npm run preview      # Preview del build localmente
npm run lint         # ESLint (flat config v9)
npm test             # Vitest single run
npm run test:watch   # Vitest watch mode
```

Test único: `npx vitest run src/tests/shared/rpeEngine.test.js`

Supabase local (si está configurado): ver `supabase/config.toml` — API en 54321, DB en 54322.

Branch flow: trabajar en `desarrollo`, PR a `master`. Nunca push directo a `master`.

## Architecture

### Tech Stack
- **React 19.2** SPA + **React Router 7.13** (lazy code-splitting en todos los módulos)
- **Zustand 5** — estado global con middleware `persist` (localStorage + checksum)
- **Supabase** (`@supabase/supabase-js` 2.x) — PostgreSQL + Auth + Realtime; multi-tenant via RLS. El cliente cae a `null` si faltan `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` (modo offline-only sobre localStorage).
- **Vite 8** + **Tailwind CSS v4** + **Framer Motion 12**
- **PWA** (vite-plugin-pwa/Workbox) — offline-first, SW con cola de sync en background
- **Testing:** Vitest 4 (jsdom) + Testing Library + Playwright (e2e)
- **Otros:** jspdf + jspdf-autotable, lucide-react, class-variance-authority, tailwind-merge, dompurify

### Entry Points
```
index.html
  → src/main.jsx          (React root, SW registration)
    → src/App.jsx         (BrowserRouter, rutas, lazy imports, error handlers)
      → src/marketing/                 (portal público sin auth)
      → src/app/shell/CRMApp.jsx       (CRM autenticado: auth, RBAC, módulos)
      → src/app/torneos/TorneosApp.jsx (producto Torneos: gate de auth propio + módulos)
```

### Route Structure

**Portal público (`PortalLayout`):**
- `/` → `PortalHome`
- `/quienes-somos` → `QuienesSomos`
- `/contacto` → `Contacto`
- `/producto/alttezcrm` → `SportsCRMPage`
- `/servicios/sports-crm` → redirect a `/producto/alttezcrm`
- `/precios` → `PricingPage`
- `/journal` → `JournalPage`

**Públicas sin layout del portal:**
- `/privacidad` → `PrivacyPolicy`
- `/confirmar/:clubId/:eventId` → `ConfirmarAsistencia` (RSVP público)

**Productos autenticados:**
- `/crm/*` → `CRMApp` (módulos: `home`, `entrenamiento`, `plantilla`, `administracion`, `calendario`, `partidos`, `reportes`, `kioskmode`, `miclub`). `/crm/kiosk` se renderiza sin sidebar/topbar.
- `/torneos/*` → `TorneosApp` (módulos: `inicio`, `torneos`, `equipos`, `categorias`, `calendario`, `estadisticas`, `fixtures`, `publica`, `ajustes`, `crear`)

### Productos
- **ALTTEZ Clubes** (CRM) → gestión interna del club. Auth via `LandingPage` compartida.
- **ALTTEZ Torneos** → organizador con fixture, resultados, tabla y vista pública. Tiene **gate de auth inline propio** (`TorneosAuthScreen` dentro de `TorneosApp.jsx`) además de la `LandingPage` pública. Sin Supabase configurado, salta el gate y entra directo en modo offline.
- **Modo Demo** (CRM): banner persistente + modal de conversión a los 15 min (`DemoGate.jsx`).

### State & Persistence
`src/shared/store/useStore.js` — store Zustand del CRM. Todo el estado UI vive ahí. Persiste a `localStorage` y sincroniza a Supabase en background via `useSupabaseSync.js`. Sin Supabase, lectura/escritura caen a localStorage (`storageService.js`).

`src/app/torneos/store/useTorneosStore.js` — store independiente para Torneos.

### Service Layer
```
src/shared/services/
  authService.js        — Supabase Auth (signUp, signIn, signOut, getProfile,
                          linkProfileToClub, deleteAccount, onAuthStateChange)
  supabaseService.js    — Read/write tablas CRM (write-through a localStorage)
  healthService.js      — Snapshots RPE; usa rpeEngine.js
  storageService.js     — Fallback localStorage, backup/restore, export JSON
  migrationService.js   — Migraciones de datos en boot
  backupService.js      — Export JSON completo

src/app/torneos/services/
  torneosService.js     — CRUD post-auth (torneos, equipos, partidos)
```

### Algorithms (no modificar sin correr algorithm-integrity CI)
- `src/shared/utils/rpeEngine.js` — Session-RPE (Foster et al., 2001); thresholds: Óptimo >70, Precaución 50–70, Riesgo <50
- `src/shared/utils/alttezScore.js` — Score compuesto 0–10 (asistencia + RPE + match stats + wellness)

### Supabase Schema
Migraciones en `supabase/migrations/` (numeradas 001–013). Tablas activas:

**CRM (multi-tenant via `club_id` + RLS):** `clubs`, `athletes`, `sessions`, `payments`, `movements`, `match_stats`, `health_snapshots`, `tactical_data`, `wellness_logs`, `bulk_upload_logs`, `event_rsvp`, `user_sessions`

**Auth:** `profiles` (= `auth.users.id`, contiene `club_id` + `role` + `full_name`). Creado automático en signup via trigger `handle_new_user()`.

**Portal público:** `services`, `journal_entries`

**Torneos:** `torneos`, `torneo_equipos`, `torneo_partidos` (gestionadas via `torneosService.js`; usuarios de Torneos tienen `profiles.club_id = NULL`).

RLS aislada con `get_my_club_id()`. RPC `delete_user()` para eliminación de cuenta.

### Edge Function
`supabase/functions/analyze-diagram/index.ts` — Recibe imagen base64, llama a Claude Vision API, retorna SVG táctico (200×160px). Requiere `ANTHROPIC_API_KEY` en entorno Deno.

### Testing
Tests en `src/tests/**/*.test.{js,jsx}` (jsdom via Vitest). Cobertura enfocada en algoritmos (`rpeEngine`, `alttezScore`), servicios (`healthService`, `storageService`, `authService`) y flujos de auth (`LandingPage`, `TorneosLogin`).

### CI/CD
GitHub Actions (`.github/workflows/`):
- `ci.yml` — lint + build + test en push a `master`/`desarrollo` y PRs
- `bundle-check.yml` — alerta si un chunk JS en `dist/assets/` excede 500 KB
- `algorithm-integrity.yml` — corre `node scripts/test-algorithms.js` en cambios a `src/utils/`

Deploy via Vercel; `vercel.json` define SPA rewrites + security headers (CSP, HSTS).

## Key Conventions

- **Idioma:** Todo el texto UI, labels y mensajes en español (target: LATAM).
- **No TypeScript:** JSX puro con JSDoc type hints. Mantener así salvo petición explícita.
- **Design tokens:** Colores y tipografía en `src/shared/tokens/palette.js` y `tailwind.config.js`. Acentos: `#39FF14` (neon lime, interior CRM), `#C9973A` / `#CE8946` (cobre, Torneos + landing). Tipografía: Manrope. No hardcodear colores fuera de tokens.
- **Brand:** Manual de marca v1.1 — premium, claro, editorial. Paleta cobre/marfil para Torneos & landing; neon lime sólo en interior CRM.
- **RBAC:** Roles `admin`, `coach`, `staff`. Acceso por módulo via `canAccessModule(role, module)` desde `src/shared/constants/roles.js`. En modo demo o sin Supabase configurado, rol forzado a `admin` (offline).
- **Tactical Board:** Versión actual `TacticalBoard/` v9 en `src/app/roster/`. Tratar como completo salvo petición específica.
- **Auth UX:** El registro debe redirigir directo a la interfaz (CRM home o `/torneos`). No mostrar pantallas intermedias tipo "Revisa tu correo" — si signUp no devuelve sesión, hacer signIn inmediato como fallback. Sin Supabase configurado, saltar gates de auth y entrar en modo offline.
