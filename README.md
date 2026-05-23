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
