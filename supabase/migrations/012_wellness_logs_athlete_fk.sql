-- Migration 012: Fix wellness_logs.athlete_id type mismatch and add FK
-- Problem: wellness_logs.athlete_id was TEXT, athletes.id is BIGINT — no FK enforced.
-- Risk: orphan wellness records when athlete is deleted.
-- Fix: cast column to BIGINT and add FK with ON DELETE CASCADE.

-- Step 1: Cast existing data (empty or text integers) to BIGINT
ALTER TABLE wellness_logs
  ALTER COLUMN athlete_id TYPE bigint USING athlete_id::bigint;

-- Step 2: Add FK constraint with cascade delete
ALTER TABLE wellness_logs
  ADD CONSTRAINT wellness_logs_athlete_id_fkey
  FOREIGN KEY (athlete_id) REFERENCES athletes(id) ON DELETE CASCADE;

-- Step 3: Index for lookup by athlete
CREATE INDEX IF NOT EXISTS idx_wellness_logs_athlete_id
  ON wellness_logs (athlete_id);
