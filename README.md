# ALTTEZ

Repositorio privado del ecosistema operativo deportivo ALTTEZ.

## Desarrollo Local

1. Instala dependencias:

   ```bash
   npm install
   ```

2. Crea `.env` desde `.env.example` y completa las variables `NEXT_PUBLIC_*`.

3. Inicia Next.js:

   ```bash
   npm run dev:local
   ```

   Si Turbopack presenta problemas en Windows, usa:

   ```bash
   npm run dev:webpack
   ```

## Comandos

- `npm run dev` - Servidor Next.js de desarrollo.
- `npm run dev:local` - Next.js en `127.0.0.1:3000`.
- `npm run dev:webpack` - Desarrollo con Webpack como fallback.
- `npm run build` - Build de produccion.
- `npm run start` - Servir el build de produccion.
- `npm run lint` - ESLint.

## Rutas Principales

- `/` - Landing ALTTEZ.
- `/auth/login`, `/auth/register`, `/auth/recover` - Autenticacion.
- `/crm` y `/crm/<modulo>` - ALTTEZ CRM.
- `/torneos` - ALTTEZ Torneos.
- `/t/[slug]` y `/t/[slug]/registro-equipo/[equipoId]` - Portal publico de torneos.
- `/propuesta/[id]` y `/propuestas/[id]` - Propuestas comerciales.
- `/confirmar/[clubId]/[eventId]` - Confirmacion publica de asistencia.

Consulta [AGENTS.md](./AGENTS.md) para reglas de trabajo con agentes.

## Principios del Proyecto

Las reglas operativas inamovibles del repositorio viven en
[`.specify/memory/constitution.md`](./.specify/memory/constitution.md). Cualquier
spec, plan o implementacion nueva debe alinearse con esa constitucion antes de
expandir arquitectura, estilos o tooling.

## Mapa vigente del repositorio

Las carpetas rastreadas y necesarias para el producto son:

- .github/: CI, build y seguridad.
- .specify/: constitucion, especificaciones y automatizacion de trabajo.
- data/: pipeline analítico aislado de Airflow, dbt y Snowflake; actualmente no lo ejecuta la aplicación.
- public/: activos PWA, marca y service worker de produccion.
- src/: rutas Next.js, CRM, torneos, marketing, UI compartida, servicios y pruebas.
- supabase/: migraciones, configuracion y Edge Functions.

Las carpetas locales de agentes, herramientas, artefactos, documentacion interna y dependencias se mantienen fuera de Git mediante .gitignore.
