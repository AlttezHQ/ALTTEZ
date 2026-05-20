-- ============================================================
-- Migration 014: Grupos + Fase Final
-- Extiende torneo_categorias y torneo_partidos con los campos
-- necesarios para el formato de competencia "Grupos + Fase Final".
-- Es totalmente no destructiva (solo ADD COLUMN IF NOT EXISTS).
-- ============================================================

-- 1. Nuevos campos en torneo_categorias
ALTER TABLE torneo_categorias
  -- Fase de grupos
  ADD COLUMN IF NOT EXISTS assignment_method    text     DEFAULT 'auto_serpentina',
  ADD COLUMN IF NOT EXISTS allow_best_thirds    boolean  DEFAULT false,
  ADD COLUMN IF NOT EXISTS best_thirds_count    integer  DEFAULT 0,
  -- Puntos y desempate
  ADD COLUMN IF NOT EXISTS points_config        jsonb    DEFAULT '{"win":3,"draw":1,"loss":0}'::jsonb,
  ADD COLUMN IF NOT EXISTS tiebreakers          jsonb    DEFAULT '["points","goal_diff","goals_for","h2h","fair_play","draw"]'::jsonb,
  -- Fase final
  ADD COLUMN IF NOT EXISTS initial_knockout_round text   DEFAULT 'auto',
  ADD COLUMN IF NOT EXISTS crossing_method       text    DEFAULT 'auto_position',
  ADD COLUMN IF NOT EXISTS knockout_tiebreak_rule text   DEFAULT 'penalties';

-- 2. Nuevos campos en torneo_partidos
ALTER TABLE torneo_partidos
  -- Soporte para ida/vuelta y avance de bracket
  ADD COLUMN IF NOT EXISTS categoria_id   text    REFERENCES torneo_categorias(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS leg_number     integer DEFAULT 1,
  ADD COLUMN IF NOT EXISTS source         text    DEFAULT 'group',
  ADD COLUMN IF NOT EXISTS next_match_id  text;

-- 3. Índices útiles para consultas de grupos y fase final
CREATE INDEX IF NOT EXISTS idx_torneo_partidos_fase
  ON torneo_partidos (torneo_id, fase);

CREATE INDEX IF NOT EXISTS idx_torneo_partidos_grupo
  ON torneo_partidos (torneo_id, grupo);

CREATE INDEX IF NOT EXISTS idx_torneo_partidos_categoria
  ON torneo_partidos (torneo_id, categoria_id);

-- 4. Asegurar que groups_count y group_legs tengan defaults si ya existen
ALTER TABLE torneo_categorias
  ALTER COLUMN groups_count     SET DEFAULT 2,
  ALTER COLUMN group_legs       SET DEFAULT 1,
  ALTER COLUMN qualify_per_group SET DEFAULT 2,
  ALTER COLUMN playoff_legs     SET DEFAULT 1,
  ALTER COLUMN final_legs       SET DEFAULT 1;
