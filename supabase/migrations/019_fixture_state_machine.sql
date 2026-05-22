-- ============================================================
-- Migration 019: Fixture State Machine + Transactional Core
-- Introduces canonical fixture infrastructure alongside the
-- legacy torneo_partidos table so the app can migrate safely.
-- ============================================================

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'fixture_status') THEN
    CREATE TYPE fixture_status AS ENUM (
      'DRAFT',
      'SCHEDULED',
      'PRE_MATCH',
      'IN_PLAY',
      'COMPLETED'
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'stage_type') THEN
    CREATE TYPE stage_type AS ENUM (
      'LEAGUE',
      'GROUPS',
      'KNOCKOUT',
      'PLAYOFF',
      'FINAL'
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'match_event_type') THEN
    CREATE TYPE match_event_type AS ENUM (
      'GOAL',
      'OWN_GOAL',
      'YELLOW_CARD',
      'RED_CARD',
      'SUBSTITUTION',
      'PENALTY',
      'VAR',
      'INJURY',
      'PERIOD_START',
      'PERIOD_END',
      'STATUS_CHANGE',
      'MANUAL_NOTE'
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'constraint_rule_type') THEN
    CREATE TYPE constraint_rule_type AS ENUM (
      'VENUE_BLOCK',
      'TEAM_AVAILABILITY',
      'MIN_REST_DAYS',
      'MAX_TRAVEL_DISTANCE',
      'HOME_AWAY_BALANCE',
      'BROADCAST_WINDOW',
      'CUSTOM'
    );
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS tournament_stages (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id text NOT NULL REFERENCES torneos(id) ON DELETE CASCADE,
  category_id   text,
  code          text NOT NULL,
  name          text NOT NULL,
  type          stage_type NOT NULL,
  sequence      integer NOT NULL DEFAULT 1,
  config        jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tournament_id, category_id, code)
);

CREATE TABLE IF NOT EXISTS fixtures (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id    text NOT NULL REFERENCES torneos(id) ON DELETE CASCADE,
  stage_id         uuid NOT NULL REFERENCES tournament_stages(id) ON DELETE CASCADE,
  category_id      text,
  legacy_match_id  text UNIQUE,
  round_number     integer,
  leg_number       integer NOT NULL DEFAULT 1,
  group_label      text,
  source           text NOT NULL DEFAULT 'engine',
  home_team_id     text,
  away_team_id     text,
  scheduled_at     timestamptz,
  venue_id         uuid,
  referee_id       uuid,
  status           fixture_status NOT NULL DEFAULT 'DRAFT',
  home_score       integer,
  away_score       integer,
  order_index      integer NOT NULL DEFAULT 0,
  metadata         jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now(),
  CHECK (home_team_id IS NULL OR away_team_id IS NULL OR home_team_id <> away_team_id),
  CHECK (
    (status <> 'COMPLETED')
    OR (home_score IS NOT NULL AND away_score IS NOT NULL)
  )
);

