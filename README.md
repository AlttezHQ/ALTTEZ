<p align="center">
  <img src="public/icons/icon-base.svg" width="80" alt="ALTTEZ" />
</p>

<h1 align="center">ALTTEZ</h1>

<p align="center">
  <strong>Sports Management Platform</strong><br/>
  La plataforma de gestión profesional para clubes deportivos en Latinoamérica
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Version-2.0.0-blue" alt="v2.0.0" />
  <img src="https://img.shields.io/badge/Status-Production-green" alt="Production" />
  <img src="https://img.shields.io/badge/PWA-Installable-orange" alt="PWA" />
  <img src="https://img.shields.io/badge/Stack-React%2019%20%2B%20Supabase-purple" alt="Stack" />
  <img src="https://img.shields.io/badge/License-UNLICENSED-red" alt="License" />
</p>

---

## Visión

Los clubes deportivos en Latinoamérica gestionan sus operaciones con hojas de cálculo, grupos de WhatsApp y memoria. No existe una herramienta accesible que integre lo deportivo con lo administrativo de forma profesional.

**ALTTEZ** unifica entrenamiento, táctica, calendario, finanzas y rendimiento de atletas en una sola plataforma — diseño monochrome premium, experiencia offline-first y algoritmos de ciencia deportiva basados en literatura peer-reviewed.

---

## Módulos

| Módulo | Descripción |
|--------|-------------|
| **Dashboard** | KPIs del club: ALTTEZ Score, carga del equipo, próximos eventos, alertas de salud |
| **Gestión de Plantilla** | Registro de atletas, stats, fotos, bulk import CSV, roles tácticos |
| **Pizarra Táctica** | Campo interactivo con drag & drop, formaciones, herramientas de dibujo, análisis de diagrama con IA |
| **Entrenamiento** | Sesiones RPE, planificación de microciclos, export PDF, historial completo, ACWR |
| **Match Center** | Ingesta post-partido, scoring inteligente, player cards, analytics de equipo |
| **Calendario + RSVP** | Eventos del club, confirmación de asistencia pública, recordatorios |
| **Finanzas** | Control de pagos por atleta, movimientos de ingreso/egreso, semáforo financiero |
| **Reportes** | ALTTEZ Score individual y grupal, spider charts, tendencias de rendimiento |
| **Kiosk Mode** | Pantalla de check-in autónomo para atletas en instalaciones del club |
| **Mi Club** | Configuración del club, gestión de usuarios, backup y exportación de datos |

---

## Stack Técnico

| Capa | Tecnología |
|------|-----------|
| UI Framework | React 19 (SPA) |
| Routing | React Router 7 — lazy code-splitting en todos los módulos |
| Estado global | Zustand 5 con `persist` middleware (localStorage + checksum) |
| Base de datos | Supabase — PostgreSQL + Auth + Realtime |
| Seguridad de datos | Row-Level Security (RLS) — aislamiento total por `club_id` |
| Estilos | Tailwind CSS v4 |
| Animaciones | Framer Motion |
| Build | Vite 8 |
| PWA | vite-plugin-pwa / Workbox — offline-first, background sync |
| PDF Export | jsPDF + jsPDF-AutoTable |
| Iconos | Lucide React |
| Tests | Vitest + Testing Library (jsdom) |
| Linting | ESLint flat config v9 |
| Deploy | Vercel (SPA rewrites + security headers) |

---

## Arquitectura

```
index.html
  └── src/main.jsx              ← React root, SW registration
        └── src/App.jsx         ← BrowserRouter, rutas top-level, lazy imports
              ├── src/marketing/                    ← Portal público (sin auth)
              │     ├── layout/PortalLayout.jsx
              │     ├── pages/  (Home, SportsCRM, Precios, Journal, Contacto…)
              │     └── sections/ (Hero, Modules, Ecosystem, DashboardPreview…)
              └── src/app/shell/CRMApp.jsx          ← Zona autenticada (RBAC + módulos)
                    ├── dashboard/    Home.jsx
                    ├── training/     Entrenamiento.jsx, Planificacion.jsx
                    ├── roster/       GestionPlantilla.jsx, BulkAthleteUploader.jsx
                    │                 TacticalBoard/TacticalBoardV9.jsx
                    ├── scheduling/   Calendario.jsx, CreateEventModal.jsx, EventPanel.jsx
                    ├── competition/  MatchCenter.jsx
                    ├── analytics/    Reportes.jsx
                    ├── finance/      Administracion.jsx
                    ├── experience/   KioskMode.jsx
                    └── club/         MiClub.jsx
```

### Estado y Persistencia

`src/shared/store/useStore.js` — store Zustand único. Persiste automáticamente en `localStorage` y sincroniza a Supabase en background vía `useSupabaseSync.js`. Sin conexión, todas las operaciones caen silenciosamente a `localStorage` (`storageService.js`).

### Capa de Servicios

