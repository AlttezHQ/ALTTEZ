-- ============================================================
-- Migration 020: Generic analytics events in fixture outbox
-- Allows competition.* events that are not tied to a single
-- fixture status transition.
-- ============================================================

ALTER TABLE fixture_state_outbox
  ALTER COLUMN fixture_id DROP NOT NULL,
  ALTER COLUMN next_status DROP NOT NULL;

CREATE INDEX IF NOT EXISTS idx_fixture_state_outbox_event_type
  ON fixture_state_outbox (event_type, created_at);

CREATE OR REPLACE FUNCTION enqueue_competition_event(
  p_tournament_id text,
  p_event_type text,
  p_payload jsonb DEFAULT '{}'::jsonb,
  p_fixture_id uuid DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_event_id uuid;
BEGIN
  INSERT INTO fixture_state_outbox (
    fixture_id,
    tournament_id,
    event_type,
    previous_status,
    next_status,
    payload
  )
  VALUES (
    p_fixture_id,
    p_tournament_id,
    p_event_type,
    NULL,
    NULL,
    COALESCE(p_payload, '{}'::jsonb)
  )
  RETURNING id INTO v_event_id;

  RETURN v_event_id;
END;
$$;
