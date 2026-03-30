-- ============================================================
-- Migration 006: Fix profiles RLS — club_id y role inmutables
-- Fecha: 2026-03-28
-- Motivo: La policy profiles_update_own permitia que un usuario
--         cambiara su propio club_id o role via UPDATE, violando
--         el principio de multi-tenancy y RBAC.
-- Campos afectados: profiles.club_id, profiles.role
-- Tablas afectadas: profiles
-- Migraciones previas requeridas: 002_auth_profiles_rls.sql
-- ============================================================

-- Eliminar la policy anterior que no restringía club_id ni role
DROP POLICY IF EXISTS profiles_update_own ON profiles;

-- Nueva policy: el usuario solo puede actualizar su propio perfil,
-- y WITH CHECK garantiza que no cambie club_id ni role.
-- Columnas mutables permitidas: display_name, avatar_url, updated_at.
CREATE POLICY profiles_update_own ON profiles
  FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (
    id = auth.uid()
    AND club_id = (SELECT club_id FROM profiles WHERE id = auth.uid())
    AND role    = (SELECT role    FROM profiles WHERE id = auth.uid())
  );

-- Nota: el trigger de updated_at ya existe desde migration 002.
-- No requiere cambios adicionales en otras tablas.
