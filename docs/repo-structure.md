# Repo Structure

## Runtime activo

- Entrada visible hoy: `index.html` -> `src/main.jsx` -> `src/App.jsx`
- Ruta paralela en TypeScript: `src/main.tsx` -> `src/App.tsx`
- Mientras exista esa duplicidad, cualquier cambio visual o funcional debe validarse primero sobre la ruta `jsx`.

## Mapa actual del proyecto

```text
.
|-- docs/
|   |-- architecture.md
|   `-- repo-structure.md
|-- public/
|   |-- icons/
|   |-- manifest.json
|   `-- offline.html
|-- scripts/
|-- src/
|   |-- app/
|   |   |-- analytics/
|   |   |   `-- Reportes.jsx
|   |   |-- club/
|   |   |   `-- MiClub.jsx
|   |   |-- competition/
|   |   |   `-- MatchCenter.jsx
|   |   |-- dashboard/
|   |   |   |-- assets/
|   |   |   `-- Home.jsx
|   |   |-- experience/
|   |   |   `-- KioskMode.jsx
|   |   |-- finance/
|   |   |   `-- Administracion.jsx
|   |   |-- roster/
|   |   |   |-- BulkAthleteUploader.jsx
|   |   |   |-- GestionPlantilla.jsx
|   |   |   `-- TacticalBoard/
|   |   |-- scheduling/
|   |   |   `-- Calendario.jsx
|   |   |-- shell/
|   |   |   |-- CRMApp.jsx
|   |   |   |-- DemoGate.jsx
|   |   |   `-- MiniTopbar.jsx
|   |   `-- training/
|   |       |-- Entrenamiento.jsx
|   |       `-- Planificacion.jsx
|   |-- components/
|   |   |-- landing/
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
|   |-- tests/
|   |   |-- auth/
|   |   |-- crm/
|   |   `-- shared/
|   |-- App.jsx
|   |-- App.tsx
|   |-- index.css
|   |-- main.jsx
|   `-- main.tsx
|-- supabase/
|   |-- functions/
|   `-- migrations/
|-- vite.config.js
`-- vite.config.ts
```

## Organizacion por areas

- `src/app/`
  - Nucleo del CRM y flujos internos del producto.
  - Se reorganizo por dominios del negocio para reemplazar el antiguo bloque unico `modules/`.

- `src/app/shell/`
  - Orquestacion del CRM.
  - `CRMApp.jsx` resuelve sesion, auth, guards y carga lazy de modulos.

- `src/app/dashboard/`
  - Home principal del CRM.
  - Sus imagenes quedaron localizadas en `dashboard/assets/` porque solo las consume esa vista.

- `src/app/training/`
  - Experiencia de entrenamiento y planificacion.
  - Contiene `Entrenamiento.jsx` y `Planificacion.jsx`.

- `src/app/roster/`
  - Gestion de plantilla y herramientas tacticas.
  - Contiene `GestionPlantilla.jsx`, `BulkAthleteUploader.jsx` y `TacticalBoard/`.

- `src/app/scheduling/`
  - Agenda operativa y calendario.

- `src/app/finance/`
  - Administracion financiera y mensualidades.

- `src/app/club/`
  - Configuracion y datos del club.

- `src/app/competition/`
  - Flujo competitivo y analisis post-partido.

- `src/app/analytics/`
  - Reportes y KPIs del CRM.

- `src/app/experience/`
  - Experiencias derivadas o de soporte, como `KioskMode`.

- `src/marketing/`
  - Portal publico.
  - La landing activa vive en la ruta `jsx`, especialmente:
  - `layout/PortalLayout.jsx`
  - `pages/PortalHome.jsx`
  - `sections/HeroSection.jsx`
  - `theme/brand.js`
  - `theme/brand.js` centraliza la paleta, gradientes y tono visual del rebrand `ALTTEZ`.

- `src/shared/`
  - Capa transversal del proyecto: store, servicios, hooks, auth, UI y utilidades reutilizables.

- `src/components/`
  - Componentes de interfaz desacoplados del dominio.
  - Util para piezas reusables que no pertenecen directamente a `marketing` ni a `app`.

- `src/tests/`
  - Tests agrupados por categoria:
  - `auth/`
  - `crm/`
  - `shared/`

## Decisiones de reestructuracion ya aplicadas

- Se elimino el patron anterior `src/app/modules/` como carpeta operativa principal.
- Se movieron los modulos del CRM a carpetas por dominio.
- Se movieron los tests desde `src/__tests__/` a `src/tests/`.
- Se movieron assets locales del dashboard a `src/app/dashboard/assets/`.
- `CRMApp.jsx` ya apunta a la nueva estructura por dominios.
- El portal publico activo se esta consolidando sobre una capa visual compartida en `src/marketing/theme/`.
- Las paginas publicas prioritarias del rebrand quedaron concentradas en:
  - `src/marketing/layout/PortalLayout.jsx`
  - `src/marketing/sections/HeroSection.jsx`
  - `src/marketing/sections/EcosystemSection.jsx`
  - `src/marketing/pages/SportsCRMPage.jsx`
  - `src/marketing/pages/QuienesSomos.jsx`
  - `src/marketing/pages/Contacto.jsx`
  - `src/marketing/pages/ConfirmarAsistencia.jsx`
  - `src/marketing/pages/JournalPage.jsx`

## Riesgos todavia abiertos

- Sigue existiendo duplicidad entre:
  - `src/main.jsx` y `src/main.tsx`
  - `src/App.jsx` y `src/App.tsx`
  - `vite.config.js` y `vite.config.ts`
- La rama `tsx` todavia no es la fuente de verdad del runtime actual.
- El rebranding visual del marketing debe ejecutarse primero sobre la ruta `jsx`, no sobre la `tsx`.

## Regla para futuros movimientos

- Si un archivo solo lo usa un modulo, debe vivir dentro de ese dominio.
- Si un archivo lo usan varias areas del producto, debe vivir en `src/shared/` o `src/components/`.
- No conviene mover `index.html`, `src/main.jsx`, `src/App.jsx` ni consolidar la rama `tsx` sin una fase dedicada y verificada.