CREATE TABLE IF NOT EXISTS match_events (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  fixture_id     uuid NOT NULL REFERENCES fixtures(id) ON DELETE CASCADE,
  tournament_id  text NOT NULL REFERENCES torneos(id) ON DELETE CASCADE,
  team_id        text,
  player_id      text,
  related_player_id text,
  type           match_event_type NOT NULL,
  minute         integer CHECK (minute IS NULL OR minute >= 0),
  period         text,
  payload        jsonb NOT NULL DEFAULT '{}'::jsonb,
  occurred_at    timestamptz NOT NULL DEFAULT now(),
  created_at     timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS constraint_rules (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id  text NOT NULL REFERENCES torneos(id) ON DELETE CASCADE,
  stage_id       uuid REFERENCES tournament_stages(id) ON DELETE CASCADE,
  team_id        text,
  venue_id       uuid,
  type           constraint_rule_type NOT NULL,
  priority       integer NOT NULL DEFAULT 100,
  is_hard        boolean NOT NULL DEFAULT true,
  enabled        boolean NOT NULL DEFAULT true,
  rule           jsonb NOT NULL DEFAULT '{}'::jsonb,
  description    text,
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS fixture_state_outbox (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  fixture_id     uuid NOT NULL REFERENCES fixtures(id) ON DELETE CASCADE,
  tournament_id  text NOT NULL REFERENCES torneos(id) ON DELETE CASCADE,
  event_type     text NOT NULL,
  previous_status fixture_status,
  next_status    fixture_status NOT NULL,
  payload        jsonb NOT NULL DEFAULT '{}'::jsonb,
  processed_at   timestamptz,
  created_at     timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_tournament_stages_tournament
  ON tournament_stages (tournament_id, sequence);

CREATE INDEX IF NOT EXISTS idx_fixtures_tournament_status
  ON fixtures (tournament_id, status, scheduled_at);

CREATE INDEX IF NOT EXISTS idx_fixtures_stage_order
  ON fixtures (stage_id, round_number, order_index);

CREATE INDEX IF NOT EXISTS idx_match_events_fixture
  ON match_events (fixture_id, occurred_at);

CREATE INDEX IF NOT EXISTS idx_constraint_rules_tournament
  ON constraint_rules (tournament_id, enabled, priority);

CREATE INDEX IF NOT EXISTS idx_fixture_state_outbox_pending
  ON fixture_state_outbox (processed_at, created_at)
  WHERE processed_at IS NULL;

CREATE OR REPLACE FUNCTION set_fixture_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION emit_fixture_status_event()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO fixture_state_outbox (
      fixture_id,
      tournament_id,
      event_type,
      previous_status,
      next_status,
      payload
    )
    VALUES (
      NEW.id,
      NEW.tournament_id,
      CASE
        WHEN NEW.status = 'COMPLETED' THEN 'fixture.completed'
        ELSE 'fixture.status_changed'
      END,
      OLD.status,
      NEW.status,
      jsonb_build_object(
        'homeTeamId', NEW.home_team_id,
        'awayTeamId', NEW.away_team_id,
        'homeScore', NEW.home_score,
        'awayScore', NEW.away_score,
        'scheduledAt', NEW.scheduled_at,
        'stageId', NEW.stage_id
      )
    );
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_tournament_stages_updated_at ON tournament_stages;
CREATE TRIGGER trg_tournament_stages_updated_at
BEFORE UPDATE ON tournament_stages
FOR EACH ROW EXECUTE FUNCTION set_fixture_updated_at();

DROP TRIGGER IF EXISTS trg_fixtures_updated_at ON fixtures;
CREATE TRIGGER trg_fixtures_updated_at
BEFORE UPDATE ON fixtures
FOR EACH ROW EXECUTE FUNCTION set_fixture_updated_at();

DROP TRIGGER IF EXISTS trg_constraint_rules_updated_at ON constraint_rules;
CREATE TRIGGER trg_constraint_rules_updated_at
BEFORE UPDATE ON constraint_rules
FOR EACH ROW EXECUTE FUNCTION set_fixture_updated_at();

DROP TRIGGER IF EXISTS trg_fixture_status_event ON fixtures;
CREATE TRIGGER trg_fixture_status_event
AFTER UPDATE ON fixtures
FOR EACH ROW EXECUTE FUNCTION emit_fixture_status_event();

-- Legacy bridge: keep existing torneo_partidos usable while exposing
-- a typed status for new transactional reads.
ALTER TABLE torneo_partidos
  ADD COLUMN IF NOT EXISTS status fixture_status NOT NULL DEFAULT 'DRAFT',
  ADD COLUMN IF NOT EXISTS fixture_id uuid REFERENCES fixtures(id) ON DELETE SET NULL;

UPDATE torneo_partidos
SET status = CASE estado
  WHEN 'finalizado' THEN 'COMPLETED'::fixture_status
  WHEN 'en_curso' THEN 'IN_PLAY'::fixture_status
  WHEN 'programado' THEN 'SCHEDULED'::fixture_status
  WHEN 'propuesto' THEN 'DRAFT'::fixture_status
  WHEN 'aplazado' THEN 'DRAFT'::fixture_status
  ELSE 'DRAFT'::fixture_status
END
WHERE status = 'DRAFT'::fixture_status;

CREATE INDEX IF NOT EXISTS idx_torneo_partidos_status
  ON torneo_partidos (torneo_id, status);

ALTER TABLE tournament_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE fixtures ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE constraint_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE fixture_state_outbox ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read access for tournament_stages" ON tournament_stages;
CREATE POLICY "Public read access for tournament_stages"
  ON tournament_stages FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Users can manage their own tournament_stages" ON tournament_stages;
CREATE POLICY "Users can manage their own tournament_stages"
  ON tournament_stages FOR ALL
  USING (tournament_id IN (SELECT id FROM torneos WHERE organizador_id = auth.uid()))
  WITH CHECK (tournament_id IN (SELECT id FROM torneos WHERE organizador_id = auth.uid()));

DROP POLICY IF EXISTS "Public read access for fixtures" ON fixtures;
CREATE POLICY "Public read access for fixtures"
  ON fixtures FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Users can manage their own fixtures" ON fixtures;
CREATE POLICY "Users can manage their own fixtures"
  ON fixtures FOR ALL
  USING (tournament_id IN (SELECT id FROM torneos WHERE organizador_id = auth.uid()))
  WITH CHECK (tournament_id IN (SELECT id FROM torneos WHERE organizador_id = auth.uid()));

DROP POLICY IF EXISTS "Public read access for match_events" ON match_events;
CREATE POLICY "Public read access for match_events"
  ON match_events FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Users can manage their own match_events" ON match_events;
CREATE POLICY "Users can manage their own match_events"
  ON match_events FOR ALL
  USING (tournament_id IN (SELECT id FROM torneos WHERE organizador_id = auth.uid()))
  WITH CHECK (tournament_id IN (SELECT id FROM torneos WHERE organizador_id = auth.uid()));

DROP POLICY IF EXISTS "Users can manage their own constraint_rules" ON constraint_rules;
CREATE POLICY "Users can manage their own constraint_rules"
  ON constraint_rules FOR ALL
  USING (tournament_id IN (SELECT id FROM torneos WHERE organizador_id = auth.uid()))
  WITH CHECK (tournament_id IN (SELECT id FROM torneos WHERE organizador_id = auth.uid()));

DROP POLICY IF EXISTS "Users can read their own fixture_state_outbox" ON fixture_state_outbox;
CREATE POLICY "Users can read their own fixture_state_outbox"
  ON fixture_state_outbox FOR SELECT
  USING (tournament_id IN (SELECT id FROM torneos WHERE organizador_id = auth.uid()));