```
src/shared/services/
  authService.js        — Supabase Auth (signUp, signIn, signOut, getProfile)
  supabaseService.js    — Lectura/escritura de todas las tablas (write-through a localStorage)
  healthService.js      — Snapshots de salud RPE; invoca rpeEngine.js
  storageService.js     — Fallback localStorage, backup/restore, export JSON
  migrationService.js   — Migraciones de datos en boot
  backupService.js      — Export completo JSON del club
```

### Alias de Rutas

```js
"@" → src/
```

---

## Estructura del Proyecto

```
/
├── src/
│   ├── App.jsx                   ← Root de la app
│   ├── main.jsx                  ← Entry point React
│   ├── index.css                 ← Estilos globales
│   ├── app/                      ← Módulos del CRM autenticado
│   │   ├── analytics/
│   │   ├── club/
│   │   ├── competition/
│   │   ├── dashboard/
│   │   ├── experience/
│   │   ├── finance/
│   │   ├── roster/
│   │   ├── scheduling/
│   │   ├── shell/
│   │   └── training/
│   ├── marketing/                ← Portal público
│   │   ├── data/
│   │   ├── layout/
│   │   ├── pages/
│   │   ├── sections/
│   │   └── theme/
│   ├── components/
│   │   └── ui/                   ← Componentes UI genéricos (shadcn-style)
│   ├── shared/
│   │   ├── auth/                 ← LandingPage, guards de sesión
│   │   ├── constants/            ← roles.js, schemas.js, formations.js
│   │   ├── hooks/                ← useLocalStorage, useSupabaseSync, useResponsive…
│   │   ├── services/             ← Capa de datos
│   │   ├── store/                ← Zustand store
│   │   ├── tokens/               ← palette.js (design tokens)
│   │   ├── types/
│   │   ├── ui/                   ← Componentes UI compartidos
│   │   └── utils/                ← rpeEngine.js, alttezScore.js
│   └── tests/                    ← Vitest (algoritmos + servicios)
├── supabase/
│   ├── config.toml
│   ├── functions/
│   │   └── analyze-diagram/      ← Edge Function: Claude Vision → SVG táctico
│   └── migrations/               ← 10 migraciones SQL secuenciales
├── public/
│   ├── icons/
│   ├── manifest.json
│   └── offline.html
├── scripts/                      ← Scripts de utilería (brand-update, clean-ui)
├── .github/workflows/            ← CI/CD (6 pipelines)
├── vite.config.js
├── tailwind.config.js
├── vercel.json
└── CLAUDE.md
```

---

## Rutas

| Ruta | Componente | Auth |
|------|-----------|------|
| `/` | PortalHome | No |
| `/quienes-somos` | QuienesSomos | No |
| `/contacto` | Contacto | No |
| `/producto/alttezcrm` | SportsCRMPage | No |
| `/precios` | PricingPage | No |
| `/journal` | JournalPage | No |
| `/privacidad` | PrivacyPolicy | No |
| `/confirmar/:clubId/:eventId` | ConfirmarAsistencia | No |
| `/crm/*` | CRMApp → módulos | Sí (RBAC) |

---

## RBAC — Control de Acceso

Tres roles. Guardados en Supabase tabla `profiles`, verificados en `CRMApp.jsx` con `canAccessModule(role, module)`.

| Permiso | Admin | Coach | Staff |
|---------|:-----:|:-----:|:-----:|
| Dashboard | ✓ | ✓ | ✓ |
| Entrenamiento | ✓ | ✓ | ✓ |
| Plantilla | ✓ | ✓ | — |
| Reportes | ✓ | ✓ | — |
| Calendario | ✓ | ✓ | — |
| Partidos | ✓ | ✓ | — |
| Táctica | ✓ | ✓ | — |
| Finanzas | ✓ | — | — |
| Mi Club | ✓ | — | — |
| Backup / Export | ✓ | — | — |
| Gestión de roles | ✓ | — | — |

---

## Base de Datos (Supabase)

9 tablas. Todas tienen `club_id` (UUID) y RLS habilitado. El aislamiento se aplica con `get_my_club_id()`.

| Tabla | Descripción |
|-------|-------------|
| `clubs` | Unidad raíz. Cada organización es un club. |
| `athletes` | Plantel. Status: `P` (presente), `A` (ausente), `L` (lesionado). |
| `sessions` | Historial de entrenamiento con RPE por atleta (`rpeByAthlete` jsonb). |
| `payments` | Pagos mensuales por atleta. Estado: pendiente / pagado / parcial. |
| `movements` | Movimientos financieros de ingreso/egreso del club. |
| `match_stats` | Estadísticas acumuladas de partidos (W/D/L, goles, puntos). |
| `health_snapshots` | Snapshots de salud RPE calculados por sesión. |
| `profiles` | Usuarios con rol RBAC (admin, coach, staff) vinculados al club. |
| `tactical_data` | Datos de pizarra táctica: roles, instrucciones, formaciones. |

**Migraciones** en `supabase/migrations/` — ejecutar en orden secuencial vía Supabase Dashboard → SQL Editor.

---

## Algoritmos de Ciencia Deportiva

