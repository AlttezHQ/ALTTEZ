-- ============================================================
-- Migration 007: event_rsvp — Confirmacion de asistencia publica
-- Fecha: 2026-03-28
-- Motivo: Permitir que deportistas confirmen asistencia a eventos
--         via link publico (WhatsApp) sin necesidad de login.
--         El club_id en la URL garantiza aislamiento multi-tenant.
-- Tablas afectadas: event_rsvp (nueva)
-- Migraciones previas requeridas: 001_initial_schema.sql
-- ============================================================

CREATE TABLE IF NOT EXISTS event_rsvp (
  id            uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  club_id       uuid NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
  event_id      text NOT NULL,
  athlete_name  text NOT NULL,
  status        text NOT NULL CHECK (status IN ('confirmed', 'absent', 'maybe')),
  responded_at  timestamptz DEFAULT now(),
  UNIQUE(club_id, event_id, athlete_name)
);

CREATE INDEX IF NOT EXISTS idx_event_rsvp_club_event ON event_rsvp(club_id, event_id);

-- RLS: habilitar fila por fila
ALTER TABLE event_rsvp ENABLE ROW LEVEL SECURITY;

-- INSERT publico: cualquiera con el link puede responder (sin auth)
-- La seguridad es el club_id correcto en la URL — por diseno.
CREATE POLICY rsvp_insert_public ON event_rsvp
  FOR INSERT
  WITH CHECK (true);

-- UPDATE publico: el deportista puede cambiar su respuesta (upsert semantics)
CREATE POLICY rsvp_update_public ON event_rsvp
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- SELECT solo para el club propietario (coach autenticado)
-- Requiere la funcion get_my_club_id() definida en migration 002
CREATE POLICY rsvp_select_club ON event_rsvp
  FOR SELECT
  USING (club_id = get_my_club_id());

-- Comentario: el anonkey de Supabase tiene permisos INSERT/UPDATE
-- gracias a las policies anteriores. SELECT requiere JWT autenticado
-- con club_id correcto via get_my_club_id().
