-- ============================================================
-- Migration 015: Estadísticas de Jugadores por Partido
-- Añade una columna JSONB a torneo_partidos para almacenar
-- los goles y tarjetas de forma optimizada.
-- ============================================================

ALTER TABLE torneo_partidos
  ADD COLUMN IF NOT EXISTS eventos jsonb DEFAULT '[]'::jsonb;
