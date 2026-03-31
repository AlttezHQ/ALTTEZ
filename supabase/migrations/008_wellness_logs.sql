-- MIGRATION 008: Create wellness_logs table with RLS
-- Ejecutar en Supabase SQL Editor DESPUÉS de 001_fix_clubs_rls.sql

-- 1. Crear tabla
CREATE TABLE IF NOT EXISTS wellness_logs (
  id           UUID    DEFAULT gen_random_uuid() PRIMARY KEY,
  club_id      TEXT    NOT NULL,
  athlete_id   TEXT    NOT NULL,
  logged_at    TIMESTAMPTZ DEFAULT now() NOT NULL,
  sleep_quality SMALLINT CHECK (sleep_quality BETWEEN 1 AND 5) NOT NULL,
  fatigue_level SMALLINT CHECK (fatigue_level BETWEEN 1 AND 5) NOT NULL,
  stress_level  SMALLINT CHECK (stress_level  BETWEEN 1 AND 5) NOT NULL,
  doms_level    SMALLINT CHECK (doms_level    BETWEEN 1 AND 5) NOT NULL,
  notes        TEXT,
  wellness_score NUMERIC(5,2)
);

-- 2. Índice de consulta por club + atleta + fecha
CREATE INDEX IF NOT EXISTS idx_wellness_club_athlete
  ON wellness_logs(club_id, athlete_id, logged_at DESC);

-- 3. Activar RLS
ALTER TABLE wellness_logs ENABLE ROW LEVEL SECURITY;

-- 4. Policy SELECT: solo ves los logs de tu club
CREATE POLICY "select_own_club_wellness" ON wellness_logs
  FOR SELECT TO authenticated
  USING (
    club_id IN (
      SELECT club_id FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.club_id IS NOT NULL
    )
  );

-- 5. Policy INSERT: solo puedes insertar logs de tu club
CREATE POLICY "insert_own_club_wellness" ON wellness_logs
  FOR INSERT TO authenticated
  WITH CHECK (
    club_id IN (
      SELECT club_id FROM profiles
      WHERE profiles.id = auth.uid()
    )
  );

-- 6. Policy DELETE: solo admin puede borrar
CREATE POLICY "admin_delete_wellness" ON wellness_logs
  FOR DELETE TO authenticated
  USING (
    club_id IN (
      SELECT club_id FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
  );
