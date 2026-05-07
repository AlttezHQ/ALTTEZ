# Auditoria tecnica ALTTEZ

Fecha de auditoria: 2026-05-06  
Alcance: analisis estatico del repositorio. No se modifico codigo de aplicacion, no se movieron archivos y no se eliminaron archivos.

## 1. Estructura actual de carpetas

Entrada activa:
- `index.html` -> `src/main.jsx` -> `src/App.jsx`.
- `src/App.jsx` define tres superficies principales: portal publico, CRM y Torneos.
- Rutas clave: `/crm/*` carga `src/app/shell/CRMApp.jsx`; `/torneos/*` carga `src/app/torneos/TorneosApp.jsx`; `/producto/alttezcrm` carga marketing de CRM; `/confirmar/:clubId/:eventId` carga RSVP publico.

Mapa actual:

```text
.
|-- artifacts/
|   |-- audit/
|   `-- screenshots/
|-- docs/
|-- mockups aprobados/
|-- public/
|   |-- brand/
|   |-- branding/
|   |-- icons/
|   |-- manifest.json
|   |-- offline.html
|   `-- sw.js
|-- scripts/
|-- src/
|   |-- app/
|   |   |-- analytics/
|   |   |-- club/
|   |   |-- competition/
|   |   |-- dashboard/
|   |   |-- experience/
|   |   |-- finance/
|   |   |-- roster/
|   |   |-- scheduling/
|   |   |-- shell/
|   |   |-- torneos/
|   |   `-- training/
|   |-- components/
|   |   `-- ui/
|   |-- marketing/
|   |   |-- data/
|   |   |-- layout/
|   |   |-- pages/
|   |   |-- sections/
|   |   `-- theme/
|   |-- shared/
|   |   |-- auth/
|   |   |-- constants/
|   |   |-- hooks/
|   |   |-- lib/
|   |   |-- services/
|   |   |-- store/
|   |   |-- tokens/
|   |   |-- types/
|   |   |-- ui/
|   |   `-- utils/
|   `-- tests/
|-- supabase/
|   |-- functions/
|   `-- migrations/
|-- package.json
|-- vite.config.js
`-- vercel.json
```

Observacion: `docs/repo-structure.md` menciona `src/main.tsx`, `src/App.tsx` y `vite.config.ts`, pero esos archivos no existen en el inventario actual. Esa documentacion esta desactualizada.

## 2. Tecnologias principales usadas

- Frontend: React 19, React DOM, React Router DOM 7.
- Build: Vite 8, `@vitejs/plugin-react`.
- Estado: Zustand, con persistencia en localStorage.
- Backend/Auth/DB: Supabase JS v2, Supabase Auth, SQL migrations y Edge Function.
- UI: Tailwind config presente, CSS global en `src/index.css`, componentes propios en `src/shared/ui`, componentes tipo shadcn en `src/components/ui`, iconos con `lucide-react`.
- Animaciones: Framer Motion.
- PWA: `vite-plugin-pwa`, `public/manifest.json`, `public/offline.html`, `public/sw.js`, `src/shared/lib/registerSW.js`.
- Sanitizacion: DOMPurify.
- PDF/reportes: `jspdf`, `jspdf-autotable`.
- Testing: Vitest, Testing Library, jsdom. Tests actuales bajo `src/tests`.

## 3. Modulos actuales detectados

Portal publico:
- `src/marketing/layout/PortalLayout.jsx`
- `src/marketing/pages/PortalHome.jsx`
- `src/marketing/pages/SportsCRMPage.jsx`
- `src/marketing/pages/PricingPage.jsx`
- `src/marketing/pages/QuienesSomos.jsx`
- `src/marketing/pages/Contacto.jsx`
- `src/marketing/pages/JournalPage.jsx`
- `src/marketing/pages/PrivacyPolicy.jsx`
- `src/marketing/pages/ConfirmarAsistencia.jsx`
- Secciones: `HeroSection`, `EcosystemSection`, `ModulesSection`, `DashboardPreview`.

CRM deportivo:
- Shell/orquestacion: `src/app/shell/CRMApp.jsx`.
- Dashboard: `src/app/dashboard/Home.jsx`.
- Entrenamiento: `src/app/training/Entrenamiento.jsx`, `src/app/training/Planificacion.jsx`.
- Plantilla/tactica: `src/app/roster/GestionPlantilla.jsx`, `src/app/roster/BulkAthleteUploader.jsx`, `src/app/roster/TacticalBoard/*`.
- Calendario/RSVP interno: `src/app/scheduling/Calendario.jsx`, `CreateEventModal.jsx`, `EventPanel.jsx`.
- Finanzas: `src/app/finance/Administracion.jsx`.
- Club: `src/app/club/MiClub.jsx`.
- Competicion/partidos: `src/app/competition/MatchCenter.jsx`.
- Reportes: `src/app/analytics/Reportes.jsx`.
- Kiosko/wellness: `src/app/experience/KioskMode.jsx`.

Torneos:
- Shell: `src/app/torneos/TorneosApp.jsx`.
- Estado: `src/app/torneos/store/useTorneosStore.js`.
- Paginas: `InicioPage`, `TorneosListPage`, `EquiposPage`, `FixturesPage`, `EstadisticasPage`, `CalendarioPage`, `AjustesPage`.
- Componentes: `TorneosSidebar`, `TorneosHeader`, `ModuleEmptyState`, `CrearTorneoWizard`.
- Logica de dominio: `src/app/torneos/utils/fixturesEngine.js`, `src/app/torneos/utils/schedulingEngine.js`.
- Servicio Supabase previsto: `src/app/torneos/services/torneosService.js`.

## 4. Archivos y carpetas relacionados con CRM

CRM runtime:
- `src/app/shell/CRMApp.jsx`: state machine principal, auth/profile, modo demo/produccion, guards por rol y seleccion por `activeModule`.
- `src/shared/auth/LandingPage.jsx`: login/registro del CRM, tambien parece aceptar redireccion a Torneos mediante `redirectPath`.
- `src/app/dashboard/Home.jsx`: entrada visual del CRM.
- `src/app/training/Entrenamiento.jsx`: sesiones, RPE, wellness drawer y sync con Supabase.
- `src/app/training/Planificacion.jsx`: planificacion/export PDF.
- `src/app/roster/GestionPlantilla.jsx`: plantel, carga masiva, pizarra tactica.
- `src/app/roster/BulkAthleteUploader.jsx`: parser/validacion CSV.
- `src/app/roster/TacticalBoard/*`: pizarra tactica, tokens, capas, toolbar.
- `src/app/scheduling/*`: calendario, eventos y RSVP.
- `src/app/finance/Administracion.jsx`: pagos y movimientos.
- `src/app/club/MiClub.jsx`: datos del club.
- `src/app/competition/MatchCenter.jsx`: estadisticas de partido.
- `src/app/analytics/Reportes.jsx`: reportes.
- `src/app/experience/KioskMode.jsx`: check-in wellness.

CRM datos/servicios:
- `src/shared/store/useStore.js`: store global del CRM.
- `src/shared/services/storageService.js`: demo/produccion localStorage, sesiones y backup base.
- `src/shared/services/supabaseService.js`: persistencia CRM por `club_id`.
- `src/shared/services/authService.js`: Supabase Auth y `profiles`.
- `src/shared/hooks/useSupabaseSync.js`: carga y escritura CRM hacia Supabase.
- `src/shared/services/healthService.js`: snapshots de salud.
- `src/shared/constants/roles.js`, `initialStates.js`, `schemas.js`.
- `src/shared/utils/rpeEngine.js`, `alttezScore.js`, `helpers.js`, `sanitize.js`.

## 5. Archivos y carpetas relacionados con Torneos

Torneos runtime:
- `src/app/torneos/TorneosApp.jsx`: app independiente bajo `/torneos/*`; incluye login/registro inline, layout con sidebar/header, import modal y navegacion interna por `activeModule`.
- `src/app/torneos/store/useTorneosStore.js`: fuente de verdad actual del modulo. Persistencia localStorage con key `alttez-torneos-store`.
- `src/app/torneos/components/wizard/CrearTorneoWizard.jsx`: alta de torneo.
- `src/app/torneos/pages/TorneosListPage.jsx`: listado.
- `src/app/torneos/pages/EquiposPage.jsx`: equipos.
- `src/app/torneos/pages/FixturesPage.jsx`: fixture/resultados.
- `src/app/torneos/pages/EstadisticasPage.jsx`: tabla/estadisticas.
- `src/app/torneos/pages/CalendarioPage.jsx`: configuracion/calendario automatico.
- `src/app/torneos/pages/InicioPage.jsx`: dashboard/welcome.
- `src/app/torneos/pages/AjustesPage.jsx`: ajustes/publicacion.
- `src/app/torneos/components/shared/TorneosSidebar.jsx`, `TorneosHeader.jsx`, `ModuleEmptyState.jsx`.
- `src/app/torneos/utils/fixturesEngine.js`: genera fixtures, grupos, posiciones.
- `src/app/torneos/utils/schedulingEngine.js`: agenda automatica de partidos.

Torneos Supabase previsto:
- `src/app/torneos/services/torneosService.js` referencia `torneos`, `torneo_equipos` y `torneo_partidos`.
- No se encontraron imports de `torneosService.js` desde `src/app/torneos/*`. Hoy parece ser codigo preparado pero no integrado.
- No se encontraron migraciones en `supabase/migrations` que creen `torneos`, `torneo_equipos` o `torneo_partidos`.

## 6. Archivos y carpetas compartidos

Compartidos reales:
- `src/shared/lib/supabase.js`: singleton Supabase compartido por CRM, Torneos y portal RSVP.
- `src/shared/services/authService.js`: usado por CRM y Torneos.
- `src/shared/tokens/palette.js`, `src/shared/tokens/motion.js`: tokens visuales usados por CRM y Torneos.
- `src/shared/ui/*`: primitives y componentes transversales (`Toast`, `ErrorBoundary`, `FieldBackground`, `OfflineBanner`, `UpdateToast`, `WellnessDrawer`, etc.).
- `src/shared/hooks/*`: hooks generales y hooks CRM/offline.
- `src/shared/constants/*`: roles, schemas, estados iniciales, formaciones.
- `src/shared/utils/*`: sanitizacion, RPE, score, helpers.
- `public/branding/*`, `public/icons/*`, PWA assets.

Compartidos con acoplamiento ambiguo:
- `src/shared/auth/LandingPage.jsx` esta en `shared`, pero conceptualmente es auth/landing del CRM y tambien contiene soporte para redireccion a Torneos.
- `src/shared/services/authService.js` sirve a ambos productos, pero `profiles` y `club_id` son CRM-centric.
- `src/shared/ui/WellnessCheckIn.jsx`, `WellnessDrawer.jsx` y `src/shared/types/wellnessTypes.js` son compartidos tecnicamente, pero el dominio es CRM/salud deportiva, no Torneos.

## 7. Uso actual de Supabase

Cliente:
- `src/shared/lib/supabase.js` crea `createClient` con `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`.
- Si faltan variables, `isSupabaseReady` es false y varios flujos caen a localStorage.

Auth:
- `src/shared/services/authService.js` implementa `signUp`, `signIn`, `signOut`, `getSession`, `getUser`, `getProfile`, `linkProfileToClub`, `onAuthStateChange`, `deleteAccount`.
- CRM usa `profiles.club_id` y `profiles.role`.
- Torneos usa Supabase Auth para gatear acceso, pero no se observa carga remota de torneos por usuario.

CRM persistencia:
- `src/shared/services/supabaseService.js` usa `club_id` en memoria/localStorage y opera sobre tablas CRM.
- `src/shared/hooks/useSupabaseSync.js` carga atletas, sesiones, club, stats, pagos y movimientos al montar.
- `src/app/training/Entrenamiento.jsx` llama `syncSession` y `syncHealthSnapshots`.
- `src/app/roster/GestionPlantilla.jsx` importa `insertAthlete`, `bulkInsertAthletes`, `saveTacticalData`.
- `src/app/scheduling/EventPanel.jsx` consulta `event_rsvp`.

Portal publico:
- `src/marketing/pages/ConfirmarAsistencia.jsx` llama RPC `submit_rsvp`.

Torneos:
- `src/app/torneos/TorneosApp.jsx` usa `supabase.auth.getUser()` y `onAuthStateChange`.
- `src/app/torneos/services/torneosService.js` contiene CRUD para `torneos`, `torneo_equipos`, `torneo_partidos`.
- Riesgo: servicio no integrado y schema no versionado.

Supabase Edge Function:
- `supabase/functions/analyze-diagram/index.ts` existe y crea cliente Supabase en Deno. No se encontro referencia desde frontend en la auditoria.

## 8. Tablas de base de datos referenciadas en el codigo

Referenciadas desde codigo frontend:

| Tabla/RPC | Referencias | Estado observado |
|---|---|---|
| `profiles` | `authService.js`, `supabaseService.js` | Existe en `002_auth_profiles_rls.sql`. |
| `clubs` | `supabaseService.js`, `submit_rsvp` valida existencia | Existe en `001_initial_schema.sql`. |
| `athletes` | `supabaseService.js` | Existe; alterada por `004_bulk_upload_athletes.sql`. |
| `bulk_upload_logs` | `supabaseService.js` | Existe en `004_bulk_upload_athletes.sql`. |
| `sessions` | `supabaseService.js` | Existe; `011` agrega `duracion_minutos`. |
| `payments` | `supabaseService.js` | Existe. |
| `movements` | `supabaseService.js` | Existe. |
| `match_stats` | `supabaseService.js` | Existe. |
| `health_snapshots` | `supabaseService.js` | Existe. |
| `tactical_data` | `supabaseService.js` | Existe. |
| `user_sessions` | `supabaseService.js` | Existe, pero parece poco usado actualmente. |
| `event_rsvp` | `EventPanel.jsx`, `ConfirmarAsistencia.jsx` via RPC | Existe en `007_event_rsvp.sql`; escritura anon cerrada por `010`. |
| `wellness_logs` | Migraciones y tipos, no llamadas `.from("wellness_logs")` encontradas | Existe en `008`; no parece integrado a persistencia frontend. |
| `torneos` | `torneosService.js` | Referenciada, pero no existe migracion. |
| `torneo_equipos` | `torneosService.js` | Referenciada, pero no existe migracion. |
| `torneo_partidos` | `torneosService.js` | Referenciada, pero no existe migracion. |
| RPC `create_club_and_link_admin` | `supabaseService.js` | Definida en `001_fix_clubs_rls.sql`. |
| RPC `submit_rsvp` | `ConfirmarAsistencia.jsx` | Definida en `010_rsvp_secure_rpc.sql`. |
| RPC `delete_user` | `authService.js` | Definida en `013_delete_user_rpc.sql`. |

Tablas existentes en migraciones pero con uso incierto/no conectado:
- `services`, `journal_entries`: creadas en `003_portal_services_journal.sql`, pero el portal actual usa datos locales en `src/marketing/data/portalData.js`.
- `user_sessions`: creada para RBAC, pero el runtime actual parece usar Supabase Auth + `profiles`.
- `wellness_logs`: schema y migraciones existen, pero el frontend parece calcular y almacenar wellness por componentes/estado, no via Supabase.

## 9. Componentes, hooks, servicios o paginas que parecen duplicados

Duplicidad o solapamiento real:
- `src/components/ui/*` y `src/shared/ui/*`: dos sistemas de UI paralelos. `src/components/ui` contiene primitives tipo shadcn (`input`, `select`, `card`, `label`, etc.); `src/shared/ui` contiene el sistema visual propio usado por la app.
- `ToastContainer` se monta en `src/App.jsx` y tambien dentro de `src/app/shell/CRMApp.jsx`; puede provocar duplicidad visual/eventos.
- Auth UI duplicada: `src/shared/auth/LandingPage.jsx` para CRM y `TorneosAuthScreen` inline dentro de `src/app/torneos/TorneosApp.jsx`.
- Importacion/carga masiva duplicada conceptualmente: `src/app/roster/BulkAthleteUploader.jsx` para CRM y `ImportModal` inline en Torneos, que aun no implementa import real.
- Calendario duplicado por dominio: `src/app/scheduling/Calendario.jsx` para CRM y `src/app/torneos/pages/CalendarioPage.jsx` para Torneos. No es necesariamente malo, pero debe mantenerse separado por bounded context.
- Datos de salud duplicados conceptualmente: `health_snapshots` en `supabaseService.js`, `wellness_logs` en migraciones/tipos y UI `WellnessDrawer`/`WellnessCheckIn`.
- Documentacion de arquitectura duplicada/desactualizada: `docs/architecture.md`, `docs/architecture.puml`, `docs/repo-structure.md` describen componentes inexistentes o nombres antiguos.

## 10. Archivos que parecen no usados o experimentales

No eliminar todavia; requieren verificacion con build, coverage e import graph formal.

Alta sospecha:
- `src/app/torneos/services/torneosService.js`: no se encontraron imports desde el modulo Torneos; ademas no hay migraciones para sus tablas.
- `supabase/functions/analyze-diagram/index.ts`: no se encontro llamada frontend.
- `src/shared/services/backupService.js` e `importBackupJSON`: export usado en CRM para backup, pero la funcion de import requiere confirmar uso.
- `src/shared/services/migrationService.js`: ejecutado en `App.jsx`, pero conviene auditar si sus migraciones localStorage siguen vigentes.
- `src/shared/services/storageService.js` exporta funciones legacy como `exportBackup`/`importBackup` que se solapan con `backupService.js`.
- `src/shared/ui/index.js`: barrel export; confirmar si consumidores lo usan o si todos importan paths directos.
- `src/components/ui/*`: no se observo uso evidente en las rutas principales durante la auditoria inicial.

Documentacion/artefactos generados:
- `artifacts/audit/*` y `artifacts/screenshots/*`: evidencias visuales, no runtime.
- `mockups aprobados/*`: referencias de diseno, no runtime.
- `docs/architecture.md` y `docs/architecture.puml`: contienen nombres antiguos y referencias no coincidentes con el repo actual (`ServicesSection`, `JournalSection`, `bulkUploadService`, `match_reports`, `calendar_events`).

Scripts posiblemente puntuales:
- `scripts/brand-update.cjs`, `brand-update-v1.1.cjs`, `animate.cjs`, `clean-ui.cjs`, `screenshot.mjs`, `test-algorithms.js`, `validate-data.js`, `check-schema-drift.js`. Deben clasificarse como tooling antes de borrar.

## 11. Riesgos de arquitectura

1. Separacion CRM/Torneos incompleta.
   - Las rutas estan separadas (`/crm/*` y `/torneos/*`), pero comparten auth y Supabase sin un modelo claro de tenant para Torneos.
   - CRM usa `club_id`; Torneos dice usar `organizador_id` en comentario, pero `saveTorneo` no guarda `organizador_id`.

2. Torneos no tiene schema versionado.
   - El codigo referencia `torneos`, `torneo_equipos`, `torneo_partidos`, pero no hay migraciones.
   - Esto impide ambientes reproducibles y despliegue confiable.

3. Persistencia divergente.
   - CRM usa localStorage + Supabase write-through.
   - Torneos usa Zustand persist localStorage y tiene servicio Supabase no integrado.
   - Portal usa datos locales aunque hay tablas `services` y `journal_entries`.

4. RLS historico mezclado.
   - `001_initial_schema.sql` crea policies anon abiertas.
   - `002_auth_profiles_rls.sql` intenta cerrarlas.
   - `001_fix_clubs_rls.sql` tiene numeracion conflictiva y policies/RPC adicionales.
   - Hay riesgo de orden de ejecucion ambiguo por nombres `001_*`.

5. Documentacion no confiable.
   - `docs/repo-structure.md` menciona archivos TSX que no existen.
   - `docs/architecture.md` mantiene referencias a componentes/tablas ausentes.

6. UI y estado compartidos sin frontera de producto.
   - Torneos importa tokens y auth compartidos, pero su modelo de negocio no esta aislado.
   - `shared` contiene cosas que son CRM-specific.

7. Doble montaje de infraestructura UI.
   - `ToastContainer` aparece en App root y CRM shell.
   - Error boundaries existen en root y por modulo; esto esta bien si es intencional, pero debe documentarse.

8. Encoding/legibilidad.
   - Varios archivos muestran mojibake en comentarios/textos (`sesiÃ³n`, `contraseÃ±a`). Esto no siempre rompe runtime, pero degrada mantenibilidad y puede afectar UI.

## 12. Estrategia recomendada de limpieza

Fase 0: congelar cambios funcionales.
- Mantener la regla actual: no mover ni eliminar hasta cerrar inventario.
- Crear una matriz "archivo -> modulo -> estado -> decision".
- Ejecutar build, lint y tests como linea base antes de cualquier limpieza.

Fase 1: definir bounded contexts.
- CRM: todo lo que depende de `club_id`, atletas, sesiones, finanzas, RPE, wellness, tactica.
- Torneos: todo lo que depende de organizador/torneo/equipos/partidos/sedes/arbitros.
- Marketing: portal publico, pricing, producto, contacto, journal.
- Shared: solo infraestructura realmente transversal: auth base, supabase client, UI primitives genericas, tokens.

Fase 2: resolver Supabase Torneos antes de crecer producto.
- Disenar migraciones para `torneos`, `torneo_equipos`, `torneo_partidos`, y decidir si agregar `torneo_sedes`, `torneo_arbitros`, `torneo_categorias`.
- Definir tenant: `organizador_id uuid references auth.users(id)` o `organization_id`.
- Agregar RLS especifico para organizador y politica publica para torneos publicados por slug.
- Integrar `torneosService.js` con `useTorneosStore.js` o reemplazarlo por una capa repository clara.

Fase 3: limpiar documentacion.
- Reemplazar `docs/architecture.md` o marcarlo historico.
- Actualizar `docs/repo-structure.md` con el estado real.
- Mantener este archivo como punto de partida para decisiones.

Fase 4: reducir duplicados sin cambiar comportamiento.
- Elegir un sistema UI principal: `src/shared/ui` o `src/components/ui`.
- Extraer auth compartido real o separar `crm/auth` y `torneos/auth`.
- Decidir si `wellness_logs` reemplaza o complementa `health_snapshots`.
- Revisar `services`/`journal_entries`: usar Supabase o eliminar de modelo futuro.

Fase 5: eliminar/mover con seguridad.
- Solo despues de build/test verde.
- Borrar primero artefactos claramente no runtime si el equipo acepta.
- Para archivos sospechosos, usar PRs pequenos con una sola categoria por PR.
- Cada movimiento debe tener alias/import update y prueba de ruta principal.

## 13. Arquitectura objetivo recomendada

Propuesta de estructura:

```text
src/
|-- app/
|   |-- root/
|   |   `-- App.jsx
|   |-- crm/
|   |   |-- shell/
|   |   |-- dashboard/
|   |   |-- training/
|   |   |-- roster/
|   |   |-- scheduling/
|   |   |-- finance/
|   |   |-- club/
|   |   |-- competition/
|   |   |-- analytics/
|   |   |-- services/
|   |   |-- store/
|   |   `-- types/
|   |-- torneos/
|   |   |-- shell/
|   |   |-- pages/
|   |   |-- components/
|   |   |-- services/
|   |   |-- store/
|   |   |-- utils/
|   |   `-- types/
|   `-- marketing/
|       |-- layout/
|       |-- pages/
|       |-- sections/
|       `-- data/
|-- shared/
|   |-- auth/
|   |-- lib/
|   |-- ui/
|   |-- hooks/
|   |-- tokens/
|   `-- utils/
`-- tests/
    |-- crm/
    |-- torneos/
    |-- marketing/
    `-- shared/
```

Modelo Supabase objetivo:
- CRM:
  - `clubs`, `profiles`, `athletes`, `sessions`, `payments`, `movements`, `match_stats`, `health_snapshots` o `wellness_logs`, `tactical_data`, `event_rsvp`.
  - Tenant principal: `club_id`.
- Torneos:
  - `torneos`, `torneo_equipos`, `torneo_partidos`, `torneo_sedes`, `torneo_arbitros`, opcional `torneo_categorias`.
  - Tenant principal recomendado: `organizador_id` o `organization_id`, no `club_id`.
  - Vista publica por `slug` y `publicado`.
- Marketing:
  - O usar datos estaticos versionados en repo, o conectar formalmente `services` y `journal_entries`; evitar mitad DB/mitad mock.

Regla de frontera:
- `shared` no debe conocer entidades CRM como atletas/sesiones ni entidades Torneos como fixture/equipos.
- CRM puede usar `shared`.
- Torneos puede usar `shared`.
- `shared` no debe importar de `crm` ni de `torneos`.
- Servicios Supabase por dominio: `crm/services/crmRepository.js`, `torneos/services/torneosRepository.js`, y `shared/lib/supabase.js` como unico cliente comun.

Prioridad recomendada:
1. Crear schema/RLS de Torneos o declarar Torneos como 100% local prototype.
2. Actualizar documentacion obsoleta.
3. Separar auth UI de CRM y Torneos.
4. Consolidar UI primitives.
5. Clasificar artefactos y scripts antes de eliminar.
