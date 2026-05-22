"""
ALTTEZ fixture analytics ELT.

Extracts unprocessed transactional events from Supabase/Postgres, lands
them unchanged in Snowflake RAW, then acknowledges processed rows.

Required Airflow connections:
- alttez_postgres: Postgres connection to the transactional database.
- alttez_snowflake: Snowflake connection.
"""

from __future__ import annotations

import json
from datetime import datetime, timedelta

from airflow import DAG
from airflow.models import Variable
from airflow.operators.python import PythonOperator
from airflow.providers.postgres.hooks.postgres import PostgresHook
from airflow.providers.snowflake.hooks.snowflake import SnowflakeHook


POSTGRES_CONN_ID = "alttez_postgres"
SNOWFLAKE_CONN_ID = "alttez_snowflake"
OUTBOX_BATCH_SIZE = 1_000
MATCH_EVENTS_BATCH_SIZE = 5_000
MATCH_EVENTS_WATERMARK_KEY = "alttez_match_events_last_loaded_at"


def _json(value):
  return json.dumps(value or {}, default=str, ensure_ascii=False)


def extract_load_outbox(**_context):
  postgres = PostgresHook(postgres_conn_id=POSTGRES_CONN_ID)
  snowflake = SnowflakeHook(snowflake_conn_id=SNOWFLAKE_CONN_ID)

  rows = postgres.get_records(
    """
    SELECT
      id::text,
      fixture_id::text,
      tournament_id::text,
      event_type,
      previous_status::text,
      next_status::text,
      payload,
      created_at
    FROM fixture_state_outbox
    WHERE processed_at IS NULL
    ORDER BY created_at ASC
    LIMIT %s
    """,
    parameters=(OUTBOX_BATCH_SIZE,),
  )

  if not rows:
    return {"loaded": 0}

  snowflake_rows = [
    (
      row[0],
      row[1],
      row[2],
      row[3],
      row[4],
      row[5],
      _json(row[6]),
      row[7],
    )
    for row in rows
  ]

  snowflake.run("USE DATABASE ALTTEZ_RAW")
  snowflake.run("USE SCHEMA FIXTURES")
  snowflake.run(
    """
    CREATE TEMPORARY TABLE IF NOT EXISTS fixture_outbox_stage (
      event_id string,
      fixture_id string,
      tournament_id string,
      event_type string,
      previous_status string,
      next_status string,
      payload string,
      source_created_at timestamp_tz
    )
    """
  )
  snowflake.insert_rows(
    table="fixture_outbox_stage",
    rows=snowflake_rows,
    target_fields=[
      "event_id",
      "fixture_id",
      "tournament_id",
      "event_type",
      "previous_status",
      "next_status",
      "payload",
      "source_created_at",
    ],
  )
  snowflake.run(
    """
    MERGE INTO fixture_outbox_raw AS target
    USING fixture_outbox_stage AS source
      ON target.event_id = source.event_id
    WHEN NOT MATCHED THEN INSERT (
      event_id,
      fixture_id,
      tournament_id,
      event_type,
      previous_status,
      next_status,
      payload,
      source_created_at,
      loaded_at
    ) VALUES (
      source.event_id,
      source.fixture_id,
      source.tournament_id,
      source.event_type,
      source.previous_status,
      source.next_status,
      TRY_PARSE_JSON(source.payload),
      source.source_created_at,
      CURRENT_TIMESTAMP()
    )
    """
  )

  ids = [row[0] for row in rows]
  postgres.run(
    """
    UPDATE fixture_state_outbox
    SET processed_at = NOW()
    WHERE id = ANY(%s::uuid[])
    """,
    parameters=(ids,),
  )

  return {"loaded": len(rows)}


def extract_load_match_events(**_context):
  postgres = PostgresHook(postgres_conn_id=POSTGRES_CONN_ID)
  snowflake = SnowflakeHook(snowflake_conn_id=SNOWFLAKE_CONN_ID)
  watermark = Variable.get(MATCH_EVENTS_WATERMARK_KEY, default_var="1970-01-01T00:00:00+00:00")

  rows = postgres.get_records(
    """
    SELECT
      id::text,
      fixture_id::text,
      tournament_id::text,
      team_id::text,
      player_id,
      related_player_id,
      type::text,
      minute,
      period,
      payload,
      occurred_at,
      created_at
    FROM match_events
    WHERE created_at > %s::timestamptz
    ORDER BY created_at ASC
    LIMIT %s
    """,
    parameters=(watermark, MATCH_EVENTS_BATCH_SIZE),
  )

  if not rows:
    return {"loaded": 0}

  snowflake_rows = [
    (
      row[0],
      row[1],
      row[2],
      row[3],
      row[4],
      row[5],
      row[6],
      row[7],
      row[8],
      _json(row[9]),
      row[10],
      row[11],
    )
    for row in rows
  ]

  snowflake.run("USE DATABASE ALTTEZ_RAW")
  snowflake.run("USE SCHEMA FIXTURES")
  snowflake.run(
    """
    CREATE TEMPORARY TABLE IF NOT EXISTS match_events_stage (
      event_id string,
      fixture_id string,
      tournament_id string,
      team_id string,
      player_id string,
      related_player_id string,
      event_type string,
      minute number,
      period string,
      payload string,
      occurred_at timestamp_tz,
      source_created_at timestamp_tz
    )
    """
  )
  snowflake.insert_rows(
    table="match_events_stage",
    rows=snowflake_rows,
    target_fields=[
      "event_id",
      "fixture_id",
      "tournament_id",
      "team_id",
      "player_id",
      "related_player_id",
      "event_type",
      "minute",
      "period",
      "payload",
      "occurred_at",
      "source_created_at",
    ],
  )
  snowflake.run(
    """
    MERGE INTO match_events_raw AS target
    USING match_events_stage AS source
      ON target.event_id = source.event_id
    WHEN NOT MATCHED THEN INSERT (
      event_id,
      fixture_id,
      tournament_id,
      team_id,
      player_id,
      related_player_id,
      event_type,
      minute,
      period,
      payload,
      occurred_at,
      source_created_at,
      loaded_at
    ) VALUES (
      source.event_id,
      source.fixture_id,
      source.tournament_id,
      source.team_id,
      source.player_id,
      source.related_player_id,
      source.event_type,
      source.minute,
      source.period,
      TRY_PARSE_JSON(source.payload),
      source.occurred_at,
      source.source_created_at,
      CURRENT_TIMESTAMP()
    )
    """
  )

  last_created_at = max(row[11] for row in rows)
  Variable.set(MATCH_EVENTS_WATERMARK_KEY, last_created_at.isoformat())
  return {"loaded": len(rows), "watermark": last_created_at.isoformat()}


with DAG(
  dag_id="alttez_fixture_events_to_snowflake",
  description="Load fixture outbox and match events from Postgres into Snowflake RAW.",
  start_date=datetime(2026, 1, 1),
  schedule="*/10 * * * *",
  catchup=False,
  max_active_runs=1,
  default_args={
    "owner": "alttez-data",
    "retries": 2,
    "retry_delay": timedelta(minutes=3),
  },
  tags=["alttez", "fixtures", "analytics", "elt"],
) as dag:
  load_outbox = PythonOperator(
    task_id="extract_load_fixture_outbox",
    python_callable=extract_load_outbox,
  )

  load_match_events = PythonOperator(
    task_id="extract_load_match_events",
    python_callable=extract_load_match_events,
  )

  [load_outbox, load_match_events]