> **Crítico:** No modificar sin correr `algorithm-integrity` CI.

### RPE Health Engine v3.1 (`src/shared/utils/rpeEngine.js`)

Implementa el modelo session-RPE de Foster et al. (2001) con escala Borg CR-10:

```
RPE_avg = media(RPEs válidos en ventana 7d, máx 7 sesiones)
SaludActual = clamp(100 − RPE_avg × 10, 0, 100)
```

| Rango | Nivel | Color | RPE_avg equiv. |
|-------|-------|-------|----------------|
| Salud ≥ 50 | Óptimo | `#1D9E75` | ≤ 5.0 |
| 25 ≤ S < 50 | Precaución | `#EF9F27` | 5.0 – 7.5 |
| Salud < 25 | Riesgo | `#E24B4A` | > 7.5 |
| Sin datos | — | gris | — |

**ACWR** (Acute:Chronic Workload Ratio) — Hulin et al. (2014):
- Carga aguda = promedio RPEs 0-7 días
- Carga crónica = promedio RPEs 0-28 días
- Zona óptima: ACWR 0.8 – 1.3 | Peligro: > 1.5

Funciones exportadas: `calcSaludActual`, `calcSaludPlantel`, `calcACWR`, `calcAthleteRisk`, `saludColor`.

### ALTTEZ Score (`src/shared/utils/alttezScore.js`)

Score compuesto 0–10 por atleta. Pondera: asistencia + RPE + estadísticas de partido + wellness. Normalizado contra el promedio del plantel.

---

## Edge Function

`supabase/functions/analyze-diagram/` — Recibe imagen base64 del campo táctico, llama Claude Vision API y retorna SVG táctico (200×160px). Requiere `ANTHROPIC_API_KEY` en el entorno Deno de Supabase.

---

## PWA y Offline

| Recurso | Estrategia | TTL |
|---------|-----------|-----|
| JS/CSS/HTML/iconos | CacheFirst (precache) | indefinido |
| Google Fonts | CacheFirst | 1 año |
| Imágenes estáticas | CacheFirst | 30 días |
| API Supabase | NetworkFirst + fallback | 1 día |
| Navegación sin conexión | `offline.html` | — |

Background sync queue (`supabase-sync-queue`) retiene escrituras hasta 24 horas sin conexión.

---

## Comandos

```bash
npm run dev          # Dev server en http://localhost:5173
npm run build        # Build de producción → /dist
npm run preview      # Preview del build de producción
npm run lint         # ESLint (flat config v9)
npm test             # Vitest run único
npm run test:watch   # Vitest modo watch

# Test de un archivo específico
npx vitest run src/tests/shared/rpeEngine.test.js

# Supabase local (requiere config en supabase/config.toml)
# API: puerto 54321 | DB: puerto 54322
```

---

## Configuración Local

### Variables de Entorno

Crear `.env.local` en la raíz:

```env
VITE_SUPABASE_URL=https://<tu-proyecto>.supabase.co
VITE_SUPABASE_ANON_KEY=<tu-anon-key>
```

### Setup

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev
```

Para Supabase local: ver `supabase/config.toml`. Ejecutar migraciones en orden desde `supabase/migrations/`.

---

## CI/CD

6 pipelines en `.github/workflows/`:

| Pipeline | Trigger | Qué hace |
|----------|---------|---------|
| `ci.yml` | push a `master`/`desarrollo`, PRs a `master` | Lint + Build + Test |
| `bundle-check.yml` | push | Alerta si algún chunk JS supera 500 KB |
| `algorithm-integrity.yml` | cambios en `src/utils/` | Ejecuta `scripts/test-algorithms.js` |
| `data-quality.yml` | push | Validación de calidad de datos |
| `schema-drift.yml` | push | Detecta drift entre migraciones y schema real |
| `security.yml` | push | Análisis de seguridad estático |

**Deploy:** Vercel. `vercel.json` define:
- SPA rewrites (todas las rutas → `index.html`)
- Security headers: CSP, HSTS (2 años), X-Frame-Options, Referrer-Policy, Permissions-Policy

---

## Diseño y Tokens

- **Tokens de color:** `src/shared/tokens/palette.js` + `tailwind.config.js`
- **Idioma de UI:** Español (mercado Latinoamérica)
- **No TypeScript:** JSX puro con JSDoc. No migrar salvo instrucción explícita.
- **Hardcode de colores:** Prohibido. Usar tokens de `palette.js`.

---

## Propiedad Intelectual

Ver `OWNERSHIP.md` para detalles completos sobre autoría, transferencia del repositorio y acuerdos de fundadores.

Este software es propiedad de **ALTTEZ**. Algoritmos deportivos, lógica de negocio, diseño visual y arquitectura de datos son activos protegidos. Ningún colaborador puede copiar, reutilizar, vender o transferir este código fuera del proyecto sin autorización escrita.

---

<p align="center">
  <strong>ALTTEZ</strong> &mdash; Tecnología deportiva de alto rendimiento
</p>
