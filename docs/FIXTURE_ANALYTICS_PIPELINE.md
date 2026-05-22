# Fixture Analytics Pipeline

Fase 3 separa el procesamiento historico del SaaS transaccional. Node.js/Supabase siguen administrando torneos en tiempo real; Airflow, Snowflake y dbt procesan eventos historicos para Performance, Scouting y BI.

## Flujo

1. El motor transaccional escribe eventos en `fixture_state_outbox` y telemetria en `match_events`.
2. Airflow ejecuta `alttez_fixture_events_to_snowflake` cada 10 minutos.
3. El DAG copia eventos crudos a `ALTTEZ_RAW.FIXTURES`.
4. Si la carga del outbox fue exitosa, Airflow marca `fixture_state_outbox.processed_at`.
5. dbt transforma Raw en `ALTTEZ_ANALYTICS.STAGING` y `ALTTEZ_ANALYTICS.MARTS`.

## Archivos

- Airflow DAG: `data/airflow/dags/fixture_outbox_to_snowflake.py`
- Snowflake DDL: `data/warehouse/snowflake/001_setup_fixture_analytics.sql`
- dbt project: `data/dbt`
- Supabase migration: `supabase/migrations/020_fixture_outbox_analytics_events.sql`
- Public views migration: `supabase/migrations/021_public_tournament_views.sql`

## Supabase

Ejecutar primero:

```sql
-- supabase/migrations/020_fixture_outbox_analytics_events.sql
```

Esta migracion permite eventos `competition.*` sin `fixture_id` obligatorio y crea `enqueue_competition_event(...)`.

Ejecutar tambien para blindar la vista publica:

```sql
-- supabase/migrations/021_public_tournament_views.sql
```

Esta migracion crea vistas publicas estrictas para que `PublicTorneo` no lea tablas completas ni metadata interna.

## Snowflake

Ejecutar:

```sql
-- data/warehouse/snowflake/001_setup_fixture_analytics.sql
```

Crea:

- `ALTTEZ_RAW.FIXTURES.fixture_outbox_raw`
- `ALTTEZ_RAW.FIXTURES.match_events_raw`
- `ALTTEZ_RAW.FIXTURES.fixtures_snapshot_raw`
- `ALTTEZ_ANALYTICS.STAGING`
- `ALTTEZ_ANALYTICS.MARTS`

## Airflow

Conexiones requeridas:

- `alttez_postgres`: conexion Postgres/Supabase transaccional.
- `alttez_snowflake`: conexion Snowflake.

Variable opcional:

- `alttez_match_events_last_loaded_at`: watermark incremental para `match_events`.

El outbox usa acknowledge transaccional por `processed_at`. `match_events` usa watermark porque esa tabla no tiene columna `processed_at`.
Durante el piloto no hay cron de retencion: la limpieza de `fixture_state_outbox` procesado se hara manualmente desde consola.

## dbt

Configurar credenciales desde `data/dbt/profiles.example.yml` o variables de entorno:

```bash
SNOWFLAKE_ACCOUNT=...
SNOWFLAKE_USER=...
SNOWFLAKE_PASSWORD=...
SNOWFLAKE_ROLE=TRANSFORMER
SNOWFLAKE_WAREHOUSE=ALTTEZ_TRANSFORM_WH
```

Comandos esperados:

```bash
cd data/dbt
dbt deps
dbt build
```

## Modelos Iniciales

Staging:

- `stg_fixture_outbox`
- `stg_match_events`
- `stg_fixtures`

Dimensiones:

- `dim_tournaments`
- `dim_teams`
- `dim_stages`

Hechos:

- `fct_match_results`
- `fct_tiebreaker_events`
- `fct_round_advancements`
- `fct_team_fair_play`

## Pendientes De Produccion

- Agregar carga de snapshots de `fixtures` desde Postgres hacia `fixtures_snapshot_raw`.
- Persistir eventos `competition.*` desde el motor Node usando `enqueue_competition_event`.
- Definir retention automatica de `fixture_state_outbox` despues del piloto.
- Agregar alertas Airflow por fallas y conteos anormales.
- Conectar marts a BI o API de lectura.
