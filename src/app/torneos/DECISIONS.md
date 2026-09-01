# Decisiones de arquitectura — ALTTEZ Torneos

## ADR-TOR-001 — Selección del backend Supabase canónico

**Estado:** decidido para recuperación; certificación pendiente.

### Contexto

El entorno local observado apunta a `jqqzwcrfbtcyjiuacrjk`, mientras el workflow
de keep-alive declara `rwqqdwlldbegkivqvtwk`. Vercel y el CI general no exponen
un project ref verificable desde el repositorio. Ninguna de estas señales prueba
por sí sola cuál backend es canónico o recuperable.

### Evidencia confirmada

- La aplicación local obtiene URL y clave pública desde variables de entorno.
- El keep-alive declara `rwqqdwlldbegkivqvtwk` y usa un secret separado.
- `project_id = "alttez-project"` identifica el stack CLI local, no un remoto.
- La evidencia histórica sobre ambos proyectos no fue reproducida el
  2026-08-31 y no basta para cerrar la decisión.

### Opciones bajo evaluación

1. Recuperar `jqqzwcrfbtcyjiuacrjk` si conserva el backend operativo.
2. Adoptar `rwqqdwlldbegkivqvtwk` si satisface esquema, datos y seguridad.
3. Crear un ambiente nuevo únicamente después de resolver exportación o
   recuperación y disponer de un baseline reproducible.

### Decisión

`rwqqdwlldbegkivqvtwk` será el ambiente canónico de recuperación y piloto.
Es el único proyecto que resuelve DNS, responde REST y acepta mediante el
keep-alive una consulta autenticada HTTP 200. Esto no lo certifica para campo:
la evidencia histórica indica que solo contiene la infraestructura mínima de
keep-alive y aún debe recibir un baseline probado en staging.

`jqqzwcrfbtcyjiuacrjk` queda descartado como ambiente operativo: el 2026-08-31
no resolvió DNS y todos sus endpoints fallaron incluso usando la clave pública
local correspondiente. No se encontró evidencia de datos recuperables.

Se mantienen bloqueadas las migraciones remotas hasta completar T009–T012.

### Evidencia necesaria para cerrar

Antes de certificar `rwqq…`: acceso administrativo, fingerprint de esquema,
historial de migraciones, conteos no sensibles, estado de Auth/Storage/Functions,
grants/RLS y clasificación explícita como staging o producción.

## ADR-TOR-002 — Reconstrucción del baseline de migraciones

**Estado:** estrategia aceptada; integración bloqueada por ADR-TOR-001.

### Evidencia

La cadena actual falla en base vacía. Una secuencia corregida en memoria logró
aplicar todo el SQL en un harness PostgreSQL Supabase aislado, pero no prueba
equivalencia con Auth/Storage ni con el esquema remoto efectivo.

### Decisión

- No renombrar ni reordenar la historia existente dentro de `migrations/`.
- Conservar la historia legacy completa y auditable.
- Cuando se identifique el remoto canónico, capturar su esquema efectivo y su
  historial `supabase_migrations.schema_migrations` en modo solo lectura.
- Generar un baseline único con timestamp de Supabase desde el estado deseado y
  validado, primero en un workspace o rama aislada.
- Después de adoptar el baseline, cualquier corrección será incremental.

### Gate de integración

Reset limpio con CLI/versión PostgreSQL equivalentes al remoto, diff esperado,
lint/advisors, pruebas A/B/anon, prueba de upgrade sobre staging y plan explícito
de backup/rollback. Un reset verde por sí solo no certifica seguridad.

### Acciones prohibidas

No ejecutar `link`, `push` o `migration repair` remoto; no borrar legacy; no
usar el harness Auth mínimo como sustituto del stack Supabase completo; no fijar
el cast `text/uuid` como contrato definitivo sin decidir el tipo canónico.
