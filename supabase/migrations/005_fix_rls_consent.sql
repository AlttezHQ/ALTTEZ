-- ════════════════════════════════════════════════════════════
-- ELEVATE SPORTS — Migration 005: Fix RLS bulk_upload_logs + Consent Ley 1581
-- P0 — Go-Live Security Blockers
--
-- Cambios:
--   1. DROP policy permisiva "anon_all_bulk_upload_logs" (exponia datos de menores)
--   2. CREATE policies RLS restrictivas por club_id autenticado
--   3. ALTER TABLE profiles: columnas de consentimiento Ley 1581/2012
--
-- @author @Arquitecto (Carlos) + @Data (Mateo)
-- @version 1.0.0
-- @date 2026-03-28
-- ════════════════════════════════════════════════════════════

-- ── 1. FIX RLS: bulk_upload_logs ──────────────────────────────────────────────
-- La policy "anon_all_bulk_upload_logs" con USING(true) es un P0 de seguridad:
-- expone logs que contienen file_name, error_details y datos de menores de edad
-- a cualquier cliente sin autenticar. Se elimina y reemplaza con el patron
-- club_id de migration 002.

DROP POLICY IF EXISTS "anon_all_bulk_upload_logs" ON bulk_upload_logs;

-- SELECT: solo el club propietario del log
CREATE POLICY "bulk_logs_select_club"
  ON bulk_upload_logs FOR SELECT
  TO authenticated
  USING (club_id = (SELECT public.get_my_club_id()));

-- INSERT: solo puede insertar su propio club_id
CREATE POLICY "bulk_logs_insert_club"
  ON bulk_upload_logs FOR INSERT
  TO authenticated
  WITH CHECK (club_id = (SELECT public.get_my_club_id()));

-- UPDATE: operaciones de estado (partial → success/failed) por club
CREATE POLICY "bulk_logs_update_club"
  ON bulk_upload_logs FOR UPDATE
  TO authenticated
  USING (club_id = (SELECT public.get_my_club_id()))
  WITH CHECK (club_id = (SELECT public.get_my_club_id()));

-- DELETE: solo el propio club puede limpiar sus logs
CREATE POLICY "bulk_logs_delete_club"
  ON bulk_upload_logs FOR DELETE
  TO authenticated
  USING (club_id = (SELECT public.get_my_club_id()));

-- ── 2. CONSENT COLUMNS: profiles — Ley 1581 de 2012 ─────────────────────────
-- consent_at:       timestamp exacto de aceptacion (evidencia juridica)
-- consent_version:  version del documento aceptado (para re-consent si cambia)
-- guardian_consent: certificacion de autorizacion parental para datos de menores

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS consent_at       TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS consent_version  TEXT        DEFAULT '1.0',
  ADD COLUMN IF NOT EXISTS guardian_consent BOOLEAN     DEFAULT false;

-- Indice para auditorias de compliance: "todos los perfiles sin consentimiento"
CREATE INDEX IF NOT EXISTS idx_profiles_consent_at
  ON profiles(consent_at)
  WHERE consent_at IS NULL;

-- ── 3. POLICY UPDATE: profiles — permitir update de consent fields ───────────
-- La policy existente "profiles_update_own" ya cubre esto (USING id = auth.uid())
-- pero documentamos explicitamente que consent_at/version/guardian_consent
-- son los unico campos que el usuario puede auto-escribir.
-- No se necesita nueva policy — la existente es suficiente.

-- ════════════════════════════════════════════════════════════
-- DONE.
-- bulk_upload_logs: RLS cerrado por club_id autenticado.
-- profiles: columnas de consentimiento Ley 1581 agregadas.
-- ════════════════════════════════════════════════════════════
