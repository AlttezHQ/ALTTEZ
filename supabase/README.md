# Backend transaccional (`supabase`)

Contiene la configuración local, las migraciones Postgres y las Edge Functions.
Es el backend transaccional de ALTTEZ.

| Carpeta/archivo | Responsabilidad |
|---|---|
| `config.toml` | Configuración local de Supabase |
| `migrations/` | Historia ejecutable del esquema |
| `functions/` | Edge Functions desplegables |

## Reglas obligatorias

- No ejecutar migraciones actuales en un ambiente remoto hasta reconstruir y
  verificar un baseline reproducible.
- Una versión de migración debe ser única y ordenable.
- Toda tabla expuesta debe declarar grants mínimos y RLS.
- Roles y tenants no se autorizan desde `raw_user_meta_data`.
- RPC privilegiadas deben tener ownership explícito, permisos mínimos y
  `search_path` seguro.
- Todo cambio se prueba primero contra un ambiente vacío y después en staging.
- Nunca incluir claves, URLs privadas o datos reales en esta carpeta.

La situación vigente del baseline y de los ambientes debe resolverse antes de
usar datos reales en ALTTEZ Torneos.

## Auditoría de bootstrap — 2026-08-31

T010 quedó cerrada como auditoría fallida. Se habilitó Docker Desktop y se validó Supabase CLI
`2.116.0` desde el release oficial para Windows (SHA-256
`4A83F0EBCEC759785749A266BB788EC0787EF05252EF1B4A9FF07798C70535C4`). La
inspección estática encontró:

- dos migraciones con versión `001`;
- `001_fix_clubs_rls.sql` altera `clubs` antes del esquema inicial;
- `001_initial_schema.sql` comienza con `D--`, texto SQL inválido;
- migraciones `014`–`021` dependen de tablas creadas en `022`;
- `[db.seed]` referencia `./seed.sql`, pero el archivo no existe.

Estos hallazgos justifican preparar T011, pero no autorizan todavía reordenar o
reescribir la historia. T014 también queda abierta hasta reproducir el primer
fallo mediante la CLI.

### Resultado de ejecución

1. El primer `supabase start` desde la raíz falló antes de Docker: `.env`
   contiene BOM y la CLI lo interpreta como carácter inválido en el nombre de
   la primera variable. No se modificó el archivo ni se expusieron sus valores.
2. Se copió `supabase/` a un workspace aislado dentro de `artifacts/`, sin `.env`.
3. La CLI aceptó la configuración y advirtió que `[inbucket]` está deprecado en
   favor de `[local_smtp]`.
4. Docker descargó PostgREST, pero la imagen de PostgreSQL `17.6.1.165` dejó de
   mostrar progreso en dos intentos. Ambos se detuvieron sin iniciar contenedores
   ni alcanzar la ejecución SQL.

Después se ejecutó una auditoría complementaria en un contenedor nuevo basado
en la imagen Supabase PostgreSQL `17.6.1.156`, ya disponible localmente. Las
migraciones se montaron en solo lectura y no se tocaron otros contenedores.

Resultados reproducidos con `ON_ERROR_STOP=1`:

- el orden de archivos falla primero en `001_fix_clubs_rls.sql:14` porque
  `clubs` todavía no existe;
- `001_initial_schema.sql:25` falla en `D--`;
- después de corregir ese carácter en memoria, el esquema inicial se aplica;
- el fix de clubs debe ejecutarse después de `002_auth_profiles_rls.sql` porque
  también depende de `profiles`;
- al adelantar `022` antes de `014`–`021`, la siguiente incompatibilidad aparece
  en `019_fixture_state_machine.sql:265`: compara `text = uuid`;
- aplicando en memoria el mismo cast ya usado por `022`
  (`organizador_id::text = auth.uid()::text`), la secuencia completa llega hasta
  `023` sin otro error SQL.

La secuencia candidata probada fue: esquema inicial, `002`, fix de clubs,
`003`–`013`, `017`, `018`, `022`, `014`–`016`, `019`–`021` y `023`.

Esto confirma que la cadena versionada falla en una base vacía. La prueba con
`17.6.1.156` es suficiente para localizar incompatibilidades SQL, pero la
certificación final exige repetirla con el stack CLI fijado `17.6.1.165`.

### Procedimiento local pendiente

1. Registrar versiones con `supabase --version` y `docker version`.
2. Consultar `--help` para `start`, `db reset`, `migration list` y `db lint`.
3. Iniciar Docker Desktop y ejecutar el stack desde la raíz del repositorio.
4. Ejecutar explícitamente el reset local y conservar el primer error completo.
5. Preparar el baseline corregido en una rama aislada y repetir hasta un reset
   limpio, sin `link`, `push` ni flags remotos.
6. Ejecutar lista de migraciones, lint/advisors disponibles y pruebas A/B/anon.
