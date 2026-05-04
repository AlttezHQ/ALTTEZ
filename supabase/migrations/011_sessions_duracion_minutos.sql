-- Migration 011: Add duracion_minutos to sessions
-- Allows rpeEngine to compute session load as RPE × duration (Foster et al., 2001)
-- Column is nullable for backward compatibility with existing session records.

ALTER TABLE sessions
  ADD COLUMN IF NOT EXISTS duracion_minutos smallint CHECK (duracion_minutos > 0);
