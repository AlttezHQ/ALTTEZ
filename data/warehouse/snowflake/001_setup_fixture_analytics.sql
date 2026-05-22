-- ============================================================
-- ALTTEZ Fixture Analytics Warehouse Setup
-- Run with a Snowflake role that can create databases/schemas.
-- ============================================================

CREATE DATABASE IF NOT EXISTS ALTTEZ_RAW;
CREATE DATABASE IF NOT EXISTS ALTTEZ_ANALYTICS;

CREATE SCHEMA IF NOT EXISTS ALTTEZ_RAW.FIXTURES;
CREATE SCHEMA IF NOT EXISTS ALTTEZ_ANALYTICS.STAGING;
CREATE SCHEMA IF NOT EXISTS ALTTEZ_ANALYTICS.MARTS;

CREATE TABLE IF NOT EXISTS ALTTEZ_RAW.FIXTURES.fixture_outbox_raw (
  event_id string NOT NULL,
  fixture_id string,
  tournament_id string,
  event_type string NOT NULL,
  previous_status string,
  next_status string,
  payload variant,
  source_created_at timestamp_tz,
  loaded_at timestamp_tz DEFAULT CURRENT_TIMESTAMP(),
  CONSTRAINT pk_fixture_outbox_raw PRIMARY KEY (event_id)
);

CREATE TABLE IF NOT EXISTS ALTTEZ_RAW.FIXTURES.match_events_raw (
  event_id string NOT NULL,
  fixture_id string NOT NULL,
  tournament_id string NOT NULL,
  team_id string,
  player_id string,
  related_player_id string,
  event_type string NOT NULL,
  minute number,
  period string,
  payload variant,
  occurred_at timestamp_tz,
  source_created_at timestamp_tz,
  loaded_at timestamp_tz DEFAULT CURRENT_TIMESTAMP(),
  CONSTRAINT pk_match_events_raw PRIMARY KEY (event_id)
);

CREATE TABLE IF NOT EXISTS ALTTEZ_RAW.FIXTURES.fixtures_snapshot_raw (
  fixture_id string NOT NULL,
  tournament_id string NOT NULL,
  stage_id string,
  category_id string,
  round_number number,
  leg_number number,
  group_label string,
  home_team_id string,
  away_team_id string,
  scheduled_at timestamp_tz,
  status string,
  home_score number,
  away_score number,
  metadata variant,
  source_updated_at timestamp_tz,
  loaded_at timestamp_tz DEFAULT CURRENT_TIMESTAMP(),
  CONSTRAINT pk_fixtures_snapshot_raw PRIMARY KEY (fixture_id)
);

CREATE OR REPLACE VIEW ALTTEZ_RAW.FIXTURES.v_pending_fixture_outbox AS
SELECT *
FROM ALTTEZ_RAW.FIXTURES.fixture_outbox_raw
WHERE loaded_at >= DATEADD(day, -30, CURRENT_TIMESTAMP());
